import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Award,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  Printer,
  Sparkles,
  UserCheck,
  AlertTriangle,
  Send,
  Plus,
  HeartHandshake,
  Star,
  Bell,
  ChevronLeft,
  GraduationCap,
  ShieldCheck,
  Phone,
  LogOut,
  X,
  MessageSquare
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { PrintableStudentGradeCard } from '../../components/exams/PrintableStudentGradeCard';
import { Student } from '../../types';

export const ParentDashboard: React.FC = () => {
  const {
    selectedStudent,
    setSelectedStudent,
    students,
    updateAttendance,
    addNotification,
    showToast,
    currentUserPhone,
    logout,
    linkStudent
  } = useSchool();

  // Active section inside the parent dashboard
  const [activeTab, setActiveTab] = useState<'grades' | 'attendance' | 'behavior'>('grades');

  // Printable Grade Card Modal
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Link Another Child Modal
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [childCodeInput, setChildCodeInput] = useState<string>('');

  // Submit Absence Excuse Modal / Form
  const [showExcuseModal, setShowExcuseModal] = useState<boolean>(false);
  const [excuseDate, setExcuseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [excuseReason, setExcuseReason] = useState<string>('ظرف صحي طارئ (مرفق التقرير الطبي)');
  const [isSubmittingExcuse, setIsSubmittingExcuse] = useState<boolean>(false);

  // Identify all children of this parent
  // If parent phone matches or linkCode matches, or fallback to first 2-3 demo students
  const parentChildren: Student[] = students.filter(
    s => (currentUserPhone && s.parentPhone === currentUserPhone) ||
         s.id === selectedStudent?.id
  );

  // Ensure at least the currently selected student and another demo child are available for multi-child testing
  const displayChildren = parentChildren.length > 0 
    ? parentChildren 
    : [selectedStudent || students[0], students[1]].filter(Boolean);

  const activeChild = selectedStudent || displayChildren[0] || students[0];

  // Handle switching active child
  const handleSelectChild = (child: Student) => {
    setSelectedStudent(child);
    sound.playTap();
    showToast('info', 'تم التبديل 🔄', `أنت الآن تتابع بيانات الطالب (${child.name.split(' ')[0]})`);
  };

  // Handle linking a new child
  const handleLinkNewChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childCodeInput.trim()) return;

    const success = linkStudent(childCodeInput.trim());
    if (success) {
      sound.playSuccess();
      triggerConfetti();
      showToast('gold', 'تم ربط الطالب بنجاح 🎉', 'تمت إضافة ابنك إلى حسابك والمتابعة الفورية.');
      setShowLinkModal(false);
      setChildCodeInput('');
    } else {
      sound.playAlert();
      showToast('error', 'رمز غير صحيح', 'تأكد من رمز الطالب أو رقمه الوطني المكون من 4 أرقام أو 12 رقماً.');
    }
  };

  // Handle submitting absence excuse
  const handleSubmitExcuse = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingExcuse(true);

    setTimeout(() => {
      updateAttendance(activeChild.id, 'excused', excuseReason);
      addNotification(
        `📝 عذر طبي مقدم للطالب: ${activeChild.name}`,
        `قدم ولي الأمر عذر غياب بتاريخ ${excuseDate}. السبب: ${excuseReason}`,
        'attendance',
        activeChild.name
      );

      sound.playSuccess();
      triggerConfetti();
      showToast('gold', 'تم إرسال العذر لإدارة المدرسة ✅', 'تم قيد العذر وإشعار الإدارة ومشرف الحضور.');
      setIsSubmittingExcuse(false);
      setShowExcuseModal(false);
    }, 600);
  };

  return (
    <div className="space-y-6 text-right font-cairo max-w-5xl mx-auto pb-16 animate-in fade-in">
      
      {/* 1. Header Card with Parent Welcome & Child Selector */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Welcome Text */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-black border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              <span>بوابة أولياء الأمور الموحدة • خصوصية تامة لأبنائك فقط</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              أهلاً بك: {activeChild.parentName || 'ولي الأمر الكريم'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 font-medium">
              متابعة يومية مباشرة لنتائج وحضور وسلوك أبنائك لحظة بلحظة
            </p>
          </div>

          {/* Top Actions: Print Card + Add Child + Logout */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
            <button
              onClick={() => { setShowPrintModal(true); sound.playTap(); }}
              className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-black shadow-md flex items-center gap-1.5 transition active:scale-95"
              title="طباعة بطاقة إخطار درجات الطالب الرسمية"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ طباعة الشهادة</span>
            </button>

            <button
              onClick={() => { setShowLinkModal(true); sound.playTap(); }}
              className="px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold border border-white/20 shadow flex items-center gap-1.5 transition active:scale-95"
              title="ربط ابن آخر بحسابك"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>إضافة ابن ➕</span>
            </button>

            <button
              onClick={() => { logout(); sound.playTap(); }}
              className="px-3.5 py-2 rounded-2xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold shadow flex items-center gap-1.5 transition active:scale-95"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* Multi-Child Selector Pills */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs font-bold text-blue-200">
            أبناؤك المسجلون (اضغط للتبديل السريع):
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {displayChildren.map(child => {
              const isSelected = child.id === activeChild.id;
              return (
                <button
                  key={child.id}
                  onClick={() => handleSelectChild(child)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all active:scale-95 border ${
                    isSelected
                      ? 'bg-white text-blue-950 border-white shadow-lg font-black'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  }`}
                >
                  <img
                    src={child.avatar}
                    alt={child.name}
                    className="w-6 h-6 rounded-full object-cover border border-current"
                  />
                  <span>{child.name.split(' ')[0]} ({child.className})</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Active Child Identification Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative">
            <img
              src={activeChild.avatar}
              alt={activeChild.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-500 shadow"
            />
            <span
              className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${
                activeChild.status === 'present'
                  ? 'bg-emerald-500 text-white border-white'
                  : 'bg-rose-500 text-white border-white'
              }`}
            >
              {activeChild.status === 'present' ? 'حاضر اليوم' : 'غائب'}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {activeChild.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {activeChild.grade} • شعبة ({activeChild.className})
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono flex-wrap">
              <span>الرقم الوطني: <strong>{activeChild.nationalNumber || activeChild.nationalId}</strong></span>
              <span>•</span>
              <span>رقم القيد: <strong>{activeChild.studentNumber}</strong></span>
            </div>
          </div>
        </div>

        {/* Medical Excuse Trigger Button */}
        <button
          onClick={() => { setShowExcuseModal(true); sound.playTap(); }}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs sm:text-sm font-black shadow-sm flex items-center justify-center gap-2 transition active:scale-95"
        >
          <CalendarCheck className="w-4 h-4 text-amber-600" />
          <span>تقديم عذر غياب طبي 📝</span>
        </button>
      </div>

      {/* 3. Four Big Highlight Metric Circles / Cards (دوائر بارزة + أرقام سريعة) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Attendance Rate */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col items-center justify-center space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border-4 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-lg sm:text-xl shadow-inner">
            {activeChild.attendanceRate || 98}%
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 block">
              نسبة الحضور
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
              19 يوم حضور • 1 غياب
            </span>
          </div>
        </div>

        {/* Card 2: Academic Average & Rank */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col items-center justify-center space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-50 dark:bg-blue-950/50 border-4 border-blue-500 flex items-center justify-center text-blue-700 dark:text-blue-300 font-black text-lg sm:text-xl shadow-inner">
            {activeChild.academicAverage || 96.5}%
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 block">
              المعدل العام ({activeChild.appreciation || 'ممتاز'})
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold block">
              الترتيب: الثاني على الفصل 🥈
            </span>
          </div>
        </div>

        {/* Card 3: Behavior Points */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col items-center justify-center space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-50 dark:bg-amber-950/50 border-4 border-amber-500 flex items-center justify-center text-amber-700 dark:text-amber-400 font-black text-lg sm:text-xl shadow-inner">
            +{activeChild.behaviorPointsTotal || 48}
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 block">
              نقاط التميز السلوكي
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block">
              سلوك قدوة ومنضبط ⭐
            </span>
          </div>
        </div>

        {/* Card 4: Direct School Notifications */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col items-center justify-center space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-50 dark:bg-purple-950/50 border-4 border-purple-500 flex items-center justify-center text-purple-700 dark:text-purple-300 font-black text-lg sm:text-xl shadow-inner">
            {activeChild.notes?.length || 2}
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 block">
              رسائل وتنبيهات المدرسة
            </span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold block">
              متابعة مباشرة من المعلمين
            </span>
          </div>
        </div>

      </div>

      {/* 4. Three Main Section Tabs (WhatsApp-like simplicity) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => { setActiveTab('grades'); sound.playTap(); }}
          className={`flex-1 py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'grades'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>1. كشف الدرجات والنتائج</span>
        </button>

        <button
          onClick={() => { setActiveTab('attendance'); sound.playTap(); }}
          className={`flex-1 py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'attendance'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>2. الحضور والأعذار الطبية</span>
        </button>

        <button
          onClick={() => { setActiveTab('behavior'); sound.playTap(); }}
          className={`flex-1 py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'behavior'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>3. السلوك وملاحظات المعلمين</span>
        </button>
      </div>

      {/* SECTION 1: GRADES & SUBJECT REPORT */}
      {activeTab === 'grades' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>كشف درجات الطالب الفصلي وفق المنهج الليبي المعتمد</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold">
                  أعمال سنة 40 + امتحان 60
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تُعتمد درجات النجاح الصغرى 50% لكل مادة على حدة
              </p>
            </div>

            <button
              onClick={() => { setShowPrintModal(true); sound.playTap(); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow transition active:scale-95 self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة إخطار الدرجات (A4)</span>
            </button>
          </div>

          {/* Subjects Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">المادة</th>
                  <th className="p-3">معلم المادة</th>
                  <th className="p-3 text-center">أعمال السنة (40)</th>
                  <th className="p-3 text-center">الامتحان النهائي (60)</th>
                  <th className="p-3 text-center">المجموع (100)</th>
                  <th className="p-3 text-center">التقدير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {(activeChild.grades && activeChild.grades.length > 0
                  ? activeChild.grades
                  : [
                      { id: '1', subjectName: 'الرياضيات', teacherName: 'أ. طارق الفيتوري', coursework: 38, finalExam: 57, total: 95, appreciation: 'ممتاز' },
                      { id: '2', subjectName: 'اللغة العربية', teacherName: 'أ. عبدالسلام الورفلي', coursework: 39, finalExam: 58, total: 97, appreciation: 'ممتاز' },
                      { id: '3', subjectName: 'العلوم الطبيعية', teacherName: 'أ. مريم الترهوني', coursework: 37, finalExam: 55, total: 92, appreciation: 'ممتاز' },
                      { id: '4', subjectName: 'اللغة الإنجليزية', teacherName: 'أ. فاطمة الزوي', coursework: 36, finalExam: 54, total: 90, appreciation: 'ممتاز' },
                      { id: '5', subjectName: 'الدراسات الاجتماعية', teacherName: 'أ. وليد المصراتي', coursework: 38, finalExam: 56, total: 94, appreciation: 'ممتاز' },
                      { id: '6', subjectName: 'التربية الإسلامية', teacherName: 'أ. محمود السويحلي', coursework: 40, finalExam: 59, total: 99, appreciation: 'ممتاز' },
                      { id: '7', subjectName: 'الحاسوب وتقنية المعلومات', teacherName: 'أ. أسامة المقريف', coursework: 39, finalExam: 58, total: 97, appreciation: 'ممتاز' }
                    ]
                ).map((grade: any, idx: number) => {
                  const coursework = grade.courseworkScore ?? grade.coursework ?? grade.period1 + (grade.period2 || 0) ?? 38;
                  const exam = grade.finalExam ?? grade.examScore ?? 56;
                  const total = coursework + exam;
                  const isPass = total >= 50;

                  return (
                    <tr key={grade.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold flex items-center gap-2">
                        <span className="text-base">{grade.icon || '📘'}</span>
                        <span>{grade.subjectName || grade.name}</span>
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 font-medium">
                        {grade.teacherName || grade.teacher || 'معلم المادة'}
                      </td>
                      <td className="p-3 text-center font-bold font-mono">
                        {coursework} / 40
                      </td>
                      <td className="p-3 text-center font-bold font-mono">
                        {exam} / 60
                      </td>
                      <td className="p-3 text-center font-black font-mono text-blue-600 dark:text-blue-400">
                        {total} / 100
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                            isPass
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {grade.appreciation || (total >= 85 ? 'ممتاز' : total >= 75 ? 'جيد جداً' : total >= 65 ? 'جيد' : total >= 50 ? 'مقبول' : 'دور ثانٍ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: ATTENDANCE & EXCUSE SUBMISSION */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                سجل الحضور والغياب اليومي للابن
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديث فوري عند مرور الطالب من البوابة المدرسية أو تحضير المعلم
              </p>
            </div>

            <button
              onClick={() => { setShowExcuseModal(true); sound.playTap(); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow transition active:scale-95 self-start sm:self-auto"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>تقديم عذر غياب جديد</span>
            </button>
          </div>

          {/* Today Status Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl shrink-0">
                ✅
              </div>
              <div>
                <strong className="text-emerald-950 dark:text-emerald-200 text-sm block">
                  حالة اليوم: مسجل حاضر في المدرسة
                </strong>
                <span className="text-xs text-emerald-700 dark:text-emerald-300">
                  وقت الحضور: 07:45 صباحاً • الطابور الصباحي
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black shrink-0">
              منتظم
            </span>
          </div>

          {/* Past Attendance Days */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400">آخر أيام الحضور المسجلة:</h4>
            <div className="space-y-2">
              {[
                { date: 'اليوم (الخميس)', status: 'present', text: 'حضور مبكر ومنضبط', time: '07:45 ص' },
                { date: 'أمس (الأربعاء)', status: 'present', text: 'حضور منتظم مع الطابور', time: '07:50 ص' },
                { date: 'الثلاثاء الماضي', status: 'present', text: 'حضور منتظم', time: '07:48 ص' },
                { date: 'الإثنين الماضي', status: 'excused', text: 'عذر طبي معتمد من الإدارة', time: 'عذر رسمي' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{item.date}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 dark:text-slate-300">{item.text}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-bold">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: BEHAVIOR & TEACHER NOTES */}
      {activeTab === 'behavior' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>نقاط التميز السلوكي وملاحظات المعلمين المباشرة</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                +{activeChild.behaviorPointsTotal || 48} نقطة تميز
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              رسائل وتعزيزات المعلمين الموجهة لابنك فقط
            </p>
          </div>

          {/* Behavior Points Badges */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400">سجل التعزيزات السلوكية:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(activeChild.behaviorPoints || [
                { id: '1', title: 'مشاركة ممتازة في الحساب الذهني', points: 5, icon: '🌟', teacher: 'أ. طارق الفيتوري (الرياضيات)', date: 'اليوم' },
                { id: '2', title: 'إتقان تطبيق معمل الحاسوب', points: 4, icon: '💻', teacher: 'أ. أسامة المقريف (الحاسوب)', date: 'أمس' },
                { id: '3', title: 'نظافة الكتاب وحل الواجب المدرسي', points: 3, icon: '📖', teacher: 'أ. عبدالسلام الورفلي (اللغة العربية)', date: 'قبل يومين' },
              ]).map((bp: any) => (
                <div
                  key={bp.id}
                  className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3"
                >
                  <span className="text-2xl">{bp.icon || '⭐'}</span>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs sm:text-sm text-slate-900 dark:text-white font-bold">
                        {bp.title}
                      </strong>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-black text-xs font-mono">
                        +{bp.points}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {bp.teacher} • {bp.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Direct Notes */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400">رسائل وتنبيهات المعلمين المباشرة:</h4>
            <div className="space-y-2">
              {[
                {
                  teacher: 'أ. طارق الفيتوري (معلم الرياضيات)',
                  text: `السلام عليكم، يسعدني إبلاغكم بأن ${activeChild.name.split(' ')[0]} أظهر تميزاً ملحوظاً اليوم في حل مسائل الهندسة الرياضية وسرعة البديهة. شكراً لاهتمامكم ومتابعتكم من البيت.`,
                  date: 'اليوم 10:30 ص'
                },
                {
                  teacher: 'أ. مريم الترهوني (معلمة العلوم)',
                  text: `أنجز الطالب تجربة تصنيف المواد الكيميائية بالمعمل بدقة ونظافة ممتازة. أهنئكم على تفوقه.`,
                  date: 'أمس 11:15 ص'
                }
              ].map((note, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-black text-blue-900 dark:text-blue-300">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{note.teacher}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{note.date}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT ABSENCE EXCUSE */}
      {showExcuseModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📝</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  تقديم عذر غياب للمدرسة
                </h3>
              </div>
              <button
                onClick={() => setShowExcuseModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExcuse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم الطالب:
                </label>
                <input
                  type="text"
                  disabled
                  value={activeChild.name}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تاريخ الغياب:
                </label>
                <input
                  type="date"
                  value={excuseDate}
                  onChange={e => setExcuseDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  سبب العذر:
                </label>
                <textarea
                  rows={3}
                  value={excuseReason}
                  onChange={e => setExcuseReason(e.target.value)}
                  placeholder="اكتب سبب الغياب بالتفصيل (مثل: مراجعة المستشفى، وعكة صحية، ظرف عائلي)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExcuseModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExcuse}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md flex items-center gap-1.5 transition active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingExcuse ? 'جارٍ الإرسال...' : 'إرسال العذر للإدارة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LINK ANOTHER CHILD */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">➕</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  ربط ابن آخر بحسابك
                </h3>
              </div>
              <button
                onClick={() => setShowLinkModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLinkNewChild} className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                أدخل رمز الطالب (المكون من 4 أرقام أو كود الربط أو الرقم الوطني الصادر من المدرسة):
              </p>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رمز الربط أو الرقم الوطني:
                </label>
                <input
                  type="text"
                  placeholder="مثال: SCH-2026-L2 أو 220082345678"
                  value={childCodeInput}
                  onChange={e => setChildCodeInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Demo Hint */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200">
                <span>💡 للتجربة السريعة: اضغط لربط الابنة آية الترهوني: </span>
                <button
                  type="button"
                  onClick={() => setChildCodeInput('SCH-2026-L2')}
                  className="font-black text-blue-700 dark:text-blue-300 underline"
                >
                  SCH-2026-L2
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md flex items-center gap-1.5 transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تأكيد الربط</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE STUDENT GRADE CARD */}
      <PrintableStudentGradeCard
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        student={activeChild}
        rank={2}
      />

    </div>
  );
};
