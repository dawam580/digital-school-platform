import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useRequireRole } from '../../hooks/useRequireRole';
import {
  Award,
  FileSpreadsheet,
  Users,
  Building2,
  AlertTriangle,
  BookOpen,
  LogOut,
  Sparkles,
  ChevronLeft,
  Share2,
  Lock,
  Printer
} from 'lucide-react';
import { Student } from '../../types';
import { sound } from '../../utils/soundEffects';
import { MasterControlSheet } from '../../components/exams/MasterControlSheet';
import { SecondRoundManager } from '../../components/exams/SecondRoundManager';
import { SeatingAndCommitteesManager } from '../../components/exams/SeatingAndCommitteesManager';
import { OfficialReportCardModal } from '../../components/exams/OfficialReportCardModal';
import { GoldenCertificateModal } from '../../components/exams/GoldenCertificateModal';
import { SubjectManagementModal } from '../../components/admin/SubjectManagementModal';
import { DirectorInviteModal } from '../../components/common/DirectorInviteModal';
import { StudentFullExamReport, LibyanExamEngine } from '../../services/exams/libyanExamEngine';

export const ExamCoordinatorDashboard: React.FC = () => {
  const { schoolProfile, students, showToast, addNotification, setCurrentRole, logout, isReadOnlyPreview } = useSchool();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'master_sheet' | 'seating_committees' | 'second_round'>('master_sheet');

  // Selected Class for Control Sheet
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.className) set.add(s.className.trim());
    });
    if (set.size === 0) {
      ['9/1 صباح', '9/2 صباح', '8/1 صباح', '7/1 صباح', '1/1 مساء'].forEach(c => set.add(c));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ar', { numeric: true }));
  }, [students]);

  const [selectedExamClass, setSelectedExamClass] = useState<string>(() => {
    return availableClasses[0] || '9/1 صباح';
  });

  // Modals
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);
  const [reportCardReport, setReportCardReport] = useState<StudentFullExamReport | null>(null);
  const [goldenStudent, setGoldenStudent] = useState<Student | null>(null);
  const [goldenReport, setGoldenReport] = useState<StudentFullExamReport | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Compute all class reports for batch report card printing
  const classStudents = useMemo(() => {
    return students.filter(s => (s.className || '').trim() === selectedExamClass.trim());
  }, [students, selectedExamClass]);

  const allClassReports = useMemo(() => {
    return LibyanExamEngine.calculateClassRankings(classStudents);
  }, [classStudents]);

  // Open Official Report Card Modal
  const handleOpenReportCard = (student: Student, rank: number) => {
    const found = allClassReports.find(r => r.studentId === student.id);
    const rep = found || LibyanExamEngine.calculateStudentExamReport(student);
    setReportCardStudent(student);
    setReportCardReport(rep);
  };

  // Open Golden Distinction Certificate Modal
  const handleOpenGoldenCertificate = (student: Student, rep: StudentFullExamReport) => {
    setGoldenStudent(student);
    setGoldenReport(rep);
  };

  // حارس الدور الإلزامي: هذه الشاشة لمنسق الامتحانات (والمدير/السوبر المعاينين) فقط
  const allowed = useRequireRole('exams_coordinator');
  if (!allowed) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-cairo p-3 sm:p-6 space-y-6">
      
      {/* Top Main Navigation & School Header */}
      <header className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 text-xl font-black">
            📋
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 dark:text-white">
                منظومة الكنترول وشؤون الامتحانات المدرسية
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-800">
                المنهج الليبي الرسمي
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {schoolProfile.name} • {schoolProfile.district} • {schoolProfile.academicYear}
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setShowSubjectModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>إدارة المواد وقواعد الرصد</span>
          </button>

          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition border border-indigo-200 dark:border-indigo-800"
          >
            <Share2 className="w-4 h-4" />
            <span>روابط المنظومة والدعوة</span>
          </button>

          {/* يظهر فقط للمدير أثناء معاينة بوابة الكنترول — المنسق لا يملك دخول الإدارة */}
          {isReadOnlyPreview && (
          <button
            type="button"
            onClick={() => { sound.playTap(); setCurrentRole('admin'); }}
            className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>لوحة تحكم المدير</span>
          </button>
          )}
        </div>
      </header>

      {/* Main Tabs Navigation Bar */}
      <div className="flex p-1.5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => { setActiveTab('master_sheet'); sound.playTap(); }}
          className={`flex-1 min-w-[170px] py-3 px-4 rounded-2xl font-black text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'master_sheet'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.01]'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>شيت الكنترول المجمع (الدرجات)</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('seating_committees'); sound.playTap(); }}
          className={`flex-1 min-w-[170px] py-3 px-4 rounded-2xl font-black text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'seating_committees'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.01]'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>أرقام الجلوس ولجان الامتحانات</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('second_round'); sound.playTap(); }}
          className={`flex-1 min-w-[170px] py-3 px-4 rounded-2xl font-black text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'second_round'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-[1.01]'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>امتحانات الدور الثاني (المستحقون)</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <main>
        {activeTab === 'master_sheet' && (
          <MasterControlSheet
            students={students}
            availableClasses={availableClasses}
            selectedClass={selectedExamClass}
            onSelectClass={cls => setSelectedExamClass(cls)}
            onOpenReportCard={handleOpenReportCard}
            onOpenGoldenCertificate={handleOpenGoldenCertificate}
            showToast={showToast}
            addNotification={addNotification}
          />
        )}

        {activeTab === 'seating_committees' && (
          <SeatingAndCommitteesManager
            students={students}
            availableClasses={availableClasses}
            schoolName={schoolProfile.name}
            showToast={showToast}
          />
        )}

        {activeTab === 'second_round' && (
          <SecondRoundManager
            students={students}
            availableClasses={availableClasses}
            showToast={showToast}
            onOpenReportCard={handleOpenReportCard}
          />
        )}
      </main>

      {/* ================= MODALS ================= */}

      {/* 1. Official Report Card Modal */}
      {reportCardStudent && reportCardReport && (
        <OfficialReportCardModal
          isOpen={!!reportCardStudent}
          onClose={() => { setReportCardStudent(null); setReportCardReport(null); }}
          student={reportCardStudent}
          report={reportCardReport}
          allClassReports={allClassReports}
          schoolName={schoolProfile.name}
          directorName={schoolProfile.directorName}
        />
      )}

      {/* 2. Golden Certificate Modal */}
      {goldenStudent && goldenReport && (
        <GoldenCertificateModal
          isOpen={!!goldenStudent}
          onClose={() => { setGoldenStudent(null); setGoldenReport(null); }}
          student={goldenStudent}
          report={goldenReport}
          schoolName={schoolProfile.name}
          directorName={schoolProfile.directorName}
        />
      )}

      {/* 3. Subject Management Modal */}
      <SubjectManagementModal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        showToast={showToast}
      />

      {/* 4. Director Invite Modal */}
      <DirectorInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

    </div>
  );
};
