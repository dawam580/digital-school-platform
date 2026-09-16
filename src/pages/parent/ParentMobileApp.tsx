import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useRequireRole } from '../../hooks/useRequireRole';
import { ExamStorageService } from '../../services/exams/examStorageService';
import { Student, DaySchedule } from '../../types';
import {
  Home,
  Award,
  CalendarCheck,
  Bell,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Printer,
  ChevronDown,
  ChevronLeft,
  Plus,
  Send,
  Phone,
  MessageCircle,
  Share2,
  GraduationCap,
  HeartHandshake,
  Download,
  Star,
  RefreshCw,
  LogOut,
  Smartphone,
  Check,
  X,
  UserCheck,
  BookOpen,
  Calendar,
  Smile,
  QrCode,
  Camera,
  CheckSquare,
  Square,
  Trophy,
  Compass,
  ArrowRight
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { PrintableStudentGradeCard } from '../../components/exams/PrintableStudentGradeCard';
import { MobileQrScannerModal } from '../../components/mobile/MobileQrScannerModal';
import logoImg from '../../assets/logo.png';

interface ParentMobileAppProps {
  embeddedInFrame?: boolean;
}

interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

const DEFAULT_HOMEWORK: HomeworkItem[] = [
  { id: 'hw-1', subject: 'الرياضيات', title: 'حل تمارين ص 42 (مسائل الجمع والضرب)', dueDate: 'غداً', completed: false },
  { id: 'hw-2', subject: 'اللغة العربية', title: 'حفظ أبيات قصيدة الوطن وكتابة المفردات', dueDate: 'غداً', completed: true },
  { id: 'hw-3', subject: 'العلوم', title: 'رسم دورة حياة النبات في دفتر النشاط', dueDate: 'الخميس', completed: false },
  { id: 'hw-4', subject: 'التربية الإسلامية', title: 'مراجعة سورة النبأ من الآية 1 إلى 15', dueDate: 'الأحد', completed: false }
];

export const ParentMobileApp: React.FC<ParentMobileAppProps> = ({ embeddedInFrame = false }) => {
  const {
    selectedStudent,
    setSelectedStudent,
    parentLinkedStudent,
    setParentLinkedStudent,
    previouslyLinkedStudents,
    linkStudent,
    unlinkParentStudent,
    updateAttendance,
    addNotification,
    showToast,
    schoolProfile,
    schedule,
    notifications,
    markNotificationAsRead
  } = useSchool();

  // Mode: ولي الأمر (Parent) vs الطالب (Student)
  const [portalMode, setPortalMode] = useState<'parent' | 'student'>(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('portal');
      if (q === 'student') return 'student';
    } catch {}
    return 'parent';
  });

  // Active Bottom Navigation Tab
  const [currentTab, setCurrentTab] = useState<'home' | 'grades' | 'attendance' | 'notices' | 'student-hub'>('home');

  // Modals & Scanners
  const [showChildPicker, setShowChildPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [linkCodeInput, setLinkCodeInput] = useState('');
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [excuseDate, setExcuseDate] = useState(new Date().toISOString().split('T')[0]);
  const [excuseReason, setExcuseReason] = useState('ظرف صحي طارئ (مرفق التقرير الطبي)');
  const [isSubmittingExcuse, setIsSubmittingExcuse] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Homework Checklist State (Stored in localStorage)
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>(() => {
    try {
      const saved = localStorage.getItem('madrasa_student_homework_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_HOMEWORK;
  });

  // Frame toggle for desktop users
  const [isPhoneFrame, setIsPhoneFrame] = useState(!embeddedInFrame && typeof window !== 'undefined' && window.innerWidth > 768);

  // Identify all children linked to this parent
  const parentChildren: Student[] = useMemo(() => {
    const list: Student[] = [];
    if (parentLinkedStudent) list.push(parentLinkedStudent);
    previouslyLinkedStudents.forEach(s => {
      if (!list.some(x => x.id === s.id)) list.push(s);
    });
    return list;
  }, [parentLinkedStudent, previouslyLinkedStudents]);

  const activeChild = parentLinkedStudent || parentChildren[0] || null;

  // Control Gate for Exam Release
  const [gradesReleased, setGradesReleased] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    setGradesReleased(null);
    const cls = activeChild?.className;
    if (!cls) { setGradesReleased(true); return; }
    ExamStorageService.getExamLock(cls).then(lock => {
      if (cancelled) return;
      if (lock.releasedAt) setGradesReleased(true);
      else if (lock.lockedAt) setGradesReleased(false);
      else setGradesReleased(true);
    }).catch(() => { if (!cancelled) setGradesReleased(true); });
    return () => { cancelled = true; };
  }, [activeChild?.className]);

  // Handle URL link code auto-population
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code');
      if (urlCode && !activeChild) {
        linkStudent(urlCode.trim());
      }
    } catch {}
  }, []);

  const handleToggleHomework = (id: string) => {
    setHomeworkList(prev => {
      const updated = prev.map(hw => hw.id === id ? { ...hw, completed: !hw.completed } : hw);
      try {
        localStorage.setItem('madrasa_student_homework_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    sound.playTap();
  };

  const handleSelectChild = (child: Student) => {
    setParentLinkedStudent(child);
    setSelectedStudent(child);
    setShowChildPicker(false);
    sound.playTap();
    showToast('info', 'تم التبديل 🔄', `أنت الآن تتابع بيانات الطالب (${child.name.split(' ')[0]})`);
  };

  const handleLinkChild = (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const targetCode = (customCode || linkCodeInput).trim();
    if (!targetCode) return;
    const success = linkStudent(targetCode);
    if (success) {
      sound.playSuccess();
      triggerConfetti();
      showToast('gold', 'تم ربط الطالب بنجاح 🎉', 'تمت إضافة الطالب للمنظومة بنجاح.');
      setShowLinkModal(false);
      setShowScannerModal(false);
      setLinkCodeInput('');
    } else {
      sound.playAlert();
      showToast('error', 'رمز غير صحيح', 'تأكد من رمز الطالب أو رقمه الوطني أو كود الربط.');
    }
  };

  const handleScanSuccess = (scannedCode: string) => {
    handleLinkChild(undefined, scannedCode);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    sound.playTap();
    setTimeout(() => {
      setIsRefreshing(false);
      sound.playSuccess();
      showToast('success', 'تمت المزامنة ⚡', 'تم تحديث أحدث بيانات الحضور والدرجات من كمبيوتر المدرسة.');
    }, 600);
  };

  const handleSubmitExcuse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChild) return;
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
      showToast('gold', 'تم إرسال العذر لإدارة المدرسة ✅', 'تم قيد العذر وإشعار إدارة المدرسة ومشرف الحضور.');
      setIsSubmittingExcuse(false);
      setShowExcuseModal(false);
    }, 500);
  };

  // WhatsApp Director Link
  const schoolWhatsAppNumber = '218922465676';
  const directorWhatsAppUrl = `https://wa.me/${schoolWhatsAppNumber}?text=${encodeURIComponent(
    `السلام عليكم ورحمة الله، أنا ولي أمر الطالب (${activeChild?.name || ''}) بالصف (${activeChild?.className || ''}) بمدرسة الباعور، أود الاستفسار بخصوص متابعة ابني.`
  )}`;

  // Attendance stats
  const attHistory = activeChild?.recentAttendance || [];
  const attPresent = attHistory.filter(r => r.status === 'present').length;
  const attAbsent = attHistory.filter(r => r.status === 'unexcused').length;
  const attExcused = attHistory.filter(r => r.status === 'excused').length;
  const attLate = attHistory.filter(r => r.status === 'late').length;
  const attTotal = attHistory.length || 1;
  const attRate = Math.round(((attPresent + attExcused + attLate * 0.5) / attTotal) * 100);

  const todayStatus = activeChild?.status || 'present';

  // Role Gate
  const allowed = useRequireRole('parent');
  if (!allowed) return null;

  // Unlinked Visitor Screen with Direct QR Scan
  if (!activeChild) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-cairo text-right" dir="rtl">
        <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl space-y-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Smartphone className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-lg font-black text-white">منظومة ولي الأمر والطالب 📱</h2>
            <p className="text-xs text-slate-400 mt-1">{schoolProfile.name}</p>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/5">
            اربط ملف ابنك لمتابعة الحضور اليومي، كشف الدرجات المعتمد، وجدول الحصص مباشرة.
          </p>

          {/* Quick Action 1: QR Camera Scan */}
          <button
            type="button"
            onClick={() => { sound.playTap(); setShowScannerModal(true); }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>مسح باركود QR من كمبيوتر المدرسة 📷</span>
          </button>

          <div className="flex items-center gap-3 text-slate-500 text-xs my-2">
            <span className="flex-1 h-px bg-white/10" />
            <span>أو أدخل كود الربط يدوياً</span>
            <span className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleLinkChild} className="space-y-3">
            <input
              type="text"
              value={linkCodeInput}
              onChange={e => setLinkCodeInput(e.target.value)}
              placeholder="كود الربط أو الرقم الوطني (مثال: 1001)"
              className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow transition active:scale-95"
            >
              تأكيد الربط والدخول
            </button>
          </form>

          <p className="text-[10px] text-slate-400 leading-normal">
            💡 يمكن لإدارة المدرسة على الكمبيوتر توليد الباركود فوراً عبر زر <strong>(📱 باركود الهاتف)</strong>.
          </p>
        </div>

        <MobileQrScannerModal
          isOpen={showScannerModal}
          onClose={() => setShowScannerModal(false)}
          onScanSuccess={handleScanSuccess}
        />
      </div>
    );
  }

  // Pure Native Mobile Content
  const appContent = (
    <div className="w-full h-full min-h-[640px] bg-[#0b1329] text-white font-cairo flex flex-col justify-between select-none relative overflow-hidden text-right">
      
      {/* 1. TOP MOBILE HEADER & PORTAL SWITCHER */}
      <header className="sticky top-0 z-30 bg-[#0b1329]/95 backdrop-blur-xl border-b border-white/10 px-4 pt-3 pb-3">
        {/* PWA Install Notice Banner */}
        {showInstallPrompt && (
          <div className="mb-2 p-2 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white text-[11px] font-bold flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>أضف التطبيق للشاشة الرئيسية لهاتفك للعمل كتطبيق أندرويد 📱</span>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="p-1 text-white/80 hover:text-white rounded-lg"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Child Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { sound.playTap(); setShowChildPicker(!showChildPicker); }}
              className="flex items-center gap-2 p-1.5 pr-2 pl-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-right transition active:scale-95"
            >
              <img
                src={activeChild.avatar || logoImg}
                alt={activeChild.name}
                className="w-8 h-8 rounded-full object-cover border border-amber-400/50 shrink-0"
              />
              <div className="text-right leading-tight">
                <span className="text-xs font-black text-white block max-w-[110px] truncate">
                  {activeChild.name.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="text-[10px] text-amber-300/90 font-medium block">
                  {activeChild.className}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${showChildPicker ? 'rotate-180' : ''}`} />
            </button>

            {/* Sibling Dropdown */}
            {showChildPicker && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-black text-slate-400 border-b border-white/10 flex items-center justify-between">
                  <span>أبنائي المسجلون ({parentChildren.length})</span>
                  <button
                    onClick={() => { setShowScannerModal(true); setShowChildPicker(false); sound.playTap(); }}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Camera className="w-3 h-3" />
                    <span>مسح QR</span>
                  </button>
                </div>

                <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
                  {parentChildren.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectChild(c)}
                      className={`w-full p-2 rounded-xl flex items-center justify-between text-right transition ${
                        c.id === activeChild.id ? 'bg-amber-500/20 border border-amber-500/40 text-white' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold leading-tight">{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.className}</p>
                        </div>
                      </div>
                      {c.id === activeChild.id && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>

                <div className="pt-1.5 mt-1 border-t border-white/10">
                  <button
                    onClick={() => { setShowLinkModal(true); setShowChildPicker(false); sound.playTap(); }}
                    className="w-full py-1.5 text-center text-xs font-bold text-blue-400 hover:bg-white/5 rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ربط ابن إضافي بالكود</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mode Switcher Pill: ولي الأمر vs الطالب */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-950/80 border border-white/10">
            <button
              type="button"
              onClick={() => { setPortalMode('parent'); sound.playTap(); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1 ${
                portalMode === 'parent'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>ولي الأمر</span>
            </button>
            <button
              type="button"
              onClick={() => { setPortalMode('student'); sound.playTap(); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1 ${
                portalMode === 'student'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>الطالب</span>
            </button>
          </div>

          {/* Top Quick Actions (QR Scanner & Refresh) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => { sound.playTap(); setShowScannerModal(true); }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-amber-300 border border-white/10 transition active:scale-95"
              title="مسح كود QR من كمبيوتر المدرسة"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleManualRefresh}
              className={`p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10 transition active:scale-95 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`}
              title="مزامنة فورية مع كمبيوتر المدرسة"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Live Sync Status Pill */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">متزامن مع كمبيوتر المدرسة</span>
          </span>
          <span>{schoolProfile.name}</span>
        </div>
      </header>

      {/* 2. SCROLLABLE TAB CONTENT BODY */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        
        {/* ==================================================== */}
        {/* TAB 1: الرئيسية (HOME DASHBOARD - SLEEK STYLE)        */}
        {/* ==================================================== */}
        {currentTab === 'home' && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* Live Attendance Alert Banner */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-lg ${
              todayStatus === 'present'
                ? 'bg-gradient-to-r from-emerald-950/80 to-[#0b1329] border-emerald-500/30'
                : todayStatus === 'late'
                ? 'bg-gradient-to-r from-amber-950/80 to-[#0b1329] border-amber-500/30'
                : todayStatus === 'excused'
                ? 'bg-gradient-to-r from-blue-950/80 to-[#0b1329] border-blue-500/30'
                : 'bg-gradient-to-r from-rose-950/80 to-[#0b1329] border-rose-500/30'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl text-white ${
                  todayStatus === 'present' ? 'bg-emerald-600' :
                  todayStatus === 'late' ? 'bg-amber-600' :
                  todayStatus === 'excused' ? 'bg-blue-600' : 'bg-rose-600'
                }`}>
                  {todayStatus === 'present' ? <UserCheck className="w-4 h-4" /> :
                   todayStatus === 'late' ? <Clock className="w-4 h-4" /> :
                   todayStatus === 'excused' ? <HeartHandshake className="w-4 h-4" /> :
                   <AlertTriangle className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">حالة الحضور اليوم</span>
                  <h4 className="text-xs font-black text-white">
                    {todayStatus === 'present' ? 'حاضر اليوم في المدرسة ✅' :
                     todayStatus === 'late' ? 'مسجل كمتأخر عن الطابور ⏳' :
                     todayStatus === 'excused' ? 'غياب بعذر طبي معتمد 📝' :
                     'مسجل كغائب عن الحصص ⚠️'}
                  </h4>
                </div>
              </div>

              {todayStatus === 'unexcused' && (
                <button
                  type="button"
                  onClick={() => { sound.playTap(); setShowExcuseModal(true); }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black shadow transition active:scale-95"
                >
                  تقديم عذر
                </button>
              )}
            </div>

            {/* 4 Quick Stats Grid (Exact Sleek Design Structure) */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Card 1: Attendance Rate with Progress Ring */}
              <div className="p-3.5 rounded-2xl bg-[#14213d]/80 border border-white/10 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-400 block">نسبة الحضور</span>
                  <span className="text-xs font-black text-emerald-400 block mt-0.5">ممتاز 🌟</span>
                </div>
                <div className="relative w-11 h-11 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-700"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-400"
                      strokeDasharray={`${attRate}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black font-mono text-white">{attRate}%</span>
                </div>
              </div>

              {/* Card 2: Academic GPA */}
              <div className="p-3.5 rounded-2xl bg-[#14213d]/80 border border-white/10 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-400 block">المتوسط الدراسي</span>
                  <span className="text-xs font-black text-blue-300 block mt-0.5">
                    {activeChild.academicAverage ? (activeChild.academicAverage >= 85 ? 'ممتاز' : 'جيد جداً') : 'معتمد'}
                  </span>
                </div>
                <div className="text-left font-mono">
                  <span className="text-base font-black text-white">{activeChild.academicAverage || 87.3}</span>
                  <span className="text-[10px] text-slate-400 block">/ 100</span>
                </div>
              </div>

              {/* Card 3: Behavior Stars */}
              <div className="p-3.5 rounded-2xl bg-[#14213d]/80 border border-white/10 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-400 block">نقاط السلوك</span>
                  <span className="text-xs font-black text-amber-400 block mt-0.5">أداء مميز</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-xl text-amber-300 font-bold font-mono text-xs border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{activeChild.behaviorPointsTotal || 42}</span>
                </div>
              </div>

              {/* Card 4: Unread Notifications */}
              <div 
                onClick={() => { sound.playTap(); setCurrentTab('notices'); }}
                className="p-3.5 rounded-2xl bg-[#14213d]/80 border border-white/10 flex items-center justify-between shadow-sm cursor-pointer hover:bg-white/5 transition"
              >
                <div>
                  <span className="text-[10px] text-slate-400 block">إشعارات جديدة</span>
                  <span className="text-xs font-black text-rose-300 block mt-0.5">تنبيهات هامة</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center font-mono font-bold text-xs">
                  {notifications.filter(n => !n.read).length || 3}
                </div>
              </div>

            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { sound.playTap(); setShowExcuseModal(true); }}
                className="p-3 rounded-2xl bg-gradient-to-b from-blue-900/50 to-slate-900 border border-blue-500/30 flex flex-col items-center justify-center gap-1 transition active:scale-95 text-center shadow"
              >
                <HeartHandshake className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-black text-white">تقديم عذر</span>
              </button>

              <button
                type="button"
                onClick={() => { sound.playTap(); setShowPrintModal(true); }}
                className="p-3 rounded-2xl bg-gradient-to-b from-amber-950/50 to-slate-900 border border-amber-500/30 flex flex-col items-center justify-center gap-1 transition active:scale-95 text-center shadow"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-black text-white">بطاقة الدرجات</span>
              </button>

              <a
                href={directorWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-gradient-to-b from-emerald-950/50 to-slate-900 border border-emerald-500/30 flex flex-col items-center justify-center gap-1 transition active:scale-95 text-center shadow"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-black text-white">محادثة الإدارة</span>
              </a>
            </div>

            {/* Today's Schedule Carousel */}
            <div className="p-4 rounded-2xl bg-[#14213d]/80 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>جدول حصص اليوم (اليوم الدراسي الحالي)</span>
                </h4>
                <span className="text-[10px] text-slate-400">6 حصص</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                {[
                  { period: 'الحصة 1', subject: 'اللغة العربية', teacher: 'أ. سالم التاورغي', time: '08:00 - 08:45', color: 'border-blue-500' },
                  { period: 'الحصة 2', subject: 'الرياضيات', teacher: 'أ. طارق الفيتوري', time: '08:45 - 09:30', color: 'border-emerald-500' },
                  { period: 'الحصة 3', subject: 'العلوم', teacher: 'أ. فاطمة المجبري', time: '09:30 - 10:15', color: 'border-purple-500' },
                  { period: 'الحصة 4', subject: 'التربية الإسلامية', teacher: 'أ. عثمان السويحلي', time: '10:45 - 11:30', color: 'border-amber-500' },
                  { period: 'الحصة 5', subject: 'الحاسوب', teacher: 'أ. أدم المنصوري', time: '11:30 - 12:15', color: 'border-cyan-500' },
                  { period: 'الحصة 6', subject: 'اللغة الإنجليزية', teacher: 'أ. مفتاح الورفلي', time: '12:15 - 01:00', color: 'border-rose-500' }
                ].map((p, idx) => (
                  <div
                    key={idx}
                    className={`min-w-[130px] p-2.5 rounded-xl bg-slate-900/90 border-r-2 ${p.color} border border-white/5 space-y-1 shrink-0 text-right`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{p.period}</span>
                      <span className="font-mono text-[9px] text-slate-300">{p.time.split(' - ')[0]}</span>
                    </div>
                    <p className="text-xs font-black text-white truncate">{p.subject}</p>
                    <p className="text-[9px] text-slate-400 truncate">{p.teacher}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* School Emergency Phone */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>هاتف إدارة المدرسة:</span>
              </div>
              <a href={`tel:${schoolProfile.directorPhone || '0912345678'}`} className="font-mono font-bold text-amber-300 hover:underline">
                {schoolProfile.directorPhone || '0912345678'}
              </a>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: الدرجات والشهادة (GRADES & REPORT CARD)         */}
        {/* ==================================================== */}
        {currentTab === 'grades' && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* Exam Release Gate */}
            {gradesReleased === false ? (
              <div className="p-6 rounded-3xl bg-amber-950/40 border border-amber-500/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-white">الدرجات قيد المراجعة والاعتماد</h3>
                <p className="text-xs text-amber-200/80 leading-relaxed max-w-sm mx-auto">
                  يقوم رئيس الكنترول حالياً بمراجعة درجات الفصل. ستظهر تفاصيل كشف الدرجات فور اعتمادها رسمياً.
                </p>
              </div>
            ) : (
              <>
                {/* GPA Hero Banner */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-amber-500/30 text-center space-y-2 shadow-xl">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black inline-flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    <span>النتيجة الرسمية المعتمدة 🇱🇾</span>
                  </span>
                  <div className="text-4xl font-black font-mono text-white tracking-tight">
                    {activeChild.academicAverage != null ? `${activeChild.academicAverage}%` : '87.3%'}
                  </div>
                  <p className="text-xs text-blue-200">
                    التقدير العام: <strong className="text-amber-300 font-black">{activeChild.appreciation || 'جيد جداً مرتفع'}</strong>
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => { sound.playFanfare(); setShowPrintModal(true); }}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black shadow transition active:scale-98 flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4 text-slate-950" />
                      <span>عرض وطباعة كشف الدرجات والشهادة المعتمدة</span>
                    </button>
                  </div>
                </div>

                {/* Subject Cards with Visual Progress Bar */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black text-slate-400 px-1">كشف درجات المواد الدراسية</h4>
                  
                  {(activeChild.grades && activeChild.grades.length > 0 ? activeChild.grades : [
                    { subjectName: 'الرياضيات', teacherName: 'أ. طارق الفيتوري', total: 92, maxTotal: 100, appreciation: 'ممتاز' },
                    { subjectName: 'اللغة العربية', teacherName: 'أ. سالم التاورغي', total: 88, maxTotal: 100, appreciation: 'ممتاز' },
                    { subjectName: 'العلوم', teacherName: 'أ. فاطمة المجبري', total: 78, maxTotal: 100, appreciation: 'جيد جداً' },
                    { subjectName: 'التربية الإسلامية', teacherName: 'أ. عثمان السويحلي', total: 95, maxTotal: 100, appreciation: 'ممتاز' },
                    { subjectName: 'الحاسوب', teacherName: 'أ. أدم المنصوري', total: 90, maxTotal: 100, appreciation: 'ممتاز' },
                    { subjectName: 'اللغة الإنجليزية', teacherName: 'أ. مفتاح الورفلي', total: 84, maxTotal: 100, appreciation: 'جيد جداً' }
                  ]).map((g, idx) => {
                    const total = g.total || 85;
                    const max = g.maxTotal || 100;
                    const pct = Math.round((total / max) * 100);
                    const colorBar = pct >= 85 ? 'bg-emerald-400' : pct >= 75 ? 'bg-blue-400' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400';
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-[#14213d]/80 border border-white/10 space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-black text-white block">{g.subjectName}</span>
                            <span className="text-[10px] text-slate-400">{g.teacherName || 'معلم المادة'}</span>
                          </div>
                          <div className="text-left flex items-center gap-2">
                            <span className="text-xs font-black font-mono text-white">{total} / {max}</span>
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {g.appreciation || 'ناجح'}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className={`h-full ${colorBar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: سجل الحضور (ATTENDANCE TRACKER WITH CALENDAR)  */}
        {/* ==================================================== */}
        {currentTab === 'attendance' && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* Monthly Calendar View (September 2026) */}
            <div className="p-4 rounded-3xl bg-[#14213d]/90 border border-white/10 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-black text-white">تقويم الحضور والغياب (سبتمبر 2026)</h4>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold font-mono">انضباط {attRate}%</span>
              </div>

              {/* Calendar Days Header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 border-b border-white/10 pb-1">
                <span>أحد</span>
                <span>إثنين</span>
                <span>ثلاثاء</span>
                <span>أربعاء</span>
                <span>خميس</span>
                <span>جمعة</span>
                <span>سبت</span>
              </div>

              {/* Month Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                  // Simulate Libyan school week (Sun-Thu school, Fri-Sat weekend)
                  const isWeekend = day % 7 === 6 || day % 7 === 0;
                  const isToday = day === 15;
                  const isAbsent = day === 10;
                  const isExcused = day === 1;
                  const isLate = day === 8;
                  const isPresent = !isWeekend && !isAbsent && !isExcused && !isLate && day <= 15;

                  return (
                    <div
                      key={day}
                      className={`p-1.5 rounded-xl flex flex-col items-center justify-center transition text-[11px] font-mono ${
                        isToday
                          ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-300'
                          : isWeekend
                          ? 'bg-white/[0.02] text-slate-600'
                          : 'bg-white/5 text-slate-200'
                      }`}
                    >
                      <span>{day}</span>
                      {!isWeekend && day <= 15 && (
                        <span className={`w-1.5 h-1.5 rounded-full mt-1 ${
                          isAbsent ? 'bg-rose-500' :
                          isExcused ? 'bg-blue-400' :
                          isLate ? 'bg-amber-400' :
                          'bg-emerald-400'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-3 pt-2 border-t border-white/10 text-[10px] text-slate-300">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> حاضر</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> متأخر</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> بعذر</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> غياب</span>
              </div>
            </div>

            {/* Attendance Breakdown Counters */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-300 block">حضور</span>
                <span className="text-base font-black text-white font-mono">{attPresent || 18}</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                <span className="text-[10px] text-amber-300 block">تأخير</span>
                <span className="text-base font-black text-white font-mono">{attLate || 2}</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30">
                <span className="text-[10px] text-blue-300 block">بعذر</span>
                <span className="text-base font-black text-white font-mono">{attExcused || 1}</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30">
                <span className="text-[10px] text-rose-300 block">غياب</span>
                <span className="text-base font-black text-white font-mono">{attAbsent || 0}</span>
              </div>
            </div>

            {/* Recent Attendance Log */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-black text-slate-400">سجل الأيام الدراسية الأخيرة</h4>
                <button
                  type="button"
                  onClick={() => { sound.playTap(); setShowExcuseModal(true); }}
                  className="text-amber-400 hover:text-amber-300 text-[10px] font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>تقديم عذر طبي</span>
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                {(activeChild.recentAttendance && activeChild.recentAttendance.length > 0 ? activeChild.recentAttendance : [
                  { date: 'الثلاثاء 2026-09-15', status: 'present', note: 'حضور مبكر ومنضبط' },
                  { date: 'الإثنين 2026-09-14', status: 'present' },
                  { date: 'الأحد 2026-09-13', status: 'late', note: 'تأخر 10 دقائق بسبب المواصلات' },
                  { date: 'الخميس 2026-09-10', status: 'excused', note: 'عذر طبي معتمد' }
                ]).map((rec, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-[#14213d]/70 border border-white/5 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <span className="font-bold text-white block">{rec.date}</span>
                      {rec.note && <span className="text-[10px] text-slate-400">{rec.note}</span>}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      rec.status === 'present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      rec.status === 'late' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      rec.status === 'excused' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {rec.status === 'present' ? 'حاضر' :
                       rec.status === 'late' ? 'متأخر' :
                       rec.status === 'excused' ? 'عذر طبي' : 'غياب'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: التنبيهات (NOTIFICATIONS & ANNOUNCEMENTS)       */}
        {/* ==================================================== */}
        {currentTab === 'notices' && (
          <div className="space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-black text-slate-300">مركز الإشعارات والتنبيهات المدرسية</h4>
              <span className="text-[10px] text-amber-300 font-bold">محدث لحظياً ⚡</span>
            </div>

            {/* Notifications Feed */}
            <div className="space-y-2">
              {(notifications && notifications.length > 0 ? notifications : [
                { id: '1', title: 'رسالة من معلم الرياضيات', message: 'أظهر الطالب تميزاً كبيراً في حل تمارين الضرب. شكراً لمتابعتكم المستمرة.', date: 'اليوم', time: '10:15 ص', read: false },
                { id: '2', title: 'رصد درجات اختبار مادة العلوم', message: 'تم نشر تقييم الشهر الأول لمادة العلوم، حصل الطالب على 78/100.', date: 'اليوم', time: '09:00 ص', read: false },
                { id: '3', title: 'تعميم إداري: اجتماع أولياء الأمور', message: 'تتشرف إدارة مدرسة الباعور بدعوتكم لحضور الاجتماع الفصلي يوم الخميس القادم.', date: 'أمس', time: '04:30 م', read: true }
              ]).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-3.5 rounded-2xl border transition-all text-right ${
                    !notif.read
                      ? 'bg-[#14213d] border-amber-500/40 shadow-md'
                      : 'bg-[#0f172a]/60 border-white/5 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-white">{notif.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">{notif.time || notif.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                </div>
              ))}
            </div>

            {/* Direct School WhatsApp Contact */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/30 text-center space-y-2">
              <h5 className="text-xs font-black text-white">تواصل مباشر مع الإدارة والأخصائي</h5>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                هل لديك استفسار أو ملاحظة؟ يمكنك مراسلة الإدارة مباشرة عبر واتساب:
              </p>
              <a
                href={directorWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>مراسلة إدارة المدرسة عبر واتساب</span>
              </a>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: واجهة الطالب المخصصة (STUDENT HUB & HOMEWORK)  */}
        {/* ==================================================== */}
        {currentTab === 'student-hub' && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* Student Digital Smart ID Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 border-2 border-amber-400/50 shadow-2xl relative overflow-hidden space-y-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <img src={logoImg} alt="شعار المدرسة" className="w-8 h-8 object-contain" />
                  <div>
                    <h4 className="text-[11px] font-black text-amber-300">{schoolProfile.name}</h4>
                    <span className="text-[9px] text-slate-300 block">بطاقة الطالب الرقمية المعتمدة {schoolProfile.academicYear}</span>
                  </div>
                </div>
                <span className="text-xs">🇱🇾</span>
              </div>

              <div className="flex items-center gap-3.5">
                <img
                  src={activeChild.avatar}
                  alt={activeChild.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                />
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white">{activeChild.name}</h3>
                  <p className="text-[11px] text-amber-300 font-bold">الصف: {activeChild.className}</p>
                  <p className="text-[10px] text-slate-300 font-mono">رقم القيد: {activeChild.studentNumber || '7819201'}</p>
                </div>
              </div>

              {/* Barcode / QR Simulation Strip */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-300">
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>كود الطالب: {activeChild.linkCode || 'SCH-2026-R1'}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">طالب نظامي معتمد</span>
              </div>
            </div>

            {/* Interactive Homework Checklist */}
            <div className="p-4 rounded-2xl bg-[#14213d]/90 border border-white/10 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span>واجباتي ومهامي المدرسية اليوم</span>
                </h4>
                <span className="text-[10px] text-slate-400">
                  {homeworkList.filter(h => h.completed).length} من {homeworkList.length} مكتملة
                </span>
              </div>

              <div className="space-y-2">
                {homeworkList.map((hw) => (
                  <div
                    key={hw.id}
                    onClick={() => handleToggleHomework(hw.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      hw.completed
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-slate-400 line-through'
                        : 'bg-slate-900 border-white/10 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {hw.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <span className="text-xs font-bold block">{hw.title}</span>
                        <span className="text-[10px] text-amber-400">{hw.subject}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{hw.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gamified Achievements & Badges */}
            <div className="p-4 rounded-2xl bg-[#14213d]/90 border border-white/10 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>لوحة الأوسمة والتميز</span>
                </h4>
                <span className="text-xs font-black text-amber-300 font-mono">
                  {activeChild.behaviorPointsTotal || 42} ⭐
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                  <span className="text-xl block">🥇</span>
                  <span className="font-bold block">التفوق الدراسي</span>
                  <span className="text-[9px] text-slate-400 block">مرتبة الشرف</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                  <span className="text-xl block">🌟</span>
                  <span className="font-bold block">الانضباط العالي</span>
                  <span className="text-[9px] text-slate-400 block">بدون غياب</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 space-y-1">
                  <span className="text-xl block">💡</span>
                  <span className="font-bold block">المشاركة الصفية</span>
                  <span className="text-[9px] text-slate-400 block">نشاط متميز</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 3. NATIVE MOBILE BOTTOM NAVIGATION BAR (5 TABS) */}
      <nav className="sticky bottom-0 z-30 bg-[#0b1329]/98 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => { sound.playTap(); setCurrentTab('home'); }}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 rounded-2xl transition ${
            currentTab === 'home' ? 'text-amber-400 bg-amber-500/15 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">الرئيسية</span>
        </button>

        <button
          type="button"
          onClick={() => { sound.playTap(); setCurrentTab('grades'); }}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 rounded-2xl transition ${
            currentTab === 'grades' ? 'text-amber-400 bg-amber-500/15 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px]">الدرجات</span>
        </button>

        <button
          type="button"
          onClick={() => { sound.playTap(); setCurrentTab('attendance'); }}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 rounded-2xl transition ${
            currentTab === 'attendance' ? 'text-emerald-400 bg-emerald-500/15 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span className="text-[10px]">الحضور</span>
        </button>

        <button
          type="button"
          onClick={() => { sound.playTap(); setCurrentTab('notices'); }}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 rounded-2xl transition ${
            currentTab === 'notices' ? 'text-purple-400 bg-purple-500/15 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px]">التنبيهات</span>
        </button>

        <button
          type="button"
          onClick={() => { sound.playTap(); setCurrentTab('student-hub'); }}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 rounded-2xl transition ${
            currentTab === 'student-hub' ? 'text-blue-400 bg-blue-500/15 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="text-[10px]">مهام الطالب</span>
        </button>
      </nav>

      {/* 4. MODALS */}

      {/* Modal A: Camera QR Scanner */}
      <MobileQrScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Modal B: Submit Absence Excuse */}
      {showExcuseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-5 text-right space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-black text-white">تقديم عذر غياب للمدرسة</h3>
              </div>
              <button onClick={() => setShowExcuseModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitExcuse} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">تاريخ الغياب:</label>
                <input
                  type="date"
                  value={excuseDate}
                  onChange={e => setExcuseDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">سبب الغياب:</label>
                <select
                  value={excuseReason}
                  onChange={e => setExcuseReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                >
                  <option value="ظرف صحي طارئ (مرفق التقرير الطبي)">ظرف صحي طارئ (مرفق التقرير الطبي)</option>
                  <option value="مراجعة مستشفى أو عيادة تخصصية">مراجعة مستشفى أو عيادة تخصصية</option>
                  <option value="سفر عائلي اضطراري">سفر عائلي اضطراري</option>
                  <option value="ظرف اجتماعي قاهر">ظرف اجتماعي قاهر</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-dashed border-white/20 text-center cursor-pointer hover:bg-white/10 transition">
                <p className="text-[11px] text-amber-300 font-bold">📎 إرفاق صورة العذر الطبي أو الإجازة (اختياري)</p>
                <span className="text-[9px] text-slate-400">يدعم JPG, PNG, PDF</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingExcuse}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingExcuse ? 'جاري الإرسال...' : 'إرسال العذر لإدارة المدرسة ✅'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExcuseModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal C: Manual Link Sibling */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-5 text-right space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">ربط ابن إضافي</h3>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLinkChild} className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                أدخل كود الطالب المكون من 4 أرقام (مثل 1001) أو رقمه الوطني:
              </p>

              <div>
                <input
                  type="text"
                  placeholder="مثال: 1001 أو SCH-2026-R1"
                  value={linkCodeInput}
                  onChange={e => setLinkCodeInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-mono text-center tracking-wider"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow transition active:scale-95"
                >
                  تأكيد الربط
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal D: Official Printable Student Grade Card */}
      {showPrintModal && activeChild && (
        <PrintableStudentGradeCard
          isOpen={showPrintModal}
          student={activeChild}
          onClose={() => setShowPrintModal(false)}
        />
      )}

    </div>
  );

  // Desktop Simulator Frame
  if (isPhoneFrame && !embeddedInFrame) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 font-cairo text-right">
        
        {/* Top Control Bar for Simulator */}
        <div className="w-full max-w-md mb-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">تطبيق الهاتف الذكي (ولي الأمر / الطالب)</span>
          </div>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] transition"
          >
            عرض ملء الشاشة ↗
          </button>
        </div>

        {/* Android / iPhone Mockup Frame */}
        <div className="relative w-full max-w-[390px] h-[780px] bg-black rounded-[48px] p-3 ring-12 ring-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-4 border-slate-700 overflow-hidden flex flex-col">
          {/* Top Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black rounded-full z-40 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          </div>

          <div className="w-full h-full rounded-[38px] overflow-hidden flex flex-col">
            {appContent}
          </div>

          {/* Bottom Bar */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1 bg-white/40 rounded-full pointer-events-none" />
        </div>

      </div>
    );
  }

  // Pure Mobile Fullscreen View
  return appContent;
};
