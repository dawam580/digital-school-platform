import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Building2,
  Copy,
  CheckCircle2,
  ExternalLink,
  Share2,
  Download,
  Sparkles,
  Phone,
  User,
  ShieldCheck,
  Send,
  BookOpen,
  Laptop
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import {
  getClientOnboardingLink,
  generateClientDeliveryWhatsAppMessage,
  getWhatsAppShareUrl,
  copyTextToClipboard,
  downloadWindowsAppLauncher,
  ClientDeliveryOptions
} from '../../utils/inviteMessageHelper';

interface ClientDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolInfo: ClientDeliveryOptions;
  onOpenPreview?: () => void;
}

export const ClientDeliveryModal: React.FC<ClientDeliveryModalProps> = ({
  isOpen,
  onClose,
  schoolInfo,
  onOpenPreview
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  if (!isOpen) return null;

  const onboardingLink = getClientOnboardingLink(
    schoolInfo.schoolCode || 'SCH-2026',
    schoolInfo.schoolName,
    schoolInfo.phone,
    schoolInfo.directorName
  );

  const fullMessage = generateClientDeliveryWhatsAppMessage(schoolInfo);
  const whatsappUrl = getWhatsAppShareUrl(fullMessage, schoolInfo.phone);

  const handleCopyLink = async () => {
    sound.playTap();
    const ok = await copyTextToClipboard(onboardingLink);
    if (ok) {
      setCopiedLink(true);
      sound.playSuccess();
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyMessage = async () => {
    sound.playTap();
    const ok = await copyTextToClipboard(fullMessage);
    if (ok) {
      setCopiedMessage(true);
      sound.playSuccess();
      setTimeout(() => setCopiedMessage(false), 2500);
    }
  };

  const handleDownloadLauncher = () => {
    sound.playSuccess();
    triggerConfetti();
    downloadWindowsAppLauncher(schoolInfo.schoolName);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xl overflow-y-auto font-cairo text-right animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg shrink-0">
              🚀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-[10px]">
                  حزمة اعتماد وتسليم المنظومة للزبون
                </span>
                <span className="text-[10px] text-blue-200">جاهزة للإرسال فوراً</span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                رابط وحزمة تفعيل مدرسة: {schoolInfo.schoolName}
              </h3>
              <p className="text-xs text-blue-200/80 mt-0.5">
                أرسل الرابط لمدير المدرسة ليقوم بتأكيد حسابه، تنزيل تطبيق ويندوز، والاطلاع على كتيب التعليمات ودليل الكادر.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { sound.playTap(); onClose(); }}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* School Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">المدرسة:</span>
              <span className="font-black text-slate-800 dark:text-slate-100 text-xs">{schoolInfo.schoolName}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">مدير المدرسة:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">{schoolInfo.directorName || 'غير محدد'}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">هاتف الدخول:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">{schoolInfo.phone || '0912345678'}</span>
            </div>
          </div>

          {/* Dedicated Client Onboarding Link Box */}
          <div className="space-y-2">
            <label className="block font-black text-slate-700 dark:text-slate-300 text-xs">
              🔗 رابط تفعيل وتشغيل المنظومة للزبون (Direct Onboarding Link):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={onboardingLink}
                className="flex-1 p-3 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 font-mono text-xs select-all outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-3 rounded-2xl font-black text-xs transition active:scale-95 flex items-center gap-1.5 shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                }`}
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* WhatsApp Share Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playTap()}
              className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 text-center"
            >
              <Send className="w-4 h-4" />
              <span>إرسال عبر واتساب 📱</span>
            </a>

            {/* Copy Full Official Invitation Text */}
            <button
              type="button"
              onClick={handleCopyMessage}
              className={`p-3.5 rounded-2xl border font-black text-xs transition active:scale-95 flex items-center justify-center gap-2 ${
                copiedMessage
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              {copiedMessage ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم نسخ الرسالة!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>نسخ نص الرسالة الرسمية</span>
                </>
              )}
            </button>

            {/* Download Windows Launcher */}
            <button
              type="button"
              onClick={handleDownloadLauncher}
              className="p-3.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-amber-400 border border-slate-700 font-black text-xs shadow transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل تطبيق ويندوز (.bat) 💻</span>
            </button>
          </div>

          {/* Preview Onboarding Experience Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <span className="text-xl shrink-0">💡</span>
            <div className="space-y-1">
              <h5 className="font-black text-amber-900 dark:text-amber-200 text-xs">
                ماذا سيشاهد الزبون عند فتح هذا الرابط؟
              </h5>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                سيفتح له نظام التفعيل المباشر المخصص لمدرسته ليقوم بتأكيد حسابه، وتنزيل تطبيق الويندوز المكتبي، وتصفح كتيب التعليمات ودليل إنشاء حسابات الكادر المدرسي (المعلمين، الكنترول، الأخصائي، وأولياء الأمور) معاً في شاشة واحدة.
              </p>
            </div>
          </div>

          {/* Message Preview Box */}
          <div>
            <span className="font-bold text-slate-500 block mb-1">معاينة الرسالة المعتمدة:</span>
            <pre className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed font-sans whitespace-pre-wrap text-slate-700 dark:text-slate-300 max-h-40 overflow-y-auto">
              {fullMessage}
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onClose();
              if (onOpenPreview) {
                onOpenPreview();
              } else {
                window.open(onboardingLink, '_blank');
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow transition active:scale-95 flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>معاينة واجهة الزبون في نافذة جديدة 👁️</span>
          </button>

          <button
            type="button"
            onClick={() => { sound.playTap(); onClose(); }}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
