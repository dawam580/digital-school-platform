import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SchedulePeriod, TeacherAccount } from '../../types';
import {
  Clock,
  BookOpen,
  User,
  MapPin,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface SchedulePeriodEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayName: string;
  dayIndex: number;
  className: string;
  period: SchedulePeriod | null;
  teachers: TeacherAccount[];
  onSavePeriod: (dayIndex: number, period: SchedulePeriod) => void;
}

export const LIBYAN_SUBJECTS = [
  { name: 'الرياضيات', icon: '📐', defaultRoom: 'قاعة الفصل' },
  { name: 'العلوم', icon: '🔬', defaultRoom: 'معمل العلوم' },
  { name: 'الحاسوب (تقنية المعلومات)', icon: '💻', defaultRoom: 'معمل الحاسوب' },
  { name: 'اللغة العربية', icon: '📖', defaultRoom: 'قاعة الفصل' },
  { name: 'التربية الإسلامية', icon: '🕌', defaultRoom: 'قاعة الفصل' },
  { name: 'اللغة الإنجليزية', icon: '🌐', defaultRoom: 'معمل اللغات' },
  { name: 'الدراسات الاجتماعية (التاريخ والجغرافيا)', icon: '🗺️', defaultRoom: 'قاعة الفصل' },
  { name: 'التربية البدنية', icon: '⚽', defaultRoom: 'الصالة الرياضية' },
  { name: 'التربية الفنية', icon: '🎨', defaultRoom: 'المرسم' },
  { name: 'النشاط المدرسي', icon: '🌟', defaultRoom: 'مسرح المدرسة' }
];

export const SchedulePeriodEditorModal: React.FC<SchedulePeriodEditorModalProps> = ({
  isOpen,
  onClose,
  dayName,
  dayIndex,
  className,
  period,
  teachers,
  onSavePeriod
}) => {
  const { showToast } = useSchool();

  const [subject, setSubject] = useState(period?.subject || 'الرياضيات');
  const [teacher, setTeacher] = useState(period?.teacher || teachers[0]?.name || 'أ. طارق الفيتوري');
  const [room, setRoom] = useState(period?.room || 'قاعة 101');
  const [icon, setIcon] = useState(period?.icon || '📐');

  if (!isOpen || !period) return null;

  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    const subObj = LIBYAN_SUBJECTS.find(s => s.name === newSubject);
    if (subObj) {
      setIcon(subObj.icon);
      setRoom(subObj.defaultRoom);
    }
    // Auto-match teacher if possible
    const matchedTeacher = teachers.find(t =>
      newSubject.includes(t.subject) || t.subject.includes(newSubject)
    );
    if (matchedTeacher) {
      setTeacher(matchedTeacher.name);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTap();

    const updatedPeriod: SchedulePeriod = {
      ...period,
      subject,
      teacher,
      room,
      icon
    };

    onSavePeriod(dayIndex, updatedPeriod);
    sound.playSuccess();
    showToast('success', 'تحديث الحصة', `تم حفظ حصة ${subject} للمعلم (${teacher}) بنجاح.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md font-cairo text-right">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#00288e] to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <Clock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-black">
                تعديل وتعيين الحصة #{period.periodNumber} ({dayName} - فصل {className})
              </h3>
              <p className="text-xs text-blue-200">لوحة المدير لتعديل اسم المادة والمعلم والقاعة الدراسية</p>
            </div>
          </div>

          <button
            onClick={() => { onClose(); sound.playTap(); }}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>اسم المادة الدراسية (مناهج وزارة التربية والتعليم الليبية)</span>
            </label>
            <select
              value={subject}
              onChange={e => handleSubjectChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {LIBYAN_SUBJECTS.map(s => (
                <option key={s.name} value={s.name}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" />
              <span>المعلم المسند للحصة</span>
            </label>
            <select
              value={teacher}
              onChange={e => setTeacher(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.code} - {t.subject})
                </option>
              ))}
              <option value="رائد النشاط">رائد النشاط المدرسي</option>
              <option value="إدارة المدرسة">إدارة المدرسة</option>
            </select>
          </div>

          {/* Room / Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>القاعة / المعمل</span>
            </label>
            <input
              type="text"
              value={room}
              onChange={e => setRoom(e.target.value)}
              placeholder="معمل الحاسوب / قاعة 101"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Time Slot Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-800 text-xs flex items-center justify-between">
            <span className="font-bold text-blue-900 dark:text-blue-300">التوقيت الزمني للحصة:</span>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{period.time}</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => { onClose(); sound.playTap(); }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>اعتماد وتحديث الحصة 💾</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
