import React from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
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
import { CustomCodeModal } from './components/admin/CustomCodeModal';

const MainContent: React.FC = () => {
  const {
    isAuthenticated,
    activeTab,
    currentRole,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    showAccountSettingsModal,
    setShowAccountSettingsModal,
    showSchoolManagerModal,
    setShowSchoolManagerModal,
    showPdfImporterModal,
    setShowPdfImporterModal,
    showCustomCodeModal,
    setShowCustomCodeModal
  } = useSchool();

  if (!isAuthenticated && activeTab !== 'parent-signup') {
    return (
      <>
        <Login />
        <SchoolManagerModal
          isOpen={showSchoolManagerModal}
          onClose={() => setShowSchoolManagerModal(false)}
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
      </>
    );
  }

  if (activeTab === 'parent-signup') {
    return <ParentSignUp />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return currentRole === 'teacher' ? <TeacherQuickDashboard /> : <AdminDashboard />;
      case 'teacher-quick':
        return <TeacherQuickDashboard />;
      case 'counselor-dashboard':
        return <SocialCounselorDashboard />;
      case 'attendance':
        return currentRole === 'teacher' ? <TeacherQuickDashboard /> : <AttendanceTracker />;
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
      case 'link-student':
        return <LinkStudent />;
      case 'notifications':
        return <NotificationCenter />;
      default:
        return currentRole === 'teacher' ? <TeacherQuickDashboard /> : <AdminDashboard />;
    }
  };

  return (
    <>
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
    </>
  );
};

export function App() {
  return (
    <SchoolProvider>
      <MainContent />
    </SchoolProvider>
  );
}

export default App;
