import React, { useState } from 'react';
import {
  X,
  BookOpen,
  UserCheck,
  Shield,
  GraduationCap,
  Users,
  FileText,
  Award,
  CheckCircle2,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface QuickSystemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSystemGuideModal: React.FC<QuickSystemGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedRoleGuide, setSelectedRoleGuide] = useState<'admin' | 'teacher' | 'parent'>('admin');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm font-cairo text-right animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl text-2xl border border-white/20">
              💡
            </div>
            <div>
              <h3 className="text-lg font-black">
                دليل المنظومة السريع الموضح (خطوة بخطوة)
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                شرح مبسط وواضح جداً لكيفية استخدام المنظومة دون أي تعقيد أو تشتت
              </p>
            </div>
          </div>

          <button
            onClick={() => { onClose(); sound.playTap(); }}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <button
            onClick={() => { setSelectedRoleGuide('admin'); sound.playTap(); }}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
              selectedRoleGuide === 'admin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>1. دليل مدير المدرسة (الإدارة)</span>
          </button>

          <button
            onClick={() => { setSelectedRoleGuide('teacher'); sound.playTap(); }}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
              selectedRoleGuide === 'teacher'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>2. دليل المعلم (التدريس)</span>
          </button>

          <button
            onClick={() => { setSelectedRoleGuide('parent'); sound.playTap(); }}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
              selectedRoleGuide === 'parent'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>3. دليل ولي الأمر والطالب</span>
          </button>
        </div>

        {/* Body Guide Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* ================================================================= */}
          {/* ADMIN GUIDE                                                       */}
          {/* ================================================================= */}
          {selectedRoleGuide === 'admin' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-sm font-bold flex items-center gap-3">
                <span className="text-2xl">👔</span>
                <p>
                  بصفتك مدير المدرسة، صُممت لك المنظومة لتعمل عبر <strong>4 خطوات أساسية فقط</strong>، دون أي حشو إضافي:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Step 1 */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-sm">
                    <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center font-mono">1</span>
                    <h4>استيراد كشف الطلبة من PDF</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    اضغط على زر <strong>[ 📄 استيراد كشف PDF ]</strong> في أعلى الشاشة، اختر ملف الـ PDF المأخوذ من المنظومة القديمة، وسيتم تصنيف جميع الطلاب الـ 90 تلقائياً وحفظهم بأسمائهم وأرقامهم الوطنية وأمهاتهم.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-black text-sm">
                    <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center font-mono">2</span>
                    <h4>شيت الامتحانات وبطاقات النتيجة</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    اضغط على تبويب <strong>[ 📑 شيت الامتحانات والنتائج ]</strong> لرؤية درجات المواد الثمانية المعتمدة (المجموع 1120)، وتصدير شيت إكسل رسمي لمكتب الامتحانات، أو طباعة بطاقة إخطار نتيجة رسمية معتمدة لكل طالب.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm">
                    <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center font-mono">3</span>
                    <h4>التحكم في المعلمين ورموزهم</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    اضغط على تبويب <strong>[ 👨‍🏫 التحكم في المعلمين ]</strong> لإضافة أي معلم جديد وتعيين رمز دخول سهل وسريع له (مثل: <code>أستاذ-طارق</code> أو <code>0922465676</code>) دون أي تعقيد.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center font-mono">4</span>
                    <h4>متابعة الحضور والغياب</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    اضغط على تبويب <strong>[ 📊 متابعة الحضور ]</strong> لمعرفة نسبة الحضور اليومية في المدرسة، وإمكانية تحضير الجميع حاضرين بلمسة واحدة.
                  </p>
                </div>

              </div>

              {/* Login Info Helper */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <span className="font-black text-slate-800 dark:text-white block">📌 بيانات دخول المدير الافتراضية:</span>
                <p className="text-slate-600 dark:text-slate-400">
                  رقم الهاتف: <strong className="font-mono text-slate-900 dark:text-white">0922465676</strong> | كلمة السر: <strong className="font-mono text-slate-900 dark:text-white">123456</strong>
                </p>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TEACHER GUIDE                                                     */}
          {/* ================================================================= */}
          {selectedRoleGuide === 'teacher' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-sm font-bold flex items-center gap-3">
                <span className="text-2xl">👨‍🏫</span>
                <p>
                  بوابة المعلم مخصصة لكبار السن والمعلمين: أزرار كبيرة، خط واضح، وخياران اثنان فقط:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Teacher Action 1 */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center font-mono">1</span>
                    <h4>تسجيل الحضور اليومي</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    اضغط على زر <strong>[ 1. تحضير الحضور اليومي ]</strong>، اختر فصلك، ثم اضغط على (حاضر 🟢) أو (غائب 🔴) أمام كل طالب، ثم اضغط على الزر الأخضر الكبير أسفل الشاشة لحفظ الكشف.
                  </p>
                </div>

                {/* Teacher Action 2 */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm">
                    <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center font-mono">2</span>
                    <h4>رصد درجات الامتحانات وأعمال السنة</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    اضغط على زر <strong>[ 2. رصد درجات الفصل والامتحانات ]</strong>. يمكنك استخدام <strong>الوضع السريع</strong> لإدخال أعمال السنة (من 40) والامتحان (من 60)، أو الضغط على <strong>[ ⭐ رصد ممتاز للكل ]</strong> بنقرة واحدة ثم حفظ الدرجات.
                  </p>
                </div>

              </div>

              {/* Login Info Helper */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <span className="font-black text-slate-800 dark:text-white block">📌 بيانات دخول المعلم التجريبي:</span>
                <p className="text-slate-600 dark:text-slate-400">
                  رمز المعلم: <strong className="font-mono text-slate-900 dark:text-white">LIB-MATH-01</strong> (أو أي رمز تخصصه لنفسك) | كلمة السر: <strong className="font-mono text-slate-900 dark:text-white">123456</strong>
                </p>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* PARENT GUIDE                                                      */}
          {/* ================================================================= */}
          {selectedRoleGuide === 'parent' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-sm font-bold flex items-center gap-3">
                <span className="text-2xl">👨‍👩‍👧</span>
                <p>
                  بوابة ولي الأمر صممت لتعمل على شاشة الهاتف مباشرة لسهولة المتابعة:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-black text-sm text-purple-700 dark:text-purple-300">متابعة الحضور والغياب اليومي</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    يعرف ولي الأمر فوراً عند تسجيل ابنه غائباً أو متأخراً عبر إشعار فوري وتاريخ مفصل للأيام.
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-black text-sm text-purple-700 dark:text-purple-300">إخطار النتيجة وشهادة التقدير</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    تظهر درجات المواد الثمانية، التقدير (ممتاز / جيد جداً...)، والترتيب على الفصل مع إمكانية تنزيل شهادة رسمية.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* Exit Helper Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              💡 يمكنك فتح هذا الدليل في أي وقت بالضغط على زر "دليل الاستخدام" في أعلى الشاشة.
            </span>
            <button
              type="button"
              onClick={() => { onClose(); sound.playTap(); }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs shadow-md transition active:scale-95"
            >
              فهمت، إغلاق الشرح ✓
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
