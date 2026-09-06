/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * خدمة إدارة وتخزين بيانات الامتحانات والكنترول والدرجات (IndexedDB Service)
 * ============================================================================
 */

import { indexedDBManager } from '../storage/indexedDb';

export interface ExamSubject {
  code: string;
  name: string;
  weeklyPeriods: number;
  maxScore: number;      // 100
  minScore: number;      // 50
  courseworkMax: number; // 40
  examMax: number;       // 60
  teacherId?: string;
  teacherName?: string;
  grade?: string;
}

export interface DetailedCourseworkBreakdown {
  attendanceScore: number; // 10
  homeworkScore: number;   // 10
  midtermTestScore: number;// 20
}

export interface ExamGradeRecord {
  id: string; // `${studentId}_${subjectCode}`
  studentId: string;
  studentNationalId: string;
  studentName: string;
  className: string;
  seatNumber?: string;
  subjectCode: string;
  subjectName: string;
  courseworkScore: number; // 0 - 40
  examScore: number;       // 0 - 60
  totalScore: number;      // 0 - 100
  makeupExamScore?: number;// 0 - 60
  isPassed: boolean;
  isSecondRound: boolean;
  appreciation: string;
  detailedBreakdown?: DetailedCourseworkBreakdown;
  updatedAt: string;
  updatedBy: string;
}

export interface ExamCommittee {
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
}

export interface ExamLock {
  id: string; // `${className}_${term}`
  className: string;
  academicYear: string;
  term: 'الفترة الأولى' | 'الفترة الثانية' | 'نهاية العام';
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  isReleasedToParents: boolean;
  releasedAt?: string;
}

// 🌟 Default Standard Libyan Subjects (100 total score: 40 Year Work + 60 Final Exam)
export const DEFAULT_LIBYAN_EXAM_SUBJECTS: ExamSubject[] = [
  {
    code: 'ISL',
    name: 'التربية الإسلامية والقرآن الكريم',
    weeklyPeriods: 3,
    maxScore: 100,
    minScore: 50,
    courseworkMax: 40,
    examMax: 60,
    teacherName: 'أ. عثمان السويحلي'
  },
  {
    code: 'ARB',
    name: 'اللغة العربية وفروعها',
    weeklyPeriods: 6,
    maxScore: 100,
    minScore: 50,
    courseworkMax: 40,
    examMax: 60,
    teacherName: 'أ. عبدالسلام الورفلي'
  },
  {
    code: 'MATH',
    name: 'الرياضيات',
    weeklyPeriods: 5,
    maxScore: 100,
    minScore: 50,
    courseworkMax: 40,
    examMax: 60,
    teacherName: 'أ. طارق الفيتوري'
  },
  {
    code: 'SCI',
    name: 'العلوم الطبيعية',
    weeklyPeriods: 4,
    maxScore: 100,
    minScore: 50,
    courseworkMax: 40,
    examMax: 60,
    teacherName: 'أ. فاطمة المجبري'
  },
  {
    code: 'ENG',
    name: 'اللغة الإنجليزية',
    weeklyPeriods: 4,
    maxScore: 100,
    minScore: 50,
    courseworkMax: 40,
    examMax: 60,
    teacherName: 'أ. خديجة الترهوني'
  },
  {
    code: 'HIST',
    name: 'التاريخ',
    weeklyPeriods: 2,
    maxScore: 100,
    minScore: 50,
    courseworkMax: 40,
    examMax: 60,
    teacherName: 'أ. سالم المقريف'
  },
  {
    code: 'GEOG',
    name: 'الجغرافيا والتربية الوطنية',
    weeklyPeriods: 2,
    maxScore: 100,
    minScore: 50,
    courseworkMax: 40,
    examMax: 60,
    teacherName: 'أ. مريم المنفي'
  },
  {
    code: 'COMP',
    name: 'تقنية المعلومات (الحاسوب)',
    weeklyPeriods: 2,
    maxScore: 100,
    minScore: 50,
    courseworkMax: 40,
    examMax: 60,
    teacherName: 'أ. محمد الزوي'
  }
];

const LOCAL_KEY_SUBJECTS = 'madrasa_exam_subjects_v2';
const LOCAL_KEY_GRADES = 'madrasa_exam_grades_v2';
const LOCAL_KEY_COMMITTEES = 'madrasa_exam_committees_v2';
const LOCAL_KEY_LOCKS = 'madrasa_exam_locks_v2';

export class ExamStorageService {
  // In-memory caches
  private static cachedSubjects: ExamSubject[] | null = null;
  private static cachedGrades: Map<string, ExamGradeRecord> = new Map();
  private static cachedCommittees: ExamCommittee[] | null = null;
  private static cachedLocks: Map<string, ExamLock> = new Map();

  // ================= SUBJECTS ================= //

