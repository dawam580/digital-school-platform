import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';
import {
  Phone,
  Lock,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  User,
  GraduationCap,
  Shield,
  Key,
  Building2,
  CheckCircle2,
  Share2,
  ExternalLink,
  HelpCircle,
  Layers,
  Award,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { sound } from '../../utils/soundEffects';
import { DirectorInviteModal } from '../../components/common/DirectorInviteModal';
import { DEV_MODE } from '../../config/devMode';
import { AuthEngine, LIBYAN_PHONE_RE } from '../../services/security/authEngine';

export const Login: React.FC = () => {
  const {
    login,
    loginWithTeacherCode,
    unlockSuperAdmin,
    enterSuperAdmin,
    isAuthenticated,
    setActiveTab,
    setCurrentRole,
    students,
    setSelectedStudent,
    setParentLinkedStudent,
    teachers,
    currentUserPhone,
    schoolProfile,
    setShowSchoolManagerModal,
    setShowFreeTrialModal
  } = useSchool();

  const [loginMode, setLoginMode] = useState<'admin' | 'exams_coordinator' | 'superadmin' | 'teacher' | 'parent'>('admin');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // بوابة السوبر مخفية عن العامة: تظهر فقط برابط المالك (?role=superadmin) أو وضع التطوير.
  // الحماية الحقيقية تبقى رمز الماستر — الإخفاء مجرد تقليل لسطح الهجوم.
  const [showSuperPortal] = useState<boolean>(() => {
    if (DEV_MODE) return true;
    try {
      if (typeof window !== 'undefined') {
        return new URLSearchParams(window.location.search).get('role') === 'superadmin';
      }
    } catch {}
    return false;
  });

  // Check URL query parameters on load to auto-select tab
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const qRole = params.get('role');
        if (qRole === 'superadmin') setLoginMode('superadmin');
        else if (qRole === 'exams_coordinator') setLoginMode('exams_coordinator');
        else if (qRole === 'teacher') setLoginMode('teacher');
        else if (qRole === 'parent') setLoginMode('parent');
        else if (qRole === 'admin') setLoginMode('admin');
      }
    } catch {}
  }, []);

  // Parent Form (Libyan 12-digit National Number or link code)
  const [studentNationalId, setStudentNationalId] = useState('120195864392');
  const [parentPassword, setParentPassword] = useState('123456');
  const [showParentPass, setShowParentPass] = useState(false);

  // Teacher Form (Libyan Unique Teacher Code)
  const [teacherCode, setTeacherCode] = useState('LIB-COMP-09');
  const [teacherPassword, setTeacherPassword] = useState('123456');
  const [showTeacherPass, setShowTeacherPass] = useState(false);

  // Admin Form (Libyan Management Phone)
  const [adminPhone, setAdminPhone] = useState(currentUserPhone || '0922465676');
  const [adminPassword, setAdminPassword] = useState('2026');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Exams Coordinator Form
  const [examsPhone, setExamsPhone] = useState('0912345678');
  const [examsPassword, setExamsPassword] = useState('2026');
  const [showExamsPass, setShowExamsPass] = useState(false);

  // Super Admin Form
  const [superAdminCode, setSuperAdminCode] = useState('DISTRICT-SUPER-01');
  const [superMasterPin, setSuperMasterPin] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 1-Click Instant Demo Logins (الموثقة بالبيانات الرسمية والمحمية بسجل التدقيق)
  const handleQuickDirectorDemo = () => {
    sound.playSuccess();
    setAdminPhone('0922465676');
    setAdminPassword('2026');
    login('0922465676', 'admin', '2026');
  };

  const handleQuickExamCoordinatorDemo = () => {
    sound.playSuccess();
    setExamsPhone('0912345678');
    setExamsPassword('2026');
    login('0912345678', 'exams_coordinator', '2026');
  };

  const handleQuickSuperAdminDemo = () => {
    sound.playTap();
    setLoginMode('superadmin');
    setErrorMessage('');
  };

  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      if (!superAdminCode.trim()) {
        setErrorMessage('يرجى إدخال رمز تفويض المدير العام.');
        setLoading(false);
        return;
      }
      const verify = AuthEngine.verifyCredentials({
        role: 'superadmin',
        identifier: superAdminCode.trim(),
        password: superMasterPin.trim()
      });
      if (!verify.success) {
        setErrorMessage(verify.error || 'رمز تفويض المدير العام أو رمز الماستر غير صحيح.');
        setLoading(false);
        return;
      }
      if (!unlockSuperAdmin(superMasterPin.trim())) {
        setErrorMessage('رمز الماستر غير صحيح — تم تسجيل المحاولة في سجل التدقيق.');
        setLoading(false);
        return;
      }
      enterSuperAdmin();
      setLoading(false);
    }, 250);
  };

  const handleQuickTeacherDemo = () => {
    sound.playSuccess();
    setTeacherCode('LIB-COMP-09');
    setTeacherPassword('123456');
    loginWithTeacherCode('LIB-COMP-09', '123456');
  };

  const handleQuickParentDemo = () => {
    sound.playSuccess();
    const firstStudent = students[0];
    const idToUse = firstStudent ? (firstStudent.nationalNumber || firstStudent.nationalId || firstStudent.studentNumber) : '120195864392';
    if (firstStudent) {
      setSelectedStudent(firstStudent);
      setParentLinkedStudent(firstStudent);
    }
    setStudentNationalId(idToUse);
    setParentPassword('123456');
    login(idToUse, 'parent', '123456');
  };

  const handleParentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const cleanInput = studentNationalId.trim();
      const res = login(cleanInput, 'parent', parentPassword.trim());
      if (!res.success) {
        setErrorMessage(res.error || 'الرقم الوطني أو رمز الربط أو كلمة المرور غير صحيحة.');
        setLoading(false);
        return;
      }

      const foundStudent = students.find(
        s => (s.nationalNumber && s.nationalNumber === cleanInput) ||
             s.nationalId === cleanInput ||
             s.studentNumber === cleanInput ||
             (s.linkCode && s.linkCode.toLowerCase() === cleanInput.toLowerCase())
      );
      if (foundStudent) {
        setSelectedStudent(foundStudent);
        setParentLinkedStudent(foundStudent);
      }
      setLoading(false);
    }, 250);
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const success = loginWithTeacherCode(teacherCode.trim(), teacherPassword.trim());
      if (!success) {
        const check = AuthEngine.verifyCredentials({
          role: 'teacher',
          identifier: teacherCode.trim(),
          password: teacherPassword.trim()
        });
        setErrorMessage(check.error || 'رمز المعلم أو كلمة المرور غير صحيحة.');
      }
      setLoading(false);
    }, 250);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const res = login(adminPhone.trim(), 'admin', adminPassword.trim());
      if (!res.success) {
        setErrorMessage(res.error || 'فشلت المصادقة. يرجى التحقق من رقم هاتف المدير المعتمد ورمز الأمان.');
      }
      setLoading(false);
    }, 250);
  };

  const handleExamsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const res = login(examsPhone.trim(), 'exams_coordinator', examsPassword.trim());
      if (!res.success) {
        setErrorMessage(res.error || 'فشلت المصادقة. يرجى التحقق من رقم هاتف منسق الامتحانات وكلمة المرور.');
      }
      setLoading(false);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center p-4 sm:p-6 text-right font-cairo transition-colors">
      
      {/* Background Ambience Glow — خافت وهادئ */}
      <div className="absolute top-10 right-1/2 translate-x-1/2 w-96 h-96 bg-indigo-400/[0.07] dark:bg-indigo-500/[0.08] rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-lg space-y-6">
        
        {/* Top Centered Logo & Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-3xl bg-white dark:bg-slate-800 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.25)] border border-slate-200/80 dark:border-slate-700">
            <img src={logoImg} alt="شعار منصة المدرسة" className="h-16 w-auto object-contain mx-auto" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 mb-1.5">
              <span>🇱🇾 دولة ليبيا • وزارة التربية والتعليم</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {schoolProfile.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {schoolProfile.district} • العام الدراسي {schoolProfile.academicYear}
            </p>
          </div>

          {/* Quick Hub Tools: Director Invite Message + Register School */}
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            <button
              type="button"
              onClick={() => { setActiveTab('parent-mobile'); sound.playTap(); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
              <span>📱 تطبيق ولي الأمر (الهاتف)</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('landing'); sound.playTap(); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>استعراض المنظومة والأسعار 🌟</span>
            </button>

            <button
              type="button"
              onClick={() => { setShowInviteModal(true); sound.playTap(); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition active:scale-95"
            >
              <span>✉️ رسالة دعوة المدير والروابط 🔗</span>
            </button>

            {/* إدارة المدارس: للجلسات المصادقة فقط — الغرباء عبر التجربة المجانية */}
            {isAuthenticated && (
            <button
              type="button"
              onClick={() => { setShowSchoolManagerModal(true); sound.playTap(); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black border border-slate-200 dark:border-slate-700 shadow-sm transition active:scale-95"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>إضافة أو تبديل مدرسة 🏫</span>
            </button>
            )}
          </div>
        </div>

        {/* 21st.dev Aesthetic Free Trial 7-Days Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-5 sm:p-6 text-white shadow-xl border border-purple-500/30">
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>تجربة مجانية 7 أيام • مرحباً بك</span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                جرّب مدرسة تجريبية كاملة — بدون التزام
              </h3>
              <p className="text-xs text-purple-200/90 leading-relaxed max-w-md">
                مدرسة متكاملة مع طلاب وفصول وبيانات غنية. وصول فوري لأقسام الامتحانات، التواصل، المنظومة المالية، والتصحيح الإلكتروني.
              </p>
            </div>

            <button
              type="button"
              onClick={() => { setShowFreeTrialModal(true); sound.playSuccess(); }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2 shrink-0 animate-pulse"
            >
              <span>أنشئ حسابك التجريبي (7 أيام) 🚀</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4-5 Isolated Portal Selector Tabs (السوبر مخفي عن العامة) */}
        <div className={`grid grid-cols-2 ${showSuperPortal ? 'sm:grid-cols-5' : 'sm:grid-cols-4'} gap-1.5 p-1.5 bg-white dark:bg-slate-800/90 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700`}>
          <button
            type="button"
            onClick={() => { setLoginMode('admin'); setErrorMessage(''); sound.playTap(); }}
            className={`py-2.5 px-2 text-xs font-black rounded-2xl transition-all flex flex-col items-center justify-center gap-1 ${
              loginMode === 'admin'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>مدير المدرسة</span>
          </button>

          <button
            type="button"
            onClick={() => { setLoginMode('exams_coordinator'); setErrorMessage(''); sound.playTap(); }}
            className={`py-2.5 px-2 text-xs font-black rounded-2xl transition-all flex flex-col items-center justify-center gap-1 ${
              loginMode === 'exams_coordinator'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>منسق الامتحانات</span>
          </button>

          {showSuperPortal && (
          <button
            type="button"
            onClick={() => { setLoginMode('superadmin'); setErrorMessage(''); sound.playTap(); }}
            className={`py-2.5 px-2 text-xs font-black rounded-2xl transition-all flex flex-col items-center justify-center gap-1 ${
              loginMode === 'superadmin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>المدير العام (سوبر)</span>
          </button>
          )}

          <button
            type="button"
            onClick={() => { setLoginMode('teacher'); setErrorMessage(''); sound.playTap(); }}
            className={`py-2.5 px-2 text-xs font-black rounded-2xl transition-all flex flex-col items-center justify-center gap-1 ${
              loginMode === 'teacher'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>المعلمون</span>
          </button>

          <button
            type="button"
            onClick={() => { setLoginMode('parent'); setErrorMessage(''); sound.playTap(); }}
            className={`py-2.5 px-2 text-xs font-black rounded-2xl transition-all flex flex-col items-center justify-center gap-1 ${
              loginMode === 'parent'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>أولياء الأمور</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6 transition-colors">
          
          {/* Portal 1: School Director (Default) */}
          {loginMode === 'admin' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="inline-flex p-2.5 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 rounded-2xl mb-1.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <h2 className="text-base font-black text-slate-800 dark:text-white">بوابة مدير المدرسة (لوحة التحكم الكاملة)</h2>
                <p className="text-xs text-slate-400 mt-0.5">إدارة الطلاب، المعلمين، الفصول، الحضور، واعتماد الكنترول والنتائج</p>
              </div>

              {/* Instant 1-Click Demo Button for Testing Directors — DEV_MODE فقط، محذوف من الإنتاج */}
              {DEV_MODE && (
              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black text-purple-900 dark:text-purple-200 block">
                    ⚡ مخصص للمدراء للاختبار السريع:
                  </span>
                  <span className="text-[11px] text-purple-700/80 dark:text-purple-300/80">
                    دخول تجريبي فوري بنقرة واحدة بدون كتابة بيانات
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDirectorDemo}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 shrink-0"
                >
                  دخول فوري كمدير ⚡
                </button>
              </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    رقم هاتف المدير المعتمد:
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="09xxxxxxxx"
                      value={adminPhone}
                      onChange={e => setAdminPhone(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400">💡 هاتف الإدارة المعتمد: <span className="font-mono font-bold text-purple-600">0922465676</span></p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      كلمة المرور أو رمز أمان المدير (PIN):
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAdminPass(!showAdminPass)}
                      className="text-xs text-slate-400 hover:text-purple-600 flex items-center gap-1"
                    >
                      {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showAdminPass ? 'إخفاء' : 'إظهار'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      placeholder="••••••"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400">🛡️ رمز الأمان الافتراضي: <span className="font-mono font-bold text-purple-600">2026</span> (يمكن تغييره من الإعدادات)</p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {loading ? 'جاري التحقق...' : 'دخول لوحة تحكم المدير 🏛️'}
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Portal: Exams & Control Coordinator */}
          {loginMode === 'exams_coordinator' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="inline-flex p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-2xl mb-1.5">
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="text-base font-black text-slate-800 dark:text-white">بوابة منسق الامتحانات والتقويم (رئيس الكنترول)</h2>
                <p className="text-xs text-slate-400 mt-0.5">شيت الكنترول المركزي (1120 درجة)، رصد أعمال السنة، وأرقام الجلوس والشهادات</p>
              </div>

              {/* Instant 1-Click Demo Button — DEV_MODE فقط، محذوف من الإنتاج */}
              {DEV_MODE && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black text-amber-900 dark:text-amber-200 block">
                    ⚡ دخول فوري لمنسق الامتحانات:
                  </span>
                  <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                    رصد درجات الفترات والامتحانات واعتماد النتيجة A4
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickExamCoordinatorDemo}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 shrink-0"
                >
                  دخول الكنترول 📜
                </button>
              </div>
              )}

              <form onSubmit={handleExamsLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    رقم هاتف منسق الامتحانات (رئيس الكنترول):
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={examsPhone}
                      onChange={e => setExamsPhone(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400">💡 هاتف رئيس الكنترول المعتمد: <span className="font-mono font-bold text-amber-600">0912345678</span></p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      كلمة مرور منسق الامتحانات:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowExamsPass(!showExamsPass)}
                      className="text-xs text-slate-400 hover:text-amber-600 flex items-center gap-1"
                    >
                      {showExamsPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showExamsPass ? 'إخفاء' : 'إظهار'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showExamsPass ? 'text' : 'password'}
                      placeholder="••••••"
                      value={examsPassword}
                      onChange={e => setExamsPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400">🛡️ كلمة المرور الافتراضية: <span className="font-mono font-bold text-amber-600">2026</span></p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {loading ? 'جاري التحقق...' : 'دخول بوابة منسق الامتحانات والكنترول 📜'}
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Portal 2: Super Admin — مخفي عن العامة (رابط المالك فقط) */}
          {loginMode === 'superadmin' && showSuperPortal && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="inline-flex p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-2xl mb-1.5">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="text-base font-black text-slate-800 dark:text-white">بوابة المدير العام والسوبر أدمن لكافة المدارس</h2>
                <p className="text-xs text-slate-400 mt-0.5">لوحة مراقبة التعليم لإدارة ديوان المدارس، إضافة مدارس جديدة، والإشراف العام</p>
              </div>

              {/* Instant 1-Click Demo Button — DEV_MODE فقط، محذوف من الإنتاج */}
              {DEV_MODE && (
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black text-blue-900 dark:text-blue-200 block">
                    ⚡ دخول فوري للمدير العام:
                  </span>
                  <span className="text-[11px] text-blue-700/80 dark:text-blue-300/80">
                    الاطلاع على كافة المدارس المسجلة وإضافة مدرسة
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickSuperAdminDemo}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 shrink-0"
                >
                  دخول السوبر أدمن 🌐
                </button>
              </div>
              )}

              <form onSubmit={handleSuperAdminLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    رمز تفويض المدير العام (Super Admin Access Token):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={superAdminCode}
                      onChange={e => setSuperAdminCode(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono uppercase font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400">💡 يتيح للمراقب إضافة وتعيين مدراء المدارس ومتابعة الإحصائيات المركزية</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    🔒 رمز الماستر للمدير العام (4 أرقام):
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="••••"
                      value={superMasterPin}
                      onChange={e => setSuperMasterPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono font-bold tracking-[0.5em] text-center rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400">🛡️ بعد 3 محاولات خاطئة تُجمَّد البوابة 45 ثانية وتُسجَّل المحاولة.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {loading ? 'جاري التحقق...' : 'دخول ديوان مراقبة المدارس 🌐'}
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Portal 3: Teacher Portal */}
          {loginMode === 'teacher' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="inline-flex p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-2xl mb-1.5">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="text-base font-black text-slate-800 dark:text-white">بوابة المعلمين والكوادر التربوية</h2>
                <p className="text-xs text-slate-400 mt-0.5">الدخول بالرمز الخاص لرصد أعمال السنة، جداول الحصص، واعتماد الامتحانات</p>
              </div>

              {/* Instant 1-Click Demo Button — DEV_MODE فقط، محذوف من الإنتاج */}
              {DEV_MODE && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 block">
                    ⚡ تجربة سريعة كمعلم:
                  </span>
                  <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                    دخول مباشر برمز أ. طارق الفيتوري (رياضيات)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickTeacherDemo}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 shrink-0"
                >
                  دخول فوري كمعلم ⚡
                </button>
              </div>
              )}

              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    رمز المعلم الفريد:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="رمز المعلم الخاص (مثال: LIB-XXX-00)"
                      value={teacherCode}
                      onChange={e => setTeacherCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono uppercase font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  
                  {/* Quick teacher demo pills — DEV_MODE فقط (رموز حقيقية لا تُعرض في الإنتاج) */}
                  {DEV_MODE && (
                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] text-slate-400 font-bold">💡 رموز المعلمين للتجربة:</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {teachers.slice(0, 5).map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => { setTeacherCode(t.code); sound.playTap(); }}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                        >
                          {t.code} ({t.subject.split(' ')[0]})
                        </button>
                      ))}
                    </div>
                  </div>
                  )}
                  <p className="text-[11px] text-slate-400">💡 رمز تجريبي معتمد: <span className="font-mono font-bold text-emerald-600">LIB-COMP-09</span> (أو <span className="font-mono font-bold text-emerald-600">LIB-MATH-01</span>)</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      كلمة مرور المعلم:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTeacherPass(!showTeacherPass)}
                      className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1"
                    >
                      {showTeacherPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showTeacherPass ? 'إخفاء' : 'إظهار'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showTeacherPass ? 'text' : 'password'}
                      placeholder="••••••"
                      value={teacherPassword}
                      onChange={e => setTeacherPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400">🛡️ كلمة المرور الافتراضية: <span className="font-mono font-bold text-emerald-600">123456</span></p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {loading ? 'جاري التحقق...' : 'دخول بوابة المعلم 👨‍🏫'}
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Portal 4: Parent Portal */}
          {loginMode === 'parent' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="inline-flex p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-2xl mb-1.5">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-base font-black text-slate-800 dark:text-white">بوابة أولياء الأمور (معزولة وآمنة)</h2>
                <p className="text-xs text-slate-400 mt-0.5">متابعة الأبناء فقط: الحضور، الدرجات، الإخطارات الفصلية، والتواصل مع المعلم</p>
              </div>

              {/* Instant 1-Click Demo Button — DEV_MODE فقط، محذوف من الإنتاج */}
              {DEV_MODE && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black text-amber-900 dark:text-amber-200 block">
                    ⚡ تجربة سريعة كولي أمر:
                  </span>
                  <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                    دخول مباشر لملف الطالب النموذجي
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickParentDemo}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 shrink-0"
                >
                  دخول فوري كولي أمر 👨‍👩‍👧
                </button>
              </div>
              )}

              <form onSubmit={handleParentLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    رمز ولي الأمر (4 أرقام) أو الرقم الوطني للطالب:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="الرقم الوطني للطالب (12 رقماً) أو كود الربط"
                      value={studentNationalId}
                      onChange={e => setStudentNationalId(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>

                  <p className="text-[11px] text-slate-400">💡 الرقم الوطني لطالب معتمد: <span className="font-mono font-bold text-amber-600">120195864392</span> (أو الكود: <span className="font-mono font-bold text-amber-600">SCH-2026-B1</span>)</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      كلمة مرور ولي الأمر:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowParentPass(!showParentPass)}
                      className="text-xs text-slate-400 hover:text-amber-600 flex items-center gap-1"
                    >
                      {showParentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showParentPass ? 'إخفاء' : 'إظهار'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showParentPass ? 'text' : 'password'}
                      placeholder="••••••"
                      value={parentPassword}
                      onChange={e => setParentPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400">🛡️ كلمة المرور الافتراضية: <span className="font-mono font-bold text-amber-600">123456</span></p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-amber-700 hover:bg-amber-800 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {loading ? 'جاري التحقق...' : 'دخول بوابة ولي الأمر 👨‍👩‍👧'}
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Security & Isolation Trust Footer */}
        <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام معزول أمنياً 100% وفق معايير وزارة التربية والتعليم الليبية</span>
          </div>
          <p className="text-[10px] text-slate-400">
            روابط مستقلة تضمن عدم وصول ولي الأمر أو الطالب لأي سجلات إدارية أو درجات تلاميذ آخرين
          </p>
        </div>

      </div>

      {/* Director Invite Modal */}
      <DirectorInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

    </div>
  );
};
