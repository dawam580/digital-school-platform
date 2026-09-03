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
  BookOpen,
  FileText,
  Key,
  HeartHandshake,
  Building2,
  Tag,
  HelpCircle
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { sound } from '../../utils/soundEffects';
import { QuickSystemGuideModal } from '../common/QuickSystemGuideModal';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const {
    currentRole,
    setCurrentRole,
    currentTeacher,
    unreadCount,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
    setShowOperationalPlanModal,
    setShowAccountSettingsModal,
    schoolProfile,
    setShowSchoolManagerModal,
    setShowPdfImporterModal,
    setShowCustomCodeModal,
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
  const [showGuideModal, setShowGuideModal] = useState(false);

  const roles: { id: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'admin', label: 'إدارة المدرسة', icon: <Shield className="w-4 h-4" />, color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300' },
    { id: 'teacher', label: 'المعلم', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' },
    { id: 'counselor', label: 'الأخصائي الاجتماعي', icon: <HeartHandshake className="w-4 h-4" />, color: 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300' },
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
              onClick={() => { setActiveTab(currentRole === 'parent' ? 'student-profile' : 'dashboard'); sound.playTap(); }}
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
                    {schoolProfile.name}
                  </h1>
                  {/* Libyan Badge */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>ليبيا {schoolProfile.academicYear}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">{schoolProfile.district} • النظام المعتمد</p>
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
            
            {/* Multi-School Manager Button (Visible for Admin) */}
            {currentRole === 'admin' && (
              <button
                onClick={() => { setShowSchoolManagerModal(true); sound.playTap(); }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm hover:bg-blue-100 transition-all active:scale-95"
                title="إدارة المدارس والنسخ المستقلة"
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>المدارس والنسخ المستقلة 🏫</span>
              </button>
            )}

            {/* Teacher Quick Mode Toggle (If Teacher) */}
            {currentRole === 'teacher' && (
              <button
                onClick={() => { setActiveTab('teacher-quick'); sound.playTap(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-sm hover:bg-emerald-100 transition-all active:scale-95"
                title="الواجهة الميسرة لكبار السن"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>الوضع الميسر لكبار السن ⚡</span>
              </button>
            )}

            {/* Operational Plan PDF Button (Visible for Admin & Teacher) */}
            {currentRole !== 'parent' && (
              <button
                onClick={() => { setShowOperationalPlanModal(true); sound.playTap(); }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm hover:bg-amber-100 transition-all"
                title="عرض خطة التشغيل الشاملة PDF"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>خطة التشغيل (PDF)</span>
              </button>
            )}

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

            {/* Student Switcher for Parent Portal */}
            {currentRole === 'parent' && (
              <div className="relative">
                <button
                  onClick={() => { setShowStudentMenu(!showStudentMenu); setShowNotifMenu(false); sound.playTap(); }}
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
                      الأبناء المسجلون بحسابك
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

            {/* Teacher Code Badge (When logged in as Teacher) */}
            {currentRole === 'teacher' && currentTeacher && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">{currentTeacher.name}</span>
                <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg text-[10px] border border-emerald-300 dark:border-emerald-700 font-bold">
                  {currentTeacher.code}
                </span>
              </div>
            )}

            {/* Counselor Badge (When logged in as Counselor) */}
            {currentRole === 'counselor' && (
              <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-3 py-1.5 rounded-2xl text-xs font-bold text-teal-800 dark:text-teal-300">
                <HeartHandshake className="w-4 h-4 text-teal-600" />
                <span className="hidden sm:inline">أ. نجوى القماطي (الأخصائي الاجتماعي)</span>
                <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg text-[10px] border border-teal-300 dark:border-teal-700 font-bold">
                  LIB-SOC-01
                </span>
              </div>
            )}

            {/* Admin Supervisory Switcher (Only visible to Admin) */}
            {currentRole === 'admin' && (
              <div className="relative">
                <button
                  onClick={() => { setShowRoleMenu(!showRoleMenu); setShowNotifMenu(false); setShowStudentMenu(false); sound.playTap(); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all border ${currentRoleInfo.color} border-current/20 shadow-sm`}
                  title="الإشراف وتبديل العرض"
                >
                  {currentRoleInfo.icon}
                  <span className="hidden sm:inline">{currentRoleInfo.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {showRoleMenu && (
                  <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-700">
                      الإشراف الإداري المتبادل
                    </div>
                    {roles.map(role => (
                      <button
                        key={role.id}
                        onClick={() => {
                          setCurrentRole(role.id);
                          setShowRoleMenu(false);
                          sound.playSuccess();
                          if (role.id === 'teacher') setActiveTab('attendance');
                          else if (role.id === 'counselor') setActiveTab('counselor-dashboard');
                          else setActiveTab('dashboard');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-right text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                          currentRole === role.id ? 'bg-purple-50 dark:bg-purple-900/40 font-bold text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded-lg ${role.color}`}>{role.icon}</span>
                          <span>{role.label}</span>
                        </div>
                        {currentRole === role.id && <Check className="w-4 h-4 text-purple-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notification Bell with Fixed Complete Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifMenu(!showNotifMenu); setShowRoleMenu(false); setShowStudentMenu(false); sound.playTap(); }}
                className="relative p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none border border-slate-200 dark:border-slate-700"
                title="الإشعارات والتنبيهات"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Complete Responsive Floating Notification Dropdown */}
              {showNotifMenu && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[92vw] sm:w-[420px] max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 py-3 z-[9999] animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-800 dark:text-white">مركز التنبيهات المباشرة</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          {unreadCount} جديد
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                      >
                        تحديد الكل كمقروء
                      </button>
                    )}
                  </div>

                  {/* Scrollable Notification List without truncation */}
                  <div className="max-h-[65vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 p-2 space-y-1">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        لا توجد إشعارات جديدة حالياً
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-3 rounded-2xl text-right cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors ${
                            !notif.read ? 'bg-blue-50/80 dark:bg-blue-900/40 border-r-4 border-blue-600' : 'bg-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</p>
                            <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed whitespace-normal break-words">
                            {notif.message}
                          </p>
                          {notif.studentName && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded-md">
                              الطالب: {notif.studentName}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 px-3 border-t border-slate-100 dark:border-slate-700 text-center">
                    <button
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowNotifMenu(false);
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 w-full py-2 rounded-xl transition-colors"
                    >
                      عرض جميع الإشعارات في صفحة كاملة ←
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 1-Click PDF Student Importer Shortcut */}
            <button
              onClick={() => { setShowPdfImporterModal(true); sound.playTap(); }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 transition-colors border border-teal-200 dark:border-teal-800 text-xs font-bold"
              title="استيراد كشف درجات وبيانات الطلبة من ملف PDF"
            >
              <FileText className="w-4 h-4 text-teal-600" />
              <span>استيراد PDF</span>
            </button>

            {/* 1-Click Custom Code Shortcut (for teachers) */}
            {currentRole === 'teacher' && (
              <button
                onClick={() => { setShowCustomCodeModal(true); sound.playTap(); }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 transition-colors border border-amber-300 dark:border-amber-800 text-xs font-bold"
                title="تخصيص رمز المعلم الخاص بي"
              >
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>تخصيص رمزي</span>
              </button>
            )}

            {/* Account Settings Button (Change Phone / Password / Teacher Code) */}
            <button
              onClick={() => { setShowAccountSettingsModal(true); sound.playTap(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 transition-colors border border-slate-200 dark:border-slate-700 text-xs font-bold"
              title="إعدادات الحساب وتعديل الرقم وكلمة المرور"
            >
              <Key className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">إعدادات الحساب</span>
            </button>

            {/* Quick System Guide Button */}
            <button
              onClick={() => { setShowGuideModal(true); sound.playTap(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 transition-colors border border-indigo-200 dark:border-indigo-800 text-xs font-black shadow-sm"
              title="دليل المنظومة السريع الموضح بالخطوات"
            >
              <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>دليل المنظومة 💡</span>
            </button>

            {/* Back / Logout Button (Prominent & Clear) */}
            <button
              onClick={() => { logout(); sound.playTap(); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-black text-xs border border-rose-200 dark:border-rose-800/60 shadow-sm transition-all active:scale-95"
              title="الرجوع إلى شاشة الدخول الرئيسية"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>⬅️ رجوع (خروج)</span>
            </button>

          </div>

        </div>
      </div>

      {/* Quick System Guide Modal */}
      <QuickSystemGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </header>
  );
};
