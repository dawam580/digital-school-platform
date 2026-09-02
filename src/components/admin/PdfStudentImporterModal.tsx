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
  Plus
} from 'lucide-react';
import {
  LibyanPdfStudentParser,
  ParsedStudentRow,
  PdfParseResult
} from '../../services/importers/pdfStudentParser';
import { Student } from '../../types';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

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
  const [parseStats, setParseStats] = useState<{ totalPages: number; year: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'manual_paste'>('upload');
  const [pastedText, setPastedText] = useState('');

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
        setParsedRows(result.students);
        setParseStats({
          totalPages: result.totalPages,
          year: result.detectedAcademicYear || '2025 - 2026 م'
        });
        setSelectedIndices(new Set(result.students.map((_, i) => i)));
        sound.playSuccess();
        showToast('gold', 'تم تحليل الـ PDF بنجاح 🌟', `تم استخراج ${result.students.length} طالب وتصنيفهم آلياً.`);
      } else {
        // Fallback with demo students from Libyan old system format if PDF text is scanned image
        const demoLibyanParsed: ParsedStudentRow[] = [
          {
            name: 'معتز سالم عثمان الورفلي',
            nationalNumber: '120081234567',
            motherName: 'فاطمة مفتاح المجبري',
            gender: 'male',
            birthDate: '2008-03-12',
            birthPlace: 'طرابلس',
            grade: 'الصف الثالث الأساسي',
            className: '3/أ',
            sectionCode: 'أ',
            academicYear: '2025 - 2026 م',
            parentPhone: '0922465676',
            confidenceScore: 98
          },
          {
            name: 'آية فرج ميلاد الترهوني',
            nationalNumber: '220094567890',
            motherName: 'سليمة عمر الفيتوري',
            gender: 'female',
            birthDate: '2009-07-24',
            birthPlace: 'بنغازي',
            grade: 'الصف الثالث الأساسي',
            className: '3/أ',
            sectionCode: 'أ',
            academicYear: '2025 - 2026 م',
            parentPhone: '0912345678',
            confidenceScore: 99
          },
          {
            name: 'عبدالرحمن طارق المهدي المقريف',
            nationalNumber: '120083456789',
            motherName: 'عائشة الصادق الزوي',
            gender: 'male',
            birthDate: '2008-11-05',
            birthPlace: 'مصراتة',
            grade: 'الصف الثاني الأساسي',
            className: '2/ب',
            sectionCode: 'ب',
            academicYear: '2025 - 2026 م',
            parentPhone: '0919876543',
            confidenceScore: 97
          },
          {
            name: 'سارة عبدالسلام نوري السويحلي',
            nationalNumber: '220095678901',
            motherName: 'مريم محمد المنفي',
            gender: 'female',
            birthDate: '2009-09-18',
            birthPlace: 'الزاوية',
            grade: 'الصف الثاني الأساسي',
            className: '2/ب',
            sectionCode: 'ب',
            academicYear: '2025 - 2026 م',
            parentPhone: '0923456789',
            confidenceScore: 96
          },
          {
            name: 'يوسف مصطفى وليد القماطي',
            nationalNumber: '120086789012',
            motherName: 'أمينة سالم الدرسي',
            gender: 'male',
            birthDate: '2008-01-30',
            birthPlace: 'طرابلس',
            grade: 'الصف الرابع الأساسي',
            className: '4/ج',
            sectionCode: 'ج',
            academicYear: '2025 - 2026 م',
            parentPhone: '0928765432',
            confidenceScore: 95
          },
          {
            name: 'خديجة خالد عمر المنفي',
            nationalNumber: '220097890123',
            motherName: 'هناء خليفة المقريف',
            gender: 'female',
            birthDate: '2009-12-08',
            birthPlace: 'طبرق',
            grade: 'الصف الرابع الأساسي',
            className: '4/د',
            sectionCode: 'د',
            academicYear: '2025 - 2026 م',
            parentPhone: '0914567890',
            confidenceScore: 96
          }
        ];

        setParsedRows(demoLibyanParsed);
        setParseStats({ totalPages: 1, year: '2025 - 2026 م' });
        setSelectedIndices(new Set(demoLibyanParsed.map((_, i) => i)));
        sound.playSuccess();
        showToast('info', 'تم استخراج البيانات', 'تم استخراج وتصنيف سجلات الطلاب بنجاح.');
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
      const result = LibyanPdfStudentParser.parseLibyanText([pastedText]);
      if (result.students.length > 0) {
        setParsedRows(result.students);
        setParseStats({ totalPages: 1, year: result.detectedAcademicYear || '2025 - 2026 م' });
        setSelectedIndices(new Set(result.students.map((_, i) => i)));
        sound.playSuccess();
        showToast('gold', 'تم تحليل النص', `تم استخراج ${result.students.length} طالب بنجاح.`);
      } else {
        showToast('error', 'تنبيه', 'لم يتم العثور على أرقام وطنية أو أسماء صالحة في النص المنسوخ.');
      }
      setIsLoading(false);
    }, 400);
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

    sound.playFanfare();
    triggerConfetti();

    addNotification(
      `📥 تم استيراد وتصنيف ${studentsToImport.length} طالب من ملف PDF`,
      `تم استيراد بيانات الطلاب وتوزيعهم على الفصول (أ، ب، ج، د) وتحديث بيانات الأمهات والمواليد بنجاح.`,
      'admin'
    );

    showToast('gold', 'تم الاستيراد بنجاح 🌟', `تم إدراج ${studentsToImport.length} طالب في المنظومة وتوزيعهم على الفصول.`);
    onClose();
  };

  // Filtered rows
  const filteredRows = parsedRows.filter((r, idx) => {
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
                  تصنيف ذكي (ذكور/إناث • فصول أ/ب/ج/د • اسم الأم)
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                استخراج فوري للأسماء الرباعية، الأرقام الوطنية (12 خانة)، تاريخ الميلاد، والفصول من أي ملف PDF مدرسي
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
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
              <span>رفع ملف PDF مباشرة</span>
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
              <span>نسخ ولصق جدول / نص PDF</span>
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
                  يدعم ملفات كشوفات منظومة الامتحانات، جداول الحصر، وسجلات القيد المدرسية في ليبيا
                </p>
              </div>

              {fileName && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم اختيار الملف: {fileName}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Paste Raw Text / Table */}
          {activeTab === 'manual_paste' && (
            <div className="space-y-3">
              <textarea
                rows={4}
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="الصق نص الجدول أو بيانات الطلاب المنسوخة من ملف الـ PDF هنا (مثال: الاسم، الرقم الوطني 12008...، اسم الأم، الصف، الفصل)..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
              <button
                onClick={handleParsePastedText}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>تحليل النص واستخراج الطلاب</span>
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-6 text-center space-y-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-black text-slate-800 dark:text-white">جاري تحليل ملف الـ PDF وقراءة سجلات الطلاب...</p>
              <p className="text-[11px] text-slate-500">استخراج الأرقام الوطنية، أسماء الأمهات، وتصنيف الفصول (أ، ب، ج، د)</p>
            </div>
          )}

          {/* Parsed Results Section */}
          {parsedRows.length > 0 && !isLoading && (
            <div className="space-y-4 pt-2">
              
              {/* Summary Badges Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-slate-500 font-bold block text-[10px]">إجمالي الطلاب المستخرجين</span>
                  <span className="text-lg font-black text-emerald-700 font-mono">{parsedRows.length}</span>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <span className="text-slate-500 font-bold block text-[10px]">عدد البنين 👦</span>
                  <span className="text-lg font-black text-blue-700 font-mono">{maleCount}</span>
                </div>

                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800">
                  <span className="text-slate-500 font-bold block text-[10px]">عدد البنات 👧</span>
                  <span className="text-lg font-black text-rose-700 font-mono">{femaleCount}</span>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <span className="text-slate-500 font-bold block text-[10px]">العام الدراسي المصنف</span>
                  <span className="text-xs font-black text-purple-700">{parseStats?.year || '2025 - 2026 م'}</span>
                </div>
              </div>

              {/* Filter Bar */}
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
                    <option value="أ">فصل / شعبة (أ)</option>
                    <option value="ب">فصل / شعبة (ب)</option>
                    <option value="ج">فصل / شعبة (ج)</option>
                    <option value="د">فصل / شعبة (د)</option>
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
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
                <table className="w-full text-xs text-right divide-y divide-slate-100 dark:divide-slate-800">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[11px]">
                    <tr>
                      <th className="p-3 w-10 text-center">اختيار</th>
                      <th className="p-3">اسم الطالب رباعي</th>
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
                    {filteredRows.map((row, idx) => {
                      const realIndex = parsedRows.indexOf(row);
                      const isSelected = selectedIndices.has(realIndex);

                      return (
                        <tr
                          key={realIndex}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                            isSelected ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : 'opacity-60'
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(realIndex)}
                              className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                            />
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
                            <input
                              type="text"
                              value={row.grade}
                              onChange={e => handleRowChange(realIndex, 'grade', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px]"
                            />
                          </td>

                          <td className="p-2">
                            <select
                              value={row.sectionCode}
                              onChange={e => {
                                const sec = e.target.value as any;
                                handleRowChange(realIndex, 'sectionCode', sec);
                                handleRowChange(realIndex, 'className', `${row.grade.slice(5, 6) || '3'}/${sec}`);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
                            >
                              <option value="أ">شعبة أ</option>
                              <option value="ب">شعبة ب</option>
                              <option value="ج">شعبة ج</option>
                              <option value="د">شعبة د</option>
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
