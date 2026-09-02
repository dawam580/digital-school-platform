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
  FileSpreadsheet
} from 'lucide-react';
import {
  SocialCaseStudy,
  CounselingSession,
  ParentSummon,
  CommonProblemSolution,
  AutoSummonCard,
  StudentFollowUpForm
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
    currentUserPhone
  } = useSchool();

  // Navigation mode: 'main_menu' (2 buttons), 'student_evaluation', 'reports'
  const [currentView, setCurrentView] = useState<'main_menu' | 'student_evaluation' | 'reports'>('main_menu');

  // Reports sub-tab: 'weekly' or 'monthly'
  const [reportSubTab, setReportSubTab] = useState<'weekly' | 'monthly'>('weekly');

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

  // Filtered Follow-up forms
  const filteredForms = useMemo(() => {
    return followUpForms.filter(f => {
      return (
        f.studentName.includes(searchQuery) ||
        f.studentNationalNumber.includes(searchQuery) ||
        f.className.includes(searchQuery) ||
        f.subjectName.includes(searchQuery)
      );
    });
  }, [followUpForms, searchQuery]);

  // Statistics
  const weeklyTriggerCards = autoSummonCards.filter(c => c.periodType === 'weekly');
  const monthlyTriggerCards = autoSummonCards.filter(c => c.periodType === 'monthly');
  const pendingAutoSummonsCount = autoSummonCards.filter(c => c.status === 'pending_counselor').length;
  const totalCasesCount = caseStudies.length;
  const activeCasesCount = caseStudies.filter(c => c.status === 'open' || c.status === 'in_progress').length;
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
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-emerald-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-3xl shadow-xl border border-emerald-500/30">
              🤝
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black">مكتب الخدمة الاجتماعية والإرشاد التربوي</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>نظام مبسط وسهل الاستخدام</span>
                </span>
              </div>
              <p className="text-sm text-emerald-200/90 mt-1">
                وزارة التربية والتعليم - دولة ليبيا (2025 - 2026 م) • استمارات متابعة مستوى الطلاب والتقارير
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                المرشد التربوي / الأخصائية الاجتماعية: <strong className="text-white">أ. نجوى القماطي</strong> (الرمز: <span className="font-mono text-emerald-300">LIB-SOC-01</span>)
              </p>
            </div>
          </div>

          {currentView !== 'main_menu' && (
            <button
              onClick={() => { setCurrentView('main_menu'); sound.playTap(); }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-2xl transition text-xs border border-white/20 shrink-0 self-start md:self-auto"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للواجهة الرئيسية</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: MAIN LANDING SCREEN - EXACTLY 2 PROMINENT BUTTONS
          ========================================================================= */}
      {currentView === 'main_menu' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          
          <div className="text-center space-y-1.5 py-2">
            <h2 className="text-xl font-black text-slate-800 dark:text-white">
              مرحباً بك أ. نجوى القماطي، يرجى اختيار الخدمة المطلوبة:
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              واجهة مبسطة ومصممة لتسهيل عمل الأخصائي الاجتماعي وإنجاز المهام التربوية بنقرة واحدة
            </p>
          </div>

          {/* The 2 Primary Buttons / Portals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* BUTTON 1: تصنيف وتقييم طالب جديد */}
            <div
              onClick={() => {
                setSelectedFormForEdit(null);
                setShowFollowUpModal(true);
                sound.playTap();
              }}
              className="group cursor-pointer p-8 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 border border-emerald-400/30 flex flex-col justify-between min-h-[260px] relative overflow-hidden"
            >
              <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
              
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 text-white flex items-center justify-center text-3xl shadow-inner border border-white/30 group-hover:rotate-6 transition-transform">
                  📋
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tight">تصنيف وتقييم طالب جديد</h3>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-black rounded-full border border-white/30">
                      استمارة متابعة
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/90 leading-relaxed">
                    تعبئة استمارة متابعة مستوى الطالب المعتمدة: تقييم المستوى العلمي (ممتاز، جيد جداً، مقبول، ضعيف)، حل الواجبات، المشاركة الصفية، السلوك، وآراء المعلمين والتوصيات مع إشعار ولي الأمر.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/20 flex items-center justify-between text-xs font-black">
                <span className="flex items-center gap-1.5 bg-white text-emerald-900 px-4 py-2 rounded-xl shadow-md group-hover:bg-emerald-50">
                  <Plus className="w-4 h-4" />
                  <span>فتح الاستمارة والتقييم الآن</span>
                </span>
                <span className="text-emerald-100 text-[11px]">
                  {followUpForms.length} استمارة معتمدة بالمنظومة
                </span>
              </div>
            </div>

            {/* BUTTON 2: التقارير وسجلات المتابعة */}
            <div
              onClick={() => {
                setCurrentView('reports');
                sound.playTap();
              }}
              className="group cursor-pointer p-8 rounded-3xl bg-gradient-to-br from-indigo-700 to-blue-800 hover:from-indigo-600 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 border border-indigo-400/30 flex flex-col justify-between min-h-[260px] relative overflow-hidden"
            >
              <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 text-white flex items-center justify-center text-3xl shadow-inner border border-white/30 group-hover:rotate-6 transition-transform">
                  📊
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tight">التقارير وسجلات المتابعة</h3>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-black rounded-full border border-white/30">
                      أسبوعية وشهرية
                    </span>
                  </div>
                  <p className="text-xs text-indigo-100/90 leading-relaxed">
                    استعراض التقارير الأسبوعية (الإنذارات التراكمية 3+ أسبوعياً واستدعاءات الأولياء) والتقارير الشهرية (تقرير الوزارة المعتمد، الحالات المعالجة 5+ شهرياً، وأرشيف استمارات المتابعة).
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/20 flex items-center justify-between text-xs font-black">
                <span className="flex items-center gap-1.5 bg-white text-indigo-950 px-4 py-2 rounded-xl shadow-md group-hover:bg-indigo-50">
                  <FileText className="w-4 h-4" />
                  <span>دخول خانة التقارير الشاملة</span>
                </span>
                <span className="text-indigo-200 text-[11px]">
                  تقارير أسبوعية وشهرية جاهزة للطباعة
                </span>
              </div>
            </div>

          </div>

          {/* Quick Sub-card: View Past Evaluations & Triggers */}
          <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-800 dark:text-white">
                  أحدث استمارات متابعة وتصنيف مستوى الطلاب الصادرة مؤخراً:
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
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 cursor-pointer transition space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 dark:text-white">{form.studentName}</h4>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      المستوى: {form.academicLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    مادة: {form.subjectName} • المعلم: {form.teacherName} • الصف: {form.grade} ({form.className})
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                    <strong>رأي المعلم:</strong> {form.teacherNotes}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: REPORTS VIEW - SPLIT INTO WEEKLY & MONTHLY
          ========================================================================= */}
      {currentView === 'reports' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Sub-Tabs: Weekly vs Monthly */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => { setReportSubTab('weekly'); sound.playTap(); }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                reportSubTab === 'weekly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>التقارير الأسبوعية (الإنذارات التراكمية 3+ واستدعاءات الأولياء)</span>
            </button>

            <button
              onClick={() => { setReportSubTab('monthly'); sound.playTap(); }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                reportSubTab === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>التقارير الشهرية (تقرير الوزارة المعتمد وأرشيف الاستمارات)</span>
            </button>
          </div>

          {/* SUB-TAB 1: WEEKLY REPORTS */}
          {reportSubTab === 'weekly' && (
            <div className="space-y-5">
              
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>متابعة العتبة الأسبوعية (3 إنذارات أو أكثر خلال الأسبوع الحالي)</span>
                  </h3>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    يتم رصد الغياب والمشاغبة تلقائياً، وتوجيه بطاقة استدعاء لولي الأمر فور تجاوز الحد الأسبوعي.
                  </p>
                </div>

                <button
                  onClick={handleSimulateWeeklyTrigger}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm shrink-0 active:scale-95"
                >
                  🧪 محاكاة رصد 3 إنذارات لطالب
                </button>
              </div>

              {/* Weekly Summon Cards */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">
                  كشف بطاقات الاستدعاء والمتابعة الصادرة هذا الأسبوع ({weeklyTriggerCards.length}):
                </h4>

                {weeklyTriggerCards.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold">لا توجد حالات تجاوزت الحد الأسبوعي للإنذارات حالياً.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {weeklyTriggerCards.map(card => (
                      <div
                        key={card.id}
                        className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-black text-slate-900 dark:text-white text-sm">{card.studentName}</h4>
                            <p className="text-[11px] text-slate-400 font-mono">
                              فصل: {card.className} • الرقم الوطني: {card.studentNationalNumber}
                            </p>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-black text-[10px] font-mono">
                            {card.totalWarningsCount} إنذارات
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1 text-center text-[10px] p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
                          <div className="font-bold text-red-800">{card.breakdown.absencesCount} غياب</div>
                          <div className="font-bold text-amber-800">{card.breakdown.misconductCount} مشاغبة</div>
                          <div className="font-bold text-blue-800">{card.breakdown.latenessCount} تأخر</div>
                          <div className="font-bold text-purple-800">{card.breakdown.academicCount} واجبات</div>
                        </div>

                        <div className="pt-2 border-t flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setSelectedCardForModal(card);
                              sound.playTap();
                            }}
                            className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-center text-[11px]"
                          >
                            عرض البطاقة وإرسال استدعاء ✉️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SUB-TAB 2: MONTHLY REPORTS */}
          {reportSubTab === 'monthly' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  التقرير الإحصائي والنوعي الشهري (وزارة التربية والتعليم - دولة ليبيا)
                </h3>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة وتصدير التقرير الشهري (PDF)</span>
                </button>
              </div>

              {/* Printable Monthly Ministry Report Card */}
              <div id="counselor-monthly-report" className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 text-right">
                
                {/* Official Libyan Header */}
                <div className="border-b-2 border-emerald-700 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-right space-y-1">
                    <p className="text-xs text-slate-500 font-bold">دولة ليبيا • وزارة التربية والتعليم</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">مراقبة التربية والتعليم | قسم الخدمة الاجتماعية والإرشاد التربوي</p>
                    <h2 className="text-lg font-black text-emerald-800 dark:text-emerald-400">التقرير الشهري لمتابعة وتصنيف مستويات الطلاب</h2>
                  </div>
                  <img src={logoImg} alt="شعار المدرسة" className="h-16 w-auto object-contain" />
                  <div className="text-left text-xs text-slate-500 space-y-0.5">
                    <p>العام الدراسي: <strong className="text-slate-800 dark:text-slate-200">2025 - 2026 م</strong></p>
                    <p>الشهر: <strong className="text-slate-800 dark:text-slate-200">سبتمبر 2025</strong></p>
                    <p>المرشد التربوي: <strong className="text-emerald-700 dark:text-emerald-300">أ. نجوى القماطي</strong></p>
                  </div>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                    <p className="text-slate-500 font-bold">استمارات المتابعة</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white font-mono">{followUpForms.length}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200">
                    <p className="text-emerald-800 font-bold">حالات تم علاجها</p>
                    <p className="text-xl font-black text-emerald-700 font-mono">{resolvedCasesCount}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200">
                    <p className="text-blue-800 font-bold">الجلسات المنفذة</p>
                    <p className="text-xl font-black text-blue-700 font-mono">{counselingSessions.length}</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200">
                    <p className="text-purple-800 font-bold">استدعاءات الأولياء</p>
                    <p className="text-xl font-black text-purple-700 font-mono">{parentSummons.length}</p>
                  </div>
                </div>

                {/* Detailed Table */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-800 dark:text-white">كشف تصنيف مستويات الطلاب واستمارات المتابعة:</h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-100 font-bold text-slate-700">
                        <tr>
                          <th className="p-2.5">الطالب</th>
                          <th className="p-2.5">الفصل</th>
                          <th className="p-2.5">المادة</th>
                          <th className="p-2.5">المستوى العلمي</th>
                          <th className="p-2.5">الواجبات</th>
                          <th className="p-2.5">المشاركة</th>
                          <th className="p-2.5">السلوك</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {followUpForms.map(f => (
                          <tr key={f.id}>
                            <td className="p-2.5 font-bold">{f.studentName}</td>
                            <td className="p-2.5 font-mono">{f.className}</td>
                            <td className="p-2.5">{f.subjectName}</td>
                            <td className="p-2.5 font-bold text-emerald-700">{f.academicLevel}</td>
                            <td className="p-2.5 font-bold text-blue-700">{f.homeworkPerformance}</td>
                            <td className="p-2.5 font-bold text-teal-700">{f.classroomParticipation}</td>
                            <td className="p-2.5 font-bold text-purple-700">{f.classroomBehavior}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-6 border-t grid grid-cols-2 gap-4 text-center text-xs">
                  <div className="space-y-8">
                    <p className="font-bold text-slate-700 dark:text-slate-300">المرشد التربوي / الأخصائية</p>
                    <p className="text-emerald-700 font-bold">أ. نجوى القماطي</p>
                  </div>
                  <div className="space-y-8">
                    <p className="font-bold text-slate-700 dark:text-slate-300">مدير المدرسة / الاعتماد</p>
                    <div className="border-b border-dashed border-slate-300 w-32 mx-auto" />
                  </div>
                </div>

              </div>

            </div>
          )}

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
