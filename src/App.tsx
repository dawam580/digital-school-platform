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
import { CommandPalette } from './components/ui/CommandPalette';

const MainContent: React.FC = () => {
  const { isAuthenticated, activeTab, isCommandPaletteOpen, setIsCommandPaletteOpen } = useSchool();

  if (!isAuthenticated && activeTab !== 'parent-signup') {
    return <Login />;
  }

  if (activeTab === 'login') {
    return <Login />;
  }

  if (activeTab === 'parent-signup') {
    return <ParentSignUp />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
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
      case 'daily-report':
        return <DailyReport />;
      case 'link-student':
        return <LinkStudent />;
      case 'notifications':
        return <NotificationCenter />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <>
      <Layout>{renderActivePage()}</Layout>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
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
