import React, { useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Users, User, Heart, Sparkles } from 'lucide-react';
import { Student } from '../../types';

export function inferStudentGender(student: Student): 'male' | 'female' {
  if (student.gender === 'male' || student.gender === 'female') {
    return student.gender;
  }
  const nat = student.nationalNumber || student.nationalId || '';
  if (nat.startsWith('1')) return 'male';
  if (nat.startsWith('2')) return 'female';

  // Common Arabic female name endings if national number is unavailable
  const firstName = (student.name || '').trim().split(' ')[0] || '';
  const femaleEndings = ['ة', 'اء', 'ى', 'ام', 'ار'];
  if (
    firstName.endsWith('ة') ||
    firstName.endsWith('ى') ||
    ['فاطمة', 'عائشة', 'مريم', 'خديجة', 'سارة', 'زينب', 'هدى', 'نور', 'ريان', 'آية', 'إسراء', 'شيماء', 'روان'].includes(firstName)
  ) {
    return 'female';
  }
  return 'male';
}

export const StudentDemographicsChart: React.FC = () => {
  const { students, isDarkMode } = useSchool();

  const { malesCount, femalesCount, malePercent, femalePercent, total } = useMemo(() => {
    let m = 0;
    let f = 0;
    students.forEach(s => {
      if (inferStudentGender(s) === 'female') {
        f++;
      } else {
        m++;
      }
    });
    const tot = students.length || 1;
    return {
      malesCount: m,
      femalesCount: f,
      malePercent: Math.round((m / tot) * 100),
      femalePercent: Math.round((f / tot) * 100),
      total: students.length,
    };
  }, [students]);

  const chartData = [
    { name: 'بنين (ذكور)', value: malesCount, color: '#0284c7' },
    { name: 'بنات (إناث)', value: femalesCount, color: '#ec4899' },
  ];

  return (
    <div
      className="relative overflow-hidden p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shadow-inner">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>التوزيع الديموغرافي للطلاب</span>
            </h3>
            <p className="text-xs text-slate-400 font-bold">نسبة البنين والبنات المسجلين رسمياً</p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black border border-slate-200/60 dark:border-slate-700">
          {total} طالب
        </span>
      </div>

      {/* Donut Chart with Center Count */}
      <div className="relative h-52 w-full my-2 flex items-center justify-center" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={84}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map(entry => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0];
                return (
                  <div className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl text-right" dir="rtl">
                    <p className="opacity-80">{d.name}</p>
                    <p className="text-base font-black tabular-nums">{d.value} طالب</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
            {total}
          </span>
          <span className="text-[10px] font-bold text-slate-400">إجمالي الكشف</span>
        </div>
      </div>

      {/* Footer Indicators - Inspired by Lama Dev CountChart */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {/* Boys Card */}
        <div className="p-3 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/30">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-slate-900 dark:text-white">بنين</span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold tabular-nums">({malePercent}%)</span>
            </div>
            <p className="text-sm font-black text-sky-700 dark:text-sky-300 tabular-nums leading-none mt-0.5">
              {malesCount.toLocaleString('ar-LY')}
            </p>
          </div>
        </div>

        {/* Girls Card */}
        <div className="p-3 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-pink-500/30">
            <Heart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-slate-900 dark:text-white">بنات</span>
              <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold tabular-nums">({femalePercent}%)</span>
            </div>
            <p className="text-sm font-black text-pink-700 dark:text-pink-300 tabular-nums leading-none mt-0.5">
              {femalesCount.toLocaleString('ar-LY')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
