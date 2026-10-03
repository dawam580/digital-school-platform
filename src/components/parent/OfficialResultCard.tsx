import React from 'react';
import { Award } from 'lucide-react';
import { StudentFullExamReport } from '../../services/exams/libyanExamEngine';

/** النتيجة الرسمية المنشورة من الكنترول (أعمال 40 + امتحان 60) كما تظهر لولي الأمر */
export const OfficialResultCard: React.FC<{ report: StudentFullExamReport; dark?: boolean }> = ({ report, dark }) => {
  const pending = report.status === 'pending';
  const box = dark
    ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-emerald-500/40 text-white'
    : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white';
  const muted = dark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400';
  const row = dark ? 'border-white/10' : 'border-emerald-100 dark:border-emerald-900';

  return (
    <div className={`p-4 rounded-3xl border shadow-sm space-y-3 ${box}`} data-testid="official-result">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Award className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <h4 className="text-sm font-black">النتيجة الرسمية المعتمدة من الكنترول</h4>
            <p className={`text-[11px] ${muted}`}>{report.statusLabel}</p>
          </div>
        </div>
        <div className="text-left shrink-0">
          <div className="text-2xl font-black font-mono">{pending ? '—' : `${report.percentage}%`}</div>
          <div className="text-[11px] font-black text-amber-500">{pending ? 'غير مكتملة' : report.generalAppreciation}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-[11px]">
          <thead className={muted}>
            <tr>
              <th className="py-1.5 font-bold">المادة</th>
              <th className="py-1.5 font-bold text-center">أعمال</th>
              <th className="py-1.5 font-bold text-center">امتحان</th>
              <th className="py-1.5 font-bold text-center">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {report.results.map(r => (
              <tr key={r.subjectCode} className={`border-t ${row}`}>
                <td className="py-1.5 font-bold">{r.subjectName}</td>
                <td className="py-1.5 text-center font-mono">{r.isEstimated ? '—' : r.courseworkScore}</td>
                <td className="py-1.5 text-center font-mono">{r.isEstimated ? '—' : r.isSecondRound ? `${r.makeupExamScore} (د2)` : r.examScore}</td>
                <td className={`py-1.5 text-center font-mono font-black ${r.isEstimated ? '' : r.isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {r.isEstimated ? '—' : `${r.totalScore}/${r.maxScore}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!pending && report.failedSubjects.length > 0 && (
        <p className="text-[11px] font-bold text-rose-500">مواد دون النهاية الصغرى: {report.failedSubjects.join('، ')}</p>
      )}
    </div>
  );
};
