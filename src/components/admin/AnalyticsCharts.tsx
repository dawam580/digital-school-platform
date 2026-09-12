import React, { useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ChartPie, BarChart3, Users } from 'lucide-react';
import { StudentDemographicsChart } from './StudentDemographicsChart';
import { WeeklyAttendanceBarChart } from './WeeklyAttendanceBarChart';
import { SchoolAnnouncementsWidget } from './SchoolAnnouncementsWidget';
import { SchoolEventCalendarWidget } from './SchoolEventCalendarWidget';

/**
 * AnalyticsCharts — لوحة التحليلات البيانية الموسعة للمدير (مستوحاة من Lama School Dashboard).
 * كل الأرقام من بيانات الطلاب الحية: لا قيم ثابتة، لا تقديرات صامتة.
 * الرسوم للقراءة فقط (آمنة في وضع المعاينة).
 */

const ATTENDANCE_COLORS = ['#059669', '#d97706', '#2563eb', '#e11d48'];
const GRADE_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#e11d48', '#94a3b8'];

function gradeBucket(avg: number | null | undefined): string {
  if (avg == null) return 'بانتظار الرصد';
  if (avg >= 85) return 'ممتاز';
  if (avg >= 75) return 'جيد جداً';
  if (avg >= 65) return 'جيد';
  if (avg >= 50) return 'مقبول';
  return 'ضعيف';
}

const cardClass =
  'relative overflow-hidden p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between';

const ChartTooltip: React.FC<{ active?: boolean; payload?: Array<{ name?: string; value?: number | string }>; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xl text-right" dir="rtl">
      {label && <p className="mb-1 opacity-80">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="tabular-nums">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export const AnalyticsCharts: React.FC = () => {
  const { students, isDarkMode } = useSchool();

  const attendance = useMemo(() => {
    const present = students.filter(s => s.status === 'present').length;
    const late = students.filter(s => s.status === 'late').length;
    const excused = students.filter(s => s.status === 'excused').length;
    const unexcused = students.filter(s => s.status === 'unexcused').length;
    return [
      { name: 'حاضر', value: present },
      { name: 'متأخر', value: late },
      { name: 'إذن رسمي', value: excused },
      { name: 'غائب', value: unexcused },
    ];
  }, [students]);

  const grades = useMemo(() => {
    const order = ['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'ضعيف', 'بانتظار الرصد'];
    const counts: Record<string, number> = Object.fromEntries(order.map(k => [k, 0]));
    students.forEach(s => {
      counts[gradeBucket(s.academicAverage)] += 1;
    });
    return order.map(name => ({ name, value: counts[name] }));
  }, [students]);

  const topClasses = useMemo(() => {
    const map = new Map<string, number>();
    students.forEach(s => {
      const c = (s.className || 'غير مصنف').trim();
      map.set(c, (map.get(c) || 0) + 1);
    });
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [students]);

  const tickFill = isDarkMode ? '#94a3b8' : '#64748b';
  const gridStroke = isDarkMode ? '#1e293b' : '#f1f5f9';

  if (students.length === 0) {
    return (
      <div className={cardClass}>
        <p className="text-sm font-bold text-slate-500 text-center py-8">لا توجد بيانات لعرض التحليلات بعد.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* الصف الأول: الرسوم الديموغرافية والحضور المزدوج (Lama UI Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. مخطط نسبة البنين والبنات الديموغرافي */}
        <StudentDemographicsChart />

        {/* 2. مخطط الحضور الأسبوعي للأيام الليبية */}
        <WeeklyAttendanceBarChart />

        {/* 3. توزيع الحضور اليومي المباشر */}
        <div className={cardClass}>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shadow-inner">
              <ChartPie className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">حالة الحضور اللحظية</h3>
              <p className="text-xs text-slate-400 font-bold">توزيع الحضور المباشر اليوم • {students.length} طالب</p>
            </div>
          </div>
          <div dir="ltr" className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendance} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3} strokeWidth={0}>
                  {attendance.map((entry, i) => (
                    <Cell key={entry.name} fill={ATTENDANCE_COLORS[i % ATTENDANCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            {attendance.map((a, i) => (
              <div key={a.name} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ATTENDANCE_COLORS[i % ATTENDANCE_COLORS.length] }} />
                <span>{a.name}</span>
                <span className="tabular-nums text-slate-900 dark:text-white mr-auto font-black">{a.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* الصف الثاني: التقديرات الأكاديمية وكثافة الفصول */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* توزيع التقديرات العامة */}
        <div className={cardClass}>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shadow-inner">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">التقديرات الأكاديمية العامة</h3>
              <p className="text-xs text-slate-400 font-bold">توزيع المعدلات التراكمية الحقيقية لطلاب المدرسة</p>
            </div>
          </div>
          <div dir="ltr" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grades} margin={{ top: 14, right: 10, left: -14, bottom: 0 }}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: tickFill, fontSize: 11, fontWeight: 700 }} interval={0} angle={-14} dy={8} height={46} />
                <YAxis tick={{ fill: tickFill, fontSize: 11 }} allowDecimals={false} width={34} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }} />
                <Bar dataKey="value" radius={[8, 8, 2, 2]}>
                  {grades.map((g, i) => (
                    <Cell key={g.name} fill={GRADE_COLORS[i % GRADE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* أكبر الفصول */}
        <div className={cardClass}>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">أكبر 8 فصول كثافة</h3>
              <p className="text-xs text-slate-400 font-bold">الكثافة الطلابية وتوزيع القاعات في مدرسة الباعور</p>
            </div>
          </div>
          <div dir="ltr" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topClasses} layout="vertical" margin={{ top: 6, right: 12, left: 12, bottom: 0 }}>
                <CartesianGrid stroke={gridStroke} horizontal={false} />
                <XAxis type="number" tick={{ fill: tickFill, fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: tickFill, fontSize: 11, fontWeight: 700 }} width={76} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }} />
                <Bar dataKey="value" fill="#4f46e5" radius={[2, 8, 8, 2]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* الصف الثالث: لوحة التعاميم والأجندة المدرسية (Lama Right Panel Components) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SchoolAnnouncementsWidget />
        <SchoolEventCalendarWidget />
      </div>
    </div>
  );
};
