import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Search, User, BookOpen, CalendarCheck, FileText, Bell, Sparkles, X, ArrowLeft } from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { students, setSelectedStudent, setActiveTab } = useSchool();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Escape & Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        sound.playTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  // Filter students
  const filteredStudents = students.filter(s =>
    s.name.includes(query) ||
    s.studentNumber.includes(query) ||
    s.nationalId.includes(query) ||
    s.className.includes(query)
  );

  const quickActions = [
    { label: 'تسجيل الحضور الصباحي', tab: 'attendance', icon: CalendarCheck, desc: 'رصد فوري لطلاب الفصل' },
    { label: 'التقرير اليومي للدروس', tab: 'daily-report', icon: FileText, desc: 'عرض تقرير الحصص والواجبات' },
    { label: 'مركز الإشعارات والتنبيهات', tab: 'notifications', icon: Bell, desc: 'سجل التنبيهات العاجلة' },
    { label: 'ربط طالب جديد بالكود', tab: 'link-student', icon: User, desc: 'إدخال كود المدرسة' },
  ];

  const handleSelectStudent = (student: typeof students[0]) => {
    sound.playTap();
    setSelectedStudent(student);
    setActiveTab('student-profile');
    onClose();
  };

  const handleSelectAction = (tab: string) => {
    sound.playTap();
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden text-right space-y-4">
        
        {/* Search Input Box */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#00288e] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="بحث فوري عن طالب، صف، رقم هوية، أو إجراء مدرسي..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 pt-0 max-h-96 overflow-y-auto space-y-4">
          
          {/* Students Results */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">
              الطلاب ({filteredStudents.length})
            </span>
            <div className="space-y-1.5">
              {filteredStudents.map(std => (
                <div
                  key={std.id}
                  onClick={() => handleSelectStudent(std)}
                  className="p-3 rounded-2xl hover:bg-[#f0f4ff] cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <img src={std.avatar} alt={std.name} className="w-10 h-10 rounded-2xl object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#00288e] transition-colors">{std.name}</h4>
                      <p className="text-xs text-slate-400">{std.grade} • {std.className} • معدل: <span className="font-bold text-emerald-600 font-tajawal">{std.academicAverage}%</span></p>
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-[#00288e] transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">
              إجراءات سريعة
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickActions.map((act, i) => {
                const Icon = act.icon;
                return (
                  <div
                    key={i}
                    onClick={() => handleSelectAction(act.tab)}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-100 cursor-pointer transition-all flex items-center gap-3 group"
                  >
                    <div className="p-2 rounded-xl bg-white text-[#00288e] shadow-sm">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 group-hover:text-[#00288e]">{act.label}</h5>
                      <p className="text-[10px] text-slate-400">{act.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 flex items-center justify-between px-6">
          <span>اضغط على أي نتيجة للانتقال المباشر</span>
          <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-lg border border-slate-200">ESC للإغلاق</span>
        </div>

      </div>
    </div>
  );
};
