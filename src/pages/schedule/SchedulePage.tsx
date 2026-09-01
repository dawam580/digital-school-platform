import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Calendar, Clock, MapPin, Printer, User } from 'lucide-react';

export const SchedulePage: React.FC = () => {
  const { schedule, selectedStudent } = useSchool();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  const currentDaySchedule = schedule[selectedDayIndex] || schedule[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-blue-800/40">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center text-3xl shadow-xl border border-blue-500/30">
              ⏰
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black">الجدول الدراسي الأسبوعي</h1>
                <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-xl border border-blue-500/30">
                  {selectedStudent.className}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                توزيع الحصص والمواد والمعلمين من الأحد إلى الخميس
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-2xl border border-white/20 transition text-xs shadow-md shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الجدول الأسبوعي</span>
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
        {schedule.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;

          return (
            <button
              key={day.dayName}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex-1 min-w-[100px] py-3 px-4 rounded-xl text-xs font-black transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {day.dayName}
            </button>
          );
        })}
      </div>

      {/* Selected Day Timeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentDaySchedule.periods.map((period) => (
          <div
            key={period.periodNumber}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center">
                #{period.periodNumber}
              </span>
              <span className="flex items-center gap-1 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                {period.time}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="text-3xl">{period.icon}</span>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">{period.subject}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{period.teacher}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>{period.room}</span>
              </span>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">45 دقيقة</span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Weekly Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="font-black text-base text-slate-900 dark:text-white">المصفوفة الأسبوعية الكاملة</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">اليوم</th>
                <th className="py-3 px-3 text-center">الحصة 1</th>
                <th className="py-3 px-3 text-center">الحصة 2</th>
                <th className="py-3 px-3 text-center">الحصة 3</th>
                <th className="py-3 px-3 text-center">الحصة 4</th>
                <th className="py-3 px-3 text-center">الحصة 5</th>
                <th className="py-3 px-3 text-center">الحصة 6</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {schedule.map((d) => (
                <tr key={d.dayName} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/20">{d.dayName}</td>
                  {d.periods.map((p) => (
                    <td key={p.periodNumber} className="py-3.5 px-3 text-center">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{p.subject}</div>
                      <div className="text-[10px] text-slate-400">{p.room}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
