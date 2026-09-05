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
  ArrowRight
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

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

  // Form states for creating a new school for a friend
  const [activeTab, setActiveTab] = useState<'current' | 'new' | 'list'>('current');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newDistrict, setNewDistrict] = useState('مراقبة التربية والتعليم');
  const [newDirector, setNewDirector] = useState('مدير المدرسة');
  const [newPhone, setNewPhone] = useState('0910000000');
  const [startFresh, setStartFresh] = useState(true);

  if (!isOpen) return null;

  const handleSaveCurrentProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    updateSchoolProfile({
      name: currentName,
      district: currentDistrict,
      directorName: currentDirector,
      directorPhone: currentPhone
    });
    triggerConfetti();
    onClose();
  };

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) {
      showToast('error', 'تنبيه', 'يرجى كتابة اسم المدرسة أولاً.');
      return;
    }
    createNewSchool(newSchoolName.trim(), newDistrict.trim(), newDirector.trim(), newPhone.trim(), startFresh);
    onClose();
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

          <button onClick={onClose} className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
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
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'list'
                ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>التبديل بين المدارس ({savedSchools.length})</span>
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
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">العام الدراسي المعتمد: {schoolProfile.academicYear}</span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition active:scale-95"
                  >
                    حفظ التعديلات في المنظومة
                  </button>
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

        </div>

      </div>
    </div>
  );
};
