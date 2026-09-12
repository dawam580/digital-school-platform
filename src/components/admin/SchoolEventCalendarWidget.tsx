import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface SchoolEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  venue: string;
  color: 'blue' | 'purple' | 'emerald' | 'amber';
}

const UPCOMING_EVENTS: SchoolEvent[] = [
  {
    id: 'evt-1',
    title: 'انطلاق اختبارات الفترة الأولى',
    time: '08:30 ص - 12:30 م',
    date: '18 أكتوبر 2026',
    venue: 'لجان وقاعات مدرسة الباعور',
    color: 'purple',
  },
  {
    id: 'evt-2',
    title: 'تسليم كشوفات الرصد والدرجات للكنترول',
    time: '10:00 ص',
    date: '25 أكتوبر 2026',
    venue: 'مكتب منسق الامتحانات والكنترول',
    color: 'blue',
  },
  {
    id: 'evt-3',
    title: 'لقاء أولياء الأمور وتسليم الإخطارات الفصلية',
    time: '09:00 ص - 01:00 م',
    date: '02 نوفمبر 2026',
    venue: 'مسرح المدرسة وقاعة النشاط',
    color: 'emerald',
  },
];

export const SchoolEventCalendarWidget: React.FC = () => {
  const [currentDate] = useState(new Date(2026, 8, 12)); // September 2026

  // Days of week in Arabic
  const dayNames = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  // Current month matrix (September 2026 starts on Tuesday, 30 days)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  const getEventBadge = (color: SchoolEvent['color']) => {
    switch (color) {
      case 'purple':
        return 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300';
      case 'blue':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300';
      case 'emerald':
        return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300';
      case 'amber':
      default:
        return 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300';
    }
  };

  return (
    <div
      className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-inner">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              أجندة الفعاليات والامتحانات
            </h3>
            <p className="text-xs text-slate-400 font-bold">سبتمبر / أكتوبر 2026 م</p>
          </div>
        </div>

        <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
          3 فعاليات قادمة
        </span>
      </div>

      {/* Mini Calendar Grid */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 mb-4">
        {/* Month Title */}
        <div className="flex items-center justify-between mb-2.5 text-xs font-black text-slate-800 dark:text-slate-200">
          <span>سبتمبر 2026 م</span>
          <span className="text-[10px] text-slate-400 font-bold">ربيع الأول 1448 هـ</span>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 mb-1.5">
          {dayNames.map(d => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Calendar Days (September 2026 starts on Tuesday, so 2 empty cells) */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold">
          <div />
          <div />
          {daysInMonth.map(day => {
            const isToday = day === 12;
            const hasEvent = day === 18 || day === 25;
            return (
              <div
                key={day}
                className={`py-1.5 rounded-xl transition-all ${
                  isToday
                    ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30'
                    : hasEvent
                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-black ring-1 ring-purple-400/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>المواعيد القادمة في المدرسة</span>
        </h4>
        {UPCOMING_EVENTS.map(evt => (
          <div
            key={evt.id}
            className={`p-3 rounded-2xl border-r-4 border ${getEventBadge(evt.color)} transition-all`}
          >
            <div className="flex items-center justify-between gap-2">
              <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                {evt.title}
              </h5>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                {evt.date}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{evt.time}</span>
              </span>
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="truncate">{evt.venue}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
