import { useEffect, useState } from 'react';
import { Student } from '../types';
import { ExamStorageService } from '../services/exams/examStorageService';
import { LibyanExamEngine, StudentFullExamReport } from '../services/exams/libyanExamEngine';

/**
 * حالة نتيجة الكنترول لطالب، كما يراها ولي الأمر:
 * - held: الكنترول اعتمد وقفل الفصل ولم ينشر بعد ← كل الدرجات محجوبة مؤقتاً.
 * - report: النتيجة الرسمية من شيت الكنترول — لا تظهر إلا بعد "نشر النتائج لأولياء الأمور".
 * - loading: لم تُقرأ حالة القفل بعد (null).
 */
export function useOfficialExamResult(student: Student | null | undefined): {
  held: boolean | null;
  report: StudentFullExamReport | null;
} {
  const [held, setHeld] = useState<boolean | null>(null);
  const [report, setReport] = useState<StudentFullExamReport | null>(null);
  const cls = student?.className;
  const studentId = student?.id;

  useEffect(() => {
    let cancelled = false;
    setHeld(null);
    setReport(null);
    if (!student || !cls) { setHeld(false); return; }
    (async () => {
      try {
        const lock = await ExamStorageService.getExamLock(cls);
        if (cancelled) return;
        setHeld(!!lock.isLocked && !lock.isReleasedToParents);
        if (!lock.isReleasedToParents) return;
        const [subjects, records] = await Promise.all([
          ExamStorageService.getSubjects(),
          ExamStorageService.getGradeRecordsForClass(cls),
        ]);
        const mine = records.filter(r => r.studentId === student.id);
        if (cancelled || mine.length === 0) return;
        const map = new Map(mine.map(r => [r.id, r]));
        // الترتيب على الفصل يُحسب من كل طلاب الفصل المرصودين — نكتفي هنا بنتيجة الطالب نفسه
        setReport(LibyanExamEngine.calculateStudentExamReport({ ...student, subjects: [] }, subjects, map));
      } catch {
        if (!cancelled) setHeld(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cls, studentId]);

  return { held, report };
}
