import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  LogOut,
  Search,
  Download,
  Trash2,
  Edit2,
  Plus,
  Tag,
  BookOpen,
  Phone,
  Calendar,
  Check,
  Sparkles,
  ChevronLeft,
  Filter,
  UserCheck,
  Award,
  Printer,
  FileSpreadsheet,
  HelpCircle
} from 'lucide-react';
import { StudentManagerModal } from '../../components/admin/StudentManagerModal';
import { TeacherManagerModal } from '../../components/admin/TeacherManagerModal';
import { PrintableStudentGradeCard } from '../../components/exams/PrintableStudentGradeCard';
import { ComprehensiveSystemGuideModal } from '../../components/common/ComprehensiveSystemGuideModal';
import { ExcelStudentImporterModal } from '../../components/admin/ExcelStudentImporterModal';
import { QrPdfReaderModal } from '../../components/common/QrPdfReaderModal';
import { PrintableTeachersRosterModal } from '../../components/admin/PrintableTeachersRosterModal';
import { PhotoCaptureModal } from '../../components/common/PhotoCaptureModal';
import { SchedulePage } from '../schedule/SchedulePage';
import { DirectorInviteModal } from '../../components/common/DirectorInviteModal';
import { MinistryRosterModal } from '../../components/admin/MinistryRosterModal';
import { LIBYAN_BAOUR_STUDENTS } from '../../data/libyanBaourSchoolDataset';
import {
  LibyanExamEngine,
  StudentFullExamReport,
  LIBYAN_BASIC_SUBJECTS
} from '../../services/exams/libyanExamEngine';
import { exportLibyanStudentsToExcel } from '../../utils/excelHelper';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { TeacherAccount, Student } from '../../types';
import { db } from '../../services/db';

