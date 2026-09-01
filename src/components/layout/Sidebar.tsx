import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Home,
  Users,
  CalendarCheck,
  FileText,
  Megaphone,
  Settings,
  ChevronLeft,
  School,
  FileSpreadsheet,
  UserCheck,
  Sparkles,
  HeartPulse,
  Award
} from 'lucide-react';
import { StudentExcelManager } from '../admin/StudentExcelManager';
import { sound } from '../../utils/soundEffects';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, unreadCount, currentRole, selectedStudent } = useSchool();
  const [showExcelModal, setShowExcelModal] = useState(false);

  // Dedicated menu items strictly tailored per role
  const getRoleMenuItems = () => {
    switch (currentRole) {
      case 'parent':
        return [
          { id: 'student-profile', label: `ملف الطالب (${selectedStudent.name.split(' ')[0]})`, icon: Users },
          { id: 'daily-report', label: 'التقرير اليومي للحصص', icon: FileText, badge: 'مكتمل' },
          { id: 'notifications', label: 'مركز التنبيهات والإشعارات', icon: Megaphone, unread: unreadCount },
          { id: 'link-student', label: 'إضافة / ربط طالب آخر', icon: UserCheck },
        ];
      case 'teacher':
        return [
          { id: 'attendance', label: 'تسجيل الحضور اليومي', icon: CalendarCheck, badge: 'اليوم' },
          { id: 'student-profile', label: 'تقييم سلوك الطلاب والكفايات', icon: Sparkles },
          { id: 'daily-report', label: 'تقرير الحصص والواجبات', icon: FileText },
          { id: 'notifications', label: 'تنبيهات واستئذان الطلاب', icon: Megaphone, unread: unreadCount },
        ];
      case 'admin':
      default:
        return [
          { id: 'dashboard', label: 'لوحة تحكم الإدارة المدرسية', icon: Home },
          { id: 'excel-hub', label: 'إدارة الطلاب وملفات Excel', icon: FileSpreadsheet, isCustomAction: true },
          { id: 'attendance', label: 'متابعة سجلات الحضور الشاملة', icon: CalendarCheck },
          { id: 'student-profile', label: 'ملفات الطلاب والكفايات', icon: Users },
          { id: 'daily-report', label: 'التقارير المعتمدة والأرشيف', icon: FileText },
          { id: 'notifications', label: 'التعاميم والتنبيهات المباشرة', icon: Megaphone, unread: unreadCount },
        ];
    }
  };

  const menuItems = getRoleMenuItems();

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'parent':
        return { label: 'بوابة ولي الأمر', color: 'bg-blue-50 text-[#00288e]' };
      case 'teacher':
        return { label: 'بوابة المعلم ورائد الفصل', color: 'bg-emerald-50 text-emerald-800' };
      case 'admin':
        return { label: 'بوابة الإدارة المدرسية', color: 'bg-slate-100 text-slate-800' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <>
      <aside className="w-64 bg-white border-l border-slate-100 flex flex-col justify-between py-6 px-4 shrink-0 shadow-card hidden md:flex text-right">
        <div className="space-y-6">
          
          {/* Section Header with Role Badge */}
          <div>
            <div className="px-3 mb-3 flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                القائمة المخصصة
              </span>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border border-current/20 ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
            </div>

            <nav className="space-y-1.5">
              {menuItems.map((item: any) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sound.playTap();
                      if (item.isCustomAction) {
                        setShowExcelModal(true);
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all group ${
                      isActive
                        ? 'bg-[#00288e] text-white shadow-soft font-bold'
                        : 'text-slate-600 hover:bg-[#f8f9ff] hover:text-[#00288e]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#00288e]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && !isActive && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                          {item.badge}
                        </span>
                      )}
                      {Boolean(item.unread && item.unread > 0) && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white text-[#00288e]' : 'bg-red-500 text-white'
                        }`}>
                          {item.unread}
                        </span>
                      )}
                      <ChevronLeft
                        className={`w-4 h-4 transition-transform ${
                          isActive ? 'text-white' : 'text-slate-300 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Role specific helper widget */}
          {currentRole === 'admin' && (
            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-100 text-right space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>مركز ملفات Excel والطلاب</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                استورد بيانات الطلاب من نظام نور أو قم بتصدير الجداول بضغطة زر.
              </p>
              <button
                onClick={() => setShowExcelModal(true)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                فتح مدير ملفات Excel
              </button>
            </div>
          )}

          {currentRole === 'parent' && (
            <div className="bg-[#f0f4ff] rounded-2xl p-4 border border-blue-100 text-right space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00288e]">
                <Award className="w-4 h-4 text-amber-500" />
                <span>متابعة الطالب ({selectedStudent.name.split(' ')[0]})</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                نسبة الحضور: <span className="font-bold text-emerald-600">{selectedStudent.attendanceRate}%</span> • المعدل: <span className="font-bold text-[#00288e]">{selectedStudent.academicAverage}%</span>
              </p>
            </div>
          )}

        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          <p className="font-bold text-slate-700">منصة المدرسة الرقمية</p>
          <p className="text-[10px]">مزامنة سحابية متعددة الأجهزة</p>
        </div>
      </aside>

      {/* Excel Manager Modal */}
      <StudentExcelManager
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
      />
    </>
  );
};
