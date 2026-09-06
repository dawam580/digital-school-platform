import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Search,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Users,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { TeacherAccount } from '../../types';
import { sound } from '../../utils/soundEffects';

interface TeacherSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: TeacherAccount[];
  currentTeacher: TeacherAccount | null;
  onSelectTeacher: (teacher: TeacherAccount) => void;
}

export const TeacherSelectionModal: React.FC<TeacherSelectionModalProps> = ({
  isOpen,
  onClose,
  teachers,
  currentTeacher,
  onSelectTeacher
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Lock body scroll when modal is active
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Extract unique subjects for filter chips
  const subjectsList = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach(t => {
      if (t.subject) set.add(t.subject);
    });
    return Array.from(set);
  }, [teachers]);

  // Filter teachers by search and subject
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const q = searchQuery.trim().toLowerCase();
      const matchQuery = !q || 
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.code && t.code.toLowerCase().includes(q));

      const matchSubject = selectedSubjectFilter === 'all' || t.subject === selectedSubjectFilter;

      return matchQuery && matchSubject;
    });
  }, [teachers, searchQuery, selectedSubjectFilter]);

  if (!isOpen) return null;

  const handleSelect = (teacher: TeacherAccount) => {
    sound.playSuccess();
    onSelectTeacher(teacher);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl font-cairo text-right animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl border border-white/20 shadow-inner shrink-0">
              👨‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black leading-tight">
                  اختيار حساب المعلم / تبديل المعلم 🔄
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {teachers.length} معلماً مسجلاً
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                حدد اسمك من كشف معلمي المدرسة لمتابعة فصولك وجدولك ورصد درجات أعمال السنة والامتحانات
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { onClose(); sound.playTap(); }}
            className="p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 space-y-3 shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المعلم، المادة، أو رمز المعلم..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                مسح ✕
              </button>
            )}
          </div>

          {/* Subject Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-slate-400 font-bold shrink-0 ml-1">تصفية بالمادة:</span>
            <button
              type="button"
              onClick={() => setSelectedSubjectFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold text-xs shrink-0 transition ${
                selectedSubjectFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              الكل ({teachers.length})
            </button>
            {subjectsList.map(sub => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubjectFilter(sub)}
                className={`px-3 py-1 rounded-lg font-bold text-xs shrink-0 transition ${
                  selectedSubjectFilter === sub
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="text-4xl">🔍</div>
              <div className="text-sm font-bold text-slate-600 dark:text-slate-400">
                لم يتم العثور على معلم يطابق بحثك
              </div>
              <div className="text-xs text-slate-400">
                جرب البحث بكلمة مختلفة أو اختر "الكل" لعرض جميع المعلمين
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTeachers.map(teacher => {
                const isCurrent = currentTeacher?.id === teacher.id;

                return (
                  <button
                    key={teacher.id}
                    type="button"
                    onClick={() => handleSelect(teacher)}
                    className={`p-4 rounded-2xl border-2 transition text-right flex flex-col justify-between gap-3 shadow-xs group ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0 overflow-hidden">
                          {teacher.avatar ? (
                            <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                          ) : (
                            teacher.name.charAt(2) || 'م'
                          )}
                        </div>
                        <div>
                          <div className="font-black text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {teacher.name}
                          </div>
                          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{teacher.subject}</span>
                          </div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-black shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>الحالي</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                          {teacher.code}
                        </span>
                      )}
                    </div>

                    {/* Classes & Quota */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-bold">الفصول:</span>
                        {(teacher.assignedClasses || []).slice(0, 3).map(c => (
                          <span
                            key={c}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]"
                          >
                            {c}
                          </span>
                        ))}
                        {(teacher.assignedClasses || []).length > 3 && (
                          <span className="text-[9px] text-slate-400">
                            +{(teacher.assignedClasses || []).length - 3}
                          </span>
                        )}
                      </div>

                      <span className="font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-0.5">
                        <span>دخول</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            يمكنك تبديل حساب المعلم في أي وقت بنقرة واحدة من أعلى لوحة التحكم.
          </span>
          <button
            type="button"
            onClick={() => { onClose(); sound.playTap(); }}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition active:scale-95"
          >
            إلغاء
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
