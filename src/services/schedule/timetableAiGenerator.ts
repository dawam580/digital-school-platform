/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك الذكاء الاصطناعي لتوليد وبناء الجداول المدرسية وتوزيع الحصص آلياً
 * AI-Powered Timetable & Schedule Optimizer (Zero-Collision Libyan Bylaws)
 * ============================================================================
 */

import { DaySchedule, SchedulePeriod, TeacherAccount, SchoolClass } from '../../types';
import { ClassScheduleMap, TimetableConflictEngine } from './conflictDetector';
import * as XLSX from 'xlsx';

export interface SubjectRule {
  code: string;
  name: string;
  weeklyCount: number; // حصص الأسبوع (مثال: عربي 6، رياضيات 5، علوم 4)
  icon: string;
  color: string;
  defaultRoom: string;
  isMorningPriority: boolean; // هل تفضل الحصص الصباحية (1-3)؟
}

export const LIBYAN_STANDARD_CURRICULUM_PERIODS: SubjectRule[] = [
  { code: 'ARA', name: 'اللغة العربية', weeklyCount: 6, icon: '📖', color: 'emerald', defaultRoom: 'قاعة الفصل', isMorningPriority: true },
  { code: 'MATH', name: 'الرياضيات', weeklyCount: 5, icon: '📐', color: 'blue', defaultRoom: 'قاعة الفصل', isMorningPriority: true },
  { code: 'SCI', name: 'العلوم الطبيعية', weeklyCount: 4, icon: '🔬', color: 'purple', defaultRoom: 'معمل العلوم', isMorningPriority: true },
  { code: 'ENG', name: 'اللغة الإنجليزية', weeklyCount: 4, icon: '🌐', color: 'indigo', defaultRoom: 'معمل اللغات', isMorningPriority: false },
  { code: 'ISL', name: 'التربية الإسلامية', weeklyCount: 3, icon: '🕌', color: 'amber', defaultRoom: 'قاعة الفصل', isMorningPriority: false },
  { code: 'SOC', name: 'الدراسات الاجتماعية', weeklyCount: 4, icon: '🗺️', color: 'teal', defaultRoom: 'قاعة الفصل', isMorningPriority: false },
  { code: 'COMP', name: 'الحاسوب وتقنية المعلومات', weeklyCount: 2, icon: '💻', color: 'cyan', defaultRoom: 'معمل الحاسوب', isMorningPriority: false },
  { code: 'PE_ART', name: 'التربية الفنية والبدنية', weeklyCount: 2, icon: '⚽', color: 'rose', defaultRoom: 'الصالة الرياضية', isMorningPriority: false },
];

export const DAYS_OF_WEEK = [
  { dayIndex: 0, dayName: 'الأحد' },
  { dayIndex: 1, dayName: 'الإثنين' },
  { dayIndex: 2, dayName: 'الثلاثاء' },
  { dayIndex: 3, dayName: 'الأربعاء' },
  { dayIndex: 4, dayName: 'الخميس' }
];

export const PERIOD_TIMES = [
  { num: 1, time: '08:00 - 08:45' },
  { num: 2, time: '08:50 - 09:35' },
  { num: 3, time: '09:40 - 10:25' },
  { num: 4, time: '10:50 - 11:35' },
  { num: 5, time: '11:40 - 12:25' },
  { num: 6, time: '12:30 - 01:15' }
];

