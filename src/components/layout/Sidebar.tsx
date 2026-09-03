import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Home,
  Users,
  CalendarCheck,
  FileText,
  Megaphone,
  ChevronLeft,
  FileSpreadsheet,
  UserCheck,
  Sparkles,
  Award,
  BookOpen,
  MessageSquare,
  Clock,
  Database,
  GraduationCap,
  Key,
  HeartHandshake,
  Building2
} from 'lucide-react';
import { StudentExcelManager } from '../admin/StudentExcelManager';
import { sound } from '../../utils/soundEffects';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    unreadCount,
    currentRole,
    currentTeacher,
    selectedStudent,
    setShowOperationalPlanModal,
    schoolProfile,
    setShowSchoolManagerModal
  } = useSchool();
  const [showExcelModal, setShowExcelModal] = useState(false);

  // Dedicated menu items strictly tailored per role with next-gen 360 features & DB studio
  const getRoleMenuItems = () => {
    switch (currentRole) {
      case 'counselor':
        return [
          { id: 'counselor-dashboard', label: 'مكتب الخدمة الاجتماعية', icon: HeartHandshake, badge: 'رسمي' },
          { id: 'student-profile', label: 'ملفات وسلوك الطلاب', icon: Users },
          { id: 'attendance', label: 'سجلات الغياب والمتابعة', icon: CalendarCheck },
          { id: 'chat', label: 'محادثات أولياء الأمور', icon: MessageSquare },
          { id: 'notifications', label: 'مركز التنبيهات والإشعارات', icon: Megaphone, unread: unreadCount },
        ];
      case 'parent':
        return [
          { id: 'student-profile', label: `ملف الطالب (${selectedStudent.name.split(' ')[0]})`, icon: Users },
          { id: 'grades', label: 'سجل الدرجات والشهادات', icon: Award, badge: 'رسمي' },
          { id: 'assignments', label: 'بنك الواجبات التفاعلي', icon: BookOpen, badge: 'إلكتروني' },
          { id: 'chat', label: 'المحادثة مع المعلمين', icon: MessageSquare, badge: 'مباشر' },
          { id: 'schedule', label: 'الجدول الدراسي الأسبوعي', icon: Clock },
          { id: 'daily-report', label: 'التقرير اليومي للحصص', icon: FileText },
          { id: 'notifications', label: 'مركز التنبيهات والإشعارات', icon: Megaphone, unread: unreadCount },
          { id: 'link-student', label: 'إضافة / ربط طالب آخر', icon: UserCheck },
        ];
      case 'teacher':
        return [
          { id: 'teacher-quick', label: 'الوضع السريع الميسر (كبار السن)', icon: Sparkles, badge: 'موصى به' },
          { id: 'attendance', label: 'تسجيل الحضور اليومي', icon: CalendarCheck, badge: 'اليوم' },
          { id: 'grades', label: 'رصد الدرجات وكشوفات الطلاب', icon: Award, badge: 'معتمد' },
          { id: 'assignments', label: 'إدارة وتصحيح الواجبات', icon: BookOpen },
          { id: 'chat', label: 'محادثات أولياء الأمور', icon: MessageSquare, badge: 'حي' },
          { id: 'student-profile', label: 'تقييم سلوك الطلاب والكفايات', icon: Users },
          { id: 'schedule', label: 'جدول الحصص الأسبوعي', icon: Clock },
          { id: 'daily-report', label: 'تقرير الحصص والواجبات', icon: FileText },
          { id: 'notifications', label: 'تنبيهات واستئذان الطلاب', icon: Megaphone, unread: unreadCount },
        ];
      case 'admin':
      default:
        return [
          { id: 'dashboard', label: 'لوحة تحكم الإدارة المدرسية', icon: Home },
          { id: 'school-manager', label: 'إدارة المدارس والنسخ المستقلة', icon: Building2, isCustomAction: true },
          { id: 'counselor-dashboard', label: 'مكتب الخدمة الاجتماعية والنفسية', icon: HeartHandshake, badge: 'إرشاد' },
          { id: 'db-studio', label: 'استوديو قواعد البيانات (1000+ طالب)', icon: Database, badge: 'نشط' },
          { id: 'grades', label: 'الاعتماد وسجل الدرجات العام', icon: Award },
          { id: 'excel-hub', label: 'إدارة الطلاب وملفات Excel', icon: FileSpreadsheet, isCustomAction: true },
          { id: 'schedule', label: 'جداول الحصص وتعديل المواد', icon: Clock },
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
      case 'counselor':
        return { label: 'بوابة الأخصائي الاجتماعي', color: 'bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300' };
      case 'parent':
        return { label: 'بوابة ولي الأمر (منفصلة)', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' };
      case 'teacher':
        return { label: 'بوابة المعلم ورائد الفصل', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' };
      case 'admin':
      default:
        return { label: 'بوابة الإدارة المدرسية', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <>
      <aside className="w-64 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 flex flex-col justify-between py-6 px-4 shrink-0 shadow-card hidden md:flex text-right transition-colors">
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
                      if (item.id === 'school-manager') {
                        setShowSchoolManagerModal(true);
                      } else if (item.isCustomAction) {
                        setShowExcelModal(true);
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && !isActive && (
                        <span className="text-[9px] bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-black px-1.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                          {item.badge}
                        </span>
                      )}
                      {Boolean(item.unread && item.unread > 0) && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white text-blue-900' : 'bg-red-500 text-white'
                        }`}>
                          {item.unread}
                        </span>
                      )}
                      <ChevronLeft
                        className={`w-3.5 h-3.5 transition-transform ${
                          isActive ? 'text-white' : 'text-slate-300 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Teacher Dedicated Info Widget */}
          {currentRole === 'teacher' && currentTeacher && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/40 text-right space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>{currentTeacher.name}</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed">
                المادة: <span className="font-bold">{currentTeacher.subject}</span>
              </p>
              <div className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-800 p-2 rounded-xl border border-emerald-200 dark:border-emerald-700/60">
                <span className="text-slate-500">رمز المعلم:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{currentTeacher.code}</span>
              </div>
            </div>
          )}

          {/* Admin Dedicated Widget with Plan PDF */}
          {currentRole === 'admin' && (
            <div className="bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800/40 text-right space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                <Database className="w-4 h-4 text-indigo-600" />
                <span>استوديو البيانات واختبار 1000 طالب</span>
              </div>
              <p className="text-[11px] text-indigo-800/80 dark:text-indigo-400/80 leading-relaxed">
                تحمل فائق لأكثر من 1000 طالب و 150 زيارة يومية مع سرعة استجابة &lt; 5ms.
              </p>
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => setActiveTab('db-studio')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  فتح استوديو البيانات (DB Studio)
                </button>
                <button
                  onClick={() => { setShowOperationalPlanModal(true); sound.playTap(); }}
                  className="w-full py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>وثيقة خطة التشغيل (PDF)</span>
                </button>
              </div>
            </div>
          )}

          {/* Parent Dedicated Info Widget */}
          {currentRole === 'parent' && (
            <div className="bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-100 dark:border-blue-800/40 text-right space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
                <Award className="w-4 h-4 text-amber-500" />
                <span>متابعة الطالب ({selectedStudent.name.split(' ')[0]})</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                نسبة الحضور: <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedStudent.attendanceRate}%</span> • المعدل: <span className="font-bold text-blue-700 dark:text-blue-300">{selectedStudent.academicAverage}%</span>
              </p>
            </div>
          )}

        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
          <p className="font-bold text-slate-700 dark:text-slate-300">منصة المدرسة الرقمية 360°</p>
          <p className="text-[10px]">بنية تحتية آمنة ومفصولة الصلاحيات</p>
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
