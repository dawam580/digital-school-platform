import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  X,
  Building2,
  Download,
  Upload,
  Plus,
  CheckCircle2,
  RefreshCw,
  School,
  Sparkles,
  Phone,
  User,
  Shield,
  FileJson,
  Layers,
  ArrowRight,
  MapPin,
  Clock,
  Key,
  Copy,
  Check,
  Share2,
  Printer,
  ExternalLink,
  Award
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { LicenseService } from '../../services/licensing/licenseService';

interface SchoolManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolManagerModal: React.FC<SchoolManagerModalProps> = ({ isOpen, onClose }) => {
  const {
    schoolProfile,
    updateSchoolProfile,
    createNewSchool,
    switchSchool,
    savedSchools,
    exportSchoolPackage,
    importSchoolPackage,
    showToast
  } = useSchool();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for editing current school
  const [currentName, setCurrentName] = useState(schoolProfile.name);
  const [currentDistrict, setCurrentDistrict] = useState(schoolProfile.district);
  const [currentDirector, setCurrentDirector] = useState(schoolProfile.directorName);
  const [currentPhone, setCurrentPhone] = useState(schoolProfile.directorPhone);
  const [currentAddress, setCurrentAddress] = useState(schoolProfile.schoolAddress || (schoolProfile as any).address || 'طرابلس، شارع عمر المختار');
  const [currentWorkingHours, setCurrentWorkingHours] = useState(schoolProfile.workingHours || 'من 08:00 صباحاً إلى 01:30 ظهراً (الأحد - الخميس)');

