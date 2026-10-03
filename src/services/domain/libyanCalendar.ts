/**
 * ============================================================================
 * التقويم المدرسي الليبي — قواعد ثابتة تستخدمها كل الواجهات
 * ----------------------------------------------------------------------------
 * - العام الدراسي يبدأ في الخريف (التسجيل من أغسطس، الدراسة سبتمبر/أكتوبر)
 *   وينتهي في الصيف ← من أغسطس يُحتسب العام الجديد.
 * - أسبوع الدراسة: الأحد ← الخميس. العطلة الأسبوعية: الجمعة والسبت.
 * - سلّم التقديرات: ممتاز 85+ • جيد جداً 75+ • جيد 65+ • مقبول 50+ • ضعيف دون 50.
 * ============================================================================
 */

/** الشهر (0-11) الذي يبدأ منه احتساب العام الدراسي الجديد: أغسطس */
const ACADEMIC_YEAR_START_MONTH = 7;

/** العام الدراسي الحالي بصيغة "2026 - 2027 م" */
export function currentAcademicYear(date: Date = new Date()): string {
  const y = date.getFullYear();
  const start = date.getMonth() >= ACADEMIC_YEAR_START_MONTH ? y : y - 1;
  return `${start} - ${start + 1} م`;
}

/** أول سنة في نص العام الدراسي ("2025 - 2026 م" ← 2025)، أو null */
export function academicYearStart(label: string | undefined | null): number | null {
  const m = (label || '').match(/(\d{4})/);
  return m ? Number(m[1]) : null;
}

/** أيام الدوام المدرسي في ليبيا (getDay): الأحد 0 ← الخميس 4 */
export const LIBYAN_SCHOOL_DAYS = [0, 1, 2, 3, 4] as const;

export const LIBYAN_DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] as const;

/** هل اليوم عطلة نهاية الأسبوع الليبية (الجمعة أو السبت)؟ */
export function isLibyanWeekend(date: Date = new Date()): boolean {
  const d = date.getDay();
  return d === 5 || d === 6;
}

export type LibyanAppreciation = 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'ضعيف';

/** التقدير وفق السلّم الليبي من نسبة مئوية */
export function libyanAppreciation(percentage: number): LibyanAppreciation {
  if (percentage >= 85) return 'ممتاز';
  if (percentage >= 75) return 'جيد جداً';
  if (percentage >= 65) return 'جيد';
  if (percentage >= 50) return 'مقبول';
  return 'ضعيف';
}

/** تاريخ اليوم المحلي بصيغة YYYY-MM-DD (لا UTC — ليبيا UTC+2، فمنتصف الليل لا يُزيح اليوم) */
export function localISODate(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** حالة حضور الطالب المسجلة لليوم فقط (null = لم يُرصد اليوم بعد) */
export function todayAttendanceStatus(
  student: { recentAttendance?: { date: string; status: 'present' | 'late' | 'excused' | 'unexcused' }[] } | null | undefined,
  date: Date = new Date()
): 'present' | 'late' | 'excused' | 'unexcused' | null {
  const key = localISODate(date);
  return student?.recentAttendance?.find(r => r.date === key)?.status ?? null;
}