  static async getSubjects(): Promise<ExamSubject[]> {
    if (this.cachedSubjects && this.cachedSubjects.length > 0) {
      return this.cachedSubjects;
    }

    try {
      const idbSubs = await indexedDBManager.getAll<ExamSubject>('exam_subjects');
      if (idbSubs && idbSubs.length > 0) {
        this.cachedSubjects = idbSubs;
        return idbSubs;
      }
    } catch {}

    try {
      const local = localStorage.getItem(LOCAL_KEY_SUBJECTS);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cachedSubjects = parsed;
          return parsed;
        }
      }
    } catch {}

    // Initialize with default Libyan subjects
    this.cachedSubjects = [...DEFAULT_LIBYAN_EXAM_SUBJECTS];
    await this.saveSubjects(this.cachedSubjects);
    return this.cachedSubjects;
  }

  static async saveSubjects(subjects: ExamSubject[]): Promise<void> {
    this.cachedSubjects = subjects;
    try {
      await indexedDBManager.putAll('exam_subjects', subjects);
    } catch {}
    try {
      localStorage.setItem(LOCAL_KEY_SUBJECTS, JSON.stringify(subjects));
    } catch {}
  }

  static async addOrUpdateSubject(subject: ExamSubject): Promise<void> {
    const list = await this.getSubjects();
    const idx = list.findIndex(s => s.code === subject.code);
    if (idx >= 0) {
      list[idx] = subject;
    } else {
      list.push(subject);
    }
    await this.saveSubjects(list);
  }

  static async deleteSubject(code: string): Promise<void> {
    const list = await this.getSubjects();
    const filtered = list.filter(s => s.code !== code);
    await this.saveSubjects(filtered);
    try {
      await indexedDBManager.delete('exam_subjects', code);
    } catch {}
  }

  // ================= GRADE RECORDS ================= //

  static async getAllGradeRecords(): Promise<ExamGradeRecord[]> {
    try {
      const records = await indexedDBManager.getAll<ExamGradeRecord>('exam_grade_records');
      if (records && records.length > 0) {
        records.forEach(r => this.cachedGrades.set(r.id, r));
        return records;
      }
    } catch {}

    try {
      const local = localStorage.getItem(LOCAL_KEY_GRADES);
      if (local) {
        const parsed: ExamGradeRecord[] = JSON.parse(local);
        parsed.forEach(r => this.cachedGrades.set(r.id, r));
        return parsed;
      }
    } catch {}

    return Array.from(this.cachedGrades.values());
  }

  static async getGradeRecordsForClass(className: string): Promise<ExamGradeRecord[]> {
    const all = await this.getAllGradeRecords();
    return all.filter(r => r.className === className);
  }

  static async saveGradeRecord(record: ExamGradeRecord): Promise<void> {
    this.cachedGrades.set(record.id, record);
    try {
      await indexedDBManager.put('exam_grade_records', record);
    } catch {}

    // Persist snapshot to localStorage throttled
    this.persistGradesToLocalStorage();
  }

  static async saveGradeRecordsBatch(records: ExamGradeRecord[]): Promise<void> {
    records.forEach(r => this.cachedGrades.set(r.id, r));
    try {
      await indexedDBManager.putAll('exam_grade_records', records);
    } catch {}
    this.persistGradesToLocalStorage();
  }

  private static persistTimer: any = null;
  private static persistGradesToLocalStorage() {
    if (this.persistTimer) clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => {
      try {
        const arr = Array.from(this.cachedGrades.values());
        localStorage.setItem(LOCAL_KEY_GRADES, JSON.stringify(arr));
      } catch {}
    }, 500);
  }

  // ================= EXAM COMMITTEES & SEATING ================= //

  static async getCommittees(): Promise<ExamCommittee[]> {
    if (this.cachedCommittees) return this.cachedCommittees;

    try {
      const list = await indexedDBManager.getAll<ExamCommittee>('exam_committees');
      if (list && list.length > 0) {
        this.cachedCommittees = list;
        return list;
      }
    } catch {}

    try {
      const local = localStorage.getItem(LOCAL_KEY_COMMITTEES);
      if (local) {
        const parsed = JSON.parse(local);
        this.cachedCommittees = parsed;
        return parsed;
      }
    } catch {}

    return [];
  }

  static async saveCommittees(committees: ExamCommittee[]): Promise<void> {
    this.cachedCommittees = committees;
    try {
      await indexedDBManager.putAll('exam_committees', committees);
    } catch {}
    try {
      localStorage.setItem(LOCAL_KEY_COMMITTEES, JSON.stringify(committees));
    } catch {}
  }

  // ================= EXAM LOCKS & APPROVAL ================= //

  static async getExamLock(className: string, term: 'الفترة الأولى' | 'الفترة الثانية' | 'نهاية العام' = 'نهاية العام'): Promise<ExamLock> {
    const id = `${className}_${term}`;
    if (this.cachedLocks.has(id)) {
      return this.cachedLocks.get(id)!;
    }

    try {
      const lock = await indexedDBManager.get<ExamLock>('exam_locks', id);
      if (lock) {
        this.cachedLocks.set(id, lock);
        return lock;
      }
    } catch {}

    try {
      const local = localStorage.getItem(LOCAL_KEY_LOCKS);
      if (local) {
        const map = JSON.parse(local);
        if (map[id]) {
          this.cachedLocks.set(id, map[id]);
          return map[id];
        }
      }
    } catch {}

    const defaultLock: ExamLock = {
      id,
      className,
      academicYear: '2025 - 2026 م',
      term,
      isLocked: false,
      isReleasedToParents: false
    };
    return defaultLock;
  }

  static async saveExamLock(lock: ExamLock): Promise<void> {
    this.cachedLocks.set(lock.id, lock);
    try {
      await indexedDBManager.put('exam_locks', lock);
    } catch {}
    try {
      const local = localStorage.getItem(LOCAL_KEY_LOCKS);
      const map = local ? JSON.parse(local) : {};
      map[lock.id] = lock;
      localStorage.setItem(LOCAL_KEY_LOCKS, JSON.stringify(map));
    } catch {}
  }
}
