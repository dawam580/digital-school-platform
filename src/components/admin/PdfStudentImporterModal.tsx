import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  X,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Heart,
  UserCheck,
  Edit2,
  Trash2,
  Plus,
  FileSpreadsheet,
  Download,
  CheckCheck,
  Sliders
} from 'lucide-react';
import {
  LibyanPdfStudentParser,
  ParsedStudentRow,
  PdfParseResult
} from '../../services/importers/pdfStudentParser';
import { Student } from '../../types';
import { db } from '../../services/db';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { exportLibyanStudentsToExcel } from '../../utils/excelHelper';

interface PdfStudentImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PdfStudentImporterModal: React.FC<PdfStudentImporterModalProps> = ({
  isOpen,
  onClose
}) => {
  const { students, setStudents, showToast, addNotification } = useSchool();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseStats, setParseStats] = useState<{ totalPages: number; year: string; grade: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'manual_paste'>('upload');
  const [pastedText, setPastedText] = useState('');

  // Target Grade selection (e.g. الصف التاسع)
  const [selectedGrade, setSelectedGrade] = useState<string>('الصف التاسع الأساسي');
  const [autoDistributeSections, setAutoDistributeSections] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsLoading(true);
    setFileName(file.name);
    sound.playTap();

    try {
      const result = await LibyanPdfStudentParser.parsePdfFile(file);
      if (result.success && result.students.length > 0) {
        // Apply selected grade or detected grade
        const finalGrade = result.detectedGrade || selectedGrade;
        const gradePrefix = finalGrade.includes('التاسع') ? '9' : finalGrade.includes('الثامن') ? '8' : finalGrade.includes('السابع') ? '7' : '3';
        
        const adjustedStudents = result.students.map((st, i) => {
          let sec = st.sectionCode;
          if (autoDistributeSections) {
            const secs: Array<'أ' | 'ب' | 'ج' | 'د'> = ['أ', 'ب', 'ج', 'د'];
            sec = secs[Math.floor(i / 25) % 4];
          }
          return {
            ...st,
            grade: finalGrade,
            sectionCode: sec,
            className: `${gradePrefix}/${sec}`
          };
        });

        setParsedRows(adjustedStudents);
        setParseStats({
          totalPages: result.totalPages,
          year: result.detectedAcademicYear || '2025 - 2026 م',
          grade: finalGrade
        });
        setSelectedGrade(finalGrade);
        setSelectedIndices(new Set(adjustedStudents.map((_, i) => i)));
        sound.playSuccess();
        showToast('gold', 'تم استخراج الطلاب بنجاح 🌟', `تم التعرف على (${adjustedStudents.length}) طالب من ${finalGrade} وتصنيفهم آلياً.`);
      } else {
        showToast('error', 'تنبيه', result.error || 'لم يتمكن المحلل من قراءة نصوص داخل ملف الـ PDF. جرب خيار نسخ ولصق النص.');
      }
    } catch (err: any) {
      showToast('error', 'تنبيه', err.message || 'حدث خطأ أثناء معالجة ملف الـ PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    setIsLoading(true);
    sound.playTap();

    setTimeout(() => {
      const lines = pastedText.split(/[\r\n]+/);
      const result = LibyanPdfStudentParser.parseLibyanText(lines);
      if (result.students.length > 0) {
        const gradePrefix = selectedGrade.includes('التاسع') ? '9' : selectedGrade.includes('الثامن') ? '8' : '3';
        const adjustedStudents = result.students.map((st, i) => {
          let sec = st.sectionCode;
          if (autoDistributeSections) {
            const secs: Array<'أ' | 'ب' | 'ج' | 'د'> = ['أ', 'ب', 'ج', 'د'];
            sec = secs[Math.floor(i / 25) % 4];
          }
          return {
            ...st,
            grade: selectedGrade,
            sectionCode: sec,
            className: `${gradePrefix}/${sec}`
          };
        });

        setParsedRows(adjustedStudents);
        setParseStats({
          totalPages: 1,
          year: result.detectedAcademicYear || '2025 - 2026 م',
          grade: selectedGrade
        });
        setSelectedIndices(new Set(adjustedStudents.map((_, i) => i)));
        sound.playSuccess();
        showToast('gold', 'تم تحليل النص 🌟', `تم استخراج (${adjustedStudents.length}) طالب بنجاح.`);
      } else {
        showToast('error', 'تنبيه', 'لم يتم العثور على أرقام وطنية أو أسماء صالحة في النص المنسوخ.');
      }
      setIsLoading(false);
    }, 300);
  };

  // Re-apply grade change to all parsed rows
  const handleGradeChange = (newGrade: string) => {
    setSelectedGrade(newGrade);
    const gradePrefix = newGrade.includes('التاسع') ? '9' : newGrade.includes('الثامن') ? '8' : newGrade.includes('السابع') ? '7' : '3';
    setParsedRows(prev =>
      prev.map(r => ({
        ...r,
        grade: newGrade,
        className: `${gradePrefix}/${r.sectionCode}`
      }))
    );
    showToast('info', 'تم تحديث الصف', `تم تعيين كافة الطلاب إلى: ${newGrade}`);
  };

  // Export to Excel handler
  const handleExportToExcel = () => {
    if (parsedRows.length === 0) {
      showToast('error', 'تنبيه', 'لا توجد بيانات طلاب لتصديرها.');
      return;
    }
    sound.playTap();
    const fileNameSafe = `كشف_${selectedGrade.replace(/\s+/g, '_')}_منظومة_المدرسة_2026.csv`;
    exportLibyanStudentsToExcel(parsedRows, fileNameSafe);
    showToast('gold', 'تم تصدير الإكسل 📊', `تم تصدير (${parsedRows.length}) طالب بنجاح.`);
  };

  const handleRowChange = (index: number, field: keyof ParsedStudentRow, val: any) => {
    setParsedRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === parsedRows.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(parsedRows.map((_, i) => i)));
    }
  };

  const toggleSelectRow = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const handleConfirmImport = () => {
    if (selectedIndices.size === 0) {
      showToast('error', 'تنبيه', 'يرجى اختيار طالب واحد على الأقل للاستيراد.');
      return;
    }

    const studentsToImport: Student[] = Array.from(selectedIndices).map(idx => {
      const row = parsedRows[idx];
      return LibyanPdfStudentParser.convertToStudentEntity(row, idx);
    });

    // Merge with existing students: Update by national number or append
    const existingMap = new Map(students.map(s => [s.nationalNumber || s.nationalId, s]));

    studentsToImport.forEach(newStd => {
      const nat = newStd.nationalNumber || newStd.nationalId;
      if (existingMap.has(nat)) {
        const existing = existingMap.get(nat)!;
        existingMap.set(nat, {
          ...existing,
          name: newStd.name || existing.name,
          motherName: newStd.motherName || existing.motherName,
          birthDate: newStd.birthDate || existing.birthDate,
          birthPlace: newStd.birthPlace || existing.birthPlace,
          sectionCode: newStd.sectionCode || existing.sectionCode,
          grade: newStd.grade || existing.grade,
          className: newStd.className || existing.className,
          gender: newStd.gender || existing.gender
        });
      } else {
        existingMap.set(nat, newStd);
      }
    });

    const updatedStudentsList = Array.from(existingMap.values());
    setStudents(updatedStudentsList);
    db.saveStudents(updatedStudentsList, true);
    try {
      localStorage.setItem('madrasa_db_students_v3', JSON.stringify(updatedStudentsList));
      localStorage.setItem('madrasa_students_v1', JSON.stringify(updatedStudentsList));
    } catch {}

    sound.playFanfare();
    triggerConfetti();

    addNotification(
      `📥 تم استيراد وتصنيف (${studentsToImport.length}) طالب من ملف PDF`,
      `تم استيراد كشف ${selectedGrade} بنجاح وتوزيعهم على الفصول (9/أ، 9/ب، 9/ج، 9/د) وتحديث بيانات الأمهات والمواليد.`,
      'admin'
    );

    showToast('gold', 'تم الاستيراد بنجاح 🌟', `تم إدراج (${studentsToImport.length}) طالب في ${selectedGrade} وتوزيعهم على الفصول.`);
    onClose();
  };

  // Filtered rows
  const filteredRows = parsedRows.filter((r) => {
    const matchSearch =
      r.name.includes(searchQuery) ||
      r.nationalNumber.includes(searchQuery) ||
      r.motherName.includes(searchQuery) ||
      r.className.includes(searchQuery);

    const matchGender = genderFilter === 'all' || r.gender === genderFilter;
    const matchSection = sectionFilter === 'all' || r.sectionCode === sectionFilter;

    return matchSearch && matchGender && matchSection;
  });

  const maleCount = parsedRows.filter(r => r.gender === 'male').length;
  const femaleCount = parsedRows.filter(r => r.gender === 'female').length;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-cairo">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <FileText className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">الاستيراد الذكي للطلاب من ملفات PDF (المنظومة المدرسية القديمة)</h3>
                <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 font-bold text-[10px] rounded-full border border-emerald-400/40">
                  محرك جراحي دقيق (90+ طالب • تصدير Excel)
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                استخراج فوري للأسماء الرباعية الكاملة، الأرقام الوطنية (12 خانة)، أسماء الأمهات، وتوزيع الفصول
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Controls Bar: Grade Selector & Auto-Distribute Toggle */}
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-black text-xs text-emerald-900 dark:text-emerald-200 shrink-0">الصف الدراسي المستهدف:</span>
              <select
                value={selectedGrade}
                onChange={e => handleGradeChange(e.target.value)}
                className="p-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-white"
              >
                <option value="الصف التاسع الأساسي">الصف التاسع الأساسي (الشهادة الإعدادية)</option>
                <option value="الصف الثامن الأساسي">الصف الثامن الأساسي</option>
                <option value="الصف السابع الأساسي">الصف السابع الأساسي</option>
                <option value="الصف السادس الأساسي">الصف السادس الأساسي</option>
                <option value="الصف الخامس الأساسي">الصف الخامس الأساسي</option>
                <option value="الصف الرابع الأساسي">الصف الرابع الأساسي</option>
                <option value="الصف الثالث الأساسي">الصف الثالث الأساسي</option>
                <option value="الصف الثاني الأساسي">الصف الثاني الأساسي</option>
                <option value="الصف الأول الأساسي">الصف الأول الأساسي</option>
                <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                <option value="الصف الثالث الثانوي">الصف الثالث الثانوي (الشهادة الثانوية)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={autoDistributeSections}
                onChange={e => setAutoDistributeSections(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
              />
              <span>توزيع الطلاب آلياً بالتساوي على الشعب (أ • ب • ج • د)</span>
            </label>
          </div>

          {/* Tabs: PDF Upload vs Paste Table */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => { setActiveTab('upload'); sound.playTap(); }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>رفع ملف PDF الكبير مباشرة (90+ طالب)</span>
            </button>

            <button
              onClick={() => { setActiveTab('manual_paste'); sound.playTap(); }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'manual_paste'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>نسخ ولصق جدول / نصوص الـ PDF</span>
            </button>
          </div>

          {/* TAB 1: PDF Upload Dropzone */}
          {activeTab === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-emerald-300 dark:border-emerald-700/60 rounded-3xl bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition text-center space-y-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />

              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-2xl mx-auto shadow-inner group-hover:scale-110 transition-transform">
                📄
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  اضغط هنا لاختيار ملف الـ PDF أو اسحبه وأفلته هنا
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  المحرك الجراحي يدعم الملفات متعددة الصفحات (سجلات الصف التاسع، كشوفات الامتحانات والمراقبة)
                </p>
              </div>

              {fileName && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم فحص الملف: {fileName}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Paste Raw Text / Table */}
          {activeTab === 'manual_paste' && (
            <div className="space-y-3">
              <textarea
                rows={5}
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="الصق نص الجدول المنسوخ من ملف الـ PDF هنا (مثال: الاسم الرباعي، الرقم الوطني 12 خانة، اسم الأم، المواليد)..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
              <button
                onClick={handleParsePastedText}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>تحليل النص واستخراج الطلاب بالكامل</span>
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-6 text-center space-y-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-black text-slate-800 dark:text-white">جاري التحليل الجراحي لملف الـ PDF واستخراج كافة الصفحات...</p>
              <p className="text-[11px] text-slate-500">إعادة بناء النصوص، استخراج الأسماء الرباعية، وتنسيق الأرقام الوطنية</p>
            </div>
          )}

          {/* Parsed Results Section */}
          {parsedRows.length > 0 && !isLoading && (
            <div className="space-y-4 pt-2">
              
              {/* Summary Badges Bar & Excel Export Button */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-slate-500 font-bold block text-[10px]">إجمالي الطلاب المعترف بهم</span>
                  <span className="text-xl font-black text-emerald-700 font-mono">{parsedRows.length} طالب</span>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <span className="text-slate-500 font-bold block text-[10px]">عدد البنين 👦</span>
                  <span className="text-lg font-black text-blue-700 font-mono">{maleCount}</span>
                </div>

                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800">
                  <span className="text-slate-500 font-bold block text-[10px]">عدد البنات 👧</span>
                  <span className="text-lg font-black text-rose-700 font-mono">{femaleCount}</span>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 flex flex-col items-center justify-center">
                  <button
                    onClick={handleExportToExcel}
                    className="w-full py-1.5 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير إلى Excel 📊</span>
                  </button>
                  <span className="text-[10px] text-purple-600 dark:text-purple-300 font-bold mt-1">
                    ملف إكسل كامل بصيغة XLSX
                  </span>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="بحث بالاسم، الرقم الوطني، أو اسم الأم..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={genderFilter}
                    onChange={e => setGenderFilter(e.target.value as any)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-900"
                  >
                    <option value="all">كافة الطلاب (ذكور وإناث)</option>
                    <option value="male">الذكور فقط 👦</option>
                    <option value="female">الإناث فقط 👧</option>
                  </select>

                  <select
                    value={sectionFilter}
                    onChange={e => setSectionFilter(e.target.value)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-900"
                  >
                    <option value="all">كافة الفصول (أ، ب، ج، د)</option>
                    <option value="أ">شعبة (أ)</option>
                    <option value="ب">شعبة (ب)</option>
                    <option value="ج">شعبة (ج)</option>
                    <option value="د">شعبة (د)</option>
                  </select>

                  <button
                    onClick={toggleSelectAll}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl text-xs shrink-0"
                  >
                    {selectedIndices.size === parsedRows.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                  </button>
                </div>
              </div>

              {/* Editable Preview Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-right divide-y divide-slate-100 dark:divide-slate-800">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[11px] sticky top-0 z-10">
                    <tr>
                      <th className="p-3 w-10 text-center">ت</th>
                      <th className="p-3">اسم الطالب رباعي بالكامل</th>
                      <th className="p-3">الرقم الوطني (12 خانة)</th>
                      <th className="p-3">اسم الأم</th>
                      <th className="p-3">الجنس</th>
                      <th className="p-3">تاريخ الميلاد</th>
                      <th className="p-3">الصف</th>
                      <th className="p-3">الفصل</th>
                      <th className="p-3">هاتف ولي الأمر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRows.map((row) => {
                      const realIndex = parsedRows.indexOf(row);
                      const isSelected = selectedIndices.has(realIndex);

                      return (
                        <tr
                          key={realIndex}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                            isSelected ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : 'opacity-60'
                          }`}
                        >
                          <td className="p-3 text-center font-mono font-bold text-slate-500">
                            {realIndex + 1}
                          </td>

                          <td className="p-2">
                            <input
                              type="text"
                              value={row.name}
                              onChange={e => handleRowChange(realIndex, 'name', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
                            />
                          </td>

                          <td className="p-2 font-mono">
                            <input
                              type="text"
                              value={row.nationalNumber}
                              onChange={e => handleRowChange(realIndex, 'nationalNumber', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs text-emerald-700"
                            />
                          </td>

                          <td className="p-2">
                            <input
                              type="text"
                              value={row.motherName}
                              onChange={e => handleRowChange(realIndex, 'motherName', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-purple-700"
                            />
                          </td>

                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-lg font-bold text-[10px] ${
                              row.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {row.gender === 'male' ? 'ذكر 👦' : 'أنثى 👧'}
                            </span>
                          </td>

                          <td className="p-2 font-mono">
                            <input
                              type="date"
                              value={row.birthDate}
                              onChange={e => handleRowChange(realIndex, 'birthDate', e.target.value)}
                              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-mono"
                            />
                          </td>

                          <td className="p-2 font-bold">
                            <span className="text-[11px] text-slate-700 dark:text-slate-300">{row.grade}</span>
                          </td>

                          <td className="p-2">
                            <select
                              value={row.sectionCode}
                              onChange={e => {
                                const sec = e.target.value as any;
                                handleRowChange(realIndex, 'sectionCode', sec);
                                const gNum = row.grade.includes('التاسع') ? '9' : '3';
                                handleRowChange(realIndex, 'className', `${gNum}/${sec}`);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
                            >
                              <option value="أ">9/أ</option>
                              <option value="ب">9/ب</option>
                              <option value="ج">9/ج</option>
                              <option value="د">9/د</option>
                            </select>
                          </td>

                          <td className="p-2 font-mono">
                            <input
                              type="text"
                              value={row.parentPhone}
                              onChange={e => handleRowChange(realIndex, 'parentPhone', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-mono"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirmImport}
                disabled={parsedRows.length === 0 || selectedIndices.size === 0}
                className={`px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition active:scale-95 ${
                  parsedRows.length > 0 && selectedIndices.size > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد استيراد ({selectedIndices.size}) طالب إلى المنظومة الجديدة</span>
              </button>

              {parsedRows.length > 0 && (
                <button
                  onClick={handleExportToExcel}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl flex items-center gap-2 shadow-md active:scale-95 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير إلى Excel 📊</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl text-xs"
            >
              إلغاء
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