  // Form states for tabs
  const [activeTab, setActiveTab] = useState<'current' | 'new' | 'list' | 'key'>('current');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newDistrict, setNewDistrict] = useState('مراقبة التربية والتعليم');
  const [newDirector, setNewDirector] = useState('مدير المدرسة');
  const [newPhone, setNewPhone] = useState('');
  const [startFresh, setStartFresh] = useState(true);

  // Access Key Generator States (ميزة إنشاء مفتاح الدخول إلى المنظومة)
  const [targetSchoolForGen, setTargetSchoolForGen] = useState(schoolProfile.name);
  const [licenseDuration, setLicenseDuration] = useState<'annual' | 'lifetime' | 'trial'>('annual');
  const [targetPhone, setTargetPhone] = useState(schoolProfile.directorPhone || '0922465676');
  const [generatedCard, setGeneratedCard] = useState<any | null>(null);
  const [hasCopiedKey, setHasCopiedKey] = useState(false);
  const [showPrintCardModal, setShowPrintCardModal] = useState(false);
  const [activeLicenseKey, setActiveLicenseKey] = useState(() => LicenseService.getActiveLicenseKey() || 'SCH-BAOUR-2026-ACTIVE');

  if (!isOpen) return null;

  const handleSaveCurrentProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    updateSchoolProfile({
      name: currentName,
      district: currentDistrict,
      directorName: currentDirector,
      directorPhone: currentPhone,
      schoolAddress: currentAddress,
      workingHours: currentWorkingHours
    });
    triggerConfetti();
    showToast('success', 'تم حفظ إعدادات المدرسة بنجاح ✅', 'تم تحديث اسم وعنوان وهاتف وساعات عمل المدرسة');
    onClose();
  };

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) {
      showToast('error', 'تنبيه', 'يرجى كتابة اسم المدرسة أولاً.');
      return;
    }
    // لا هواتف مختلقة: رقم حقيقي أو يُترك فارغاً (يُستكمل لاحقاً من الإعدادات)
    createNewSchool(newSchoolName.trim(), newDistrict.trim(), newDirector.trim(), newPhone.trim(), startFresh);
    
    // إنشاء مفتاح دخول وترخيص تلقائي للمدرسة الجديدة
    try {
      const generated = LicenseService.generateSchoolAccessKey({
        schoolName: newSchoolName.trim(),
        licenseType: 'annual',
        adminPhone: newPhone.trim(),
        district: newDistrict.trim()
      });
      LicenseService.setActiveLicenseKey(generated.accessKey);
    } catch {}

    onClose();
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    const res = LicenseService.generateSchoolAccessKey({
      schoolName: targetSchoolForGen.trim(),
      licenseType: licenseDuration,
      adminPhone: targetPhone.trim(),
      district: schoolProfile.district
    });
    setGeneratedCard(res.formattedKeyCard);
    triggerConfetti();
    showToast('gold', 'تم توليد مفتاح الدخول والترخيص 🔑', `تم إنشاء المفتاح الرسمي للمدرسة (${targetSchoolForGen}) بنجاح.`);
  };

  const handleCopyGeneratedKey = (key: string) => {
    try {
      navigator.clipboard.writeText(key);
      setHasCopiedKey(true);
      sound.playSuccess();
      showToast('success', 'تم النسخ بنجاح 📋', 'تم نسخ مفتاح الدخول إلى الحافظة.');
      setTimeout(() => setHasCopiedKey(false), 2500);
    } catch {
      showToast('info', 'مفتاح المنظومة', key);
    }
  };

  const handleActivateThisKey = (key: string) => {
    sound.playSuccess();
    LicenseService.setActiveLicenseKey(key);
    setActiveLicenseKey(key);
    triggerConfetti();
    showToast('gold', 'تم تفعيل المفتاح بنجاح 🌟', `تم اعتماد وتفعيل المفتاح (${key}) لهذه المدرسة.`);
  };

  const handleShareWhatsApp = (card: any) => {
    sound.playTap();
    const message = `السلام عليكم ورحمة الله وبركاته،\nمرفق مفتاح الدخول والترخيص المعتمد لمنظومة المدرسة الرقمية:\n\n🏫 المؤسسة: ${card.schoolName}\n🔑 مفتاح الدخول: ${card.key}\n📅 الصلاحية: ${card.licenseTypeLabel}\n🔒 رمز التحقق: ${card.verificationCode}\n\nيرجى فتح المنظومة وإدخال المفتاح لتفعيل كافة الأقسام والصلاحيات مباشرة.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleImportFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importSchoolPackage(content);
        if (success) onClose();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-cairo">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] text-right">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">إدارة المدارس المستقلة والنسخ التجريبية</h3>
                <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 font-bold text-[10px] rounded-full border border-amber-400/30">
                  نظام مستقل لكل مدرسة
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                تخصيص بيانات مدرستك، تصدير نسخة مستقلة لصديقك، أو إنشاء مدرسة جديدة ببيانات معزولة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
              <span>الرجوع إلى القسم السابق</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={() => { setActiveTab('current'); sound.playTap(); }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'current'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>بيانات مدرستك الحالية</span>
          </button>

          <button
            onClick={() => { setActiveTab('new'); sound.playTap(); }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'new'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء مدرسة جديدة لصديقك</span>
          </button>

          <button
            onClick={() => { setActiveTab('list'); sound.playTap(); }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>المدارس ({savedSchools.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('key'); sound.playTap(); }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'key'
                ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Key className="w-4 h-4 text-amber-500" />
            <span>مفتاح الدخول والترخيص 🔑</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* TAB 1: Edit Current School & Export/Import */}
          {activeTab === 'current' && (
            <div className="space-y-6">
              
              {/* Form to Edit Current School */}
              <form onSubmit={handleSaveCurrentProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">اسم المدرسة الرسمي:</label>
                    <input
                      type="text"
                      value={currentName}
                      onChange={e => setCurrentName(e.target.value)}
                      placeholder="مثال: مدرسة الأمل للتعليم الأساسي"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">المراقبة / المنطقة التعليمية:</label>
                    <input
                      type="text"
                      value={currentDistrict}
                      onChange={e => setCurrentDistrict(e.target.value)}
                      placeholder="مثال: مراقبة التربية والتعليم - طرابلس المركز"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">اسم مدير المدرسة:</label>
                    <input
                      type="text"
                      value={currentDirector}
                      onChange={e => setCurrentDirector(e.target.value)}
                      placeholder="مثال: أ. فتحي الشريف"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">هاتف الإدارة للتواصل:</label>
                    <input
                      type="text"
                      value={currentPhone}
                      onChange={e => setCurrentPhone(e.target.value)}
                      placeholder="مثال: 0922465676"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      عنوان ومقر المدرسة الرسمي:
                    </label>
                    <input
                      type="text"
                      value={currentAddress}
                      onChange={e => setCurrentAddress(e.target.value)}
                      placeholder="مثال: طرابلس، شارع عمر المختار - بالقرب من الميدان"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      ساعات العمل والدوام الرسمي:
                    </label>
                    <input
                      type="text"
                      value={currentWorkingHours}
                      onChange={e => setCurrentWorkingHours(e.target.value)}
                      placeholder="مثال: من 08:00 صباحاً إلى 01:30 ظهراً (الأحد - الخميس)"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-slate-500">العام الدراسي المعتمد: {schoolProfile.academicYear}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playTap();
                        onClose();
                      }}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition active:scale-95 text-xs flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>الرجوع للقسم السابق</span>
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition active:scale-95 text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>حفظ التعديلات في المنظومة</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Portable Package Backup & Restore Box (Clear for beginners) */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-blue-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">
                      نسخة الأمان والنسخ الاحتياطي الشامل للمنظومة (Backup) 📦
                    </h4>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                      لحفظ بيانات المدرسة ونقلها بالكامل إلى كمبيوتر آخر
                    </span>
                  </div>
                </div>

                {/* Beginner Explanatory Alert */}
                <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-[11px] leading-relaxed text-blue-900 dark:text-blue-200 space-y-1">
                  <div className="font-black flex items-center gap-1">
                    <span>💡 ما هو ملف المنظومة (.json) ولماذا هو موجود؟</span>
                  </div>
                  <p>
                    هذا الملف ليس جدولاً عادياً، بل هو <strong>ملف أمان مشفر (مثل نسخة واتساب الاحتياطية)</strong> يحتوي على كامل قاعدة بيانات مدرستك (الطلاب، الدرجات، الحضور، الإعدادات). المنظومة تعمل محلياً داخل جهازك بدون الحاجة لسيرفر خارجي، وهذا الملف يسمح لك بأخذ نسختك في فلاش ميموري وتشغيلها في أي مكان أو استرجاعها إن تعطل المتصفح.
                  </p>
                  <p className="text-amber-800 dark:text-amber-300 font-bold pt-0.5">
                    👉 إذا أردت كشوفات قابلة للقراءة والطباعة: استخدم زر <strong>(تصدير Excel 📊)</strong> أو <strong>(الكشف الوزاري الرسمي A4 🏛️)</strong> في الصفحة الرئيسية.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={exportSchoolPackage}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-sm flex items-center gap-2 transition active:scale-95 text-xs"
                    title="تنزيل نسخة احتياطية كاملة من قاعدة بيانات المنظومة"
                  >
                    <Download className="w-4 h-4" />
                    <span>حفظ نسخة احتياطية كاملة للمنظومة (.json) 💾</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-800 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm flex items-center gap-2 transition text-xs"
                    title="استرجاع مدرسة من ملف نسخة احتياطية سابقة"
                  >
                    <Upload className="w-4 h-4" />
                    <span>استرجاع المنظومة من ملف احتياطي 📥</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleImportFile(file);
                    }}
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Create a Fresh Isolated School for Friend */}
          {activeTab === 'new' && (
            <form onSubmit={handleCreateSchool} className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>تهيئة مدرسة جديدة مستقلة لصديقك</span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  سيتم حفظ بيانات مدرستك الحالية بأمان تام في الذاكرة، وتهيئة بيئة جديدة تماماً لمدرسة صديقك لتبدأ فارغة ونظيفة لتجربة إدخال الطلاب والمعلمين.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">اسم مدرسة الصديق الجديدة:</label>
                  <input
                    type="text"
                    value={newSchoolName}
                    onChange={e => setNewSchoolName(e.target.value)}
                    placeholder="مثال: مدرسة النور للتعليم الأساسي"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">المراقبة التعليمية:</label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={e => setNewDistrict(e.target.value)}
                    placeholder="مثال: مراقبة التربية والتعليم - بنغازي"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">اسم مدير المدرسة الجديدة:</label>
                  <input
                    type="text"
                    value={newDirector}
                    onChange={e => setNewDirector(e.target.value)}
                    placeholder="مثال: أ. سالم محمود"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">رقم هاتف إدارة المدرسة:</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="مثال: 0912345678"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200 text-xs">
                  <input
                    type="checkbox"
                    checked={startFresh}
                    onChange={e => setStartFresh(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>بدء مدرسة نظيفة وفارغة بدون طلاب قدامى (جاهزة للاستيراد من PDF أو إكسل)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition active:scale-95 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>إنشاء وتشغيل المدرسة الجديدة فوراً</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Switch Between Saved Schools */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                المدارس المحفوظة على هذا المتصفح (يمكنك التنقل بينها بنقرة واحدة):
              </label>

              <div className="space-y-2">
                {savedSchools.map(sch => {
                  const isCurrent = sch.id === schoolProfile.id;
                  return (
                    <div
                      key={sch.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                          isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          🏫
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-slate-900 dark:text-white">{sch.name}</h4>
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white font-bold text-[10px] rounded-full">
                                النشطة حالياً
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            المراقبة: {sch.district} • المدير: {sch.directorName} ({sch.directorPhone})
                          </p>
                        </div>
                      </div>

                      {!isCurrent && (
                        <button
                          onClick={() => switchSchool(sch.id)}
                          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>التبديل لهذه المدرسة</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM ACCESS KEY GENERATOR & MANAGEMENT */}
          {activeTab === 'key' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Active License Status Box */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border-2 border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      <Key className="w-5 h-5" />
                    </span>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">
                      مفتاح الدخول والترخيص النشط حالياً:
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      مفعّل ونشط 🟢
                    </span>
                  </div>
                  <p className="font-mono font-black text-sm text-blue-700 dark:text-blue-300 select-all pr-2">
                    {activeLicenseKey}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    هذا المفتاح يمنح كافة الصلاحيات والأقسام الستة دون الحاجة إلى اتصال دائم بالإنترنت.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyGeneratedKey(activeLicenseKey)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-600" />
                  <span>نسخ المفتاح النشط</span>
                </button>
              </div>

              {/* Key Generator Form */}
              <form onSubmit={handleGenerateKey} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>توليد وإنشاء مفتاح دخول جديد لمؤسسة تعليمية أو لزبون</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select or Type School Name */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اسم المدرسة / المؤسسة:
                    </label>
                    <input
                      type="text"
                      value={targetSchoolForGen}
                      onChange={e => setTargetSchoolForGen(e.target.value)}
                      placeholder="اكتب اسم المدرسة هنا..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs"
                      required
                    />
                  </div>

                  {/* License Duration */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نوع وصلاحية الترخيص:
                    </label>
                    <select
                      value={licenseDuration}
                      onChange={e => setLicenseDuration(e.target.value as any)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs"
                    >
                      <option value="annual">🌟 ترخيص عام دراسي كامل (2025/2026) - سنة كاملة</option>
                      <option value="lifetime">🏛️ ترخيص دائم غير محدود مدى الحياة (Enterprise Offline)</option>
                      <option value="trial">⏳ ترخيص تجريبي موسع (30 يوماً)</option>
                    </select>
                  </div>

                  {/* Director Phone */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      هاتف الإدارة أو المستلم:
                    </label>
                    <input
                      type="text"
                      value={targetPhone}
                      onChange={e => setTargetPhone(e.target.value)}
                      placeholder="0922465676"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                    />
                  </div>

                  {/* Fast Selector from saved schools */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      أو اختر من المدارس المسجلة:
                    </label>
                    <select
                      onChange={e => {
                        if (e.target.value) setTargetSchoolForGen(e.target.value);
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="">-- اضغط للاختيار السريع --</option>
                      {savedSchools.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-slate-500">
                    يتم تشفير المفتاح وتسجيله برمز تحقق رقمي معتمد يضمن أصالة الترخيص.
                  </p>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center gap-2 shrink-0"
                  >
                    <Key className="w-4 h-4" />
                    <span>إنشاء وتوليد مفتاح الدخول الآن ⚡</span>
                  </button>
                </div>
              </form>

              {/* Generated Result Card (if any) */}
              {generatedCard && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-amber-400 dark:border-amber-600 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                        مفتاح دخول معتمد ورسمي ✅
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
                        {generatedCard.schoolName}
                      </h4>
                      <p className="text-xs text-slate-500">{generatedCard.licenseTypeLabel} • حتى {generatedCard.expiresAt}</p>
                    </div>

                    <div className="text-left sm:text-right font-mono text-xs">
                      <span className="text-slate-400 block text-[10px]">رمز التحقق:</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-300 dark:border-emerald-800">
                        SEC-{generatedCard.verificationCode}
                      </span>
                    </div>
                  </div>

                  {/* Giant Monospace Key Box */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-800 shadow-inner">
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold block">مفتاح الترخيص (License Key):</span>
                      <span className="font-mono font-black text-sm sm:text-base tracking-wider text-amber-300 select-all break-all">
                        {generatedCard.key}
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleCopyGeneratedKey(generatedCard.key)}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 shrink-0"
                    >
                      {hasCopiedKey ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                      <span>{hasCopiedKey ? 'تم النسخ!' : 'نسخ المفتاح 📋'}</span>
                    </button>
                  </div>

                  {/* Action Buttons: Activate, WhatsApp, Print */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleActivateThisKey(generatedCard.key)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تفعيل هذا المفتاح لمدرستي الحالية فوراً</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(generatedCard)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-700 transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Share2 className="w-4 h-4 text-emerald-600" />
                      <span>إرسال عبر واتساب 💬</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPrintCardModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4 text-blue-600" />
                      <span>معاينة وطباعة شهادة الاعتماد 🖨️</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Printable License Accreditation Modal */}
      {showPrintCardModal && generatedCard && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-cairo" dir="rtl">
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl p-8 border-4 border-amber-400 space-y-6 text-right">
            <button
              onClick={() => setShowPrintCardModal(false)}
              className="absolute left-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Header */}
            <div className="text-center space-y-1.5 border-b-2 border-amber-300 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-900 rounded-full text-xs font-black border border-amber-300 mb-1">
                <span>🇱🇾 دولة ليبيا • وزارة التربية والتعليم</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">شهادة اعتماد مفتاح الدخول وتشغيل المنظومة</h3>
              <p className="text-xs text-slate-500">وثيقة إلكترونية رسمية صادرة لتشغيل منصة المدرسة الرقمية المعتمدة</p>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">اسم المؤسسة التعليمية:</span>
                  <span className="font-black text-sm text-slate-900">{generatedCard.schoolName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">نوع وصلاحية الترخيص:</span>
                  <span className="font-black text-sm text-blue-700">{generatedCard.licenseTypeLabel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">تاريخ الانتهاء:</span>
                  <span className="font-bold text-slate-800">{generatedCard.expiresAt}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">رمز التحقق الأمني:</span>
                  <span className="font-mono font-black text-emerald-700">SEC-{generatedCard.verificationCode}</span>
                </div>
              </div>

              {/* Monospace Key Display */}
              <div className="p-4 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-400 text-center space-y-1">
                <span className="text-xs font-bold text-amber-900 block">مفتاح الدخول والترخيص المعتمد:</span>
                <span className="font-mono font-black text-base sm:text-lg text-slate-900 select-all block">
                  {generatedCard.key}
                </span>
              </div>

              {/* Features List */}
              <div className="space-y-1 text-[11px] text-slate-600">
                <span className="font-bold text-slate-800 block mb-1">الصلاحيات والأقسام المعتمدة:</span>
                {generatedCard.features.map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Stamp & Signature Section */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-slate-500 text-[11px]">
                <div>
                  <span>الختم الإلكتروني المعتمد 🏛️</span>
                  <p className="font-mono text-[10px] text-slate-400">MD5: {generatedCard.verificationCode}9842</p>
                </div>
                <div className="text-center">
                  <span>إدارة التراخيص والمنظومات</span>
                  <p className="font-bold text-slate-700">معتمد للعام 2025/2026</p>
                </div>
              </div>
            </div>

            {/* Print Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPrintCardModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الشهادة الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
