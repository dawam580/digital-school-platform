import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  CheckCircle2,
  Zap,
  ArrowLeft,
  BookOpen,
  Users,
  Award,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

interface TourStep {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  actionText: string;
  icon: React.ElementType;
  action: () => void;
  tip: string;
}

export const InteractiveSystemTour: React.FC = () => {
  const {
    isTourOpen,
    setIsTourOpen,
    setActiveTab,
    setCurrentRole,
    setShowPdfImporterModal
  } = useSchool();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const steps: TourStep[] = [
    {
      id: 'step-dashboard',
      title: 'لوحة القيادة المدرسية والذكاء الاصطناعي ⚡',
      badge: 'الخطوة 1: انطلاقة الإدارة',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
      description: 'قم بهذا: استورد كشوفات مدرستك في ثوانٍ معدودة باستخدام الذكاء الاصطناعي (GPT-4o) أو ملفات Excel، مع الحفاظ الكامل على التنسيق والبيانات.',
      actionText: 'جرب استيراد PDF بالذكاء الاصطناعي الآن ⚡',
      icon: Sparkles,
      action: () => {
        setActiveTab('dashboard');
        setShowPdfImporterModal(true);
        sound.playSuccess();
      },
      tip: '💡 يدعم المنهاج الوطني الليبي ويستخرج بيانات الطلاب وأرقام القيد آلياً.'
    },
    {
      id: 'step-students',
      title: 'كشوفات الطلاب والباركود الذكي (QR) 👨‍🎓',
      badge: 'الخطوة 2: شؤون الطلاب',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
      description: 'قم بهذا: تصفح سجلات 873 طالباً، وولد بطاقات التعريف الذكية مع باركود فوري يتيح لولي الأمر متابعة درجات وغياب ابنه بخصوصية تامة.',
      actionText: 'استعراض كشف الطلاب والشعب 👥',
      icon: Users,
      action: () => {
        setActiveTab('dashboard');
        sound.playTap();
      },
      tip: '💡 يمكنك تصدير كشوفات رسمية مطابقة لنماذج مراقبة التعليم بضغطة زر.'
    },
    {
      id: 'step-exams',
      title: 'الكنترول والتصحيح الإلكتروني (1120 درجة) 📝',
      badge: 'الخطوة 3: الامتحانات والتقويم',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
      description: 'قم بهذا: افتح بوابة الكنترول المركزي لرصد درجات الفترات والامتحانات النهائية، ودعم التصحيح الآلي لنماذج الإجابة البابل شيت (OMR).',
      actionText: 'الانتقال لبوابة منسق الامتحانات والكنترول 📜',
      icon: Award,
      action: () => {
        setCurrentRole('exams_coordinator');
        sound.playFanfare();
      },
      tip: '💡 حساب تلقائي للترتيب، المعدلات، والنسب المئوية مع كشوفات الأوائل.'
    },
    {
      id: 'step-finance',
      title: 'الشؤون المالية والرسوم المدرسية (د.ل) 💰',
      badge: 'الخطوة 4: الخزينة والمصروفات',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200',
      description: 'قم بهذا: راقب إيرادات الرسوم الدراسية، المصروفات التشغيلية، وسندات القبض الفورية عبر الدفع النقدي أو خدمة سداد الإلكترونية.',
      actionText: 'فتح منظومة الحسابات وسندات القبض 💳',
      icon: DollarSign,
      action: () => {
        setActiveTab('finance');
        sound.playSuccess();
      },
      tip: '💡 ربط فوري بين سداد الرسوم وبراءة الذمة لدخول امتحانات الكنترول.'
    },
    {
      id: 'step-chat',
      title: 'بوابة أولياء الأمور والتواصل المعزول 💬',
      badge: 'الخطوة 5: شراكة المدرسة والأسرة',
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200',
      description: 'قم بهذا: تواصل بأمان مع أولياء الأمور دون مشاركة أرقام الهواتف الشخصية للمعلمين، مع إرسال إخطارات الحضور والغياب اليومي.',
      actionText: 'استعراض مركز المحادثات والإخطارات 🔔',
      icon: MessageSquare,
      action: () => {
        setActiveTab('chat');
        sound.playTap();
      },
      tip: '💡 خصوصية 100% تعزل بيانات الطلاب والدرجات عن أي اطلاع غير مصرح.'
    }
  ];

  const currentStep = steps[currentStepIndex];

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isTourOpen || isMinimized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleNext();
      } else if (e.key === 'ArrowRight') {
        handlePrev();
      } else if (e.key === 'Escape') {
        setIsTourOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourOpen, isMinimized, currentStepIndex]);

  const handleNext = () => {
    sound.playTap();
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Completed the tour!
      sound.playFanfare();
      triggerConfetti();
      setIsTourOpen(false);
      setCurrentStepIndex(0);
    }
  };

  const handlePrev = () => {
    sound.playTap();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleAction = () => {
    currentStep.action();
  };

  // If tour is closed, show the floating mini launcher pill (21st.dev style)
  if (!isTourOpen) {
    return (
      <div className="fixed bottom-6 start-6 z-40 font-cairo">
        <button
          type="button"
          onClick={() => {
            setIsTourOpen(true);
            setIsMinimized(false);
            sound.playTap();
          }}
          className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 text-xs font-bold"
        >
          {/* Animated Glow Border */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 opacity-40 group-hover:opacity-100 blur-sm transition duration-300 -z-10" />
          
          <div className="relative flex items-center justify-center">
            <Compass className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <span className="font-black tracking-tight text-white">
            جولة استكشاف المنظومة (خطوة بخطوة) 🧭
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-purple-200 text-[10px] font-mono">
            60fps ✨
          </span>
        </button>
      </div>
    );
  }

  // If Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 start-6 z-50 font-cairo animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center gap-2 p-2 px-3.5 rounded-2xl bg-slate-950/90 text-white backdrop-blur-xl border border-purple-500/40 shadow-2xl text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-bold">
            جولة المنظومة: الخطوة {currentStepIndex + 1} من {steps.length}
          </span>
          <button
            type="button"
            onClick={() => { setIsMinimized(false); sound.playTap(); }}
            className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-[11px] transition active:scale-95"
          >
            متابعة الجولة 👁️
          </button>
          <button
            type="button"
            onClick={() => { setIsTourOpen(false); sound.playTap(); }}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const StepIcon = currentStep.icon;

  return (
    <div className="fixed bottom-6 start-6 z-50 font-cairo max-w-md w-full px-3 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out text-right">
      
      {/* 60fps Tactile Card Container with Glowing Glassmorphic Aura */}
      <div className="relative rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-2 border-purple-500/30 dark:border-purple-500/40 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.3)] overflow-hidden transition-all duration-300">
        
        {/* Top Progress Track (Segmented Pill) */}
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 flex">
          {steps.map((s, idx) => (
            <div
              key={s.id}
              className={`h-full flex-1 transition-all duration-500 ${
                idx <= currentStepIndex
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                  : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Card Header */}
        <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md transform transition-transform duration-300 hover:scale-110">
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${currentStep.badgeColor}`}>
                  {currentStep.badge}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  {currentStepIndex + 1} / {steps.length}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                {currentStep.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => { setIsMinimized(true); sound.playTap(); }}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition"
              title="تصغير"
            >
              _
            </button>
            <button
              type="button"
              onClick={() => { setIsTourOpen(false); sound.playTap(); }}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="إغلاق الجولة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-3.5">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {currentStep.description}
          </p>

          {/* Practical Live Action Button ("قم بهذا") */}
          <button
            type="button"
            onClick={handleAction}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black text-xs shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            <span>{currentStep.actionText}</span>
            <ArrowLeft className="w-4 h-4 transform transition-transform group-hover:-translate-x-1" />
          </button>

          {/* Quick Tip Box */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            {currentStep.tip}
          </div>
        </div>

        {/* Card Footer: Next / Prev Controls */}
        <div className="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          
          <button
            type="button"
            disabled={currentStepIndex === 0}
            onClick={handlePrev}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
              currentStepIndex === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 active:scale-95'
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>السابق</span>
          </button>

          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setCurrentStepIndex(i); sound.playTap(); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentStepIndex
                    ? 'w-6 bg-purple-600 dark:bg-purple-400'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                title={`الانتقال للخطوة ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black transition flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>{currentStepIndex === steps.length - 1 ? 'إتمام الجولة 🎉' : 'التالي'}</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

    </div>
  );
};
