import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Building2,
  Award,
  GraduationCap,
  Users,
  HeartHandshake,
  Sparkles,
  Printer,
  Search,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface ComprehensiveSystemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComprehensiveSystemGuideModal: React.FC<ComprehensiveSystemGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState<string>('director');

  if (!isOpen) return null;

  const sections = [
    { id: 'director', label: '1. دليل مدير المدرسة', icon: <Building2 className="w-4 h-4" /> },
    { id: 'exams', label: '2. دليل منسق الامتحانات', icon: <Award className="w-4 h-4" /> },
    { id: 'counselor', label: '3. دليل الأخصائي الاجتماعي', icon: <HeartHandshake className="w-4 h-4" /> },
    { id: 'teacher', label: '4. دليل المعلم', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'parent', label: '5. دليل ولي الأمر', icon: <Users className="w-4 h-4" /> },
    { id: 'ai', label: '6. دليل الذكاء الاصطناعي وPDF', icon: <Sparkles className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-cairo">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-2xl border border-white/20 shrink-0">
              📚
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                دليل المنظومة الشامل من الألف إلى الياء (دليل المستخدم الليبي)
              </h2>
              <p className="text-xs text-blue-200/80 mt-0.5">
                شرح توضيحي ومبسط لكافة الأدوار المدرسية وفق لائحة وزارة التربية والتعليم رقم (1013)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { sound.playTap(); window.print(); }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-bold flex items-center gap-1.5"
              title="طباعة الدليل A4"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">طباعة الدليل</span>
            </button>

            <button
              onClick={() => { onClose(); sound.playTap(); }}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Tabs (Large & High Legibility) */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 overflow-x-auto shrink-0">
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => { setActiveSection(sec.id); sound.playTap(); }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
                activeSection === sec.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              {sec.icon}
              <span>{sec.label}</span>
            </button>
          ))}
        </div>

        {/* Guide Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm leading-relaxed">
          
          {/* SECTION 1: Director Guide */}
          {activeSection === 'director' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <h3 className="font-black text-base text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-2">
                  <span>🏛️</span>
                  <span>دور مدير المدرسة في المنظومة:</span>
                </h3>
                <p className="text-xs text-blue-800/80 dark:text-blue-300/80">
                  لوحة تحكم هادئة ومبسطة مصممة خصيصاً لتناسب القيادة التربوية دون إغراق المدير في تفاصيل الحسابات المعقدة.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs flex items-center justify-center">1</span>
                    <span>كشف الطلاب والحضور اليومي:</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    تستطيع من خلال الشاشة الرئيسية استعراض كشف الطلاب الـ 873 طالباً، والبحث بالاسم أو رقم القيد. وتسجيل الحضور والغياب بنقرة زر واحدة.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs flex items-center justify-center">2</span>
                    <span>إدارة كشف المعلمين ونصاب الحصص المالي:</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    متابعة نصاب كل معلم (12 إلى 18 حصة وفق القرار الوزاري 560 لسنة 2024م)، مع رقم الملف المالي في منظومة الشاطئ وتاريخ التعيين، وطباعة كشف المعلمين A4 بضغطة زر.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs flex items-center justify-center">3</span>
                    <span>توزيع روابط البوابات لدعوة المعلمين وأولياء الأمور:</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    اضغط على زر <strong>`✉️ رسالة دعوة المدراء والروابط`</strong> في أعلى الشاشة لنسخ رسالة رسمية جاهزة للمشاركة على واتساب تتضمن الروابط المعزولة لكل فئة.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Exam Coordinator Guide */}
          {activeSection === 'exams' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <h3 className="font-black text-base text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-2">
                  <span>📜</span>
                  <span>دور منسق الامتحانات والتقويم (رئيس لجنة الكنترول):</span>
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                  بوابة متخصصة ومستقلة لإدارة شيت الكنترول المركزي (مجموع 1120 درجة للتعليم الأساسي) طبقاً للائحة رقم (1013) لسنة 2022م.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-mono text-xs flex items-center justify-center">1</span>
                    <span>شيت الكنترول المركزي المعتمد:</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    حساب آلي فوري لدرجات المواد الثمانية: عربي (240)، رياضيات (200)، علوم (160)، إنجليزي (160)، إسلامية (120)، تاريخ (80)، جغرافيا (80)، وحاسوب (80)، وإظهار الترتيب والنسبة المئوية تلقائياً بدون آلة حاسبة.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-mono text-xs flex items-center justify-center">2</span>
                    <span>كشوفات المناداة وأرقام الجلوس:</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    توليد أرقام جلوس لكل تلميذ وطباعة كشف المناداة A4 لتوزيعه على لجان المراقبة.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-mono text-xs flex items-center justify-center">3</span>
                    <span>إقفال الكنترول وطباعة بطاقات الدرجات والشهادات A4:</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    عند انتهاء الرصد، اضغط على زر <strong>`اعتماد النتيجة وقفل الكنترول`</strong> ليتم إقفال النتيجة رسميّاً ومنع أي تعديل، واستخراج بطاقات الدرجات الرسمية المعتمدة بختم المدرسة.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Social Counselor Guide */}
          {activeSection === 'counselor' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                <h3 className="font-black text-base text-teal-900 dark:text-teal-200 mb-1 flex items-center gap-2">
                  <span>🤝</span>
                  <span>دور الأخصائي الاجتماعي (الخدمة الاجتماعية والصحة المدرسية):</span>
                </h3>
                <p className="text-xs text-teal-800/80 dark:text-teal-300/80">
                  مكتب مخصص لمعالجة التأخر الدراسي، مواجهة الغياب المتكرر، والرعاية النفسية والاجتماعية للتلاميذ.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white">✓ دراسة الحالات الفردية:</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    فتح ملف سري لكل حالة تتطلب الرعاية، وتدوين الملاحظات والمتابعات الدورية.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white">✓ بطاقات استدعاء ولي الأمر التلقائية:</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    عند تجاوز التلميذ لعدد محدد من أيام الغياب أو المخالفات، تصدر المنظومة بطاقة استدعاء رسمية ومختومة لولي الأمر.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Teacher Guide */}
          {activeSection === 'teacher' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <h3 className="font-black text-base text-emerald-900 dark:text-emerald-200 mb-1 flex items-center gap-2">
                  <span>👨‍🏫</span>
                  <span>دور المعلم في المنظومة:</span>
                </h3>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                  واجهة سريعة مجهزة للدخول بالرمز الفريد (مثل LIB-MATH-01) لمتابعة الحصص ورصد أعمال السنة.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white">✓ رصد درجات أعمال السنة:</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    رصد درجات كراسة الحصة، الواجبات المنزلية، الاختبارات الشفوية والتحريرية لفصوله المسندة فقط.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white">✓ جدول الحصص الخاص:</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    استعراض مواعيد الحصص اليومية وقاعات التدريس بدون أي تضارب مع معلمين آخرين.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: Parent Guide */}
          {activeSection === 'parent' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <h3 className="font-black text-base text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-2">
                  <span>👨‍👩‍👧</span>
                  <span>بوابة ولي الأمر (أمان وعزل تام):</span>
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                  بوابة مخصصة تضمن رؤية الأب لبيانات أبنائه فقط دون أي وصول لبيانات طلاب آخرين أو لوحة المدير.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white">✓ الدخول برمز التلميذ:</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    يدخل ولي الأمر برمز الطالب المكون من 4 أرقام أو بالرقم الوطني المسجل في المنظومة.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white">✓ متابعة الحضور والنتائج الفورية:</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    الاطلاع على حضور اليوم، كشف الدرجات المفصل، والشهادة الفصلية المعتمدة والتواصل مع المعلمين.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: AI & PDF Guide */}
          {activeSection === 'ai' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                <h3 className="font-black text-base text-purple-900 dark:text-purple-200 mb-1 flex items-center gap-2">
                  <span>🤖</span>
                  <span>محرك الذكاء الاصطناعي السحابي (OpenAI GPT-4o):</span>
                </h3>
                <p className="text-xs text-purple-800/80 dark:text-purple-300/80">
                  استيراد وتصحيح كشوفات الـ PDF الصادرة من المركز الوطني للامتحانات بدقة متناهية والتخلص من كوارث الحروف المعكوسة.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white">✓ دقة أرقام القيد وتواريخ الميلاد:</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    يقوم الذكاء الاصطناعي باستخراج رقم القيد الوزاري (7 خانات)، وتاريخ الميلاد وتوليد الرقم الوطني الليبي الدقيق (12 خانة).
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white">✓ إزالة أسماء الأمهات الوهمية:</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    نظراً لأن كشوفات المركز الوطني للامتحانات لا تتضمن عمود لاسم الأم، يقوم الذكاء الاصطناعي بضبطه تلقائياً كـ (—) لمنع أي تضليل أو اختلاق بيانات غير صحيحة.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            وزارة التربية والتعليم • دولة ليبيا • منظومة الإدارة المدرسية الرقمية
          </span>
          <button
            onClick={() => { onClose(); sound.playTap(); }}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition"
          >
            إغلاق الدليل
          </button>
        </div>

      </div>
    </div>
  );
};
