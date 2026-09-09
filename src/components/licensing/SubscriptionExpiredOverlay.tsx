import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Clock, RefreshCw, KeyRound, ShieldAlert, Phone, ShieldCheck, Lock, ExternalLink, Send, CheckCircle2 } from 'lucide-react';
import { LicenseVerificationResult } from '../../services/licensing/licenseTypes';
import { LicenseService } from '../../services/licensing/licenseService';
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

  const modal = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl font-cairo text-right animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-rose-200 dark:border-rose-900/60 animate-in zoom-in-95 duration-200">
        
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
            {isSuspended ? 'ترخيص معلق' : isGrace ? 'مطلوب الاتصال بالإنترنت' : 'انتهت الفترة التجريبية'}
          </span>
          <h2 className="text-xl font-black mt-2 mb-1">{result.schoolName}</h2>
          <p className="text-xs text-white/80 font-mono" dir="ltr">{result.licenseKey}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{isSuspended ? 'تم تعليق الاشتراك مؤقتاً' : isGrace ? 'تجاوز مهلة الـ 7 أيام بدون إنترنت' : 'انتهت الفترة التجريبية الممنوحة للمدرسة'}</span>
            </p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              {result.errorMessage || 'تم قفل عمليات التعديل والإضافة لحين تجديد الترخيص.'}
            </p>
          </div>

          {/* Data Protection Reassurance */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>بيانات مدرستكم محفوظة بأمان كامل 100%</span>
            </p>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
              كافة سجلات الطلاب، كشوفات الدرجات، وأيام الحضور والغياب محفوظة محلياً داخل جهازكم ولن يتم حذف أو المساس بأي سجل نهائياً. بمجرد تفعيل الترخيص ستستمر المنظومة فوراً.
            </p>
          </div>

          {/* Support / Contact Box */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">للاشتراك الفوري والتجديد:</p>
              <p className="text-[11px] text-slate-500">تواصل عبر الواتساب أو الهاتف المباشر</p>
            </div>
            <a
              href="https://wa.me/218922465676"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span dir="ltr">0922465676</span>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">            <button
              onClick={handleRefresh}
              disabled={isChecking}
              className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>إعادة التحقق من السيرفر 🔄</span>
            </button>

            <button
              onClick={onEnterNewLicense}
              className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>إدخال رمز ترخيص جديد 🔑</span>
            </button>
          </div>

          {/* Renewal Request (حلقة التجديد المغلقة — بدون واتساب) */}
          {!isGrace && (
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/30 p-4 space-y-3">
              {sentRequestId || alreadyPending ? (
                <div className="flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-black">تم إرسال طلب التجديد بنجاح 📩</p>
                    <p className="mt-0.5">طلبكم معلّق لدى المدير العام وسيتم التفعيل فور الاعتماد. رقم المتابعة:</p>
                    <p className="font-mono font-bold mt-1" dir="ltr">{sentRequestId || 'قيد المراجعة'}</p>
                  </div>
                </div>
              ) : showRenewForm ? (
                <form onSubmit={handleRenewal} className="space-y-2.5">
                  <p className="text-xs font-black text-indigo-900 dark:text-indigo-200">📩 طلب تجديد الاشتراك من المدير العام</p>
                  <input
                    type="tel"
                    value={renewPhone}
                    onChange={e => setRenewPhone(e.target.value)}
                    placeholder="رقم هاتف المدير (09xxxxxxxx)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <textarea
                    value={renewMsg}
                    onChange={e => setRenewMsg(e.target.value)}
                    placeholder="ملاحظة اختيارية للمدير العام..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  />
                  {renewError && <p className="text-[11px] font-bold text-rose-600">{renewError}</p>}
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSending}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSending ? 'جاري الإرسال...' : 'إرسال طلب التجديد'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRenewForm(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => { sound.playTap(); setShowRenewForm(true); }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-black shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>طلب تجديد الاشتراك من المدير العام 📩</span>
                </button>
              )}
            </div>
          )}

          {/* Super Admin Unlock link */}
          <div className="text-center pt-2">
            <button
              onClick={onOpenSuperAdmin}
              className="text-[11px] text-slate-400 hover:text-blue-500 underline font-bold transition"
            >
              دخول لوحة السوبر أدمن لإدارة التراخيص 🔒
            </button>
          </div>

        </div>

      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
