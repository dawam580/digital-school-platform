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
  Bell
} from 'lucide-react';
import { SocialCaseStudy, CounselingSession, ParentSummon, CommonProblemSolution, AutoSummonCard } from '../../types';
import { LIBYAN_COMMON_PROBLEMS } from '../../services/counselor/libyanSchoolProblems';
import { NewCaseStudyModal } from '../../components/counselor/NewCaseStudyModal';
import { NewSessionModal } from '../../components/counselor/NewSessionModal';
import { NewSummonModal } from '../../components/counselor/NewSummonModal';
import { AutoSummonCardModal } from '../../components/counselor/AutoSummonCardModal';
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
    recordInfractionAndCheck,
    students,
    teachers,
    showToast,
    currentUserPhone
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'auto_summons' | 'cases' | 'library' | 'sessions' | 'summons' | 'report'>('auto_summons');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [summonStatusFilter, setSummonStatusFilter] = useState<string>('all');

  // Modals state
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showNewSummonModal, setShowNewSummonModal] = useState(false);
  const [selectedCardForModal, setSelectedCardForModal] = useState<AutoSummonCard | null>(null);
  const [presetProblemId, setPresetProblemId] = useState<string | undefined>(undefined);
  const [selectedCaseForSession, setSelectedCaseForSession] = useState<string | undefined>(undefined);
  const [selectedStudentForCase, setSelectedStudentForCase] = useState<string | undefined>(undefined);

  // Filtered Auto Summon Cards
  const filteredAutoCards = useMemo(() => {
    return autoSummonCards.filter(c => {
      const matchSearch =
        c.studentName.includes(searchQuery) ||
        c.studentNationalNumber.includes(searchQuery) ||
        c.className.includes(searchQuery);
      
      const matchStatus = summonStatusFilter === 'all' || c.status === summonStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [autoSummonCards, searchQuery, summonStatusFilter]);

  // Filtered Case Studies
  const filteredCases = useMemo(() => {
    return caseStudies.filter(c => {
      const matchSearch =
        c.studentName.includes(searchQuery) ||
        c.studentNationalNumber.includes(searchQuery) ||
        c.className.includes(searchQuery) ||
        c.categoryLabel.includes(searchQuery);
      
      const matchCategory = selectedCategoryFilter === 'all' || c.category === selectedCategoryFilter;
      const matchPriority = selectedPriorityFilter === 'all' || c.priority === selectedPriorityFilter;

      return matchSearch && matchCategory && matchPriority;
    });
  }, [caseStudies, searchQuery, selectedCategoryFilter, selectedPriorityFilter]);

  // Filtered Library Problems
  const filteredProblems = useMemo(() => {
    return LIBYAN_COMMON_PROBLEMS.filter(p => {
      const matchSearch =
        p.title.includes(searchQuery) ||
        p.categoryLabel.includes(searchQuery) ||
        p.description.includes(searchQuery);
      const matchCategory = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategoryFilter]);

  // Statistics
  const pendingAutoSummonsCount = autoSummonCards.filter(c => c.status === 'pending_counselor').length;
  const totalCasesCount = caseStudies.length;
  const activeCasesCount = caseStudies.filter(c => c.status === 'open' || c.status === 'in_progress').length;
  const resolvedCasesCount = caseStudies.filter(c => c.status === 'resolved').length;
  const totalSessionsCount = counselingSessions.length;
  const totalSummonsCount = parentSummons.length;

  const handleSaveCase = (newCase: SocialCaseStudy) => {
    const updated = [newCase, ...caseStudies];
    setCaseStudies(updated);
    showToast('gold', 'تم فتح ملف دراسة الحالة 🌟', `تم تسجيل حالة الطالب ${newCase.studentName} بنجاح.`);
  };

  const handleSaveSession = (newSession: CounselingSession) => {
    const updated = [newSession, ...counselingSessions];
    setCounselingSessions(updated);

    if (newSession.caseId) {
      setCaseStudies(prev =>
        prev.map(c =>
          c.id === newSession.caseId
            ? { ...c, sessionsCount: c.sessionsCount + 1, lastSessionDate: newSession.date }
            : c
        )
      );
    }

    showToast('success', 'توثيق الجلسة الإرشادية 📝', `تم حفظ جلسة ${newSession.studentName} بنجاح.`);
  };

  const handleSendSummon = (newSummon: ParentSummon) => {
    const updated = [newSummon, ...parentSummons];
    setParentSummons(updated);
    showToast('info', 'إصدار استدعاء ولي الأمر ✉️', `تم إرسال الاستدعاء لولي أمر الطالب ${newSummon.studentName}.`);
  };

  const handleUpdateAutoCard = (updatedCard: AutoSummonCard) => {
    setAutoSummonCards(prev =>
      prev.map(c => (c.id === updatedCard.id ? updatedCard : c))
    );
    setSelectedCardForModal(updatedCard);
  };

  const handleStatusChange = (caseId: string, newStatus: SocialCaseStudy['status']) => {
    setCaseStudies(prev =>
      prev.map(c => (c.id === caseId ? { ...c, status: newStatus } : c))
    );
    sound.playSuccess();
    if (newStatus === 'resolved') {
      triggerConfetti();
      showToast('gold', 'إغلاق الحالة بنجاح 🌟', 'تم حل المشكلة وتحقيق أهداف الخطة الإرشادية.');
    }
  };

  // Quick Simulation Test Triggers
  const handleSimulateWeeklyTrigger = () => {
    const testStudent = students[1] || students[0];
    sound.playTap();
    showToast('info', 'محاكاة تسجيل إنذارات...', `يتم رصد 3 إنذارات أسبوعية للطالب ${testStudent.name}`);

    // Record 3 infractions in rapid succession to trigger the threshold
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
      setActiveTab('auto_summons');
    }, 600);
  };

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in max-w-6xl mx-auto pb-12 font-cairo">
      
      {/* Official Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-emerald-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-3xl shadow-xl border border-emerald-500/30">
              🤝
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black">بوابة ومكتب الخدمة الاجتماعية والنفسية</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>محرك استدعاء آلي تراكمي (Active Trigger)</span>
                </span>
              </div>
              <p className="text-sm text-emerald-200/90 mt-1">
                وزارة التربية والتعليم - دولة ليبيا (2025 - 2026 م) • نظام الإنذارات التراكمية (3 أسبوعياً / 5 شهرياً)
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                الأخصائية الاجتماعية المعتمدة: <strong className="text-white">أ. نجوى القماطي</strong> (الرمز: <span className="font-mono text-emerald-300">LIB-SOC-01</span>)
              </p>
            </div>
          </div>

          {/* Quick Actions & Trigger Simulator */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSimulateWeeklyTrigger}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black px-3.5 py-2.5 rounded-2xl transition text-xs shadow-lg active:scale-95 animate-pulse"
              title="تجربة محاكاة رصد 3 إنذارات وإصدار بطاقة استدعاء تلقائية فوراً"
            >
              <Flame className="w-4 h-4" />
              <span>🧪 تجربة محاكاة الاستدعاء الآلي (3 إنذارات)</span>
            </button>

            <button
              onClick={() => { setShowNewCaseModal(true); sound.playTap(); }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3.5 py-2.5 rounded-2xl transition text-xs shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>فتح ملف دراسة حالة</span>
            </button>

            <button
              onClick={() => { setShowNewSessionModal(true); sound.playTap(); }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2.5 rounded-2xl transition text-xs shadow-md active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>توثيق جلسة</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => { setActiveTab('auto_summons'); sound.playTap(); }}
          className={`p-4 sm:p-5 rounded-3xl border shadow-sm flex items-center gap-4 cursor-pointer transition ${
            pendingAutoSummonsCount > 0
              ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="p-3 rounded-2xl bg-rose-100 text-rose-700">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-rose-900 dark:text-rose-300 font-bold">بطاقات استدعاء آلية (Trigger)</p>
            <h3 className="text-xl font-black text-rose-700 font-mono">{autoSummonCards.length}</h3>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold">الحالات قيد المتابعة</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono">{activeCasesCount}</h3>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold">حالات تم علاجها بنجاح</p>
            <h3 className="text-xl font-black text-emerald-600 font-mono">{resolvedCasesCount}</h3>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold">الجلسات الإرشادية المنفذة</p>
            <h3 className="text-xl font-black text-blue-600 font-mono">{totalSessionsCount}</h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('auto_summons'); sound.playTap(); }}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'auto_summons' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-rose-600" />
          <span>بطاقات الاستدعاء الآلي ({autoSummonCards.length})</span>
          {pendingAutoSummonsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => { setActiveTab('cases'); sound.playTap(); }}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'cases' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>ملفات دراسة الحالة ({caseStudies.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('library'); sound.playTap(); }}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'library' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>مكتبة المشكلات الليبية ({LIBYAN_COMMON_PROBLEMS.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('sessions'); sound.playTap(); }}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'sessions' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>سجل الجلسات ({counselingSessions.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('summons'); sound.playTap(); }}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'summons' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4 text-purple-600" />
          <span>أرشيف الاستدعاءات ({parentSummons.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('report'); sound.playTap(); }}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'report' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>التقرير الشهري للوزارة</span>
        </button>
      </div>

      {/* Tab 0: Automated Summon Cards (Active Triggers) */}
      {activeTab === 'auto_summons' && (
        <div className="space-y-4">
          
          {/* Rules Explanation Banner */}
          <div className="p-4 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-blue-500/10 rounded-2xl border border-rose-200/60 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-600" />
                <span>شروط ومعايير التوليد التلقائي لبطاقات الاستدعاء (Trigger Rules)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                • <strong>عتبة أسبوعية:</strong> 3 إنذارات أو أكثر خلال الأسبوع الحالي ➔ إصدار بطاقة استدعاء تلقائياً.<br />
                • <strong>عتبة شهرية:</strong> 5 إنذارات أو أكثر خلال الشهر الحالي ➔ إصدار بطاقة استدعاء تلقائياً.<br />
                • الفحص تراكمي ومباشر عند كل رصد غياب أو مخالفة سلوكية، مع منع التكرار لنفس العتبة.
              </p>
            </div>

            <button
              onClick={handleSimulateWeeklyTrigger}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shrink-0 active:scale-95"
            >
              + محاكاة تجربة رصد إنذارات
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="بحث باسم الطالب، الرقم الوطني، أو الفصل..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-900"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={summonStatusFilter}
                onChange={e => setSummonStatusFilter(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-900"
              >
                <option value="all">كافة حالات البطاقات</option>
                <option value="pending_counselor">تحتاج متابعة الأخصائي ⚠️</option>
                <option value="summon_sent">تم إرسال استدعاء لولي الأمر ✉️</option>
                <option value="interview_completed">تمت المقابلة وتوثيق الاتفاق ✅</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAutoCards.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد حالات تجاوزت عتبة الإنذارات حالياً.</p>
                <p className="text-xs text-slate-400">جميع الطلاب ضمن الحدود السلوكية والتربوية المعتمدة.</p>
                <button
                  onClick={handleSimulateWeeklyTrigger}
                  className="text-xs text-rose-600 font-bold hover:underline mt-2 inline-block"
                >
                  🧪 اضغط هنا لتجربة محاكاة رصد إنذارات وإصدار بطاقة استدعاء فورية
                </button>
              </div>
            ) : (
              filteredAutoCards.map(card => {
                const statusBadge =
                  card.status === 'interview_completed'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : card.status === 'summon_sent'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';

                return (
                  <div
                    key={card.id}
                    className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition space-y-4 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white">{card.studentName}</h3>
                          <span className="px-2 py-0.5 rounded-lg font-bold text-[10px] bg-red-100 text-red-800 border border-red-200 font-mono">
                            {card.totalWarningsCount} إنذارات
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                          فصل: {card.className} • {card.grade} • الرقم الوطني: {card.studentNationalNumber}
                        </p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusBadge}`}>
                        {card.status === 'interview_completed'
                          ? 'تمت المقابلة ✅'
                          : card.status === 'summon_sent'
                          ? 'أُرسل استدعاء ✉️'
                          : 'تحتاج متابعة عاجلة ⚠️'}
                      </span>
                    </div>

                    {/* Breakdown Badges */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{card.periodLabel}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{card.triggeredDateFormatted}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                        <div className="p-1.5 bg-red-100/60 rounded-xl font-bold text-red-800">
                          {card.breakdown.absencesCount} غياب
                        </div>
                        <div className="p-1.5 bg-amber-100/60 rounded-xl font-bold text-amber-800">
                          {card.breakdown.misconductCount} مشاغبة
                        </div>
                        <div className="p-1.5 bg-blue-100/60 rounded-xl font-bold text-blue-800">
                          {card.breakdown.latenessCount} تأخر
                        </div>
                        <div className="p-1.5 bg-purple-100/60 rounded-xl font-bold text-purple-800">
                          {card.breakdown.academicCount} واجبات
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedCardForModal(card);
                          sound.playTap();
                        }}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-center text-[11px] shadow-sm"
                      >
                        عرض البطاقة والتفاصيل 🔍
                      </button>

                      <button
                        onClick={() => {
                          setSelectedStudentForCase(card.studentId);
                          setShowNewCaseModal(true);
                          sound.playTap();
                        }}
                        className="px-3 py-2 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-bold rounded-xl border border-purple-200 transition text-[11px]"
                      >
                        فتح دراسة حالة 📂
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Case Studies View */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="بحث باسم الطالب، الرقم الوطني، أو التصنيف..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-900"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-900"
              >
                <option value="all">كافة التصنيفات التربوية</option>
                <option value="absence_dropout">الغياب المتكرر والتسرب</option>
                <option value="behavior_bullying">التنمر والعنف</option>
                <option value="academic_lag">التأخر الدراسي</option>
                <option value="family_socioeconomic">الظروف الأسرية</option>
                <option value="psychological_crisis">الضغوط النفسية</option>
                <option value="special_needs">الدمج وصعوبات النطق</option>
              </select>

              <select
                value={selectedPriorityFilter}
                onChange={e => setSelectedPriorityFilter(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-900"
              >
                <option value="all">كافة درجات الأولوية</option>
                <option value="urgent">عاجلة جداً</option>
                <option value="high">مرتفعة</option>
                <option value="medium">متوسطة</option>
              </select>
            </div>
          </div>

          {/* Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCases.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400 space-y-2">
                <p className="text-sm font-bold">لا توجد ملفات دراسة حالة مطابقة لمعايير البحث الحالية.</p>
                <button
                  onClick={() => setShowNewCaseModal(true)}
                  className="text-xs text-emerald-600 font-bold hover:underline"
                >
                  + فتح ملف دراسة حالة جديد الآن
                </button>
              </div>
            ) : (
              filteredCases.map(cs => {
                const priorityBadge =
                  cs.priority === 'urgent' ? 'bg-red-100 text-red-800 border-red-200' :
                  cs.priority === 'high' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-blue-100 text-blue-800 border-blue-200';

                const statusBadge =
                  cs.status === 'resolved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  cs.status === 'monitoring' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                  'bg-amber-100 text-amber-800 border-amber-300';

                return (
                  <div
                    key={cs.id}
                    className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition space-y-4 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white">{cs.studentName}</h3>
                          <span className={`px-2 py-0.5 rounded-lg font-bold text-[10px] border ${priorityBadge}`}>
                            {cs.priority === 'urgent' ? 'أولوية عاجلة' : cs.priority === 'high' ? 'أولوية مرتفعة' : 'أولوية متوسطة'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                          فصل: {cs.className} • الرقم الوطني: {cs.studentNationalNumber}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <select
                          value={cs.status}
                          onChange={e => handleStatusChange(cs.id, e.target.value as any)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-xl border ${statusBadge}`}
                        >
                          <option value="in_progress">قيد المعالجة 🔄</option>
                          <option value="monitoring">متابعة مستمرة 👁️</option>
                          <option value="resolved">تم الحل والتعافي ✅</option>
                          <option value="open">مفتوحة حديثاً 📂</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">التصنيف: {cs.categoryLabel}</span>
                        <span className="text-[10px] text-slate-400">تاريخ الفتح: {cs.openDate}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                        <strong>التشخيص:</strong> {cs.diagnosis}
                      </p>
                    </div>

                    {/* Action Plan Preview */}
                    <div className="space-y-1.5">
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">بنود الخطة العلاجية ({cs.actionPlan.length} بنود):</p>
                      <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside">
                        {cs.actionPlan.slice(0, 2).map((item, idx) => (
                          <li key={idx} className="truncate">{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer Stats & Action */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-bold">
                        عدد الجلسات المنفذة: <strong className="text-blue-600 font-mono text-xs">{cs.sessionsCount}</strong>
                      </span>

                      <button
                        onClick={() => {
                          setSelectedCaseForSession(cs.id);
                          setShowNewSessionModal(true);
                          sound.playTap();
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold rounded-xl border border-blue-200 transition"
                      >
                        + تسجيل جلسة جديدة
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Libyan School Problems & Solutions Library */}
      {activeTab === 'library' && (
        <div className="space-y-5">
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 rounded-2xl border border-amber-200/50 dark:border-slate-700">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>دليل معالجة المشكلات الشائعة في البيئة المدرسية الليبية (وزارة التربية والتعليم)</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              مكتبة إرشادية متكاملة تتضمن تشخيص الأسباب الجذرية، الإجراءات التربوية المعتمدة، وتوجيهات أولياء الأمور لتطبيق خطط تدخل فورية.
            </p>
          </div>

          <div className="space-y-4">
            {filteredProblems.map((prob) => (
              <div
                key={prob.id}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] mb-1 inline-block">
                      {prob.categoryLabel}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{prob.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">{prob.description}</p>
                  </div>

                  <button
                    onClick={() => {
                      setPresetProblemId(prob.id);
                      setShowNewCaseModal(true);
                      sound.playTap();
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تطبيق كخطة حالة لطالب</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Root Causes in Libya */}
                  <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/40 space-y-2">
                    <h4 className="font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>الأسباب الشائعة في ليبيا:</span>
                    </h4>
                    <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {prob.rootCausesLibya.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Approved Interventions */}
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>التدخلات التربوية المعتمدة:</span>
                    </h4>
                    <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {prob.approvedInterventions.map((inv, i) => (
                        <li key={i}>{inv}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Parent Guidelines */}
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-2">
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 text-xs">
                      <HeartHandshake className="w-4 h-4 text-blue-600" />
                      <span>توجيهات ولي الأمر:</span>
                    </h4>
                    <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {prob.parentGuidelines.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-bold">النتيجة المستهدفة:</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">{prob.expectedOutcome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Counseling Sessions Logger */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">سجل الجلسات الإرشادية والمتابعات الفردية</h3>
            <button
              onClick={() => { setShowNewSessionModal(true); sound.playTap(); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>توثيق جلسة إرشادية جديدة</span>
            </button>
          </div>

          <div className="space-y-3">
            {counselingSessions.map((session) => (
              <div
                key={session.id}
                className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-blue-50 text-blue-700 font-bold">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm">
                        جلسة الطالب: {session.studentName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {session.date} • الساعة {session.time} • نوع الجلسة:{' '}
                        {session.sessionType === 'individual' ? 'إرشاد فردي' :
                         session.sessionType === 'parent_conference' ? 'مؤتمر ولي أمر' :
                         session.sessionType === 'group' ? 'إرشاد جمعي' : 'استشارة معلم'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                    الأخصائية: {session.counselorName}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-slate-800 dark:text-slate-200">الهدف: {session.objective}</p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    <strong>ملخص النقاش:</strong> {session.discussionSummary}
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-300 font-medium text-[11px]">
                    <strong>التوصيات والاتفاق:</strong> {session.recommendations}
                  </p>
                </div>

                {session.nextFollowUpDate && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
                    <span>موعد المتابعة القادم: <strong className="text-blue-600 font-mono">{session.nextFollowUpDate}</strong></span>
                    <span className="text-emerald-600 font-bold">موثق في سجل الخدمة الاجتماعية ✅</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Parent Summons Management */}
      {activeTab === 'summons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">سجل استدعاءات ومقابلات أولياء الأمور</h3>
            <button
              onClick={() => { setShowNewSummonModal(true); sound.playTap(); }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إصدار استدعاء رسمي جديد</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">اسم الطالب</th>
                  <th className="p-3.5">ولي الأمر ورقم الهاتف</th>
                  <th className="p-3.5">سبب الاستدعاء والتوجيه</th>
                  <th className="p-3.5">الموعد المقترح</th>
                  <th className="p-3.5">حالة المقابلة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {parentSummons.map((summon) => (
                  <tr key={summon.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{summon.studentName}</td>
                    <td className="p-3.5">
                      <div className="font-bold">{summon.parentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{summon.parentPhone}</div>
                    </td>
                    <td className="p-3.5 max-w-xs">{summon.reason}</td>
                    <td className="p-3.5 font-mono">
                      <div>{summon.requestedDate}</div>
                      <div className="text-[11px] text-slate-400">{summon.requestedTime}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
                        {summon.status === 'sent' ? 'تم الإرسال (بانتظار الحضور)' :
                         summon.status === 'attended' ? 'تم الحضور والمقابلة ✅' : 'إعادة جدولة'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Monthly Report for Ministry */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">التقرير الشهري للخدمة الاجتماعية والنفسية</h3>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة وتصدير التقرير للوزارة (PDF)</span>
            </button>
          </div>

          <div id="counselor-monthly-report" className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 text-right">
            
            {/* Report Header */}
            <div className="border-b-2 border-emerald-700 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-right space-y-1">
                <p className="text-xs text-slate-500 font-bold">دولة ليبيا • وزارة التربية والتعليم</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">مراقبة التربية والتعليم | قسم الخدمة الاجتماعية والنفسية</p>
                <h2 className="text-lg font-black text-emerald-800 dark:text-emerald-400">التقرير الإحصائي والنوعي للخدمة الاجتماعية المدرسية</h2>
              </div>
              <img src={logoImg} alt="شعار المدرسة" className="h-16 w-auto object-contain" />
              <div className="text-left text-xs text-slate-500 space-y-0.5">
                <p>العام الدراسي: <strong className="text-slate-800 dark:text-slate-200">2025 - 2026 م</strong></p>
                <p>الشهر: <strong className="text-slate-800 dark:text-slate-200">سبتمبر 2025</strong></p>
                <p>الأخصائية: <strong className="text-emerald-700 dark:text-emerald-300">أ. نجوى القماطي</strong></p>
              </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                <p className="text-slate-500 font-bold">إجمالي الحالات</p>
                <p className="text-xl font-black text-slate-900 dark:text-white font-mono">{totalCasesCount}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200">
                <p className="text-emerald-800 font-bold">حالات تم علاجها</p>
                <p className="text-xl font-black text-emerald-700 font-mono">{resolvedCasesCount}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200">
                <p className="text-blue-800 font-bold">الجلسات المنفذة</p>
                <p className="text-xl font-black text-blue-700 font-mono">{totalSessionsCount}</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200">
                <p className="text-purple-800 font-bold">استدعاءات الأولياء</p>
                <p className="text-xl font-black text-purple-700 font-mono">{totalSummonsCount}</p>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-white">كشف الحالات الإرشادية ومخرجات التدخل:</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">الطالب</th>
                      <th className="p-2.5">الفصل</th>
                      <th className="p-2.5">نوع المشكلة</th>
                      <th className="p-2.5">الجلسات</th>
                      <th className="p-2.5">مستوى التقدم والتعافي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {caseStudies.map((cs) => (
                      <tr key={cs.id}>
                        <td className="p-2.5 font-bold">{cs.studentName}</td>
                        <td className="p-2.5 font-mono">{cs.className}</td>
                        <td className="p-2.5">{cs.categoryLabel}</td>
                        <td className="p-2.5 font-mono font-bold text-blue-600">{cs.sessionsCount}</td>
                        <td className="p-2.5 font-bold text-emerald-700">{cs.progressEvaluation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white">التوصيات والملاحظات الختامية للإدارة المدرسية:</h4>
              <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 list-disc list-inside">
                <li>الاستمرار في تعزيز ميثاق الحضور الصباحي للحد من التأخر والغياب يومي الأحد والخميس.</li>
                <li>تفعيل ورش العمل الصفية حول إدارة قلق الاختبارات مع اقتراب الامتحانات النصفية.</li>
                <li>توجيه المعلمين لمواصلة التعزيز الإيجابي للطلاب ذوي صعوبات القراءة والتعبير.</li>
              </ul>
            </div>

            {/* Signatures */}
            <div className="pt-6 border-t grid grid-cols-2 gap-4 text-center text-xs">
              <div className="space-y-8">
                <p className="font-bold text-slate-700 dark:text-slate-300">الأخصائية الاجتماعية والنفسية</p>
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

      {/* Modals */}
      <NewCaseStudyModal
        isOpen={showNewCaseModal}
        onClose={() => {
          setShowNewCaseModal(false);
          setPresetProblemId(undefined);
          setSelectedStudentForCase(undefined);
        }}
        onSaveCase={handleSaveCase}
        initialProblemId={presetProblemId}
        preselectedStudentId={selectedStudentForCase}
      />

      <NewSessionModal
        isOpen={showNewSessionModal}
        onClose={() => { setShowNewSessionModal(false); setSelectedCaseForSession(undefined); }}
        onSaveSession={handleSaveSession}
        caseStudies={caseStudies}
        preselectedCaseId={selectedCaseForSession}
      />

      <NewSummonModal
        isOpen={showNewSummonModal}
        onClose={() => setShowNewSummonModal(false)}
        onSendSummon={handleSendSummon}
      />

    </div>
  );
};
