/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك وقواعد الامتحانات والتقييم والدرجات - وزارة التربية والتعليم الليبية
 * (قرار مجلس الوزراء رقم 1013 لسنة 2022م ولائحة تنظيم شؤون الامتحانات)
 * ============================================================================
 */

import { Student, SubjectGrade } from '../../types';

export interface LibyanSubjectDefinition {
  code: string;
  name: string;
  weeklyPeriods: number; // نصاب الحصص الأسبوعي
  maxScore: number;      // النهاية الكبرى = عدد الحصص * 40
  minScore: number;      // النهاية الصغرى للنجاح = 50% من الكبرى
  courseworkMax: number; // أعمال السنة = 40% من الكبرى
  examMax: number;       // الامتحان النهائي = 60% من الكبرى
}

/**
 * المقررات المعتمدة لمرحلة التعليم الأساسي (الشهادة الإعدادية وصفوف النقل)
 * المجموع الكلي للشهادة الإعدادية = 1120 درجة (28 حصة أسبوعياً)
 */
export const LIBYAN_BASIC_SUBJECTS: LibyanSubjectDefinition[] = [
  {
    code: 'ARB',
    name: 'اللغة العربية وفروعها',
    weeklyPeriods: 6,
    maxScore: 240,
    minScore: 120,
    courseworkMax: 96,
    examMax: 144
  },
  {
    code: 'MATH',
    name: 'الرياضيات',
    weeklyPeriods: 5,
    maxScore: 200,
    minScore: 100,
    courseworkMax: 80,
    examMax: 120
  },
  {
    code: 'SCI',
    name: 'العلوم الطبيعية',
    weeklyPeriods: 4,
    maxScore: 160,
    minScore: 80,
    courseworkMax: 64,
    examMax: 96
  },
  {
    code: 'ENG',
    name: 'اللغة الإنجليزية',
    weeklyPeriods: 4,
    maxScore: 160,
    minScore: 80,
    courseworkMax: 64,
    examMax: 96
  },
  {
    code: 'ISL',
    name: 'التربية الإسلامية والقرآن الكريم',
    weeklyPeriods: 3,
    maxScore: 120,
    minScore: 60,
    courseworkMax: 48,
    examMax: 72
  },
  {
    code: 'HIST',
    name: 'التاريخ',
    weeklyPeriods: 2,
    maxScore: 80,
    minScore: 40,
    courseworkMax: 32,
    examMax: 48
  },
  {
    code: 'GEOG',
    name: 'الجغرافيا',
    weeklyPeriods: 2,
    maxScore: 80,
    minScore: 40,
    courseworkMax: 32,
    examMax: 48
  },
  {
    code: 'COMP',
    name: 'تقنية المعلومات (الحاسوب)',
    weeklyPeriods: 2,
    maxScore: 80,
    minScore: 40,
    courseworkMax: 32,
    examMax: 48
  }
];

export interface StudentExamResultItem {
  subjectCode: string;
  subjectName: string;
  maxScore: number;
  minScore: number;
  courseworkScore: number;
  examScore: number;
  totalScore: number;
  isPassed: boolean;
  appreciation: string;
  // Detailed breakdown if used
  test1Score?: number;
  test2Score?: number;
  activitiesScore?: number;
  homeworkScore?: number;
}

export interface StudentFullExamReport {
  studentId: string;
  studentName: string;
  nationalNumber: string;
  className: string;
  results: StudentExamResultItem[];
  totalMaxScore: number;
  totalEarnedScore: number;
  percentage: number;
  rank: number;
  generalAppreciation: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'ضعيف';
  status: 'passed_honors' | 'passed' | 'makeup_exam' | 'failed';
  statusLabel: string;
  failedSubjects: string[];
}

export class LibyanExamEngine {
  /**
   * حساب التقدير اللفظي المعتمد في ليبيا بناءً على النسبة المئوية
   */
  static getAppreciation(percentage: number): 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'ضعيف' {
    if (percentage >= 85) return 'ممتاز';
    if (percentage >= 75) return 'جيد جداً';
    if (percentage >= 65) return 'جيد';
    if (percentage >= 50) return 'مقبول';
    return 'ضعيف';
  }

  /**
   * تحويل التقدير المكتوب إلى نصوص معبرة باللغة العربية للشهادة الرسمية
   */
  static getAppreciationWord(totalScore: number, maxScore: number): string {
    const pct = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    return this.getAppreciation(pct);
  }

