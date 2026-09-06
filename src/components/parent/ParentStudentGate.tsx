import React, { useState, useMemo } from 'react';
import {
  Search,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Calendar,
  Layers,
  BookOpen,
  Info,
  AlertCircle
} from 'lucide-react';
import { Student } from '../../types';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import logoImg from '../../assets/logo.png';

interface ParentStudentGateProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  previouslyLinkedStudents?: Student[];
  onUnlinkStudent?: (studentId: string) => void;
}

export const ParentStudentGate: React.FC<ParentStudentGateProps> = ({
  students,
  onSelectStudent,
  previouslyLinkedStudents = []
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState('');

  // Filter students based on search query (by studentNumber, nationalNumber, linkCode, or name)
  const searchResults = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return [];

    return students.filter(s => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchNumber = s.studentNumber && s.studentNumber.includes(q);
      const matchNational = s.nationalNumber && s.nationalNumber.includes(q);
      const matchCode = s.linkCode && s.linkCode.toLowerCase().includes(q);
      const matchClass = s.className && s.className.toLowerCase().includes(q);
      return matchName || matchNumber || matchNational || matchCode || matchClass;
    }).slice(0, 10);
  }, [searchInput, students]);

  // Demo samples from different educational stages
  const demoSamples = useMemo(() => {
    const samples: Student[] = [];
    const gradeTargets = ['1/1', '4/1', '7/1', '9/1'];
    
    gradeTargets.forEach(tgt => {
      const found = students.find(s => s.className?.includes(tgt));
      if (found && !samples.some(x => x.id === found.id)) {
        samples.push(found);
      }
    });

    if (samples.length < 4 && students.length >= 4) {
      return [students[0], students[50] || students[1], students[200] || students[2], students[500] || students[3]].filter(Boolean);
    }
    return samples;
  }, [students]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    if (!clean) {
      setSearchError('يرجى كتابة رقم القيد، الرقم الوطني، أو اسم الطالب للاستعلام.');
      return;
    }

    // Exact or best match
    const found = students.find(s => 
      (s.studentNumber && s.studentNumber === clean) ||
      (s.nationalNumber && s.nationalNumber === clean) ||
      (s.linkCode && s.linkCode.toLowerCase() === clean.toLowerCase()) ||
      s.name.toLowerCase() === clean.toLowerCase() ||
      s.name.toLowerCase().includes(clean.toLowerCase())
    );

    if (found) {
      sound.playSuccess();
      triggerConfetti();
      onSelectStudent(found);
    } else {
      sound.playAlert();
      setSearchError('عذراً، لم يتم العثور على طالب بهذه البيانات. تأكد من صحة رقم القيد (7 أرقام) أو ابحث بالاسم الثلاثي.');
    }
  };

  const handlePickStudent = (student: Student) => {
    sound.playSuccess();
    triggerConfetti();
    onSelectStudent(student);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 font-cairo text-right animate-in fade-in duration-300">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Main Hero Card */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-indigo-500/20 relative overflow-hidden">
          
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md p-2 flex items-center justify-center border border-white/20 shadow-inner">
                <img src={logoImg} alt="شعار المدرسة" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>بوابة أولياء الأمور الرسمية • اتصال معزول وآمن</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  استعلام ومتابعة نتائج الطالب 👨‍👩‍👧
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  مرحباً بكم. لمتابعة بطاقة درجات ابنكم المعتمدة، الحضور والغياب اليومي، والتقارير المدرسية، يرجى إدخال رقم القيد أو البحث باسم الطالب.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-end gap-1 bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0">
              <span className="text-[11px] text-slate-400 font-bold">إجمالي طلاب المدرسة المسجلين</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {students.length} طالباً
              </span>
              <span className="text-[10px] text-slate-400">كشف مدرسة الباعور المعتمد • 33 فصلاً</span>
            </div>
          </div>

          {/* Inquiry Input Form */}
          <div className="relative z-10 pt-6">
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <label className="block text-xs sm:text-sm font-bold text-slate-200">
                🔍 استعلام فوري برقم القيد، الرقم الوطني، أو اسم الطالب:
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => {
                      setSearchInput(e.target.value);
                      if (searchError) setSearchError('');
                    }}
                    placeholder="اكتب رقم القيد (مثال: 5864392) أو الرقم الوطني أو اسم الطالب..."
                    className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-white/10 dark:bg-slate-900/60 border border-white/20 text-white placeholder-slate-400 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 backdrop-blur-md shadow-inner"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput('')}
                      className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-white text-xs font-bold"
                    >
                      مسح ✕
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>استعلام وعرض النتائج ↗️</span>
                </button>
              </div>

              {searchError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}
            </form>

            {/* Instant Search Results Dropdown / List */}
            {searchResults.length > 0 && (
              <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-indigo-500/40 backdrop-blur-xl shadow-2xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between px-2 text-[11px] font-bold text-slate-400">
                  <span>الطلاب المطابقون لبحثك ({searchResults.length}):</span>
                  <span>اضغط على الطالب لفتح ملفه ونتائجه فوراً</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {searchResults.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handlePickStudent(s)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-right transition flex items-center justify-between gap-2 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-emerald-400 flex items-center justify-center text-sm font-black border border-indigo-500/30 shrink-0">
                          {s.gender === 'female' ? '👧' : '👦'}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white group-hover:text-emerald-300">
                            {s.name}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>فصل: {s.className}</span>
                            <span>•</span>
                            <span className="font-mono">قيد: {s.studentNumber}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 shrink-0 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Previously Linked Children (If Any) */}
        {previouslyLinkedStudents.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>أبناؤك المربوطون مسبقاً على هذا الجهاز:</span>
              </h3>
              <span className="text-[11px] text-slate-400">اضغط للمتابعة الفورية</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {previouslyLinkedStudents.map(child => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => handlePickStudent(child)}
                  className="p-4 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-500 transition text-right flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
                      {child.gender === 'female' ? '👧' : '👦'}
                    </div>
                    <div>
                      <div className="font-black text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {child.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        فصل: {child.className} • قيد: <span className="font-mono">{child.studentNumber}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-emerald-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Demo Samples for Visitors / Evaluators */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                عينات للمعاينة والتجربة المباشرة (للمدير والزوار):
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">
              اضغط على أي طالب لتجربة استعراض البطاقة والغياب فوراً
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {demoSamples.map((s, idx) => {
              const colors = [
                'border-blue-200 dark:border-blue-900/40 hover:bg-blue-50/60 dark:hover:bg-blue-950/20',
                'border-purple-200 dark:border-purple-900/40 hover:bg-purple-50/60 dark:hover:bg-purple-950/20',
                'border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20',
                'border-amber-200 dark:border-amber-900/40 hover:bg-amber-50/60 dark:hover:bg-amber-950/20'
              ];
              const color = colors[idx % colors.length];

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handlePickStudent(s)}
                  className={`p-3.5 rounded-2xl border transition text-right flex flex-col justify-between gap-2 shadow-xs group ${color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      فصل {s.className}
                    </span>
                    <span className="text-base">{s.gender === 'female' ? '👧' : '👦'}</span>
                  </div>

                  <div>
                    <div className="text-xs font-black text-slate-800 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {s.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      رقم القيد: {s.studentNumber}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                    <span>تجربة العرض ↗️</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {s.academicAverage || 94}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <span>
              <strong>ملاحظة هامة لأولياء الأمور:</strong> يمكنك الاستعلام عن طريق رقم القيد المدون في إخطار الامتحانات أو شهادة الميلاد (المكون من 7 أرقام). المنظومة تحفظ اختيارك تلقائياً لتسهيل المتابعة اليومية عند فتح الرابط في المرات القادمة.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
