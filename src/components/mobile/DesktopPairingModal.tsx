import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Smartphone, 
  X, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  Share2, 
  Sparkles, 
  ShieldCheck,
  UserCheck,
  Download,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { Student } from '../../types';
import { sound } from '../../utils/soundEffects';

interface DesktopPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
}

export const DesktopPairingModal: React.FC<DesktopPairingModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const [copied, setCopied] = useState(false);
  const [activeMode, setActiveMode] = useState<'parent' | 'student'>('parent');

  if (!isOpen) return null;

  // Base mobile URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dawam580.github.io';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/digital-school-platform/';
  const studentCode = student?.linkCode || student?.studentNumber || student?.nationalId || 'SCH-2026-R1';
  
  // Clean direct mobile link
  const targetUrl = `${origin}${pathname}?portal=${activeMode}&code=${encodeURIComponent(studentCode)}`;
  
  // High quality QR Code API
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}&margin=10&color=0f172a`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    sound.playTap();
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappText = encodeURIComponent(
    `السلام عليكم ورحمة الله،\nرابط تطبيق الهاتف المباشر لمتابعة الطالب (${student?.name || 'ابنكم'})\nالصف: ${student?.className || 'مدرسة الباعور'}\nكود الربط المباشر: ${studentCode}\nاضغط الرابط للدخول المباشر والتثبيت:\n${targetUrl}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-white font-cairo flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">ربط وأتمتة تطبيق الهاتف (Android / PWA)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  مزامنة تلقائية ⚡
                </span>
              </div>
              <p className="text-xs text-slate-400">
                وجه كاميرا هاتف ولي الأمر أو الطالب نحو الباركود للفتح الفوري ومتابعة الدرجات والغياب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Target Mode Toggle */}
          <div className="flex items-center justify-center">
            <div className="p-1 rounded-2xl bg-slate-950 border border-white/10 flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => { setActiveMode('parent'); sound.playTap(); }}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  activeMode === 'parent'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>👨‍👩‍👧 واجهة ولي الأمر</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveMode('student'); sound.playTap(); }}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  activeMode === 'student'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🎓 واجهة الطالب</span>
              </button>
            </div>
          </div>

          {/* Student Banner */}
          {student && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-10 h-10 rounded-full object-cover border border-amber-400/40"
                />
                <div>
                  <h4 className="text-xs font-black text-white">{student.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    الفصل: <span className="text-amber-300 font-bold">{student.className}</span> | كود الربط: <span className="font-mono text-emerald-400">{studentCode}</span>
                  </p>
                </div>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block">المعدل العام</span>
                <span className="text-xs font-black text-emerald-400 font-mono">{student.academicAverage != null ? `${student.academicAverage}%` : '—'}</span>
              </div>
            </div>
          )}

          {/* QR Code and Instructions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-white/[0.02] border border-white/10 rounded-2xl p-4">
            
            {/* QR Card */}
            <div className="md:col-span-6 flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-xl border border-slate-300">
              <img
                src={qrApiUrl}
                alt="QR Code لربط تطبيق الهاتف"
                className="w-52 h-52 object-contain rounded-xl"
              />
              <div className="mt-2 text-center text-slate-800 text-[11px] font-bold flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-blue-700" />
                <span>امسح بكاميرا الهاتف أو التطبيق</span>
              </div>
            </div>

            {/* Info & Direct Share */}
            <div className="md:col-span-6 space-y-3">
              <div className="p-3 rounded-xl bg-blue-900/30 border border-blue-500/20 text-blue-200 text-xs leading-relaxed">
                ✨ <strong>أتمتة فورية:</strong> بمجرد مسح الكود بهاتف ولي الأمر أو الطالب، تُربط البيانات تلقائياً وتُحفظ دون الحاجة لتسجيل دخول أو كتابة كلمات مرور.
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 block">رابط الفتح المباشر:</label>
                <div className="p-2 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between gap-2 text-xs font-mono text-amber-300">
                  <span className="truncate text-left ltr">{targetUrl}</span>
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white shrink-0 transition"
                    title="نسخ الرابط"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow transition flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال عبر واتساب</span>
                </a>

                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                  title="فتح المعاينة في تبويب جديد"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>معاينة</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Steps */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="font-bold text-white block mb-0.5">1. افتح الكاميرا</span>
              <span>وجه كاميرا الهاتف نحو شاشة الكمبيوتر</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="font-bold text-white block mb-0.5">2. اضغط الرابط</span>
              <span>يفتح التطبيق فوراً بدون تثبيت متجر</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="font-bold text-white block mb-0.5">3. أضف للشاشة</span>
              <span>يصبح أيقونة تطبيق أندرويد مستقلة</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>اتصال مشفر وآمن ومزامنة محلية وسحابية</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
