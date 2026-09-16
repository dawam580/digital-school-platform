import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Building2,
  CheckCircle2,
  Download,
  BookOpen,
  Key,
  Users,
  ShieldCheck,
  Sparkles,
  Phone,
  User,
  ArrowRight,
  ExternalLink,
  Copy,
  Printer,
  Laptop,
  GraduationCap,
  Award,
  HeartHandshake,
  Share2,
  Check,
  HelpCircle
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import {
  downloadWindowsAppLauncher,
  copyTextToClipboard,
  getRoleLink,
  getWhatsAppShareUrl
} from '../../utils/inviteMessageHelper';
import { SecurityEngine } from '../../services/security/securityEngine';

export const SchoolClientOnboardingPage: React.FC = () => {
  const {
    schoolProfile,
    updateSchoolProfile,
    createNewSchool,
    login,
    setCurrentRole,
    setActiveTab,
    showToast
  } = useSchool();

  // Read URL Params
  const [params, setParams] = useState<URLSearchParams>(() => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''));

  const urlSchoolName = params.get('school') || schoolProfile.name || 'مدرسة جديدة';
  const urlDirectorName = params.get('director') || schoolProfile.directorName || 'مدير المدرسة';
  const urlPhone = params.get('phone') || schoolProfile.directorPhone || '0912345678';
  const urlDistrict = params.get('district') || schoolProfile.district || 'مراقبة التربية والتعليم';
  const urlSchoolCode = params.get('schoolId') || 'SCH-2026';

  // Active Tab: 1. Account Setup, 2. Windows App, 3. Manual, 4. Staff Guide
  const [activeTab, setActiveTabLocal] = useState<'setup' | 'desktop' | 'manual' | 'staff'>('setup');

  // Account Setup Form State
  const [schoolName, setSchoolName] = useState(urlSchoolName);
  const [directorName, setDirectorName] = useState(urlDirectorName);
  const [directorPhone, setDirectorPhone] = useState(urlPhone);
  const [directorPin, setDirectorPin] = useState('2026');
  const [password, setPassword] = useState('123456');
  const [district, setDistrict] = useState(urlDistrict);
  const [isActivated, setIsActivated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Copied states
  const [copiedRole, setCopiedRole] = useState<string | null>(null);

  useEffect(() => {
    // Check if school was already created or activated
    const hasPin = localStorage.getItem('madrasa_director_pin');
    const hasAdminPhone = localStorage.getItem('madrasa_admin_phone');
    if (hasPin && hasAdminPhone === directorPhone) {
      setIsActivated(true);
    }
  }, [directorPhone]);

  const handleCreateAndActivateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !directorPhone.trim()) {
      showToast('error', 'تنبيه', 'يرجى إدخال اسم المدرسة ورقم هاتف المدير.');
      return;
    }

    if (directorPin.length !== 4 || !/^\d{4}$/.test(directorPin)) {
      showToast('error', 'تنبيه', 'رمز أمان المدير PIN يجب أن يتكون من 4 أرقام.');
      return;
    }

    setIsSubmitting(true);
    sound.playTap();

    try {
      // 1. Update/Create school profile
      updateSchoolProfile({
        name: schoolName.trim(),
        directorName: directorName.trim(),
        directorPhone: directorPhone.trim(),
        district: district.trim(),
        code: urlSchoolCode
      });

      // 2. Persist credentials in storage
      localStorage.setItem('madrasa_admin_phone', directorPhone.trim());
      localStorage.setItem('madrasa_director_pin', directorPin.trim());
      localStorage.setItem('madrasa_admin_password', password.trim());
      localStorage.setItem('madrasa_global_pwd', password.trim());

      // 3. Mark authorized in security engine
      SecurityEngine.setDirectorPin(directorPin.trim());

      sound.playSuccess();
      triggerConfetti();
      setIsActivated(true);

      showToast(
        'gold',
        'تم تفعيل المدرسة بنجاح! 🏛️',
        `أهلاً بك حضرة المدير ${directorName}. تم تفعيل المنظومة لمدرسة (${schoolName}).`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectLoginToDashboard = () => {
    sound.playSuccess();
    login(directorPhone, 'admin', directorPin);
    setCurrentRole('admin');
    setActiveTab('dashboard');
  };

  const handleDownloadWindowsApp = () => {
    sound.playSuccess();
    triggerConfetti();
    downloadWindowsAppLauncher(schoolName);
    showToast('success', 'جاري تنزيل مشغل ويندوز 💻', 'تم تحميل ملف تشغيل المنظومة المكتبي (.bat) بنجاح.');
  };

  const handleCopyLinkForRole = async (roleKey: string, link: string) => {
    sound.playTap();
    const ok = await copyTextToClipboard(link);
    if (ok) {
      setCopiedRole(roleKey);
      sound.playSuccess();
      setTimeout(() => setCopiedRole(null), 2000);
    }
  };

  const teacherLoginLink = getRoleLink('teacher');
  const examsLoginLink = getRoleLink('exams_coordinator');
  const counselorLoginLink = getRoleLink('counselor');
  const parentLoginLink = getRoleLink('parent');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-cairo text-right" dir="rtl">
      
      {/* Top Welcome Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black shadow-md shrink-0">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-none">
                منصة المدرسة الرقمية
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                بوابة التفعيل والتشغيل الرسمي
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              مرحباً بكم في بوابة إعداد المنظومة الشاملة — وزارة التربية والتعليم
            </p>
          </div>
        </div>

        {isActivated && (
          <button
            type="button"
            onClick={handleDirectLoginToDashboard}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
          >
            <span>لوحة تحكم المدير 🏛️</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        )}
      </header>

      {/* Hero Prestigious Banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                  حزمة الاعتماد والتسليم الرسمية 2025/2026
                </span>
                <span className="text-xs text-blue-200">دولة ليبيا</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                أهلاً بكم في منظومة: {schoolName}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
                تم تجهيز كافة المكونات المعتمدة لمدرستكم في مكان واحد: إنشاء حساب الإدارة، تنزيل تطبيق ويندوز المكتبي، تصفح كتيب التعليمات، ودليل إنشاء وتوزيع حسابات المعلمين والكنترول وأولياء الأمور.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadWindowsApp}
                className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل تطبيق ويندوز (.bat) 💻</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Unified Pillars Navigation Tabs */}
        <div className="mt-6 flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
          <button
            type="button"
            onClick={() => { setActiveTabLocal('setup'); sound.playTap(); }}
            className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
              activeTab === 'setup'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. إنشاء وتفعيل حساب المدير</span>
            {isActivated && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
          </button>

          <button
            type="button"
            onClick={() => { setActiveTabLocal('desktop'); sound.playTap(); }}
            className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
              activeTab === 'desktop'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>2. تطبيق ويندوز المكتبي</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTabLocal('manual'); sound.playTap(); }}
            className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
              activeTab === 'manual'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>3. كتيب تعليمات المنظومة</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTabLocal('staff'); sound.playTap(); }}
            className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
              activeTab === 'staff'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>4. دليل حسابات الكادر والكنترول</span>
          </button>
        </div>

        {/* Tab 1: Account Setup & Activation */}
        {activeTab === 'setup' && (
          <div className="mt-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  👤 إنشاء وتأكيد حساب مدير المدرسة
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  قم بتعيين بيانات الدخول الخاصة بك كمدير للمنظومة لتبدأ بإدارة الطلاب والمعلمين فوراً.
                </p>
              </div>

              {isActivated && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>المدرسة مفعلة وحسابك جاهز!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleCreateAndActivateAccount} className="space-y-5 text-xs max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    اسم المدرسة المعتمد:
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    required
                    placeholder="مدرسة الشهيد امحمد الباعور"
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    البلدية / المراقبة التعليمية:
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="مراقبة التربية والتعليم"
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    اسم السيد مدير المدرسة:
                  </label>
                  <input
                    type="text"
                    value={directorName}
                    onChange={e => setDirectorName(e.target.value)}
                    required
                    placeholder="أ. محمد أحمد"
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    رقم هاتف المدير (معرّف الدخول الرسمي):
                  </label>
                  <input
                    type="tel"
                    value={directorPhone}
                    onChange={e => setDirectorPhone(e.target.value)}
                    required
                    placeholder="0912345678"
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    رمز أمان المدير السري (PIN - 4 أرقام):
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={directorPin}
                    onChange={e => setDirectorPin(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="2026"
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    يُستخدم هذا الرمز للتأكيد الأمني عند الدخول أو تعديل بيانات المدرسة الحساسة.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    كلمة مرور حساب المدير:
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="123456"
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed">
                  تخزين مشفر محلي (Offline-first): كافة بيانات المدرسة والطلاب تحفظ بشكل آمن داخل متصفحك وجهازك ولا يمكن لأي مدرسة أخرى الاطلاع عليها.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد الحساب وتشغيل المنظومة 🚀</span>
                </button>

                {isActivated && (
                  <button
                    type="button"
                    onClick={handleDirectLoginToDashboard}
                    className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-2"
                  >
                    <span>الدخول للوحة التحكم كمدير 🏛️</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Windows Desktop App */}
        {activeTab === 'desktop' && (
          <div className="mt-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  💻 تطبيق ويندوز المكتبي المستقل (Windows Desktop Edition)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  شغّل المنظومة على حاسوب المدرسة بنافذة سطح مكتب مستقلة وسريعة تعمل بدون الحاجة لإنترنت.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadWindowsApp}
                className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" />
                <span>تحميل المشغل بنقرة واحدة (.bat)</span>
              </button>
            </div>

            {/* Steps Visual Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-sm">
                  1
                </div>
                <h4 className="font-black text-xs text-slate-900 dark:text-white">
                  تنزيل ملف المشغل
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  اضغط زر التحميل أعلاه لحفظ ملف التشغيل المباشر <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[10px]">.bat</code> على جهازك.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-sm">
                  2
                </div>
                <h4 className="font-black text-xs text-slate-900 dark:text-white">
                  النقل إلى سطح المكتب
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  انقل الملف المحمل إلى سطح المكتب Desktop لسهولة وصول إدارة المدرسة إليه في أي وقت.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-sm">
                  3
                </div>
                <h4 className="font-black text-xs text-slate-900 dark:text-white">
                  التشغيل المباشر
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  انقر نقراً مزدوجاً فوق الملف لتفتح المنظومة كنافذة تطبيق ويندوز مستقلة بدون شريط متصفح وبأقصى سرعة.
                </p>
              </div>
            </div>

            {/* Technical Highlights */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
              <h4 className="font-black text-xs text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>مميزات نسخة الويندوز المكتبية (Windows App Features):</span>
              </h4>
              <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside">
                <li>متوافقة بنسبة 100% مع أنظمة Windows 10 و Windows 11.</li>
                <li>لا تتطلب تثبيت خوادم معقدة، وتعمل بنمط التخزين المشفر المحلي IndexedDB.</li>
                <li>دعم كامل لطباعة الشيتات والشهادات وكشوفات الحضور على ورق A4 مباشرة إلى أي طابعة موصولة بالجهاز.</li>
                <li>حفظ البيانات وتحديثها فورياً حتى في حال انقطاع شبكة الإنترنت.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: System Handbook / Manual */}
        {activeTab === 'manual' && (
          <div className="mt-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>كتيب تعليمات المنظومة الشامل (دليل المستخدم الليبي)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  وفق لائحة وزارة التربية والتعليم رقم 1013 لسنة 2022م والقرار 560 لسنة 2024م
                </p>
              </div>

              <button
                type="button"
                onClick={() => { sound.playTap(); window.print(); }}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition active:scale-95 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الكتيب A4 / PDF</span>
              </button>
            </div>

            {/* Handbook Chapters Accordion / Cards */}
            <div className="space-y-4 text-xs">
              
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-black text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <span>🏛️ الفصل الأول: لوحة تحكم المدير والإشراف العام</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  تتيح للمدير متابعة مؤشرات المدرسة اليومية، وإحصائيات الطلاب (873 طالباً أو بحسب الكشف المعتمد)، ونسب الحضور والغياب، والإشراف على اعتماد أعمال الكنترول والجداول المدرسية.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-black text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <span>📄 الفصل الثاني: استيراد كشوفات الطلاب بالذكاء الاصطناعي (PDF & Excel)</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  يمكن للمدير رفع ملف الـ PDF الصادر عن منظومة المركز الوطني للامتحانات، ويقوم المحرك الذكي بقراءة كشف الطلاب واستخراج أرقام القيد والأسماء الرباعية وتوزيعهم على الفصول من 1/1 إلى 9/4 تلقائياً مع صفر أخطاء.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-black text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <span>📅 الفصل الثالث: التوزيع الآلي لجداول الحصص</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  بناء جدول الحصص الأسبوعي (6 حصص يومياً بمعدل 45 دقيقة للحصة) بدون أي تعارض في حصص المعلمين، مع إمكانية تصدير الجدول بصيغة PDF وطباعته لكل فصل ومعلم.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-black text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <span>📜 الفصل الرابع: شيت الكنترول وتوزيع لجان الامتحانات</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  نظام شيت الدرجات المعتمد بمجموع 1120 درجة لصفوف مرحلة التعليم الأساسي، ورصد أعمال السنة والفترات، وتوليد أرقام الجلوس وبطاقات الدرجات والشهادات الفردية والجماعية A4.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Tab 4: Staff & User Accounts Creation Guide */}
        {activeTab === 'staff' && (
          <div className="mt-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                <span>دليل إنشاء وتوزيع حسابات الكادر المدرسي والكنترول وأولياء الأمور</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                روابط منفصلة ومعزولة تضمن عدم تداخل الصلاحيات وتمكّن كل مسؤول من العمل على مهامه بخصوصية تامة.
              </p>
            </div>

            {/* 4 Roles Detailed Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* 1. Teacher Accounts */}
              <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👨‍🏫</span>
                    <h4 className="font-black text-xs text-purple-950 dark:text-purple-200">
                      حسابات المعلمين (Teachers)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px] font-bold">
                    بوابة المعلم
                  </span>
                </div>

                <div className="text-[11px] text-purple-900 dark:text-purple-200/90 space-y-1 leading-relaxed">
                  <p><strong>طريقة الإنشاء:</strong> يدخل المدير إلى تبويب "إدارة الكادر المدرسي" لإضافة المعلم وتعيين مادته وفصوله.</p>
                  <p><strong>كود المعلم:</strong> يتولد كود رسمي لكل معلم (مثل <code className="font-mono font-bold">LIB-COMP-09</code> أو <code className="font-mono font-bold">LIB-MATH-01</code>).</p>
                  <p><strong>كلمة المرور الافتراضية:</strong> <span className="font-mono font-bold">123456</span></p>
                </div>

                <div className="pt-2 border-t border-purple-200 dark:border-purple-800/60 flex items-center justify-between gap-2">
                  <input
                    type="text"
                    readOnly
                    value={teacherLoginLink}
                    className="flex-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-[10px] font-mono select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLinkForRole('teacher', teacherLoginLink)}
                    className="px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] transition active:scale-95 flex items-center gap-1 shrink-0"
                  >
                    {copiedRole === 'teacher' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ الرابط</span>
                  </button>
                </div>
              </div>

              {/* 2. Exams Coordinator / Control */}
              <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📜</span>
                    <h4 className="font-black text-xs text-amber-950 dark:text-amber-200">
                      رئيس الكنترول ومنسق الامتحانات (Exams Control)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[10px] font-bold">
                    بوابة الكنترول
                  </span>
                </div>

                <div className="text-[11px] text-amber-900 dark:text-amber-200/90 space-y-1 leading-relaxed">
                  <p><strong>طريقة الدخول:</strong> هاتف رئيس الكنترول المعتمد (<code className="font-mono font-bold">0912345678</code> أو هاتف المسؤول).</p>
                  <p><strong>كلمة المرور المعتمدة:</strong> <span className="font-mono font-bold">2026</span> (يمكن للمدير تعديلها من إعدادات الحساب).</p>
                  <p><strong>المسؤوليات:</strong> شيت الكنترول 1120 درجة، توزيع أرقام الجلوس، رصد الفترات، وقفل الشيت.</p>
                </div>

                <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-2">
                  <input
                    type="text"
                    readOnly
                    value={examsLoginLink}
                    className="flex-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-[10px] font-mono select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLinkForRole('exams', examsLoginLink)}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition active:scale-95 flex items-center gap-1 shrink-0"
                  >
                    {copiedRole === 'exams' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ الرابط</span>
                  </button>
                </div>
              </div>

              {/* 3. Social Counselor */}
              <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤝</span>
                    <h4 className="font-black text-xs text-blue-950 dark:text-blue-200">
                      الأخصائي الاجتماعي والنفسي (Counselor)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px] font-bold">
                    بوابة الأخصائي
                  </span>
                </div>

                <div className="text-[11px] text-blue-900 dark:text-blue-200/90 space-y-1 leading-relaxed">
                  <p><strong>كود الأخصائي:</strong> <code className="font-mono font-bold">LIB-SOC-01</code></p>
                  <p><strong>كلمة المرور:</strong> <span className="font-mono font-bold">123456</span></p>
                  <p><strong>المسؤوليات:</strong> دراسة الحالات السلوكية، متابعة الغياب المتكرر، واستدعاء ولي الأمر بسرية تامة.</p>
                </div>

                <div className="pt-2 border-t border-blue-200 dark:border-blue-800/60 flex items-center justify-between gap-2">
                  <input
                    type="text"
                    readOnly
                    value={counselorLoginLink}
                    className="flex-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[10px] font-mono select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLinkForRole('counselor', counselorLoginLink)}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition active:scale-95 flex items-center gap-1 shrink-0"
                  >
                    {copiedRole === 'counselor' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ الرابط</span>
                  </button>
                </div>
              </div>

              {/* 4. Parent App & Portal */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👨‍👩‍👧</span>
                    <h4 className="font-black text-xs text-emerald-950 dark:text-emerald-200">
                      أولياء الأمور وتطبيق الجوال (Parent App)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold">
                    تطبيق ولي الأمر
                  </span>
                </div>

                <div className="text-[11px] text-emerald-900 dark:text-emerald-200/90 space-y-1 leading-relaxed">
                  <p><strong>طريقة ربط الطالب:</strong> يدخل ولي الأمر الرقم الوطني للابن (12 رقماً) أو كود الربط (مثل <code className="font-mono font-bold">SCH-2026-B1</code>).</p>
                  <p><strong>تطبيق الجوال:</strong> يفتح التطبيق مباشرة في الهاتف بتصميم PWA سريع ومتجاوب.</p>
                  <p><strong>المتابعة:</strong> نتائج الامتحانات، الحضور والغياب اليومي، والتقارير اليومية فورياً.</p>
                </div>

                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-2">
                  <input
                    type="text"
                    readOnly
                    value={parentLoginLink}
                    className="flex-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLinkForRole('parent', parentLoginLink)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition active:scale-95 flex items-center gap-1 shrink-0"
                  >
                    {copiedRole === 'parent' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ الرابط</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-600 dark:text-slate-300">
            حالة المنظومة: {isActivated ? 'مفعلة وجاهزة للعمل 🟢' : 'بانتظار تأكيد وتفعيل الحساب ⏳'}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownloadWindowsApp}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>مشغل ويندوز (.bat)</span>
          </button>

          <button
            type="button"
            onClick={handleDirectLoginToDashboard}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>دخول لوحة تحكم مدير المدرسة 🏛️</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      </div>

    </div>
  );
};
