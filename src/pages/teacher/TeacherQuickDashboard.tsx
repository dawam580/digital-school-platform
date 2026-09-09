import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useRequireRole } from '../../hooks/useRequireRole';
import { AttendanceStatus } from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Users,
  Send,
  Award,
  Save,
  MessageSquare,
  Volume2,
  ZoomIn,
  ZoomOut,
  CalendarCheck,
  Check,
  ChevronDown,
  UserCheck,
  LogOut,
  Calendar,
  Tag,
  Sliders,
  Edit2,
  BookOpen,
  Building2
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { db } from '../../services/db';
import { LibyanExamEngine } from '../../services/exams/libyanExamEngine';
import { ExamStorageService, ExamGradeRecord } from '../../services/exams/examStorageService';
import { QuickSystemGuideModal } from '../../components/common/QuickSystemGuideModal';
import { TeacherSelectionModal } from '../../components/teacher/TeacherSelectionModal';

import { normalizeClassQuery, matchesClass, formatClassDisplayName } from '../../utils/classMatcher';
import { getCleanAvatar } from '../../utils/avatarHelper';

export { normalizeClassQuery, matchesClass, formatClassDisplayName };

export const ALL_LIBYAN_PERIODS = [
  'الحصة الأولى',
  'الحصة الثانية',
  'الحصة الثالثة',
  'الحصة الرابعة',
  'الحصة الخامسة'
];

