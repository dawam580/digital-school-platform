import React, { useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ArrowLeft, BookOpen, CalendarCheck, ClipboardList, MessageSquare, Printer, Star, UserX } from 'lucide-react';
import { AttendanceStatus } from '../../types';
import { sound } from '../../utils/soundEffects';
import { isLibyanWeekend, LIBYAN_DAY_NAMES, localISODate } from '../../services/domain/libyanCalendar';

const STATUS_AR: Record<AttendanceStatus, { label: string; cls: string }> = {
  present: { label: 'حاضر', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
  late: { label: 'متأخر', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  excused: { label: 'غائب بعذر', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
  unexcused: { label: 'غائب بدون عذر', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' },
};

/**
 * التقرير اليومي للطالب — من البيانات المسجلة فعلاً فقط:
 * حضور اليوم، جدول اليوم، ملاحظات المعلمين، نقاط السلوك، الواجبات، وسجل الحضور.
 */
export const DailyReport: React.FC = () => {
  const { selectedStudent, students, schedule, schoolProfile, setActiveTab, authenticatedRole } = useSchool();
  const student = students.find(s => s.id === selectedStudent?.id) || null;

  const today = new Date();
  const todayKey = localISODate(today);
  const dayName = LIBYAN_DAY_NAMES[today.getDay()];
  const weekend = isLibyanWeekend(today);

  const todayRecord = student?.recentAttendance?.find(r => r.date === todayKey);
  const periods = useMemo(() => (schedule || []).find(d => d.dayIndex === today.getDay())?.periods || [], [schedule, today]);
  const history = (student?.recentAttendance || []).slice(0, 10);
  const notes = (student?.notes || []).slice(0, 6);
  const points = (student?.behaviorPoints || []).slice(0, 6);
  const homework = (student?.assignments || []).filter(a => a.status === 'pending');

  if (!student) {
    return (
      <div className="max-w-xl mx-auto p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 font-cairo">
        <p className="text-3xl mb-2">📄</p>
        <p className="text-sm font-black text-slate-800 dark:text-white">لا يوجد طالب محدد</p>
        <p className="text-xs text-slate-500 mt-1">
          {students.length === 0 ? 'لم يُسجَّل طلاب في المدرسة بعد — استورد كشف الطلاب من لوحة المدير.' : 'اختر طالباً من الكشف لعرض تقريره اليومي.'}
        </p>
      </div>
    );
  }

  const backTab = authenticatedRole === 'parent' ? 'parent-dashboard' : 'student-profile';

  return (
    <div className="space-y-5 text-right animate-in fade-in max-w-4xl mx-auto pb-12 font-cairo">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">التقرير اليومي</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {schoolProfile.name} • يوم {dayName} {todayKey}
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => { sound.playTap(); window.print(); }}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> طباعة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(backTab)}
            className="px-4 py-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-bold text-xs rounded-2xl flex items-center gap-1"
          >
            عودة <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-gradient-to-l from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 border border-blue-100 dark:border-slate-700 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <img src={student.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover" />
          <div>
            <p className="text-base font-black text-slate-900 dark:text-white">{student.name}</p>
            <p className="text-xs text-slate-500">فصل {student.className} • رقم القيد {student.studentNumber || '—'}</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-slate-500 mb-1">حضور اليوم</p>
          {weekend ? (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">عطلة نهاية الأسبوع</span>
          ) : todayRecord ? (
            <span className={`px-3 py-1 rounded-full text-xs font-black ${STATUS_AR[todayRecord.status].cls}`}>{STATUS_AR[todayRecord.status].label}</span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-500">لم يُسجَّل بعد</span>
          )}
          {todayRecord?.note && <p className="text-[11px] text-slate-500 mt-1">{todayRecord.note}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-600" /> حصص اليوم</h2>
          {weekend ? (
            <p className="text-xs text-slate-500">لا دوام — الجمعة والسبت عطلة.</p>
          ) : periods.length === 0 ? (
            <p className="text-xs text-slate-500">لم يُنشر جدول الحصص بعد.</p>
          ) : (
            <ol className="space-y-2">
              {periods.map(p => (
                <li key={p.periodNumber} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="font-black text-slate-800 dark:text-white">{p.periodNumber}. {p.subject}</span>
                  <span className="text-slate-500">{p.teacher} • <span dir="ltr">{p.time}</span></span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2"><MessageSquare className="w-4 h-4 text-teal-600" /> ملاحظات المعلمين</h2>
          {notes.length === 0 ? (
            <p className="text-xs text-slate-500">لا ملاحظات مسجلة.</p>
          ) : (
            <ul className="space-y-2">
              {notes.map(n => (
                <li key={n.id} className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-slate-800 dark:text-slate-100">{n.text}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{n.teacher} • {n.date}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> السلوك ونقاط التميز</h2>
          {points.length === 0 ? (
            <p className="text-xs text-slate-500">لا نقاط سلوك مسجلة.</p>
          ) : (
            <ul className="space-y-1.5">
              {points.map(pt => (
                <li key={pt.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-200">{pt.icon} {pt.title}</span>
                  <span className={`font-black ${pt.points >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{pt.points > 0 ? '+' : ''}{pt.points}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2"><ClipboardList className="w-4 h-4 text-purple-600" /> واجبات مطلوبة</h2>
          {homework.length === 0 ? (
            <p className="text-xs text-slate-500">لا واجبات معلقة.</p>
          ) : (
            <ul className="space-y-1.5">
              {homework.map(a => (
                <li key={a.id} className="text-xs flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-200">{a.subject}: {a.title}</span>
                  <span className="text-slate-500">{a.dueDate}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-emerald-600" /> آخر أيام الحضور</h2>
        {history.length === 0 ? (
          <p className="text-xs text-slate-500 flex items-center gap-1.5"><UserX className="w-4 h-4" /> لا سجل حضور بعد.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {history.map(r => (
              <span key={r.date} className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${STATUS_AR[r.status].cls}`} title={r.note || ''}>
                <span dir="ltr">{r.date}</span> • {STATUS_AR[r.status].label}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DailyReport;
