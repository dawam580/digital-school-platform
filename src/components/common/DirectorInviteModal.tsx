import React, { useState } from 'react';
import {
  X,
  Copy,
  CheckCircle2,
  Share2,
  MessageSquare,
  Building2,
  Shield,
  GraduationCap,
  Users,
  ExternalLink,
  Sparkles,
  Send,
  FileSpreadsheet,
  HeartHandshake
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import {
  generateDirectorInviteMessage,
  getRoleLink,
  copyTextToClipboard,
  getWhatsAppShareUrl
} from '../../utils/inviteMessageHelper';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

interface DirectorInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectorInviteModal: React.FC<DirectorInviteModalProps> = ({ isOpen, onClose }) => {
  const { schoolProfile, showToast } = useSchool();

  const [directorName, setDirectorName] = useState('الأستاذ الفاضل مدير المدرسة');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);

  if (!isOpen) return null;

  const currentMessage = generateDirectorInviteMessage({
    directorName: directorName.trim() || 'الأستاذ الفاضل مدير المدرسة',
    schoolName: schoolProfile.name,
    phone: schoolProfile.directorPhone || '0922465676'
  });

  const handleCopyLink = async (roleKey: string, link: string) => {
    sound.playTap();
    const ok = await copyTextToClipboard(link);
    if (ok) {
      setCopiedLink(roleKey);
      showToast('success', 'تم نسخ الرابط 🔗', 'تم نسخ الرابط المباشر بنجاح إلى الحافظة.');
      setTimeout(() => setCopiedLink(null), 2000);
    }
  };

  const handleCopyAll = async () => {
    sound.playSuccess();
    const ok = await copyTextToClipboard(currentMessage);
    if (ok) {
      setIsCopiedAll(true);
      triggerConfetti();
      showToast('gold', 'تم نسخ رسالة الدعوة ✉️', 'الرسالة جاهزة الآن للصق والإرسال عبر واتساب أو الرسائل.');
      setTimeout(() => setIsCopiedAll(false), 3000);
    }
  };

  const handleWhatsAppShare = () => {
    sound.playTap();
    const url = getWhatsAppShareUrl(currentMessage);
    window.open(url, '_blank');
  };

  const roleCards = [
    {
      key: 'admin',
      title: 'رابط مدير المدرسة (لوحة التحكم العامة للمدير)',
      role: 'admin' as const,
      icon: <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      color: 'border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200',
      badge: 'المدير المستهدف للتجربة 🏛️'
    },
    {
      key: 'exams_coordinator',
      title: 'رابط منسق الامتحانات والتقويم ورئيس الكنترول',
      role: 'exams_coordinator' as const,
      icon: <FileSpreadsheet className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      color: 'border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200',
      badge: 'بوابة شيت الكنترول (1120 درجة) 📜'
    },
    {
      key: 'counselor',
      title: 'رابط الأخصائي الاجتماعي والنفسي بالمدرسة',
      role: 'counselor' as const,
      icon: <HeartHandshake className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      color: 'border-rose-200 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200',
      badge: 'متابعة السلوك والحالات 🤝'
    },
    {
      key: 'teacher',
      title: 'رابط بوابة المعلم (رصد الدرجات والحصص)',
      role: 'teacher' as const,
      icon: <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      color: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200',
      badge: 'رمز الدخول: LIB-MATH-01'
    },
    {
      key: 'superadmin',
      title: 'رابط المدير العام / السوبر أدمن (كافة المدارس)',
      role: 'superadmin' as const,
      icon: <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      color: 'border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200',
      badge: 'مراقبة التعليم وإضافة المدارس 🌐'
    },
    {
      key: 'parent',
      title: 'رابط بوابة ولي الأمر (معزول ومخصص لأولياء الأمور)',
      role: 'parent' as const,
      icon: <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
      color: 'border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200',
      badge: 'أمان مشدد • رؤية الأبناء فقط'
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-cairo">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] text-right animate-in fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20">
              ✉️
            </div>
            <div>
              <h3 className="text-base font-black">رسالة دعوة مدير المدرسة وتوزيع الروابط المنفصلة</h3>
              <p className="text-xs text-purple-200/80">
                إرسال رسالة رسمية لمدير مدرسة لاختبار وتجربة المنظومة بروابط مخصصة لكل دور
              </p>
            </div>
          </div>

          <button
            onClick={() => { onClose(); sound.playTap(); }}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Customizer: Director Name Input */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-bold text-slate-700 dark:text-slate-300 text-xs shrink-0">
              توجيه الرسالة إلى (اسم أو صفة المدير):
            </span>
            <input
              type="text"
              value={directorName}
              onChange={e => setDirectorName(e.target.value)}
              placeholder="مثال: أ. فتحي الشريف / مدير المدرسة المحترم"
              className="flex-1 w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Separate Isolated Links List ("قص الروابط") */}
          <div className="space-y-2.5">
            <h4 className="font-black text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>🔗</span>
              <span>الروابط المنفصلة لكل بوابة (قص وعزل الصلاحيات):</span>
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              {roleCards.map(c => {
                const link = getRoleLink(c.role);
                const isCopied = copiedLink === c.key;

                return (
                  <div
                    key={c.key}
                    className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition ${c.color}`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm shrink-0">
                        {c.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs truncate">{c.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                            {c.badge}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate dir-ltr text-left">
                          {link}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(c.key, link)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0 shadow-sm"
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-black">تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>نسخ الرابط</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Ready-to-Send Message Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>📝</span>
                <span>نص الرسالة الدعائية الرسمية المجهزة للإرسال:</span>
              </h4>
              <span className="text-[10px] text-slate-400">جاهزة للنسخ والمشاركة المباشرة عبر واتساب</span>
            </div>

            <div className="relative p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto select-all">
              {currentMessage}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              {isCopiedAll ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم نسخ الرسالة كاملة! 🌟</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>📋 نسخ نص الرسالة بالكامل</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
              title="إرسال مباشر عبر واتساب"
            >
              <Send className="w-4 h-4" />
              <span>واتساب 📲</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => { onClose(); sound.playTap(); }}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