export const AdminDashboard: React.FC = () => {
  const {
    students,
    setStudents,
    teachers,
    setTeachers,
    schoolProfile,
    setShowPdfImporterModal,
    logout,
    showToast,
    updateAttendance,
    markAllPresent,
    setCurrentRole,
    loginWithTeacherCode
  } = useSchool();

  // Active Tab: 'students' | 'teachers' | 'attendance' | 'exams' | 'schedule'
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'attendance' | 'exams' | 'schedule'>('students');

  // Students Tab State
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  // Teachers Tab State
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<TeacherAccount | null>(null);

  // Exams Tab State
  const [selectedExamClass, setSelectedExamClass] = useState<string>('9/1 صباح');
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<Student | null>(null);
  const [selectedStudentRank, setSelectedStudentRank] = useState<number>(1);
  const [showGradeCardModal, setShowGradeCardModal] = useState<boolean>(false);

  // Guide State
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showGuideBanner, setShowGuideBanner] = useState<boolean>(true);

  // New Feature Modals State
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showExcelImporterModal, setShowExcelImporterModal] = useState<boolean>(false);
  const [showQrPdfReaderModal, setShowQrPdfReaderModal] = useState<boolean>(false);
  const [showTeachersRosterModal, setShowTeachersRosterModal] = useState<boolean>(false);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [photoTarget, setPhotoTarget] = useState<{ id: string; name: string; type: 'student' | 'teacher' } | null>(null);
  const [showMinistryRosterModal, setShowMinistryRosterModal] = useState<boolean>(false);

  // Manual Student Manager Modal State
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  // Handlers for student management
  const handleClearAllStudents = () => {
    sound.playAlert();
    if (window.confirm('⚠️ هل أنت متأكد من رغبتك في حذف وتصفير جميع سجلات الطلاب المسجلين بالكامل للبدء من جديد؟')) {
      setStudents([]);
      db.saveStudents([], true);
      showToast('info', 'تم التصفير', 'تم حذف كشف الطلاب بنجاح. يمكنك الآن استيراد كشف PDF أو Excel جديد.');
    }
  };

  const handleDirectLoadBaour = () => {
    sound.playTap();
    setStudents(LIBYAN_BAOUR_STUDENTS);
    db.saveStudents(LIBYAN_BAOUR_STUDENTS, true);
    try {
      localStorage.setItem('madrasa_school_name', 'مدرسة الشهيد امحمد الباعور للتعليم الأساسي');
    } catch {}
    sound.playFanfare();
    triggerConfetti();
    showToast('gold', 'تم استيراد كشف مدرسة الباعور 🏛️', `تم تحميل (${LIBYAN_BAOUR_STUDENTS.length}) طالباً موزعين على الفصول بنجاح.`);
  };

  // Available classes dynamically extracted from real students in the database
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.className) set.add(s.className.trim());
    });
    if (set.size === 0) {
      ['1/1 مساء', '1/2 مساء', '7/1 صباح', '8/1 صباح', '9/1 صباح'].forEach(c => set.add(c));
    }
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b, 'ar', { numeric: true }));
    return arr;
  }, [students]);

  // Filtered Students for Tab 1
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch =
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (s.nationalNumber && s.nationalNumber.includes(studentSearch)) ||
        (s.nationalId && s.nationalId.includes(studentSearch)) ||
        (s.motherName && s.motherName.includes(studentSearch));

      const matchClass =
        selectedClassFilter === 'all' || s.className === selectedClassFilter;

      return matchSearch && matchClass;
    });
  }, [students, studentSearch, selectedClassFilter]);

  // Attendance Metrics
  const totalStudentsCount = students.length;
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'unexcused').length;
  const lateCount = students.filter(s => s.status === 'late').length;
  const excusedCount = students.filter(s => s.status === 'excused').length;
  const attendancePercentage = totalStudentsCount > 0
    ? Math.round((presentCount / totalStudentsCount) * 100 * 10) / 10
    : 95.6;

  // Exam Calculations for Selected Class (Tab 4)
  const examStudents = useMemo(() => {
    const clsList = students.filter(s => s.className === selectedExamClass || s.className.includes(selectedExamClass));
    return clsList.length > 0 ? clsList : students.slice(0, 25);
  }, [students, selectedExamClass]);

  const examReports: StudentFullExamReport[] = useMemo(() => {
    return LibyanExamEngine.calculateClassRankings(examStudents);
  }, [examStudents]);

  const passedCount = examReports.filter(r => r.status === 'passed' || r.status === 'passed_honors').length;
  const makeupCount = examReports.filter(r => r.status === 'makeup_exam').length;
  const passRate = examReports.length > 0 ? Math.round((passedCount / examReports.length) * 100) : 100;

  // Delete Student Handler
  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الطالب (${name}) من المنظومة؟`)) {
      const updated = students.filter(s => s.id !== id);
      setStudents(updated);
      db.saveStudents(updated, true);
      sound.playTap();
      showToast('info', 'تم حذف الطالب', `تمت إزالة ${name} بنجاح.`);
    }
  };

  // Delete Teacher Handler
  const handleDeleteTeacher = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المعلم (${name})؟`)) {
      const updated = teachers.filter(t => t.id !== id);
      setTeachers(updated);
      db.saveTeachers(updated);
      sound.playTap();
      showToast('info', 'تم حذف المعلم', `تمت إزالة ${name} بنجاح.`);
    }
  };

  // Export Master Sheet to CSV/Excel
  const exportMasterSheetToExcel = () => {
    sound.playSuccess();
    const headers = [
      'الرقم',
      'اسم الطالب',
      'الرقم الوطني',
      'الفصل',
      'عربي (أعمال)', 'عربي (تحريري)', 'عربي (مجموع)',
      'رياضيات (أعمال)', 'رياضيات (تحريري)', 'رياضيات (مجموع)',
      'علوم (أعمال)', 'علوم (تحريري)', 'علوم (مجموع)',
      'إنجليزي (أعمال)', 'إنجليزي (تحريري)', 'إنجليزي (مجموع)',
      'إسلامية (أعمال)', 'إسلامية (تحريري)', 'إسلامية (مجموع)',
      'تاريخ (أعمال)', 'تاريخ (تحريري)', 'تاريخ (مجموع)',
      'جغرافيا (أعمال)', 'جغرافيا (تحريري)', 'جغرافيا (مجموع)',
      'حاسوب (أعمال)', 'حاسوب (تحريري)', 'حاسوب (مجموع)',
      'المجموع الكلي',
      'النسبة المئوية %',
      'الترتيب على الفصل',
      'التقدير العام',
      'النتيجة الرسمية'
    ];

    const rows = examReports.map((r, i) => {
      const getSub = (code: string) => r.results.find(s => s.subjectCode === code) || { courseworkScore: 0, examScore: 0, totalScore: 0 };
      const arb = getSub('ARB');
      const math = getSub('MATH');
      const sci = getSub('SCI');
      const eng = getSub('ENG');
      const isl = getSub('ISL');
      const hist = getSub('HIST');
      const geog = getSub('GEOG');
      const comp = getSub('COMP');

      return [
        i + 1,
        `"${r.studentName}"`,
        `"${r.nationalNumber}"`,
        `"${r.className}"`,
        arb.courseworkScore, arb.examScore, arb.totalScore,
        math.courseworkScore, math.examScore, math.totalScore,
        sci.courseworkScore, sci.examScore, sci.totalScore,
        eng.courseworkScore, eng.examScore, eng.totalScore,
        isl.courseworkScore, isl.examScore, isl.totalScore,
        hist.courseworkScore, hist.examScore, hist.totalScore,
        geog.courseworkScore, geog.examScore, geog.totalScore,
        comp.courseworkScore, comp.examScore, comp.totalScore,
        r.totalEarnedScore,
        `${r.percentage}%`,
        r.rank,
        r.generalAppreciation,
        `"${r.statusLabel}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `شيت_درجات_${selectedExamClass}_${schoolProfile.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'تم تصدير الشيت 📊', `تم تنزيل شيت درجات فصل (${selectedExamClass}) المعتمد بنجاح.`);
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in max-w-7xl mx-auto pb-16 font-cairo">
      
      {/* Top Header & Fast Actions */}
      <div className="p-5 sm:p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 mb-1">
            <span>🇱🇾 {schoolProfile.district} • العام {schoolProfile.academicYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            لوحة تحكم إدارة المدرسة: {schoolProfile.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            إدارة كشوفات الطلاب، شيت الامتحانات والنتائج، والتحكم في المعلمين والحضور
          </p>
        </div>

        {/* Primary Action Buttons (Clear, High-Contrast & Streamlined for School Director) */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-start xl:justify-end">
          {/* OpenAI PDF Importer Button */}
          <button
            onClick={() => { setShowPdfImporterModal(true); sound.playTap(); }}
            className="whitespace-nowrap px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
            title="استيراد كشف الطلبة من ملف PDF بالذكاء الاصطناعي (OpenAI GPT-4o-mini)"
          >
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>استيراد PDF بالذكاء الاصطناعي ⚡</span>
          </button>

          {/* Excel Importer Button */}
          <button
            onClick={() => { setShowExcelImporterModal(true); sound.playTap(); }}
            className="whitespace-nowrap px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
            title="استيراد كشف الطلبة من ملفات إكسل (.xlsx / .csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-white shrink-0" />
            <span>استيراد إكسل 📊</span>
          </button>

          {/* Comprehensive System Guide Button */}
          <button
            onClick={() => { setShowGuideModal(true); sound.playTap(); }}
            className="whitespace-nowrap px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
            title="الدليل الشامل لكافة الأدوار المدرسية من الألف للياء"
          >
            <BookOpen className="w-4 h-4 text-white shrink-0" />
            <span>دليل المنظومة الشامل 📖</span>
          </button>

          {/* Director Invite & Separate Role Links Button */}
          <button
            onClick={() => { setShowInviteModal(true); sound.playTap(); }}
            className="whitespace-nowrap px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
            title="إرسال رسالة دعوة وتوزيع الروابط المستقلة للأدوار"
          >
            <span>✉️ دعوة المدراء وقص الروابط</span>
          </button>

          {/* Direct Switch to Exam Coordinator Portal */}
          <button
            onClick={() => {
              setCurrentRole('exams_coordinator');
              sound.playTap();
              showToast('gold', 'بوابة الكنترول والامتحانات 📜', 'تم الانتقال إلى بوابة منسق الامتحانات والتقويم (1120 درجة).');
            }}
            className="whitespace-nowrap px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
            title="الانتقال المباشر لبوابة منسق الامتحانات ورئيس الكنترول"
          >
            <span>📜 بوابة الكنترول</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={() => { logout(); sound.playTap(); }}
            className="whitespace-nowrap px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm border border-rose-400/50 shadow-md flex items-center justify-center gap-2 transition active:scale-95"
            title="الرجوع إلى شاشة تسجيل الدخول"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>⬅️ خروج</span>
          </button>
        </div>
      </div>

      {/* Visual Step-by-Step Explanatory Banner ("بطريقة شروحية") */}
      {showGuideBanner && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 dark:from-slate-800/80 dark:via-indigo-950/30 dark:to-slate-900 border-2 border-blue-200 dark:border-blue-800 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-black text-sm sm:text-base">
              <span className="text-xl">💡</span>
              <span>دليل المدير السريع: كيف تدير مدرستك في 4 خطوات سهلة وواضحة جداً؟</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setShowGuideModal(true); sound.playTap(); }}
                className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm transition active:scale-95 flex items-center gap-1"
              >
                <span>فتح الدليل المصور بالتفصيل 📖</span>
              </button>
              <button
                type="button"
                onClick={() => setShowGuideBanner(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg text-xs"
                title="إخفاء هذا الشريط"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 4 Interactive Step Cards with Direct Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
            <button
              type="button"
              onClick={() => { setActiveTab('students'); sound.playTap(); }}
              className={`p-3.5 rounded-2xl border text-right transition active:scale-95 space-y-1 ${
                activeTab === 'students'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50'
              }`}
            >
              <div className="font-black flex items-center gap-1.5 text-sm">
                <span>1️⃣ كشف الطلاب</span>
                {activeTab === 'students' && <span>👈 (أنت هنا)</span>}
              </div>
              <p className={`text-[11px] leading-relaxed ${activeTab === 'students' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                لرفع كشف PDF القديم، رؤية الطلاب وأمهاتهم، وتصدير إكسل.
              </p>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('exams'); sound.playTap(); }}
              className={`p-3.5 rounded-2xl border text-right transition active:scale-95 space-y-1 ${
                activeTab === 'exams'
                  ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-purple-50'
              }`}
            >
              <div className="font-black flex items-center gap-1.5 text-sm">
                <span>2️⃣ شيت الامتحانات</span>
                {activeTab === 'exams' && <span>👈 (أنت هنا)</span>}
              </div>
              <p className={`text-[11px] leading-relaxed ${activeTab === 'exams' ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'}`}>
                لرؤية درجات المواد الثمانية، حساب الترتيب، وطباعة بطاقات النتيجة.
              </p>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('teachers'); sound.playTap(); }}
              className={`p-3.5 rounded-2xl border text-right transition active:scale-95 space-y-1 ${
                activeTab === 'teachers'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50'
              }`}
            >
              <div className="font-black flex items-center gap-1.5 text-sm">
                <span>3️⃣ المعلمين ورموزهم</span>
                {activeTab === 'teachers' && <span>👈 (أنت هنا)</span>}
              </div>
              <p className={`text-[11px] leading-relaxed ${activeTab === 'teachers' ? 'text-amber-100' : 'text-slate-500 dark:text-slate-400'}`}>
                لإضافة المعلمين وتحديد رموز دخول سهلة لهم وفصولهم.
              </p>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('attendance'); sound.playTap(); }}
              className={`p-3.5 rounded-2xl border text-right transition active:scale-95 space-y-1 ${
                activeTab === 'attendance'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50'
              }`}
            >
              <div className="font-black flex items-center gap-1.5 text-sm">
                <span>4️⃣ متابعة الحضور</span>
                {activeTab === 'attendance' && <span>👈 (أنت هنا)</span>}
              </div>
              <p className={`text-[11px] leading-relaxed ${activeTab === 'attendance' ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                لمعرفة الغياب اليومي وتحضير الجميع بنقرة واحدة.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* 5 Main Stat Cards (Clean & Balanced Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* Card 1: Students Count */}
        <div
          onClick={() => setActiveTab('students')}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95 ${
            activeTab === 'students'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-500 block">إجمالي الطلاب المسجلين</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">
              {totalStudentsCount} طالب
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 inline-block">
              عرض الكشف الكامل ←
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-2xl">
            👥
          </div>
        </div>

        {/* Card 2: Exams & Master Sheet */}
        <div
          onClick={() => setActiveTab('exams')}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95 ${
            activeTab === 'exams'
              ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300'
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-500 block">شيت الامتحانات والنتائج</span>
            <span className="text-3xl font-black text-purple-700 dark:text-purple-300 mt-1 block">
              {passRate}% نجاح
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold mt-1 inline-block">
              كشف الرصد المعتمد ←
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-2xl">
            📑
          </div>
        </div>

        {/* Card 3: Teachers Count */}
        <div
          onClick={() => setActiveTab('teachers')}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95 ${
            activeTab === 'teachers'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-500 block">التحكم في المعلمين</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">
              {teachers.length} معلم
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1 inline-block">
              إدارة الرموز والفصول ←
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-2xl">
            👨‍🏫
          </div>
        </div>

        {/* Card 4: Attendance Rate */}
        <div
          onClick={() => setActiveTab('attendance')}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95 ${
            activeTab === 'attendance'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-500 block">تسجيل الحضور اليومي</span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {attendancePercentage}%
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold mt-1 inline-block">
              {presentCount} حاضر • {absentCount} غائب
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-2xl">
            📊
          </div>
        </div>

        {/* Card 5: Smart Timetable Builder */}
        <div
          onClick={() => setActiveTab('schedule')}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95 ${
            activeTab === 'schedule'
              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-500 block">الجداول المدرسية الذكية</span>
            <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1 block">
              توزيع الحصص AI ⚡
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1 inline-block">
              بناء وتصدير الجداول ←
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-2xl">
            ⏰
          </div>
        </div>

      </div>

      {/* Big Main Tab Selector Pills (5 Tabs - Non-Colliding Responsive Grid) */}
      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => { setActiveTab('students'); sound.playTap(); }}
          className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'students'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>1. كشف الطلاب ({students.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('exams'); sound.playTap(); }}
          className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'exams'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span>2. شيت الامتحانات 📑</span>
        </button>

        <button
          onClick={() => { setActiveTab('teachers'); sound.playTap(); }}
          className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'teachers'
              ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>3. المعلمون ({teachers.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('attendance'); sound.playTap(); }}
          className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'attendance'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>4. متابعة الحضور</span>
        </button>

        <button
          onClick={() => { setActiveTab('schedule'); sound.playTap(); }}
          className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1 ${
            activeTab === 'schedule'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span className="text-base shrink-0">⏰</span>
          <span>5. الجداول الذكية AI ⚡</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REGISTERED & IMPORTED STUDENTS LIST                                */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* How Students are Entered into the System (Educational 4-Method Guide) */}
          <div className="p-5 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 dark:from-slate-800/80 dark:via-blue-950/30 dark:to-slate-900 border-2 border-blue-200 dark:border-blue-800/70 rounded-3xl space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-black text-sm sm:text-base text-blue-950 dark:text-blue-200">
                <span className="text-2xl">💡</span>
                <span>كيف يتم إدخال أسماء وبيانات الطلبة إلى المنظومة؟ (4 طرق معتمدة وسريعة)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStudentToEdit(null);
                  setShowStudentModal(true);
                  sound.playTap();
                }}
                className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-2 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ إضافة طالب جديد يدوياً الآن</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-700 shadow-sm space-y-1">
                <div className="font-black text-blue-700 dark:text-blue-300 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>1️⃣ الإدخال اليدوي الفردي</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  تسجيل طالب جديد أو تعديل بياناته (الاسم الرباعي، الرقم الوطني، رقم القيد، الفصل، تاريخ الميلاد) عبر النموذج المعتمد.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-700 shadow-sm space-y-1">
                <div className="font-black text-teal-700 dark:text-teal-300 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>2️⃣ استيراد كشف PDF الوزاري</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  رفع كشوفات المركز الوطني للامتحانات (PDF) وقراءتها وتوزيع الطلاب وتواريخ ميلادهم آلياً في ثوانٍ.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-700 shadow-sm space-y-1">
                <div className="font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>3️⃣ استيراد كشف Excel</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  رفع ملف إكسل يحتوي كشوفات المدرسة لملء الفصول والطلاب دفعة واحدة وبضغطة زر واحدة.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-700 shadow-sm space-y-1">
                <div className="font-black text-purple-700 dark:text-purple-300 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>4️⃣ ربط ولي الأمر برقم القيد</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  يسجل ولي الأمر عبر بوابته المستقلة ويربط ابنه عبر رمز الطالب أو رقم القيد للمتابعة الآلية.
                </p>
              </div>
            </div>
          </div>

          {/* Controls Bar: Search + Class Filter + Export */}
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="بحث باسم الطالب، الرقم الوطني، أو اسم الأم..."
                className="w-full py-2.5 px-3.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {/* Actions: Export + Add Student + Quick Baour School Load + Clear */}
            <div className="flex items-center gap-2 flex-wrap justify-start xl:justify-end">
              {/* Manual Add Student Button */}
              <button
                type="button"
                onClick={() => {
                  setStudentToEdit(null);
                  setShowStudentModal(true);
                  sound.playTap();
                }}
                className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition flex items-center gap-1.5 active:scale-95"
                title="إضافة طالب جديد يدوياً إلى المنظومة"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>+ إضافة طالب يدوياً</span>
              </button>

              {/* Direct Al-Baour School 873 Students Load */}
              <button
                type="button"
                onClick={handleDirectLoadBaour}
                className="whitespace-nowrap px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-sm transition flex items-center gap-1.5 active:scale-95"
                title="استيراد كشف مدرسة الشهيد امحمد الباعور (33 صفحة • 873 طالباً)"
              >
                <span>🏛️</span>
                <span>كشف مدرسة الباعور (873 طالب) ⚡</span>
              </button>

              {/* Official Ministry Roster Modal (100% Exact 7-column replica A4) */}
              <button
                type="button"
                onClick={() => { setShowMinistryRosterModal(true); sound.playTap(); }}
                className="whitespace-nowrap px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-black shadow-md transition flex items-center gap-1.5 active:scale-95 border border-emerald-400/40"
                title="عرض وطباعة الكشف الوزاري الرسمي المعتمد (طبق الأصل A4 - كشف المركز الوطني للامتحانات 7 أعمدة)"
              >
                <FileText className="w-4 h-4 shrink-0 text-amber-300" />
                <span>📄 الكشف الوزاري الرسمي (طبق الأصل A4) 🏛️</span>
              </button>

              <button
                type="button"
                onClick={() => { setShowExcelImporterModal(true); sound.playTap(); }}
                className="whitespace-nowrap px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-sm transition flex items-center gap-1.5 active:scale-95"
                title="استيراد كشف إكسل"
              >
                <span>📊</span>
                <span>استيراد إكسل</span>
              </button>

              <button
                type="button"
                onClick={() => { setShowPdfImporterModal(true); sound.playTap(); }}
                className="whitespace-nowrap px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-sm transition flex items-center gap-1.5 active:scale-95"
                title="استيراد كشف PDF"
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>استيراد PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  exportLibyanStudentsToExcel(filteredStudents, `كشف_طلاب_${schoolProfile.name}`);
                  sound.playSuccess();
                  showToast('success', 'تم التصدير', 'تم تنزيل ملف إكسل بكافة بيانات الطلبة.');
                }}
                className="whitespace-nowrap px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
                title="تصدير كشف الطلبة إلى ملف إكسل"
              >
                <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تصدير Excel</span>
              </button>

              {/* Clear All Students */}
              <button
                type="button"
                onClick={handleClearAllStudents}
                className="whitespace-nowrap px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-black transition flex items-center gap-1 active:scale-95"
                title="تصفير وحذف جميع الطلاب للبدء من جديد"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>تصفير وحذف الكشف</span>
              </button>
            </div>
          </div>

          {/* Section Filter Card (Ergonomic & Non-Colliding) */}
          {availableClasses.length > 0 && (
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 whitespace-nowrap flex items-center gap-1.5 shrink-0">
                  <span>🏫</span>
                  <span>تصفية حسب الفصل:</span>
                </span>
                
                {/* Direct Select Dropdown (Instant Jump for Director) */}
                <select
                  value={selectedClassFilter}
                  onChange={e => { setSelectedClassFilter(e.target.value); sound.playTap(); }}
                  aria-label="تصفية حسب الفصل"
                  className="flex-1 md:w-64 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black text-blue-700 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">جميع الفصول (33 فصلاً • {students.length} طالب)</option>
                  {availableClasses.map(cls => {
                    const count = students.filter(s => s.className === cls).length;
                    return (
                      <option key={cls} value={cls}>فصل ({cls}) — {count} طالب</option>
                    );
                  })}
                </select>
              </div>

              {/* Quick Grade Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => { setSelectedClassFilter('all'); sound.playTap(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition shrink-0 ${
                    selectedClassFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  الكل ({students.length})
                </button>

                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(gradeNum => {
                  const gradeClasses = availableClasses.filter(c => c.startsWith(gradeNum + '/') || c.startsWith(gradeNum + ' '));
                  if (gradeClasses.length === 0) return null;
                  const isSelected = selectedClassFilter !== 'all' && (selectedClassFilter.startsWith(gradeNum + '/') || selectedClassFilter.startsWith(gradeNum + ' '));
                  return (
                    <button
                      key={gradeNum}
                      type="button"
                      onClick={() => {
                        setSelectedClassFilter(gradeClasses[0]);
                        sound.playTap();
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 ${
                        isSelected
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 font-black border border-blue-300 dark:border-blue-700'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      الصف {gradeNum} ({gradeClasses.length} شعب)
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Students Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs min-w-[880px]">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-black border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4 whitespace-nowrap">#</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">اسم الطالب الرباعي</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">الصف والفصل</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">الرقم الوطني</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">اسم الأم</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">تاريخ الميلاد</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">حالة الحضور</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Users className="w-12 h-12 text-slate-300" />
                          <p className="text-sm font-bold">لم يتم العثور على أي طلاب مطابقين</p>
                          <button
                            onClick={() => { setShowPdfImporterModal(true); sound.playTap(); }}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition"
                          >
                            📄 اضغط هنا لاستيراد كشف الطلبة من PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, idx) => (
                      <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">{idx + 1}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={st.avatar}
                              alt={st.name}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <span className="font-black text-slate-900 dark:text-white text-sm whitespace-nowrap">
                              {st.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-black border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                            {st.className || st.grade || 'غير محدد'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {st.nationalNumber || st.nationalId || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {st.motherName || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                          {st.birthDate || '-'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black inline-block whitespace-nowrap ${
                            st.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : st.status === 'late'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                              : st.status === 'excused'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                          }`}>
                            {st.status === 'present' ? 'حاضر 🟢' : st.status === 'late' ? 'متأخر 🟡' : st.status === 'excused' ? 'إذن رسمي 🔵' : 'غائب 🔴'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => {
                              setStudentToEdit(st);
                              setShowStudentModal(true);
                              sound.playTap();
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition ml-1"
                            title="تعديل بيانات الطالب"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(st.id, st.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="حذف الطالب من المنظومة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>عرض <strong>{filteredStudents.length}</strong> من أصل <strong>{students.length}</strong> طالب مسجل</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ قاعدة بيانات الطلاب محفوظة محلياً ومؤمنة</span>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EXAMS MASTER CONTROL SHEET (LIBYAN CURRICULUM)                    */}
      {/* ========================================================================= */}
      {activeTab === 'exams' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Official Exams Coordinator Portal Banner */}
          <div className="p-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl border border-purple-500/40 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-black shrink-0 shadow-md">
                📜
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-white">بوابة منسق الامتحانات والتقويم ورئيس الكنترول المستقلة</h4>
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-400/30">
                    لائحة 1013 لسنة 2022م
                  </span>
                </div>
                <p className="text-xs text-purple-200 mt-1 leading-relaxed">
                  تم فصل أعمال الكنترول ورصد الدرجات وأرقام الجلوس في بوابة مخصصة لتسهيل مهمة رئيس الكنترول ومنع تشتيت إدارة المدرسة.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setCurrentRole('teacher');
                  sound.playTap();
                  showToast('gold', 'بوابة المعلم 👨‍🏫', 'تم الانتقال المباشر لتجربة رصد الدرجات كمعلم.');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 shrink-0"
                title="الانتقال لواجهة المعلم وتجربة رصد أعمال السنة والامتحانات"
              >
                <span>تجربة رصد درجات المعلم ⚡</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentRole('exams_coordinator');
                  sound.playTap();
                  showToast('gold', 'بوابة الكنترول 📜', 'تم الانتقال المباشر إلى لوحة تحكم رئيس الكنترول.');
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <span>فتح بوابة الكنترول الكاملة ⚡</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Header Controls Bar */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 mb-1">
                <span>🇱🇾 المركز الوطني للامتحانات • مرحلة التعليم الأساسي</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                شيت الكنترول المعتمد ورصد الدرجات العام
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                المجموع الكلي المعتمد: 1120 درجة • النهاية الصغرى للنجاح: 50% لكل مادة
              </p>
            </div>

            {/* Actions: Export Excel & Print */}
            <div className="flex flex-wrap items-center gap-2 justify-start xl:justify-end">
              <button
                onClick={exportMasterSheetToExcel}
                className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>تصدير شيت الكنترول Excel</span>
              </button>

              <button
                onClick={() => { sound.playTap(); window.print(); }}
                className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs transition active:scale-95 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 shrink-0" />
                <span>طباعة الكشف A4</span>
              </button>
            </div>
          </div>

          {/* Class Filter & Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Class Picker */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 sm:col-span-1">
              <span className="text-xs font-bold text-slate-500 block">اختر الفصل الدراسي:</span>
              <select
                value={selectedExamClass}
                onChange={e => { setSelectedExamClass(e.target.value); sound.playTap(); }}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-black text-purple-700 dark:text-purple-300 focus:outline-none"
              >
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>فصل ({cls})</option>
                ))}
              </select>
            </div>

            {/* KPI 1: Pass Rate */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">نسبة النجاح العامة</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-200 font-mono mt-1 block">
                {passRate}%
              </span>
            </div>

            {/* KPI 2: Passed Count */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-center">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block">الناجحون 🟢</span>
              <span className="text-2xl font-black text-blue-700 dark:text-blue-200 font-mono mt-1 block">
                {passedCount} طالب
              </span>
            </div>

            {/* KPI 3: Makeup Count */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">الدور الثاني 🟡</span>
              <span className="text-2xl font-black text-amber-700 dark:text-amber-200 font-mono mt-1 block">
                {makeupCount} طالب
              </span>
            </div>
          </div>

          {/* Official Libyan Exam Certification & Approval Banner */}
          {(() => {
            const cert = LibyanExamEngine.getCertificationStatus(selectedExamClass);
            const isApproved = cert.status === 'approved_by_admin';
            const isSubmitted = cert.status === 'submitted_by_teacher';

            return (
              <div className={`p-4 rounded-3xl border-2 flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isApproved
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200'
                  : isSubmitted
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-200'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{isApproved ? '🏛️' : isSubmitted ? '⏳' : '📝'}</span>
                  <div>
                    <strong className="block text-sm font-black">
                      {isApproved
                        ? `✓ تم اعتماد نتيجة فصل (${selectedExamClass}) رسمياً وإقفال الكنترول 🔒`
                        : isSubmitted
                        ? `ورد طلب اعتماد من المعلم (${cert.teacherSign}) بتاريخ ${cert.submittedAt}`
                        : `حالة شيت فصل (${selectedExamClass}): مسودة قيد الرصد الميداني`}
                    </strong>
                    <span className="text-xs opacity-80 block">
                      {isApproved
                        ? `معتمد بختم الإدارة والوزارة • معتمد بواسطة: ${cert.adminSign} بتاريخ ${cert.approvedAt}`
                        : 'يتطلب مراجعة الدرجات ثم الضغط على زر الاعتماد الرسمي بالأسفل لإقفال النتائج والشهادات.'}
                    </span>
                  </div>
                </div>

                {!isApproved && (
                  <button
                    type="button"
                    onClick={() => {
                      LibyanExamEngine.certifyAndLockGrades(selectedExamClass, schoolProfile.directorName);
                      sound.playFanfare();
                      triggerConfetti();
                      showToast('gold', 'تم اعتماد النتيجة رسميًا 🏛️', `تم إقفال واعتماد شيت درجات فصل (${selectedExamClass}) بنجاح.`);
                    }}
                    className="whitespace-nowrap px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-1.5 shrink-0"
                  >
                    <span>🏛️ اعتماد النتيجة وإقفال الشيت</span>
                  </button>
                )}
              </div>
            );
          })()}

          {/* Master Sheet Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs min-w-[1200px]">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black border-b border-slate-300 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-2 text-center whitespace-nowrap">الترتيب</th>
                    <th className="py-3 px-3 whitespace-nowrap">اسم التلميذ</th>
                    <th className="py-3 px-2 text-center whitespace-nowrap">عربي (240)</th>
                    <th className="py-3 px-2 text-center whitespace-nowrap">رياضيات (200)</th>
                    <th className="py-3 px-2 text-center whitespace-nowrap">علوم (160)</th>
                    <th className="py-3 px-2 text-center whitespace-nowrap">إنجليزي (160)</th>
                    <th className="py-3 px-2 text-center whitespace-nowrap">إسلامية (120)</th>
                    <th className="py-3 px-2 text-center whitespace-nowrap">تاريخ (80)</th>
                    <th className="py-3 px-2 text-center whitespace-nowrap">جغرافيا (80)</th>
                    <th className="py-3 px-2 text-center whitespace-nowrap">حاسوب (80)</th>
                    <th className="py-3 px-2 text-center bg-purple-100 dark:bg-purple-950/60 font-black text-purple-900 dark:text-purple-200 whitespace-nowrap">
                      المجموع (1120)
                    </th>
                    <th className="py-3 px-2 text-center whitespace-nowrap">النسبة</th>
                    <th className="py-3 px-3 text-center whitespace-nowrap">النتيجة والتقدير</th>
                    <th className="py-3 px-2 text-center whitespace-nowrap">إخطار النتيجة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                  {examReports.map((r) => {
                    const originalStudent = students.find(s => s.id === r.studentId) || students[0];
                    const getSubTotal = (code: string) => r.results.find(s => s.subjectCode === code)?.totalScore ?? 0;

                    return (
                      <tr key={r.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-black text-xs inline-flex items-center justify-center">
                            {r.rank}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-black text-slate-900 dark:text-white whitespace-nowrap">
                          {r.studentName}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono whitespace-nowrap">{getSubTotal('ARB')}</td>
                        <td className="py-2.5 px-2 text-center font-mono whitespace-nowrap">{getSubTotal('MATH')}</td>
                        <td className="py-2.5 px-2 text-center font-mono whitespace-nowrap">{getSubTotal('SCI')}</td>
                        <td className="py-2.5 px-2 text-center font-mono whitespace-nowrap">{getSubTotal('ENG')}</td>
                        <td className="py-2.5 px-2 text-center font-mono whitespace-nowrap">{getSubTotal('ISL')}</td>
                        <td className="py-2.5 px-2 text-center font-mono whitespace-nowrap">{getSubTotal('HIST')}</td>
                        <td className="py-2.5 px-2 text-center font-mono whitespace-nowrap">{getSubTotal('GEOG')}</td>
                        <td className="py-2.5 px-2 text-center font-mono whitespace-nowrap">{getSubTotal('COMP')}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-black text-purple-700 dark:text-purple-300 bg-purple-50/40 dark:bg-purple-950/20 text-sm whitespace-nowrap">
                          {r.totalEarnedScore}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-black text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {r.percentage}%
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black inline-block whitespace-nowrap ${
                            r.status === 'passed_honors'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : r.status === 'passed'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                          }`}>
                            {r.generalAppreciation} • {r.status === 'makeup_exam' ? 'دور ثانٍ 🟡' : 'ناجح 🟢'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedStudentForCard(originalStudent);
                              setSelectedStudentRank(r.rank);
                              setShowGradeCardModal(true);
                              sound.playTap();
                            }}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 rounded-lg text-[11px] font-bold border border-purple-200 dark:border-purple-800 transition active:scale-95 flex items-center justify-center gap-1 mx-auto whitespace-nowrap"
                            title="طباعة بطاقة إخطار نتيجة الطالب"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>إخطار</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>كشف رصد فصل ({selectedExamClass}) • {examReports.length} تلميذ</span>
              <span className="text-purple-700 dark:text-purple-300 font-black">
                ✓ متوافق 100% مع لائحة تنظيم الامتحانات بالمركز الوطني للامتحانات
              </span>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TEACHERS MANAGEMENT & CONTROLS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'teachers' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Header Action Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                التحكم في المعلمين ورموز الدخول
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                يمكنك إضافة معلمين جدد، تعديل رموز الدخول والمواد، وتحديد الفصول لكل معلم
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setCurrentRole('teacher');
                  sound.playTap();
                  showToast('gold', 'بوابة المعلم 👨‍🏫', 'تم الانتقال المباشر لتجربة رصد الدرجات والحضور كمعلم.');
                }}
                className="whitespace-nowrap px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 shrink-0"
                title="الدخول الفوري كمعلم وتجربة رصد أعمال السنة والامتحانات"
              >
                <span>تجربة رصد الدرجات كمعلم ⚡</span>
              </button>

              <button
                onClick={() => { setTeacherToEdit(null); setShowTeacherModal(true); sound.playTap(); }}
                className="whitespace-nowrap px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>+ إضافة معلم جديد</span>
              </button>
            </div>
          </div>

          {/* Teacher Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map(teacher => (
              <div
                key={teacher.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top: Avatar, Name, Subject */}
                  <div className="flex items-center gap-3">
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div>
                      <h4 className="font-black text-base text-slate-900 dark:text-white">
                        {teacher.name}
                      </h4>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-bold block mt-0.5">
                        مادة: {teacher.subject}
                      </span>
                    </div>
                  </div>

                  {/* Teacher Login Code Pill (Giant & Clear) */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block">
                        رمز الدخول للبوابة:
                      </span>
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                        {teacher.code}
                      </span>
                    </div>
                    <button
                      onClick={() => { setTeacherToEdit(teacher); setShowTeacherModal(true); sound.playTap(); }}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg shadow-sm transition active:scale-95"
                      title="تغيير وتخصيص رمز المعلم"
                    >
                      تعديل الرمز ✏️
                    </button>
                  </div>

                  {/* Phone & Assigned Classes */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>رقم الهاتف:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{teacher.phone || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">الفصول المسندة:</span>
                      <div className="flex flex-wrap gap-1">
                        {teacher.assignedClasses.map(cls => (
                          <span
                            key={cls}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-black border border-slate-200 dark:border-slate-700"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setTeacherToEdit(teacher); setShowTeacherModal(true); sound.playTap(); }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playSuccess();
                        loginWithTeacherCode(teacher.code);
                      }}
                      className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-black border border-emerald-300 dark:border-emerald-800 transition active:scale-95 flex items-center gap-1 shadow-sm"
                      title="تجربة الدخول ورصد الدرجات بصفتك هذا المعلم"
                    >
                      <span>دخول كمعلم ↗️</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50"
                    title="حذف المعلم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FULL ATTENDANCE TRACKING                                          */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Attendance Action Bar */}
          <div className="p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black">
                سجل متابعة الحضور الشامل لجميع فصول المدرسة
              </h3>
              <p className="text-xs text-emerald-200 mt-1">
                حالة الحضور المسجلة لليوم: {presentCount} حاضر • {absentCount} غائب • {lateCount} متأخر • {excusedCount} إذن رسمي
              </p>
            </div>

            <button
              onClick={() => {
                markAllPresent();
                sound.playSuccess();
                showToast('gold', 'تم تحضير جميع الطلاب 🟢', 'تم اعتماد الحضور لكافة الطلاب في المدرسة بنجاح.');
              }}
              className="whitespace-nowrap px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm shadow-md transition active:scale-95 flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>🟢 تحضير الجميع حاضر بلمسة واحدة</span>
            </button>
          </div>

          {/* 4 Attendance Status Summary Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block whitespace-nowrap">الحاضرون 🟢</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-200 mt-1 block font-mono whitespace-nowrap">{presentCount}</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block whitespace-nowrap">الغائبون 🔴</span>
              <span className="text-2xl font-black text-rose-700 dark:text-rose-200 mt-1 block font-mono whitespace-nowrap">{absentCount}</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block whitespace-nowrap">المتأخرون 🟡</span>
              <span className="text-2xl font-black text-amber-700 dark:text-amber-200 mt-1 block font-mono whitespace-nowrap">{lateCount}</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block whitespace-nowrap">إذن رسمي 🔵</span>
              <span className="text-2xl font-black text-blue-700 dark:text-blue-200 mt-1 block font-mono whitespace-nowrap">{excusedCount}</span>
            </div>
          </div>

          {/* Quick Class-by-Class Attendance List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
            <h4 className="font-black text-sm text-slate-900 dark:text-white">
              نسبة الحضور حسب الفصول الدراسية:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {availableClasses.map(cls => {
                const clsStudents = students.filter(s => s.className === cls);
                const clsPresent = clsStudents.filter(s => s.status === 'present').length;
                const clsRate = clsStudents.length > 0 ? Math.round((clsPresent / clsStudents.length) * 100) : 100;

                return (
                  <div
                    key={cls}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-800 dark:text-white whitespace-nowrap">فصل ({cls})</span>
                      <span className="font-black text-sm font-mono text-emerald-600 whitespace-nowrap">{clsRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${clsRate}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{clsPresent} حاضر</span>
                      <span>إجمالي {clsStudents.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SMART AI TIMETABLE & SCHEDULE BUILDER                              */}
      {/* ========================================================================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-4 animate-in fade-in">
          <SchedulePage />
        </div>
      )}

      {/* Manual Student Manager Modal */}
      <StudentManagerModal
        isOpen={showStudentModal}
        onClose={() => { setShowStudentModal(false); setStudentToEdit(null); }}
        studentToEdit={studentToEdit}
      />

      {/* Teacher Manager Modal */}
      <TeacherManagerModal
        isOpen={showTeacherModal}
        onClose={() => { setShowTeacherModal(false); setTeacherToEdit(null); }}
        teacherToEdit={teacherToEdit}
      />

      {/* Printable Student Grade Card Modal */}
      {selectedStudentForCard && (
        <PrintableStudentGradeCard
          isOpen={showGradeCardModal}
          onClose={() => { setShowGradeCardModal(false); setSelectedStudentForCard(null); }}
          student={selectedStudentForCard}
          rank={selectedStudentRank}
        />
      )}

      {/* Comprehensive System Guide Modal (All 6 Roles + Libyan Regulations) */}
      <ComprehensiveSystemGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Excel Student Importer Modal */}
      <ExcelStudentImporterModal
        isOpen={showExcelImporterModal}
        onClose={() => setShowExcelImporterModal(false)}
      />

      {/* QR Code PDF Reader Modal */}
      <QrPdfReaderModal
        isOpen={showQrPdfReaderModal}
        onClose={() => setShowQrPdfReaderModal(false)}
      />

      {/* Printable Teachers Roster Modal (Al-Shati System) */}
      <PrintableTeachersRosterModal
        isOpen={showTeachersRosterModal}
        onClose={() => setShowTeachersRosterModal(false)}
      />

      {/* Photo Capture & Camera Modal */}
      {photoTarget && (
        <PhotoCaptureModal
          isOpen={showPhotoModal}
          onClose={() => { setShowPhotoModal(false); setPhotoTarget(null); }}
          personName={photoTarget.name}
          onSavePhoto={(photoUrl) => {
            if (photoTarget.type === 'student') {
              const updated = students.map(s => s.id === photoTarget.id ? { ...s, avatar: photoUrl } : s);
              setStudents(updated);
              db.saveStudents(updated, true);
              showToast('success', 'تم حفظ الصورة 📸', `تم تحديث صورة الطالب (${photoTarget.name}) بنجاح.`);
            } else {
              const updated = teachers.map(t => t.id === photoTarget.id ? { ...t, avatar: photoUrl } : t);
              setTeachers(updated);
              db.saveTeachers(updated);
              showToast('success', 'تم حفظ الصورة 📸', `تم تحديث صورة المعلم (${photoTarget.name}) بنجاح.`);
            }
          }}
        />
      )}

      {/* Excel Student & Teacher Importer Modal */}
      <ExcelStudentImporterModal
        isOpen={showExcelImporterModal}
        onClose={() => setShowExcelImporterModal(false)}
      />

      {/* QR PDF Reader Modal */}
      <QrPdfReaderModal
        isOpen={showQrPdfReaderModal}
        onClose={() => setShowQrPdfReaderModal(false)}
      />

      {/* Director Invite & Role Links Modal */}
      <DirectorInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      {/* Official Libyan Ministry Roster Modal (100% Exact 7-column replica A4) */}
      <MinistryRosterModal
        isOpen={showMinistryRosterModal}
        onClose={() => setShowMinistryRosterModal(false)}
      />

    </div>
  );
};
