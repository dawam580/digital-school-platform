import { Student, StudentInfraction, AutoSummonCard, NotificationItem } from '../../types';

export class WarningTriggerEngine {
  // Weekly threshold: 3 or more warnings
  static readonly WEEKLY_THRESHOLD = 3;
  // Monthly threshold: 5 or more warnings
  static readonly MONTHLY_THRESHOLD = 5;

  /**
   * Helper to get ISO week key e.g. "2025-W36"
   */
  static getWeekKey(date: Date = new Date()): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  /**
   * Helper to get Month key e.g. "2025-M09"
   */
  static getMonthKey(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-M${month}`;
  }

  /**
   * Evaluate infractions for a student and check if threshold is triggered
   */
  static evaluateAndTriggerSummon(
    student: Student,
    newInfraction: StudentInfraction,
    allStudentInfractions: StudentInfraction[],
    existingCards: AutoSummonCard[]
  ): {
    triggeredCard: AutoSummonCard | null;
    isNewCard: boolean;
    reason: string | null;
  } {
    const now = new Date();
    const currentWeekKey = this.getWeekKey(now);
    const currentMonthKey = this.getMonthKey(now);

    const fullList = [...allStudentInfractions, newInfraction];

    // Filter infractions for this week
    const weeklyInfractions = fullList.filter(inf => {
      const infDate = new Date(inf.date);
      return this.getWeekKey(infDate) === currentWeekKey;
    });

    // Filter infractions for this month
    const monthlyInfractions = fullList.filter(inf => {
      const infDate = new Date(inf.date);
      return this.getMonthKey(infDate) === currentMonthKey;
    });

    const weeklyCount = weeklyInfractions.length;
    const monthlyCount = monthlyInfractions.length;

    // Check Monthly Threshold (5+) First (higher severity)
    if (monthlyCount >= this.MONTHLY_THRESHOLD) {
      const existingMonthlyCard = existingCards.find(
        c => c.studentId === student.id && c.periodType === 'monthly' && c.periodKey === currentMonthKey
      );

      if (!existingMonthlyCard) {
        // Create new monthly summon card
        const card = this.buildSummonCard(student, monthlyInfractions, 'monthly', currentMonthKey, monthlyCount);
        return {
          triggeredCard: card,
          isNewCard: true,
          reason: `تجاوز العتبة الشهرية (${monthlyCount} إنذارات خلال شهر ${now.toLocaleDateString('ar-LY', { month: 'long' })})`
        };
      }
    }

    // Check Weekly Threshold (3+)
    if (weeklyCount >= this.WEEKLY_THRESHOLD) {
      const existingWeeklyCard = existingCards.find(
        c => c.studentId === student.id && c.periodType === 'weekly' && c.periodKey === currentWeekKey
      );

      if (!existingWeeklyCard) {
        // Create new weekly summon card
        const card = this.buildSummonCard(student, weeklyInfractions, 'weekly', currentWeekKey, weeklyCount);
        return {
          triggeredCard: card,
          isNewCard: true,
          reason: `تجاوز العتبة الأسبوعية (${weeklyCount} إنذارات خلال الأسبوع الحالي)`
        };
      }
    }

    return {
      triggeredCard: null,
      isNewCard: false,
      reason: null
    };
  }

  /**
   * Helper to build a detailed summon card with breakdowns
   */
  private static buildSummonCard(
    student: Student,
    infractions: StudentInfraction[],
    periodType: 'weekly' | 'monthly',
    periodKey: string,
    totalCount: number
  ): AutoSummonCard {
    const absencesCount = infractions.filter(i => i.type === 'absence').length;
    const latenessCount = infractions.filter(i => i.type === 'lateness').length;
    const misconductCount = infractions.filter(i => i.type === 'misconduct' || i.type === 'disruption').length;
    const academicCount = infractions.filter(i => i.type === 'homework_missing').length;

    const periodLabel = periodType === 'weekly'
      ? `العتبة الأسبوعية (${totalCount} إنذارات في الأسبوع الحالي)`
      : `العتبة الشهرية (${totalCount} إنذارات في الشهر الحالي)`;

    return {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: student.id,
      studentName: student.name,
      studentNationalNumber: student.nationalNumber || student.nationalId,
      grade: student.grade,
      className: student.className,
      parentName: student.parentName || `ولي أمر الطالب ${student.name}`,
      parentPhone: student.parentPhone || '0922465676',
      periodType,
      periodLabel,
      periodKey,
      totalWarningsCount: totalCount,
      breakdown: {
        absencesCount,
        misconductCount,
        latenessCount,
        academicCount
      },
      infractions,
      triggeredAt: new Date().toISOString(),
      triggeredDateFormatted: new Date().toLocaleDateString('ar-LY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      status: 'pending_counselor'
    };
  }
}

// Seed initial infractions
export const SEED_INFRACTIONS: StudentInfraction[] = [
  {
    id: 'inf-1',
    studentId: 'std-3',
    studentName: 'عبدالرحمن طارق المقريف',
    type: 'absence',
    typeLabel: 'غياب بدون عذر',
    title: 'غياب غير مبرر عن الحصة الأولى والثانية',
    date: '2025-08-31',
    time: '08:00 ص',
    reportedBy: 'إدارة الحضور الصباحي',
    severity: 'warning'
  },
  {
    id: 'inf-2',
    studentId: 'std-3',
    studentName: 'عبدالرحمن طارق المقريف',
    type: 'lateness',
    typeLabel: 'تأخر متكرر',
    title: 'التأخر 25 دقيقة عن طابور الصباح',
    date: '2025-09-01',
    time: '08:25 ص',
    reportedBy: 'مشرف الطابور',
    severity: 'warning'
  },
  {
    id: 'inf-3',
    studentId: 'std-3',
    studentName: 'عبدالرحمن طارق المقريف',
    type: 'absence',
    typeLabel: 'غياب بدون عذر',
    title: 'غياب كامل عن اليوم الدراسي',
    date: '2025-09-02',
    time: '07:45 ص',
    reportedBy: 'رائد الفصل أ. طارق الفيتوري',
    severity: 'alert'
  }
];

// Seed initial auto-generated summon cards
export const SEED_AUTO_SUMMON_CARDS: AutoSummonCard[] = [
  {
    id: 'card-seed-1',
    studentId: 'std-3',
    studentName: 'عبدالرحمن طارق المقريف',
    studentNationalNumber: '120083456789',
    grade: 'الصف الثاني الأساسي',
    className: '2/أ',
    parentName: 'طارق المقريف',
    parentPhone: '0912345678',
    periodType: 'weekly',
    periodLabel: 'العتبة الأسبوعية (3 إنذارات في الأسبوع الحالي)',
    periodKey: WarningTriggerEngine.getWeekKey(new Date()),
    totalWarningsCount: 3,
    breakdown: {
      absencesCount: 2,
      latenessCount: 1,
      misconductCount: 0,
      academicCount: 0
    },
    infractions: SEED_INFRACTIONS,
    triggeredAt: new Date().toISOString(),
    triggeredDateFormatted: 'الثلاثاء، 2 سبتمبر 2025 م',
    status: 'pending_counselor'
  }
];
