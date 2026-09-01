import React, { useState } from 'react';
import { Student, BehaviorPoint } from '../../types';
import { Sparkles, X, PlusCircle, MinusCircle, CheckCircle2, Award } from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

interface BehaviorPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onAward: (point: BehaviorPoint) => void;
}

export const BehaviorPointsModal: React.FC<BehaviorPointsModalProps> = ({
  isOpen,
  onClose,
  student,
  onAward,
}) => {
  if (!isOpen) return null;

  const [activeType, setActiveType] = useState<'positive' | 'needs_work'>('positive');
  const [awardedSuccess, setAwardedSuccess] = useState<string | null>(null);

  const positiveBadges = [
    { title: 'مشاركة صفية وتفاعل متميز', points: 5, icon: '🌟' },
    { title: 'إتقان وحل الواجب المنزلي', points: 4, icon: '📚' },
    { title: 'العمل الجماعي ومساعدة الزملاء', points: 3, icon: '🤝' },
    { title: 'انضباط وهدوء نموذجي', points: 3, icon: '⭐' },
    { title: 'إبداع وفكرة مبتكرة', points: 5, icon: '💡' },
    { title: 'المحافظة على نظافة الفصل', points: 2, icon: '🌿' },
  ];

  const needsWorkBadges = [
    { title: 'تأخر عن الحصة أو الطابور', points: -1, icon: '⏰' },
    { title: 'عدم إحضار الكتاب أو الأدوات', points: -1, icon: '📖' },
    { title: 'قلة تركيز أثناء الشرح', points: -1, icon: '💭' },
    { title: 'عدم تسليم الواجب في وقته', points: -2, icon: '📝' },
  ];

  const handleSelectBadge = (badge: { title: string; points: number; icon: string }) => {
    const newPoint: BehaviorPoint = {
      id: `bp-${Date.now()}`,
      category: activeType,
      title: badge.title,
      points: badge.points,
      icon: badge.icon,
      date: 'اليوم ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      teacher: 'أ. أحمد الغامدي (رائد الفصل)'
    };

    if (activeType === 'positive') {
      sound.playSuccess();
      triggerConfetti();
    } else {
      sound.playAlert();
    }

    setAwardedSuccess(badge.title);
    onAward(newPoint);

    setTimeout(() => {
      setAwardedSuccess(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Student Info Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <img
            src={student.avatar}
            alt={student.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
          />
          <div className="space-y-0.5">
            <h3 className="text-lg font-extrabold text-slate-900">{student.name}</h3>
            <p className="text-xs text-slate-500">{student.grade} • مجموع النقاط: <span className="font-bold text-[#00288e]">{student.behaviorPointsTotal} نقطة</span></p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveType('positive')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeType === 'positive'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>نقاط التميز الإيجابي (+)</span>
          </button>
          <button
            onClick={() => setActiveType('needs_work')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeType === 'needs_work'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MinusCircle className="w-4 h-4" />
            <span>مجالات تحتاج تحسين (-)</span>
          </button>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
          {(activeType === 'positive' ? positiveBadges : needsWorkBadges).map((b, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectBadge(b)}
              className={`p-3.5 rounded-2xl border text-right transition-all flex items-start gap-3 group active:scale-95 ${
                activeType === 'positive'
                  ? 'bg-emerald-50/40 hover:bg-emerald-100/60 border-emerald-100 text-emerald-900'
                  : 'bg-red-50/40 hover:bg-red-100/60 border-red-100 text-red-900'
              }`}
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">{b.icon}</span>
              <div className="space-y-0.5">
                <p className="text-xs font-bold leading-tight">{b.title}</p>
                <span className={`text-[11px] font-black font-tajawal ${
                  activeType === 'positive' ? 'text-emerald-700' : 'text-red-600'
                }`}>
                  {b.points > 0 ? `+${b.points}` : b.points} نقطة
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Feedback Success Toast */}
        {awardedSuccess && (
          <div className="p-3 bg-emerald-500 text-white rounded-2xl text-center text-xs font-bold flex items-center justify-center gap-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم منح {awardedSuccess} بنجاح!</span>
          </div>
        )}

      </div>
    </div>
  );
};
