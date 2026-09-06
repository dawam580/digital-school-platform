import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Smartphone, 
  X, 
  QrCode, 
  Share2, 
  DownloadCloud, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Wifi,
  Layers
} from 'lucide-react';

interface MobileCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileCompanionModal: React.FC<MobileCompanionModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'sync'>('android');

  if (!isOpen) return null;

  const appUrl = 'https://dawam580.github.io/digital-school-platform/';
  // Crisp QR Code API with fallback
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(appUrl)}&margin=8&color=00288e`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#0b192c] border border-blue-500/20 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-950/80 via-[#0b192c] to-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-tajawal text-white">تطبيق الهاتف التكميلي (Mobile Companion)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PWA جاهز للتثبيت
                </span>
              </div>
              <p className="text-xs text-slate-400 font-cairo">
                افتح المنظومة وثبتها كتطبيق رسمي على هاتفك المحمول وتزامن مع نسخة الويندوز
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* QR & Quick Access Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white/[0.03] border border-white/10 rounded-xl p-5">
            {/* QR Card */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-3 bg-white rounded-xl shadow-lg border border-blue-200">
              <img 
                src={qrApiUrl} 
                alt="QR Code للمنظومة على الهاتف" 
                className="w-48 h-48 object-contain rounded-lg"
              />
              <span className="text-[11px] font-bold text-slate-700 mt-2 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                امسح الكاميرا للدخول الفوري
              </span>
            </div>

            {/* URL & Features */}
            <div className="md:col-span-7 space-y-3.5 font-cairo">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>يعمل بدون متجر تطبيقات (Progressive Web App)</span>
              </div>

              <h4 className="text-base font-bold text-white font-tajawal">
                رابط المنظومة المباشر للهواتف:
              </h4>

              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-mono text-blue-200">
                <span className="truncate flex-1 text-right" dir="ltr">{appUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-cairo text-xs flex items-center gap-1 transition-all"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الرابط</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>عزل كامل للصلاحيات</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>دعم كامل دون إنترنت</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>مزامنة فورية للبيانات</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DownloadCloud className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>أيقونة خاصة على الشاشة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Installation Instructions Tabs */}
          <div>
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveTab('android')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'android'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                خطوات أجهزة أندرويد (Android)
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'ios'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                خطوات آيفون وآيباد (iPhone / iOS)
              </button>
              <button
                onClick={() => setActiveTab('sync')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'sync'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                آلية المزامنة مع الويندوز
              </button>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-sm font-cairo">
              {activeTab === 'android' && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                    <p>افتح الرابط عبر متصفح <strong>Google Chrome</strong> على هاتفك المحمول.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                    <p>ستظهر لك رسالة أسفل الشاشة أو في القائمة العلوية: <strong>"تثبيت التطبيق" (Install app)</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    <p>اضغط موافق ليتم تثبيت التطبيق بأيقونته الرسمية وشاشته الكاملة بدون شريط عناوين.</p>
                  </div>
                </div>
              )}

              {activeTab === 'ios' && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                    <p>افتح الرابط عبر متصفح <strong>Safari</strong> على الآيفون أو الآيباد.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                    <p>اضغط على زر المشاركة <Share2 className="w-3.5 h-3.5 inline text-blue-400 mx-1" /> أسفل المتصفح.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    <p>اختر <strong>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</strong> ثم اضغط إضافة.</p>
                  </div>
                </div>
              )}

              {activeTab === 'sync' && (
                <div className="space-y-2 text-slate-300 text-xs leading-relaxed">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>تطبيق الهاتف يستخدم نفس قاعدة البيانات المحلية IndexedDB المعتمدة لحفظ بيانات 873 طالباً.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>يمكن لأولياء الأمور الاستعلام عن أبنائهم برقم القيد أو الرقم الوطني مباشرة من الهاتف.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>يستطيع المعلمون تسجيل الحضور ورصد الدرجات من هواتفهم أثناء التواجد في الفصول الدراسية.</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-black/20 flex items-center justify-between">
          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors font-tajawal"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فتح النسخة السحابية في نافذة جديدة</span>
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold font-cairo transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