export const TeacherQuickDashboard: React.FC = () => {
  const {
    currentTeacher,
    teachers,
    selectTeacher,
    students,
    setStudents,
    updateAttendance,
    markAllPresent,
    updateStudentGrade,
    addNotification,
    showToast,
    isLargeFontMode,
    toggleLargeFontMode,
    logout,
    setShowCustomCodeModal,
    setCurrentRole,
    isReadOnlyPreview
  } = useSchool();

  // Custom Attendance State
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendancePeriod, setAttendancePeriod] = useState<string>('الحصة الأولى');
  const [showAttendanceCustomizer, setShowAttendanceCustomizer] = useState<boolean>(true);
  const [studentNotes, setStudentNotes] = useState<{ [studentId: string]: string }>({});
  const [attendanceViewMode, setAttendanceViewMode] = useState<'cards' | 'periods-matrix'>('cards');
  
  // Period-specific attendance cache: [date_period_studentId] => { status, note }
  const [periodAttendanceRecords, setPeriodAttendanceRecords] = useState<{
    [recordKey: string]: { status: AttendanceStatus; note?: string };
  }>({});

  // Active section inside the teacher portal
  const [activeAction, setActiveAction] = useState<'attendance' | 'grading' | 'quick-message'>('attendance');

  // Selected class (Defaults to the classes assigned to this specific teacher)
  const assignedClasses = React.useMemo(() => {
    if (currentTeacher?.assignedClasses && currentTeacher.assignedClasses.length > 0) {
      return currentTeacher.assignedClasses;
    }
    return ['3/أ', '7/أ', '7/ب', '8/أ', '6/أ', '4/أ'];
  }, [currentTeacher]);

  const [selectedClass, setSelectedClass] = useState<string>(assignedClasses[0] || '3/أ');
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showTeacherSelectModal, setShowTeacherSelectModal] = useState<boolean>(!currentTeacher);

  // Synchronize selectedClass when currentTeacher changes
  React.useEffect(() => {
    if (assignedClasses.length > 0 && !assignedClasses.includes(selectedClass)) {
      setSelectedClass(assignedClasses[0]);
    }
  }, [assignedClasses, selectedClass]);

  // Filter students for the selected class using smart normalization
  const classStudents = React.useMemo(() => {
    return students.filter(s => matchesClass(s.className, selectedClass));
  }, [students, selectedClass]);

  // Selected student for grading or messaging
  const [selectedStudentId, setSelectedStudentId] = useState<string>(classStudents[0]?.id || students[0]?.id || '');
  const activeStudent = students.find(s => s.id === selectedStudentId) || classStudents[0] || students[0];

  // Dual-mode grading state (Libyan Bylaws)
  const [gradingMode, setGradingMode] = useState<'quick' | 'detailed'>('quick');
  const [classScores, setClassScores] = useState<{
    [studentId: string]: {
      coursework: number;
      exam: number;
      t1?: number;
      t2?: number;
      hw?: number;
      mid?: number;
    };
  }>({});

  const teacherSubject = currentTeacher?.subject || 'الرياضيات';

  const getStudentScore = (studentId: string) => {
    if (classScores[studentId]) return classScores[studentId];
    const std = students.find(s => s.id === studentId);
    const existing = std?.subjects?.find(sub => sub.name === teacherSubject || sub.code === currentTeacher?.subjectCode);
    return {
      coursework: existing?.courseworkScore ?? 36,
      exam: existing?.examScore ?? 54,
      t1: 9,
      t2: 9,
      hw: 9,
      mid: 9
    };
  };

  const handleUpdateStudentScore = (
    studentId: string,
    field: 'coursework' | 'exam' | 't1' | 't2' | 'hw' | 'mid',
    value: number
  ) => {
    setClassScores(prev => {
      const current = prev[studentId] || getStudentScore(studentId);
      const updated = { ...current, [field]: value };
      if (['t1', 't2', 'hw', 'mid'].includes(field)) {
        updated.coursework = (updated.t1 || 0) + (updated.t2 || 0) + (updated.hw || 0) + (updated.mid || 0);
      }
      return { ...prev, [studentId]: updated };
    });
  };

  const handleBulkFillGrades = (coursework: number, exam: number) => {
    sound.playSuccess();
    const next: typeof classScores = {};
    classStudents.forEach(st => {
      next[st.id] = {
        coursework,
        exam,
        t1: Math.round(coursework * 0.25),
        t2: Math.round(coursework * 0.25),
        hw: Math.round(coursework * 0.25),
        mid: Math.round(coursework * 0.25)
      };
    });
    setClassScores(next);
    showToast('success', 'رصد جماعي ⚡', `تم تطبيق الدرجات المقترحة لكافة طلاب فصل (${selectedClass}) بنجاح.`);
  };

  const handleSaveAllGrades = () => {
    if (isReadOnlyPreview) {
      sound.playAlert();
      showToast('warning', '👁 وضع المعاينة — قراءة فقط', 'رصد الدرجات متاح من واجهتك الأصلية فقط.');
      return;
    }
    sound.playFanfare();
    triggerConfetti();

    const updatedStudents = students.map(st => {
      if (!matchesClass(st.className, selectedClass)) return st;

      const score = classScores[st.id] || getStudentScore(st.id);
      const total = score.coursework + score.exam;
      const pct = (total / 100) * 100;
      const app = LibyanExamEngine.getAppreciation(pct);

      const subjects = st.subjects ? [...st.subjects] : [];
      const subIdx = subjects.findIndex(s => s.name === teacherSubject || s.code === currentTeacher?.subjectCode);
      const newSubData = {
        name: teacherSubject,
        code: currentTeacher?.subjectCode || 'GEN',
        score: total,
        maxScore: 100,
        teacher: currentTeacher?.name || 'معلم المادة',
        evaluation: app,
        courseworkScore: score.coursework,
        examScore: score.exam,
        totalScore: total
      };

      if (subIdx >= 0) {
        subjects[subIdx] = { ...subjects[subIdx], ...newSubData };
      } else {
        subjects.push(newSubData);
      }

      return {
        ...st,
        courseworkScore: score.coursework,
        examScore: score.exam,
        totalScore: total,
        appreciation: app,
        subjects
      };
    });

    setStudents(updatedStudents);
    db.saveStudents(updatedStudents, true);

    // Synchronize directly with ExamStorageService for Exam Coordinator & Control Sheet
    try {
      const subCode = currentTeacher?.subjectCode || 'ARB';
      const examBatch: ExamGradeRecord[] = classStudents.map(st => {
        const score = classScores[st.id] || getStudentScore(st.id);
        const total = score.coursework + score.exam;
        return {
          id: `${st.id}_${subCode}`,
          studentId: st.id,
          studentNationalId: st.nationalId || st.studentNumber || '',
          studentName: st.name,
          className: st.className || selectedClass,
          subjectCode: subCode,
          subjectName: teacherSubject,
          courseworkScore: score.coursework,
          examScore: score.exam,
          totalScore: total,
          isPassed: total >= 50,
          isSecondRound: total < 50,
          appreciation: LibyanExamEngine.getAppreciation((total / 100) * 100),
          detailedBreakdown: {
            attendanceScore: score.t1 ?? Math.round(score.coursework * 0.25),
            homeworkScore: score.hw ?? Math.round(score.coursework * 0.25),
            midtermTestScore: score.mid ?? Math.round(score.coursework * 0.50)
          },
          updatedAt: new Date().toISOString(),
          updatedBy: currentTeacher?.name || 'معلم المادة'
        };
      });
      ExamStorageService.saveGradeRecordsBatch(examBatch).catch(() => {});
    } catch {}

    addNotification(
      `📑 تم رصد درجات ${teacherSubject} لفصل (${selectedClass})`,
      `قام الأستاذ ${currentTeacher?.name || 'المعلم'} باعتماد كشف درجات أعمال السنة والامتحان لكافة طلاب الفصل.`,
      'academic'
    );

    showToast('gold', 'تم حفظ الدرجات بنجاح 🌟', `تم اعتماد وتثبيت درجات مادة ${teacherSubject} لفصل (${selectedClass}).`);
  };

  // Success indicator
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // Period-aware status helper
  const getStudentPeriodStatus = (studentId: string, periodName: string = attendancePeriod): AttendanceStatus => {
    const key = `${attendanceDate}_${periodName}_${studentId}`;
    if (periodAttendanceRecords[key]) {
      return periodAttendanceRecords[key].status;
    }
    const std = students.find(s => s.id === studentId);
    return std?.status || 'present';
  };

  const getStudentPeriodNote = (studentId: string, periodName: string = attendancePeriod): string => {
    const key = `${attendanceDate}_${periodName}_${studentId}`;
    if (periodAttendanceRecords[key]?.note) {
      return periodAttendanceRecords[key].note!;
    }
    return studentNotes[studentId] || '';
  };

  // 1. One-Tap Status Change (Records for active period and syncs globally)
  const handleStatusChange = (studentId: string, status: AttendanceStatus, targetPeriod: string = attendancePeriod) => {
    sound.playTap();
    const key = `${attendanceDate}_${targetPeriod}_${studentId}`;
    setPeriodAttendanceRecords(prev => ({
      ...prev,
      [key]: { status, note: studentNotes[studentId] }
    }));
    updateAttendance(studentId, status);
  };

  // 1b. Direct Cycle Status (for Matrix View cells)
  const handleCyclePeriodStatus = (studentId: string, targetPeriod: string) => {
    const current = getStudentPeriodStatus(studentId, targetPeriod);
    const order: AttendanceStatus[] = ['present', 'unexcused', 'late', 'excused'];
    const nextIdx = (order.indexOf(current) + 1) % order.length;
    handleStatusChange(studentId, order[nextIdx], targetPeriod);
  };

  // 2. One-Tap Mark All Present for Active Period
  const handleMarkAll = (targetPeriod: string = attendancePeriod) => {
    sound.playSuccess();
    triggerConfetti();
    const nextRecords = { ...periodAttendanceRecords };
    classStudents.forEach(s => {
      const key = `${attendanceDate}_${targetPeriod}_${s.id}`;
      nextRecords[key] = { status: 'present', note: studentNotes[s.id] };
      updateAttendance(s.id, 'present');
    });
    setPeriodAttendanceRecords(nextRecords);
    showToast('success', 'رائع جداً 👏', `تم تحضير جميع طلاب فصل ${selectedClass} حاضرين في ${targetPeriod} بنجاح!`);
  };

  // 3. Save Attendance with Feedback
  const handleSaveAttendance = () => {
    sound.playFanfare();
    triggerConfetti();
    setAttendanceSaved(true);
    addNotification(
      `تم اعتماد حضور فصل ${selectedClass} - (${attendancePeriod})`,
      `قام الأستاذ ${currentTeacher?.name || 'معلم المادة'} باعتماد كشف حضور مادة ${currentTeacher?.subject || 'الرياضيات'} لفصل (${selectedClass}) في ${attendancePeriod} وإشعار أولياء الأمور فوراً.`,
      'attendance'
    );
    showToast('gold', 'تم الحفظ والاعتماد 💾', `تم تثبيت كشف حضور فصل ${selectedClass} (${attendancePeriod}) بنجاح.`);
    setTimeout(() => setAttendanceSaved(false), 3000);
  };

  // 4. One-Tap Grade Save
  const handleSaveGrade = (evalText: string, scoreVal: number) => {
    if (!activeStudent) return;
    sound.playSuccess();

    // Save to student record
    updateStudentGrade(activeStudent.id, 'grade-quick', {
      subjectName: currentTeacher?.subject || 'الرياضيات',
      teacherName: currentTeacher?.name || 'أ. طارق الفيتوري',
      quizzes: scoreVal,
      total: scoreVal * 5,
      letter: evalText === 'ممتاز' ? 'A+' : evalText === 'جيد جداً' ? 'A' : evalText === 'جيد' ? 'B' : 'C',
      appreciation: evalText
    });

    triggerConfetti();
    showToast('gold', 'تم الرصد بنجاح ⭐', `تم رصد (${evalText} - ${scoreVal} درجة) للطالب ${activeStudent.name}`);
  };

  // 5. One-Tap Quick Message to Parent
  const handleSendQuickMessage = (messageText: string) => {
    if (!activeStudent) return;
    sound.playSuccess();
    triggerConfetti();

    addNotification(
      `رسالة من ${currentTeacher?.name || 'معلم المادة'} (${currentTeacher?.subject || 'المادة'})`,
      `بخصوص الطالب (${activeStudent.name}): ${messageText}`,
      'academic',
      activeStudent.name
    );

    showToast('gold', 'تم إرسال الرسالة ✉️', `تم إشعار ولي أمر الطالب ${activeStudent.name.split(' ')[0]} فوراً.`);
  };

  // حارس الدور الإلزامي: هذه الشاشة للمعلم (والمدير/السوبر المعاينين) فقط
  const allowed = useRequireRole('teacher');
  if (!allowed) return null;

  return (
    <div className={`space-y-6 text-right animate-in fade-in max-w-5xl mx-auto pb-20 font-cairo ${isLargeFontMode ? 'text-lg' : 'text-base'}`}>
      
      {/* Friendly Top Welcome Card (Optimized for Older Teachers) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 p-1 border-2 border-emerald-400/40 shrink-0 shadow-inner flex items-center justify-center overflow-hidden">
            {currentTeacher ? (
              <img
                src={currentTeacher.avatar || getCleanAvatar(currentTeacher.name, 'teacher')}
                alt={currentTeacher.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-3xl">👨‍🏫</span>
            )}
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs sm:text-sm font-black border border-emerald-400/30 mb-1">
              <span>بوابة المعلم الميسرة • الوضع السريع لكبار السن</span>
            </div>
            <h1 className={`${isLargeFontMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black`}>
              أهلاً بك: {currentTeacher?.name || 'اختر اسمك من كشف المعلمين'}
            </h1>
            <div className="text-emerald-200/90 text-sm sm:text-base font-medium mt-1 flex items-center gap-2 flex-wrap">
              <span>مادة: <strong className="text-white underline decoration-emerald-400 underline-offset-4">{currentTeacher?.subject || 'غير محدد'}</strong></span>
              <span>• رمز المعلم: <span className="font-mono bg-white/20 px-2.5 py-0.5 rounded-lg text-xs font-black">{currentTeacher?.code || '—'}</span></span>
              
              <button
                type="button"
                onClick={() => { setShowTeacherSelectModal(true); sound.playTap(); }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-emerald-950 text-xs font-black shadow-md hover:bg-emerald-50 transition active:scale-95"
                title="اضغط هنا لتغيير المعلم واختيار اسمك من كشف المدرسة"
              >
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>تبديل المعلم 🔄</span>
              </button>

              <button
                type="button"
                onClick={() => { setShowCustomCodeModal(true); sound.playTap(); }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow transition active:scale-95"
                title="اضغط هنا لتخصيص رمزك"
              >
                <Tag className="w-3 h-3" />
                <span>تخصيص رمزي ✏️</span>
              </button>
            </div>
          </div>
        </div>

        {/* Header Actions: Guide Button + Back Button + PDF Import + Custom Code + Large Font */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
          {/* Visual Guide Button */}
          <button
            onClick={() => { setShowGuideModal(true); sound.playTap(); }}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-black text-xs sm:text-sm border border-white/30 shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
            title="شرح مبسط لكيفية استخدام بوابة المعلم"
          >
            <span>💡 كيف أستخدم البوابة؟</span>
          </button>

          {/* Custom Code Button */}
          <button
            onClick={() => { setShowCustomCodeModal(true); sound.playTap(); }}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
            title="تخصيص وتغيير رمز الدخول الخاص بي"
          >
            <Tag className="w-4 h-4" />
            <span>🏷️ تخصيص رمزي</span>
          </button>

          {/* Import PDF Button — محذوف من واجهة المعلم: استيراد الكشوفات صلاحية (IMPORT_DATA) للمدير والكنترول فقط، وتُدار من لوحة الإدارة */}

          {/* Return to Admin Dashboard (يظهر فقط للمدير أثناء معاينة واجهة المعلم) */}
          {isReadOnlyPreview && (
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setCurrentRole('admin');
              showToast('info', 'لوحة تحكم المدير 🏛️', 'تم الرجوع إلى لوحة الإدارة العامة لمدرسة الباعور.');
            }}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm border border-purple-400/50 shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95"
            title="الرجوع إلى لوحة تحكم مدير المدرسة الرئيسية"
          >
            <Building2 className="w-4 h-4" />
            <span>⬅️ لوحة تحكم المدير</span>
          </button>
          )}

          {/* Prominent Back Button */}
          <button
            onClick={() => { logout(); sound.playTap(); }}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm border border-rose-400/50 shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
            title="الرجوع إلى شاشة الدخول واختيار البوابة"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج</span>
          </button>

          {/* Accessibility Large Font Toggle */}
          <button
            onClick={toggleLargeFontMode}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-xs sm:text-sm border border-white/20 flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            {isLargeFontMode ? <ZoomOut className="w-4 h-4 text-amber-300" /> : <ZoomIn className="w-4 h-4 text-emerald-300" />}
            <span>{isLargeFontMode ? 'الخط العادي' : 'تكبير الخط 🔍'}</span>
          </button>
        </div>
      </div>

      {/* Friendly Teacher Guidance Banner ("بطريقة شروحية") */}
      <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-sm sm:text-base">
            <span className="text-xl">💡</span>
            <span>خطوتان بسيطتان لإنجاز عملك اليوم بكل سهولة وسرعة:</span>
          </div>
          <button
            onClick={() => { setShowGuideModal(true); sound.playTap(); }}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition shadow-sm active:scale-95"
          >
            فتح الشرح التوضيحي 📖
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <button
            type="button"
            onClick={() => { setActiveAction('attendance'); sound.playTap(); }}
            className={`p-3 rounded-2xl text-right border transition active:scale-95 ${
              activeAction === 'attendance'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800/60 text-slate-800 dark:text-slate-200 hover:bg-amber-100/50'
            }`}
          >
            <strong className={`block mb-1 text-sm ${activeAction === 'attendance' ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'}`}>
              1️⃣ لتسجيل الحضور اليومي:
            </strong>
            <span className={`leading-relaxed text-[11px] ${activeAction === 'attendance' ? 'text-emerald-100' : 'text-slate-600 dark:text-slate-400'}`}>
              اضغط على زر (1. تحضير الحضور اليومي) بالأسفل، وحدد حالة كل طالب (حاضر / غائب)، ثم اضغط حفظ.
            </span>
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveAction('grading'); sound.playTap(); }}
            className={`p-3 rounded-2xl text-right border transition active:scale-95 ${
              activeAction === 'grading'
                ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800/60 text-slate-800 dark:text-slate-200 hover:bg-amber-100/50'
            }`}
          >
            <strong className={`block mb-1 text-sm ${activeAction === 'grading' ? 'text-white' : 'text-amber-800 dark:text-amber-400'}`}>
              2️⃣ لرصد الدرجات والامتحانات:
            </strong>
            <span className={`leading-relaxed text-[11px] ${activeAction === 'grading' ? 'text-amber-100' : 'text-slate-600 dark:text-slate-400'}`}>
              اضغط على زر (2. رصد درجات أعمال السنة والامتحانات)، أدخل أعمال السنة والامتحان واضغط حفظ.
            </span>
          </button>
        </div>
      </div>

      {/* Class Switcher Pills (Giant Touch Targets) */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-black text-slate-700 dark:text-slate-300 text-sm sm:text-base shrink-0">
          اختر الفصل الدراسي:
        </span>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {assignedClasses.map(cls => {
            const count = students.filter(s => matchesClass(s.className, cls)).length;
            const isSel = selectedClass === cls || matchesClass(selectedClass, cls);
            return (
              <button
                key={cls}
                onClick={() => { setSelectedClass(cls); sound.playTap(); }}
                className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-2xl font-black text-sm sm:text-base transition-all active:scale-95 shadow-sm border flex items-center justify-center gap-2 ${
                  isSel
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/30 ring-2 ring-emerald-400/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>فصل ({cls})</span>
                {count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-black ${
                    isSel ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {count} طالب
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Main Giant Action Cards (Attendance, Grading, Messaging) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Button 1: Attendance */}
        <button
          onClick={() => { setActiveAction('attendance'); sound.playTap(); }}
          className={`p-5 rounded-3xl border-2 text-right transition-all flex items-center gap-4 shadow-md active:scale-95 ${
            activeAction === 'attendance'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
            ✅
          </div>
          <div>
            <span className="font-black text-lg text-slate-900 dark:text-white block">
              1. تحضير الحضور اليومي
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
              رصد سريع بلمسة واحدة لطلاب الفصل
            </span>
          </div>
        </button>

        {/* Button 2: Quick Grading */}
        <button
          onClick={() => { setActiveAction('grading'); sound.playTap(); }}
          className={`p-5 rounded-3xl border-2 text-right transition-all flex items-center gap-4 shadow-md active:scale-95 ${
            activeAction === 'grading'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
            ⭐
          </div>
          <div>
            <span className="font-black text-lg text-slate-900 dark:text-white block">
              2. رصد درجات أعمال السنة والامتحانات
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
              أعمال سنة (40) + امتحان (60) وفق اللائحة الليبية
            </span>
          </div>
        </button>

        {/* Button 3: Quick Messages */}
        <button
          onClick={() => { setActiveAction('quick-message'); sound.playTap(); }}
          className={`p-5 rounded-3xl border-2 text-right transition-all flex items-center gap-4 shadow-md active:scale-95 ${
            activeAction === 'quick-message'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
            💬
          </div>
          <div>
            <span className="font-black text-lg text-slate-900 dark:text-white block">
              3. رسائل جاهزة لولي الأمر
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
              إرسال تنبيه بنقرة زر واحدة دون كتابة
            </span>
          </div>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ONE-TAP ATTENDANCE                                            */}
      {/* ========================================================================= */}
      {activeAction === 'attendance' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Top Control: Custom Attendance Bar & Mark All Present */}
          <div className="p-4 bg-emerald-100/70 dark:bg-emerald-950/40 rounded-3xl border border-emerald-300 dark:border-emerald-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-lg text-emerald-950 dark:text-emerald-200">
                  كشف حضور طلاب فصل ({selectedClass}) • ({classStudents.length}) طالب
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                  تاريخ التحضير: <strong className="underline">{attendanceDate}</strong> • {attendancePeriod}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleMarkAll(attendancePeriod)}
                  className="flex-1 sm:flex-initial px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>🟢 الكل حاضر بلمسة واحدة</span>
                </button>
              </div>
            </div>

            {/* Custom Attendance Details (Date & Session Selector) */}
            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 shrink-0">تخصيص التاريخ:</span>
                <button
                  type="button"
                  onClick={() => { setAttendanceDate(new Date().toISOString().split('T')[0]); sound.playTap(); }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                    attendanceDate === new Date().toISOString().split('T')[0]
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  اليوم 📅
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const y = new Date();
                    y.setDate(y.getDate() - 1);
                    setAttendanceDate(y.toISOString().split('T')[0]);
                    sound.playTap();
                  }}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  أمس ⏮️
                </button>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  className="px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 shrink-0">الحصة:</span>
                {['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'].map(p => {
                  const full = `الحصة ${p}`;
                  const pPresentCount = classStudents.filter(st => getStudentPeriodStatus(st.id, full) === 'present').length;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setAttendancePeriod(full); sound.playTap(); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                        attendancePeriod === full
                          ? 'bg-teal-700 text-white border-teal-700 shadow-md ring-2 ring-teal-400/40 scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{p}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-black ${
                        attendancePeriod === full
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {pPresentCount}/{classStudents.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* View Mode Toggle: Single-Period Cards vs 5-Periods Comprehensive Matrix */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-950 dark:text-emerald-200">نمط عرض الحضور:</span>
                <div className="p-1 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { setAttendanceViewMode('cards'); sound.playTap(); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                      attendanceViewMode === 'cards'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>📇 بطاقات الحضور الفردية ({attendancePeriod})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAttendanceViewMode('periods-matrix'); sound.playTap(); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                      attendanceViewMode === 'periods-matrix'
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>📊 كشف الحصص الشامل (مصفوفة الحصص 1 - 5)</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                مادة: <strong className="underline decoration-emerald-400">{teacherSubject}</strong> • الأستاذ: {currentTeacher?.name || 'معلم المادة'}
              </div>
            </div>
          </div>

          {attendanceViewMode === 'periods-matrix' ? (
            /* ======================================================= */
            /* 5-PERIODS COMPREHENSIVE MATRIX VIEW                     */
            /* ======================================================= */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-teal-500/30 overflow-hidden shadow-lg space-y-3 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📊 مصفوفة متابعة حصص مادة {teacherSubject} (الحصص 1 إلى 5)</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    فصل ({selectedClass}) • اضغط على أي حصة لتبديل حالة الطالب فوراً بين (حاضر 🟢 / غائب 🔴 / متأخر 🟡 / إذن 🔵)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-black flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">🟢 حاضر</span>
                  <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300">🔴 غائب</span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">🟡 متأخر</span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">🔵 إذن رسمي</span>
                </div>
              </div>

              {/* Responsive Scrollable Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3 min-w-[200px]">اسم الطالب ورقم القيد</th>
                      <th className="p-3 text-center min-w-[100px]">الحصة 1</th>
                      <th className="p-3 text-center min-w-[100px]">الحصة 2</th>
                      <th className="p-3 text-center min-w-[100px]">الحصة 3</th>
                      <th className="p-3 text-center min-w-[100px]">الحصة 4</th>
                      <th className="p-3 text-center min-w-[100px]">الحصة 5</th>
                      <th className="p-3 min-w-[150px]">ملاحظة / عذر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {classStudents.map((st, idx) => (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-3 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img src={getCleanAvatar(st.name, st.gender)} alt={st.name} className="w-8 h-8 rounded-xl object-cover shrink-0 border" />
                            <div>
                              <strong className="block text-slate-900 dark:text-white">{st.name}</strong>
                              <span className="font-mono text-[11px] text-slate-400">قيد: {st.studentNumber || st.nationalNumber || st.id}</span>
                            </div>
                          </div>
                        </td>
                        {ALL_LIBYAN_PERIODS.map(pName => {
                          const status = getStudentPeriodStatus(st.id, pName);
                          return (
                            <td key={pName} className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleCyclePeriodStatus(st.id, pName)}
                                className={`w-full py-1.5 px-2 rounded-xl font-black text-xs transition active:scale-90 border shadow-xs ${
                                  status === 'present'
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/25'
                                    : status === 'unexcused'
                                    ? 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-400/40 hover:bg-red-500/25'
                                    : status === 'late'
                                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/40 hover:bg-amber-500/25'
                                    : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-400/40 hover:bg-blue-500/25'
                                }`}
                                title={`اضغط للتبديل: ${pName}`}
                              >
                                {status === 'present' && 'حاضر 🟢'}
                                {status === 'unexcused' && 'غائب 🔴'}
                                {status === 'late' && 'متأخر 🟡'}
                                {status === 'excused' && 'إذن 🔵'}
                              </button>
                            </td>
                          );
                        })}
                        <td className="p-2">
                          <span className="text-[11px] text-slate-500 font-medium">
                            {studentNotes[st.id] || '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Summary Totals Row */}
                  <tfoot>
                    <tr className="bg-emerald-50/70 dark:bg-emerald-950/40 font-black text-xs sm:text-sm border-t-2 border-emerald-200 dark:border-emerald-800">
                      <td colSpan={2} className="p-3 text-emerald-950 dark:text-emerald-200">
                        إجمالي الحضور الفعلي في مادة {teacherSubject}:
                      </td>
                      {ALL_LIBYAN_PERIODS.map(pName => {
                        const presentCount = classStudents.filter(st => getStudentPeriodStatus(st.id, pName) === 'present').length;
                        const pct = Math.round((presentCount / (classStudents.length || 1)) * 100);
                        return (
                          <td key={pName} className="p-3 text-center">
                            <span className="font-mono text-emerald-700 dark:text-emerald-300 font-black block">
                              {presentCount} / {classStudents.length}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                              ({pct}%)
                            </span>
                          </td>
                        );
                      })}
                      <td className="p-3 text-left">
                        <span className="text-xs text-emerald-800 dark:text-emerald-300 font-black">
                          {attendanceDate}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            /* ======================================================= */
            /* SINGLE-PERIOD INDIVIDUAL CARDS VIEW                     */
            /* ======================================================= */
            <div className="space-y-3">
              {classStudents.map((student, idx) => {
                const stStatus = getStudentPeriodStatus(student.id, attendancePeriod);
                const isPresent = stStatus === 'present';
                const isAbsent = stStatus === 'unexcused';
                const isLate = stStatus === 'late';
                const isExcused = stStatus === 'excused';

                return (
                  <div
                    key={student.id}
                    className={`p-4 sm:p-5 rounded-3xl border-2 transition-all flex flex-col gap-3 ${
                      isPresent
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : isAbsent
                        ? 'bg-red-50/40 dark:bg-red-950/20 border-red-300 dark:border-red-800'
                        : isExcused
                        ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
                        : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Student Info */}
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center text-sm shrink-0">
                          {idx + 1}
                        </span>

                        <img
                          src={getCleanAvatar(student.name, student.gender)}
                          alt={student.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm shrink-0"
                        />

                        <div>
                          <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                            {student.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>الرقم الوطني: <strong className="font-mono text-slate-700 dark:text-slate-300">{student.nationalNumber || student.nationalId}</strong></span>
                            {student.motherName && <span>• الأم: <strong>{student.motherName}</strong></span>}
                          </div>
                        </div>
                      </div>

                      {/* 4 Status Selection Buttons (Min 48px height) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto shrink-0">
                        <button
                          onClick={() => handleStatusChange(student.id, 'present', attendancePeriod)}
                          className={`py-3.5 px-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1 transition-all active:scale-95 border ${
                            isPresent
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          <span>حاضر 🟢</span>
                        </button>

                        <button
                          onClick={() => handleStatusChange(student.id, 'unexcused', attendancePeriod)}
                          className={`py-3.5 px-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1 transition-all active:scale-95 border ${
                            isAbsent
                              ? 'bg-red-600 text-white border-red-600 shadow-md scale-105'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-red-50'
                          }`}
                        >
                          <span>غائب 🔴</span>
                        </button>

                        <button
                          onClick={() => handleStatusChange(student.id, 'late', attendancePeriod)}
                          className={`py-3.5 px-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1 transition-all active:scale-95 border ${
                            isLate
                              ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-105'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50'
                          }`}
                        >
                          <span>متأخر 🟡</span>
                        </button>

                        <button
                          onClick={() => handleStatusChange(student.id, 'excused', attendancePeriod)}
                          className={`py-3.5 px-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1 transition-all active:scale-95 border ${
                            isExcused
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50'
                          }`}
                        >
                          <span>إذن رسمي 🔵</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Attendance Reason / Note for this student */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
                      <span className="text-slate-400 text-[11px]">ملاحظة أو سبب الغياب/التأخر ({attendancePeriod}):</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['عذر مرضي 🩺', 'استئذان أسري 🏠', 'مأذون من الإدارة 🏢', 'بدون عذر ⚠️'].map(reason => (
                          <button
                            key={reason}
                            type="button"
                            onClick={() => {
                              setStudentNotes(prev => ({ ...prev, [student.id]: reason }));
                              sound.playTap();
                              showToast('info', 'تم حفظ الملاحظة', `${student.name}: ${reason}`);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                              studentNotes[student.id] === reason
                                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200 font-black shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {reason}
                          </button>
                        ))}
                        {studentNotes[student.id] && (
                          <span className="font-bold text-amber-600 dark:text-amber-400 text-xs mr-1">
                            ✓ {studentNotes[student.id]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Big Sticky Save Button */}
          <div className="sticky bottom-4 z-20 pt-4">
            <button
              onClick={handleSaveAttendance}
              className={`w-full py-4 px-8 rounded-3xl font-black text-lg sm:text-xl shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
                attendanceSaved
                  ? 'bg-emerald-700 text-white'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white'
              }`}
            >
              <Save className="w-6 h-6" />
              <span>{attendanceSaved ? '✅ تم حفظ وتثبيت كشف الحضور بنجاح!' : '💾 حفظ واعتماد كشف الحضور اليومي وإشعار الإدارة'}</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: LIBYAN EXAM & COURSEWORK GRADING (DUAL MODE)                   */}
      {/* ========================================================================= */}
      {activeAction === 'grading' && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Top Configuration & Mode Switcher */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-black border border-amber-300 dark:border-amber-800 mb-1">
                  <span>🇱🇾 اللائحة الليبية المعتمدة للتقييم والامتحانات</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  رصد درجات مادة: {teacherSubject} • فصل ({selectedClass})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  إجمالي طلاب الفصل: ({classStudents.length}) طالب • النهاية الكبرى للمادة: 100 درجة (أعمال سنة 40 + امتحان 60)
                </p>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => { setGradingMode('quick'); sound.playTap(); }}
                  className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-black transition-all ${
                    gradingMode === 'quick'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  ⚡ الوضع السريع لكبار السن (أعمال سنة 40 + امتحان 60)
                </button>

                <button
                  type="button"
                  onClick={() => { setGradingMode('detailed'); sound.playTap(); }}
                  className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-black transition-all ${
                    gradingMode === 'detailed'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  📝 الوضع التفصيلي (تطبيقات، واجبات، شفهي)
                </button>
              </div>
            </div>

            {/* Quick Presets Bar */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-500">خيارات الرصد السريع بلمسة واحدة:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkFillGrades(38, 56)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-800 transition active:scale-95 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⭐ رصد تفوق ممتاز للكل (38 أعمال + 56 امتحان)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkFillGrades(30, 45)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-black border border-blue-300 dark:border-blue-800 transition active:scale-95"
                >
                  <span>جيد جداً للكل (30 + 45)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkFillGrades(22, 32)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-black border border-amber-300 dark:border-amber-800 transition active:scale-95"
                >
                  <span>مقبول للكل (22 + 32)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Students Grading Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs min-w-[850px] whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-3">#</th>
                    <th className="py-3.5 px-3">اسم التلميذ</th>
                    {gradingMode === 'quick' ? (
                      <>
                        <th className="py-3.5 px-3 text-center">أعمال السنة (من 40)</th>
                        <th className="py-3.5 px-3 text-center">الامتحان النهائي (من 60)</th>
                      </>
                    ) : (
                      <>
                        <th className="py-3.5 px-2 text-center">تطبيق 1 (10)</th>
                        <th className="py-3.5 px-2 text-center">تطبيق 2 (10)</th>
                        <th className="py-3.5 px-2 text-center">واجبات (10)</th>
                        <th className="py-3.5 px-2 text-center">منتصف فصل (10)</th>
                        <th className="py-3.5 px-2 text-center">أعمال السنة (40)</th>
                        <th className="py-3.5 px-3 text-center">امتحان نهائي (60)</th>
                      </>
                    )}
                    <th className="py-3.5 px-3 text-center bg-slate-100 dark:bg-slate-800">المجموع (100)</th>
                    <th className="py-3.5 px-3 text-center">التقدير اللفظي</th>
                    <th className="py-3.5 px-3 text-center">إجراءات سريعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                  {classStudents.map((st, idx) => {
                    const score = getStudentScore(st.id);
                    const total = score.coursework + score.exam;
                    const pct = (total / 100) * 100;
                    const app = LibyanExamEngine.getAppreciation(pct);
                    const isPass = total >= 50;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img src={getCleanAvatar(st.name, st.gender)} alt={st.name} className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                            <div>
                              <span className="font-black text-slate-900 dark:text-white text-sm block">{st.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{st.nationalNumber || st.nationalId}</span>
                            </div>
                          </div>
                        </td>

                        {gradingMode === 'quick' ? (
                          <>
                            {/* Coursework Quick Input */}
                            <td className="py-3 px-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={40}
                                value={score.coursework}
                                onChange={e => handleUpdateStudentScore(st.id, 'coursework', Number(e.target.value))}
                                className="w-20 py-2 px-2 rounded-xl text-center font-mono font-black text-sm border-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </td>

                            {/* Exam Quick Input */}
                            <td className="py-3 px-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={60}
                                value={score.exam}
                                onChange={e => handleUpdateStudentScore(st.id, 'exam', Number(e.target.value))}
                                className="w-20 py-2 px-2 rounded-xl text-center font-mono font-black text-sm border-2 border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-2 text-center">
                              <input
                                type="number"
                                min={0}
                                max={10}
                                value={score.t1 ?? 9}
                                onChange={e => handleUpdateStudentScore(st.id, 't1', Number(e.target.value))}
                                className="w-12 py-1.5 text-center font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                              />
                            </td>
                            <td className="py-3 px-2 text-center">
                              <input
                                type="number"
                                min={0}
                                max={10}
                                value={score.t2 ?? 9}
                                onChange={e => handleUpdateStudentScore(st.id, 't2', Number(e.target.value))}
                                className="w-12 py-1.5 text-center font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                              />
                            </td>
                            <td className="py-3 px-2 text-center">
                              <input
                                type="number"
                                min={0}
                                max={10}
                                value={score.hw ?? 9}
                                onChange={e => handleUpdateStudentScore(st.id, 'hw', Number(e.target.value))}
                                className="w-12 py-1.5 text-center font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                              />
                            </td>
                            <td className="py-3 px-2 text-center">
                              <input
                                type="number"
                                min={0}
                                max={10}
                                value={score.mid ?? 9}
                                onChange={e => handleUpdateStudentScore(st.id, 'mid', Number(e.target.value))}
                                className="w-12 py-1.5 text-center font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                              />
                            </td>
                            <td className="py-3 px-2 text-center font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/20">
                              {score.coursework}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={60}
                                value={score.exam}
                                onChange={e => handleUpdateStudentScore(st.id, 'exam', Number(e.target.value))}
                                className="w-16 py-1.5 text-center font-mono font-black rounded-lg border-2 border-blue-400 dark:border-blue-700 bg-blue-50/50 dark:bg-slate-800"
                              />
                            </td>
                          </>
                        )}

                        {/* Total Score */}
                        <td className="py-3 px-3 text-center font-mono font-black text-base bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                          {total}
                        </td>

                        {/* Appreciation Badge */}
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black inline-block ${
                            isPass
                              ? app === 'ممتاز'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                          }`}>
                            {app} {isPass ? '🟢' : '🔴'}
                          </span>
                        </td>

                        {/* 1-Tap Quick Adjust */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateStudentScore(st.id, 'coursework', 39);
                                handleUpdateStudentScore(st.id, 'exam', 58);
                                sound.playTap();
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg text-[10px] font-bold"
                              title="تعيين الدرجة ممتاز"
                            >
                              ⭐ كاملة
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sticky Bottom Save & Certification Bar */}
          <div className="sticky bottom-4 z-20 pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSaveAllGrades}
              className="flex-1 py-4 px-6 rounded-3xl font-black text-sm sm:text-base shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="w-5 h-5" />
              <span>💾 حفظ وتثبيت درجات {teacherSubject} لفصل ({selectedClass})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleSaveAllGrades();
                LibyanExamEngine.submitForAdminApproval(selectedClass, currentTeacher?.name || 'معلم المادة', teacherSubject);
                sound.playFanfare();
                triggerConfetti();
                showToast('gold', 'تم إرسال الدرجات للاعتماد 🔒', `تم إرسال كشف درجات ${teacherSubject} لفصل (${selectedClass}) رسمياً لإدارة المدرسة لاعتماده.`);
              }}
              className="flex-1 py-4 px-6 rounded-3xl font-black text-sm sm:text-base shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-95 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950"
            >
              <span>🔒 إرسال الكشف للاعتماد الرسمي للإدارة 🏛️</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: 1-TAP PRE-MADE MESSAGES TO PARENTS                            */}
      {/* ========================================================================= */}
      {activeAction === 'quick-message' && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Target Student */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-3xl border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={getCleanAvatar(activeStudent?.name || '', activeStudent?.gender)} alt={activeStudent?.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block">إرسال تنبيه لولي أمر الطالب:</span>
                <h4 className="font-black text-base text-slate-900 dark:text-white">{activeStudent?.name}</h4>
              </div>
            </div>

            {/* Quick Change Student Dropdown */}
            <select
              value={activeStudent?.id}
              onChange={e => { setSelectedStudentId(e.target.value); sound.playTap(); }}
              className="p-2.5 rounded-2xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 font-bold text-xs"
            >
              {classStudents.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>

          {/* 1-Tap Message Cards */}
          <div className="space-y-3">
            <label className="font-black text-base text-slate-800 dark:text-white block">
              اختر رسالة جاهزة (ستصل إشعاراً فورياً لهاتف ولي الأمر بنقرة واحدة):
            </label>

            {[
              { text: '👏 طالب مجتهد ومتميز اليوم! أظهر تفوقاً وتفاعلاً رائعاً في الحصة الدراسية.', type: 'positive', icon: '🌟' },
              { text: '⚠️ تنبيه: لم يقم الطالب بحل الواجب المدرسي المقرر لليوم، نرجو المتابعة.', type: 'warning', icon: '📝' },
              { text: '⏰ تنبيه: تأخر الطالب عن الحصة الدراسية، يرجى التنبيه على الحضور في الموعد.', type: 'warning', icon: '⏰' },
              { text: '🌟 أداء ممتاز ودرجة مشرفة في الاختبار القصير للمادة، بارك الله في جهوده.', type: 'positive', icon: '🎉' },
              { text: '📞 يرجى التواصل مع إدارة المدرسة أو المعلم لمتابعة المستوى الدراسي للطالب.', type: 'alert', icon: '📞' },
            ].map((msg, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuickMessage(msg.text)}
                className="w-full p-4 sm:p-5 rounded-3xl border-2 text-right transition-all flex items-center justify-between gap-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-sm active:scale-98 group"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">{msg.icon}</span>
                  <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">{msg.text}</span>
                </div>

                <div className="px-4 py-2 bg-blue-600 group-hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center gap-1.5 shrink-0 shadow-sm">
                  <Send className="w-4 h-4" />
                  <span>إرسال الآن</span>
                </div>
              </button>
            ))}
          </div>

        </div>
      )}

      {/* Quick System Guide Modal */}
      <QuickSystemGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Teacher Selection Modal */}
      <TeacherSelectionModal
        isOpen={showTeacherSelectModal}
        onClose={() => setShowTeacherSelectModal(false)}
        teachers={teachers}
        currentTeacher={currentTeacher}
        requireCode
        onSelectTeacher={teacher => {
          // الأخصائي الاجتماعي لا يُدخل بالنقرة — برمزه الخاص فقط (منع الترقية الجانبية)
          if (teacher.code === 'LIB-SOC-01' || teacher.subjectCode === 'COUNSEL') {
            sound.playAlert();
            showToast('error', '⛔ دخول محمي', 'حساب الأخصائي الاجتماعي يتطلب رمز الدخول الخاص به من شاشة تسجيل الدخول.');
            return;
          }
          selectTeacher(teacher);
          if (teacher.assignedClasses && teacher.assignedClasses.length > 0) {
            setSelectedClass(teacher.assignedClasses[0]);
          }
        }}
      />

    </div>
  );
};
