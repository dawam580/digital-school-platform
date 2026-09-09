import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Building2, Phone } from 'lucide-react';
import { LicenseService, DEFAULT_INITIAL_LICENSE } from '../../services/licensing/licenseService';
import { SchoolLicenseDoc } from '../../services/licensing/licenseTypes';
import { useSchool } from '../../context/SchoolContext';
import { DEV_MODE } from '../../config/devMode';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onSuccess: (license: SchoolLicenseDoc) => void;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({ isOpen, onSuccess }) => {
  const { setShowActivationModal, setShowFreeTrialModal } = useSchool();
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleVerify = async (keyToVerify?: string) => {
    const key = (keyToVerify || licenseKey).trim().toUpperCase();
    if (!key) {
      setErrorMsg('يرجى إدخال رمز الترخيص المعتمد.');
      return;
    }

    sound.playTap();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await LicenseService.checkSubscription(key);
      if (result.isValid && result.licenseDoc) {
        LicenseService.setActiveLicenseKey(key);
        LicenseService.setCachedLicense(result.licenseDoc);
        sound.playSuccess();
        triggerConfetti();
        onSuccess(result.licenseDoc);
      } else {
        sound.playAlert();
        setErrorMsg(result.errorMessage || 'رمز الترخيص المدخل غير صالح أو انتهت صلاحيته.');
      }
    } catch (err: any) {
      sound.playAlert();
      setErrorMsg('تعذر التحقق من الترخيص. يرجى التأكد من الرمز والاتصال بالإنترنت.');
    } finally {
      setIsLoading(false);
    }
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

        {/* Form Body */}
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

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>رمز الترخيص المعتمد (License Key)</span>
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={e => { setLicenseKey(e.target.value.toUpperCase()); setErrorMsg(''); }}
              placeholder="SCH-2026-XXXX-XXXX"
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-black text-center tracking-widest text-indigo-700 dark:text-indigo-300 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
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
              <span>تفعيل ترخيص مدرسة الشهيد امحمد الباعور (تجريبي)</span>
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
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>لطلب ترخيص جديد أو تجديد:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1" dir="ltr">
              <Phone className="w-3 h-3" />
              0922465676
            </span>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
