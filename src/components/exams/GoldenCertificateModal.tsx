import React from 'react';
import { Award, Printer, X, Sparkles, Star } from 'lucide-react';
import { Student } from '../../types';
import { sound } from '../../utils/soundEffects';
import { StudentFullExamReport } from '../../services/exams/libyanExamEngine';

interface GoldenCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  report: StudentFullExamReport;
  schoolName: string;
  directorName: string;
}

export const GoldenCertificateModal: React.FC<GoldenCertificateModalProps> = ({
  isOpen,
  onClose,
  student,
  report,
  schoolName,
  directorName
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-cairo">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border-4 border-amber-400 text-right">
        
        {/* Floating Top Header (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-200" />
            <h3 className="font-black text-sm sm:text-base">شهادة التفوق والتميز الذهبية 🏆</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-white text-amber-900 font-black rounded-xl text-xs flex items-center gap-1.5 hover:bg-amber-50 transition shadow-md"
            >
              <Printer className="w-4 h-4 text-amber-700" />
              <span>طباعة الشهادة</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div className="p-8 sm:p-14 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 text-center space-y-6 relative overflow-hidden print:p-8">
          
          {/* Ornamental Background Borders */}
          <div className="absolute inset-3 border-4 border-amber-500/60 rounded-3xl pointer-events-none" />
          <div className="absolute inset-5 border border-dashed border-amber-400 rounded-2xl pointer-events-none" />

          {/* Top Emblem */}
          <div className="space-y-1 relative z-10">
            <div className="text-xs font-bold text-slate-600">دولة ليبيا • وزارة التربية والتعليم</div>
            <div className="text-xs font-black text-amber-800">{schoolName}</div>
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-white flex items-center justify-center text-2xl shadow-lg border-2 border-white mt-2">
              🏆
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-amber-900 tracking-wide mt-2">
              شهادة تقدير وتفوق دراسي
            </h1>
            <p className="text-xs text-amber-700 font-bold">للعام الدراسي 2025 - 2026 م</p>
          </div>

          {/* Body Text */}
          <div className="space-y-4 max-w-lg mx-auto relative z-10 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>
              تتشرف إدارة مدرسة <strong className="text-slate-900">{schoolName}</strong> بأن تمنح هذه الشهادة للطالب / الطالبة:
            </p>

            <div className="py-2 px-6 bg-gradient-to-r from-amber-100/80 via-yellow-100/90 to-amber-100/80 rounded-2xl border border-amber-300 inline-block shadow-sm">
              <span className="text-xl sm:text-2xl font-black text-amber-950 font-serif">
                {student.name}
              </span>
            </div>

            <p>
              المقيد بالصف <strong className="text-slate-900 font-black">{student.className}</strong> برقم قيد (<strong className="font-mono text-slate-900">{student.nationalNumber}</strong>)، وذلك تقديراً لتفوقه العلمي الباهر وحصوله على:
            </p>

            {/* GPA and Rank Highlight Box */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-white rounded-2xl border-2 border-amber-300 shadow-sm max-w-md mx-auto">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">المعدل العام</span>
                <span className="text-lg font-black text-amber-700 font-mono">{report.percentage}%</span>
              </div>
              <div className="border-x border-amber-200">
                <span className="text-[10px] text-slate-500 font-bold block">التقدير</span>
                <span className="text-lg font-black text-amber-900">{report.generalAppreciation}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">الترتيب على الفصل</span>
                <span className="text-lg font-black text-emerald-700 font-mono">المرتبة ({report.rank})</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              متمنين له دوام التوفيق والنجاح والريادة في مسيرته العلمية لخدمة وطنه وأمته.
            </p>
          </div>

          {/* Footer Signatures and Golden Seal */}
          <div className="pt-6 border-t border-amber-200 flex items-center justify-between text-xs text-slate-800 relative z-10 px-4 sm:px-12">
            <div className="space-y-1 text-center">
              <span className="text-slate-500 block text-[11px] font-bold">منسق شؤون الامتحانات</span>
              <div className="font-serif italic font-bold text-slate-800">أ. منسق الامتحانات</div>
            </div>

            {/* Gold Seal Graphic */}
            <div className="w-20 h-20 rounded-full border-4 border-amber-500 bg-amber-100 flex flex-col items-center justify-center p-1 shadow-md rotate-[-10deg]">
              <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span className="text-[8px] font-black text-amber-900 mt-0.5">وسام التميز</span>
              <span className="text-[7px] font-mono text-amber-700">EXCELLENCE</span>
            </div>

            <div className="space-y-1 text-center">
              <span className="text-slate-500 block text-[11px] font-bold">مدير المدرسة</span>
              <div className="font-serif italic font-bold text-slate-900">{directorName || 'أ. فتحي الشريف'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
