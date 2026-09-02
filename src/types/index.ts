export type UserRole = 'admin' | 'teacher' | 'parent' | 'counselor';

export interface TeacherAccount {
  id: string;
  code: string; // Unique teacher code e.g. TCH-MATH-101
  name: string; // e.g. أ. أحمد الغامدي
  phone: string;
  subject: string; // e.g. الرياضيات
  subjectCode: string; // e.g. MATH
  assignedClasses: string[]; // e.g. ['3/أ', '3/ب', '2/أ']
  avatar: string;
  email?: string;
}

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

export interface SubjectGrade {
  id: string;
  subjectName: string;
  code: string;
  icon: string;
  teacherName: string;
  period1: number; // e.g. 20 / 20
  period2: number; // e.g. 20 / 20
  quizzes: number; // e.g. 10 / 10
  homework: number; // e.g. 10 / 10
  participation: number; // e.g. 10 / 10
  finalExam: number; // e.g. 30 / 30
  total: number; // calculated e.g. 100
  maxTotal: number; // 100
  letter: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  appreciation: string;
}

export interface AssignmentQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  points: number;
}

export interface Assignment {
  id: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  teacherName: string;
  totalPoints: number;
  status: 'pending' | 'submitted' | 'graded';
  studentScore?: number;
  questions: AssignmentQuestion[];
  teacherFeedback?: string;
}

export interface ChatMessage {
  id: string;
  senderRole: UserRole;
  senderName: string;
  text?: string;
  timestamp: string;
  isVoice?: boolean;
  voiceDuration?: string;
  imageUrl?: string;
  read: boolean;
}

export interface TeacherConversation {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface SchedulePeriod {
  periodNumber: number;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  icon: string;
  color: string;
}

export interface DaySchedule {
  dayName: string;
  dayIndex: number; // 0: Sunday, 1: Monday, ...
  periods: SchedulePeriod[];
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
  academicAverage: number; // e.g. 94.5 (overall percentage)
  nationalNumber?: string; // Libyan 12-digit National Number
  courseworkScore?: number; // أعمال السنة من 40
  examScore?: number; // امتحان نهاية الفصل من 60
  totalScore?: number; // المجموع من 100
  appreciation?: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'دور ثانٍ' | string;
  behaviorRating: 'ممتاز' | 'جيد جداً' | 'جيد' | 'يحتاج تحسين';
  behaviorPointsTotal: number;
  points?: number;
  behaviorPoints: BehaviorPoint[];
  competencies: StudentCompetency[];
  lastSeenTime?: string;
  grades?: SubjectGrade[];
  assignments?: Assignment[];
  subjects: {
    name: string;
    score: number;
    maxScore: number;
    teacher: string;
    evaluation: string;
  }[];
  recentAttendance?: {
    date: string;
    status: AttendanceStatus;
    note?: string;
  }[];
  notes?: {
    id: string;
    date: string;
    teacher: string;
    type: 'positive' | 'warning' | 'info';
    text: string;
  }[];
  badges?: {
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
  behaviorNotes?: string;
  achievements?: string[];
  tasksForTomorrow?: string[];
  teacherNotes?: string | any[];
  parentAcknowledged?: boolean;
}

export interface SocialCaseStudy {
  id: string;
  studentId: string;
  studentName: string;
  studentNationalNumber: string;
  grade: string;
  className: string;
  category: 'absence_dropout' | 'behavior_bullying' | 'academic_lag' | 'family_socioeconomic' | 'psychological_crisis' | 'special_needs';
  categoryLabel: string;
  status: 'open' | 'in_progress' | 'resolved' | 'monitoring';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  openDate: string;
  symptomsAndObservations: string;
  diagnosis: string;
  actionPlan: string[];
  parentEngagement: 'cooperative' | 'partial' | 'unresponsive';
  progressEvaluation: string;
  sessionsCount: number;
  lastSessionDate?: string;
}

export interface CounselingSession {
  id: string;
  caseId?: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  sessionType: 'individual' | 'group' | 'parent_conference' | 'teacher_consultation';
  objective: string;
  discussionSummary: string;
  recommendations: string;
  nextFollowUpDate: string;
  counselorName: string;
}

export interface CommonProblemSolution {
  id: string;
  category: 'absence_dropout' | 'behavior_bullying' | 'academic_lag' | 'family_socioeconomic' | 'psychological_crisis' | 'special_needs';
  categoryLabel: string;
  title: string;
  description: string;
  symptoms: string[];
  rootCausesLibya: string[];
  approvedInterventions: string[];
  parentGuidelines: string[];
  expectedOutcome: string;
}

export interface StudentInfraction {
  id: string;
  studentId: string;
  studentName: string;
  type: 'absence' | 'lateness' | 'disruption' | 'misconduct' | 'homework_missing' | 'custom';
  typeLabel: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  reportedBy: string;
  severity: 'warning' | 'alert' | 'urgent';
  notes?: string;
}

export interface AutoSummonCard {
  id: string;
  studentId: string;
  studentName: string;
  studentNationalNumber: string;
  grade: string;
  className: string;
  parentName: string;
  parentPhone: string;
  periodType: 'weekly' | 'monthly';
  periodLabel: string;
  periodKey: string; // For deduplication (e.g. 2025-W36, 2025-M09)
  totalWarningsCount: number;
  breakdown: {
    absencesCount: number;
    misconductCount: number;
    latenessCount: number;
    academicCount: number;
  };
  infractions: StudentInfraction[];
  triggeredAt: string;
  triggeredDateFormatted: string;
  status: 'pending_counselor' | 'summon_sent' | 'interview_completed' | 'case_opened' | 'archived';
  summonDate?: string;
  summonTime?: string;
  interviewNotes?: string;
  parentFeedback?: string;
  counselorNotes?: string;
}

export interface ParentSummon {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  reason: string;
  requestedDate: string;
  requestedTime: string;
  status: 'sent' | 'attended' | 'rescheduled' | 'no_show';
  outcomeNotes?: string;
  cardId?: string;
}

export type AcademicLevel = 'ممتاز' | 'جيد جداً' | 'مقبول' | 'مقبول أحياناً' | 'ضعيف';
export type HomeworkPerformance = 'نشط' | 'متوسط' | 'ضعيف';
export type ClassroomParticipation = 'نشط' | 'متوسط' | 'ضعيف';
export type ClassroomBehavior = 'منضبط' | 'يحتاج توجيه' | 'مخالف';

export interface StudentFollowUpForm {
  id: string;
  studentId: string;
  studentName: string;
  studentNationalNumber: string;
  grade: string;
  className: string;
  academicYear: string;
  semester: string;
  counselorName: string;
  parentName: string;
  parentPhone: string;
  academicLevel: AcademicLevel;
  homeworkPerformance: HomeworkPerformance;
  classroomParticipation: ClassroomParticipation;
  classroomBehavior: ClassroomBehavior;
  subjectName: string;
  teacherName: string;
  teacherNotes: string;
  recommendations: {
    needsHomeworkFollowUp: boolean;
    needsRemedialSupport: boolean;
    needsBehavioralGuidance: boolean;
    encourageGoodLevel: boolean;
    customNote?: string;
  };
  preparedDate: string;
  counselorSignature: string;
  principalSignature: string;
  teacherSignature: string;
  parentSignature?: string;
  parentReceivedDate?: string;
  parentAcknowledged: boolean;
}



