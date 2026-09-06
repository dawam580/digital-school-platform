import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Sparkles,
  Compass,
  Shield,
  Award,
  GraduationCap,
  Users,
  Building2,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  BookOpen,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface AttractiveUserGuideBannerProps {
  onOpenComprehensiveGuide?: () => void;
  onOpenDirectorInvite?: () => void;
  onSelectAnalyticsTab?: () => void;
}

export const AttractiveUserGuideBanner: React.FC<AttractiveUserGuideBannerProps> = ({
  onOpenComprehensiveGuide,
  onOpenDirectorInvite,
  onSelectAnalyticsTab
}) => {
  const { currentRole, setCurrentRole, setActiveTab, startTour } = useSchool();
  const [activeGuideRole, setActiveGuideRole] = useState<'admin' | 'exams' | 'teacher' | 'parent'>('admin');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const roleGuides = {
    admin: {
      title: 'بوابة مدير المدرسة (لوحة القيادة والتعداد)',
      badge: 'المدير العام للمؤسسة 🏫',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      desc: 'رؤية شاملة لتعداد المدرسة (873 طالباً موزعين على 33 فصلاً صباحياً ومسائياً)، متابعة الكادر الوظيفي والأنصبة، تصدير كشوفات الوزارة، والطباعة الرسمية.',
      actionLabel: 'استعراض تحليلات وتعداد المدرسة 📊',
      onAction: () => {
        setCurrentRole('admin');
        if (onSelectAnalyticsTab) onSelectAnalyticsTab();
        else setActiveTab('dashboard');
        sound.playSuccess();
      },
      tips: [
        'اضغط على زر (طباعة الإحصاء الرسمي) للحصول على كشف التعداد السنوي A4 جاهزاً للوزارة.',
        'يمكنك تصدير كشف الطلاب بالكامل إلى Excel بنقرة واحدة من لوحة التحكم.'
      ]
    },
    exams: {
      title: 'بوابة منسق الامتحانات والكنترول (1120 درجة)',
      badge: 'رئيس الكنترول وشيت الامتحانات 📑',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      desc: 'إدارة شيت الامتحانات الشامل وفق لائحة تنظيم شؤون التعليم والامتحانات الليبية، حساب المعدلات والترتيب العام تلقائياً، وتوليد بطاقات النتائج وإخطارات الفترات.',
      actionLabel: 'الانتقال إلى شيت الكنترول والامتحانات 📜',
      onAction: () => {
        setCurrentRole('exams_coordinator');
        setActiveTab('exams-coordinator-dashboard');
        sound.playSuccess();
      },
      tips: [
        'يقوم النظام بحساب الدرجة الصغرى لكل مادة ومواد الرسوب والدور الثاني آلياً.',
        'إمكانية طباعة كشف درجات كل طالب مع رمز QR للتحقق السريع.'
      ]
    },
    teacher: {
      title: 'بوابة المعلم (رصد الحضور والدرجات السريعة)',
      badge: 'هيئة التدريس 👨‍🏫',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      desc: 'اختر اسمك ومادتك من قائمة المعلمين بحرية، رصد الحضور والغياب اليومي للطلاب، تقييم السلوك الإيجابي (+/-)، وتسجيل درجات الأعمال الشهرية بسهولة.',
      actionLabel: 'فتح واجهة رصد درجات المعلم ⚡',
      onAction: () => {
        setCurrentRole('teacher');
        setActiveTab('teacher-quick');
        sound.playSuccess();
      },
      tips: [
        'زر (تبديل المعلم 🔄) يتيح لأي مدرس الدخول إلى حسابه ورصد مادته وفصوله فوراً.',
        'رصد الغياب يرسل إشعاراً فورياً لولي أمر الطالب عبر المنظومة.'
      ]
    },
    parent: {
      title: 'بوابة ولي الأمر (الاستعلام بخصوصية تامة)',
      badge: 'أولياء الأمور 👨‍👩‍👦',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      desc: 'بوابة منفصلة ومحمية بخصوصية تامة: يدخل ولي الأمر عبر رقم القيد أو الرقم الوطني لمتابعة درجات ابنه، جدول حصصه، وملاحظات المدرسة، دون رؤية بيانات الطلاب الآخرين.',
      actionLabel: 'تجربة بوابة استعلام ولي الأمر 🔍',
      onAction: () => {
        setCurrentRole('parent');
        setActiveTab('parent-dashboard');
        sound.playSuccess();
      },
      tips: [
        'معزولة بالكامل عن قوائم إدارة المدرسة لحماية أسرار ودرجات كافة الطلاب.',
        'يمكن لولي الأمر مسح باركود QR الخاص بابنه لفتح الشهادة مباشرة.'
      ]
    }
  };

  const currentGuide = roleGuides[activeGuideRole];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071322] via-[#0b192c] to-[#0f243e] border border-blue-500/30 text-white shadow-2xl transition-all duration-300">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 border border-blue-400/30">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base font-tajawal text-white">دليل وتوجيهات التصفح الذكي للمنظومة</h3>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                إرشادات تفاعلية ✨
              </span>
            </div>
            <p className="text-xs text-slate-300 font-cairo">
              اختر دورك الوظيفي أو الفئة التي تود استكشافها للتعرف على كيفية استخدام النظام بسهولة
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { startTour(); sound.playFanfare(); }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-95"
            title="تشغيل الجولة التفاعلية خطوة بخطوة"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden md:inline">جولة تفاعلية خطوة بخطوة</span>
          </button>

          {onOpenComprehensiveGuide && (
            <button
              onClick={onOpenComprehensiveGuide}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              title="فتح الدليل الشامل"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden lg:inline">الدليل الشامل</span>
            </button>
          )}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
            title={isMinimized ? 'توسيع الشريط' : 'تصغير الشريط'}
          >
            {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
            title="إغلاق هذا الدليل"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {!isMinimized && (
        <div className="relative z-10 p-5 space-y-4 font-cairo">
          {/* 4 Role Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => { setActiveGuideRole('admin'); sound.playTap(); }}
              className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                activeGuideRole === 'admin'
                  ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block">1. لمدير المدرسة</span>
                <span className="text-[10px] text-slate-400">التعداد والتحليلات والكادر</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveGuideRole('exams'); sound.playTap(); }}
              className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                activeGuideRole === 'exams'
                  ? 'bg-amber-600/30 border-amber-400 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block">2. للكنترول والامتحانات</span>
                <span className="text-[10px] text-slate-400">شيت 1120 درجة والبطاقات</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveGuideRole('teacher'); sound.playTap(); }}
              className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                activeGuideRole === 'teacher'
                  ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block">3. للمعلم</span>
                <span className="text-[10px] text-slate-400">رصد الحضور والدرجات فوراً</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveGuideRole('parent'); sound.playTap(); }}
              className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                activeGuideRole === 'parent'
                  ? 'bg-blue-600/30 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block">4. لولي الأمر</span>
                <span className="text-[10px] text-slate-400">استعلام برقم القيد والنتائج</span>
              </div>
            </button>
          </div>

          {/* Active Guide Card Detail */}
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentGuide.badgeColor}`}>
                  {currentGuide.badge}
                </span>
                <h4 className="text-base font-bold font-tajawal text-white">{currentGuide.title}</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentGuide.desc}
              </p>
              <div className="space-y-1.5 pt-1">
                {currentGuide.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Action Trigger */}
            <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
              <button
                onClick={currentGuide.onAction}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center gap-2"
              >
                <span>{currentGuide.actionLabel}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-slate-400">انتقال مباشر وفوري للواجهة المطلوبة</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
