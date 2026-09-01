import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';
import {
  Bell,
  Search,
  Shield,
  GraduationCap,
  Users,
  LogOut,
  ChevronDown,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  Moon,
  Sun,
  Award,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { sound } from '../../utils/soundEffects';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const {
    currentRole,
    setCurrentRole,
    unreadCount,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
    students,
    selectedStudent,
    setSelectedStudent,
    setIsCommandPaletteOpen,
    soundEnabled,
    setSoundEnabled,
    isDarkMode,
    toggleDarkMode,
    logout
  } = useSchool();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showStudentMenu, setShowStudentMenu] = useState(false);

  const roles: { id: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'parent', label: 'ولي أمر', icon: <Users className="w-4 h-4" />, color: 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300' },
    { id: 'teacher', label: 'معلم', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' },
    { id: 'admin', label: 'إدارة المدرسة', icon: <Shield className="w-4 h-4" />, color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300' },
  ];

  const currentRoleInfo = roles.find(r => r.id === currentRole) || roles[0];

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) sound.playTap();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm text-right transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setActiveTab('dashboard'); sound.playTap(); }}
              className="flex items-center gap-3 group focus:outline-none"
            >
              <img
                src={logoImg}
                alt="شعار منصة المدرسة"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <div className="hidden md:block text-right">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                    منصة المدرسة الرقمية
                  </h1>
                  {/* Live Real-time Sync Indicator */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>مزامنة سحابية حية 360°</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">المنظومة الإدارية والأكاديمية الشاملة</p>
              </div>
            </button>
          </div>

          {/* Center Search Spotlight Trigger (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <button
              onClick={() => { setIsCommandPaletteOpen(true); sound.playTap(); }}
              className="w-full bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl py-2.5 pr-10 pl-4 text-xs text-slate-400 text-right flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                <span>بحث فوري عن طالب، درجة، واجب، أو محادثة (Ctrl + K)...</span>
              </div>
              <span className="font-mono text-[10px] bg-white dark:bg-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 font-bold">
                Ctrl K
              </span>
            </button>
          </div>

          {/* Right Action Tools: Dark Mode, Sound, Switcher, Role, Notifs, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Quick 360 Shortcuts */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <button
                onClick={() => { setActiveTab('grades'); sound.playTap(); }}
                className="px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition flex items-center gap-1.5"
                title="سجل الدرجات"
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>الدرجات</span>
              </button>
              <button
                onClick={() => { setActiveTab('assignments'); sound.playTap(); }}
                className="px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition flex items-center gap-1.5"
                title="الواجبات التفاعلية"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                <span>الواجبات</span>
              </button>
              <button
                onClick={() => { setActiveTab('chat'); sound.playTap(); }}
                className="px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition flex items-center gap-1.5"
                title="المحادثة المباشرة"
              >
                <MessageSquare className="w-3.5 h-3.5 text-teal-500" />
                <span>المحادثة</span>
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title={isDarkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-2xl border transition-all ${
                soundEnabled
                  ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
              title={soundEnabled ? 'كتم التأثيرات الصوتية' : 'تفعيل التأثيرات الصوتية'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Student Switcher for Parent */}
            {currentRole === 'parent' && (
              <div className="relative">
                <button
                  onClick={() => { setShowStudentMenu(!showStudentMenu); setShowRoleMenu(false); setShowNotifMenu(false); sound.playTap(); }}
                  className="flex items-center gap-2 bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100/70 border border-blue-200 dark:border-blue-800/60 px-3 py-1.5 rounded-2xl text-xs font-bold text-blue-800 dark:text-blue-300 transition-colors"
                >
                  <img
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                    className="w-6 h-6 rounded-full object-cover border border-blue-300 dark:border-blue-600"
                  />
                  <span className="max-w-[80px] sm:max-w-[100px] truncate">{selectedStudent.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {showStudentMenu && (
                  <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-700">
                      الأبناء المسجلون
                    </div>
                    {students.slice(0, 3).map(student => (
                      <button
                        key={student.id}
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowStudentMenu(false);
                          sound.playTap();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-right text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                          selectedStudent.id === student.id ? 'bg-blue-50/70 dark:bg-blue-900/40 font-bold text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={student.avatar} alt={student.name} className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <p className="leading-tight">{student.name}</p>
                            <p className="text-[10px] text-slate-400">{student.className}</p>
                          </div>
                        </div>
                        {selectedStudent.id === student.id && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => { setShowRoleMenu(!showRoleMenu); setShowNotifMenu(false); setShowStudentMenu(false); sound.playTap(); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all border ${currentRoleInfo.color} border-current/20 shadow-sm`}
                title="تبديل الدور الحالي"
              >
                {currentRoleInfo.icon}
                <span className="hidden sm:inline">{currentRoleInfo.label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {showRoleMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-700">
                    تبديل نوع الحساب (معاينة)
                  </div>
                  {roles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => {
                        setCurrentRole(role.id);
                        setShowRoleMenu(false);
                        sound.playSuccess();
                        if (role.id === 'parent') setActiveTab('student-profile');
                        else if (role.id === 'teacher') setActiveTab('attendance');
                        else setActiveTab('dashboard');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-right text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                        currentRole === role.id ? 'bg-blue-50 dark:bg-blue-900/40 font-bold text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`p-1 rounded-lg ${role.color}`}>{role.icon}</span>
                        <span>{role.label}</span>
                      </div>
                      {currentRole === role.id && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifMenu(!showNotifMenu); setShowRoleMenu(false); setShowStudentMenu(false); sound.playTap(); }}
                className="relative p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none border border-slate-200 dark:border-slate-700"
                title="الإشعارات"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 py-3 z-50">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">التنبيهات المباشرة</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                          {unreadCount} غير مقروء
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-bold"
                      >
                        قراءة الكل
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700">
                    {notifications.slice(0, 4).map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3 text-right cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                          !notif.read ? 'bg-blue-50/70 dark:bg-blue-900/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{notif.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{notif.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 px-3 border-t border-slate-100 dark:border-slate-700 text-center">
                    <button
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowNotifMenu(false);
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 w-full py-2 rounded-xl transition-colors"
                    >
                      فتح مركز الإشعارات بالكامل ←
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors border border-slate-200 dark:border-slate-700"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
