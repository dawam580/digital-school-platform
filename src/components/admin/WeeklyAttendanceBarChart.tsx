import React, { useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { CalendarDays, CheckCircle2, XCircle } from 'lucide-react';
import { LIBYAN_DAY_NAMES, localISODate } from '../../services/domain/libyanCalendar';

export const WeeklyAttendanceBarChart: React.FC = () => {
  const { students, isDarkMode } = useSchool();

  // أسبوع الدراسة الليبي الحالي (الأحد ← الخميس) من سجلات الحضور الفعلية فقط
  const { weeklyData, avgAttendanceRate } = useMemo(() => {
    const now = new Date();
    const sunday = new Date(now);
    sunday.setHours(0, 0, 0, 0);
    // الجمعة/السبت: نعرض الأسبوع الدراسي المنتهي للتو
    sunday.setDate(now.getDate() - now.getDay());

    let presentTotal = 0;
    let recordedTotal = 0;
    const data = LIBYAN_DAY_NAMES.slice(0, 5).map((dayName, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const key = localISODate(d);
      let present = 0;
      let absent = 0;
      for (const s of students) {
        const rec = (s.recentAttendance || []).find(r => r.date === key);
        if (!rec) continue;
        if (rec.status === 'unexcused') absent++;
        else present++;
      }
      presentTotal += present;
      recordedTotal += present + absent;
      return { day: dayName, حاضر: present, غائب: absent };
    });

    return {
      weeklyData: data,
      avgAttendanceRate: recordedTotal > 0 ? Math.round((presentTotal / recordedTotal) * 100) : null
    };
  }, [students]);

  const tickFill = isDarkMode ? '#94a3b8' : '#64748b';
  const gridStroke = isDarkMode ? '#1e293b' : '#f1f5f9';

  return (
    <div
      className="relative overflow-hidden p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-inner">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              الحضور والغياب الأسبوعي
            </h3>
            <p className="text-xs text-slate-400 font-bold">مقارنة الحضور اليومي عبر أيام الأسبوع (أحد - خميس)</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-black text-xs border border-emerald-200/60 dark:border-emerald-800/60">
          <span>{avgAttendanceRate === null ? 'لا سجلات حضور هذا الأسبوع' : `المعدل الأسبوعي: ${avgAttendanceRate}%`}</span>
        </div>
      </div>

      {/* Bar Chart (Recharts) */}
      <div className="h-56 w-full my-2" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 12, right: 10, left: -20, bottom: 0 }} barGap={6}>
            <CartesianGrid stroke={gridStroke} vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tick={{ fill: tickFill, fontSize: 11, fontWeight: 700 }}
              axisLine={{ stroke: gridStroke }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: tickFill, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl text-right" dir="rtl">
                    <p className="mb-1.5 font-black text-slate-300 border-b border-slate-700 pb-1">
                      يوم {label}
                    </p>
                    {payload.map((p, i) => (
                      <div key={i} className="flex items-center justify-between gap-4 py-0.5">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          <span>{p.name}:</span>
                        </span>
                        <span className="font-black tabular-nums">{p.value} طالب</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="حاضر"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              barSize={14}
            />
            <Bar
              dataKey="غائب"
              fill="#f43f5e"
              radius={[6, 6, 0, 0]}
              barSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Details */}
      <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
          <span>الطلاب الحاضرون</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span className="w-3 h-3 rounded-md bg-rose-500 shrink-0" />
          <span>الغياب والأعذار</span>
        </div>
      </div>
    </div>
  );
};
