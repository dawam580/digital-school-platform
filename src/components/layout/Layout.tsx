import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
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
  const { activeTab, setActiveTab, currentRole, unreadCount } = useSchool();

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col transition-colors">
      <Navbar />
      
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {showSidebar && <Sidebar />}
        
        <main className={`flex-1 overflow-y-auto ${currentRole === 'parent' ? 'pb-8 p-3 sm:p-5 lg:p-7' : 'pb-24 md:pb-8 p-3 sm:p-5 lg:p-7'}`}>
          <div className="max-w-7xl mx-auto space-y-5">
            {children}
          </div>
        </main>
      </div>

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
    </div>
  );
};
