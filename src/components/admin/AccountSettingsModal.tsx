import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  KeyRound,
  Phone,
  UserCheck,
  ShieldCheck,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { auditLogger } from '../../services/audit/auditLogger';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    currentRole,
    currentUserPhone,
    setCurrentUserPhone,
    currentTeacher,
    teachers,
    setTeachers,
    showToast,
    db
  } = useSchool() as any;

  // Form States
  const [phone, setPhone] = useState(currentUserPhone || '0922465676');
  const [teacherCode, setTeacherCode] = useState(currentTeacher?.code || 'LIB-MATH-01');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTap();

    // Validation
    if (!phone || phone.trim().length < 8) {
      showToast('error', 'خطأ في الإدخال', 'يرجى إدخال رقم هاتف ليبي صحيح (مثل: 0922465676).');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      showToast('error', 'تطابق كلمة المرور', 'كلمة المرور الجديدة وتأكيدها غير متطابقين.');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      // 1. Update Phone
      if (setCurrentUserPhone) {
        setCurrentUserPhone(phone.trim());
      }
      localStorage.setItem('madrasa_admin_phone', phone.trim());

      // 2. Update Password if changed
      if (newPassword) {
        localStorage.setItem(`madrasa_pwd_${phone.trim()}`, newPassword);
        localStorage.setItem('madrasa_global_pwd', newPassword);
      }

      // 3. Update Teacher Code if teacher role
      if (currentRole === 'teacher' && currentTeacher) {
        const updatedTeachers = teachers.map((t: any) =>
          t.id === currentTeacher.id ? { ...t, code: teacherCode.trim() } : t
        );
        if (setTeachers) setTeachers(updatedTeachers);
        db.saveTeachers(updatedTeachers);
      }

      auditLogger.log({
        actorName: phone,
        actorRole: currentRole,
        action: 'UPDATE_SECURITY_SETTINGS',
        entity: 'Security',
        details: `تحديث إعدادات الأمان ورقم الهاتف (${phone}) وكلمة المرور بنجاح`,
        severity: 'INFO'
      });

      setIsSaving(false);
      sound.playSuccess();
      triggerConfetti();
      showToast('gold', 'تم حفظ الإعدادات بنجاح 🔒', 'تم تحديث رقم الهاتف، كلمة المرور، وبيانات الأمان بنجاح.');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md font-cairo text-right">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#00288e] to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-black">إعدادات الحساب والأمان</h3>
              <p className="text-xs text-blue-200">تعديل رقم الهاتف الليبي، كلمة المرور، ورمز الدخول</p>
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
        <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
          
          {/* Section 1: Phone & Teacher Code */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>رقم الهاتف المعتمد (ليبي)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0922465676"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">يُستخدم هذا الرقم لتسجيل دخول المدير واستقبال الإشعارات.</p>
            </div>

            {/* Teacher Code edit (For teacher or admin) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>رمز المعلم الخاص للدخول (Teacher Access Code)</span>
              </label>
              <input
                type="text"
                value={teacherCode}
                onChange={e => setTeacherCode(e.target.value.toUpperCase())}
                placeholder="LIB-MATH-01"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none text-blue-600 dark:text-blue-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">الرمز الفريد لدخول بوابة المعلمين (مثال: LIB-MATH-01, LIB-ARA-02).</p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              تغيير كلمة المرور (اختياري)
            </h4>

            {/* New Password */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                كلمة المرور الجديدة
              </label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة..."
                className="w-full px-4 py-2.5 pr-4 pl-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute left-3 top-8 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password */}
            {newPassword && (
              <div className="relative animate-fadeIn">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="أعد كتابة كلمة المرور للتأكيد..."
                  className={`w-full px-4 py-2.5 rounded-2xl border text-sm font-mono focus:outline-none ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                  }`}
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-[11px] text-red-500 mt-1 font-bold">كلمات المرور غير متطابقة!</p>
                )}
              </div>
            )}
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
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات 💾'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
