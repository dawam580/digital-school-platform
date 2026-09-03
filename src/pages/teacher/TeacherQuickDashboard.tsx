import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
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
  LogOut
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

export const TeacherQuickDashboard: React.FC = () => {
  const {
    currentTeacher,
    students,
    updateAttendance,
    markAllPresent,
    updateStudentGrade,
    addNotification,
    showToast,
    isLargeFontMode,
    toggleLargeFontMode,
    logout
  } = useSchool();

  // Active section inside the teacher portal
  const [activeAction, setActiveAction] = useState<'attendance' | 'grading' | 'quick-message'>('attendance');

  // Selected class
  const assignedClasses = currentTeacher?.assignedClasses || ['3/أ', '3/ب', '2/أ'];
  const [selectedClass, setSelectedClass] = useState<string>(assignedClasses[0] || '3/أ');

  // Filter students for the selected class
  const classStudents = students.filter(s => s.className === selectedClass || s.className.includes(selectedClass));

  // Selected student for grading or messaging
  const [selectedStudentId, setSelectedStudentId] = useState<string>(classStudents[0]?.id || students[0]?.id || '');
  const activeStudent = students.find(s => s.id === selectedStudentId) || classStudents[0] || students[0];

  // Quick grading state
  const [gradeType, setGradeType] = useState<'coursework' | 'exam'>('coursework');
  const [quickScore, setQuickScore] = useState<number>(18);
  const [evaluationWord, setEvaluationWord] = useState<string>('ممتاز');

  // Success indicator
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // 1. One-Tap Status Change
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    sound.playTap();
    updateAttendance(studentId, status);
  };

  // 2. One-Tap Mark All Present
  const handleMarkAll = () => {
    sound.playSuccess();
    triggerConfetti();
    classStudents.forEach(s => updateAttendance(s.id, 'present'));
    showToast('success', 'رائع جداً 👏', `تم تحضير جميع طلاب فصل ${selectedClass} حاضرين بنجاح!`);
  };

  // 3. Save Attendance with Feedback
  const handleSaveAttendance = () => {
    sound.playFanfare();
    triggerConfetti();
    setAttendanceSaved(true);
    addNotification(
      `تم اعتماد حضور فصل ${selectedClass}`,
      `قام الأستاذ ${currentTeacher?.name || 'المعلم'} باعتماد كشف الحضور اليومي وإشعار أولياء الأمور فوراً.`,
      'attendance'
    );
    showToast('gold', 'تم الحفظ والاعتماد 💾', `تم تثبيت كشف حضور فصل ${selectedClass} بنجاح.`);
    setTimeout(() => setAttendanceSaved(false), 3000);
  };

  // 4. One-Tap Grade Save
  const handleSaveGrade = (evalText: string, scoreVal: number) => {
    if (!activeStudent) return;
    sound.playSuccess();
    setEvaluationWord(evalText);
    setQuickScore(scoreVal);

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

  return (
    <div className={`space-y-6 text-right animate-in fade-in max-w-5xl mx-auto pb-20 font-cairo ${isLargeFontMode ? 'text-lg' : 'text-base'}`}>
      
      {/* Friendly Top Welcome Card (Optimized for Older Teachers) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 p-1 border-2 border-emerald-400/40 shrink-0 shadow-inner flex items-center justify-center text-3xl">
            👨‍🏫
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs sm:text-sm font-black border border-emerald-400/30 mb-1">
              <span>بوابة المعلم الميسرة • الوضع السريع لكبار السن</span>
            </div>
            <h1 className={`${isLargeFontMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black`}>
              أهلاً بك: {currentTeacher?.name || 'أ. طارق الفيتوري'}
            </h1>
            <p className="text-emerald-200/90 text-sm sm:text-base font-medium mt-0.5">
              مادة: <strong className="text-white underline decoration-emerald-400 underline-offset-4">{currentTeacher?.subject || 'الرياضيات'}</strong> • رمز المعلم: <span className="font-mono bg-white/20 px-2 py-0.5 rounded-lg text-xs">{currentTeacher?.code || 'LIB-MATH-01'}</span>
            </p>
          </div>
        </div>

        {/* Header Actions: Back Button + Large Font Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto justify-end">
          {/* Prominent Back Button */}
          <button
            onClick={() => { logout(); sound.playTap(); }}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm border border-rose-400/50 shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
            title="الرجوع إلى شاشة الدخول واختيار البوابة"
          >
            <LogOut className="w-4 h-4" />
            <span>⬅️ رجوع (خروج)</span>
          </button>

          {/* Accessibility Large Font Toggle */}
          <button
            onClick={toggleLargeFontMode}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-xs sm:text-sm border border-white/20 flex items-center justify-center gap-2 transition active:scale-95"
          >
            {isLargeFontMode ? <ZoomOut className="w-5 h-5 text-amber-300" /> : <ZoomIn className="w-5 h-5 text-emerald-300" />}
            <span>{isLargeFontMode ? 'الخط العادي' : 'تكبير الخط 🔍'}</span>
          </button>
        </div>
      </div>

      {/* Class Switcher Pills (Giant Touch Targets) */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-black text-slate-700 dark:text-slate-300 text-sm sm:text-base shrink-0">
          اختر الفصل الدراسي:
        </span>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {assignedClasses.map(cls => (
            <button
              key={cls}
              onClick={() => { setSelectedClass(cls); sound.playTap(); }}
              className={`flex-1 sm:flex-initial py-3 px-6 rounded-2xl font-black text-base sm:text-lg transition-all active:scale-95 shadow-sm border ${
                selectedClass === cls
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              فصل ({cls})
            </button>
          ))}
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
              2. رصد الدرجات والتقييم
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
              اختيارات جاهزة: ممتاز، جيد جداً، جيد
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
          
          {/* Top Control: Mark All Present Giant Button */}
          <div className="p-4 bg-emerald-100/70 dark:bg-emerald-950/40 rounded-3xl border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-lg text-emerald-950 dark:text-emerald-200">
                كشف حضور طلاب فصل ({selectedClass}) • ({classStudents.length}) طالب
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                اضغط على الزر الأخضر بالأسفل لتحضير الفصل بالكامل دفعة واحدة، أو اضغط على حالة كل طالب:
              </p>
            </div>

            <button
              onClick={handleMarkAll}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>🟢 الكل حاضر بلمسة واحدة</span>
            </button>
          </div>

          {/* Student Rows (Large, High-Contrast Touch Cards) */}
          <div className="space-y-3">
            {classStudents.map((student, idx) => {
              const isPresent = student.status === 'present';
              const isAbsent = student.status === 'unexcused';
              const isLate = student.status === 'late';

              return (
                <div
                  key={student.id}
                  className={`p-4 sm:p-5 rounded-3xl border-2 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    isPresent
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : isAbsent
                      ? 'bg-red-50/40 dark:bg-red-950/20 border-red-300 dark:border-red-800'
                      : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                  }`}
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center text-sm shrink-0">
                      {idx + 1}
                    </span>

                    <img
                      src={student.avatar}
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

                  {/* Giant Status Selection Buttons (Min 48px height) */}
                  <div className="grid grid-cols-3 gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => handleStatusChange(student.id, 'present')}
                      className={`py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
                        isPresent
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                      <span>حاضر 🟢</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(student.id, 'unexcused')}
                      className={`py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
                        isAbsent
                          ? 'bg-red-600 text-white border-red-600 shadow-md scale-105'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-red-50'
                      }`}
                    >
                      <span>غائب 🔴</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(student.id, 'late')}
                      className={`py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
                        isLate
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-105'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50'
                      }`}
                    >
                      <span>متأخر 🟡</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

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
      {/* SECTION 2: 1-TAP QUICK GRADING                                           */}
      {/* ========================================================================= */}
      {activeAction === 'grading' && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Step 1: Select Student */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="font-black text-base text-slate-800 dark:text-white block">
              1. اختر الطالب المراد تقييمه:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
              {classStudents.map(st => (
                <button
                  key={st.id}
                  onClick={() => { setSelectedStudentId(st.id); sound.playTap(); }}
                  className={`p-3 rounded-2xl border text-right font-bold text-sm transition-all flex items-center gap-2.5 ${
                    st.id === activeStudent?.id
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <img src={st.avatar} alt={st.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <span className="truncate">{st.name.split(' ').slice(0, 2).join(' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Student Target Card */}
          {activeStudent && (
            <div className="p-5 bg-amber-50 dark:bg-amber-950/30 rounded-3xl border border-amber-300 dark:border-amber-700 flex items-center gap-4">
              <img src={activeStudent.avatar} alt={activeStudent.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">الطالب المختار للتقييم الآن:</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{activeStudent.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">فصل: {activeStudent.className} • المادة: {currentTeacher?.subject || 'الرياضيات'}</p>
              </div>
            </div>
          )}

          {/* Step 2: 1-Tap Evaluation Buttons (Giant Badges) */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <label className="font-black text-base text-slate-800 dark:text-white block">
              2. التقييم السريع بلمسة واحدة (اختر التقييم وسيتم الرصد فوراً):
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <button
                onClick={() => handleSaveGrade('ممتاز', 20)}
                className="p-5 rounded-3xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg text-center shadow-lg active:scale-95 transition flex flex-col items-center gap-2"
              >
                <span className="text-3xl">⭐</span>
                <span>ممتاز (20)</span>
              </button>

              <button
                onClick={() => handleSaveGrade('جيد جداً', 18)}
                className="p-5 rounded-3xl bg-blue-500 hover:bg-blue-600 text-white font-black text-lg text-center shadow-lg active:scale-95 transition flex flex-col items-center gap-2"
              >
                <span className="text-3xl">✨</span>
                <span>جيد جداً (18)</span>
              </button>

              <button
                onClick={() => handleSaveGrade('جيد', 15)}
                className="p-5 rounded-3xl bg-teal-500 hover:bg-teal-600 text-white font-black text-lg text-center shadow-lg active:scale-95 transition flex flex-col items-center gap-2"
              >
                <span className="text-3xl">👍</span>
                <span>جيد (15)</span>
              </button>

              <button
                onClick={() => handleSaveGrade('مقبول', 12)}
                className="p-5 rounded-3xl bg-amber-500 hover:bg-amber-600 text-white font-black text-lg text-center shadow-lg active:scale-95 transition flex flex-col items-center gap-2"
              >
                <span className="text-3xl">⚖️</span>
                <span>مقبول (12)</span>
              </button>

              <button
                onClick={() => handleSaveGrade('يحتاج تحسين', 9)}
                className="p-5 rounded-3xl bg-rose-500 hover:bg-rose-600 text-white font-black text-lg text-center shadow-lg active:scale-95 transition flex flex-col items-center gap-2"
              >
                <span className="text-3xl">⚠️</span>
                <span>يحتاج تحسين (9)</span>
              </button>
            </div>
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
              <img src={activeStudent?.avatar} alt={activeStudent?.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-400 shrink-0" />
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

    </div>
  );
};
