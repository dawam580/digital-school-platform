import React, { useEffect, useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { canAccessTab, ROLE_HOME, ROLE_AR_LABEL } from './services/security/roleAccess';
import { SuperAdminLockModal } from './components/common/SuperAdminLockModal';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';
import { Eye, ShieldAlert, RotateCcw } from 'lucide-react';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/auth/Login';
import { ParentSignUp } from './pages/auth/ParentSignUp';
import { LinkStudent } from './pages/auth/LinkStudent';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { AttendanceTracker } from './pages/attendance/AttendanceTracker';
import { StudentProfile } from './pages/students/StudentProfile';
import { DailyReport } from './pages/reports/DailyReport';
import { NotificationCenter } from './pages/notifications/NotificationCenter';
import { GradesPage } from './pages/grades/GradesPage';
import { AssignmentsPage } from './pages/assignments/AssignmentsPage';
import { ParentTeacherChat } from './pages/chat/ParentTeacherChat';
import { SchedulePage } from './pages/schedule/SchedulePage';
import { DatabaseStudio } from './pages/admin/DatabaseStudio';
import { SystemOperationalPlanPDF } from './pages/admin/SystemOperationalPlanPDF';
import { AccountSettingsModal } from './components/admin/AccountSettingsModal';
import { CommandPalette } from './components/ui/CommandPalette';
import { SocialCounselorDashboard } from './pages/counselor/SocialCounselorDashboard';
import { TeacherQuickDashboard } from './pages/teacher/TeacherQuickDashboard';
import { SchoolManagerModal } from './components/admin/SchoolManagerModal';
import { PdfStudentImporterModal } from './components/admin/PdfStudentImporterModal';
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { CustomCodeModal } from './components/admin/CustomCodeModal';
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';
import { ExamCoordinatorDashboard } from './pages/exams/ExamCoordinatorDashboard';
import { FreeTrialModal } from './components/trial/FreeTrialModal';
import { UpgradeModal } from './components/trial/UpgradeModal';
import { FinancePage } from './pages/finance/FinancePage';
import { StaffManagementPage } from './pages/admin/StaffManagementPage';
import { WindowsTitleBar } from './components/desktop/WindowsTitleBar';
import { LandingPage } from './pages/landing/LandingPage';

const MainContent: React.FC = () => {
  const {
    isAuthenticated,
    activeTab,
    setActiveTab,
    currentRole,
    authenticatedRole,
    isImpersonating,
    superUnlocked,
    stopImpersonating,
    enterSuperAdmin,
    exitSuperAdminGate,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    showAccountSettingsModal,
    setShowAccountSettingsModal,
    showSchoolManagerModal,
    setShowSchoolManagerModal,
    showPdfImporterModal,
    setShowPdfImporterModal,
    showCustomCodeModal,
    setShowCustomCodeModal,
    showFreeTrialModal,
    setShowFreeTrialModal,
    showUpgradeModal,
    setShowUpgradeModal
  } = useSchool();

  // ── فصل الواجهات: الدور الفعلي للعرض بعد إسقاط أي انتحال غير شرعي ──
  const superViewing = authenticatedRole === 'superadmin' && superUnlocked;
  const effectiveRole = currentRole === 'superadmin' && !superViewing ? authenticatedRole : currentRole;
  const [showGateUnlock, setShowGateUnlock] = useState(false);

  // حارس التبويبات: أي تبويب خارج نطاق الواجهة يُعاد لبيتها تلقائياً
  useEffect(() => {
    if (isAuthenticated && !canAccessTab(effectiveRole, activeTab, superViewing)) {
      setActiveTab(ROLE_HOME[effectiveRole]);
    }
  }, [effectiveRole, activeTab, superViewing, isAuthenticated, setActiveTab]);

  const safeTab = canAccessTab(effectiveRole, activeTab, superViewing) ? activeTab : ROLE_HOME[effectiveRole];

  if (activeTab === 'landing') {
    return (
      <>
        <LandingPage />
        <SchoolManagerModal
          isOpen={showSchoolManagerModal}
          onClose={() => setShowSchoolManagerModal(false)}
        />
        <FreeTrialModal
          isOpen={showFreeTrialModal}
          onClose={() => setShowFreeTrialModal(false)}
        />
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      </>
    );
  }

  // بوابة الماستر بعد إعادة التحميل: الهوية سوبر محفوظة لكن الجلسة مقفلة — لا عرض قبل الرمز
  if (isAuthenticated && authenticatedRole === 'superadmin' && !superUnlocked && activeTab !== 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-cairo text-center" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/40 mb-4">
          <ShieldAlert className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-black text-white">جلسة المدير العام مقفلة 🔒</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
          أُعيد تحميل المنظومة وجلسة الماستر انتهت حفاظاً على الأمان. أدخل رمز السوبر للمتابعة، أو ادخل كمدير مدرسة.
        </p>
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={() => setShowGateUnlock(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition active:scale-95"
          >
            إدخال رمز الماستر
          </button>
          <button
            onClick={exitSuperAdminGate}
            className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition active:scale-95 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            دخول كمدير مدرسة
          </button>
        </div>
        <SuperAdminLockModal
          isOpen={showGateUnlock}
          onClose={() => setShowGateUnlock(false)}
          onSuccess={() => { setShowGateUnlock(false); enterSuperAdmin(); }}
        />
      </div>
    );
  }

  if (!isAuthenticated && activeTab !== 'parent-signup') {
    return (
      <>
        <Login />
        <SchoolManagerModal
          isOpen={showSchoolManagerModal}
          onClose={() => setShowSchoolManagerModal(false)}
        />
        <FreeTrialModal
          isOpen={showFreeTrialModal}
          onClose={() => setShowFreeTrialModal(false)}
        />
      </>
    );
  }

  if (activeTab === 'login') {
    return (
      <>
        <Login />
        <SchoolManagerModal
          isOpen={showSchoolManagerModal}
          onClose={() => setShowSchoolManagerModal(false)}
        />
        <FreeTrialModal
          isOpen={showFreeTrialModal}
          onClose={() => setShowFreeTrialModal(false)}
        />
      </>
    );
  }

  if (activeTab === 'parent-signup') {
    return <ParentSignUp />;
  }

  const renderActivePage = () => {
    // 0. Super Admin Role: Multi-School District Directorate
    if (effectiveRole === 'superadmin') {
      return <SuperAdminDashboard />;
    }

    // Exams Coordinator Role (رئيس الكنترول)
    if (effectiveRole === 'exams_coordinator') {
      return <ExamCoordinatorDashboard />;
    }

    // 1. Parent Role: completely isolated to their children's dedicated dashboard
    if (effectiveRole === 'parent') {
      if (safeTab === 'chat') return <ParentTeacherChat />;
      return <ParentDashboard />;
    }

    // 2. Teacher Role: streamlined to TeacherQuickDashboard
    if (effectiveRole === 'teacher') {
      if (safeTab === 'chat') return <ParentTeacherChat />;
      return <TeacherQuickDashboard />;
    }

    // 3. Counselor Role
    if (effectiveRole === 'counselor') {
      return <SocialCounselorDashboard />;
    }

    // 4. Admin Role: defaults to AdminDashboard
    switch (safeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'attendance':
        return <AttendanceTracker />;
      case 'student-profile':
        return <StudentProfile />;
      case 'grades':
        return <GradesPage />;
      case 'assignments':
        return <AssignmentsPage />;
      case 'chat':
        return <ParentTeacherChat />;
      case 'schedule':
        return <SchedulePage />;
      case 'db-studio':
        return <DatabaseStudio />;
      case 'daily-report':
        return <DailyReport />;
      case 'finance':
        return <FinancePage />;
      case 'staff':
        return <StaffManagementPage />;
      case 'link-student':
        return <LinkStudent />;
      case 'notifications':
        return <NotificationCenter />;
      case 'teacher-quick':
        return <TeacherQuickDashboard />;
      case 'landing':
        return <LandingPage />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <>
      {/* شارة المعاينة: المدير العام يتصفح الكل، ومدير المدرسة يعاين قراءة فقط + زر العودة */}
      {isImpersonating && (
        <div className="sticky top-0 z-[9990] px-4 py-2 bg-amber-500 dark:bg-amber-600 text-slate-950 text-xs font-black font-cairo flex items-center justify-center gap-2 shadow-md" dir="rtl">
          <Eye className="w-4 h-4 shrink-0" />
          <span>
            وضع المعاينة (قراءة فقط) — تشاهد واجهة «{ROLE_AR_LABEL[currentRole]}» دون صلاحية التعديل أو الإرسال باسمها
          </span>
          <button
            onClick={stopImpersonating}
            className="mr-2 px-3 py-1 rounded-xl bg-slate-950 text-amber-400 text-[11px] font-black hover:bg-slate-900 transition active:scale-95 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            عودة لواجهتي
          </button>
        </div>
      )}
      <Layout>{renderActivePage()}</Layout>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
      <SystemOperationalPlanPDF />
      <AccountSettingsModal
        isOpen={showAccountSettingsModal}
        onClose={() => setShowAccountSettingsModal(false)}
      />
      <SchoolManagerModal
        isOpen={showSchoolManagerModal}
        onClose={() => setShowSchoolManagerModal(false)}
      />
      <PdfStudentImporterModal
        isOpen={showPdfImporterModal}
        onClose={() => setShowPdfImporterModal(false)}
      />
      <CustomCodeModal
        isOpen={showCustomCodeModal}
        onClose={() => setShowCustomCodeModal(false)}
      />
      <FreeTrialModal
        isOpen={showFreeTrialModal}
        onClose={() => setShowFreeTrialModal(false)}
      />
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
};

export function App() {
  return (
    <AppErrorBoundary title="تعذر تشغيل المنظومة مؤقتاً">
      <SchoolProvider>
        <AppErrorBoundary>
          <WindowsTitleBar />
          <MainContent />
        </AppErrorBoundary>
      </SchoolProvider>
    </AppErrorBoundary>
  );
}

export default App;
