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

  const mobileNav = [
    ...(currentRole !== 'parent' ? [{ id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard }] : []),
    { id: 'grades', label: 'الدرجات', icon: Award },
    { id: 'assignments', label: 'الواجبات', icon: BookOpen },
    { id: 'chat', label: 'المحادثة', icon: MessageSquare },
    { id: 'schedule', label: 'الجدول', icon: Clock },
    { id: 'student-profile', label: 'الملف', icon: UserCheck },
    { id: 'notifications', label: 'تنبيهات', icon: Bell, badge: unreadCount },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col transition-colors">
      <Navbar />
      
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
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
    </div>
  );
};
