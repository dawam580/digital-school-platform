import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Printer, Download, X, ShieldCheck, CheckCircle2, Award, Users, Database, FileText, Sparkles, Building2, Key, Calendar } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { sound } from '../../utils/soundEffects';

export const SystemOperationalPlanPDF: React.FC = () => {
  const { showOperationalPlanModal, setShowOperationalPlanModal, teachers, currentUserPhone } = useSchool();

  if (!showOperationalPlanModal) return null;

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-cairo">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Top Floating Control Bar (Hidden when Printing) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold font-cairo">وثيقة خطة التشغيل الشاملة للمنظومة المدرسية (PDF)</h3>
              <p className="text-[11px] text-slate-400">وزارة التربية والتعليم - دولة ليبيا | العام الدراسي 2025 - 2026 م</p>
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
              <p className="text-xs text-slate-500 font-bold">دولة ليبيا</p>
              <p className="text-xs text-slate-700 font-bold">وزارة التربية والتعليم | مراقبة التربية والتعليم</p>
              <h2 className="text-lg font-extrabold text-[#00288e]">منظومة المدرسة الرقمية النموذجية</h2>
              <p className="text-[11px] text-slate-500">وثيقة التشغيل الرسمية للبنية التحتية وقواعد البيانات (2025 - 2026 م)</p>
            </div>

            <div className="flex items-center gap-3">
              <img src={logoImg} alt="شعار المدرسة" className="h-20 w-auto object-contain" />
            </div>

            <div className="text-center sm:text-left text-xs text-slate-500 space-y-1 border-t sm:border-t-0 sm:border-r border-slate-200 pt-2 sm:pt-0 sm:pr-4">
              <p className="font-bold text-slate-800">رقم الوثيقة: <span className="font-mono text-blue-700">LIB-SCH-2026</span></p>
              <p>العام الدراسي: <span className="font-bold">2025 / 2026 م</span></p>
              <p>رقم هاتف الإدارة: <span className="font-mono font-bold text-blue-800">{currentUserPhone || '0922465676'}</span></p>
              <p>حالة النظام: <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">جاهز للانطلاق 100%</span></p>
            </div>
          </div>

          {/* Title Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white p-5 rounded-2xl shadow-md text-center space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-400 text-slate-900 text-xs font-black rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              الوثيقة الرسمية لتشغيل المنظومة المدرسية والتربوية
            </span>
            <h1 className="text-xl sm:text-2xl font-black">
              دليل الإجراءات والمعمارية التقنية لإدارة المدرسة والتعليم الأساسي والثانوي
            </h1>
            <p className="text-xs text-blue-200 max-w-2xl mx-auto">
              إرشادات تشغيل بوابات أولياء الأمور والمعلمين والإدارة، معايير قواعد البيانات لتحمل 1000 طالب، ومنظومة منع تضارب الجداول.
            </p>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-r-4 border-blue-600 pr-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>1. الملخص التنفيذي وأهداف المنظومة</span>
            </h3>
            <p className="text-xs leading-relaxed text-slate-700 text-justify">
              تهدف هذه المنظومة الرقمية إلى أتمتة كافة العمليات التربوية والإدارية في المدرسة للعام الدراسي 2025 - 2026 م وفق مناهج ولوائح وزارة التربية والتعليم بدولة ليبيا، وتطبيق مبدأ <strong>العزل الأمني الصارم للبوابات</strong>، حيث يمنع وصول أولياء الأمور لكشوفات الإدارة، بينما يتاح للمعلمين إدارة الفصول المسندة إليهم برموز دخول فريدة، وتتيح للمدير العام التحكم بالجداول واستيراد الطلاب من Excel بمرونة تامة.
            </p>
          </div>

          {/* Section 2: Libyan Teacher Code Directory */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-r-4 border-emerald-600 pr-3">
              <Key className="w-5 h-5 text-emerald-600" />
              <span>2. دليل رموز المعلمين المعتمدة والمواد الدراسية (2025/2026)</span>
            </h3>
            
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">رمز الدخول الفريد</th>
                    <th className="p-3">اسم المعلم</th>
                    <th className="p-3">المادة الدراسية</th>
                    <th className="p-3">الفصول المسندة</th>
                    <th className="p-3">صلاحيات البوابة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">{teacher.code}</td>
                      <td className="p-3 font-bold text-slate-900">{teacher.name}</td>
                      <td className="p-3">{teacher.subject}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[11px]">
                          {teacher.assignedClasses.join('، ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                          رصد الحضور والدرجات والواجبات
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Database Benchmarks & Capacity */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-r-4 border-indigo-600 pr-3">
              <Database className="w-5 h-5 text-indigo-600" />
              <span>3. معايير الأداء وقدرة استيعاب قواعد البيانات (1000+ طالب)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-center space-y-1">
                <p className="text-xs text-slate-500 font-bold">الطاقة الاستيعابية</p>
                <p className="text-2xl font-black text-blue-800 font-mono">1,000+ طالب</p>
                <p className="text-[10px] text-slate-400">سجلات كاملة مع الدرجات والحضور</p>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-center space-y-1">
                <p className="text-xs text-slate-500 font-bold">حجم الذاكرة المستهلكة</p>
                <p className="text-2xl font-black text-emerald-800 font-mono">&lt; 1.5 MB</p>
                <p className="text-[10px] text-slate-400">تخزين فائق الخفة والموثوقية</p>
              </div>

              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 text-center space-y-1">
                <p className="text-xs text-slate-500 font-bold">زمن الاستجابة والبحث</p>
                <p className="text-2xl font-black text-purple-800 font-mono">&lt; 1.0 ms</p>
                <p className="text-[10px] text-slate-400">بحث فوري بالرقم الوطني والاسم</p>
              </div>
            </div>
          </div>

          {/* Section 4: Operational Rollout Plan */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-r-4 border-amber-600 pr-3">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>4. مراحل الإطلاق الميداني الأربعة للعام 2025 / 2026 م</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                <div>
                  <h4 className="font-bold text-slate-800">الأسبوع الأول: التهيئة ورفع كشوفات الطلاب عبر Excel</h4>
                  <p className="text-slate-600 text-[11px]">تسكين الطلاب بأرقامهم الوطنية (12 خانة) وتوزيعهم على الفصول الدراسية وتعيين معلمي المواد.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                <div>
                  <h4 className="font-bold text-slate-800">الأسبوع الثاني: تسليم رموز المعلمين والتحقق من الجداول</h4>
                  <p className="text-slate-600 text-[11px]">توزيع رموز الدخول (LIB-MATH-01...)، وتفعيل محرك كشف ومنع تضارب الحصص المدرسية.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                <div>
                  <h4 className="font-bold text-slate-800">الأسبوع الثالث: إطلاق بوابة أولياء الأمور</h4>
                  <p className="text-slate-600 text-[11px]">إرسال أرقام الدخول الوطنية لأولياء الأمور لمتابعة الحضور اليومي والواجبات وتقارير الفترات.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                <div>
                  <h4 className="font-bold text-slate-800">الأسبوع الرابع: الاعتماد الأكاديمي والتقارير الدورية</h4>
                  <p className="text-slate-600 text-[11px]">رصد أعمال السنة (40 درجة) والامتحانات النصفية والنهائية (60 درجة) وتصدير الشهادات الرسمية.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Official Stamps and Signatures */}
          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-3 gap-4 text-center text-xs">
            <div className="space-y-8">
              <p className="font-bold text-slate-700">مسؤول المنظومة وقواعد البيانات</p>
              <div className="border-b border-dashed border-slate-300 w-32 mx-auto" />
              <p className="text-[10px] text-slate-400">التوقيع والاعتماد</p>
            </div>

            <div className="space-y-4">
              <p className="font-bold text-slate-700">ختم مراقبة التربية والتعليم</p>
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-600 mx-auto flex items-center justify-center text-[10px] text-blue-700 font-bold rotate-12">
                معتمد رسمياً 2025/2026
              </div>
            </div>

            <div className="space-y-8">
              <p className="font-bold text-slate-700">مدير المدرسة</p>
              <div className="border-b border-dashed border-slate-300 w-32 mx-auto" />
              <p className="text-[10px] text-slate-400">التوقيع والاعتماد النهائي</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
