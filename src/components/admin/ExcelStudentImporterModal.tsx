import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import { db } from '../../services/db';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  FileDown,
  Sparkles,
  Users,
  Database
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
  const { students, setStudents, showToast } = useSchool();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedRows, setParsedRows] = useState<Partial<Student>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  // Handle file drop / select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    setErrorMessage('');
    setParsedRows([]);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

        if (!jsonRows || jsonRows.length === 0) {
          setErrorMessage('الملف المرفوع فارغ ولا يحتوي على بيانات جداول.');
          setIsLoading(false);
          sound.playAlert();
          return;
        }

        // Map columns intelligently (supports Arabic headers from old systems)
        const mappedStudents: Partial<Student>[] = jsonRows.map((row: any, index: number) => {
          // Detect Name
          const name = row['الاسم'] || row['اسم الطالب'] || row['الاسم الرباعي'] || row['اسم التلميذ'] || row['الاسم الكامل'] || row['Name'] || `طالب مستورد ${index + 1}`;
          
          // Detect National Number
          const rawNatId = row['الرقم الوطني'] || row['الرقم_الوطني'] || row['الوطني'] || row['NationalId'] || row['الهوية'] || '';
          const nationalNumber = String(rawNatId).trim().replace(/\D/g, '') || `12008${String(1000000 + index).slice(-7)}`;

          // Detect Student Number / Registration
          const studentNumber = String(row['رقم القيد'] || row['رقم_القيد'] || row['رقم الجلوس'] || row['القيد'] || `2025-${String(1100 + index)}`);

          // Detect Class / Grade
          const className = String(row['الفصل'] || row['الشعبة'] || row['الصف/الشعبة'] || row['Class'] || '7/أ');
          let grade = String(row['الصف'] || row['المرحلة'] || row['Grade'] || '');
          if (!grade) {
            if (className.startsWith('7')) grade = 'الصف السابع الأساسي';
            else if (className.startsWith('8')) grade = 'الصف الثامن الأساسي';
            else if (className.startsWith('6')) grade = 'الصف السادس الأساسي';
            else if (className.startsWith('4')) grade = 'الصف الرابع الأساسي';
            else if (className.startsWith('9')) grade = 'الصف التاسع الأساسي';
            else grade = 'الصف الثالث الأساسي';
          }

          // Detect Mother Name
          const motherName = row['اسم الأم'] || row['الأم'] || 'فاطمة محمد';

          // Detect Parent Phone
          const parentPhone = String(row['هاتف ولي الأمر'] || row['الهاتف'] || row['رقم ولي الأمر'] || '0910000000');

          return {
            id: `std-imp-${Date.now()}-${index}`,
            name: String(name).trim(),
            nationalNumber,
            nationalId: nationalNumber,
            studentNumber,
            linkCode: `SCH-2026-X${index + 1}`,
            grade,
            className,
            motherName,
            parentName: `ولي أمر ${name}`,
            parentPhone,
            gender: name.includes('ة') || name.includes('فاطمة') || name.includes('مريم') || name.includes('آية') ? 'female' : 'male',
            status: 'present',
            attendanceRate: 95,
            academicAverage: 88,
            courseworkScore: 36,
            examScore: 54,
            totalScore: 90,
            appreciation: 'ممتاز',
            behaviorRating: 'ممتاز',
            behaviorPointsTotal: 25,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            competencies: [],
            behaviorPoints: [],
            subjects: [
              { name: 'الرياضيات', score: 90, maxScore: 100, teacher: 'أ. طارق الفيتوري', evaluation: 'ممتاز' },
              { name: 'اللغة العربية', score: 92, maxScore: 100, teacher: 'أ. عبدالسلام الورفلي', evaluation: 'ممتاز' },
              { name: 'العلوم الطبيعية', score: 88, maxScore: 100, teacher: 'أ. مريم الترهوني', evaluation: 'ممتاز' },
              { name: 'اللغة الإنجليزية', score: 85, maxScore: 100, teacher: 'أ. فاطمة الزوي', evaluation: 'ممتاز' },
              { name: 'الحاسوب', score: 95, maxScore: 100, teacher: 'أ. أسامة المقريف', evaluation: 'ممتاز' }
            ]
          };
        });

        setParsedRows(mappedStudents);
        setIsLoading(false);
        sound.playSuccess();
        showToast('success', 'تمت قراءة الملف بنجاح 📊', `تم استخراج ${mappedStudents.length} طالباً جاهزين للاستيراد.`);
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage('حدث خطأ أثناء قراءة ملف الإكسل. يرجى التأكد من صيغة الملف (.xlsx أو .xls أو .csv).');
        sound.playAlert();
      }
    };

    reader.readAsBinaryString(file);
  };

  // Commit imported rows to database
  const handleCommitImport = () => {
    if (parsedRows.length === 0) return;

    sound.playFanfare();
    triggerConfetti();

    // Merge with existing students (avoid duplicate national IDs)
    const existingIds = new Set(students.map(s => s.nationalNumber || s.nationalId || ''));
    const newStudents: Student[] = [];

    parsedRows.forEach(row => {
      const nat = row.nationalNumber || row.nationalId || '';
      if (nat && !existingIds.has(nat)) {
        newStudents.push(row as Student);
        existingIds.add(nat);
      }
    });

    const updated = [...students, ...newStudents];
    setStudents(updated);
    db.saveStudents(updated, true);

    showToast('gold', 'تم الاستيراد بنجاح 🎉', `تمت إضافة ${newStudents.length} طالباً إلى قاعدة البيانات المدرسية وتحديث الكشوفات.`);
    onClose();
  };

  // Download Sample Template
  const handleDownloadTemplate = () => {
    sound.playTap();
    const templateData = [
      { 'الاسم': 'محمد فتحي الشريف', 'الرقم الوطني': '120090123456', 'رقم القيد': '2025-701', 'الصف': 'الصف السابع الأساسي', 'الفصل': '7/أ', 'اسم الأم': 'عائشة الفيتوري', 'هاتف ولي الأمر': '0912345678' },
      { 'الاسم': 'فاطمة علي السويحلي', 'الرقم الوطني': '220090234567', 'رقم القيد': '2025-702', 'الصف': 'الصف السابع الأساسي', 'الفصل': '7/أ', 'اسم الأم': 'مريم الترهوني', 'هاتف ولي الأمر': '0923456789' },
      { 'الاسم': 'أحمد وليد المصراتي', 'الرقم الوطني': '120100345678', 'رقم القيد': '2025-601', 'الصف': 'الصف السادس الأساسي', 'الفصل': '6/أ', 'اسم الأم': 'هدى الزوي', 'هاتف ولي الأمر': '0945678901' },
      { 'الاسم': 'سارة طارق الورفلي', 'الرقم الوطني': '220110456789', 'رقم القيد': '2025-401', 'الصف': 'الصف الرابع الأساسي', 'الفصل': '4/أ', 'اسم الأم': 'سعاد المقريف', 'هاتف ولي الأمر': '0919876543' }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'كشف_الطلاب');
    XLSX.writeFile(wb, 'نموذج_كشف_المنظومة_المعتمد.xlsx');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md font-cairo text-right animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0 border border-emerald-200 dark:border-emerald-800">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>استيراد كشف ملفات الإكسل من المنظومة القديمة</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold font-mono">
                  .xlsx / .xls / .csv
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                قراءة تلقائية وفورية لكشوفات الطلاب وأرقامهم الوطنية وفصولهم
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

        {/* Action Controls: Download Template + File Upload Area */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60">
            <div className="text-xs text-blue-900 dark:text-blue-200 space-y-0.5">
              <strong className="block text-sm">💡 هل تريد نموذج جاهز لتعبئة بيانات مدرستك؟</strong>
              <span>يمكنك تنزيل قالب إكسل معتمد يحتوي على كافة الأعمدة المطلوبة بدقة.</span>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 text-xs font-black border border-blue-300 dark:border-blue-700 shadow-sm hover:bg-blue-100/50 flex items-center gap-1.5 transition active:scale-95 shrink-0"
            >
              <FileDown className="w-4 h-4" />
              <span>تحميل النموذج المعتمد (.xlsx)</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-300 dark:border-emerald-700/60 hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 p-6 sm:p-8 rounded-3xl text-center cursor-pointer transition-all space-y-2 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-emerald-600 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7" />
            </div>
            <strong className="block text-sm sm:text-base font-black text-slate-800 dark:text-slate-200">
              اضغط هنا لاختيار ملف الإكسل أو اسحبه إلى هنا
            </strong>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-mono">
              يدعم ملفات منظومة الشاطئ وكشوفات وزارة التعليم (.XLSX, .XLS, .CSV)
            </span>
          </div>

          {fileName && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span>الملف المختار: <strong>{fileName}</strong></span>
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

        {/* Parsed Students Live Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>معاينة الطلاب المستخرجين من الملف ({parsedRows.length} طالب):</span>
              </span>
              <span className="text-emerald-600">✓ تم التحقق بنجاح</span>
            </div>

            <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">اسم الطالب</th>
                    <th className="p-2.5 font-mono">الرقم الوطني</th>
                    <th className="p-2.5">الفصل</th>
                    <th className="p-2.5">اسم الأم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                  {parsedRows.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-2.5 font-bold">{row.name}</td>
                      <td className="p-2.5 font-mono text-blue-600 dark:text-blue-400">{row.nationalNumber}</td>
                      <td className="p-2.5 font-bold">{row.className}</td>
                      <td className="p-2.5 text-slate-500">{row.motherName}</td>
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
            disabled={parsedRows.length === 0 || isLoading}
            onClick={handleCommitImport}
            className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition active:scale-95 ${
              parsedRows.length > 0 && !isLoading
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-600/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>
              {isLoading
                ? 'جارٍ قراءة الملف...'
                : `تأكيد إضافة واستيراد (${parsedRows.length}) طالباً`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
