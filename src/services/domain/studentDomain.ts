/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * نطاق معالجة بيانات الطلاب والدرجات والسلوك (Student Domain Logic)
 * ============================================================================
 */

import { Student, BehaviorPoint, SubjectGrade, Assignment } from '../../types';
import { SecurityEngine } from '../security/securityEngine';

export const StudentDomainService = {
  // Add behavior point
  addBehaviorPoint(students: Student[], studentId: string, point: BehaviorPoint): Student[] {
    return students.map((s) => {
      if (s.id === studentId) {
        const currentTotal = s.behaviorPointsTotal || 0;
        const newTotal = Math.max(0, currentTotal + point.points);
        return {
          ...s,
          behaviorPointsTotal: newTotal,
          points: newTotal,
          behaviorPoints: [point, ...(s.behaviorPoints || [])]
        };
      }
      return s;
    });
  },

  // Update student avatar
  updateAvatar(students: Student[], studentId: string, avatarUrl: string): Student[] {
    const cleanUrl = SecurityEngine.cleanText(avatarUrl);
    return students.map((s) => (s.id === studentId ? { ...s, avatar: cleanUrl } : s));
  },

  // Update student grade in a subject
  updateGrade(
    students: Student[],
    studentId: string,
    gradeId: string,
    updatedFields: Partial<SubjectGrade>
  ): Student[] {
    return students.map((s) => {
      if (s.id === studentId && s.grades) {
        const updatedGrades = s.grades.map((g) => {
          if (g.id === gradeId) {
            const merged = { ...g, ...updatedFields };
            const coursework = (merged.period1 || 0) + (merged.period2 || 0) + (merged.quizzes || 0) + (merged.homework || 0) + (merged.participation || 0);
            const total = (coursework || 0) + (merged.finalExam || 0);
            return {
              ...merged,
              total,
              letter: (total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : 'F') as SubjectGrade['letter']
            };
          }
          return g;
        });

        const overallAvg =
          updatedGrades.length > 0
            ? Math.round((updatedGrades.reduce((sum, gr) => sum + gr.total, 0) / updatedGrades.length) * 10) / 10
            : s.academicAverage;

        return {
          ...s,
          grades: updatedGrades,
          academicAverage: overallAvg
        };
      }
      return s;
    });
  },

  // Submit assignment
  submitAssignment(
    students: Student[],
    studentId: string,
    assignmentId: string,
    score: number,
    feedback?: string
  ): Student[] {
    const cleanFeedback = feedback ? SecurityEngine.cleanText(feedback) : undefined;
    return students.map((s) => {
      if (s.id === studentId && s.assignments) {
        const updatedAssignments = s.assignments.map((a) => {
          if (a.id === assignmentId) {
            return {
              ...a,
              status: 'graded' as const,
              studentScore: score,
              teacherFeedback: cleanFeedback
            };
          }
          return a;
        });
        return {
          ...s,
          assignments: updatedAssignments
        };
      }
      return s;
    });
  },

  // Transfer student to another class
  transferClass(
    students: Student[],
    studentId: string,
    newClassName: string,
    reason?: string
  ): { updatedStudents: Student[]; success: boolean } {
    const cleanClass = SecurityEngine.cleanText(newClassName);
    const cleanReason = reason ? SecurityEngine.cleanText(reason) : 'نقل إداري معتمد';
    const today = new Date().toISOString().split('T')[0];

    let found = false;
    const updated = students.map((s) => {
      if (s.id === studentId) {
        found = true;
        const currentHistory = s.transferHistory || [];
        const newRecord = {
          fromClass: s.className,
          toClass: cleanClass,
          date: today,
          reason: cleanReason
        };
        return {
          ...s,
          className: cleanClass,
          transferHistory: [newRecord, ...currentHistory]
        };
      }
      return s;
    });

    return { updatedStudents: updated, success: found };
  },

  // Update student checklist documents
  updateDocuments(
    students: Student[],
    studentId: string,
    docs: Partial<NonNullable<Student['documents']>>
  ): Student[] {
    return students.map((s) => {
      if (s.id === studentId) {
        const currentDocs = s.documents || {
          birthCert: false,
          healthRecord: false,
          photos: false,
          parentConsent: false,
          transferCert: false
        };
        return {
          ...s,
          documents: {
            ...currentDocs,
            ...docs
          }
        };
      }
      return s;
    });
  }
};
