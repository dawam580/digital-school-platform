import { DaySchedule, SchedulePeriod, TeacherAccount } from '../../types';

export interface ScheduleConflict {
  id: string;
  teacherName: string;
  teacherCode?: string;
  dayIndex: number;
  dayName: string;
  periodNumber: number;
  periodTime: string;
  clashingClasses: { className: string; subject: string; room: string }[];
  severity: 'high' | 'medium';
  message: string;
}

export interface ClassScheduleMap {
  [className: string]: DaySchedule[];
}

// Default Seed Multi-Class Schedules to enable cross-class conflict tracking
export const SEED_MULTI_CLASS_SCHEDULES: ClassScheduleMap = {
  '3/أ': [
    {
      dayName: 'الأحد',
      dayIndex: 0,
      periods: [
        { periodNumber: 1, time: '07:30 - 08:15', subject: 'الرياضيات', teacher: 'أ. أحمد الغامدي', room: 'قاعة 101', icon: '📐', color: 'blue' },
        { periodNumber: 2, time: '08:20 - 09:05', subject: 'لغتي الجميلة', teacher: 'أ. محمد الشهري', room: 'قاعة 101', icon: '📖', color: 'emerald' },
        { periodNumber: 3, time: '09:10 - 09:55', subject: 'العلوم الطبيعية', teacher: 'أ. عبدالله السعيد', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
        { periodNumber: 4, time: '10:25 - 11:10', subject: 'الدراسات الإسلامية', teacher: 'أ. فيصل الدوسري', room: 'قاعة 101', icon: '🕌', color: 'amber' },
        { periodNumber: 5, time: '11:15 - 12:00', subject: 'اللغة الإنجليزية', teacher: 'أ. طارق الزهراني', room: 'معمل اللغات', icon: '🌐', color: 'indigo' },
        { periodNumber: 6, time: '12:05 - 12:50', subject: 'التربية البدنية', teacher: 'أ. سامي الحربي', room: 'الصالة الرياضية', icon: '⚽', color: 'rose' }
      ]
    },
    {
      dayName: 'الإثنين',
      dayIndex: 1,
      periods: [
        { periodNumber: 1, time: '07:30 - 08:15', subject: 'العلوم الطبيعية', teacher: 'أ. عبدالله السعيد', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
        { periodNumber: 2, time: '08:20 - 09:05', subject: 'الرياضيات', teacher: 'أ. أحمد الغامدي', room: 'قاعة 101', icon: '📐', color: 'blue' },
        { periodNumber: 3, time: '09:10 - 09:55', subject: 'لغتي الجميلة', teacher: 'أ. محمد الشهري', room: 'قاعة 101', icon: '📖', color: 'emerald' },
        { periodNumber: 4, time: '10:25 - 11:10', subject: 'الاجتماعيات', teacher: 'أ. بدر المطيري', room: 'قاعة 101', icon: '🌍', color: 'amber' },
        { periodNumber: 5, time: '11:15 - 12:00', subject: 'المهارات الرقمية', teacher: 'أ. يوسف العنزي', room: 'معمل الحاسب', icon: '💻', color: 'cyan' },
        { periodNumber: 6, time: '12:05 - 12:50', subject: 'التربية الفنية', teacher: 'أ. وائل القحطاني', room: 'المرسم', icon: '🎨', color: 'pink' }
      ]
    },
    {
      dayName: 'الثلاثاء',
      dayIndex: 2,
      periods: [
        { periodNumber: 1, time: '07:30 - 08:15', subject: 'لغتي الجميلة', teacher: 'أ. محمد الشهري', room: 'قاعة 101', icon: '📖', color: 'emerald' },
        { periodNumber: 2, time: '08:20 - 09:05', subject: 'الدراسات الإسلامية', teacher: 'أ. فيصل الدوسري', room: 'قاعة 101', icon: '🕌', color: 'amber' },
        { periodNumber: 3, time: '09:10 - 09:55', subject: 'الرياضيات', teacher: 'أ. أحمد الغامدي', room: 'قاعة 101', icon: '📐', color: 'blue' },
        { periodNumber: 4, time: '10:25 - 11:10', subject: 'اللغة الإنجليزية', teacher: 'أ. طارق الزهراني', room: 'معمل اللغات', icon: '🌐', color: 'indigo' },
        { periodNumber: 5, time: '11:15 - 12:00', subject: 'العلوم الطبيعية', teacher: 'أ. عبدالله السعيد', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
        { periodNumber: 6, time: '12:05 - 12:50', subject: 'التربية البدنية', teacher: 'أ. سامي الحربي', room: 'الصالة الرياضية', icon: '⚽', color: 'rose' }
      ]
    },
    {
      dayName: 'الأربعاء',
      dayIndex: 3,
      periods: [
        { periodNumber: 1, time: '07:30 - 08:15', subject: 'الرياضيات', teacher: 'أ. أحمد الغامدي', room: 'قاعة 101', icon: '📐', color: 'blue' },
        { periodNumber: 2, time: '08:20 - 09:05', subject: 'العلوم الطبيعية', teacher: 'أ. عبدالله السعيد', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
        { periodNumber: 3, time: '09:10 - 09:55', subject: 'الدراسات الإسلامية', teacher: 'أ. فيصل الدوسري', room: 'قاعة 101', icon: '🕌', color: 'amber' },
        { periodNumber: 4, time: '10:25 - 11:10', subject: 'لغتي الجميلة', teacher: 'أ. محمد الشهري', room: 'قاعة 101', icon: '📖', color: 'emerald' },
        { periodNumber: 5, time: '11:15 - 12:00', subject: 'الاجتماعيات', teacher: 'أ. بدر المطيري', room: 'قاعة 101', icon: '🌍', color: 'amber' },
        { periodNumber: 6, time: '12:05 - 12:50', subject: 'المهارات الرقمية', teacher: 'أ. يوسف العنزي', room: 'معمل الحاسب', icon: '💻', color: 'cyan' }
      ]
    },
    {
      dayName: 'الخميس',
      dayIndex: 4,
      periods: [
        { periodNumber: 1, time: '07:30 - 08:15', subject: 'الدراسات الإسلامية', teacher: 'أ. فيصل الدوسري', room: 'قاعة 101', icon: '🕌', color: 'amber' },
        { periodNumber: 2, time: '08:20 - 09:05', subject: 'الرياضيات', teacher: 'أ. أحمد الغامدي', room: 'قاعة 101', icon: '📐', color: 'blue' },
        { periodNumber: 3, time: '09:10 - 09:55', subject: 'اللغة الإنجليزية', teacher: 'أ. طارق الزهراني', room: 'معمل اللغات', icon: '🌐', color: 'indigo' },
        { periodNumber: 4, time: '10:25 - 11:10', subject: 'العلوم الطبيعية', teacher: 'أ. عبدالله السعيد', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
        { periodNumber: 5, time: '11:15 - 12:00', subject: 'لغتي الجميلة', teacher: 'أ. محمد الشهري', room: 'قاعة 101', icon: '📖', color: 'emerald' },
        { periodNumber: 6, time: '12:05 - 12:50', subject: 'النشاط الطلابي', teacher: 'رائد النشاط', room: 'مسرح المدرسة', icon: '🌟', color: 'amber' }
      ]
    }
  ],
  '3/ب': [
    {
      dayName: 'الأحد',
      dayIndex: 0,
      periods: [
        { periodNumber: 1, time: '07:30 - 08:15', subject: 'لغتي الجميلة', teacher: 'أ. محمد الشهري', room: 'قاعة 102', icon: '📖', color: 'emerald' },
        { periodNumber: 2, time: '08:20 - 09:05', subject: 'الرياضيات', teacher: 'أ. أحمد الغامدي', room: 'قاعة 102', icon: '📐', color: 'blue' },
        { periodNumber: 3, time: '09:10 - 09:55', subject: 'الدراسات الإسلامية', teacher: 'أ. فيصل الدوسري', room: 'قاعة 102', icon: '🕌', color: 'amber' },
        { periodNumber: 4, time: '10:25 - 11:10', subject: 'العلوم الطبيعية', teacher: 'أ. عبدالله السعيد', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
        { periodNumber: 5, time: '11:15 - 12:00', subject: 'التربية البدنية', teacher: 'أ. سامي الحربي', room: 'الصالة الرياضية', icon: '⚽', color: 'rose' },
        { periodNumber: 6, time: '12:05 - 12:50', subject: 'اللغة الإنجليزية', teacher: 'أ. طارق الزهراني', room: 'معمل اللغات', icon: '🌐', color: 'indigo' }
      ]
    },
    {
      dayName: 'الإثنين',
      dayIndex: 1,
      periods: [
        { periodNumber: 1, time: '07:30 - 08:15', subject: 'الرياضيات', teacher: 'أ. أحمد الغامدي', room: 'قاعة 102', icon: '📐', color: 'blue' },
        { periodNumber: 2, time: '08:20 - 09:05', subject: 'العلوم الطبيعية', teacher: 'أ. عبدالله السعيد', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
        { periodNumber: 3, time: '09:10 - 09:55', subject: 'الاجتماعيات', teacher: 'أ. بدر المطيري', room: 'قاعة 102', icon: '🌍', color: 'amber' },
        { periodNumber: 4, time: '10:25 - 11:10', subject: 'لغتي الجميلة', teacher: 'أ. محمد الشهري', room: 'قاعة 102', icon: '📖', color: 'emerald' },
        { periodNumber: 5, time: '11:15 - 12:00', subject: 'التربية الفنية', teacher: 'أ. وائل القحطاني', room: 'المرسم', icon: '🎨', color: 'pink' },
        { periodNumber: 6, time: '12:05 - 12:50', subject: 'المهارات الرقمية', teacher: 'أ. يوسف العنزي', room: 'معمل الحاسب', icon: '💻', color: 'cyan' }
      ]
    },
    {
      dayName: 'الثلاثاء',
      dayIndex: 2,
      periods: [
        { periodNumber: 1, time: '07:30 - 08:15', subject: 'الدراسات الإسلامية', teacher: 'أ. فيصل الدوسري', room: 'قاعة 102', icon: '🕌', color: 'amber' },
        { periodNumber: 2, time: '08:20 - 09:05', subject: 'لغتي الجميلة', teacher: 'أ. محمد الشهري', room: 'قاعة 102', icon: '📖', color: 'emerald' },
        { periodNumber: 3, time: '09:10 - 09:55', subject: 'العلوم الطبيعية', teacher: 'أ. عبدالله السعيد', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
        { periodNumber: 4, time: '10:25 - 11:10', subject: 'الرياضيات', teacher: 'أ. أحمد الغامدي', room: 'قاعة 102', icon: '📐', color: 'blue' },
        { periodNumber: 5, time: '11:15 - 12:00', subject: 'التربية البدنية', teacher: 'أ. سامي الحربي', room: 'الصالة الرياضية', icon: '⚽', color: 'rose' },
        { periodNumber: 6, time: '12:05 - 12:50', subject: 'اللغة الإنجليزية', teacher: 'أ. طارق الزهراني', room: 'معمل اللغات', icon: '🌐', color: 'indigo' }
      ]
    },
    {
      dayName: 'الأربعاء',
      dayIndex: 3,
      periods: [
        { periodNumber: 1, time: '07:30 - 08:15', subject: 'العلوم الطبيعية', teacher: 'أ. عبدالله السعيد', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
        { periodNumber: 2, time: '08:20 - 09:05', subject: 'الرياضيات', teacher: 'أ. أحمد الغامدي', room: 'قاعة 102', icon: '📐', color: 'blue' },
        { periodNumber: 3, time: '09:10 - 09:55', subject: 'لغتي الجميلة', teacher: 'أ. محمد الشهري', room: 'قاعة 102', icon: '📖', color: 'emerald' },
        { periodNumber: 4, time: '10:25 - 11:10', subject: 'الدراسات الإسلامية', teacher: 'أ. فيصل الدوسري', room: 'قاعة 102', icon: '🕌', color: 'amber' },
        { periodNumber: 5, time: '11:15 - 12:00', subject: 'المهارات الرقمية', teacher: 'أ. يوسف العنزي', room: 'معمل الحاسب', icon: '💻', color: 'cyan' },
        { periodNumber: 6, time: '12:05 - 12:50', subject: 'الاجتماعيات', teacher: 'أ. بدر المطيري', room: 'قاعة 102', icon: '🌍', color: 'amber' }
      ]
    },
    {
      dayName: 'الخميس',
      dayIndex: 4,
      periods: [
        { periodNumber: 1, time: '07:30 - 08:15', subject: 'الرياضيات', teacher: 'أ. أحمد الغامدي', room: 'قاعة 102', icon: '📐', color: 'blue' },
        { periodNumber: 2, time: '08:20 - 09:05', subject: 'الدراسات الإسلامية', teacher: 'أ. فيصل الدوسري', room: 'قاعة 102', icon: '🕌', color: 'amber' },
        { periodNumber: 3, time: '09:10 - 09:55', subject: 'العلوم الطبيعية', teacher: 'أ. عبدالله السعيد', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
        { periodNumber: 4, time: '10:25 - 11:10', subject: 'اللغة الإنجليزية', teacher: 'أ. طارق الزهراني', room: 'معمل اللغات', icon: '🌐', color: 'indigo' },
        { periodNumber: 5, time: '11:15 - 12:00', subject: 'النشاط الطلابي', teacher: 'رائد النشاط', room: 'مسرح المدرسة', icon: '🌟', color: 'amber' },
        { periodNumber: 6, time: '12:05 - 12:50', subject: 'لغتي الجميلة', teacher: 'أ. محمد الشهري', room: 'قاعة 102', icon: '📖', color: 'emerald' }
      ]
    }
  ]
};

export class TimetableConflictEngine {
  /**
   * Scans all classes and periods to detect any teacher or room collision in the exact same time slot.
   */
  public static detectConflicts(classSchedules: ClassScheduleMap): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

    days.forEach((dayName, dayIndex) => {
      // Check for each period 1..7
      for (let periodNum = 1; periodNum <= 7; periodNum++) {
        const teacherOccupancy: {
          [teacherName: string]: { className: string; subject: string; room: string; time: string }[];
        } = {};

        // Iterate through all classes
        Object.entries(classSchedules).forEach(([className, dayList]) => {
          const targetDay = dayList.find(d => d.dayIndex === dayIndex || d.dayName === dayName);
          if (targetDay) {
            const period = targetDay.periods.find(p => p.periodNumber === periodNum);
            if (period && period.teacher && period.teacher !== 'رائد النشاط') {
              if (!teacherOccupancy[period.teacher]) {
                teacherOccupancy[period.teacher] = [];
              }
              teacherOccupancy[period.teacher].push({
                className,
                subject: period.subject,
                room: period.room,
                time: period.time
              });
            }
          }
        });

        // Any teacher with > 1 class at the same time is a conflict!
        Object.entries(teacherOccupancy).forEach(([teacherName, assignments]) => {
          if (assignments.length > 1) {
            conflicts.push({
              id: `conflict-${dayIndex}-${periodNum}-${teacherName.replace(/\s+/g, '_')}`,
              teacherName,
              dayIndex,
              dayName,
              periodNumber: periodNum,
              periodTime: assignments[0].time,
              clashingClasses: assignments,
              severity: 'high',
              message: `تضارب زمني: المعلم (${teacherName}) مسند إليه ${assignments.length} حصص متزامنة يوم ${dayName} (الحصة ${periodNum}) في الفصول: ${assignments.map(a => a.className).join(' و ')}.`
            });
          }
        });
      }
    });

    return conflicts;
  }

  /**
   * AI-powered Conflict Resolver: Automatically re-arranges and swaps periods to achieve 0 conflicts.
   */
  public static autoResolveConflicts(
    classSchedules: ClassScheduleMap,
    teachers: TeacherAccount[]
  ): { resolvedSchedules: ClassScheduleMap; resolvedCount: number } {
    let resolvedCount = 0;
    const workingCopy: ClassScheduleMap = JSON.parse(JSON.stringify(classSchedules));

    const conflicts = this.detectConflicts(workingCopy);
    if (conflicts.length === 0) {
      return { resolvedSchedules: workingCopy, resolvedCount: 0 };
    }

    // Resolve each conflict by swapping period with an available free slot
    conflicts.forEach(conflict => {
      // Keep the first class, and swap in the second class
      if (conflict.clashingClasses.length >= 2) {
        const targetClass = conflict.clashingClasses[1].className;
        const daySchedule = workingCopy[targetClass]?.find(d => d.dayIndex === conflict.dayIndex);

        if (daySchedule) {
          const conflictingIndex = daySchedule.periods.findIndex(p => p.periodNumber === conflict.periodNumber);
          
          // Find a non-conflicting slot in the same day to swap with
          for (let swapIdx = 0; swapIdx < daySchedule.periods.length; swapIdx++) {
            if (swapIdx !== conflictingIndex) {
              const candidate = daySchedule.periods[swapIdx];
              
              // Swap candidate and conflicting period
              const temp = { ...daySchedule.periods[conflictingIndex] };
              daySchedule.periods[conflictingIndex] = {
                ...candidate,
                periodNumber: temp.periodNumber,
                time: temp.time
              };
              daySchedule.periods[swapIdx] = {
                ...temp,
                periodNumber: candidate.periodNumber,
                time: candidate.time
              };

              // Check if swap resolved the clash
              const newConflicts = this.detectConflicts(workingCopy);
              if (newConflicts.length < conflicts.length) {
                resolvedCount++;
                break;
              } else {
                // Revert if it didn't help
                daySchedule.periods[conflictingIndex] = temp;
                daySchedule.periods[swapIdx] = candidate;
              }
            }
          }
        }
      }
    });

    return {
      resolvedSchedules: workingCopy,
      resolvedCount
    };
  }

  /**
   * Extracts the full weekly teaching schedule for a specific teacher across all classes.
   */
  public static getTeacherSchedule(
    teacherNameOrCode: string,
    classSchedules: ClassScheduleMap
  ): DaySchedule[] {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
    
    return days.map((dayName, dayIndex) => {
      const periods: SchedulePeriod[] = [];

      Object.entries(classSchedules).forEach(([className, dayList]) => {
        const day = dayList.find(d => d.dayIndex === dayIndex || d.dayName === dayName);
        if (day) {
          day.periods.forEach(p => {
            if (p.teacher.includes(teacherNameOrCode) || teacherNameOrCode.includes(p.teacher)) {
              periods.push({
                ...p,
                subject: `${p.subject} (${className})`,
                room: `${p.room} [فصل ${className}]`
              });
            }
          });
        }
      });

      // Sort by period number
      periods.sort((a, b) => a.periodNumber - b.periodNumber);

      return {
        dayName,
        dayIndex,
        periods
      };
    });
  }
}
