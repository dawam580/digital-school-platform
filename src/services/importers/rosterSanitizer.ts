/**
 * ============================================================================
 * تنظيف قوائم الطلاب المستوردة (Excel / حزمة مدرسة)
 * ----------------------------------------------------------------------------
 * القاعدة: نأخذ من الملف بيانات الهوية الحقيقية فقط (الاسم، الرقم الوطني، رقم القيد،
 * الصف والفصل، الأم، الميلاد، ولي الأمر وهاتفه). لا نختلق رقماً وطنياً ولا هاتفاً
 * ولا درجات ولا نسبة حضور — كل ذلك يُرصد لاحقاً داخل المنظومة.
 * هاتف ولي الأمر الوهمي/غير الليبي يُترك فارغاً، وإلا رُبط كل الطلاب كإخوة لنفس الحساب.
 * ============================================================================
 */
import type { Student } from '../../types';
import { LIBYAN_PHONE_RE, normalizeLibyanPhone } from '../security/authEngine';
import { getCleanAvatar } from '../../utils/avatarHelper';
import { currentAcademicYear } from '../domain/libyanCalendar';

/** أرقام تعبئة معروفة استُخدمت في بيانات تجريبية أو قوائم مولّدة */
const PLACEHOLDER_PHONES = new Set(['0912345678', '0550000000', '0922465676', '0900000000']);

/** هاتف ولي أمر صالح للربط (ليبي حقيقي الصيغة وليس رقم تعبئة)، أو '' */
export function cleanParentPhone(raw: string | undefined | null): string {
  const p = normalizeLibyanPhone(String(raw || ''));
  if (!LIBYAN_PHONE_RE.test(p)) return '';
  if (PLACEHOLDER_PHONES.has(p)) return '';
  // 0912000001 … 0912000999: أرقام متسلسلة مولّدة لقائمة الطلاب
  if (/^0912000\d{3}$/.test(p)) return '';
  return p;
}

/** رقم وطني ليبي (12 خانة) أو '' — لا نولّد أرقاماً */
export function cleanNationalNumber(raw: string | undefined | null): string {
  const d = String(raw || '').replace(/[٠-٩]/g, c => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/\D/g, '');
  return /^\d{12}$/.test(d) ? d : '';
}

const clean = (v: unknown) => {
  const s = String(v ?? '').trim();
  return s === '—' || s === '-' || s === 'غير مسجل' ? '' : s;
};

const GRADE_BY_NUMBER: Record<number, string> = {
  1: 'الصف الأول الأساسي', 2: 'الصف الثاني الأساسي', 3: 'الصف الثالث الأساسي',
  4: 'الصف الرابع الأساسي', 5: 'الصف الخامس الأساسي', 6: 'الصف السادس الأساسي',
  7: 'الصف السابع الأساسي', 8: 'الصف الثامن الأساسي', 9: 'الصف التاسع الأساسي',
};

/** الصف من رقم الفصل ("5/1 صباح" ← الصف الخامس الأساسي)، أو '' */
export function gradeFromClassName(className: string | undefined | null): string {
  const m = String(className || '').match(/^\s*(\d)\s*\//);
  return m ? GRADE_BY_NUMBER[Number(m[1])] || '' : '';
}

/** أسماء ولي أمر مولّدة مثل "ولي أمر أحمد ..." أو "ولي أمر الطالب أحمد" */
const isPlaceholderParentName = (n: string) => /^ولي (أمر|الأمر)( الطالب)?(\s|$)/.test(n);

export interface RosterRow {
  name: string;
  nationalNumber?: string;
  studentNumber?: string;
  grade?: string;
  className?: string;
  motherName?: string;
  birthDate?: string;
  birthPlace?: string;
  parentName?: string;
  parentPhone?: string;
  gender?: string;
}

const normalizeGender = (g: string | undefined, nationalNumber: string): 'male' | 'female' => {
  const v = clean(g).toLowerCase();
  if (v === 'female' || v === 'أنثى' || v === 'انثى' || v === 'f') return 'female';
  if (v === 'male' || v === 'ذكر' || v === 'm') return 'male';
  // الرقم الوطني الليبي: الخانة الأولى 1 ذكر / 2 أنثى
  return nationalNumber.startsWith('2') ? 'female' : 'male';
};

/** سجل طالب جديد نظيف من صف قائمة رسمية — بلا درجات أو حضور مختلق */
export function studentFromRosterRow(row: RosterRow, index: number, idPrefix = 'std-imp'): Student | null {
  const name = clean(row.name).replace(/\s+/g, ' ');
  if (!name) return null;
  const nationalNumber = cleanNationalNumber(row.nationalNumber);
  const studentNumber = clean(row.studentNumber);
  const gender = normalizeGender(row.gender, nationalNumber);
  const parentName = clean(row.parentName);
  const key = nationalNumber || studentNumber || `${Date.now().toString(36)}-${index}`;
  return {
    id: `${idPrefix}-${key}`,
    name,
    nationalId: nationalNumber,
    nationalNumber,
    studentNumber,
    linkCode: `STD-${key}`,
    avatar: getCleanAvatar(name, gender),
    grade: clean(row.grade),
    className: clean(row.className),
    gender,
    motherName: clean(row.motherName),
    birthDate: /^\d{4}-\d{2}-\d{2}$/.test(clean(row.birthDate)) ? clean(row.birthDate) : '',
    birthPlace: clean(row.birthPlace),
    parentName: isPlaceholderParentName(parentName) ? '' : parentName,
    parentPhone: cleanParentPhone(row.parentPhone),
    parentEmail: '',
    academicYear: currentAcademicYear(),
    status: 'present',
    attendanceRate: 100,
    academicAverage: 0,
    behaviorRating: 'جيد',
    behaviorPointsTotal: 0,
    behaviorPoints: [],
    competencies: [],
    subjects: [],
    recentAttendance: [],
    notes: [],
    badges: [],
  };
}

/**
 * تنظيف طلاب حزمة مدرسة مستوردة: تُحفظ الدرجات والحضور كما هي (حزمة من مدرسة حقيقية)،
 * ويُزال فقط ما يكسر العزل: هواتف التعبئة، أسماء ولي الأمر المولدة، البريد المولّد.
 */
export function sanitizePackageStudents(list: Student[]): Student[] {
  return list.map(s => {
    const parentName = clean(s.parentName);
    return {
      ...s,
      parentPhone: cleanParentPhone(s.parentPhone),
      parentName: isPlaceholderParentName(parentName) ? '' : parentName,
      parentEmail: /@(baour|school)\.edu(\.ly)?$/i.test(s.parentEmail || '') ? '' : (s.parentEmail || ''),
      motherName: clean(s.motherName),
    };
  });
}

/** مفتاح منع التكرار عند الدمج: الرقم الوطني ← رقم القيد ← المعرّف */
export const studentDedupKey = (s: Pick<Student, 'id' | 'studentNumber'> & { nationalNumber?: string; nationalId?: string }) =>
  (s.nationalNumber || s.nationalId) ? `nn:${s.nationalNumber || s.nationalId}` : s.studentNumber ? `sn:${s.studentNumber}` : `id:${s.id}`;
