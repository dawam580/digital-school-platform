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
  Sparkles
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            لوحة تحكم الإدارة المدرسية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            متابعة لحظية شاملة لجميع الفصول، إحصائيات الحضور، وإدارة ملفات Excel
          </p>
        </div>

        {/* Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setShowExcelModal(true); sound.playTap(); }}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft flex items-center gap-1.5 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>مدير ملفات Excel والطلاب</span>
          </button>

          <button
            onClick={() => { exportStudentsToExcel(students); sound.playTap(); }}
            className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-card flex items-center gap-1.5 transition-all"
            title="تصدير كشف الطلاب"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>تصدير كشف الطلاب (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 4 Horizontal Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: إجمالي الطلاب */}
        <div
          onClick={() => setShowExcelModal(true)}
          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card hover:shadow-soft transition-all flex items-center justify-between cursor-pointer group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400">إجمالي الطلاب المسجلين</span>
            <div className="text-3xl font-black text-slate-900 font-tajawal tracking-tight">
              {totalStudentsCount}
            </div>
            <span className="text-[11px] text-blue-600 font-bold group-hover:underline">
              إدارة واستيراد ملفات Excel ←
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 text-[#00288e] border border-blue-100 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: نسبة الحضور اليوم */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card hover:shadow-soft transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400">نسبة الحضور اليوم</span>
            <div className="text-3xl font-black text-emerald-600 font-tajawal tracking-tight">
              {attendancePercentage}%
            </div>
            <span className="text-[11px] text-emerald-600 font-bold">
              ↑ ({presentCount} حاضر من أصل {totalStudentsCount})
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: عدد الغيابات اليوم */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card hover:shadow-soft transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400">عدد الغيابات اليوم</span>
            <div className="text-3xl font-black text-red-600 font-tajawal tracking-tight">
              {absentCount}
            </div>
            <span className="text-[11px] text-red-500 font-medium">
              متابعة الطلاب الغائبين ←
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: رسائل غير مقروءة */}
        <div
          onClick={() => setActiveTab('notifications')}
          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card hover:shadow-soft transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400">تنبيهات غير مقروءة</span>
            <div className="text-3xl font-black text-[#00288e] font-tajawal tracking-tight">
              {unreadCount}
            </div>
            <span className="text-[11px] text-blue-600 font-semibold hover:underline">
              عرض صندوق التنبيهات ←
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 text-[#00288e] border border-blue-100 relative">
            <Mail className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 absolute top-2 right-2 ring-2 ring-white" />
            )}
          </div>
        </div>

      </div>

      {/* Chart: 7-day Attendance Trend */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-[#00288e]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                مؤشر نسبة الحضور خلال آخر 7 أيام
              </h2>
              <p className="text-xs text-slate-400">رسم بياني يوضح معدل التزام الطلاب اليومي للمدرسة</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            المتوسط العام: 95.1%
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="h-44 sm:h-52 flex items-end justify-between gap-3 sm:gap-6 px-2">
            {last7Days.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-xs font-extrabold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity font-tajawal">
                  {item.rate}%
                </span>
                
                {/* Bar */}
                <div className="w-full max-w-[48px] bg-slate-100 rounded-2xl overflow-hidden h-full flex items-end p-1">
                  <div
                    className="w-full bg-gradient-to-t from-[#00288e] to-[#2563eb] rounded-xl transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${Math.max(10, (item.rate - 80) * 5)}%` }}
                  />
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-slate-800">{item.day}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Excel Hub Modal */}
      <StudentExcelManager
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
      />

    </div>
  );
};
