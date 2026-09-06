import React, { useState } from 'react';
import {
  Printer,
  X,
  Award,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Building2,
  Layers,
  FileCheck
} from 'lucide-react';
import { Student } from '../../types';
import { sound } from '../../utils/soundEffects';
import { StudentFullExamReport } from '../../services/exams/libyanExamEngine';

interface OfficialReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  report: StudentFullExamReport;
  allClassReports?: StudentFullExamReport[];
  schoolName: string;
  directorName: string;
}

export const OfficialReportCardModal: React.FC<OfficialReportCardModalProps> = ({
  isOpen,
  onClose,
  student,
  report: initialReport,
  allClassReports = [],
  schoolName,
  directorName
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(() => {
    const found = allClassReports.findIndex(r => r.studentId === initialReport.studentId);
    return found >= 0 ? found : 0;
  });

  const [isBatchMode, setIsBatchMode] = useState(false);

  if (!isOpen) return null;

  const currentReport = allClassReports.length > 0 && allClassReports[currentIdx]
    ? allClassReports[currentIdx]
    : initialReport;

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  const handleNext = () => {
    if (currentIdx < allClassReports.length - 1) {
      sound.playTap();
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      sound.playTap();
      setCurrentIdx(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-cairo">
      {/* Dynamic Print Styles for Single & Batch A4 Pages */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 10mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .a4-page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
          .print-card-container {
            box-shadow: none !important;
            border: none !important;
            max-height: none !important;
            overflow: visible !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] text-right border border-slate-200 print-card-container">
        
        {/* Top Floating Controls (Hidden when printing) */}
        <div className="print:hidden flex flex-wrap items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white shrink-0 gap-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
                <span>كشف إخطار درجات فصلي معتمد (الوثيقة الرسمية)</span>
                {isBatchMode && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono">
                    دفعة مجمعة ({allClassReports.length} طالب)
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-emerald-300/80">
                مطابق للمقاييس الرسمية لوزارة التربية والتعليم والمركز الوطني للامتحانات بدولة ليبيا
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Batch / Single Mode */}
            {allClassReports.length > 1 && (
              <div className="flex items-center bg-white/10 p-1 rounded-2xl text-xs font-bold border border-white/10">
                <button
                  type="button"
                  onClick={() => { setIsBatchMode(false); sound.playTap(); }}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    !isBatchMode ? 'bg-white text-slate-950 shadow-md font-black' : 'text-white/70 hover:text-white'
                  }`}
                >
                  بطاقة فردية
                </button>
                <button
                  type="button"
                  onClick={() => { setIsBatchMode(true); sound.playTap(); }}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                    isBatchMode ? 'bg-emerald-500 text-white shadow-md font-black' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>طباعة الفصل كاملاً ({allClassReports.length})</span>
                </button>
              </div>
            )}

            {/* Individual Navigation (Only in Single Mode) */}
            {!isBatchMode && allClassReports.length > 1 && (
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="p-1.5 rounded-xl hover:bg-white/20 disabled:opacity-30 transition"
                  title="الطالب السابق"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono text-emerald-300">
                  {currentIdx + 1} / {allClassReports.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIdx === allClassReports.length - 1}
                  className="p-1.5 rounded-xl hover:bg-white/20 disabled:opacity-30 transition"
                  title="الطالب التالي"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 shadow-lg shadow-emerald-900/40"
            >
              <Printer className="w-4 h-4" />
              <span>
                {isBatchMode ? `طباعة الفصل كاملاً (${allClassReports.length} ورقة A4)` : 'طباعة A4'}
              </span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Batch Mode Explanatory Notice (Hidden in Print) */}
        {isBatchMode && (
          <div className="print:hidden px-6 py-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <p>
                <strong>وضع الطباعة المجمعة نشط:</strong> سيتم طباعة جميع بطاقات درجات طلاب فصل ({allClassReports[0]?.className}) البالغ عددهم ({allClassReports.length}) طالباً، مع فصل كل طالب في ورقة A4 مستقلة تلقائياً.
              </p>
            </div>
            <span className="font-mono text-xs font-black bg-emerald-200 px-2 py-0.5 rounded-md">
              {allClassReports.length} صفحات
            </span>
          </div>
        )}

        {/* Printable Area */}
        <div className="overflow-y-auto print:overflow-visible flex-1">
          {isBatchMode ? (
            // Render all students in batch mode
            allClassReports.map((reportItem, idx) => (
              <div
                key={reportItem.studentId || idx}
                className={idx < allClassReports.length - 1 ? 'a4-page-break' : ''}
              >
                <div className="p-8 sm:p-12 print:p-0">
                  <ReportCardPaperContent
                    report={reportItem}
                    schoolName={schoolName}
                    directorName={directorName}
                  />
                </div>
              </div>
            ))
          ) : (
            // Render single student
            <div className="p-8 sm:p-12 print:p-0">
              <ReportCardPaperContent
                report={currentReport}
                schoolName={schoolName}
                directorName={directorName}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable A4 Document Content
interface ReportCardPaperContentProps {
  report: StudentFullExamReport;
  schoolName: string;
  directorName: string;
}

const ReportCardPaperContent: React.FC<ReportCardPaperContentProps> = ({
  report,
  schoolName,
  directorName
}) => {
  return (
    <div className="space-y-6 bg-white text-slate-900 print:text-black">
      {/* Header of Libyan Ministry of Education */}
      <div className="border-b-2 border-slate-900 pb-4 space-y-2">
        <div className="flex items-center justify-between text-center">
          <div className="text-right space-y-0.5 text-xs font-bold text-slate-700">
            <div>دولة ليبيا</div>
            <div>وزارة التربية والتعليم</div>
            <div>المركز الوطني للامتحانات</div>
            <div>مراقبة التربية والتعليم - توكرة</div>
          </div>

          {/* Republic Emblem */}
          <div className="text-center space-y-1">
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-slate-900 flex items-center justify-center font-serif text-2xl font-black">
              🇱🇾
            </div>
            <div className="text-[10px] font-bold text-slate-500">شعار الجمهورية</div>
          </div>

          <div className="text-left space-y-0.5 text-xs font-bold text-slate-700">
            <div className="text-emerald-900 font-black">{schoolName}</div>
            <div>العام الدراسي: 2025 - 2026 م</div>
            <div>مكتب الامتحانات وشؤون الطلاب</div>
            <div className="font-mono text-[10px] text-slate-400">DOC-REF: LY-EXAM-2026</div>
          </div>
        </div>

        <div className="text-center pt-2">
          <h2 className="text-lg sm:text-xl font-black tracking-wide text-slate-900">
            كشف إخطار بنتيجة درجات الطالب (الفصل الدراسي)
          </h2>
          <p className="text-xs text-slate-600 font-bold">
            مرحلة التعليم الأساسي • نظام التقييم الموحد (أعمال سنة 40 + امتحان نهائي 60)
          </p>
        </div>
      </div>

      {/* Student Detailed Information Block */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-300 text-xs">
        <div>
          <span className="text-slate-500 block text-[10px] font-bold">اسم الطالب الرباعي:</span>
          <span className="font-black text-slate-900 text-sm">{report.studentName}</span>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] font-bold">رقم القيد الرسمي:</span>
          <span className="font-mono font-bold text-slate-900">{report.nationalNumber}</span>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] font-bold">الصف والفصل:</span>
          <span className="font-black text-slate-900">{report.className}</span>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] font-bold">رقم الجلوس:</span>
          <span className="font-mono font-black text-emerald-800 text-sm">{report.seatNumber}</span>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-right text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-900 border-b border-slate-300 font-black">
            <tr>
              <th className="p-3 w-10 text-center border-l border-slate-300">ت</th>
              <th className="p-3 font-black border-l border-slate-300">المقرر الدراسي</th>
              <th className="p-3 text-center border-l border-slate-300 w-20">أعمال السنة (40)</th>
              <th className="p-3 text-center border-l border-slate-300 w-24">الامتحان النهائي (60)</th>
              <th className="p-3 text-center border-l border-slate-300 w-20">المجموع (100)</th>
              <th className="p-3 text-center border-l border-slate-300 w-16">الصغرى</th>
              <th className="p-3 text-center border-l border-slate-300 w-20">التقدير</th>
              <th className="p-3 text-center w-28">النتيجة</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {report.results.map((res, idx) => {
              const isPassed = res.isPassed;
              return (
                <tr key={res.subjectCode} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="p-2.5 text-center font-mono text-slate-400 border-l border-slate-200">
                    {idx + 1}
                  </td>
                  <td className="p-2.5 font-bold border-l border-slate-200">
                    {res.subjectName}
                  </td>
                  <td className="p-2.5 text-center font-mono font-bold border-l border-slate-200">
                    {res.courseworkScore}
                  </td>
                  <td className="p-2.5 text-center font-mono font-bold border-l border-slate-200">
                    {res.examScore}
                  </td>
                  <td className="p-2.5 text-center font-mono font-black border-l border-slate-200 text-slate-900">
                    {res.totalScore}
                  </td>
                  <td className="p-2.5 text-center font-mono text-slate-500 border-l border-slate-200">
                    {res.minScore}
                  </td>
                  <td className="p-2.5 text-center font-bold border-l border-slate-200">
                    {res.appreciation}
                  </td>
                  <td className="p-2.5 text-center font-black">
                    {isPassed ? (
                      <span className="text-emerald-700">ناجح ✓</span>
                    ) : (
                      <span className="text-rose-600 font-black">دور ثانٍ ⚠️</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer Totals */}
          <tfoot className="bg-slate-100 font-black border-t-2 border-slate-900">
            <tr>
              <td colSpan={4} className="p-3 text-left font-black text-xs border-l border-slate-300">
                المجموع الكلي والنسبة المئوية:
              </td>
              <td className="p-3 text-center font-mono font-black text-sm text-emerald-900 border-l border-slate-300">
                {report.totalEarnedScore} / {report.totalMaxScore}
              </td>
              <td colSpan={3} className="p-3 text-center font-mono font-black text-sm text-emerald-900">
                النسبة: {report.percentage}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Result Verdict Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl border-2 border-slate-900 bg-slate-50 text-center">
        <div>
          <span className="text-slate-500 text-[10px] font-bold block">الترتيب على الفصل:</span>
          <span className="text-lg font-black text-slate-900 font-mono">
            المرتبة ({report.rank})
          </span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] font-bold block">التقدير العام:</span>
          <span className="text-lg font-black text-slate-900">
            {report.generalAppreciation}
          </span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] font-bold block">النتيجة النهائية الرسمية:</span>
          <span className={`text-base font-black ${
            report.status === 'failed'
              ? 'text-rose-700'
              : report.status === 'makeup_exam'
              ? 'text-amber-700'
              : 'text-emerald-800'
          }`}>
            {report.statusLabel}
          </span>
        </div>
      </div>

      {/* Signatures & Seal Area */}
      <div className="pt-6 border-t border-slate-300 flex items-center justify-between text-center text-xs text-slate-800">
        <div className="space-y-4">
          <span className="font-bold block">منسق شؤون الامتحانات والكنترول</span>
          <div className="font-serif italic text-sm text-slate-600">أ. منسق الامتحانات</div>
          <span className="text-[10px] text-slate-400">التاريخ: {new Date().toLocaleDateString('ar-LY')}</span>
        </div>

        {/* School Seal Center */}
        <div className="space-y-1">
          <div className="w-24 h-24 border-2 border-dashed border-slate-800 rounded-full flex flex-col items-center justify-center p-2 rotate-[-8deg] mx-auto">
            <span className="text-[9px] font-black">{schoolName}</span>
            <span className="text-[8px] text-slate-500">الختم المعتمد</span>
            <span className="text-[7px] font-mono">2026/LY</span>
          </div>
        </div>

        <div className="space-y-4">
          <span className="font-bold block">مدير المدرسة / رئيس اللجنة</span>
          <div className="font-serif italic text-sm text-slate-900 font-bold">{directorName || 'أ. فتحي الشريف'}</div>
          <span className="text-[10px] text-slate-400">يعتمد رسمياً</span>
        </div>
      </div>
    </div>
  );
};
