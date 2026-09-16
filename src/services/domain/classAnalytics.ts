/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك تحليلات وإحصائيات الفصول اللحظي (Class Analytics & Real-Time Aggregator)
 * ============================================================================
 */

import { SchoolClass, Student } from '../../types';

export function computeLiveClassStats(classes: SchoolClass[], students: Student[]): SchoolClass[] {
  const statsMap = new Map<string, { total: number; present: number; absent: number; late: number }>();

  students.forEach((s) => {
    const cName = (s.className || 'عام').trim();
    if (!statsMap.has(cName)) {
      statsMap.set(cName, { total: 0, present: 0, absent: 0, late: 0 });
    }
    const st = statsMap.get(cName)!;
    st.total += 1;
    if (s.status === 'present') st.present += 1;
    else if (s.status === 'late') st.late += 1;
    else if (s.status === 'unexcused' || s.status === 'excused') st.absent += 1;
  });

  if (!classes || classes.length === 0) {
    return Array.from(statsMap.entries()).map(([name, stats], idx) => ({
      id: `c-dyn-${idx + 1}`,
      name,
      grade: name.includes('1/') ? 'الصف الأول الأساسي' : name.includes('2/') ? 'الصف الثاني الأساسي' : 'التعليم الأساسي',
      studentCount: stats.total,
      presentCount: stats.present,
      absentCount: stats.absent,
      lateCount: stats.late,
      supervisor: 'مشرف الفصل'
    }));
  }

  // Update existing classes with live numbers
  const updatedClasses = classes.map((c) => {
    const st = statsMap.get(c.name?.trim());
    if (st) {
      return {
        ...c,
        studentCount: st.total,
        presentCount: st.present,
        absentCount: st.absent,
        lateCount: st.late
      };
    }
    return c;
  });

  // Check if any student classes are missing from classes list
  statsMap.forEach((stats, cName) => {
    const exists = updatedClasses.some((c) => c.name?.trim() === cName);
    if (!exists && cName !== 'عام') {
      updatedClasses.push({
        id: `c-auto-${cName}`,
        name: cName,
        grade: cName.includes('1/') ? 'الصف الأول الأساسي' : cName.includes('2/') ? 'الصف الثاني الأساسي' : 'التعليم الأساسي',
        studentCount: stats.total,
        presentCount: stats.present,
        absentCount: stats.absent,
        lateCount: stats.late,
        supervisor: 'مشرف الفصل'
      });
    }
  });

  return updatedClasses;
}