export class TimetableAIGenerator {
  /**
   * التوليد الذكي التلقائي للجداول الأسبوعية لجميع الفصول بدون أي تضارب
   */
  static generateSmartSchedule(
    classNames: string[],
    teachers: TeacherAccount[]
  ): {
    schedules: ClassScheduleMap;
    totalPeriodsGenerated: number;
    conflictsCount: number;
    generationTimeMs: number;
  } {
    const startTime = performance.now();
    const result: ClassScheduleMap = {};

    // Tracking teacher assignments per slot: `${dayIndex}-${periodNumber}` -> Set<TeacherName>
    const teacherSlotUsage: { [slotKey: string]: Set<string> } = {};

    // Helper to find best teacher for subject and class
    const getTeacherFor = (subjectCode: string, className: string): string => {
      const candidates = teachers.filter(t => 
        t.subjectCode === subjectCode || 
        t.subject.includes(subjectCode) ||
        (subjectCode === 'PE_ART' && (t.subject.includes('بدنية') || t.subject.includes('فنية') || t.subject.includes('رياضة')))
      );

      if (candidates.length === 0) {
        // Fallback default teacher
        if (subjectCode === 'MATH') return 'أ. طارق الفيتوري';
        if (subjectCode === 'ARA') return 'أ. عبدالسلام الورفلي';
        if (subjectCode === 'SCI') return 'أ. مريم الترهوني';
        if (subjectCode === 'ENG') return 'أ. فاطمة الزوي';
        if (subjectCode === 'ISL') return 'أ. محمود السويحلي';
        if (subjectCode === 'SOC') return 'أ. وليد المصراتي';
        if (subjectCode === 'COMP') return 'أ. أسامة المقريف';
        return 'أ. سامي المجبري';
      }

      // Check teacher assigned to this class specifically
      const matchClass = candidates.find(c => c.assignedClasses.includes(className));
      return matchClass ? matchClass.name : candidates[0].name;
    };

    // Initialize schedules for each class
    for (const className of classNames) {
      // Build a pool of 30 periods based on Libyan curriculum quotas
      const subjectPool: { rule: SubjectRule; teacher: string }[] = [];
      LIBYAN_STANDARD_CURRICULUM_PERIODS.forEach(rule => {
        const teacher = getTeacherFor(rule.code, className);
        for (let i = 0; i < rule.weeklyCount; i++) {
          subjectPool.push({ rule, teacher });
        }
      });

      // Sort pool: morning priority subjects (Math, Arabic, Science) first
      subjectPool.sort((a, b) => {
        if (a.rule.isMorningPriority && !b.rule.isMorningPriority) return -1;
        if (!a.rule.isMorningPriority && b.rule.isMorningPriority) return 1;
        return 0;
      });

      const classDays: DaySchedule[] = DAYS_OF_WEEK.map(day => ({
        dayName: day.dayName,
        dayIndex: day.dayIndex,
        periods: []
      }));

      // Distribute 6 periods per day (30 total)
      let poolIndex = 0;
      for (let pNum = 1; pNum <= 6; pNum++) {
        for (let dIdx = 0; dIdx < 5; dIdx++) {
          const slotKey = `${dIdx}-${pNum}`;
          if (!teacherSlotUsage[slotKey]) {
            teacherSlotUsage[slotKey] = new Set();
          }

          // Pick subject from pool where teacher is free
          let pickedItem: { rule: SubjectRule; teacher: string } | null = null;
          let pickedPoolIdx = -1;

          for (let i = 0; i < subjectPool.length; i++) {
            const candidate = subjectPool[i];
            if (!teacherSlotUsage[slotKey].has(candidate.teacher)) {
              pickedItem = candidate;
              pickedPoolIdx = i;
              break;
            }
          }

          // If all candidates are busy, fallback to next available and shift
          if (!pickedItem && subjectPool.length > 0) {
            pickedItem = subjectPool[0];
            pickedPoolIdx = 0;
          }

          if (pickedItem) {
            subjectPool.splice(pickedPoolIdx, 1);
            teacherSlotUsage[slotKey].add(pickedItem.teacher);

            const pTime = PERIOD_TIMES.find(pt => pt.num === pNum)?.time || '08:00 - 08:45';
            classDays[dIdx].periods.push({
              periodNumber: pNum,
              time: pTime,
              subject: pickedItem.rule.name,
              teacher: pickedItem.teacher,
              room: pickedItem.rule.defaultRoom === 'قاعة الفصل' ? `قاعة (${className})` : pickedItem.rule.defaultRoom,
              icon: pickedItem.rule.icon,
              color: pickedItem.rule.color
            });
          }
        }
      }

      // Sort periods by periodNumber 1 to 6
      classDays.forEach(d => {
        d.periods.sort((a, b) => a.periodNumber - b.periodNumber);
      });

      result[className] = classDays;
    }

    // Run auto resolver to guarantee zero conflicts
    const resolved = TimetableConflictEngine.autoResolveConflicts(result, teachers);
    const conflicts = TimetableConflictEngine.detectConflicts(resolved.resolvedSchedules);

    const endTime = performance.now();

    // Persist in localStorage
    try {
      localStorage.setItem('madrasa_multi_class_schedules', JSON.stringify(resolved.resolvedSchedules));
    } catch {}

    return {
      schedules: resolved.resolvedSchedules,
      totalPeriodsGenerated: classNames.length * 30,
      conflictsCount: conflicts.length,
      generationTimeMs: Math.round((endTime - startTime) * 10) / 10
    };
  }

  /**
   * تصدير الجدول الأسبوعي المدرسي الشامل إلى ملف Excel
   */
  static exportMasterTimetableToExcel(
    schedules: ClassScheduleMap,
    schoolName: string
  ) {
    const wb = XLSX.utils.book_new();

    // Loop through each class and make a clean sheet
    Object.keys(schedules).forEach(className => {
      const daySchedules = schedules[className];
      const rows: any[] = [];

      daySchedules.forEach(day => {
        const rowObj: any = {
          'اليوم': day.dayName
        };

        day.periods.forEach(p => {
          rowObj[`الحصة ${p.periodNumber} (${p.time})`] = `${p.subject}\n(${p.teacher})`;
        });

        rows.push(rowObj);
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, `فصل_${className.replace('/', '-')}`);
    });

    XLSX.writeFile(wb, `جدول_الحصص_الأسبوعي_${schoolName.replace(/\s+/g, '_')}.xlsx`);
  }
}
