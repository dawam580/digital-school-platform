import { isSignedLicenseFormat, CryptoLicenseHelper } from '../../services/licensing/cryptoHelper';
import { VENDOR_PHONE, vendorWhatsAppLink } from '../../config/vendor';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Building2, Phone } from 'lucide-react';
import { LicenseService, DEFAULT_INITIAL_LICENSE } from '../../services/licensing/licenseService';
import { SchoolLicenseDoc } from '../../services/licensing/licenseTypes';
import { useSchool } from '../../context/SchoolContext';
import { AuthEngine, LIBYAN_PHONE_RE, normalizeLibyanPhone } from '../../services/security/authEngine';
import { SecurityEngine, isWeakPin } from '../../services/security/securityEngine';
import { DEV_MODE } from '../../config/devMode';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onSuccess: (license: SchoolLicenseDoc) => void;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({ isOpen, onSuccess }) => {
  const { setShowActivationModal, setShowFreeTrialModal, savedSchools, schoolProfile, switchSchool, isAuthenticated, authenticatedRole, updateSchoolProfile, login } = useSchool();
  const otherSchools = (isAuthenticated && authenticatedRole === 'admin') ? savedSchools.filter(s => s.id !== schoolProfile.id) : [];
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hwid] = useState(() => CryptoLicenseHelper.getOrCreateMachineHwid());
  // خطوة الاستلام بعد التفعيل: حساب المدير
  const [activatedDoc, setActivatedDoc] = useState<SchoolLicenseDoc | null>(null);
  const [setupPhone, setSetupPhone] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [hwidCopied, setHwidCopied] = useState(false);

  if (!isOpen) return null;

  const copyHwid = () => {
    try { navigator.clipboard.writeText(hwid); } catch {}
    setHwidCopied(true);
    sound.playTap();
    setTimeout(() => setHwidCopied(false), 2000);
  };

  // تطبيع المفتاح: مفاتيح MADRASA-v3 حساسة لحالة الأحرف (Base64) فلا تُوحَّد،
  // والمفاتيح الكلاسيكية تُوحَّد أحرفها. تُزال الفراغات (التفاف أسطر الواتساب).
  const normalizeKeyInput = (raw: string): string => {
    const noSpaces = raw.replace(/\s+/g, '').trim();
    if (isSignedLicenseFormat(noSpaces)) return noSpaces; // Base64 حساسة لحالة الأحرف
    return noSpaces.toUpperCase();
  };

  const handleVerify = async (keyToVerify?: string) => {
    const key = normalizeKeyInput(keyToVerify || licenseKey);
    if (!key) {
      setErrorMsg('يرجى إدخال رمز الترخيص المعتمد.');
      return;
    }

    sound.playTap();
    setErrorMsg('');

    // المفاتيح الرسمية موقّعة ومقيدة ببصمة الجهاز (MADRASA-v3) — مع خنق محاولات التخمين
    if (!isSignedLicenseFormat(key)) {
      if (DEV_MODE) {
        const result = await LicenseService.checkSubscription(key);
        if (result.isValid && result.licenseDoc) {
          LicenseService.setActiveLicenseKey(key);
          LicenseService.setCachedLicense(result.licenseDoc);
          onSuccess(result.licenseDoc);
          return;
        }
      }
      sound.playAlert();
      setErrorMsg('مفتاح غير صالح — المفتاح الرسمي يبدأ بـ MADRASA-v3- ويصلك من المورّد بعد إرسال بصمة جهازك. للتجربة اضغط "ابدأ تجربة مجانية".');
      return;
    }

    setIsLoading(true);
    try {
      const res = LicenseService.activateOfflineToken(key);
      const doc = res.success ? LicenseService.getCachedLicense() : null;
      if (!res.success || !doc) {
        sound.playAlert();
        setErrorMsg(res.error || 'رمز الترخيص المدخل غير صالح أو انتهت صلاحيته.');
        return;
      }
      sound.playSuccess();
      triggerConfetti();
      // استلام المنظومة: إن لم يُسجَّل مدير بعد يُنشئ المدير حسابه الآن (لا رمز افتراضي مشترك)
      if (AuthEngine.isAdminUnclaimed() || SecurityEngine.getDirectorPin() === '2026') {
        setActivatedDoc(doc);
        setSetupPhone(doc.admin_phone || '');
        return;
      }
      onSuccess(doc);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activatedDoc) return;
    const phone = normalizeLibyanPhone(setupPhone);
    if (!LIBYAN_PHONE_RE.test(phone)) {
      setErrorMsg('أدخل رقم هاتف ليبي صحيح للمدير (مثال: 0912345678).');
      return;
    }
    if (setupPassword.trim().length < 6 || isWeakPin(setupPassword.trim())) {
      setErrorMsg('اختر كلمة مرور من 6 خانات على الأقل، غير متسلسلة وغير مكررة.');
      return;
    }
    if (setupPassword !== setupConfirm) {
      setErrorMsg('كلمتا المرور غير متطابقتين.');
      return;
    }
    SecurityEngine.setDirectorPin(setupPassword.trim());
    try { localStorage.setItem('madrasa_admin_phone', phone); } catch {}
    updateSchoolProfile({ name: activatedDoc.school_name, directorPhone: phone });
    const doc = activatedDoc;
    setActivatedDoc(null);
    onSuccess({ ...doc, admin_phone: phone });
    login(phone, 'admin', setupPassword.trim());
  };

  const handleQuickBaour = () => {
    setLicenseKey(DEFAULT_INITIAL_LICENSE.license_key);
    handleVerify(DEFAULT_INITIAL_LICENSE.license_key);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl font-cairo text-right animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-[#00288e] via-indigo-900 to-[#001f6d] text-white text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 shadow-inner">
            <KeyRound className="w-8 h-8 text-amber-300 animate-pulse" />
          </div>
          <h2 className="text-xl font-black mb-1">تفعيل ترخيص المنظومة الرقمية</h2>
          <p className="text-xs text-blue-200 max-w-sm mx-auto">
            منصة إدارة المدارس الليبية المعتمدة • التحقق من الاشتراك والرخصة البرمجية
          </p>
        </div>

        {/* خطوة الاستلام: إنشاء حساب المدير بعد التفعيل */}
        {activatedDoc ? (
          <form onSubmit={handleSetupAdmin} className="p-6 space-y-4" noValidate>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <p className="font-black">✅ تم تفعيل المنظومة لمدرسة: {activatedDoc.school_name}</p>
              <p className="text-[11px]">ساري حتى: <span dir="ltr">{new Date(activatedDoc.subscription_ends_at || activatedDoc.trial_ends_at).toLocaleDateString('ar-LY')}</span> — أنشئ الآن حساب مدير المدرسة.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="setup-phone" className="block text-xs font-black text-slate-700 dark:text-slate-300">هاتف المدير (للدخول)</label>
              <input id="setup-phone" type="tel" inputMode="tel" dir="ltr" value={setupPhone} onChange={e => { setSetupPhone(e.target.value); setErrorMsg(''); }} placeholder="09xxxxxxxx" className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-center" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="setup-pass" className="block text-xs font-black text-slate-700 dark:text-slate-300">كلمة مرور المدير</label>
                <input id="setup-pass" type="password" value={setupPassword} onChange={e => { setSetupPassword(e.target.value); setErrorMsg(''); }} className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-center" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="setup-pass2" className="block text-xs font-black text-slate-700 dark:text-slate-300">تأكيد كلمة المرور</label>
                <input id="setup-pass2" type="password" value={setupConfirm} onChange={e => { setSetupConfirm(e.target.value); setErrorMsg(''); }} className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-center" />
              </div>
            </div>
            {errorMsg && (
              <div role="alert" className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold">{errorMsg}</div>
            )}
            <button type="submit" className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-black shadow-lg">
              حفظ حساب المدير والدخول للمنظومة
            </button>
          </form>
        ) : (
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">مرحباً بكم في منظومة المدرسة الرقمية</p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                لكل مدرسة مفتاح ترخيص فريد معتمد يتيح تشغيل المنظومة محلياً وتأمين بيانات الطلاب دون انقطاع.
              </p>
            </div>
          </div>

          {/* بصمة هذا الجهاز — يرسلها المدير للمورّد ليصدر مفتاحاً مقيداً بهذا الجهاز (نمط بنيان) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
            <p className="text-[11px] font-black text-slate-600 dark:text-slate-300">1) أرسل بصمة هذا الجهاز للمورّد:</p>
            <div className="flex items-center gap-2">
              <code dir="ltr" data-testid="machine-hwid" className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-sm font-black text-indigo-700 dark:text-indigo-300 text-center select-all">{hwid}</code>
              <button type="button" onClick={copyHwid} className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold whitespace-nowrap">
                {hwidCopied ? 'تم النسخ ✓' : 'نسخ'}
              </button>
            </div>
            <a
              href={vendorWhatsAppLink(`السلام عليكم، أرغب في تفعيل منظومة المدرسة الرقمية.\nبصمة جهازي (HWID): ${hwid}\nاسم المدرسة: `)}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black"
            >
              إرسال البصمة عبر واتساب 💬
            </a>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>2) الصق مفتاح الترخيص الذي استلمته (License Key)</span>
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={e => { setLicenseKey(normalizeKeyInput(e.target.value)); setErrorMsg(''); }}
              placeholder="MADRASA-v3-..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-black text-center tracking-widest text-indigo-700 dark:text-indigo-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              dir="ltr"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              onClick={() => handleVerify()}
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-black rounded-2xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري التحقق من الترخيص...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>تأكيد وتفعيل المنظومة 🚀</span>
                </>
              )}
            </button>

            {/* Quick Demo Option for Baour School — DEV_MODE فقط (تفعيل فوري بلا تحقق، محذوف من الإنتاج) */}
            {DEV_MODE && (
            <button
              type="button"
              onClick={handleQuickBaour}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>تفعيل ترخيص تجريبي للمعاينة (DEV_MODE)</span>
            </button>
            )}

            {/* Self-serve trial bridge: prospect without a key is never stuck */}
            <button
              type="button"
              onClick={() => { sound.playTap(); setShowActivationModal(false); setShowFreeTrialModal(true); }}
              className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ليس لديك مفتاح؟ ابدأ تجربة مجانية (7 أيام)</span>
            </button>

            {/* مدارس أخرى على نفس الجهاز: لا يعلق المدير على مدرسة جديدة غير مفعلة */}
            {otherSchools.length > 0 && (
              <div className="pt-1 space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500">أو انتقل لمدرسة أخرى على هذا الجهاز:</p>
                {otherSchools.map(sch => (
                  <button
                    key={sch.id}
                    type="button"
                    onClick={() => { sound.playTap(); switchSchool(sch.id); }}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-blue-600" />{sch.name}</span>
                    <span className="text-[10px] text-blue-600">التبديل ←</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>لطلب ترخيص جديد أو تجديد:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1" dir="ltr">
              <Phone className="w-3 h-3" />
              {VENDOR_PHONE}
            </span>
          </div>
        </div>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
