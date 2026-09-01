import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Mail,
  TrendingUp,
  Clock,
  ChevronLeft,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Upload,
  Sparkles,
  Database,
  Award,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { StudentExcelManager } from '../../components/admin/StudentExcelManager';
import { exportStudentsToExcel } from '../../utils/excelHelper';
import { sound } from '../../utils/soundEffects';

export const AdminDashboard: React.FC = () => {
  const { students, unreadCount, setActiveTab, setSelectedStudent } = useSchool();
  const [showExcelModal, setShowExcelModal] = useState(false);

  // Calculated Real Metrics
  const totalStudentsCount = students.length;
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'unexcused').length;
  const attendancePercentage = totalStudentsCount > 0
    ? Math.round((presentCount / totalStudentsCount) * 100 * 10) / 10
    : 95.6;

  // 7 Days Attendance Trend Data
  const last7Days = [
    { day: 'الأربعاء', date: '26/08', rate: 94.2 },
    { day: 'الخميس', date: '27/08', rate: 96.0 },
    { day: 'الأحد', date: '30/08', rate: 93.8 },
    { day: 'الاثنين', date: '31/08', rate: 95.1 },
    { day: 'الثلاثاء (اليوم)', date: '01/09', rate: attendancePercentage || 95.6 },
  ];

  return (
    <div className="space-y-6 text-right animate-in fade-in max-w-6xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            لوحة تحكم الإدارة المدرسية 360°
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            متابعة لحظية شاملة لجميع الفصول، الدرجات، الواجبات، وقواعد البيانات
          </p>
        </div>

        {/* Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setActiveTab('db-studio'); sound.playTap(); }}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Database className="w-4 h-4" />
            <span>استوديو قواعد البيانات (SQL)</span>
          </button>

          <button
            onClick={() => { setShowExcelModal(true); sound.playTap(); }}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>مدير ملفات Excel والطلاب</span>
          </button>

          <button
            onClick={() => { exportStudentsToExcel(students); sound.playTap(); }}
            className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-card flex items-center gap-1.5 transition-all"
            title="تصدير كشف الطلاب"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 4 Horizontal Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: إجمالي الطلاب */}
        <div
          onClick={() => setShowExcelModal(true)}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-card hover:shadow-soft transition-all flex items-center justify-between cursor-pointer group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400">إجمالي الطلاب المسجلين</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-tajawal tracking-tight">
              {totalStudentsCount}
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold group-hover:underline">
              إدارة واستيراد ملفات Excel ←
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: نسبة الحضور اليوم */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-card hover:shadow-soft transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400">نسبة الحضور اليوم</span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-tajawal tracking-tight">
              {attendancePercentage}%
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              ↑ ({presentCount} حاضر من أصل {totalStudentsCount})
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: الطلاب الغائبون */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-card hover:shadow-soft transition-all flex items-center justify-between cursor-pointer group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400">الغياب بدون عذر</span>
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-tajawal tracking-tight">
              {absentCount}
            </div>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold group-hover:underline">
              متابعة سجل التحضير ←
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-800 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: الإشعارات والتعاميم */}
        <div
          onClick={() => setActiveTab('notifications')}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-card hover:shadow-soft transition-all flex items-center justify-between cursor-pointer group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400">التنبيهات والتعاميم</span>
            <div className="text-3xl font-black text-amber-500 font-tajawal tracking-tight">
              {unreadCount}
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold group-hover:underline">
              عرض مركز الإشعارات ←
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800 group-hover:scale-110 transition-transform">
            <Mail className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 7-Day Attendance Trend Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
              مؤشر انتظام الحضور الأسبوعي (آخر 7 أيام)
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400">متوسط الأسبوع: 95.1%</span>
        </div>

        <div className="grid grid-cols-5 gap-3 pt-2">
          {last7Days.map((d, index) => {
            const isToday = index === last7Days.length - 1;
            return (
              <div
                key={d.day}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  isToday
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                }`}
              >
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">{d.day}</span>
                <span className="text-[10px] text-slate-400 font-mono block">{d.date}</span>
                <div className={`text-lg font-black mt-2 font-tajawal ${isToday ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {d.rate}%
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isToday ? 'bg-blue-600' : 'bg-emerald-500'}`}
                    style={{ width: `${d.rate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Excel Manager Modal */}
      <StudentExcelManager
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
      />
    </div>
  );
};
