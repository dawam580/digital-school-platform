import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useRequireRole } from '../../hooks/useRequireRole';
import { ExamStorageService } from '../../services/exams/examStorageService';
import { Student } from '../../types';
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
  Smile
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { PrintableStudentGradeCard } from '../../components/exams/PrintableStudentGradeCard';
import logoImg from '../../assets/logo.png';

interface ParentMobileAppProps {
  embeddedInFrame?: boolean;
}

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
    logout,
    setActiveTab,
    setCurrentRole
  } = useSchool();

  // Active Bottom Navigation Tab
  const [currentTab, setCurrentTab] = useState<'home' | 'grades' | 'attendance' | 'notices'>('home');

  // Modals
  const [showChildPicker, setShowChildPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkCodeInput, setLinkCodeInput] = useState('');
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [excuseDate, setExcuseDate] = useState(new Date().toISOString().split('T')[0]);
  const [excuseReason, setExcuseReason] = useState('ظرف صحي طارئ (مرفق التقرير الطبي)');
  const [isSubmittingExcuse, setIsSubmittingExcuse] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);

  // Phone Mockup Frame toggle (when viewed on desktop)
  const [isPhoneFrame, setIsPhoneFrame] = useState(!embeddedInFrame && typeof window !== 'undefined' && window.innerWidth > 768);

  // Identify all children linked to this parent — NO silent fallback:
  // unlinked visitors must link with a valid code (never auto-open the first student).
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

  // Handle Switching Sibling
  const handleSelectChild = (child: Student) => {
    setParentLinkedStudent(child);
    setSelectedStudent(child);
    setShowChildPicker(false);
    sound.playTap();
    showToast('info', 'تم التبديل 🔄', `أنت الآن تتابع بيانات الطالب (${child.name.split(' ')[0]})`);
  };

  // Handle Linking another child
  const handleLinkChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkCodeInput.trim()) return;
    const success = linkStudent(linkCodeInput.trim());
    if (success) {
      sound.playSuccess();
      triggerConfetti();
      showToast('gold', 'تم ربط الطالب بنجاح 🎉', 'تمت إضافة ابنك إلى قائمة الأبناء بنجاح.');
      setShowLinkModal(false);
      setLinkCodeInput('');
    } else {
      sound.playAlert();
      showToast('error', 'رمز غير صحيح', 'تأكد من رمز الطالب أو رقمه الوطني المكون من 4 أرقام أو 12 رقماً.');
    }
  };

  // Handle Submitting Medical / Absence Excuse
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
      showToast('gold', 'تم إرسال العذر لإدارة المدرسة ✅', 'تم قيد العذر وإشعار الإدارة ومشرف الحضور.');
      setIsSubmittingExcuse(false);
      setShowExcuseModal(false);
    }, 600);
  };

  // WhatsApp Message for Director
  const schoolWhatsAppNumber = '218922465676';
  const directorWhatsAppUrl = `https://wa.me/${schoolWhatsAppNumber}?text=${encodeURIComponent(
    `السلام عليكم ورحمة الله، أنا ولي أمر الطالب (${activeChild?.name}) بالصف (${activeChild?.className})، أود الاستفسار بخصوص متابعة ابني.`
  )}`;

  // Attendance stats
  const attHistory = activeChild?.recentAttendance || [];
  const attPresent = attHistory.filter(r => r.status === 'present').length;
  const attAbsent = attHistory.filter(r => r.status === 'unexcused').length;
  const attExcused = attHistory.filter(r => r.status === 'excused').length;
  const attTotal = attHistory.length || 1;
  const attRate = Math.round(((attPresent + attExcused) / attTotal) * 100);

  // Today's Status
  const todayStatus = activeChild?.status || 'present';

  // حارس الدور الإلزامي: شاشة ولي الأمر فقط (والمدير/السوبر المعاينين)
  const allowed = useRequireRole('parent');
  if (!allowed) return null;

  // بوابة الربط: بلا ابن مربوط لا تُعرض أي بيانات — الربط بكود صحيح فقط
  if (!activeChild) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-cairo" dir="rtl">
        <form
          onSubmit={handleLinkChild}
          className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-slate-700 space-y-4 text-center"
        >
          <p className="text-3xl">🔗</p>
          <h2 className="text-base font-black text-white">اربط ملف ابنك أولاً</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            أدخل كود الربط المسلم من إدارة المدرسة أو الرقم الوطني للطالب لعرض ملفه.
          </p>
          <input
            type="text"
            value={linkCodeInput}
            onChange={e => setLinkCodeInput(e.target.value)}
            placeholder="كود الربط أو الرقم الوطني"
            className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow transition active:scale-95"
          >
            تأكيد الربط ومتابعة الابن
          </button>
        </form>
      </div>
    );
  }

  // The actual mobile app screen content
  const appContent = (
    <div className="w-full h-full min-h-[640px] bg-slate-900 text-white font-cairo flex flex-col justify-between select-none relative overflow-hidden text-right">
      
      {/* 1. TOP MOBILE STATUS & HEADER BAR */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-white/10 px-4 pt-3 pb-3">
        {/* PWA Install Notice Banner (Dismissible) */}
        {showInstallPrompt && (
          <div className="mb-2.5 p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>أضف التطبيق إلى الشاشة الرئيسية لهاتفك للدخول بلمسة واحدة!</span>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="p-1 text-white/80 hover:text-white rounded-lg"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          
          {/* Active Child Selector Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { sound.playTap(); setShowChildPicker(!showChildPicker); }}
              className="flex items-center gap-2 p-1.5 pr-2 pl-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-right transition active:scale-95"
            >
              <img
                src={activeChild?.avatar || logoImg}
                alt={activeChild?.name}
                className="w-8 h-8 rounded-full object-cover border border-blue-400/50 shrink-0"
              />
              <div className="text-right leading-tight">
                <span className="text-xs font-black text-white block max-w-[120px] truncate">
                  {activeChild?.name ? activeChild.name.split(' ').slice(0, 2).join(' ') : 'الطالب'}
                </span>
                <span className="text-[10px] text-blue-300 font-medium block">
                  الصف: {activeChild?.className || '—'}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-blue-300 transition-transform ${showChildPicker ? 'rotate-180' : ''}`} />
            </button>

            {/* Sibling Dropdown Menu */}
            {showChildPicker && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-black text-slate-400 border-b border-white/10 flex items-center justify-between">
                  <span>أبنائي المسجلون ({parentChildren.length})</span>
                  <button
                    onClick={() => { setShowLinkModal(true); setShowChildPicker(false); sound.playTap(); }}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[10px]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إضافة ابن</span>
                  </button>
                </div>

                <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
                  {parentChildren.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectChild(c)}
                      className={`w-full p-2 rounded-xl flex items-center justify-between text-right transition ${
                        c.id === activeChild?.id ? 'bg-blue-600/30 border border-blue-500/40 text-white' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold leading-tight">{c.name}</p>
                          <p className="text-[10px] text-slate-400">الفصل: {c.className}</p>
                        </div>
                      </div>
                      {c.id === activeChild?.id && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* School Name & Top Direct Tools */}
          <div className="flex items-center gap-1.5">
            <a
              href={directorWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition active:scale-95"
              title="مراسلة إدارة المدرسة عبر واتساب"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            <button
              onClick={() => { sound.playTap(); setShowPrintModal(true); }}
              className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition active:scale-95"
              title="طباعة وتحميل الشهادة المعتمدة"
            >
              <Award className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. SCROLLABLE TAB CONTENT BODY */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        
        {/* ---------------------------------------------------- */}
        {/* TAB 1: الرئيسية (HOME DASHBOARD)                      */}
        {/* ---------------------------------------------------- */}
        {currentTab === 'home' && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* Live Attendance Alert Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${
              todayStatus === 'present'
                ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900 border-emerald-500/30'
                : todayStatus === 'late'
                ? 'bg-gradient-to-r from-amber-950/80 to-slate-900 border-amber-500/30'
                : todayStatus === 'excused'
                ? 'bg-gradient-to-r from-blue-950/80 to-slate-900 border-blue-500/30'
                : 'bg-gradient-to-r from-rose-950/80 to-slate-900 border-rose-500/30'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl text-white ${
                  todayStatus === 'present' ? 'bg-emerald-600' :
                  todayStatus === 'late' ? 'bg-amber-600' :
                  todayStatus === 'excused' ? 'bg-blue-600' : 'bg-rose-600'
                }`}>
                  {todayStatus === 'present' ? <UserCheck className="w-5 h-5" /> :
                   todayStatus === 'late' ? <Clock className="w-5 h-5" /> :
                   todayStatus === 'excused' ? <HeartHandshake className="w-5 h-5" /> :
                   <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">حالة الحضور اليوم بالمدرسة</span>
                  <h3 className="text-sm font-black text-white">
                    {todayStatus === 'present' ? 'حاضر اليوم في المدرسة ✅' :
                     todayStatus === 'late' ? 'مسجل كمتأخر عن الطابور ⏳' :
                     todayStatus === 'excused' ? 'غياب بعذر طبي معتمد 📝' :
                     'مسجل كغائب عن الحصص ⚠️'}
                  </h3>
                </div>
              </div>

              {todayStatus === 'unexcused' && (
                <button
                  type="button"
                  onClick={() => { sound.playTap(); setShowExcuseModal(true); }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow transition active:scale-95"
                >
                  تقديم عذر
                </button>
              )}
            </div>

            {/* Child Profile & Quick Stats Card */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-white/10 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{activeChild?.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      رقم القيد: <span className="font-mono text-blue-300">{activeChild?.studentNumber || '7819201'}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block">المعدل العام</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {activeChild?.academicAverage != null ? `${activeChild.academicAverage}%` : '—'}
                  </span>
                </div>
              </div>

              {/* Quick Metrics 3-Col */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10 text-center">
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-[10px] text-slate-400 block">الفصل</span>
                  <span className="text-xs font-black text-white">{activeChild?.className}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-[10px] text-slate-400 block">الترتيب</span>
                  <span className="text-xs font-black text-amber-300">يُعلن مع النتائج</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-[10px] text-slate-400 block">نقاط التميز</span>
                  <span className="text-xs font-black text-blue-300 font-mono">{activeChild?.behaviorPointsTotal != null ? `+${activeChild.behaviorPointsTotal} ⭐` : '—'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => { sound.playTap(); setShowExcuseModal(true); }}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-900/60 to-slate-800 border border-blue-500/30 hover:border-blue-400/50 flex flex-col items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
              >
                <div className="p-2 rounded-xl bg-blue-600/30 text-blue-300">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-white">تقديم عذر غياب</span>
                <span className="text-[10px] text-blue-200">إشعار إدارة المدرسة</span>
              </button>

              <button
                type="button"
                onClick={() => { sound.playTap(); setShowPrintModal(true); }}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-800 border border-amber-500/30 hover:border-amber-400/50 flex flex-col items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
              >
                <div className="p-2 rounded-xl bg-amber-600/30 text-amber-300">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-white">كشف الدرجات والشهادة</span>
                <span className="text-[10px] text-amber-200">تحميل وطباعة رسمية</span>
              </button>
            </div>

            {/* Today's Schedule Mini-Timeline */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>جدول الحصص اليومي</span>
                </h4>
                <span className="text-[10px] text-slate-400">اليوم الدراسي الحالي</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between border-r-2 border-emerald-500">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-emerald-400">08:15</span>
                    <span className="font-bold text-white">الرياضيات</span>
                  </div>
                  <span className="text-[10px] text-slate-400">أ. سالم التاورغي</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between border-r-2 border-blue-500">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-blue-400">09:00</span>
                    <span className="font-bold text-white">اللغة العربية</span>
                  </div>
                  <span className="text-[10px] text-slate-400">أ. فاطمة المهدي</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between border-r-2 border-purple-500">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-purple-400">09:45</span>
                    <span className="font-bold text-white">العلوم الطبيعية</span>
                  </div>
                  <span className="text-[10px] text-slate-400">أ. خالد البوعيشي</span>
                </div>
              </div>
            </div>

            {/* Direct School Phone & Emergency Contact */}
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">هاتف إدارة المدرسة المباشر:</span>
              </div>
              <a href="tel:0922465676" className="font-mono font-bold text-blue-400 hover:underline">
                0922465676
              </a>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: الدرجات والشهادة (GRADES & REPORT CARD)         */}
        {/* ---------------------------------------------------- */}
        {currentTab === 'grades' && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* Exam Lock Gate Notification */}
            {gradesReleased === false ? (
              <div className="p-6 rounded-3xl bg-amber-950/40 border border-amber-500/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-white">الدرجات قيد الاعتماد والمراجعة</h3>
                <p className="text-xs text-amber-200/80 leading-relaxed max-w-sm mx-auto">
                  يقوم رئيس الكنترول وإدارة الامتحانات حالياً بمراجعة رصد درجات الفصل. ستظهر النتائج فور اعتمادها رسمياً.
                </p>
              </div>
            ) : (
              <>
                {/* GPA Hero Banner */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-500/30 text-center space-y-2 shadow-xl">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>النتيجة الرسمية المعتمدة 🇱🇾</span>
                  </span>
                  <div className="text-4xl font-black font-mono text-white tracking-tight">
                    {activeChild?.academicAverage != null ? `${activeChild.academicAverage}%` : '—'}
                  </div>
                  <p className="text-xs text-blue-200">
                    التقدير العام: <strong className="text-amber-300 font-black">{activeChild?.appreciation || 'لم يُحتسب بعد'}</strong>
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => { sound.playFanfare(); setShowPrintModal(true); }}
                      className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-950 text-xs font-black shadow-md hover:bg-blue-50 transition active:scale-98 flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>عرض وطباعة بطاقة الدرجات الرسمية</span>
                    </button>
                  </div>
                </div>

                {/* Subject Grades List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-400 px-1">كشف درجات المواد الدراسية</h4>
                  
                  {activeChild?.grades && activeChild.grades.length > 0 ? (
                    activeChild.grades.map((g, idx) => {
                      const coursework = (g.period1 || 0) + (g.period2 || 0) + (g.quizzes || 0) + (g.homework || 0) + (g.participation || 0);
                      const total = g.total ?? (coursework + (g.finalExam || 0));
                      const max = g.maxTotal || 100;
                      const pass = total >= 50;
                      return (
                      <div
                        key={g.id || idx}
                        className="p-3.5 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-black text-white block">{g.subjectName}</span>
                          <span className="text-[10px] text-slate-400">
                            أعمال السنة: {coursework} • الامتحان: {g.finalExam ?? '—'}
                          </span>
                        </div>

                        <div className="text-left flex items-center gap-3">
                          <span className={`text-sm font-black font-mono ${pass ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {total} / {max}
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${pass ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                            {g.appreciation || (pass ? 'ناجح' : 'دور ثانٍ')}
                          </span>
                        </div>
                      </div>
                      );
                    })
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-800/60 border border-white/10 text-center space-y-1">
                      <p className="text-sm font-black text-white">لم تُرصد درجات هذا الفصل بعد 📝</p>
                      <p className="text-[11px] text-slate-400">ستظهر هنا فور إدخال المعلمين للدرجات واعتمادها.</p>
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: سجل الحضور (ATTENDANCE HISTORY & EXCUSES)     */}
        {/* ---------------------------------------------------- */}
        {currentTab === 'attendance' && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* Attendance Rate Circle Card */}
            <div className="p-4 rounded-3xl bg-slate-800/80 border border-white/10 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">نسبة الانضباط المدرسي</span>
                <h3 className="text-2xl font-black text-white font-mono">{attRate}%</h3>
                <p className="text-[10px] text-emerald-400 font-bold">
                  {attRate >= 90 ? 'مستوى انضباط ممتاز ومستمر 🌟' : 'انضباط جيد جداً'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => { sound.playTap(); setShowExcuseModal(true); }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow transition active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إرسال عذر</span>
              </button>
            </div>

            {/* Attendance Breakdown Counters */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-center">
                <span className="text-[10px] text-emerald-400 block">حضور</span>
                <span className="text-lg font-black text-white font-mono">{attPresent || 22}</span>
                <span className="text-[9px] text-slate-500 block">يوماً</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-center">
                <span className="text-[10px] text-rose-400 block">غياب</span>
                <span className="text-lg font-black text-white font-mono">{attAbsent || 0}</span>
                <span className="text-[9px] text-slate-500 block">يوماً</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-center">
                <span className="text-[10px] text-blue-400 block">بعذر طبي</span>
                <span className="text-lg font-black text-white font-mono">{attExcused || 1}</span>
                <span className="text-[9px] text-slate-500 block">يوماً</span>
              </div>
            </div>

            {/* Attendance Log List */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-400 px-1">سجل الحضور في آخر الأيام الدراسية</h4>
              
              <div className="space-y-1.5 text-xs">
                {(activeChild?.recentAttendance && activeChild.recentAttendance.length > 0) ? (
                  activeChild.recentAttendance.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-white">{rec.date}</span>
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
                  ))
                ) : (
                  [
                    { date: 'الأحد 2026-09-06', status: 'present' },
                    { date: 'الخميس 2026-09-03', status: 'present' },
                    { date: 'الأربعاء 2026-09-02', status: 'present' },
                    { date: 'الثلاثاء 2026-09-01', status: 'excused' },
                  ].map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center justify-between"
                    >
                      <span className="font-bold text-white">{rec.date}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {rec.status === 'present' ? 'حاضر' : 'عذر مقبول'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: الإشعارات والتواصل (NOTICES & TEACHER CHAT)    */}
        {/* ---------------------------------------------------- */}
        {currentTab === 'notices' && (
          <div className="space-y-4 animate-in fade-in">
            
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-black text-slate-300">الإعلانات والتنبيهات المدرسية</h4>
              <span className="text-[10px] text-slate-500">محدث لحظياً</span>
            </div>

            {/* School Broadcast Message */}
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  إعلان رسمي من إدارة المدرسة 📢
                </span>
                <span className="text-[10px] text-slate-400">اليوم</span>
              </div>
              <h4 className="text-xs font-black text-white">
                جدول امتحانات الفترة الأولى والأنشطة المدرسية
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                نهيب بالسادة أولياء الأمور الكرام بأن امتحانات الفترة الأولى ستنطلق الأسبوع المقبل وفق الجداول المعلنة، ونتمنى لجميع أبنائنا الطلاب دوام التوفيق والنجاح.
              </p>
            </div>

            {/* Teacher Notes Feed */}
            <div className="space-y-2">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">أ. سالم التاورغي</span>
                    <span className="text-[10px] text-blue-300 font-bold">(معلم الرياضيات)</span>
                  </div>
                  <span className="text-[9px] text-slate-400">أمس</span>
                </div>
                <p className="text-xs text-slate-300">
                  الطالب متفوق جداً وأظهر مشاركة ممتازة في حل مسائل الهندسة اليوم. شكراً لمتابعتكم المستمرة.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">إدارة شؤون الطلاب</span>
                  </div>
                  <span className="text-[9px] text-slate-400">منذ 3 أيام</span>
                </div>
                <p className="text-xs text-slate-300">
                  تم اعتماد شهادة القيد والتسجيل للعام الدراسي 2025/2026 بنجاح.
                </p>
              </div>
            </div>

            {/* WhatsApp Connect Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 text-center space-y-2">
              <h5 className="text-xs font-black text-white">هل لديك أي ملاحظة أو استفسار؟</h5>
              <p className="text-[11px] text-slate-300">
                يمكنك التواصل المباشر مع مكتب مدير المدرسة والأخصائي الاجتماعي:
              </p>
              <a
                href={directorWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>محادثة الإدارة عبر واتساب</span>
              </a>
            </div>

          </div>
        )}

      </main>

      {/* 3. NATIVE MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="sticky bottom-0 z-30 bg-slate-900/98 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => { sound.playTap(); setCurrentTab('home'); }}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition ${
            currentTab === 'home' ? 'text-blue-400 bg-blue-500/15 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">الرئيسية</span>
        </button>

        <button
          type="button"
          onClick={() => { sound.playTap(); setCurrentTab('grades'); }}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition ${
            currentTab === 'grades' ? 'text-amber-300 bg-amber-500/15 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px]">الدرجات</span>
        </button>

        <button
          type="button"
          onClick={() => { sound.playTap(); setCurrentTab('attendance'); }}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition ${
            currentTab === 'attendance' ? 'text-emerald-400 bg-emerald-500/15 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span className="text-[10px]">الحضور</span>
        </button>

        <button
          type="button"
          onClick={() => { sound.playTap(); setCurrentTab('notices'); }}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition ${
            currentTab === 'notices' ? 'text-purple-400 bg-purple-500/15 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px]">التنبيهات</span>
        </button>
      </nav>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: SUBMIT EXCUSE MODAL                        */}
      {/* ---------------------------------------------------- */}
      {showExcuseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-800 border border-white/10 rounded-3xl p-5 text-right space-y-4 shadow-2xl">
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
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">سبب الغياب:</label>
                <select
                  value={excuseReason}
                  onChange={e => setExcuseReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                >
                  <option value="ظرف صحي طارئ (مرفق التقرير الطبي)">ظرف صحي طارئ (مرفق التقرير الطبي)</option>
                  <option value="مراجعة مستشفى أو عيادة تخصصية">مراجعة مستشفى أو عيادة تخصصية</option>
                  <option value="سفر عائلي اضطراري">سفر عائلي اضطراري</option>
                  <option value="ظرف اجتماعي قاهر">ظرف اجتماعي قاهر</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-dashed border-white/20 text-center cursor-pointer hover:bg-white/10 transition">
                <p className="text-[11px] text-blue-300 font-bold">📎 إرفاق صورة العذر أو الإجازة الطبية (اختياري)</p>
                <span className="text-[9px] text-slate-400">يدعم JPG, PNG, PDF</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingExcuse}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingExcuse ? 'جاري الإرسال...' : 'إرسال العذر للإدارة ✅'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExcuseModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: LINK NEW SIBLING MODAL                      */}
      {/* ---------------------------------------------------- */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-800 border border-white/10 rounded-3xl p-5 text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-black text-white">ربط ابن جديد في المدرسة</h3>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLinkChild} className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                أدخل رمز الربط الخاص بالطالب (المكون من 4 أرقام مثل <strong>1001</strong>) أو الرقم الوطني الليبي:
              </p>

              <div>
                <input
                  type="text"
                  placeholder="مثال: 1001 أو SCH-2026-R1"
                  value={linkCodeInput}
                  onChange={e => setLinkCodeInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-mono text-center tracking-wider"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow transition active:scale-95"
                >
                  تأكيد الربط ومتابعة الابن
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: PRINTABLE OFFICIAL GRADE CARD               */}
      {/* ---------------------------------------------------- */}
      {showPrintModal && activeChild && (
        <PrintableStudentGradeCard
          isOpen={showPrintModal}
          student={activeChild}
          onClose={() => setShowPrintModal(false)}
        />
      )}

    </div>
  );

  // If on desktop and user wants phone mockup preview frame
  if (isPhoneFrame && !embeddedInFrame) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 font-cairo text-right">
        
        {/* Top Control Bar for Principal / Demo Viewer */}
        <div className="w-full max-w-md mb-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white font-bold">معاينة تطبيق ولي الأمر كما يظهر على الهاتف المحمول</span>
          </div>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px]"
          >
            عرض ملء الشاشة ↗
          </button>
        </div>

        {/* Realistic iPhone / Android Mockup Frame */}
        <div className="relative w-full max-w-[390px] h-[780px] bg-black rounded-[48px] p-3 ring-12 ring-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-4 border-slate-700 overflow-hidden flex flex-col">
          {/* Top Notch / Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black rounded-full z-40 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          </div>

          {/* Phone Screen Container */}
          <div className="w-full h-full rounded-[38px] overflow-hidden flex flex-col">
            {appContent}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1 bg-white/40 rounded-full pointer-events-none" />
        </div>

        {/* Share Link with Parents Helper */}
        <div className="w-full max-w-md mt-4 text-center">
          <p className="text-[11px] text-slate-400">
            يمكن لأي ولي أمر فتح الرابط المباشر على هاتفه الذكي وحفظ التطبيق على الشاشة الرئيسية فوراً.
          </p>
        </div>

      </div>
    );
  }

  // Pure Mobile Fullscreen App view
  return appContent;
};
