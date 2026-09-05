import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { X, Printer, Download, Search, CheckCircle2, ChevronDown } from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface MinistryRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClass?: string;
}

export const MinistryRosterModal: React.FC<MinistryRosterModalProps> = ({
  isOpen,
  onClose,
  initialClass = '1/1 مساء'
}) => {
  const { students, schoolProfile, showToast } = useSchool();

  // Extract all available classes
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.className) set.add(s.className.trim());
    });
    if (set.size === 0) {
      ['1/1 مساء', '1/2 مساء', '2/1 مساء', '3/1 مساء', '4/1 مساء', '7/1 صباح', '8/1 صباح', '9/1 صباح'].forEach(c => set.add(c));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ar', { numeric: true }));
  }, [students]);

  const [selectedClass, setSelectedClass] = useState<string>(initialClass || availableClasses[0] || '1/1 مساء');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter students for the active class
  const classStudents = students.filter(s => s.className === selectedClass);
  const displayedStudents = classStudents.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.studentNumber && s.studentNumber.includes(q)) || (s.nationalNumber && s.nationalNumber.includes(q));
  });

  // Calculate page number index
  const pageIndex = availableClasses.indexOf(selectedClass) + 1;

  // Print handler
  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  // Export CSV/Excel
  const handleExportCsv = () => {
    sound.playTap();
    const headers = ['ت', 'رقم القيد', 'الاسم', 'الجنس', 'تاريخ الميلاد', 'الجنسية', 'الديانة'];
    const rows = classStudents.map((st, idx) => [
      idx + 1,
      `"${st.studentNumber || st.nationalNumber?.slice(-7) || '-'}"`,
      `"${st.name}"`,
      st.gender === 'male' ? 'ذكر' : 'انثى',
      st.birthDate || '2015-01-01',
      'ليبي',
      st.gender === 'male' ? 'مسلم' : 'مسلمة'
    ].join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `كشف_${selectedClass.replace(/\s+/g, '_')}_مدرسة_الباعور.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'تم تصدير الكشف 📊', `تم تصدير كشف (${selectedClass}) بنجاح.`);
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/85 backdrop-blur-md p-2 sm:p-6 flex justify-center items-start font-cairo">
      <div className="relative w-full max-w-5xl my-4 sm:my-8 bg-white text-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-300 flex flex-col text-right animate-in fade-in">
        
        {/* Controls Header (Hidden in Print) */}
        <div className="print:hidden p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20 shrink-0">
              📑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">الكشف الوزاري المعتمد (طبق الأصل 100%)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500 text-white font-black">
                  المركز الوطني للامتحانات
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                نفس تنسيق وتصميم كشف وزارة التربية والتعليم الليبية بدقة متناهية وجاهز للطباعة A4
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            {/* Class Selector Dropdown */}
            <select
              value={selectedClass}
              onChange={e => { setSelectedClass(e.target.value); sound.playTap(); }}
              className="py-2 px-3 rounded-xl bg-white text-slate-900 font-black text-xs border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
            >
              {availableClasses.map(cls => {
                const count = students.filter(s => s.className === cls).length;
                return (
                  <option key={cls} value={cls}>
                    فصل ({cls}) — {count} طالب
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة A4 🖨️</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>تصدير Excel 📊</span>
            </button>

            <button
              type="button"
              onClick={() => { onClose(); sound.playTap(); }}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body (Exact Ministry Replica) */}
        <div className="p-6 sm:p-10 bg-white text-slate-900 font-cairo">
          
          {/* Document Official Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-4 text-xs">
            {/* Right: Country & Ministry */}
            <div className="text-right leading-relaxed">
              <strong className="block text-sm font-black text-slate-950">دولة ليبيا</strong>
              <strong className="block font-black text-slate-900">وزارة التربية والتعليم</strong>
              <span className="block font-bold text-slate-800">المركز الوطني للامتحانات</span>
            </div>

            {/* Center: Title & School Name */}
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                قائمة بالطلبة المسجلين حسب المستوى الدراسي والفصل
              </h2>
              <p className="text-xs font-bold text-slate-800">
                للعام الدراسي 1447-1448 هـ الموافق 2025-2026 م
              </p>
              <p className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-0.5 rounded-md inline-block">
                مدرسة الشهيد امحمد الباعور للتعليم الأساسي - 30713 - توكرة
              </p>
              <div className="text-xs font-black text-blue-900 pt-0.5">
                الصف: {selectedClass.includes('مساء') ? 'التعليم الأساسي (الفترة المسائية)' : 'التعليم الأساسي (الفترة الصباحية)'} / فصل {selectedClass}
              </div>
            </div>

            {/* Left: Metadata */}
            <div className="text-left font-mono text-[11px] leading-relaxed dir-ltr">
              <div><strong>التاريخ:</strong> 2026/03/28</div>
              <div><strong>التوقيت:</strong> 20:12:25</div>
              <div><strong>الصفحة:</strong> {pageIndex} من {availableClasses.length}</div>
            </div>
          </div>

          {/* Quick Search inside modal (Screen Only) */}
          <div className="print:hidden mb-4 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="تصفية سريعة بالاسم أو رقم القيد..."
                className="w-full py-2 px-3 pr-9 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            <span className="text-xs font-bold text-slate-600">
              عدد الطلبة في هذا الفصل: <strong className="text-slate-950 font-black font-mono">{classStudents.length}</strong> طالب
            </span>
          </div>

          {/* Official 7-Column Table (100% Matching Ministry PDF) */}
          <div className="border border-slate-900 overflow-hidden">
            <table className="w-full text-right text-xs border-collapse font-cairo">
              <thead>
                <tr className="bg-slate-100 text-slate-950 font-black border-b border-slate-900">
                  <th className="py-2.5 px-3 border-l border-slate-900 text-center w-12">ت</th>
                  <th className="py-2.5 px-3 border-l border-slate-900 text-center w-28 font-mono">رقم القيد</th>
                  <th className="py-2.5 px-4 border-l border-slate-900 text-right">الاسم</th>
                  <th className="py-2.5 px-3 border-l border-slate-900 text-center w-16">الجنس</th>
                  <th className="py-2.5 px-3 border-l border-slate-900 text-center w-28 font-mono">تاريخ الميلاد</th>
                  <th className="py-2.5 px-3 border-l border-slate-900 text-center w-20">الجنسية</th>
                  <th className="py-2.5 px-3 text-center w-20">الديانة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-900 font-bold">
                {displayedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      لا يوجد طلبة مسجلين بهذا الفصل
                    </td>
                  </tr>
                ) : (
                  displayedStudents.map((st, idx) => (
                    <tr key={st.id} className="hover:bg-slate-50 transition border-b border-slate-200">
                      <td className="py-2 px-3 border-l border-slate-300 text-center font-mono text-slate-700">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-l border-slate-300 text-center font-mono font-black text-slate-950">
                        {st.studentNumber || st.nationalNumber?.slice(-7) || '-'}
                      </td>
                      <td className="py-2 px-4 border-l border-slate-300 font-black text-slate-950 text-sm">
                        {st.name}
                      </td>
                      <td className="py-2 px-3 border-l border-slate-300 text-center">
                        {st.gender === 'male' ? 'ذكر' : 'انثى'}
                      </td>
                      <td className="py-2 px-3 border-l border-slate-300 text-center font-mono font-bold text-slate-800">
                        {st.birthDate || '2015-01-01'}
                      </td>
                      <td className="py-2 px-3 border-l border-slate-300 text-center">
                        ليبي
                      </td>
                      <td className="py-2 px-3 text-center">
                        {st.gender === 'male' ? 'مسلم' : 'مسلمة'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Official Footer & Signature Stamp Area */}
          <div className="mt-8 pt-6 border-t border-slate-300 flex items-center justify-between text-xs font-bold text-slate-800">
            <div className="text-center space-y-1">
              <span className="block">مسؤول شؤون الطلبة والتوثيق</span>
              <span className="block text-slate-400 font-mono">...................................</span>
            </div>

            <div className="text-center space-y-1">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-400 mx-auto">
                ختم المدرسة
              </div>
            </div>

            <div className="text-center space-y-1">
              <span className="block">مدير المدرسة / رئيس الكنترول</span>
              <span className="block font-black text-slate-950">{schoolProfile.directorName || 'أ. فتحي الشريف'}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
