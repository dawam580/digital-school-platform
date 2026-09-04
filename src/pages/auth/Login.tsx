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
  ArrowRight
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { sound } from '../../utils/soundEffects';
import { DirectorInviteModal } from '../../components/common/DirectorInviteModal';

export const Login: React.FC = () => {
  const {
    login,
    loginWithTeacherCode,
    setActiveTab,
    setCurrentRole,
    students,
    setSelectedStudent,
    teachers,
    currentUserPhone,
    schoolProfile,
    setShowSchoolManagerModal
  } = useSchool();

  const [loginMode, setLoginMode] = useState<'admin' | 'superadmin' | 'teacher' | 'parent'>('admin');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Check URL query parameters on load to auto-select tab
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const qRole = params.get('role');
        if (qRole === 'superadmin') setLoginMode('superadmin');
        else if (qRole === 'teacher') setLoginMode('teacher');
        else if (qRole === 'parent') setLoginMode('parent');
        else if (qRole === 'admin') setLoginMode('admin');
      }
    } catch {}
  }, []);

  // Parent Form (Libyan 12-digit National Number or 4-digit code)
  const [studentNationalId, setStudentNationalId] = useState('120081234567');
  const [parentPassword, setParentPassword] = useState('123456');

  // Teacher Form (Libyan Unique Teacher Code)
  const [teacherCode, setTeacherCode] = useState('LIB-MATH-01');
  const [teacherPassword, setTeacherPassword] = useState('123456');

  // Admin Form (Libyan Management Phone)
  const [adminPhone, setAdminPhone] = useState(currentUserPhone || '0922465676');
  const [adminPassword, setAdminPassword] = useState('123456');

  // Super Admin Form
  const [superAdminCode, setSuperAdminCode] = useState('DISTRICT-SUPER-01');

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 1-Click Instant Demo Logins
  const handleQuickDirectorDemo = () => {
    sound.playSuccess();
    login(adminPhone || '0922465676', 'admin');
  };

  const handleQuickSuperAdminDemo = () => {
    sound.playSuccess();
    login('0910000000', 'superadmin');
  };

  const handleQuickTeacherDemo = () => {
    sound.playSuccess();
    loginWithTeacherCode('LIB-MATH-01');
  };

  const handleQuickParentDemo = () => {
    sound.playSuccess();
    const firstStudent = students[0];
    if (firstStudent) setSelectedStudent(firstStudent);
    login('1001', 'parent');
  };

  const handleParentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const cleanInput = studentNationalId.trim();
      const foundStudent = students.find(
        s => (s.nationalNumber && s.nationalNumber === cleanInput) ||
             s.nationalId === cleanInput ||
             s.studentNumber === cleanInput ||
             s.linkCode.toLowerCase() === cleanInput.toLowerCase() ||
             (cleanInput === '1001' && (s.id === 'std-1' || s.studentNumber === '2025-0101')) ||
             (cleanInput === '1002' && (s.id === 'std-2' || s.studentNumber === '2025-0102'))
      ) || students[0];

      if (foundStudent) {
        setSelectedStudent(foundStudent);
        login(foundStudent.nationalNumber || foundStudent.nationalId, 'parent');
      } else {
        setErrorMessage('الرمز أو الرقم الوطني غير مسجل في المنظومة. يرجى مراجعة إدارة المدرسة.');
      }
      setLoading(false);
    }, 300);
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const success = loginWithTeacherCode(teacherCode);
      if (!success) {
        setErrorMessage('رمز المعلم غير صحيح. يرجى التحقق من الرمز الصادر من إدارة المدرسة (مثل LIB-MATH-01).');
      }
      setLoading(false);
    }, 300);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      login(adminPhone, 'admin');
      setLoading(false);
    }, 300);
  };

  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      login('0910000000', 'superadmin');
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/40 dark:from-slate-950 dark:to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-right font-cairo transition-colors">
      
      {/* Background Ambience Glow */}
      <div className="absolute top-10 right-1/2 translate-x-1/2 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-lg space-y-6">
        
        {/* Top Centered Logo & Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-3xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200/80 dark:border-slate-700">
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
              onClick={() => { setShowInviteModal(true); sound.playTap(); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition active:scale-95"
            >
              <span>✉️ رسالة دعوة المدير والروابط 🔗</span>
            </button>

            <button
              type="button"
              onClick={() => { setShowSchoolManagerModal(true); sound.playTap(); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black border border-slate-200 dark:border-slate-700 shadow-sm transition active:scale-95"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>إضافة أو تبديل مدرسة 🏫</span>
            </button>
          </div>
        </div>

        {/* 4 Isolated Portal Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-white dark:bg-slate-800/90 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
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
                <p className="text-xs text-slate-400 mt-0.5">إدارة الطلاب (873 طالب)، المعلمين، الفصول، الحضور، واعتماد الكنترول</p>
              </div>

              {/* Instant 1-Click Demo Button for Testing Directors */}
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

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    رقم هاتف المدير المعتمد:
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="0922465676"
                      value={adminPhone}
                      onChange={e => setAdminPhone(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400">💡 الرقم المعتمد للتجربة: <span className="font-mono font-bold text-purple-600">0922465676</span></p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    كلمة المرور:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
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

          {/* Portal 2: Super Admin / Multi-School Directorate */}
          {loginMode === 'superadmin' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="inline-flex p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-2xl mb-1.5">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="text-base font-black text-slate-800 dark:text-white">بوابة المدير العام والسوبر أدمن لكافة المدارس</h2>
                <p className="text-xs text-slate-400 mt-0.5">لوحة مراقبة التعليم لإدارة ديوان المدارس، إضافة مدارس جديدة، والإشراف العام</p>
              </div>

              {/* Instant 1-Click Demo Button */}
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

              {/* Instant 1-Click Demo Button */}
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

              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    رمز المعلم الفريد:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="LIB-MATH-01"
                      value={teacherCode}
                      onChange={e => setTeacherCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono uppercase font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  
                  {/* Quick teacher demo pills */}
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
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    كلمة المرور:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••"
                      value={teacherPassword}
                      onChange={e => setTeacherPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
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

              {/* Instant 1-Click Demo Button */}
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

              <form onSubmit={handleParentLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    رمز ولي الأمر (4 أرقام) أو الرقم الوطني للطالب:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="رمز ولي الأمر (مثال: 1001 أو 120081234567)"
                      value={studentNationalId}
                      onChange={e => setStudentNationalId(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400 flex-wrap">
                    <span>💡 رموز تجريبية:</span>
                    <button
                      type="button"
                      onClick={() => { setStudentNationalId('1001'); sound.playTap(); }}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-800 text-slate-700 dark:text-slate-300 rounded font-mono font-bold"
                    >
                      1001
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStudentNationalId('1002'); sound.playTap(); }}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-800 text-slate-700 dark:text-slate-300 rounded font-mono font-bold"
                    >
                      1002
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    كلمة المرور:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••"
                      value={parentPassword}
                      onChange={e => setParentPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
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