  /**
   * حساب النتيجة الكاملة للطالب وتحديد المواد الراسب بها وحالة الدور الثاني
   */
  static calculateStudentExamReport(
    student: Student,
    customGrades?: { [subjectCode: string]: { coursework: number; exam: number } }
  ): StudentFullExamReport {
    let totalMax = 0;
    let totalEarned = 0;
    const failedSubjects: string[] = [];

    const results: StudentExamResultItem[] = LIBYAN_BASIC_SUBJECTS.map(sub => {
      totalMax += sub.maxScore;

      // Extract existing student grade or default seed
      let coursework = Math.round(sub.courseworkMax * 0.85);
      let exam = Math.round(sub.examMax * 0.82);

      if (customGrades && customGrades[sub.code]) {
        coursework = customGrades[sub.code].coursework;
        exam = customGrades[sub.code].exam;
      } else if (student.subjects && student.subjects.length > 0) {
        const existing = student.subjects.find(
          s => s.code === sub.code || s.name === sub.name
        );
        if (existing) {
          coursework = existing.courseworkScore ?? Math.round((existing.totalScore ?? existing.score) * 0.4);
          exam = existing.examScore ?? Math.round((existing.totalScore ?? existing.score) * 0.6);
        }
      }

      // Bound within bounds
      coursework = Math.min(Math.max(0, coursework), sub.courseworkMax);
      exam = Math.min(Math.max(0, exam), sub.examMax);
      const total = coursework + exam;
      totalEarned += total;

      const isPassed = total >= sub.minScore;
      if (!isPassed) {
        failedSubjects.push(sub.name);
      }

      const pct = (total / sub.maxScore) * 100;

      return {
        subjectCode: sub.code,
        subjectName: sub.name,
        maxScore: sub.maxScore,
        minScore: sub.minScore,
        courseworkScore: coursework,
        examScore: exam,
        totalScore: total,
        isPassed,
        appreciation: this.getAppreciation(pct)
      };
    });

    const percentage = totalMax > 0 ? Math.round((totalEarned / totalMax) * 1000) / 10 : 0;
    const generalAppreciation = this.getAppreciation(percentage);

    // Determine Official Status based on Libyan Bylaws
    let status: 'passed_honors' | 'passed' | 'makeup_exam' | 'failed' = 'passed';
    let statusLabel = 'ناجح ومنقول إلى الصف التالي 🟢';

    if (failedSubjects.length === 0) {
      if (percentage >= 85) {
        status = 'passed_honors';
        statusLabel = 'ناجح بمرتبة الشرف والتميز 🌟';
      } else {
        status = 'passed';
        statusLabel = 'ناجح ومنقول إلى الصف التالي 🟢';
      }
    } else if (failedSubjects.length <= 2) {
      status = 'makeup_exam';
      statusLabel = `له دور ثانٍ في: (${failedSubjects.join('، ')}) 🟡`;
    } else {
      status = 'failed';
      statusLabel = 'راسب وباقٍ للإعادة في صفه 🔴';
    }

    return {
      studentId: student.id,
      studentName: student.name,
      nationalNumber: student.nationalNumber || student.nationalId || '-',
      className: student.className || '9/أ',
      results,
      totalMaxScore: totalMax,
      totalEarnedScore: totalEarned,
      percentage,
      rank: 1, // calculated in batch
      generalAppreciation,
      status,
      statusLabel,
      failedSubjects
    };
  }

  /**
   * حساب الترتيب والمجاميع لجميع طلاب الفصل أو المدرسة دفعة واحدة
   */
  static calculateClassRankings(students: Student[]): StudentFullExamReport[] {
    const reports = students.map(s => this.calculateStudentExamReport(s));

    // Sort descending by percentage/total score
    reports.sort((a, b) => b.percentage - a.percentage);

    // Assign rank
    return reports.map((r, index) => ({
      ...r,
      rank: index + 1
    }));
  }

  /**
   * استرجاع حالة اعتماد النتيجة الرسمية للفصل الدراسي
   */
  static getCertificationStatus(classId: string): {
    status: 'draft' | 'submitted_by_teacher' | 'approved_by_admin';
    teacherSign?: string;
    adminSign?: string;
    approvedAt?: string;
    submittedAt?: string;
  } {
    try {
      const stored = localStorage.getItem(`madrasa_cert_${classId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { status: 'draft' };
  }

  /**
   * قيام معلم المادة برصد الدرجات وطلب الاعتماد الرسمي من الإدارة
   */
  static submitForAdminApproval(classId: string, teacherName: string, subject: string) {
    const cert = {
      status: 'submitted_by_teacher' as const,
      teacherSign: `${teacherName} (${subject})`,
      submittedAt: new Date().toLocaleDateString('ar-LY') + ' ' + new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })
    };
    try {
      localStorage.setItem(`madrasa_cert_${classId}`, JSON.stringify(cert));
    } catch {}
    return cert;
  }

  /**
   * اعتماد النتيجة رسمياً من مدير المدرسة وإقفال الكنترول والشهادات
   */
  static certifyAndLockGrades(classId: string, adminName: string) {
    const prev = this.getCertificationStatus(classId);
    const cert = {
      ...prev,
      status: 'approved_by_admin' as const,
      adminSign: adminName || 'إدارة المدرسة المعتمدة',
      approvedAt: new Date().toLocaleDateString('ar-LY') + ' ' + new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })
    };
    try {
      localStorage.setItem(`madrasa_cert_${classId}`, JSON.stringify(cert));
    } catch {}
    return cert;
  }
}

