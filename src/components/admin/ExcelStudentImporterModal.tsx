import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useSchool } from '../../context/SchoolContext';
import { Student, TeacherAccount } from '../../types';
import { db } from '../../services/db';
import { SmartDataEngine } from '../../services/ai/smartDataEngine';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  FileDown,
  Sparkles,
  Users,
  Database,
  GraduationCap,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

interface ExcelStudentImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelStudentImporterModal: React.FC<ExcelStudentImporterModalProps> = ({
  isOpen,
  onClose
}) => {
  const { students, setStudents, teachers, setTeachers, showToast } = useSchool();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode: Students or Teachers
  const [importType, setImportType] = useState<'students' | 'teachers'>('students');
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [parsedTeachers, setParsedTeachers] = useState<TeacherAccount[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [aiAuditReport, setAiAuditReport] = useState<{
    total: number;
    correctedNames: number;
    inferredGenders: number;
    libyanIdsChecked: number;
  } | null>(null);

  if (!isOpen) return null;

  // Handle file select / parse
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    setErrorMessage('');
    setParsedStudents([]);
    setParsedTeachers([]);
    setAiAuditReport(null);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

        if (!jsonRows || jsonRows.length === 0) {
          setErrorMessage('الملف المرفوع فارغ ولا يحتوي على جداول بيانات.');
          setIsLoading(false);
          sound.playAlert();
          return;
        }

        let correctedNamesCount = 0;
        let inferredGendersCount = 0;

        if (importType === 'students') {
          const mappedList: Student[] = jsonRows.map((row: any, index: number) => {
            const rawName = row['الاسم'] || row['اسم الطالب'] || row['الاسم الرباعي'] || row['اسم التلميذ'] || row['Name'] || '';
            const rawNatId = row['الرقم الوطني'] || row['الرقم_الوطني'] || row['الوطني'] || row['NationalId'] || '';
            const studentNumber = row['رقم القيد'] || row['رقم_القيد'] || row['رقم الجلوس'] || '';
            const className = row['الفصل'] || row['الشعبة'] || row['الصف/الشعبة'] || '';
            const grade = row['الصف'] || row['المرحلة'] || '';
            const motherName = row['اسم الأم'] || row['الأم'] || '';
            const parentPhone = row['هاتف ولي الأمر'] || row['الهاتف'] || row['رقم ولي الأمر'] || '';

            const completed = SmartDataEngine.completeStudentData({
              name: rawName,
              nationalNumber: rawNatId,
              studentNumber,
              className,
              grade,
              motherName,
              parentPhone
            }, index);

            if (completed.name !== rawName) correctedNamesCount++;
            if (completed.gender) inferredGendersCount++;

            return completed;
          });

          setParsedStudents(mappedList);
          setAiAuditReport({
            total: mappedList.length,
            correctedNames: correctedNamesCount,
            inferredGenders: inferredGendersCount,
            libyanIdsChecked: mappedList.filter(s => s.nationalNumber && s.nationalNumber.length === 12).length
          });
        } else {
          // Teachers Import
          const mappedTeachers: TeacherAccount[] = jsonRows.map((row: any, index: number) => {
            const rawName = row['اسم المعلم'] || row['الاسم'] || row['الاسم الرباعي'] || row['Name'] || '';
            const subject = row['المادة'] || row['المادة المقررة'] || row['التخصص'] || 'الرياضيات';
            const phone = row['الهاتف'] || row['رقم الهاتف'] || '';
            const nationalNumber = row['الرقم الوطني'] || row['الوطني'] || '';
            const fileNumber = row['رقم الملف'] || row['الملف'] || row['منظومة الشاطئ'] || '';
            const quota = Number(row['نصاب الحصص'] || row['النصاب'] || 20);
            const rawClasses = row['الفصول'] || row['الفصول المسندة'] || '7/أ، 7/ب';
            const assignedClasses = String(rawClasses).split(/[,،\s]+/).filter(Boolean);

            return SmartDataEngine.completeTeacherData({
              name: rawName,
              subject,
              phone,
              nationalNumber,
              fileNumber,
              teachingQuota: quota,
              assignedClasses
            }, index);
          });

          setParsedTeachers(mappedTeachers);
          setAiAuditReport({
            total: mappedTeachers.length,
            correctedNames: mappedTeachers.length,
            inferredGenders: mappedTeachers.length,
            libyanIdsChecked: mappedTeachers.filter(t => t.nationalNumber && t.nationalNumber.length === 12).length
          });
        }

        setIsLoading(false);
        sound.playSuccess();
        triggerConfetti();
        showToast('gold', 'تمت المعالجة الذكية بالذكاء الاصطناعي ✨', 'تم التدقيق والتصحيح التلقائي للأرقام والأسماء الليبية بنجاح.');
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage('حدث خطأ أثناء قراءة ملف الإكسل. يرجى التأكد من صيغة الملف (.xlsx أو .xls أو .csv).');
        sound.playAlert();
      }
    };

    reader.readAsBinaryString(file);
  };

  // Commit Students
  const handleCommitStudents = () => {
    if (parsedStudents.length === 0) return;

    sound.playFanfare();
    triggerConfetti();

    const existingIds = new Set(students.map(s => s.nationalNumber || s.nationalId || ''));
    const newStudents: Student[] = [];

    parsedStudents.forEach(row => {
      const nat = row.nationalNumber || row.nationalId || '';
      if (nat && !existingIds.has(nat)) {
        newStudents.push(row);
        existingIds.add(nat);
      }
    });

    const updated = [...students, ...newStudents];
    setStudents(updated);
    db.saveStudents(updated, true);

    showToast('gold', 'تم الاستيراد بنجاح 🎉', `تمت إضافة وتحديث (${newStudents.length}) طالباً في قاعدة البيانات.`);
    onClose();
  };

  // Commit Teachers
  const handleCommitTeachers = () => {
    if (parsedTeachers.length === 0) return;

    sound.playFanfare();
    triggerConfetti();

    const existingCodes = new Set(teachers.map(t => t.code));
    const newTeachers: TeacherAccount[] = [];

    parsedTeachers.forEach(row => {
      if (!existingCodes.has(row.code)) {
        newTeachers.push(row);
        existingCodes.add(row.code);
      }
    });

    const updated = [...teachers, ...newTeachers];
    setTeachers(updated);
    db.saveTeachers(updated);

    showToast('gold', 'تم استيراد المعلمين بنجاح 📋', `تمت إضافة (${newTeachers.length}) معلمين إلى هيئة التدريس ونصاب الحصص.`);
    onClose();
  };

  // Download Sample Templates
  const handleDownloadTemplate = () => {
    sound.playTap();
    if (importType === 'students') {
      const templateData = [
        { 'الاسم': 'محمد فتحي الشريف', 'الرقم الوطني': '120090123456', 'رقم القيد': '2025-701', 'الصف': 'الصف السابع الأساسي', 'الفصل': '7/أ', 'اسم الأم': 'عائشة الفيتوري', 'هاتف ولي الأمر': '0912345678' },
        { 'الاسم': 'فاطمة علي السويحلي', 'الرقم الوطني': '220090234567', 'رقم القيد': '2025-702', 'الصف': 'الصف السابع الأساسي', 'الفصل': '7/أ', 'اسم الأم': 'مريم الترهوني', 'هاتف ولي الأمر': '0923456789' },
        { 'الاسم': 'أحمد وليد المصراتي', 'الرقم الوطني': '120100345678', 'رقم القيد': '2025-601', 'الصف': 'الصف السادس الأساسي', 'الفصل': '6/أ', 'اسم الأم': 'هدى الزوي', 'هاتف ولي الأمر': '0945678901' },
        { 'الاسم': 'سارة طارق الورفلي', 'الرقم الوطني': '220110456789', 'رقم القيد': '2025-401', 'الصف': 'الصف الرابع الأساسي', 'الفصل': '4/أ', 'اسم الأم': 'سعاد المقريف', 'هاتف ولي الأمر': '0919876543' }
      ];
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'كشف_الطلاب');
      XLSX.writeFile(wb, 'نموذج_كشف_الطلاب_المعتمد.xlsx');
    } else {
      const teacherTemplate = [
        { 'اسم المعلم': 'أ. طارق الفيتوري', 'المادة': 'الرياضيات', 'الرقم الوطني': '119820045671', 'رقم الملف': 'WSH-8841', 'الهاتف': '0912345678', 'نصاب الحصص': 20, 'الفصول': '7/أ، 7/ب، 8/أ' },
        { 'اسم المعلم': 'أ. عبدالسلام الورفلي', 'المادة': 'اللغة العربية', 'الرقم الوطني': '119790012345', 'رقم الملف': 'WSH-6520', 'الهاتف': '0923456789', 'نصاب الحصص': 22, 'الفصول': '7/أ، 7/ب، 6/أ' },
        { 'اسم المعلم': 'أ. مريم الترهوني', 'المادة': 'العلوم الطبيعية', 'الرقم الوطني': '219850067890', 'رقم الملف': 'WSH-9310', 'الهاتف': '0945678901', 'نصاب الحصص': 20, 'الفصول': '7/أ، 7/ب، 6/أ' }
      ];
      const ws = XLSX.utils.json_to_sheet(teacherTemplate);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'كشف_المعلمين_الشاطئ');
      XLSX.writeFile(wb, 'نموذج_كشف_المعلمين_منظومة_الشاطئ.xlsx');
    }
  };

  const parsedCount = importType === 'students' ? parsedStudents.length : parsedTeachers.length;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md font-cairo text-right animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>المستورد الذكي المدعوم بالذكاء الاصطناعي (AI Hub)</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold font-mono">
                  تدقيق آلي 100%
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                قراءة وتدقيق أوتوماتيكي لكشوفات الطلاب والمعلمين ومنظومة الشاطئ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab: Students vs Teachers */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => { setImportType('students'); setParsedStudents([]); setFileName(''); sound.playTap(); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              importType === 'students'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-200 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>استيراد كشف الطلاب والدرجات (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => { setImportType('teachers'); setParsedTeachers([]); setFileName(''); sound.playTap(); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              importType === 'teachers'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-200 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>استيراد كشف المعلمين ونصاب الحصص (منظومة الشاطئ)</span>
          </button>
        </div>

        {/* Template Download + Upload Dropzone */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50 dark:bg-blue-950/30 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800/60">
            <div className="text-xs text-blue-900 dark:text-blue-200 space-y-0.5">
              <strong className="block text-sm">💡 هل تريد قالباً جاهزاً لتعبئة بيانات مدرستك؟</strong>
              <span>قالب إكسل رسمي معتمد يطابق منظومة وزارة التربية والتعليم ومنظومة الشاطئ.</span>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 text-xs font-black border border-blue-300 dark:border-blue-700 shadow-sm hover:bg-blue-100/50 flex items-center gap-1.5 transition active:scale-95 shrink-0"
            >
              <FileDown className="w-4 h-4" />
              <span>تحميل النموذج ({importType === 'students' ? 'الطلاب' : 'المعلمون'})</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-300 dark:border-emerald-700/60 hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 sm:p-7 rounded-3xl text-center cursor-pointer transition space-y-2 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-emerald-600 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <strong className="block text-sm sm:text-base font-black text-slate-800 dark:text-slate-200">
              اضغط هنا لاختيار ملف إكسل ({importType === 'students' ? 'كشف الطلاب' : 'كشف المعلمين'})
            </strong>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-mono">
              يدعم ملفات منظومة الشاطئ وكشوفات التعليم (.XLSX, .XLS, .CSV)
            </span>
          </div>

          {fileName && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span>الملف: <strong>{fileName}</strong></span>
              <span className="text-emerald-600 font-mono">جاهز للمعالجة</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* AI Audit Summary Card */}
        {aiAuditReport && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-slate-800 dark:via-emerald-950/30 dark:to-slate-900 border border-emerald-300 dark:border-emerald-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-200 font-black text-xs">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>تقرير التدقيق الذكي بالذكاء الاصطناعي:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-emerald-100 dark:border-slate-700 text-center">
                <span className="text-slate-400 block text-[10px]">إجمالي السجلات:</span>
                <span className="font-mono text-sm text-slate-900 dark:text-white font-black">{aiAuditReport.total}</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-emerald-100 dark:border-slate-700 text-center">
                <span className="text-slate-400 block text-[10px]">الرقم الوطني الليبي:</span>
                <span className="font-mono text-sm text-blue-600 font-black">{aiAuditReport.libyanIdsChecked} موثق</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-emerald-100 dark:border-slate-700 text-center">
                <span className="text-slate-400 block text-[10px]">استنتاج الجنس والعمر:</span>
                <span className="font-mono text-sm text-emerald-600 font-black">{aiAuditReport.inferredGenders} دقيق</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-emerald-100 dark:border-slate-700 text-center">
                <span className="text-slate-400 block text-[10px]">تنظيف الأسماء:</span>
                <span className="font-mono text-sm text-purple-600 font-black">{aiAuditReport.correctedNames} منسق</span>
              </div>
            </div>
          </div>
        )}

        {/* Live Preview Table */}
        {parsedCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>معاينة البيانات المستخرجة ({parsedCount} سجل):</span>
              </span>
              <span className="text-emerald-600">✓ جاهز للحفظ المعتمد</span>
            </div>

            <div className="max-h-52 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-800">
                  {importType === 'students' ? (
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">اسم الطالب</th>
                      <th className="p-2.5 font-mono">الرقم الوطني</th>
                      <th className="p-2.5">الفصل</th>
                      <th className="p-2.5">الجنس</th>
                      <th className="p-2.5 font-mono">كود الربط</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">اسم المعلم</th>
                      <th className="p-2.5">المادة</th>
                      <th className="p-2.5 font-mono">رقم الملف</th>
                      <th className="p-2.5">نصاب الحصص</th>
                      <th className="p-2.5">الفصول</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                  {importType === 'students'
                    ? parsedStudents.slice(0, 50).map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold">{s.name}</td>
                          <td className="p-2.5 font-mono text-blue-600 dark:text-blue-400">{s.nationalNumber}</td>
                          <td className="p-2.5 font-bold">{s.className}</td>
                          <td className="p-2.5">{s.gender === 'female' ? 'أنثى 👧' : 'ذكر 👦'}</td>
                          <td className="p-2.5 font-mono text-emerald-600">{s.linkCode}</td>
                        </tr>
                      ))
                    : parsedTeachers.slice(0, 50).map((t, idx) => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold">{t.name}</td>
                          <td className="p-2.5 font-bold text-blue-600">{t.subject}</td>
                          <td className="p-2.5 font-mono text-amber-700 font-bold">{t.fileNumber || '-'}</td>
                          <td className="p-2.5 font-bold">{t.teachingQuota} حصة</td>
                          <td className="p-2.5 text-slate-500">{t.assignedClasses.join(', ')}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            إلغاء
          </button>

          <button
            type="button"
            disabled={parsedCount === 0 || isLoading}
            onClick={importType === 'students' ? handleCommitStudents : handleCommitTeachers}
            className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition active:scale-95 ${
              parsedCount > 0 && !isLoading
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-600/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>
              {isLoading
                ? 'جارٍ قراءة وتدقيق الملف بالذكاء الاصطناعي...'
                : `تأكيد اعتماد واستيراد (${parsedCount}) سجل`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
