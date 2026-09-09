import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  X,
  Sparkles,
  Check,
  Zap,
  Phone,
  MessageCircle,
  Download,
  Clock,
  ShieldCheck,
  Building2,
  Users,
  Award,
  CreditCard
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const {
    schoolProfile,
    extendTrialDays,
    trialFreeExtendsLeft,
    exportSchoolPackage,
    trialDaysRemaining
  } = useSchool();

  if (!isOpen) return null;

  const handleExtend = () => {
    // لا تمديد مجاني بعد الاستهلاك — الزر يتحول لطلب تفعيل رسمي عبر واتساب (يستجيب دائماً)
    if (trialFreeExtendsLeft <= 0) {
      sound.playTap();
      window.open(whatsappActivationUrl, '_blank', 'noopener');
      return;
    }
    const ok = extendTrialDays(7);
    if (ok) onClose();
  };

  const handleExport = () => {
    sound.playTap();
    exportSchoolPackage();
  };

  const whatsappMessage = encodeURIComponent(
    `السلام عليكم، أود تفعيل النسخة الرسمية لمنظومة المدرسة الرقمية.\nاسم المدرسة: ${schoolProfile.name}\nالمدينة: ${schoolProfile.city || schoolProfile.district}\nرقم الهاتف: ${schoolProfile.directorPhone}`
  );

  const whatsappActivationUrl = `https://wa.me/218922465676?text=${whatsappMessage}%0A%D8%B7%D9%84%D8%A8%20%D8%AA%D9%81%D8%B9%D9%8A%D9%84%20%D8%B1%D8%B3%D9%85%D9%8A`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-cairo">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col my-auto text-right">
        
        {/* Top Gradient Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black mb-3">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>الترقية إلى الترخيص المعتمد الرسمي 🇱🇾</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                باقات ترخيص منظومة {schoolProfile.name}
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-2xl">
                احصل على تفعيل دائم، دعم فني ليبي متخصص، وتحديثات مجانية مستمرة مع استمرار كافة بياناتك الحالية بدون أي انقطاع.
              </p>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Plan 1: Semester */}
            <div className="rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                  اشتراك الفصل الدراسي
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  باقة الفصل الدراسي ⚡
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">1,200</span>
                  <span className="text-xs font-bold text-slate-500">دينار ليبي / للفصل الواحد</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">مرونة الدفع الفصلي بكامل المميزات</p>

                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>سجلات الحضور والغياب اليومي الذكي</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>رصد الدرجات وشيت الكنترول وكشوفات الطلاب</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>بوابة أولياء الأمور وشهادات الطلاب</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>دعم فني عبر الواتساب طيلة الفصل</span>
                  </li>
                </ul>
              </div>

              <a
                href={`https://wa.me/218922465676?text=${whatsappMessage}%0A%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D8%B5%D9%84%20%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs text-center transition block"
              >
                اختيار اشتراك الفصل
              </a>
            </div>

            {/* Plan 2: Annual (Most Popular) */}
            <div className="rounded-3xl p-5 border-2 border-purple-600 bg-purple-50/40 dark:bg-purple-950/30 flex flex-col justify-between space-y-4 relative shadow-xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-black shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" />
                <span>الأكثر طلباً — وفّر 400 دينار</span>
              </div>

              <div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block pt-1">
                  اشتراك العام الدراسي الكامل
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  الباقة السنوية المعتمدة 🌟
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-purple-700 dark:text-purple-300 font-mono">2,000</span>
                  <span className="text-xs font-bold text-slate-500">دينار ليبي / للسنة الكاملة</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">ترخيص سنوي معتمد بكود فريد لمدرستك</p>

                <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="font-bold">كافة مميزات اشتراك الفصل وزيادة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="font-bold">محرك التصحيح الإلكتروني والكنترول</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="font-bold">منظومة الرسوم والمالية والمصروفات</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>استوديو قواعد البيانات والاستيراد الذكي</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>تحديثات مجانية طيلة العام الدراسي</span>
                  </li>
                </ul>
              </div>

              <a
                href={`https://wa.me/218922465676?text=${whatsappMessage}%0A%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D8%B9%D8%A7%D9%85%20%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs text-center shadow-lg transition block active:scale-95"
              >
                تفعيل الاشتراك السنوي 🚀
              </a>
            </div>

            {/* Plan 3: Enterprise / International */}
            <div className="rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                  المجمعات والمدارس الدولية
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  باقة المجمعات الدولية 🏛️
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">4,500</span>
                  <span className="text-xs font-bold text-slate-500">دينار ليبي / سنوياً</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">عدد طلاب غير محدود + فروع متعددة</p>

                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>كافة مزايا الباقة الذكية</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>لوحة المدير العام للمجمعات (Super Admin)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>ربط بوابات الدفع الإلكتروني (سداد / تداول)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>تدريب مباشر لكادر المدرسة في مقرك</span>
                  </li>
                </ul>
              </div>

              <a
                href={`https://wa.me/218922465676?text=${whatsappMessage}%0A%D8%A8%D8%A7%D9%82%D8%A9%20%D8%A7%D9%84%D9%85%D8%AC%D9%85%D8%B9%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AF%D9%88%D9%84%D9%8A%D8%A9`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs text-center transition block"
              >
                اختيار باقة المجمعات
              </a>
            </div>

          </div>

          {/* Retention & Direct Contact Strip */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-0.5">
              <span className="text-xs font-black text-amber-900 dark:text-amber-200 block">
                انتهت الفترة التجريبية؟ ⏱️
              </span>
              <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                اطلب التفعيل الرسمي عبر واتساب ليصلك مفتاح الترخيص، أو نزّل نسخة احتياطية من بياناتك أولاً.
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExtend}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs font-black transition flex items-center gap-1.5 active:scale-95"
                title="يفتح واتساب برسالة طلب تفعيل جاهزة فيها اسم مدرستك"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>طلب التفعيل الرسمي 🚀</span>
              </button>

              <button
                type="button"
                onClick={handleExport}
                title="ينزّل ملفاً واحداً فيه كل بيانات مدرستك (طلاب، درجات، حضور) — احتفظ به في مكان آمن"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل نسخة احتياطية من بيانات مدرستك 💾</span>
              </button>
            </div>
          </div>

          {/* Footer Direct Contact Phone */}
          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-purple-600" />
              <span>هاتف قسم المبيعات والاعتماد: <strong className="font-mono text-slate-800 dark:text-white">0922465676</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ترخيص معتمد رسمي من مراقبات التربية والتعليم الليبية</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
