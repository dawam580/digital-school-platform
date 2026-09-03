import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import {
  LibyanExamEngine,
  StudentFullExamReport
} from '../../services/exams/libyanExamEngine';
import {
  Printer,
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Calendar,
  Building2
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface PrintableStudentGradeCardProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  rank?: number;
}

export const PrintableStudentGradeCard: React.FC<PrintableStudentGradeCardProps> = ({
  isOpen,
  onClose,
  student,
  rank = 1
}) => {
  const { schoolProfile } = useSchool();

  if (!isOpen || !student) return null;

  const report: StudentFullExamReport = {
    ...LibyanExamEngine.calculateStudentExamReport(student),
    rank
  };

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm font-cairo text-right animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-300 my-auto">
        
        {/* Screen Controls Header (Hidden during Print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <div>
              <h3 className="text-sm font-black">بطاقة إخطار نتيجة الطالب (معتمدة رسمياً)</h3>
              <p className="text-[11px] text-slate-400">جاهزة للطباعة بالحجم القياسي A4 أو الحفظ كملف PDF</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition active:scale-95 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة البطاقة الرسمية (A4 / PDF) 🖨️</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-6 sm:p-10 bg-white text-slate-900 space-y-6 print:p-4 print:space-y-4 font-cairo">
          
          {/* Top Ministerial Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="text-right space-y-0.5">
              <h3 className="text-xs font-black text-slate-800">دولة ليبيا</h3>
              <h3 className="text-xs font-black text-slate-800">وزارة التربية والتعليم</h3>
              <p className="text-[11px] text-slate-600 font-bold">{schoolProfile.district}</p>
              <p className="text-[11px] text-slate-700 font-black">{schoolProfile.name}</p>
            </div>

            <div className="text-center space-y-1">
              <div className="w-14 h-14 mx-auto border-2 border-slate-900 rounded-full flex items-center justify-center text-2xl shadow-sm">
                🇱🇾
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 underline underline-offset-4">
                بطاقة إخطار بنتيجة تلميذ
              </h2>
              <p className="text-[11px] font-bold text-slate-600">
                مرحلة التعليم الأساسي • العام الدراسي {schoolProfile.academicYear}
              </p>
            </div>

            <div className="text-left space-y-0.5 text-[11px] font-mono font-bold text-slate-700">
              <p>رقم القيد: {student.studentNumber || '2025-0101'}</p>
              <p>تاريخ الإصدار: {new Date().toLocaleDateString('ar-LY')}</p>
              <p className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-sans inline-block mt-1">
                منظومة معتمدة
              </p>
            </div>
          </div>

          {/* Student Info Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-300 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">اسم التلميذ الرباعي:</span>
              <span className="font-black text-slate-900 text-sm">{student.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">الرقم الوطني:</span>
              <span className="font-mono font-black text-slate-900">{student.nationalNumber || student.nationalId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">الصف والفصل:</span>
              <span className="font-black text-blue-900">{student.className || student.grade}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">اسم الأم:</span>
              <span className="font-black text-slate-900">{student.motherName || '-'}</span>
            </div>
          </div>

          {/* Subjects and Grades Table */}
          <div className="border border-slate-400 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-900 font-black border-b border-slate-400">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">المادة الدراسية</th>
                  <th className="py-2.5 px-2 text-center">النهاية الكبرى</th>
                  <th className="py-2.5 px-2 text-center">النهاية الصغرى</th>
                  <th className="py-2.5 px-2 text-center">أعمال السنة</th>
                  <th className="py-2.5 px-2 text-center">ورقة الامتحان</th>
                  <th className="py-2.5 px-3 text-center bg-slate-200">المجموع النهائي</th>
                  <th className="py-2.5 px-3 text-center">التقدير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-bold">
                {report.results.map((sub, i) => (
                  <tr key={sub.subjectCode} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{i + 1}</td>
                    <td className="py-2 px-3 font-black text-slate-900">{sub.subjectName}</td>
                    <td className="py-2 px-2 text-center font-mono">{sub.maxScore}</td>
                    <td className="py-2 px-2 text-center font-mono text-slate-600">{sub.minScore}</td>
                    <td className="py-2 px-2 text-center font-mono">{sub.courseworkScore}</td>
                    <td className="py-2 px-2 text-center font-mono">{sub.examScore}</td>
                    <td className={`py-2 px-3 text-center font-mono font-black text-sm bg-slate-100 ${
                      sub.isPassed ? 'text-slate-900' : 'text-rose-600 underline'
                    }`}>
                      {sub.totalScore}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                        sub.isPassed
                          ? 'text-emerald-800 bg-emerald-50'
                          : 'text-rose-800 bg-rose-50'
                      }`}>
                        {sub.appreciation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-black">
                <tr>
                  <td colSpan={2} className="py-2.5 px-3 text-right">المجموع الكلي العام:</td>
                  <td className="py-2.5 px-2 text-center font-mono">{report.totalMaxScore}</td>
                  <td className="py-2.5 px-2 text-center font-mono">{report.totalMaxScore / 2}</td>
                  <td colSpan={2} className="py-2.5 px-2 text-center text-slate-500 text-[11px]">
                    النسبة المئوية العامة:
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-base text-blue-900 bg-blue-50">
                    {report.totalEarnedScore} ({report.percentage}%)
                  </td>
                  <td className="py-2.5 px-3 text-center text-emerald-800 font-black">
                    {report.generalAppreciation}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Academic Decision & Status Banner */}
          <div className="p-4 rounded-2xl border-2 border-slate-900 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500">قرار لجنة الامتحانات والتقويم:</span>
              <div className="text-base font-black text-slate-900">
                {report.statusLabel}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-[10px] text-slate-500 block">الترتيب على الفصل:</span>
                <span className="text-lg font-black font-mono text-blue-900 bg-white px-3 py-1 rounded-xl border border-slate-300">
                  المركز ({report.rank})
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-500 block">التقدير العام:</span>
                <span className="text-lg font-black text-emerald-800 bg-white px-3 py-1 rounded-xl border border-slate-300">
                  {report.generalAppreciation}
                </span>
              </div>
            </div>
          </div>

          {/* Official Signatures Block */}
          <div className="pt-6 grid grid-cols-4 gap-4 text-center text-xs text-slate-800 font-bold border-t border-slate-300">
            <div className="space-y-6">
              <span>رائد الفصل</span>
              <div className="h-8 border-b border-dashed border-slate-400"></div>
            </div>

            <div className="space-y-6">
              <span>رئيس لجنة الامتحانات</span>
              <div className="h-8 border-b border-dashed border-slate-400"></div>
            </div>

            <div className="space-y-6">
              <span>مدير المدرسة والختم</span>
              <div className="h-8 border-b border-dashed border-slate-400 font-black text-slate-900">
                {schoolProfile.directorName}
              </div>
            </div>

            <div className="space-y-6">
              <span>توقيع ولي الأمر بالعلم</span>
              <div className="h-8 border-b border-dashed border-slate-400"></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
