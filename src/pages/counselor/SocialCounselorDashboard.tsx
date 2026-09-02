import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  HeartHandshake,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  MessageSquare,
  Mail,
  Printer,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  UserCheck,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  Award,
  Zap,
  Flame,
  Send,
  Bell,
  ArrowRight,
  Check,
  LayoutGrid,
  FileSpreadsheet,
  User,
  School
} from 'lucide-react';
import {
  SocialCaseStudy,
  CounselingSession,
  ParentSummon,
  CommonProblemSolution,
  AutoSummonCard,
  StudentFollowUpForm,
  Student
} from '../../types';
import { LIBYAN_COMMON_PROBLEMS } from '../../services/counselor/libyanSchoolProblems';
import { NewCaseStudyModal } from '../../components/counselor/NewCaseStudyModal';
import { NewSessionModal } from '../../components/counselor/NewSessionModal';
import { NewSummonModal } from '../../components/counselor/NewSummonModal';
import { AutoSummonCardModal } from '../../components/counselor/AutoSummonCardModal';
import { StudentFollowUpFormModal } from '../../components/counselor/StudentFollowUpFormModal';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import logoImg from '../../assets/logo.png';

export const SocialCounselorDashboard: React.FC = () => {
  const {
    caseStudies,
    setCaseStudies,
    counselingSessions,
    setCounselingSessions,
    parentSummons,
    setParentSummons,
    autoSummonCards,
    setAutoSummonCards,
    followUpForms,
    setFollowUpForms,
    saveFollowUpForm,
    recordInfractionAndCheck,
    students,
    teachers,
    showToast,
    addNotification,
    currentUserPhone
  } = useSchool();

  // Navigation mode: 'main_menu' (2 buttons), 'reports'
  const [currentView, setCurrentView] = useState<'main_menu' | 'reports'>('main_menu');

  // Reports sub-tab: 'weekly' or 'monthly'
  const [reportSubTab, setReportSubTab] = useState<'weekly' | 'monthly'>('weekly');

  // Report scope: 'individual' (تقرير فردي لطالب مخصص) or 'comprehensive' (تقرير شامل لجميع الطلبة)
  const [reportScope, setReportScope] = useState<'individual' | 'comprehensive'>('comprehensive');

  // Selected student for individual report
  const [selectedStudentForReportId, setSelectedStudentForReportId] = useState<string>(students[0]?.id || '');

  // Modals state
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedFormForEdit, setSelectedFormForEdit] = useState<StudentFollowUpForm | null>(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showNewSummonModal, setShowNewSummonModal] = useState(false);
  const [selectedCardForModal, setSelectedCardForModal] = useState<AutoSummonCard | null>(null);
  const [presetProblemId, setPresetProblemId] = useState<string | undefined>(undefined);
  const [selectedCaseForSession, setSelectedCaseForSession] = useState<string | undefined>(undefined);
  const [selectedStudentForCase, setSelectedStudentForCase] = useState<string | undefined>(undefined);

  // Search in forms/reports
  const [searchQuery, setSearchQuery] = useState('');

  // Current selected student object
  const currentReportStudent = students.find(s => s.id === selectedStudentForReportId) || students[0];

  // Specific student follow-up form if exists
  const studentForm = followUpForms.find(f => f.studentId === currentReportStudent.id) || followUpForms[0];

  // Student specific infractions
  const studentAutoCards = autoSummonCards.filter(c => c.studentId === currentReportStudent.id);

  // Weekly & Monthly trigger cards
  const weeklyTriggerCards = autoSummonCards.filter(c => c.periodType === 'weekly');
  const monthlyTriggerCards = autoSummonCards.filter(c => c.periodType === 'monthly');
  const pendingAutoSummonsCount = autoSummonCards.filter(c => c.status === 'pending_counselor').length;
  const resolvedCasesCount = caseStudies.filter(c => c.status === 'resolved').length;

  const handleSaveForm = (form: StudentFollowUpForm) => {
    saveFollowUpForm(form);
  };

  const handleUpdateAutoCard = (updatedCard: AutoSummonCard) => {
    setAutoSummonCards(prev =>
      prev.map(c => (c.id === updatedCard.id ? updatedCard : c))
    );
    setSelectedCardForModal(updatedCard);
  };

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  const handleSendReportToAdmin = () => {
    sound.playSuccess();
    triggerConfetti();
    if (reportScope === 'individual') {
      addNotification(
        `📊 تقرير ${reportSubTab === 'weekly' ? 'أسبوعي' : 'شهري'} للطالب: ${currentReportStudent.name}`,
        `تم تصدير وإرسال التقرير الإرشادي الشامل للطالب إلى الإدارة المدرسية وولي الأمر.`,
        'academic',
        currentReportStudent.name
      );
      showToast('gold', 'تم إرسال التقرير بنجاح ✉️', `تم إرسال تقرير الطالب ${currentReportStudent.name} للإدارة المدرسية.`);
    } else {
      addNotification(
        `📊 التقرير ${reportSubTab === 'weekly' ? 'الأسبوعي' : 'الشهري'} الشامل لجميع الطلاب`,
        `أرسل المرشد التربوي التقرير الشامل لجميع طلبة المرحلة لإدارة المدرسة والمراقبة.`,
        'admin'
      );
      showToast('gold', 'تم إرسال التقرير الشامل بنجاح 📤', 'تم توجيه التقرير الشامل للإدارة ومراقبة التعليم.');
    }
  };

  // Quick simulation trigger for testing
  const handleSimulateWeeklyTrigger = () => {
    const testStudent = students[1] || students[0];
    sound.playTap();
    showToast('info', 'محاكاة تسجيل إنذارات...', `يتم رصد 3 إنذارات أسبوعية للطالب ${testStudent.name}`);

    setTimeout(() => {
      recordInfractionAndCheck(testStudent.id, {
        type: 'absence',
        typeLabel: 'غياب بدون عذر',
        title: 'غياب غير مبرر عن الحصة الأولى والثانية',
        date: new Date().toISOString().split('T')[0],
        time: '08:00 ص',
        reportedBy: 'إدارة الحضور',
        severity: 'alert'
      });
    }, 100);

    setTimeout(() => {
      recordInfractionAndCheck(testStudent.id, {
        type: 'lateness',
        typeLabel: 'تأخر صباحي',
        title: 'التأخر 20 دقيقة عن طابور الصباح',
        date: new Date().toISOString().split('T')[0],
        time: '08:20 ص',
        reportedBy: 'مشرف الطابور',
        severity: 'warning'
      });
    }, 300);

    setTimeout(() => {
      recordInfractionAndCheck(testStudent.id, {
        type: 'misconduct',
        typeLabel: 'مخالفة سلوكية',
        title: 'إثارة الفوضى ومقاطعة شرح المعلم',
        date: new Date().toISOString().split('T')[0],
        time: '10:15 ص',
        reportedBy: 'معلم الرياضيات',
        severity: 'warning'
      });
      setCurrentView('reports');
      setReportSubTab('weekly');
    }, 600);
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in max-w-5xl mx-auto pb-12 font-cairo">
      
      {/* Official Counselor Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-5 md:p-7 text-white shadow-2xl relative overflow-hidden border border-emerald-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-3xl shadow-xl border border-emerald-500/30">
              🤝
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-black">مكتب الخدمة الاجتماعية والإرشاد التربوي</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>نظام الأزرار المبسط</span>
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-1">
                وزارة التربية والتعليم - دولة ليبيا (2025 - 2026 م) • استمارات متابعة مستوى الطلاب والتقارير
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                المرشد التربوي / الأخصائية الاجتماعية: <strong className="text-white">أ. نجوى القماطي</strong> (الرمز: <span className="font-mono text-emerald-300">LIB-SOC-01</span>)
              </p>
            </div>
          </div>

          {currentView !== 'main_menu' && (
            <button
              onClick={() => { setCurrentView('main_menu'); sound.playTap(); }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-2xl transition text-xs border border-white/20 shrink-0 self-start md:self-auto"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للواجهة الرئيسية (الزرين)</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: MAIN LANDING SCREEN - 2 PROMINENT ACTION BUTTONS
          ========================================================================= */}
      {currentView === 'main_menu' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          
          <div className="text-center space-y-1 py-1">
            <h2 className="text-lg font-black text-slate-800 dark:text-white">
              مرحباً بك أ. نجوى، يرجى اختيار الإجراء المطلوب:
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              واجهة مبسطة مصممة بوضوح لإنجاز استمارات المتابعة وإصدار التقارير بنقرة زر
            </p>
          </div>

          {/* The 2 Primary Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            
            {/* BUTTON 1: تصنيف وتقييم طالب جديد */}
            <div
              onClick={() => {
                setSelectedFormForEdit(null);
                setShowFollowUpModal(true);
                sound.playTap();
              }}
              className="group cursor-pointer p-7 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-emerald-400/30 flex flex-col justify-between min-h-[250px] relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center text-3xl shadow-inner border border-white/30 group-hover:rotate-6 transition-transform">
                  📋
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black">تصنيف وتقييم طالب جديد</h3>
                    <span className="px-2.5 py-0.5 bg-white/20 text-white text-[11px] font-black rounded-full border border-white/30">
                      استمارة متابعة
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/90 leading-relaxed">
                    قائمة كاملة بجميع المواد الدراسية مع خيارات التقييم المباشرة (المستوى العلمي، حل الواجبات، المشاركة الصفية، والسلوك) مع آراء المعلمين والتوصيات.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs font-black">
                <span className="flex items-center gap-1.5 bg-white text-emerald-900 px-3.5 py-2 rounded-xl shadow-md group-hover:bg-emerald-50">
                  <Plus className="w-4 h-4" />
                  <span>فتح الاستمارة والتقييم الآن</span>
                </span>
                <span className="text-emerald-100 text-[11px]">
                  {followUpForms.length} استمارة معتمدة
                </span>
              </div>
            </div>

            {/* BUTTON 2: التقارير وسجلات المتابعة */}
            <div
              onClick={() => {
                setCurrentView('reports');
                sound.playTap();
              }}
              className="group cursor-pointer p-7 rounded-3xl bg-gradient-to-br from-indigo-700 to-blue-800 hover:from-indigo-600 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-indigo-400/30 flex flex-col justify-between min-h-[250px] relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center text-3xl shadow-inner border border-white/30 group-hover:rotate-6 transition-transform">
                  📊
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black">التقارير وسجلات المتابعة</h3>
                    <span className="px-2.5 py-0.5 bg-white/20 text-white text-[11px] font-black rounded-full border border-white/30">
                      أسبوعية وشهرية
                    </span>
                  </div>
                  <p className="text-xs text-indigo-100/90 leading-relaxed">
                    إصدار تقارير أسبوعية وشهرية اختيارية (تقرير مخصص لطالب محدد، أو تقرير شامل لجميع طلاب المرحلة) جاهزة للطباعة على ورقة A4 واحدة وإرسالها للإدارة.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs font-black">
                <span className="flex items-center gap-1.5 bg-white text-indigo-950 px-3.5 py-2 rounded-xl shadow-md group-hover:bg-indigo-50">
                  <FileText className="w-4 h-4" />
                  <span>دخول خانة التقارير</span>
                </span>
                <span className="text-indigo-200 text-[11px]">
                  تقرير فردي أو شامل
                </span>
              </div>
            </div>

          </div>

          {/* Quick List of Recent Student Evaluations */}
          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-slate-800 dark:text-white">
                  أحدث استمارات متابعة وتقييم مستوى الطلاب الصادرة:
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedFormForEdit(null);
                  setShowFollowUpModal(true);
                  sound.playTap();
                }}
                className="text-xs text-emerald-600 font-bold hover:underline"
              >
                + تعبئة استمارة لطالب آخر
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {followUpForms.slice(0, 4).map(form => (
                <div
                  key={form.id}
                  onClick={() => {
                    setSelectedFormForEdit(form);
                    setShowFollowUpModal(true);
                    sound.playTap();
                  }}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 cursor-pointer transition space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 dark:text-white">{form.studentName}</h4>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      المستوى العام: {form.overallAcademicLevel || 'جيد جداً'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    فصل: {form.className} • الرقم الوطني: {form.studentNationalNumber} • عدد المواد: {form.subjectEvaluations?.length || 7}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                    <strong>توصية المرشد:</strong> {form.recommendations?.customNote || 'متابعة مستمرة ودعم المهارات.'}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: REPORTS VIEW - WEEKLY & MONTHLY WITH (INDIVIDUAL OR COMPREHENSIVE)
          ========================================================================= */}
      {currentView === 'reports' && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Top Control Bar: Period (Weekly/Monthly) + Scope (Individual/Comprehensive) */}
          <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3.5">
            
            {/* Period Selector Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl w-full sm:w-auto">
                <button
                  onClick={() => { setReportSubTab('weekly'); sound.playTap(); }}
                  className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    reportSubTab === 'weekly'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>التقارير الأسبوعية</span>
                </button>

                <button
                  onClick={() => { setReportSubTab('monthly'); sound.playTap(); }}
                  className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    reportSubTab === 'monthly'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>التقارير الشهرية</span>
                </button>
              </div>

              {/* Print & Send Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleSendReportToAdmin}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>{reportScope === 'individual' ? 'إرسال تقرير الطالب للإدارة' : 'إرسال التقرير الشامل للإدارة'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  title="طباعة على ورقة مستقلة (PDF)"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة (PDF)</span>
                </button>
              </div>
            </div>

            {/* Report Scope Selector (فردي لطالب مخصص / شامل لجميع الطلبة) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">نطاق التقرير المطلوب:</span>
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                  <button
                    onClick={() => { setReportScope('comprehensive'); sound.playTap(); }}
                    className={`py-1.5 px-3 rounded-lg font-bold transition flex items-center gap-1.5 ${
                      reportScope === 'comprehensive'
                        ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm font-black'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <School className="w-3.5 h-3.5" />
                    <span>تقرير شامل لجميع الطلبة</span>
                  </button>

                  <button
                    onClick={() => { setReportScope('individual'); sound.playTap(); }}
                    className={`py-1.5 px-3 rounded-lg font-bold transition flex items-center gap-1.5 ${
                      reportScope === 'individual'
                        ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm font-black'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>تقرير مخصص لطالب بحد ذاته</span>
                  </button>
                </div>
              </div>

              {/* Student Picker (Visible if Individual Scope) */}
              {reportScope === 'individual' && (
                <div className="flex items-center gap-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">اختر الطالب:</label>
                  <select
                    value={selectedStudentForReportId}
                    onChange={e => setSelectedStudentForReportId(e.target.value)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.className})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

          </div>

          {/* =========================================================================
              REPORT CONTAINER (OPTIMIZED FOR 1-PAGE A4 PRINT & PDF EXPORT)
              ========================================================================= */}
          <div id="counselor-printable-report" className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 text-right text-xs">
            
            {/* Libyan Ministry Official Header (Compact & Small Icons for 1-Page Print) */}
            <div className="border-b-2 border-emerald-700 pb-3 flex items-center justify-between gap-3">
              <div className="text-right space-y-0.5">
                <p className="text-[10px] text-slate-500 font-bold">دولة ليبيا • وزارة التربية والتعليم</p>
                <p className="text-xs font-black text-slate-800 dark:text-slate-200">مراقبة التربية والتعليم | مكتب الخدمة الاجتماعية والإرشاد التربوي</p>
                <h2 className="text-sm font-black text-emerald-800 dark:text-emerald-400">
                  {reportScope === 'individual'
                    ? `التقرير الإرشادي ${reportSubTab === 'weekly' ? 'الأسبوعي' : 'الشهري'} للطالب: ${currentReportStudent.name}`
                    : `التقرير ${reportSubTab === 'weekly' ? 'الأسبوعي' : 'الشهري'} الشامل لجميع طلبة المرحلة`}
                </h2>
              </div>

              <img src={logoImg} alt="شعار المدرسة" className="h-10 w-auto object-contain" />

              <div className="text-left text-[10px] text-slate-500 space-y-0.5 font-mono">
                <p>العام الدراسي: <strong className="text-slate-800 dark:text-slate-200">2025 - 2026 م</strong></p>
                <p>الفترة: <strong className="text-slate-800 dark:text-slate-200">{reportSubTab === 'weekly' ? 'الأسبوع الحالي' : 'شهر سبتمبر 2025'}</strong></p>
                <p>المرشد: <strong className="text-emerald-700 dark:text-emerald-300">أ. نجوى القماطي</strong></p>
              </div>
            </div>

            {/* SCOPE 1: INDIVIDUAL STUDENT REPORT CARD */}
            {reportScope === 'individual' && (
              <div className="space-y-3.5">
                
                {/* Student Profile Info Strip */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                  <div>
                    <span className="text-slate-400 block">اسم الطالب</span>
                    <strong className="text-slate-900 dark:text-white text-xs">{currentReportStudent.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">الرقم الوطني (12 خانة)</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{currentReportStudent.nationalNumber || currentReportStudent.nationalId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">الصف والفصل</span>
                    <strong className="text-slate-800 dark:text-slate-200">{currentReportStudent.grade} ({currentReportStudent.className})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">ولي الأمر والهاتف</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{currentReportStudent.parentPhone || '0922465676'}</strong>
                  </div>
                </div>

                {/* Subject Evaluations Table for this Student */}
                <div className="space-y-1.5">
                  <h4 className="font-black text-slate-800 dark:text-white text-[11px]">
                    تقييم أداء الطالب في المواد الدراسية:
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-right divide-y divide-slate-100">
                      <thead className="bg-slate-100 text-slate-700 font-bold text-[10px]">
                        <tr>
                          <th className="p-2">المادة</th>
                          <th className="p-2">المعلم</th>
                          <th className="p-2">المستوى العلمي</th>
                          <th className="p-2">الواجبات</th>
                          <th className="p-2">المشاركة</th>
                          <th className="p-2">السلوك</th>
                          <th className="p-2">آراء وملاحظات المعلم</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {(studentForm?.subjectEvaluations || []).map((sub, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2 font-bold">{sub.subjectName}</td>
                            <td className="p-2 text-slate-600">{sub.teacherName}</td>
                            <td className="p-2 font-bold text-emerald-700">{sub.academicLevel}</td>
                            <td className="p-2 font-bold text-blue-700">{sub.homeworkPerformance}</td>
                            <td className="p-2 font-bold text-teal-700">{sub.classroomParticipation}</td>
                            <td className="p-2 font-bold text-purple-700">{sub.classroomBehavior}</td>
                            <td className="p-2 text-slate-600 max-w-xs truncate">{sub.teacherNotes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommendations & Guidance */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border space-y-1 text-[11px]">
                  <h4 className="font-bold text-slate-800 dark:text-white">توصيات المرشد التربوي الموجهة لولي الأمر والإدارة:</h4>
                  <ul className="space-y-0.5 text-slate-600 dark:text-slate-300 list-disc list-inside text-[10px]">
                    {studentForm?.recommendations?.needsHomeworkFollowUp && <li>يحتاج إلى متابعة يومية في حل الواجبات المدرسية.</li>}
                    {studentForm?.recommendations?.needsRemedialSupport && <li>يحتاج إلى دعم التعليم الإضافي وحصص التقوية.</li>}
                    {studentForm?.recommendations?.needsBehavioralGuidance && <li>يحتاج إلى توجيه سلوكي وإرشاد فردي.</li>}
                    {studentForm?.recommendations?.encourageGoodLevel && <li>يشجع على الاستمرار في مستواه الجيد والمتميز.</li>}
                    {studentForm?.recommendations?.customNote && <li><strong>ملاحظة إضافية:</strong> {studentForm.recommendations.customNote}</li>}
                  </ul>
                </div>

              </div>
            )}

            {/* SCOPE 2: COMPREHENSIVE ALL-STUDENTS MASTER REPORT */}
            {reportScope === 'comprehensive' && (
              <div className="space-y-3.5">
                
                {/* Stats Summary Strip (Compact) */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                    <p className="text-slate-500 font-bold text-[10px]">إجمالي الطلاب</p>
                    <p className="text-base font-black text-slate-900 dark:text-white font-mono">{students.length}</p>
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200">
                    <p className="text-emerald-800 font-bold text-[10px]">مستوى ممتاز/جيد جداً</p>
                    <p className="text-base font-black text-emerald-700 font-mono">
                      {followUpForms.filter(f => f.overallAcademicLevel === 'ممتاز' || f.overallAcademicLevel === 'جيد جداً').length || 8}
                    </p>
                  </div>
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200">
                    <p className="text-amber-800 font-bold text-[10px]">حالات تحتاج متابعة</p>
                    <p className="text-base font-black text-amber-700 font-mono">
                      {reportSubTab === 'weekly' ? weeklyTriggerCards.length : monthlyTriggerCards.length}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200">
                    <p className="text-blue-800 font-bold text-[10px]">استمارات المتابعة</p>
                    <p className="text-base font-black text-blue-700 font-mono">{followUpForms.length}</p>
                  </div>
                </div>

                {/* Master Table of All Students */}
                <div className="space-y-1.5">
                  <h4 className="font-black text-slate-800 dark:text-white text-[11px]">
                    كشف التقييم الشامل لجميع طلبة المرحلة:
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-right divide-y divide-slate-100">
                      <thead className="bg-slate-100 text-slate-700 font-bold text-[10px]">
                        <tr>
                          <th className="p-2">الطالب</th>
                          <th className="p-2">الرقم الوطني</th>
                          <th className="p-2">الفصل</th>
                          <th className="p-2">المستوى العام</th>
                          <th className="p-2">الواجبات</th>
                          <th className="p-2">السلوك</th>
                          <th className="p-2">الإنذارات</th>
                          <th className="p-2">التوجيه التربوي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[10px]">
                        {students.map(s => {
                          const f = followUpForms.find(form => form.studentId === s.id);
                          const warnings = autoSummonCards.find(c => c.studentId === s.id)?.totalWarningsCount || 0;
                          
                          return (
                            <tr key={s.id} className="hover:bg-slate-50/50">
                              <td className="p-2 font-bold text-slate-900">{s.name}</td>
                              <td className="p-2 font-mono text-slate-500">{s.nationalNumber || s.nationalId}</td>
                              <td className="p-2 font-mono">{s.className}</td>
                              <td className="p-2 font-bold text-emerald-700">
                                {f?.overallAcademicLevel || (s.academicAverage >= 85 ? 'ممتاز' : 'جيد جداً')}
                              </td>
                              <td className="p-2 font-bold text-blue-700">
                                {f?.subjectEvaluations?.[0]?.homeworkPerformance || 'نشط'}
                              </td>
                              <td className="p-2 font-bold text-purple-700">
                                {f?.subjectEvaluations?.[0]?.classroomBehavior || 'منضبط'}
                              </td>
                              <td className="p-2 font-bold font-mono">
                                <span className={`px-1.5 py-0.5 rounded ${warnings > 0 ? 'bg-red-100 text-red-800' : 'text-slate-400'}`}>
                                  {warnings}
                                </span>
                              </td>
                              <td className="p-2 text-slate-600 truncate max-w-xs">
                                {f?.recommendations?.customNote || 'متابعة دورية منتظمة وتشجيع مستمر.'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* Official Libyan Signatures Footer (Compact) */}
            <div className="pt-4 border-t grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="space-y-6">
                <p className="font-bold text-slate-700 dark:text-slate-300">المرشد التربوي / الأخصائي</p>
                <p className="text-emerald-700 font-bold">أ. نجوى القماطي</p>
              </div>

              <div className="space-y-6">
                <p className="font-bold text-slate-700 dark:text-slate-300">ولي الأمر (للتوثيق)</p>
                <div className="border-b border-dashed border-slate-300 w-24 mx-auto" />
              </div>

              <div className="space-y-6">
                <p className="font-bold text-slate-700 dark:text-slate-300">مدير المدرسة / الاعتماد</p>
                <div className="border-b border-dashed border-slate-300 w-24 mx-auto" />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Student Follow-Up & Evaluation Form Modal */}
      <StudentFollowUpFormModal
        isOpen={showFollowUpModal}
        onClose={() => {
          setShowFollowUpModal(false);
          setSelectedFormForEdit(null);
        }}
        onSaveForm={handleSaveForm}
        existingForm={selectedFormForEdit}
      />

      {/* Auto Summon Card Detail Modal */}
      <AutoSummonCardModal
        card={selectedCardForModal}
        isOpen={Boolean(selectedCardForModal)}
        onClose={() => setSelectedCardForModal(null)}
        onUpdateCard={handleUpdateAutoCard}
        onOpenNewCase={(studentId) => {
          setSelectedStudentForCase(studentId);
          setShowNewCaseModal(true);
        }}
      />

      {/* Case Study Modal */}
      <NewCaseStudyModal
        isOpen={showNewCaseModal}
        onClose={() => {
          setShowNewCaseModal(false);
          setPresetProblemId(undefined);
          setSelectedStudentForCase(undefined);
        }}
        onSaveCase={(cs) => {
          setCaseStudies([cs, ...caseStudies]);
          showToast('gold', 'تم فتح ملف دراسة الحالة 🌟', `تم تسجيل حالة ${cs.studentName} بنجاح.`);
        }}
        initialProblemId={presetProblemId}
        preselectedStudentId={selectedStudentForCase}
      />

    </div>
  );
};
