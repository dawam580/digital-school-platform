/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك وقواعد الامتحانات والتقييم والدرجات - وزارة التربية والتعليم الليبية
 * (نظام موحد ومبسط: أعمال سنة 40 + امتحان نهائي 60 = 100 | الصغرى = 50)
 * ============================================================================
 */

import { Student } from '../../types';
import { ExamSubject, DEFAULT_LIBYAN_EXAM_SUBJECTS, ExamGradeRecord } from './examStorageService';

export interface LibyanSubjectDefinition {
  code: string;
  name: string;
  weeklyPeriods: number;
  maxScore: number;
  minScore: number;
  courseworkMax: number;
  examMax: number;
}

export const LIBYAN_BASIC_SUBJECTS: LibyanSubjectDefinition[] = DEFAULT_LIBYAN_EXAM_SUBJECTS.map(s => ({
  code: s.code,
  name: s.name,
  weeklyPeriods: s.weeklyPeriods,
  maxScore: s.maxScore,
  minScore: s.minScore,
  courseworkMax: s.courseworkMax,
  examMax: s.examMax
}));

export interface StudentExamResultItem {
  subjectCode: string;
  subjectName: string;
  maxScore: number;      // 100
  minScore: number;      // 50
  courseworkScore: number;// 0 - 40
  examScore: number;       // 0 - 60
  totalScore: number;      // 0 - 100
  makeupExamScore?: number;// 0 - 60
  isPassed: boolean;
  isSecondRound: boolean;
  appreciation: string;
  // Detailed coursework breakdown (optional)
  testScore?: number;       // 20
  homeworkScore?: number;   // 10
  attendanceScore?: number; // 10
}

export interface StudentFullExamReport {
  studentId: string;
  studentName: string;
  nationalNumber: string;
  className: string;
  seatNumber: string;
  results: StudentExamResultItem[];
  totalMaxScore: number;
  totalEarnedScore: number;
  totalObtained?: number;
  percentage: number;
  rank: number;
  generalAppreciation: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'ضعيف';
  appreciation?: string;
  status: 'passed_honors' | 'passed' | 'passed_makeup' | 'makeup_exam' | 'failed';
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
   * حساب التقرير الامتحاني الكامل للطالب بناءً على درجاته المسجلة أو الافتراضية
   */
  static calculateStudentExamReport(
    student: Student,
    subjects: ExamSubject[] = DEFAULT_LIBYAN_EXAM_SUBJECTS,
    savedRecordsMap?: Map<string, ExamGradeRecord>,
    seatNumberOverride?: string
  ): StudentFullExamReport {
    let totalMax = 0;
    let totalEarned = 0;
    const failedSubjects: string[] = [];
    let hasSecondRoundPassed = false;

    const results: StudentExamResultItem[] = subjects.map(sub => {
      const maxScore = sub.maxScore || 100;
      const minScore = sub.minScore || 50;
      const courseworkMax = sub.courseworkMax || 40;
      const examMax = sub.examMax || 60;

      totalMax += maxScore;

      let coursework = 35; // Default realistic seed
      let exam = 52;
      let makeupScore: number | undefined = undefined;

      const recordKey = `${student.id}_${sub.code}`;
      if (savedRecordsMap && savedRecordsMap.has(recordKey)) {
        const rec = savedRecordsMap.get(recordKey)!;
        coursework = rec.courseworkScore;
        exam = rec.examScore;
        makeupScore = rec.makeupExamScore;
      } else if (student.subjects && student.subjects.length > 0) {
        const existing = student.subjects.find(
          s => s.code === sub.code || s.name === sub.name
        );
        if (existing) {
          coursework = existing.courseworkScore ?? Math.round((existing.score ?? 85) * 0.4);
          exam = existing.examScore ?? Math.round((existing.score ?? 85) * 0.6);
        }
      }

      // Constrain within boundaries
      coursework = Math.min(Math.max(0, coursework), courseworkMax);
      exam = Math.min(Math.max(0, exam), examMax);
      let total = coursework + exam;

      // Handle second round / makeup exam
      let isPassed = total >= minScore;
      let isSecondRound = false;

      if (!isPassed) {
        if (makeupScore !== undefined && makeupScore >= 0) {
          const makeupTotal = coursework + makeupScore;
          if (makeupTotal >= minScore) {
            isPassed = true;
            isSecondRound = true;
            hasSecondRoundPassed = true;
            total = makeupTotal;
          }
        }
      }

      if (!isPassed) {
        failedSubjects.push(sub.name);
      }

      totalEarned += total;
      const pct = (total / maxScore) * 100;

      return {
        subjectCode: sub.code,
        subjectName: sub.name,
        maxScore,
        minScore,
        courseworkScore: coursework,
        examScore: exam,
        totalScore: total,
        makeupExamScore: makeupScore,
        isPassed,
        isSecondRound,
        appreciation: this.getAppreciation(pct)
      };
    });

    const percentage = totalMax > 0 ? Math.round((totalEarned / totalMax) * 1000) / 10 : 0;
    const generalAppreciation = this.getAppreciation(percentage);

    // Determine Official Status based on Libyan Exam Bylaws:
    // - 0 failures: passed or passed_honors
    // - 1 to 3 failures: makeup_exam (له دور ثانٍ)
    // - 4+ failures: failed (راسب وباقٍ للإعادة)
    let status: 'passed_honors' | 'passed' | 'passed_makeup' | 'makeup_exam' | 'failed' = 'passed';
    let statusLabel = 'ناجح ومنقول إلى الصف التالي 🟢';

    if (failedSubjects.length === 0) {
      if (hasSecondRoundPassed) {
        status = 'passed_makeup';
        statusLabel = 'ناجح بالدور الثاني 🟡';
      } else if (percentage >= 85) {
        status = 'passed_honors';
        statusLabel = 'ناجح بمرتبة الشرف والتميز 🌟';
      } else {
        status = 'passed';
        statusLabel = 'ناجح ومنقول إلى الصف التالي 🟢';
      }
    } else if (failedSubjects.length <= 3) {
      status = 'makeup_exam';
      statusLabel = `له دور ثانٍ في: (${failedSubjects.join('، ')}) 🟡`;
    } else {
      status = 'failed';
      statusLabel = 'راسب وباقٍ للإعادة في صفه 🔴';
    }

    const seatNumber = seatNumberOverride || student.studentNumber || `26${String(1000 + (parseInt((student.id || '').replace(/\D/g, '').slice(-4) || '101', 10))).slice(-4)}`;

    return {
      studentId: student.id,
      studentName: student.name,
      nationalNumber: student.nationalNumber || student.nationalId || '—',
      className: student.className || '—',
      seatNumber,
      results,
      totalMaxScore: totalMax,
      totalEarnedScore: totalEarned,
      totalObtained: totalEarned,
      percentage,
      rank: 1, // calculated in batch
      generalAppreciation,
      appreciation: generalAppreciation,
      status,
      statusLabel,
      failedSubjects
    };
  }

