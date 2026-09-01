export type UserRole = 'admin' | 'teacher' | 'parent';

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'unexcused';

export interface BehaviorPoint {
  id: string;
  category: 'positive' | 'needs_work';
  title: string;
  points: number; // e.g. +3 or -1
  icon: string;
  date: string;
  teacher: string;
}

export interface StudentCompetency {
  name: string;
  score: number; // 0 to 100
  maxScore: number;
}

export interface DailyTimelineItem {
  id: string;
  time: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  room?: string;
  teacher?: string;
  note?: string;
}

export interface Student {
  id: string;
  name: string;
  nationalId: string;
  studentNumber: string;
  linkCode: string;
  avatar: string;
  grade: string;
  className: string;
  gender: 'male' | 'female';
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  status: AttendanceStatus;
  attendanceRate: number; // percentage e.g. 96
  academicAverage: number; // e.g. 94.5
  behaviorRating: 'ممتاز' | 'جيد جداً' | 'جيد' | 'يحتاج تحسين';
  behaviorPointsTotal: number;
  behaviorPoints: BehaviorPoint[];
  competencies: StudentCompetency[];
  lastSeenTime?: string;
  subjects: {
    name: string;
    score: number;
    maxScore: number;
    teacher: string;
    evaluation: string;
  }[];
  recentAttendance: {
    date: string;
    status: AttendanceStatus;
    note?: string;
  }[];
  notes: {
    id: string;
    date: string;
    teacher: string;
    type: 'positive' | 'warning' | 'info';
    text: string;
  }[];
  badges: {
    id: string;
    title: string;
    icon: string;
    date: string;
    description: string;
  }[];
}

export interface SchoolClass {
  id: string;
  name: string;
  grade: string;
  studentCount: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  supervisor: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  category: 'attendance' | 'admin' | 'academic' | 'urgent';
  read: boolean;
  targetRole?: UserRole | 'all';
  studentName?: string;
}

export interface DailyReportData {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  dayOfWeek: string;
  overallMood: 'ممتاز' | 'نشط' | 'هادئ' | 'متعب';
  attendanceStatus: AttendanceStatus;
  checkInTime: string;
  checkOutTime: string;
  timeline: DailyTimelineItem[];
  subjectsSummary: {
    subject: string;
    topic: string;
    participation: number; // out of 5
    homeworkStatus: 'مكتمل' | 'غير مكتمل' | 'لا يوجد';
    teacherNote?: string;
  }[];
  behaviorNotes: string;
  achievements: string[];
  tasksForTomorrow: string[];
}
