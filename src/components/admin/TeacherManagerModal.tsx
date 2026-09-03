import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { TeacherAccount } from '../../types';
import { db } from '../../services/db';
import {
  X,
  UserPlus,
  Edit2,
  CheckCircle2,
  BookOpen,
  Phone,
  Tag,
  Layers,
  GraduationCap
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface TeacherManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherToEdit?: TeacherAccount | null;
}

export const TeacherManagerModal: React.FC<TeacherManagerModalProps> = ({
  isOpen,
  onClose,
  teacherToEdit
}) => {
  const { teachers, setTeachers, showToast } = useSchool();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [subject, setSubject] = useState('الرياضيات');
  const [phone, setPhone] = useState('0912345678');
  const [assignedClassesText, setAssignedClassesText] = useState('9/أ, 9/ب');

  useEffect(() => {
    if (teacherToEdit) {
      setName(teacherToEdit.name);
      setCode(teacherToEdit.code);
      setSubject(teacherToEdit.subject);
      setPhone(teacherToEdit.phone);
      setAssignedClassesText(teacherToEdit.assignedClasses.join(', '));
    } else {
      setName('');
      setCode(`TCH-${Math.floor(100 + Math.random() * 900)}`);
      setSubject('الرياضيات');
      setPhone('0912345678');
      setAssignedClassesText('9/أ, 9/ب');
    }
  }, [teacherToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      showToast('error', 'تنبيه', 'يرجى إدخال اسم المعلم ورمز الدخول.');
      return;
    }

    const classes = assignedClassesText
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const subjectCodeMap: { [sub: string]: string } = {
      'الرياضيات': 'MATH',
      'اللغة العربية': 'ARB',
      'العلوم الطبيعية': 'SCI',
      'اللغة الإنجليزية': 'ENG',
      'التربية الإسلامية': 'ISL',
      'الحاسوب': 'COMP',
      'الدراسات الاجتماعية': 'SOC'
    };

    if (teacherToEdit) {
      // Update existing
      const updated = teachers.map(t =>
        t.id === teacherToEdit.id
          ? {
              ...t,
              name: name.trim(),
              code: code.trim(),
              subject: subject.trim(),
              subjectCode: subjectCodeMap[subject.trim()] || 'GEN',
              phone: phone.trim(),
              assignedClasses: classes.length > 0 ? classes : ['9/أ']
            }
          : t
      );
      setTeachers(updated);
      db.saveTeachers(updated);
      showToast('gold', 'تم تحديث بيانات المعلم 🌟', `تم حفظ بيانات ${name} بالرمز الجديد: ${code}`);
    } else {
      // Add new teacher
      const newTeacher: TeacherAccount = {
        id: `t-${Date.now()}`,
        name: name.trim(),
        code: code.trim(),
        subject: subject.trim(),
        subjectCode: subjectCodeMap[subject.trim()] || 'GEN',
        phone: phone.trim(),
        assignedClasses: classes.length > 0 ? classes : ['9/أ'],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        email: `${code.toLowerCase()}@school.edu.ly`
      };
      const updated = [...teachers, newTeacher];
      setTeachers(updated);
      db.saveTeachers(updated);
      showToast('gold', 'تمت إضافة المعلم بنجاح 👨‍🏫', `تم تسجيل المعلم ${name} برمز دخول: ${code}`);
    }

    sound.playSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm font-cairo text-right animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20 text-xl">
              👨‍🏫
            </div>
            <div>
              <h3 className="text-base font-black">
                {teacherToEdit ? 'تعديل بيانات المعلم والرمز' : 'إضافة معلم جديد للمدرسة'}
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                تحديد رمز الدخول والمادة والفصول المسندة للمعلم
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Teacher Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              اسم المعلم الكامل:
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: أ. طارق الفيتوري"
              className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Teacher Code */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              رمز المعلم (رمز الدخول):
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="مثال: أستاذ-طارق أو LIB-MATH-01"
                className="w-full py-2.5 px-3.5 pl-10 rounded-xl border-2 border-amber-400 bg-amber-50/50 dark:bg-slate-800 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                required
              />
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400">
              هذا هو الرمز الذي سيستخدمه المعلم لتسجيل الدخول في بوابة المعلم.
            </p>
          </div>

          {/* Subject Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                المادة الدراسية:
              </label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none"
              >
                <option value="الرياضيات">الرياضيات</option>
                <option value="اللغة العربية">اللغة العربية</option>
                <option value="العلوم الطبيعية">العلوم الطبيعية</option>
                <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
                <option value="التربية الإسلامية">التربية الإسلامية</option>
                <option value="الحاسوب">الحاسوب</option>
                <option value="الدراسات الاجتماعية">الدراسات الاجتماعية</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                رقم الهاتف:
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Assigned Classes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              الفصول المسندة للمعلم (مفصولة بفاصلة):
            </label>
            <input
              type="text"
              value={assignedClassesText}
              onChange={e => setAssignedClassesText(e.target.value)}
              placeholder="مثال: 9/أ, 9/ب, 3/أ"
              className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none"
            />
            <div className="flex gap-1.5 pt-1">
              {['9/أ, 9/ب', '9/ج, 9/د', '3/أ, 3/ب', 'الكل'].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    if (preset === 'الكل') setAssignedClassesText('9/أ, 9/ب, 9/ج, 9/د');
                    else setAssignedClassesText(preset);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{teacherToEdit ? 'حفظ التعديلات' : 'إضافة المعلم واعتماد رمزه'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
