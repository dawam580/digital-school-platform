import { generateNumericPassword } from '../../services/security/securityEngine';
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
  GraduationCap,
  Lock,
  Copy,
  Check,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { getCleanAvatar } from '../../utils/avatarHelper';

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
  const { teachers, setTeachers, selectTeacher, showToast } = useSchool();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState(() => generateNumericPassword());
  const [showPassword, setShowPassword] = useState(false);
  const [copiedSlip, setCopiedSlip] = useState(false);
  const [subject, setSubject] = useState('الرياضيات');
  const [phone, setPhone] = useState('0912345678');
  const [assignedClassesText, setAssignedClassesText] = useState('9/أ, 9/ب');

  useEffect(() => {
    if (teacherToEdit) {
      setName(teacherToEdit.name);
      setCode(teacherToEdit.code);
      setSubject(teacherToEdit.subject);
      setPhone(teacherToEdit.phone || '0912345678');
      setAssignedClassesText(teacherToEdit.assignedClasses.join(', '));
      const existingPwd = localStorage.getItem(`madrasa_teacher_pwd_${teacherToEdit.code.toUpperCase()}`) || '';
      setPassword(existingPwd);
    } else {
      setName('');
      setCode(`LIB-MATH-${Math.floor(10 + Math.random() * 90)}`);
      setSubject('الرياضيات');
      setPhone('0912345678');
      setAssignedClassesText('9/أ, 9/ب');
      setPassword(generateNumericPassword());
    }
  }, [teacherToEdit, isOpen]);

  const generateRandomCode = () => {
    sound.playTap();
    const subCodeMap: { [k: string]: string } = {
      'الرياضيات': 'MATH',
      'اللغة العربية': 'ARA',
      'العلوم الطبيعية': 'SCI',
      'اللغة الإنجليزية': 'ENG',
      'التربية الإسلامية': 'ISL',
      'الحاسوب': 'COMP',
      'الدراسات الاجتماعية': 'SOC'
    };
    const prefix = subCodeMap[subject] || 'EDU';
    const randNum = Math.floor(10 + Math.random() * 90);
    setCode(`LIB-${prefix}-${randNum}`);
  };

  const copyTeacherCard = () => {
    sound.playTap();
    const slip = `🎓 بطاقة اعتماد معلم - منصة المدرسة الرقمية
👤 اسم المعلم: ${name || 'المعلم'}
📚 المادة: ${subject}
🔑 رمز الدخول (الكود): ${code}
🔒 كلمة المرور: ${password || '—'}
🏫 الفصول المسندة: ${assignedClassesText}
🌐 رابط المنظومة: ${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(slip);
      setCopiedSlip(true);
      setTimeout(() => setCopiedSlip(false), 2500);
      showToast('gold', 'تم نسخ بطاقة المعلم 📋', 'يمكنك الآن إرسالها للأستاذ عبر الواتساب مباشرة.');
    }
  };

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
              assignedClasses: classes.length > 0 ? classes : ['9/أ'],
              avatar: getCleanAvatar(name.trim(), 'teacher')
            }
          : t
      );
      setTeachers(updated);
      db.saveTeachers(updated);
      const edited = updated.find(t => t.id === teacherToEdit.id);
      if (edited) selectTeacher(edited);
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
        avatar: getCleanAvatar(name.trim(), 'teacher'),
        email: `${code.toLowerCase()}@school.edu.ly`
      };
      const updated = [...teachers, newTeacher];
      setTeachers(updated);
      db.saveTeachers(updated);
      selectTeacher(newTeacher);
      showToast('gold', 'تمت إضافة المعلم وتفعيله 👨‍🏫', `تم تسجيل وتفعيل المعلم ${name} برمز دخول: ${code}`);
    }

    // Save customized password for this teacher in storage
    const cleanCode = code.trim().toUpperCase();
    const cleanPwd = password.trim() || generateNumericPassword();
    try {
      localStorage.setItem(`madrasa_teacher_pwd_${cleanCode}`, cleanPwd);
      localStorage.setItem(`madrasa_pwd_${cleanCode}`, cleanPwd);
    } catch {}

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

          {/* Teacher Code & Auto Generator */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                رمز المعلم (رمز الدخول):
              </label>
              <button
                type="button"
                onClick={generateRandomCode}
                className="px-2.5 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 text-[11px] font-black border border-amber-300 dark:border-amber-800 transition active:scale-95 flex items-center gap-1"
                title="توليد كود مميز وسريع تلقائياً"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>توليد كود تلقائي ⚡</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="مثال: LIB-MATH-01"
                className="w-full py-2.5 px-3.5 pl-10 rounded-xl border-2 border-amber-400 bg-amber-50/50 dark:bg-slate-800 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                required
              />
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400">
              هذا هو الرمز الذي سيستخدمه المعلم لتسجيل الدخول في بوابة المعلم.
            </p>
          </div>

          {/* Teacher Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              كلمة مرور المعلم:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="2026"
                className="w-full py-2.5 px-3.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              الرمز الافتراضي: (2026). يستطيع المعلم أيضاً تغييره لاحقاً بنفسه من حسابه.
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
            <div className="flex gap-1.5 pt-1 flex-wrap">
              {[
                { label: '9/أ (تاسع أ)', val: '9/أ' },
                { label: 'الصف 9 كاملاً', val: '9/أ, 9/ب, 9/ج, 9/د' },
                { label: 'الصف 8 كاملاً', val: '8/أ, 8/ب, 8/ج, 8/د' },
                { label: 'الصف 7 كاملاً', val: '7/أ, 7/ب, 7/ج, 7/د' },
                { label: 'الصف 3 (مسائي)', val: '3/أ, 3/ب' },
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setAssignedClassesText(preset.val)}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-blue-900/30 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Copy Slip WhatsApp Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={copyTeacherCard}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-black text-xs transition active:scale-95 flex items-center justify-center gap-2"
            >
              {copiedSlip ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>تم نسخ بطاقة دخول المعلم للواتساب بنجاح! ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-600" />
                  <span>نسخ بطاقة دخول المعلم لإرسالها بالواتساب 📋</span>
                </>
              )}
            </button>
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
