import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  KeyRound, 
  ShieldAlert, 
  Phone, 
  ShieldCheck, 
  Lock, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  Laptop, 
  MessageSquare 
} from 'lucide-react';
import { LicenseVerificationResult } from '../../services/licensing/licenseTypes';
import { LicenseService } from '../../services/licensing/licenseService';
import { CryptoLicenseHelper } from '../../services/licensing/cryptoHelper';
import { sound } from '../../utils/soundEffects';

interface SubscriptionExpiredOverlayProps {
  result: LicenseVerificationResult;
  onRecheck: () => Promise<void>;
  onEnterNewLicense: () => void;
  onOpenSuperAdmin: () => void;
}

export const SubscriptionExpiredOverlay: React.FC<SubscriptionExpiredOverlayProps> = ({
  result,
  onRecheck,
  onEnterNewLicense,
  onOpenSuperAdmin
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [renewPhone, setRenewPhone] = useState(result.licenseDoc?.admin_phone || '');
  const [renewMsg, setRenewMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [renewError, setRenewError] = useState('');
  const [sentRequestId, setSentRequestId] = useState<string | null>(null);

  // Machine HWID & Key Activation states
  const [clientHwid, setClientHwid] = useState('');
  const [hwidCopied, setHwidCopied] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState('');
  const [activationSuccess, setActivationSuccess] = useState('');

  useEffect(() => {
    const hwid = CryptoLicenseHelper.getOrCreateMachineHwid();
    setClientHwid(hwid);
  }, []);

  const handleCopyHwid = () => {
    sound.playTap();
    if (clientHwid && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(clientHwid);
      setHwidCopied(true);
      setTimeout(() => setHwidCopied(false), 2500);
    }
  };

  const handleActivateOfflineKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError('');
    setActivationSuccess('');

    const token = inputKey.trim();
    if (!token) {
      setActivationError('يرجى لصق كود الترخيص هنا.');
      return;
    }

    sound.playTap();
    setIsActivating(true);

    try {
      const res = LicenseService.activateOfflineToken(token);
      if (res.success) {
        sound.playSuccess();
        setActivationSuccess(`تم تفعيل ترخيص (${res.schoolName || result.schoolName}) بنجاح! جاري فتح المنظومة...`);
        setTimeout(async () => {
          await onRecheck();
        }, 1200);
      } else {
        sound.playAlert();
        setActivationError(res.error || 'كود الترخيص غير صالح أو لا يطابق هذا الجهاز.');
      }
    } finally {
      setIsActivating(false);
    }
  };

  const alreadyPending = LicenseService.hasPendingRenewal(result.licenseKey) || sentRequestId !== null;

  const handleRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    setRenewError('');
    if (!renewPhone.trim()) {
      setRenewError('يرجى إدخال رقم هاتف المدير للتواصل.');
      return;
    }
    sound.playTap();
    setIsSending(true);
    try {
      const res = await LicenseService.requestRenewal({
        licenseKey: result.licenseKey,
        schoolName: result.schoolName,
        adminPhone: renewPhone,
        message: renewMsg,
      });
      if (res.ok && res.request) {
        sound.playSuccess();
        setSentRequestId(res.request.id);
        setShowRenewForm(false);
      } else {
        sound.playAlert();
        setRenewError(res.error || 'تعذر إرسال الطلب.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = async () => {
    sound.playTap();
    setIsChecking(true);
    await onRecheck();
    setIsChecking(false);
  };

  const isGrace = result.status === 'grace_expired';
  const isSuspended = result.status === 'suspended';

  // Prefilled WhatsApp message
  const whatsappText = encodeURIComponent(
    `السلام عليكم، أرغب في شراء وتفعيل الترخيص الدائم لمنظومة مدرسة: ${result.schoolName || 'مدرستنا'}\nكود جهازي (HWID): ${clientHwid}`
  );
  const whatsappUrl = `https://wa.me/218922465676?text=${whatsappText}`;

  const modal = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl font-cairo text-right overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl my-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-rose-300 dark:border-rose-900/70 animate-in zoom-in-95 duration-200">
        
        {/* Banner */}
        <div className={`p-6 text-center text-white ${
          isSuspended
            ? 'bg-gradient-to-r from-amber-600 to-orange-700'
            : isGrace
            ? 'bg-gradient-to-r from-blue-700 to-indigo-800'
            : 'bg-gradient-to-r from-rose-600 via-rose-700 to-red-900'
        }`}>
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 shadow-inner">
            {isSuspended ? (
              <ShieldAlert className="w-8 h-8 text-amber-200 animate-pulse" />
            ) : isGrace ? (
              <Clock className="w-8 h-8 text-blue-200 animate-bounce" />
            ) : (
              <Lock className="w-8 h-8 text-rose-200 animate-pulse" />
            )}
          </div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            {isSuspended ? 'ترخيص معلق' : isGrace ? 'مطلوب الاتصال بالإنترنت' : 'انتهت الفترة التجريبية (القفل الآمن)'}
          </span>
          <h2 className="text-xl font-black mt-2 mb-1">{result.schoolName}</h2>
          <p className="text-xs text-white/80 font-mono" dir="ltr">{result.licenseKey}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{isSuspended ? 'تم تعليق الاشتراك مؤقتاً' : isGrace ? 'تجاوز مهلة الـ 7 أيام بدون إنترنت' : 'انتهت فترة الأسبوع التجريبية المجانية'}</span>
            </p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              {result.errorMessage || 'انتهت مدة التجربة الممنوحة لجهازكم (7 أيام). تم قفل المنظومة أمنياً لحين إدخال مفتاح التفعيل الدائم المعتمد.'}
            </p>
          </div>

          {/* Machine HWID (بصمة هذا الجهاز) Box */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-md space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <Laptop className="w-4 h-4" />
                <span>كود بصمة جهازك الفريد (Hardware ID):</span>
              </span>
              <span className="text-[10px] text-slate-400">مطلوب لتوليد المفتاح</span>
            </div>
            
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <code className="text-sm font-black font-mono text-emerald-400 select-all" dir="ltr">
                {clientHwid || 'جاري استخراج كود الجهاز...'}
              </code>
              <button
                type="button"
                onClick={handleCopyHwid}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1 transition shrink-0"
              >
                {hwidCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الكود</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              انسخ هذا الكود وأرسله لنا عبر الواتساب لنقوم بتوليد مفتاح الترخيص الدائم الخاص بحاسوبك.
            </p>
          </div>

          {/* WhatsApp Direct Link with Pre-filled Message */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-right w-full sm:w-auto">
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>لطلب مفتاح الترخيص الدائم فوراً:</span>
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">تواصل عبر الواتساب المباشر مع مهندس الدعم</p>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95 shrink-0"
            >
              <Phone className="w-4 h-4" />
              <span>إرسال كود جهازي للواتساب 💬</span>
            </a>
          </div>

          {/* Immediate Key Activation Form (لصق المفتاح والتفعيل الفوري) */}
          <div className="p-4 rounded-2xl border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900 dark:text-indigo-200">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>تفعيل الترخيص الدائم بمفتاح التفعيل المعتمد 🔑</span>
            </div>
            
            <form onSubmit={handleActivateOfflineKey} className="space-y-2">
              <input
                type="text"
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                placeholder="الصق كود الترخيص هنا (MADRASA-v2-...)"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-900 text-xs font-mono text-indigo-950 dark:text-indigo-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {activationError && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{activationError}</span>
                </p>
              )}
              {activationSuccess && (
                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>{activationSuccess}</span>
                </p>
              )}
              <button
                type="submit"
                disabled={isActivating || !inputKey.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isActivating ? 'جاري التحقق والتفعيل...' : 'تفعيل المنظومة الآن 🚀'}</span>
              </button>
            </form>
          </div>

          {/* Data Protection Reassurance */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>بيانات مدرستكم محفوظة بأمان كامل 100%</span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              كافة سجلات الطلاب، كشوفات الدرجات، وأيام الحضور والغياب محفوظة محلياً داخل جهازكم ولم يتم حذف أو المساس بأي سجل نهائياً. بمجرد تفعيل الترخيص ستستأنف عملك فوراً.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isChecking}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>إعادة فحص السيرفر 🔄</span>
            </button>

            <button
              type="button"
              onClick={onEnterNewLicense}
              className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>رمز ترخيص كلاسيكي 🔑</span>
            </button>
          </div>

          {/* Super Admin Unlock link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onOpenSuperAdmin}
              className="text-[11px] text-slate-400 hover:text-blue-500 underline font-bold transition"
            >
              دخول لوحة السوبر أدمن لتوليد وإدارة التراخيص 🔒
            </button>
          </div>

        </div>

      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
