import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Sparkles,
  Clock,
  Download,
  Zap,
  ChevronDown,
  ChevronUp,
  Award,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

export const TrialBanner: React.FC = () => {
  const {
    schoolProfile,
    isTrialActive,
    trialDaysRemaining,
    trialFreeExtendsLeft,
    setShowUpgradeModal,
    extendTrialDays,
    exportSchoolPackage
  } = useSchool();

  const [isMinimized, setIsMinimized] = useState(false);

  if (!isTrialActive) return null;

  const handleOpenUpgrade = () => {
    sound.playTap();
    setShowUpgradeModal(true);
  };

  const handleQuickExtend = () => {
    if (trialFreeExtendsLeft <= 0) {
      sound.playTap();
      setShowUpgradeModal(true);
      return;
    }
    extendTrialDays(7);
  };

  return (
    <div className="w-full bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white border-b border-purple-800/60 shadow-lg px-4 py-2 font-cairo transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-right flex-wrap">
        
        {/* Left Section (RTL Start): Badge + Days Left Radial Indicator */}
        <div className="flex items-center gap-3">
          {/* Radial or Pill Countdown */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400"
                  strokeDasharray={`${Math.min(100, (trialDaysRemaining / 7) * 100)}, 100`}
                  strokeLinecap="round"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-black font-mono">
                {trialDaysRemaining}
              </span>
            </div>
            
            <div className="text-xs">
              <span className="font-black text-amber-300">
                {trialDaysRemaining > 0 ? `متبقي ${trialDaysRemaining} أيام` : 'انتهت الفترة التجريبية'}
              </span>
              <span className="text-white/70 text-[11px] block sm:inline sm:mr-1">
                في النسخة التجريبية المجانية
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-purple-200">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>كافة الأقسام مفعلة بالكامل: الامتحانات، المالية، والتصحيح الإلكتروني</span>
          </div>
        </div>

        {/* Right Section (RTL End): Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          
          <button
            type="button"
            onClick={handleQuickExtend}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5 active:scale-95"
            title={trialFreeExtendsLeft > 0 ? `تمديد مجاني واحد متبقٍ (+7 أيام)` : 'انتهت حصة التمديد المجاني — فعّل النسخة الرسمية'}
          >
            <Clock className="w-3.5 h-3.5 text-blue-300" />
            {trialFreeExtendsLeft > 0 ? (
              <>
                <span className="hidden sm:inline">طلب تمديد مجاني ⏱️ (متبقٍ {trialFreeExtendsLeft})</span>
                <span className="sm:hidden">+7 أيام</span>
              </>
            ) : (
              <span>تفعيل الرسمية 🚀</span>
            )}
          </button>

          <button
            type="button"
            onClick={exportSchoolPackage}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5 active:scale-95"
            title="تنزيل نسخة احتياطية كاملة من بياناتك التجريبية"
          >
            <Download className="w-3.5 h-3.5 text-emerald-300" />
            <span>تصدير البيانات 💾</span>
          </button>

          <button
            type="button"
            onClick={handleOpenUpgrade}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-md transition flex items-center gap-1.5 active:scale-95 animate-pulse"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>ترقية المنظومة الرسمية 🚀</span>
          </button>

        </div>

      </div>
    </div>
  );
};