  /**
   * حساب الترتيب والمجاميع لجميع طلاب الفصل أو المدرسة دفعة واحدة
   */
  static calculateClassRankings(
    students: Student[],
    subjects: ExamSubject[] = DEFAULT_LIBYAN_EXAM_SUBJECTS,
    savedRecordsMap?: Map<string, ExamGradeRecord>,
    seatingMap?: Map<string, string>
  ): StudentFullExamReport[] {
    const reports = students.map(s => {
      const seat = seatingMap ? seatingMap.get(s.id) : undefined;
      return this.calculateStudentExamReport(s, subjects, savedRecordsMap, seat);
    });

    // Sort descending by percentage / total score
    reports.sort((a, b) => b.percentage - a.percentage);

    // Assign rank
    return reports.map((r, index) => ({
      ...r,
      rank: index + 1
    }));
  }

  /**
   * توليد أرقام جلوس تسلسلية ذكية لجميع الطلاب
   */
  static generateSeatingNumbers(
    students: Student[],
    startNumber: number = 26001
  ): Map<string, string> {
    const seatingMap = new Map<string, string>();
    let currentNumber = startNumber;

    // Sort students by class name then by student name
    const sorted = [...students].sort((a, b) => {
      const classCompare = (a.className || '').localeCompare(b.className || '', 'ar');
      if (classCompare !== 0) return classCompare;
      return (a.name || '').localeCompare(b.name || '', 'ar');
    });

    sorted.forEach(s => {
      seatingMap.set(s.id, String(currentNumber));
      currentNumber++;
    });

    return seatingMap;
  }

  /**
   * توزيع الطلاب على لجان وقاعات الامتحانات آلياً بناءً على سعة كل قاعة
   */
  static distributeStudentsToCommittees(
    students: Student[],
    seatingMap: Map<string, string>,
    halls: Array<{ id?: string; name: string; roomNumber: string; capacity: number; supervisorName: string; proctorNames: string[] }>,
    academicYear: string = '2025 - 2026 م'
  ) {
    const committees: Array<{
      id: string;
      name: string;
      roomNumber: string;
      capacity: number;
      supervisorName: string;
      proctorNames: string[];
      seatStart: number;
      seatEnd: number;
      assignedStudentIds: string[];
      academicYear: string;
    }> = [];

    let studentIndex = 0;
    const totalStudents = students.length;

    halls.forEach((hall, hIdx) => {
      if (studentIndex >= totalStudents) return;

      const capacity = hall.capacity || 30;
      const assignedIds: string[] = [];
      const startSeatStr = seatingMap.get(students[studentIndex].id) || '26001';
      const startSeat = parseInt(startSeatStr, 10);
      let endSeat = startSeat;

      for (let c = 0; c < capacity && studentIndex < totalStudents; c++) {
        const st = students[studentIndex];
        assignedIds.push(st.id);
        const curSeat = seatingMap.get(st.id);
        if (curSeat) endSeat = parseInt(curSeat, 10);
        studentIndex++;
      }

      committees.push({
        id: hall.id || `comm-${Date.now()}-${hIdx + 1}`,
        name: hall.name || `لجنة رقم ${hIdx + 1}`,
        roomNumber: hall.roomNumber || `قاعة ${hIdx + 1}`,
        capacity,
        supervisorName: hall.supervisorName || 'أ. مشرف اللجنة',
        proctorNames: hall.proctorNames && hall.proctorNames.length > 0 ? hall.proctorNames : ['أ. مراقب أول', 'أ. مراقب ثانٍ'],
        seatStart: startSeat,
        seatEnd: endSeat,
        assignedStudentIds: assignedIds,
        academicYear
      });
    });

    return committees;
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
