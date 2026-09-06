import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  X,
  Sparkles,
  Building2,
  MapPin,
  Users,
  Phone,
  User,
  Lock,
  Globe2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  School,
  Database,
  Calculator,
  Award,
  Zap,
  Clock
} from 'lucide-react';
import { LIBYAN_CITIES } from '../../data/mockFinanceData';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

interface FreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FreeTrialModal: React.FC<FreeTrialModalProps> = ({ isOpen, onClose }) => {
  const { createTrialSchool } = useSchool();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [schoolName, setSchoolName] = useState('مدرسة الأندلس النموذجية للتعليم الأساسي');
  const [city, setCity] = useState('طرابلس');
  const [studentCount, setStudentCount] = useState('300 - 600 طالب');
  const [isInternational, setIsInternational] = useState(false);
  const [phone, setPhone] = useState('0912345678');
  const [address, setAddress] = useState('طرابلس - حي الأندلس، بالقرب من مجمع المدارس');
  const [username, setUsername] = useState('مدير_المدرسة');
  const [password, setPassword] = useState('123456');
  const [seedRichData, setSeedRichData] = useState(true);

  // Provisioning Simulation state (Step 4)
  const [progress, setProgress] = useState(0);
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setProgress(0);
      setProvisioningLogs([]);
    }
  }, [isOpen]);

  // Handle high-tech provisioning simulation in step 4
  useEffect(() => {
    if (step !== 4) return;

    setProgress(0);
    setProvisioningLogs(['بدء إعداد البيئة التجريبية السحابية...']);

    const milestones = [
      { p: 20, log: '🔒 إنشاء بيئة آمنة ومعزولة وفق معايير وزارة التربية الليبية...' },
      { p: 45, log: '🏫 تهيئة فصول المدرسة وتوزيع الشعب الدراسية...' },
      { p: 70, log: '📊 ربط المنظومة المالية، الرسوم المدرسية، وسندات القبض...' },
      { p: 90, log: '📝 إعداد بنك الامتحانات، الكنترول، ومحرك التصحيح الإلكتروني...' },
      { p: 100, log: '✨ اكتمل الإعداد! جاري فتح لوحة تحكم المدير التجريبية...' }
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < milestones.length) {
        const item = milestones[currentIdx];
        setProgress(item.p);
        setProvisioningLogs(prev => [...prev, item.log]);
        sound.playTap();
        currentIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          sound.playFanfare();
          triggerConfetti();
          createTrialSchool({
            schoolName: schoolName.trim() || 'مدرسة التجربة المجانية',
            city,
            studentCount,
            isInternational,
            phone: phone.trim() || '0922465676',
            address: address.trim() || city,
            username: username.trim() || 'المدير العام',
            seedRichData
          });
          onClose();
        }, 900);
      }
    }, 650);

    return () => clearInterval(interval);
  }, [step]);

  if (!isOpen) return null;

  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) return;
    sound.playTap();
    setStep(2);
  };

  const handleNextToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTap();
    setStep(3);
  };

  const handleLaunchProvisioning = () => {
    sound.playSuccess();
    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto font-cairo">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col my-auto text-right">

        {/* Ambient Top Glow Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600" />

        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-slate-800/40">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-700/60 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              <span>7 أيام تجربة مجانية كاملة — بدون أي التزام</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              أنشئ مدرستك التجريبية المتكاملة 🏫
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              استكشف الامتحانات، التواصل، المنظومة المالية، والتصحيح الإلكتروني بكامل الصلاحيات.
            </p>
          </div>

          {step !== 4 && (
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Multi-Step Breadcrumbs */}
        {step !== 4 && (
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 1 ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </span>
              <span className={step === 1 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}>بيانات المدرسة</span>
            </div>

            <div className="h-0.5 w-6 bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 2 ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
              </span>
              <span className={step === 2 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}>التواصل وحساب المدير</span>
            </div>

            <div className="h-0.5 w-6 bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 3 ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {step === 3 ? '3' : '3'}
              </span>
              <span className={step === 3 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}>تخصيص البيانات</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          
          {/* STEP 1: SCHOOL IDENTITY */}
          {step === 1 && (
            <form onSubmit={handleNextToStep2} className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                  اسم المدرسة <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    placeholder="مثال: مدرسة قرطبة للتعليم الأساسي والثانوي"
                    className="w-full px-4 py-3 pr-10 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* City Selection (All 22 Libyan Cities) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                  المدينة والمنطقة التعليمية <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-4 py-3 pr-10 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    {LIBYAN_CITIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400">
                  تشمل كافة المراقبات التعليمية الليبية (بنغازي، طرابلس، مصراتة، سبها، الجفرة، البيضاء، درنة، وغيرها).
                </p>
              </div>

              {/* Student Count Options */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                  عدد الطلبة المتوقع بالمدرسة:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['أقل من 200 طالب', '300 - 600 طالب', '600 - 1000 طالب', '+1000 طالب'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setStudentCount(opt); sound.playTap(); }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition ${
                        studentCount === opt
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* School Category (National vs International) */}
              <div className="pt-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
                  نوع المدرسة ونظام التدريس:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => { setIsInternational(false); sound.playTap(); }}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 ${
                      !isInternational
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <School className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-black">مدرسة حكومية / نموذجية</div>
                      <div className="text-[10px] text-slate-400">المنهج الوطني الليبي العام</div>
                    </div>
                  </div>

                  <div
                    onClick={() => { setIsInternational(true); sound.playTap(); }}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 ${
                      isInternational
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Globe2 className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs font-black">مدرسة دولية أو خاصة</div>
                      <div className="text-[10px] text-slate-400">نظام الرسوم واللغات</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>متابعة لبيانات التواصل وحساب المدير</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: CONTACT & DIRECTOR ACCOUNT */}
          {step === 2 && (
            <form onSubmit={handleNextToStep3} className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                    رقم الهاتف (المدير / إدارة المدرسة) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full px-4 py-3 pr-10 text-sm font-mono rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <span className="text-[10px] text-slate-400">يستخدم للدخول المباشر والتواصل الفني</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                    عنوان ومقر المدرسة:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="طرابلس - حي الأندلس"
                      className="w-full px-4 py-3 pr-10 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Director Account Credentials */}
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-black text-purple-900 dark:text-purple-200">
                    بيانات حساب المدير (صلاحيات كاملة 360)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      اسم المستخدم:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="أ. فتحي الشريف"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      كلمة المرور:
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="pt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => { sound.playTap(); setStep(1); }}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <button
                  type="submit"
                  className="px-7 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition flex items-center gap-2 active:scale-95"
                >
                  <span>متابعة لتخصيص بيئة التجربة</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ENVIRONMENT PREFERENCE */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  كيف ترغب في تهيئة بيانات مدرستك التجريبية؟
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  اختر الطريقة الأنسب لك لاستكشاف كامل وظائف المنظومة المدرسية خلال الـ 7 أيام
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Option 1: Rich Seeded Environment (Recommended) */}
                <div
                  onClick={() => { setSeedRichData(true); sound.playTap(); }}
                  className={`p-5 rounded-3xl border-2 cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                    seedRichData
                      ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 shadow-lg scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px] font-black">
                      موصى بها للتجربة 🌟
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      بيئة نموذجية متكاملة وغنية بالبيانات
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      تتضمن 873 طالباً، 28 فصلاً، كشوفات حضور وغياب، سجل الدرجات المعتمد، سندات مالية تجريبية، ومحرك التصحيح الإلكتروني جاهزاً للعمل مباشرة.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-purple-100 dark:border-purple-800/60 flex items-center gap-2 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>توفير الوقت واستكشاف فوري لكافة التقارير</span>
                  </div>
                </div>

                {/* Option 2: Clean Blank Environment */}
                <div
                  onClick={() => { setSeedRichData(false); sound.playTap(); }}
                  className={`p-5 rounded-3xl border-2 cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                    !seedRichData
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-lg scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md">
                      <Database className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                      بدء من الصفر 📄
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      بيئة بيضاء نظيفة ومستقلة
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      منظومة فارغة بدون طلاب أو بيانات مسبقة، لتتمكن من تجربة استيراد كشوفات طلاب مدرستك الحقيقية عبر ملفات Excel و PDF.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>مناسب لاختبار استيراد البيانات الحقيقية</span>
                  </div>
                </div>

              </div>

              {/* Navigation buttons */}
              <div className="pt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => { sound.playTap(); setStep(2); }}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <button
                  type="button"
                  onClick={handleLaunchProvisioning}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black text-xs shadow-xl transition flex items-center gap-2 active:scale-95 animate-pulse"
                >
                  <Zap className="w-4 h-4" />
                  <span>بدء التجهيز وإطلاق التجربة المجانية 🚀</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PROVISIONING SIMULATION (High-Tech Progress) */}
          {step === 4 && (
            <div className="py-8 space-y-6 text-center animate-in fade-in duration-300">
              
              <div className="relative inline-flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center">
                  <span className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
                    {progress}%
                  </span>
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  جاري تهيئة بيئة مدرسة {schoolName}...
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  نحن نقوم الآن بإعداد سيرفر المدرسة، المنظومة المالية، ومحرك الكنترول والتصحيح. قد يستغرق ذلك ثوانٍ معدودة.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div
                  className="bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Live Terminal Logs */}
              <div className="bg-slate-950 text-slate-200 font-mono text-xs text-right p-4 rounded-2xl border border-slate-800 space-y-1.5 shadow-inner max-h-44 overflow-y-auto">
                {provisioningLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-2 text-emerald-400 animate-in fade-in">
                    <span className="text-slate-600">❯</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>البيانات مشفرة ومحمية بالكامل داخل خوادم ليبيا التعليمية</span>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
