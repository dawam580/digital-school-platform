import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useSchool } from '../../context/SchoolContext';
import {
  LayoutDashboard,
  CalendarCheck,
  UserCheck,
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
    ...(currentRole !== 'parent' ? [{ id: 'attendance', label: 'الحضور', icon: CalendarCheck }] : []),
    { id: 'student-profile', label: 'الطالب', icon: UserCheck },
    { id: 'daily-report', label: 'التقرير', icon: FileText },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, badge: unreadCount },
  ];

  return (
    <div className="min-h-screen bg-school-background flex flex-col">
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 shadow-lg">
        <div className="flex items-center justify-around">
          {mobileNav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive ? 'text-school-primary font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-school-primary' : ''}`} />
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
