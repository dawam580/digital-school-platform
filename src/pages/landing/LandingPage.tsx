import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';
import {
  Shield,
  Award,
  GraduationCap,
  Users,
  HeartHandshake,
  Building2,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  FileText,
  Phone,
  MessageCircle,
  ArrowLeft,
  ChevronRight,
  Database,
  Lock,
  Cpu,
  Printer,
  Calendar,
  Check,
  Zap,
  Globe,
  Star,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { sound } from '../../utils/soundEffects';
import {
  TailgridsBadge,
  TailgridsSectionTitle,
  TailgridsStatCard,
  TailgridsFeatureCard,
  TailgridsAccordionItem
} from '../../components/tailgrids/TailgridsKit';
import { TailgridsPricingSection, PricingPlan } from '../../components/tailgrids/TailgridsPricing';

export const LandingPage: React.FC = () => {
  const {
    setActiveTab,
    setCurrentRole,
    login,
    setShowFreeTrialModal,
    setShowSchoolManagerModal,
    schoolProfile,
    students
  } = useSchool();

  const [activePortalTab, setActivePortalTab] = useState<UserRole>('admin');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleQuickLogin = (role: UserRole) => {
    sound.playSuccess();
    if (role === 'admin') login('0922465676', 'admin');
    else if (role === 'exams_coordinator') login('0912345678', 'exams_coordinator');
    else if (role === 'superadmin') login('0910000000', 'superadmin');
    else if (role === 'teacher') login('LIB-MATH-01', 'teacher');
    else if (role === 'counselor') {
      setCurrentRole('counselor');
      setActiveTab('counselor-dashboard');
    } else if (role === 'parent') login('1001', 'parent');
  };

  const pricingPlans: PricingPlan[] = [
    {
      id: 'trial',
      name: 'باقة التجربة المجانية 🎁',
      tagline: 'للمدارس الراغبة في التقييم',
      price: '0',
      period: 'دينار / 14 يوماً مجاناً',
      description: 'تجربة كافة إمكانيات المنظومة بجميع صلاحيات المدير والمعلم والكنترول دون أي التزام مالي.',
      features: [
        'تجربة مجانية كاملة لمدة 14 يوماً',
        'استيراد كشوفات الطلاب من ملفات PDF',
        'إدارة حتى 1,000 طالب و 40 فصلاً',
        'شيت رصد الدرجات وحساب المعدلات تلقائياً',
        'طباعة بطاقات الإخطار الفصلي والشهادات',
        'حفظ البيانات محلياً 100% دون انقطاع'
      ],
      isPopular: false,
      ctaText: 'ابدأ التجربة المجانية فوراً',
      ctaVariant: 'outline',
      ctaAction: () => {
        sound.playTap();
        setShowFreeTrialModal(true);
      }
    },
    {
      id: 'annual',
      name: 'الباقة السنوية المعتمدة 🏆',
      tagline: 'الأكثر طلباً للمدارس الليبية',
      price: '1,500',
      period: 'دينار ليبي / للعام الدراسي الكامل',
      description: 'الترخيص الرسمي الدائم للمدرسة شاملاً جميع البوابات الست، التحديثات، والدعم الفني المباشر.',
      features: [
        'ترخيص سنوي معتمد بكود فريد لكل مدرسة',
        'جميع البوابات الست (مدير، كنترول، معلمين، أولياء أمور)',
        'استخراج غير محدود لكشوفات الـ PDF بالذكاء الاصطناعي',
        'شيت الامتحانات المعتمد ولائحة وزارة التربية والتعليم',
        'أتمتة أرقام الجلوس ولجان الامتحانات الرسمية',
        'دعم فني ليبي مباشر وتدريب للمدير والمعلمين عبر واتساب',
        'تحديثات مستمرة ونسخ احتياطي محلي وسحابي مؤمن'
      ],
      isPopular: true,
      ctaText: 'طلب تفعيل الباقة السنوية',
      ctaVariant: 'primary',
      ctaAction: () => {
        sound.playFanfare();
        const msg = encodeURIComponent(
          `السلام عليكم ورحمة الله، أود الاشتراك في "الباقة السنوية المعتمدة" لمنظومة المدرسة الرقمية.\nاسم المدرسة: ${schoolProfile.name}\nالمدينة: ${schoolProfile.city || 'طرابلس'}`
        );
        window.open(`https://wa.me/218922465676?text=${msg}`, '_blank');
      }
    },
    {
      id: 'semester',
      name: 'باقة الفصل الدراسي ⚡',
      tagline: 'مرونة عالية للدفع الفصلي',
      price: '850',
      period: 'دينار ليبي / للفصل الدراسي الواحد',
      description: 'خيار مرن يتيح للمدارس الخاصة والعامة إدارة الفصل الدراسي والامتحانات بنظام فصلي سهل.',
      features: [
        'تفعيل كامل لصلاحيات الفصل الدراسي',
        'رصد أعمال السنة والامتحان النهائي للفصل',
        'استخراج وطباعة كشوفات النتائج والإخطار الفصلي',
        'بوابة أولياء الأمور وكشف الحضور والغياب اليومي',
        'دعم فني متواصل طيلة الفصل الدراسي',
        'إمكانية الترقية للباقة السنوية مع خصم الفارق'
      ],
      isPopular: false,
      ctaText: 'طلب اشتراك فصلي',
      ctaVariant: 'outline',
      ctaAction: () => {
        sound.playTap();
        const msg = encodeURIComponent(
          `السلام عليكم ورحمة الله، أود الاستفسار عن باقة الفصل الدراسي لمنظومة المدرسة الرقمية.\nاسم المدرسة: ${schoolProfile.name}`
        );
        window.open(`https://wa.me/218922465676?text=${msg}`, '_blank');
      }
    }
  ];

  const portalsData = [
    {
      id: 'admin' as UserRole,
      title: 'مدير المدرسة',
      badge: 'القيادة والإشراف',
      icon: <Shield className="w-5 h-5 text-purple-600" />,
      colorClass: 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
      desc: 'لوحة قيادة شاملة تعرض إحصائيات 873 طالباً، 33 فصلاً، كشوفات المعلمين، جداول الحصص، وأدوات استيراد وتصدير ملفات Excel و PDF مع خطة تشغيلية كاملة.',
      features: [
        'إحصائيات تفصيلية لأعداد الطلبة وتوزيع الفصول بنين وبنات',
        'استيراد كشوفات المركز الوطني للامتحانات من ملفات PDF',
        'طباعة الخطة التشغيلية للمدرسة وكشوفات القيد الرسمية',
        'إرسال رسائل الدعوة والروابط لجميع كوادر المدرسة وأولياء الأمور'
      ]
    },
    {
      id: 'exams_coordinator' as UserRole,
      title: 'رئيس الكنترول والامتحانات',
      badge: 'شيت الدرجات والامتحانات',
      icon: <Award className="w-5 h-5 text-amber-600" />,
      colorClass: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
      desc: 'إدارة متكاملة للامتحانات النصفية والنهائية، توليد أرقام الجلوس آلياً، توزيع اللجان، وشيت رصد الدرجات المطابق للائحة الامتحانات الليبية مع حساب النسب والدور الثاني تلقائياً.',
      features: [
        'شيت درجات معتمد مع حساب الدرجة الصغرى والكبرى ومعدل النجاح',
        'توليد أرقام الجلوس والتوزيع الآلي على لجان وقاعات الامتحانات',
        'إصدار بطاقات الإخطار الفصلي وكشوفات النتيجة الرسمية',
        'إقفال واعتماد الكنترول لحماية الدرجات من أي تعديل بعد الاعتماد'
      ]
    },
    {
      id: 'teacher' as UserRole,
      title: 'المعلم',
      badge: 'التحضير والرصد الميداني',
      icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
      colorClass: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
      desc: 'واجهة سريعة وخفيفة تمكن المعلم من رصد حضور وغياب طلاب فصوله في ثوانٍ معدودة، تسجيل درجات الواجبات والاختبارات الشفوية والتحريرية، ومنح نقاط السلوك الإيجابية.',
      features: [
        'كشف الحضور والغياب السريع لجميع الحصص بنقرة واحدة',
        'رصد درجات الفترات والواجبات اليومية لكل طالب',
        'نقاط السلوك والتحفيز بنظام النقاط التفاعلي (+/-)',
        'التواصل مع أولياء الأمور وإرسال الملاحظات الفردية'
      ]
    },
    {
      id: 'parent' as UserRole,
      title: 'ولي الأمر',
      badge: 'المتابعة والشراكة',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      colorClass: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
      desc: 'بوابة مخصصة لولي الأمر لمتابعة حضور أبنائه اليومي، درجاتهم في كل مادة، استلام الإشعارات المدرسية، ومشاهدة بطاقة التقييم والشهادات الذهبية بنقرة واحدة وبأمان تام.',
      features: [
        'متابعة الحضور والغياب والتأخر اليومي فور رصده بالمدرسة',
        'الاطلاع الفوري على درجات الفترات والامتحانات والترتيب',
        'استعراض شهادات التقدير وجدول الحصص الأسبوعي',
        'عزل تام يمنع التلاعب بالدرجات أو كشف بيانات طلاب آخرين'
      ]
    },
    {
      id: 'counselor' as UserRole,
      title: 'الأخصائي الاجتماعي',
      badge: 'الرعاية والدعم النفسي',
      icon: <HeartHandshake className="w-5 h-5 text-teal-600" />,
      colorClass: 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300',
      desc: 'سجل إلكتروني متكامل لدراسة الحالات الاجتماعية والصحية الخاصة، متابعة الطلاب ذوي الحاجة إلى الرعاية، وتوليد بطاقات استدعاء أولياء الأمور التلقائية وفق المخالفات.',
      features: [
        'سجل دراسة الحالات الاجتماعية والصحية والتحصيلية بسرية تامة',
        'أتمتة بطاقات استدعاء ولي الأمر عند تكرار الغياب أو التأخر',
        'جلسات الإرشاد الفردية والجماعية ومتابعة التطور السلوكي',
        'تقارير إحصائية دورية لإدارة المدرسة حول الوضع الاجتماعي'
      ]
    },
    {
      id: 'superadmin' as UserRole,
      title: 'المدير العام (سوبر أدمن)',
      badge: 'التحكم والتراخيص السحابية',
      icon: <Building2 className="w-5 h-5 text-indigo-600" />,
      colorClass: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
      desc: 'لوحة القيادة المركزية لمشرف النظام لإدارة وتفعيل اشتراكات وتراخيص المدارس السحابية عبر Firebase، تمديد التجارب، وإضافة فروع ومدارس جديدة بكود ترخيص فريد.',
      features: [
        'إدارة تراخيص المدارس والتحقق السحابي اللحظي عبر Firebase',
        'تمديد فترات التجربة (+14 / +30 يوم) وتفعيل الاشتراكات بنقرة واحدة',
        'توليد مفاتيح التراخيص المعتمدة (SCH-2026-XXXX-XXXX)',
        'عزل كامل ومستقل عن أي مشاريع أو قواعد بيانات أخرى'
      ]
    }
  ];

  const faqs = [
    {
      q: 'هل تحتاج المنظومة إلى اتصال دائم بالإنترنت لتعمل في المدرسة؟',
      a: 'لا إطلاقاً! صُممت المنظومة بتقنية (Offline-First) بحيث تخزن كافة سجلات الطلاب والدرجات محلياً في المتصفح وجهاز الحاسوب عبر IndexedDB. كما توفر مهلة سماح سحابية لمدة 7 أيام عند انقطاع الإنترنت بالكامل دون أي توقف في العمل.'
    },
    {
      q: 'أين تُحفظ بيانات مدرستنا، وهل هناك خطر لفقدان درجات الطلاب؟',
      a: 'بيانات المدرسة محفوظة بأمان تام على جهاز الحاسوب داخل المتصفح، ولا يتم حذفها أبداً حتى في حال انتهاء فترة التجربة أو الاشتراك. كما تدعم المنظومة النسخ الاحتياطي اليدوي بنقرة واحدة بصيغة ملفات JSON و Excel المشفرة.'
    },
    {
      q: 'كيف يمكننا استيراد بيانات الطلاب المسجلين بالمدرسة دون كتابتها يدوياً؟',
      a: 'توفر المنظومة أداة استخراج ذكية بالذكاء الاصطناعي مخصصة لكشوفات المركز الوطني للامتحانات (وزارة التربية والتعليم الليبية) بصيغة PDF، حيث تقوم بقراءة أرقام القيد، الأسماء الكاملة، تواريخ الميلاد، والفصول بدقة 100% في ثوانٍ معدودة.'
    },
    {
      q: 'هل يتوافق شيت الدرجات مع لائحة وزارة التربية والتعليم الليبية؟',
      a: 'نعم 100%. تم ضبط شيت الكنترول والامتحانات وفق لائحة تنظيم شؤون التعليم والامتحانات الليبية المعتمدة للتعليم الأساسي والثانوي، متضمناً توزيع أعمال السنة (الفترة الأولى والثانية، التحريري، والشفوي)، الامتحان النهائي، الدرجة الصغرى، وحالات الدور الثاني والرسوب.'
    },
    {
      q: 'كيف أحصل على مفتاح ترخيص رسمي لتفعيل المنظومة لمدرستي؟',
      a: 'يمكنك التواصل معنا مباشرة عبر الهاتف أو الواتساب على الرقم 0922465676، وسيقوم فريق الدعم الفني بتزويدك بمفتاح ترخيص مخصص لمدرستك وتفعيل اشتراكك الفوري وتقديم التدريب الكامل لمدير المدرسة ورئيس الكنترول.'
    },
    {
      q: 'هل يمكن تشغيل المنظومة على الهواتف والأجهزة اللوحية (التابلت) للمعلمين وأولياء الأمور؟',
      a: 'نعم، المنظومة متجاوبة بالكامل (Responsive PWA) وتعمل بسلاسة على شاشات الحواسيب المكتبية، اللابتوب، أجهزة الآيباد، والهواتف الذكية لكل من المعلمين وأولياء الأمور.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-cairo text-right transition-colors selection:bg-blue-500 selection:text-white">
      
      {/* ==========================================
          1. TOP NAVIGATION BAR
      ========================================== */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm">
              <img src={logoImg} alt="شعار منصة المدرسة" className="h-10 sm:h-12 w-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  منظومة المدرسة الرقمية
                </span>
                <span className="text-xs">🇱🇾</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:block">
                المنصة المتكاملة لإدارة المدارس والكنترول والامتحانات
              </p>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
            <a href="#hero" className="hover:text-blue-600 dark:hover:text-blue-400 transition">الرئيسية</a>
            <a href="#portals" className="hover:text-blue-600 dark:hover:text-blue-400 transition">البوابات الست</a>
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">المميزات</a>
            <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition">باقات الاشتراك</a>
            <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition">الأسئلة الشائعة</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => { sound.playTap(); setActiveTab('login'); }}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              دخول المنظومة 🔐
            </button>

            <button
              type="button"
              onClick={() => { sound.playFanfare(); setShowFreeTrialModal(true); }}
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>تجربة 14 يوماً مجاناً</span>
            </button>
          </div>

        </div>
      </header>

      {/* ==========================================
          2. TAILGRIDS HERO SECTION
      ========================================== */}
      <section id="hero" className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Libyan Ministry Badge */}
            <div className="inline-flex items-center justify-center">
              <TailgridsBadge variant="success" size="md" icon={<Sparkles className="w-4 h-4" />}>
                🇱🇾 معتمدة وفق لوائح وزارة التربية والتعليم والمركز الوطني للامتحانات
              </TailgridsBadge>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2] sm:leading-[1.25]">
              منظومة إدارة المدارس والكنترول الرقمي الشامل في ليبيا
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto font-medium">
              الحل البرمجي الرائد والأكثر أماناً لإدارة المدارس: كشوفات الطلاب، شيت رصد الدرجات المعتمد، استخراج كشوفات الـ PDF بالذكاء الاصطناعي، والعمل الكامل بدون إنترنت مع حماية مطلقة للبيانات.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap pt-3">
              <button
                type="button"
                onClick={() => { sound.playFanfare(); setShowFreeTrialModal(true); }}
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-black shadow-xl shadow-blue-500/25 hover:shadow-blue-500/35 transition active:scale-95 flex items-center gap-2"
              >
                <span>ابدأ تجربة مجانية لمدرستك (14 يوماً)</span>
                <ArrowLeft className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-sm sm:text-base font-black border border-slate-200 dark:border-slate-700 shadow-md transition active:scale-95 flex items-center gap-2"
              >
                <Shield className="w-5 h-5 text-purple-600" />
                <span>دخول لوحة المدير (كشف 873 طالباً)</span>
              </button>

              <a
                href="https://wa.me/218922465676?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%86%D8%B8%D9%88%D9%85%D8%A9%20%D8%A7%D9%84%D9%85%D8%AF%D8%B1%D8%B3%D8%A9%20%D8%A7%D9%84%D8%B1%D9%82%D9%85%D9%8A%D8%A9"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 sm:py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-bold shadow-md transition active:scale-95 flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>تواصل واتساب مباشرة</span>
              </a>
            </div>

          </div>

          {/* Real Metrics Grid (Tailgrids Stat Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-6">
            <TailgridsStatCard
              icon={<Users className="w-6 h-6" />}
              value="873"
              label="طالباً مسجلاً بالكشوف الرسمية"
              trend="مدرسة الباعور النموذجية"
              trendUp={true}
              colorClass="from-blue-600 to-indigo-600"
            />
            <TailgridsStatCard
              icon={<Layers className="w-6 h-6" />}
              value="33"
              label="فصلاً دراسياً معتمداً"
              trend="من 1/1 حتى 9/4 صباحي ومسائي"
              trendUp={true}
              colorClass="from-purple-600 to-pink-600"
            />
            <TailgridsStatCard
              icon={<Lock className="w-6 h-6" />}
              value="6"
              label="بوابات وصلاحيات أمان معزولة"
              trend="مدير • كنترول • معلم • ولي أمر"
              trendUp={true}
              colorClass="from-amber-500 to-orange-600"
            />
            <TailgridsStatCard
              icon={<Database className="w-6 h-6" />}
              value="100%"
              label="عمل أوفلاين بدون نت"
              trend="حفظ فوري في IndexedDB"
              trendUp={true}
              colorClass="from-emerald-500 to-teal-600"
            />
          </div>

        </div>
      </section>

      {/* ==========================================
          3. INTERACTIVE 6-PORTAL ARCHITECTURE
      ========================================== */}
      <section id="portals" className="py-16 sm:py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 text-right">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <TailgridsSectionTitle
            badge="هيكلية أمنية متكاملة"
            badgeIcon={<Lock className="w-3.5 h-3.5" />}
            title="بوابات مخصصة تلبي كافة احتياجات المنظومة التعليمية"
            subtitle="فصل كامل ومحكم للصلاحيات يضمن أن كل عضو في المدرسة يرى ويتفاعل فقط مع ما يعنيه بدقة وسرية تامة."
          />

          {/* Portal Selector Tabs */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {portalsData.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { sound.playTap(); setActivePortalTab(p.id); }}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center gap-2 border ${
                  activePortalTab === p.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700/80'
                }`}
              >
                <span>{p.title}</span>
              </button>
            ))}
          </div>

          {/* Selected Portal Feature Showcase Box */}
          {(() => {
            const currentP = portalsData.find(p => p.id === activePortalTab) || portalsData[0];
            return (
              <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80 shadow-xl space-y-8 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700">
                      {currentP.icon}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mb-0.5">
                        {currentP.badge}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        بوابة {currentP.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin(currentP.id)}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black shadow-md transition active:scale-95 flex items-center gap-2 self-start md:self-auto"
                  >
                    <span>الدخول وتجربة بوابة {currentP.title}</span>
                    <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                  </button>
                </div>

                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl font-normal">
                  {currentP.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {currentP.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-start gap-3"
                    >
                      <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* ==========================================
          4. CORE SYSTEM FEATURES (TAILGRIDS GRID)
      ========================================== */}
      <section id="features" className="py-16 sm:py-24 text-right">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <TailgridsSectionTitle
            badge="قوة تقنية بمعايير عالمية"
            badgeIcon={<Zap className="w-3.5 h-3.5" />}
            title="كل ما تحتاجه مدرستك للتحول الرقمي الكامل"
            subtitle="مجموعة أدوات متطورة ومصممة بعناية لتوفير مئات الساعات من الجهد الإداري الورقي."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            <TailgridsFeatureCard
              icon={<Cpu className="w-6 h-6" />}
              title="استخراج الطلاب الذكي من PDF"
              description="اسحب ملف PDF الصادر من المركز الوطني للامتحانات، وسيقوم الذكاء الاصطناعي برصد أرقام القيد وتواريخ الميلاد وتوزيع الفصول في ثوانٍ."
              badge="ذكاء اصطناعي"
              iconBgClass="bg-blue-600 text-white"
            />

            <TailgridsFeatureCard
              icon={<Award className="w-6 h-6" />}
              title="شيت الكنترول الليبي المعتمد"
              description="مطابق 100% للائحة الامتحانات: حساب درجات أعمال السنة، الفترات، الامتحان النهائي، الترتيب العام، وحالات الدور الثاني آلياً."
              badge="لائحة الوزارة"
              iconBgClass="bg-amber-600 text-white"
            />

            <TailgridsFeatureCard
              icon={<Database className="w-6 h-6" />}
              title="عمل كامل بدون إنترنت (Offline)"
              description="تعمل المنظومة بكفاءة مطلقة في المدارس التي تعاني من ضعف الشبكة. كافة البيانات محفوظة ومحمية محلياً عبر IndexedDB."
              badge="أوفلاين 100%"
              iconBgClass="bg-emerald-600 text-white"
            />

            <TailgridsFeatureCard
              icon={<Lock className="w-6 h-6" />}
              title="طبقة التراخيص والاشتراكات السحابية"
              description="نظام تراخيص سحابي متطور عبر Firebase مع مهلة سماح أوفلاين 7 أيام، وضمان الحفاظ المطلق على بيانات المدرسة دون أي مساس."
              badge="سحابي مؤمن"
              iconBgClass="bg-purple-600 text-white"
            />

            <TailgridsFeatureCard
              icon={<Printer className="w-6 h-6" />}
              title="طباعة وتصدير الكشوفات والشهادات"
              description="تصدير كشوفات الدرجات إلى Excel، استخراج شهادات الطلاب الذهبية، وطباعة بطاقات الإخطار الفصلي بتصميم رسمي فائق الأناقة."
              badge="تصدير وطباعة"
              iconBgClass="bg-pink-600 text-white"
            />

            <TailgridsFeatureCard
              icon={<Users className="w-6 h-6" />}
              title="بوابة وتواصل أولياء الأمور"
              description="إشعارات فورية بالغياب والتأخر، رابط مباشر لمتابعة تحصيل الطالب، ورسائل دعوة مخصصة للمدير عبر واتساب ورسائل SMS."
              badge="شراكة مجتمعية"
              iconBgClass="bg-cyan-600 text-white"
            />

          </div>

        </div>
      </section>

      {/* ==========================================
          5. TAILGRIDS PRICING SECTION
      ========================================== */}
      <TailgridsPricingSection plans={pricingPlans} />

      {/* ==========================================
          6. FAQ SECTION (TAILGRIDS ACCORDION)
      ========================================== */}
      <section id="faq" className="py-16 sm:py-20 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 text-right">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <TailgridsSectionTitle
            badge="إجابات واضحة"
            badgeIcon={<Sparkles className="w-3.5 h-3.5" />}
            title="الأسئلة الشائعة حول المنظومة والتراخيص"
            subtitle="كل ما يدور في ذهنك حول تشغيل المنظومة، حفظ البيانات، والاشتراك."
          />

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <TailgridsAccordionItem
                key={idx}
                question={faq.q}
                answer={faq.a}
                isOpen={openFaqIndex === idx}
                onToggle={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ==========================================
          7. BOTTOM CTA & FOOTER
      ========================================== */}
      <footer className="bg-slate-900 text-white py-12 sm:py-16 text-right border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-10 border-b border-slate-800">
            <div className="space-y-2 text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <img src={logoImg} alt="شعار المنصة" className="h-10 w-auto object-contain brightness-125" />
                <span className="text-xl font-black">منظومة المدرسة الرقمية 🇱🇾</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                المنظومة الليبية الرائدة لإدارة المدارس والكنترول والامتحانات. مبنية ومطورة لخدمة التعليم في دولة ليبيا.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/218922465676?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%AA%D9%81%D8%B9%D9%8A%D9%84%20%D9%85%D9%86%D8%B8%D9%88%D9%85%D8%A9%20%D8%A7%D9%84%D9%85%D8%AF%D8%B1%D8%B3%D8%A9"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب: 0922465676</span>
              </a>

              <button
                type="button"
                onClick={() => { sound.playTap(); setActiveTab('login'); }}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold border border-slate-700 transition"
              >
                دخول المنظومة
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <p>© 2026 منظومة المدرسة الرقمية • جميع الحقوق محفوظة لمدارس دولة ليبيا.</p>
            <p>متوافقة مع معايير وزارة التربية والتعليم والمركز الوطني للامتحانات.</p>
          </div>

        </div>
      </footer>

    </div>
  );
};
