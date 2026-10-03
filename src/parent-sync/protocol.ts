/**
 * ============================================================================
 * عقد البيانات بين حاسوب المدرسة وتطبيق ولي الأمر
 * ----------------------------------------------------------------------------
 * ParentView: ما يراه ولي الأمر عن ابن واحد — يُبنى على حاسوب المدرسة ويُشفَّر
 * ببطاقة ولي الأمر. لا يحوي بيانات أي طالب آخر ولا أسماء زملاء ولا أرقام هواتف.
 * ParentInboxMessage: ما يرسله ولي الأمر (رسالة، تأكيد استدعاء، عذر) — يُشفَّر
 * بنفس المفتاح وتطبّقه المدرسة بعد التحقق.
 * ============================================================================
 */
import type {
  Student,
  NotificationItem,
  TeacherConversation,
  ParentSummon,
  TeacherAccount,
  SchoolProfile,
  AttendanceStatus,
} from '../types';
import type { StudentFullExamReport } from '../services/exams/libyanExamEngine';

export const PARENT_VIEW_VERSION = 1;
const MAX_ATTENDANCE = 200;
const MAX_NOTIFICATIONS = 40;
const MAX_MESSAGES_PER_THREAD = 60;

export interface ParentViewThreadMessage {
  id: string;
  fromParent: boolean;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ParentView {
  v: typeof PARENT_VIEW_VERSION;
  generatedAt: string;
  school: { name: string; phone: string; academicYear: string; district: string };
  student: { id: string; name: string; className: string; grade: string; gender: 'male' | 'female' };
  attendance: { date: string; status: AttendanceStatus; note?: string }[];
  behaviorPoints: number;
  /** held = الكنترول اعتمد وقفل الفصل ولم ينشر — كل الدرجات محجوبة مؤقتاً */
  grades: { held: boolean; items: { subjectName: string; teacherName: string; total: number; maxTotal: number; appreciation: string }[] };
  /** النتيجة الرسمية بعد نشر الكنترول فقط */
  official: StudentFullExamReport | null;
  notifications: { id: string; title: string; message: string; date: string; time: string; category: NotificationItem['category'] }[];
  summons: { id: string; reason: string; requestedDate: string; requestedTime: string; status: ParentSummon['status']; parentConfirmedAt?: string }[];
  contacts: { teacherId: string; name: string; subject: string; isCounselor: boolean }[];
  threads: { teacherId: string; messages: ParentViewThreadMessage[] }[];
}

export type ParentInboxMessage =
  | { id: string; type: 'chat'; studentId: string; teacherId: string; text: string; sentAt: string }
  | { id: string; type: 'summons-confirm'; studentId: string; summonsId: string; sentAt: string }
  | { id: string; type: 'excuse'; studentId: string; date: string; reason: string; sentAt: string };

export const MAX_INBOX_TEXT = 1000;

/** رقم الدخول المطبوع على بطاقة ولي الأمر: الرقم الوطني أولاً ثم رقم القيد */
export const parentLoginId = (s: Pick<Student, 'nationalNumber' | 'studentNumber' | 'nationalId' | 'linkCode'>) =>
  s.nationalNumber || s.studentNumber || s.nationalId || s.linkCode;

const isCounselor = (t: Pick<TeacherAccount, 'code' | 'subjectCode'>) =>
  t.code?.toUpperCase() === 'LIB-SOC-01' || t.subjectCode === 'COUNSEL';

/** معلمو فصل الطالب + الأخصائي الاجتماعي (نفس قاعدة المحادثة داخل المنظومة) */
export function contactsForStudent(student: Pick<Student, 'className'>, teachers: TeacherAccount[]) {
  const active = teachers.filter(t => !t.status || t.status === 'active');
  const ofClass = active.filter(t => !isCounselor(t) && (t.assignedClasses || []).some(c => c === student.className));
  const counselors = active.filter(isCounselor);
  return [...ofClass, ...counselors].map(t => ({
    teacherId: t.id,
    name: t.name,
    subject: isCounselor(t) ? 'الأخصائي الاجتماعي' : t.subject,
    isCounselor: isCounselor(t),
  }));
}

/** نفس منطق نطاق الإشعارات لولي الأمر داخل المنظومة */
export function notificationsForStudent(student: Pick<Student, 'id' | 'name'>, all: NotificationItem[], nameIsUnique: boolean) {
  return all.filter(n => {
    if (n.targetRole && n.targetRole !== 'all' && n.targetRole !== 'parent') return false;
    if (n.studentId) return n.studentId === student.id;
    if (n.studentName) return nameIsUnique && n.studentName === student.name;
    return n.targetRole === 'all' || n.targetRole === 'parent';
  });
}

export interface BuildParentViewInput {
  student: Student;
  school: SchoolProfile;
  teachers: TeacherAccount[];
  notifications: NotificationItem[];
  conversations: TeacherConversation[];
  summons: ParentSummon[];
  nameIsUnique: boolean;
  exam: { held: boolean; official: StudentFullExamReport | null };
  now?: Date;
}

export function buildParentView(i: BuildParentViewInput): ParentView {
  const s = i.student;
  const contacts = contactsForStudent(s, i.teachers);
  const contactIds = new Set(contacts.map(c => c.teacherId));
  const threads = i.conversations
    .filter(c => c.studentId === s.id && contactIds.has(c.teacherId))
    .map(c => ({
      teacherId: c.teacherId,
      messages: (c.messages || [])
        .filter(m => m.text)
        .slice(-MAX_MESSAGES_PER_THREAD)
        .map(m => ({
          id: m.id,
          fromParent: m.senderRole === 'parent',
          senderName: m.senderRole === 'parent' ? 'أنت' : m.senderName,
          text: m.text || '',
          timestamp: m.timestamp,
        })),
    }))
    .filter(t => t.messages.length > 0);

  return {
    v: PARENT_VIEW_VERSION,
    generatedAt: (i.now || new Date()).toISOString(),
    school: {
      name: i.school.name,
      phone: i.school.directorPhone || '',
      academicYear: i.school.academicYear || '',
      district: i.school.district || '',
    },
    student: { id: s.id, name: s.name, className: s.className, grade: s.grade, gender: s.gender },
    attendance: (s.recentAttendance || []).slice(0, MAX_ATTENDANCE).map(r => ({
      date: r.date,
      status: r.status,
      ...(r.note ? { note: r.note } : {}),
    })),
    behaviorPoints: s.behaviorPointsTotal || 0,
    grades: {
      held: i.exam.held,
      items: i.exam.held
        ? []
        : (s.grades || []).map(g => ({
            subjectName: g.subjectName,
            teacherName: g.teacherName,
            total: g.total ?? 0,
            maxTotal: g.maxTotal ?? 100,
            appreciation: g.appreciation || '',
          })),
    },
    official: i.exam.official,
    notifications: notificationsForStudent(s, i.notifications, i.nameIsUnique)
      .slice(0, MAX_NOTIFICATIONS)
      .map(n => ({ id: n.id, title: n.title, message: n.message, date: n.date, time: n.time, category: n.category })),
    summons: i.summons
      .filter(sm => sm.studentId === s.id)
      .map(sm => ({
        id: sm.id,
        reason: sm.reason,
        requestedDate: sm.requestedDate,
        requestedTime: sm.requestedTime,
        status: sm.status,
        ...(sm.parentConfirmedAt ? { parentConfirmedAt: sm.parentConfirmedAt } : {}),
      })),
    contacts,
    threads,
  };
}

/** بصمة المحتوى (بدون وقت التوليد) لتجنب رفع ما لم يتغير */
export function viewFingerprintSource(v: ParentView): string {
  const { generatedAt, ...rest } = v;
  return JSON.stringify(rest);
}

/** فحص رسالة واردة قبل تطبيقها (الخادم والطرف المرسل غير موثوقين) */
export function validateInboxMessage(m: unknown, expectedStudentId: string): ParentInboxMessage | null {
  if (!m || typeof m !== 'object') return null;
  const x = m as Record<string, unknown>;
  if (typeof x.id !== 'string' || x.id.length > 80 || x.studentId !== expectedStudentId || typeof x.sentAt !== 'string') return null;
  if (x.type === 'chat' && typeof x.teacherId === 'string' && typeof x.text === 'string' && x.text.trim() && x.text.length <= MAX_INBOX_TEXT) {
    return { id: x.id, type: 'chat', studentId: expectedStudentId, teacherId: x.teacherId, text: x.text.trim(), sentAt: x.sentAt };
  }
  if (x.type === 'summons-confirm' && typeof x.summonsId === 'string') {
    return { id: x.id, type: 'summons-confirm', studentId: expectedStudentId, summonsId: x.summonsId, sentAt: x.sentAt };
  }
  if (x.type === 'excuse' && typeof x.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x.date) && typeof x.reason === 'string' && x.reason.trim() && x.reason.length <= MAX_INBOX_TEXT) {
    return { id: x.id, type: 'excuse', studentId: expectedStudentId, date: x.date, reason: x.reason.trim(), sentAt: x.sentAt };
  }
  return null;
}
