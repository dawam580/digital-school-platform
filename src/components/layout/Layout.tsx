import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { TrialBanner } from '../trial/TrialBanner';
import { InteractiveSystemTour } from '../guided-tour/InteractiveSystemTour';
import { useSchool } from '../../context/SchoolContext';
import {
  LayoutDashboard,
  CalendarCheck,
  UserCheck,
  Award,
  BookOpen,
  MessageSquare,
  Clock,
  FileText,
  Bell
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { activeTab, setActiveTab, currentRole, unreadCount, schoolProfile } = useSchool();

  const getMobileNav = () => {
    switch (currentRole) {
      case 'teacher':
        return [
          { id: 'teacher-quick', label: 'الرئيسية السريعة', icon: LayoutDashboard },
          { id: 'grades', label: 'الدرجات', icon: Award },
          { id: 'chat', label: 'المحادثة', icon: MessageSquare },
          { id: 'schedule', label: 'الجدول', icon: Clock },
          { id: 'notifications', label: 'تنبيهات', icon: Bell, badge: unreadCount },
        ];
      case 'counselor':
        return [
          { id: 'counselor-dashboard', label: 'الرئيسية', icon: LayoutDashboard },
          { id: 'student-profile', label: 'الطلاب', icon: UserCheck },
          { id: 'attendance', label: 'المتابعة', icon: CalendarCheck },
          { id: 'chat', label: 'المحادثة', icon: MessageSquare },
          { id: 'notifications', label: 'تنبيهات', icon: Bell, badge: unreadCount },
        ];
      case 'parent':
        return [
          { id: 'student-profile', label: 'ملف الطالب', icon: UserCheck },
          { id: 'grades', label: 'الدرجات', icon: Award },
          { id: 'assignments', label: 'الواجبات', icon: BookOpen },
          { id: 'chat', label: 'المحادثة', icon: MessageSquare },
          { id: 'notifications', label: 'تنبيهات', icon: Bell, badge: unreadCount },
        ];
      case 'admin':
      default:
        return [
          { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
          { id: 'attendance', label: 'الحضور', icon: CalendarCheck },
          { id: 'student-profile', label: 'الطلاب', icon: UserCheck },
          { id: 'grades', label: 'الدرجات', icon: Award },
          { id: 'notifications', label: 'تنبيهات', icon: Bell, badge: unreadCount },
        ];
    }
  };

  const mobileNav = getMobileNav();

  // All roles (Parent, Teacher, Admin) have their own clean self-contained dashboards — no desktop sidebar needed
  const showSidebar = currentRole === 'counselor';

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-white flex flex-col transition-colors">
      <TrialBanner />
      <Navbar />
      
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {showSidebar && <Sidebar />}
        
        <main className={`flex-1 ${currentRole === 'parent' ? 'pb-12 p-3 sm:p-5 lg:p-7' : 'pb-28 md:pb-12 p-3 sm:p-5 lg:p-7'}`}>
          <div className="max-w-7xl mx-auto space-y-5">
            {children}
          </div>
        </main>
      </div>

      {/* Official Libyan School Platform Footer (يمنع أي انقطاع أو فراغ مشوه أسفل الشاشة) */}
      <footer className="mt-auto border-t border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md py-6 px-4 font-cairo text-right">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
              🇱🇾
            </div>
            <div>
              <p className="font-black text-slate-800 dark:text-white text-sm">
                {schoolProfile?.name || 'منظومة المدرسة الرقمية المعتمدة'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {schoolProfile?.district || 'مراقبة التربية والتعليم'} • العام الدراسي {schoolProfile?.academicYear || '2025/2026'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center text-[11px] text-slate-500 dark:text-slate-400 font-bold">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
              نظام تشغيل محلي معتمد (IndexedDB) 🛡️
            </span>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
              الإصدار v4.8 التجاري
            </span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Hidden for parent who has a self-contained WhatsApp-like UI) */}
      {currentRole !== 'parent' && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-2 shadow-lg">
          <div className="flex items-center justify-around">
            {mobileNav.map(item => {
              const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-blue-600 dark:text-blue-400' : ''}`} />
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      )}

      {/* 60fps & 21st.dev Interactive Guided Tour Overlay */}
      <InteractiveSystemTour />
    </div>
  );
};
