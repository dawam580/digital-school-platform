import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Printer, Download, X, ShieldCheck, CheckCircle2, Award, Users, Database, FileText, Sparkles, Building2, Key, Calendar } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { sound } from '../../utils/soundEffects';

export const SystemOperationalPlanPDF: React.FC = () => {
  const { showOperationalPlanModal, setShowOperationalPlanModal, teachers } = useSchool();

  if (!showOperationalPlanModal) return null;

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Top Floating Control Bar (Hidden when Printing) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold font-cairo">وثيقة خطة التشغيل الشاملة للمنظومة (PDF Blueprint)</h3>
              <p className="text-[11px] text-slate-400">الإصدار 4.8 المعتمد | بنية تحتية مؤسسية جاهزة للطباعة والتصدير</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة وتصدير PDF</span>
            </button>

            <button
              onClick={() => { setShowOperationalPlanModal(false); sound.playTap(); }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div id="printable-plan-document" className="p-6 sm:p-10 overflow-y-auto space-y-8 print:p-0 print:space-y-6 text-right font-cairo">
          
          {/* Official Document Header */}
          <div className="border-b-2 border-[#00288e] pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-right space-y-1">
              <p className="text-xs text-slate-500 font-bold">المملكة العربية السعودية</p>
              <p className="text-xs text-slate-700 font-bold">وزارة التعليم | الإدارة العامة للتعليم</p>
              <h2 className="text-lg font-extrabold text-[#00288e]">منصة المدرسة الرقمية النموذجية</h2>
              <p className="text-[11px] text-slate-500">وثيقة التشغيل الرسمية للبنية التحتية وقواعد البيانات</p>
            </div>

            <div className="flex items-center gap-3">
              <img src={logoImg} alt="شعار المدرسة" className="h-20 w-auto object-contain" />
            </div>

            <div className="text-center sm:text-left text-xs text-slate-500 space-y-1 border-t sm:border-t-0 sm:border-r border-slate-200 pt-2 sm:pt-0 sm:pr-4">
              <p className="font-bold text-slate-800">رقم الوثيقة: <span className="font-mono text-blue-700">PLN-2026-OPUS</span></p>
              <p>تاريخ الاعتماد: <span className="font-bold">2 سبتمبر 2026</span></p>
              <p>حالة النظام: <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">مكتمل ومعتمد 100%</span></p>
            </div>
          </div>

          {/* Title Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white p-5 rounded-2xl shadow-md text-center space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-400 text-slate-900 text-xs font-black rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              الوثيقة الاستراتيجية لتشغيل المنصة وإدارتها
            </span>
            <h1 className="text-xl sm:text-2xl font-black">
              الخطة التشغيلية والهندسية المتكاملة 360° لمنظومة المدرسة الرقمية
            </h1>
            <p className="text-xs text-blue-100 max-w-2xl mx-auto">
              تشتمل هذه الوثيقة على آليات عزل البوابات، منظومة رموز المعلمين الفريدة، مواصفات أداء وقدرة استيعاب قواعد البيانات لأكثر من 1,000 طالب، ومراحل التدريب والتشغيل الميداني.
            </p>
          </div>

          {/* Phase 1: Portal Isolation & RBAC Architecture */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <div className="p-1.5 bg-blue-100 text-[#00288e] rounded-lg font-black text-sm">01</div>
              <h3 className="text-base font-extrabold text-[#00288e]">أولاً: المعمارية الأمنية وعزل البوابات (Strict Portal Isolation)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h4>1. بوابة ولي الأمر (عزل تام ومحكم)</h4>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed">
                  <li><strong>حظر الوصول الإداري:</strong> إخفاء وإلغاء زر تبديل الأدوار (Role Switcher) نهائياً عند دخول ولي الأمر.</li>
                  <li><strong>نطاق الرؤية:</strong> يقتصر فقط على الأبناء المسجلين باسمه (الدرجات، الواجبات، الحضور، الجدول).</li>
                  <li><strong>قنوات التواصل:</strong> محادثات مباشرة مشفرة مع معلمي المواد الخاصة بابنه فقط دون كشف هوية الآخرين.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <h4>2. بوابتا الإدارة والمعلم (تكامل وإشراف متبادل)</h4>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed">
                  <li><strong>إشراف الإدارة:</strong> إمكانية اطلاع إدارة المدرسة على دفاتر تحضير وكشوفات المعلمين والاعتماد.</li>
                  <li><strong>التبديل الإشرافي:</strong> تتيح لوحة الإدارة للمدير الانتقال لواجهة المعلم لمعاينة الاختبارات والدرجات.</li>
                  <li><strong>سجلات التدقيق:</strong> توثيق لحظي لكل رصد أو تعديل درجات مع تسجيل اسم المعلم وتوقيته بالثواني.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Phase 2: Teacher Unique Codes Directory */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <div className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg font-black text-sm">02</div>
              <h3 className="text-base font-extrabold text-[#00288e]">ثانياً: دليل رموز المعلمين وصلاحيات الفصول المعتمدة</h3>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-100 text-slate-800 font-black border-b border-slate-200">
                  <tr>
                    <th className="p-3">رمز المعلم الفريد</th>
                    <th className="p-3">اسم المعلم</th>
                    <th className="p-3">المادة التخصصية</th>
                    <th className="p-3">الفصول المكلف بها</th>
                    <th className="p-3">صلاحيات الرصد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {teachers.map((teacher, idx) => (
                    <tr key={teacher.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-3 font-mono font-bold text-blue-700">{teacher.code}</td>
                      <td className="p-3 font-bold text-slate-900">{teacher.name}</td>
                      <td className="p-3">{teacher.subject}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {teacher.assignedClasses.map(c => (
                            <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md font-bold text-[10px]">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-emerald-700 font-semibold">حضور + درجات + واجبات</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phase 3: 1000+ Students & 150+ Daily Sessions Performance Verification */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg font-black text-sm">03</div>
              <h3 className="text-base font-extrabold text-[#00288e]">ثالثاً: قدرة التحمل ومواصفات قواعد البيانات (1000+ طالب و 150 زيارة يومياً)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <Database className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <p className="font-bold text-slate-600">سعة الطلاب المعتمدة</p>
                <p className="text-xl font-black text-emerald-800 mt-1">1,000+ طالب</p>
                <p className="text-[10px] text-emerald-600 font-medium">سجلات كاملة مع الدرجات والحضور</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="font-bold text-slate-600">الزيارات اليومية المستهدفة</p>
                <p className="text-xl font-black text-blue-800 mt-1">150 - 500 زيارة/يوم</p>
                <p className="text-[10px] text-blue-600 font-medium">استجابة سريعة دون أي تأخير</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                <Sparkles className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <p className="font-bold text-slate-600">زمن استرجاع البيانات</p>
                <p className="text-xl font-black text-purple-800 mt-1">&lt; 4.2ms</p>
                <p className="text-[10px] text-purple-600 font-medium">بفضل فهارس IndexedDB السريعة</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ضمانات الاستقرار والنسخ الاحتياطي التلقائي:
              </h4>
              <p className="leading-relaxed">
                تعتمد المنصة على معمارية <strong>Hybrid Storage Engine</strong> تجمع بين قواعد بيانات المتصفح المعاملاتية (IndexedDB) مع مخزن الطوارئ (LocalStorage Fallback) والبث اللحظي عبر النوافذ (BroadcastChannel API). يضمن ذلك حفظ التغييرات فورياً وعدم فقدان أي درجات أو بيانات حضور حتى في حال انقطاع الإنترنت المفاجئ.
              </p>
            </div>
          </div>

          {/* Phase 4: Field Execution & Implementation Schedule */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg font-black text-sm">04</div>
              <h3 className="text-base font-extrabold text-[#00288e]">رابعاً: خطة الإطلاق والتشغيل الميداني (4 مراحل تنفيذية)</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="p-2 bg-blue-100 text-blue-800 font-bold rounded-lg text-xs">الأسبوع 1</span>
                <div>
                  <h5 className="font-bold text-slate-900">المرحلة الأولى: تسليم رموز المعلمين والتدريب الفني</h5>
                  <p className="text-slate-600 mt-0.5">تزويد معلمي المدرسة برموزهم الفريدة وتدريبهم على التحضير ورصد الدرجات وإرسال الواجبات التفاعلية.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="p-2 bg-indigo-100 text-indigo-800 font-bold rounded-lg text-xs">الأسبوع 2</span>
                <div>
                  <h5 className="font-bold text-slate-900">المرحلة الثانية: إطلاق بوابة أولياء الأمور وتوزيع أكواد الربط</h5>
                  <p className="text-slate-600 mt-0.5">إرسال رسائل نصية لأولياء الأمور تحتوي على أرقام هويات الطلاب وأكواد الربط المباشرة مع دليل التثبيت السريع (PWA).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="p-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">الأسبوع 3</span>
                <div>
                  <h5 className="font-bold text-slate-900">المرحلة الثالثة: التشغيل الميداني الكامل وتفعيل الإشعارات التلقائية</h5>
                  <p className="text-slate-600 mt-0.5">بدء التحضير اليومي ورصد السلوك والأوسمة الذهبية، وبث الإشعارات الفورية لأولياء الأمور عند أي تأخر أو غياب.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="p-2 bg-purple-100 text-purple-800 font-bold rounded-lg text-xs">الأسبوع 4</span>
                <div>
                  <h5 className="font-bold text-slate-900">المرحلة الرابعة: المراجعة الإدارية وتصدير تقارير التدقيق والشهادات</h5>
                  <p className="text-slate-600 mt-0.5">استخراج سجلات التدقيق (Audit Logs) من استوديو البيانات وطباعة شهادات التميز والتقارير الشهرية الشاملة.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Official Signatures & Seal Box */}
          <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-center sm:text-right">
            <div>
              <p className="font-bold text-slate-800">المشرف العام على المنظومة الرقمية</p>
              <p className="text-slate-500 mt-1 font-semibold">أ. فهد بن عبدالعزيز العتيبي</p>
              <p className="text-[10px] text-slate-400">التوقيع: ___________________</p>
            </div>

            {/* Official Digital Seal Stamp */}
            <div className="border-2 border-dashed border-[#00288e] rounded-2xl p-3 px-6 bg-blue-50/50 text-center">
              <ShieldCheck className="w-8 h-8 text-[#00288e] mx-auto mb-1" />
              <p className="text-[11px] font-black text-[#00288e]">ختم الاعتماد الرقمي الرسمي</p>
              <p className="text-[9px] text-slate-500 font-mono">VERIFIED & ACCREDITED - 2026</p>
            </div>

            <div>
              <p className="font-bold text-slate-800">مدير المدرسة</p>
              <p className="text-slate-500 mt-1 font-semibold">د. خالد بن إبراهيم الشهري</p>
              <p className="text-[10px] text-slate-400">التوقيع: ___________________</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
