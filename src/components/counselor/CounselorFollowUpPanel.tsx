import React, { useMemo } from 'react';
import { AlertTriangle, CalendarCheck, CheckCircle2, Clock, FolderOpen, Mail, UserX } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { AutoSummonCard, ParentSummon, Student } from '../../types';
import { sound } from '../../utils/soundEffects';

/** عدد الغيابات بدون عذر التي تستوجب متابعة الأخصائي (إنذار) */
export const ABSENCE_ALERT_THRESHOLD = 3;

interface Props {
  onNewSummon: (studentId?: string) => void;
  onOpenCase: (studentId: string) => void;
  onOpenAutoCard: (card: AutoSummonCard) => void;
}

const STATUS_LABEL: Record<ParentSummon['status'], { text: string; cls: string }> = {
  sent: { text: 'مُرسل — بانتظار الموعد', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  attended: { text: 'حضر ولي الأمر', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
  rescheduled: { text: 'أُعيدت جدولته', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
  no_show: { text: 'لم يحضر', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' },
};

/**
 * مكتب الأخصائي: من يحتاج متابعة الآن (الغياب المتكرر + بطاقات الإنذار الآلية)،
 * والاستدعاءات المرسلة لأولياء الأمور مع تأكيدهم وتسجيل الحضور.
 */
export const CounselorFollowUpPanel: React.FC<Props> = ({ onNewSummon, onOpenCase, onOpenAutoCard }) => {
  const { students, parentSummons, setParentSummons, autoSummonCards, caseStudies, showToast } = useSchool();

  const absenceWatch = useMemo(() => {
    return students
      .map(s => ({ s, absences: (s.recentAttendance || []).filter(r => r.status === 'unexcused').length + (s.status === 'unexcused' ? 1 : 0) }))
      .filter(x => x.absences >= ABSENCE_ALERT_THRESHOLD || x.s.status === 'unexcused')
      .sort((a, b) => b.absences - a.absences)
      .slice(0, 30);
  }, [students]);

  const pendingCards = autoSummonCards.filter(c => c.status === 'pending_counselor');
  const openCaseIds = new Set(caseStudies.filter(c => c.status !== 'resolved').map(c => c.studentId));
  const sortedSummons = [...parentSummons].sort((a, b) => (b.requestedDate || '').localeCompare(a.requestedDate || ''));

  const setStatus = (id: string, status: ParentSummon['status']) => {
    setParentSummons(prev => prev.map(sm => (sm.id === id ? { ...sm, status } : sm)));
    sound.playTap();
    showToast('success', 'تم تحديث الاستدعاء', STATUS_LABEL[status].text);
  };

  const pendingSummonFor = (s: Student) => parentSummons.some(sm => sm.studentId === s.id && sm.status === 'sent');

  return (
    <div className="space-y-5 animate-in fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* قائمة المتابعة */}
        <section className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
              <UserX className="w-4 h-4 text-rose-600" />
              طلاب يحتاجون متابعة الغياب
            </h3>
            <span className="text-[11px] text-slate-500">غائب اليوم أو {ABSENCE_ALERT_THRESHOLD}+ غيابات بلا عذر</span>
          </div>
          {absenceWatch.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">لا يوجد طلاب في قائمة الإنذار حالياً 👏</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[360px] overflow-y-auto">
              {absenceWatch.map(({ s, absences }) => (
                <li key={s.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{s.name}</p>
                    <p className="text-[11px] text-slate-500">فصل {s.className} • {absences} غياب بلا عذر{s.status === 'unexcused' ? ' • غائب اليوم' : ''}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenCase(s.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border ${openCaseIds.has(s.id) ? 'border-emerald-300 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'}`}
                    >
                      {openCaseIds.has(s.id) ? 'ملف مفتوح' : 'دراسة حالة'}
                    </button>
                    <button
                      type="button"
                      disabled={pendingSummonFor(s)}
                      onClick={() => onNewSummon(s.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-black disabled:opacity-40"
                    >
                      {pendingSummonFor(s) ? 'استُدعي' : 'استدعاء'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* بطاقات الإنذار الآلية */}
        <section className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            إنذارات آلية بانتظار قرارك ({pendingCards.length})
          </h3>
          {pendingCards.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">لا توجد إنذارات معلقة.</p>
          ) : (
            <ul className="space-y-2 max-h-[360px] overflow-y-auto">
              {pendingCards.map(card => (
                <li key={card.id}>
                  <button
                    type="button"
                    onClick={() => onOpenAutoCard(card)}
                    className="w-full text-right p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 hover:bg-amber-100"
                  >
                    <p className="text-xs font-black text-slate-900 dark:text-white">{card.studentName}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      {card.periodLabel} • {card.breakdown.absencesCount} غياب • {card.breakdown.misconductCount} سلوك • {card.breakdown.latenessCount} تأخر
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* سجل الاستدعاءات */}
      <section className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            استدعاءات أولياء الأمور ({parentSummons.length})
          </h3>
          <button
            type="button"
            onClick={() => onNewSummon()}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black"
          >
            + استدعاء جديد
          </button>
        </div>
        <p className="text-[11px] text-slate-500">يصل الاستدعاء لولي الأمر في تطبيقه فوراً، ويظهر هنا تأكيده للموعد.</p>
        {sortedSummons.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">لم تُرسل استدعاءات بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 dark:border-slate-700">
                  <th className="py-2 text-right font-bold">الطالب</th>
                  <th className="py-2 text-right font-bold">الموعد</th>
                  <th className="py-2 text-right font-bold">الحالة</th>
                  <th className="py-2 text-right font-bold">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {sortedSummons.map(sm => (
                  <tr key={sm.id}>
                    <td className="py-2.5">
                      <p className="font-black text-slate-900 dark:text-white">{sm.studentName}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[220px]" title={sm.reason}>{sm.reason}</p>
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span className="flex items-center gap-1"><CalendarCheck className="w-3.5 h-3.5 text-slate-400" />{sm.requestedDate}</span>
                      <span className="flex items-center gap-1 text-slate-500"><Clock className="w-3.5 h-3.5" />{sm.requestedTime}</span>
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${STATUS_LABEL[sm.status].cls}`}>{STATUS_LABEL[sm.status].text}</span>
                      {sm.parentConfirmedAt && sm.status === 'sent' && (
                        <span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> أكد ولي الأمر
                        </span>
                      )}
                    </td>
                    <td className="py-2.5">
                      {sm.status === 'sent' ? (
                        <div className="flex gap-1">
                          <button type="button" onClick={() => setStatus(sm.id, 'attended')} className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold">حضر</button>
                          <button type="button" onClick={() => setStatus(sm.id, 'no_show')} className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold">لم يحضر</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => onOpenCase(sm.studentId)} className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-[10px] font-bold flex items-center gap-1">
                          <FolderOpen className="w-3 h-3" /> الملف
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default CounselorFollowUpPanel;
