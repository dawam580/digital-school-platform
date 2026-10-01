/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * بيانات استعراضية وهمية بالكامل (Demo Dataset)
 * ----------------------------------------------------------------------------
 * كل الأسماء والأرقام هنا مُولَّدة آلياً ولا تخص أي طالب حقيقي.
 * الأرقام الوطنية تبدأ بـ 9999 (نطاق غير مستخدم) حتى لا تلتبس ببيانات حقيقية.
 * لا تُحمَّل تلقائياً — فقط عند ضغط المدير على زر "تحميل بيانات تجريبية".
 * ============================================================================
 */

import { Student } from '../types';

export const DEMO_SCHOOL_INFO = {
  schoolName: 'مدرسة النموذج التجريبية للتعليم الأساسي',
  schoolCode: '00000',
  municipality: 'مدينة تجريبية',
  academicYear: '2025-2026 م',
  classesList: [
    '1/1 صباح', '2/1 صباح', '3/1 صباح', '4/1 صباح', '5/1 صباح',
    '6/1 صباح', '7/1 صباح', '8/1 صباح', '9/1 صباح'
  ]
};

const GRADE_NAMES = [
  'الصف الأول الأساسي', 'الصف الثاني الأساسي', 'الصف الثالث الأساسي',
  'الصف الرابع الأساسي', 'الصف الخامس الأساسي', 'الصف السادس الأساسي',
  'الصف السابع الأساسي', 'الصف الثامن الأساسي', 'الصف التاسع الأساسي'
];

const MALE_NAMES = ['أحمد', 'محمد', 'علي', 'عمر', 'يوسف', 'خالد', 'إبراهيم', 'حمزة', 'آدم', 'مصطفى', 'سالم', 'أنس'];
const FEMALE_NAMES = ['مريم', 'فاطمة', 'سارة', 'هند', 'آمنة', 'نور', 'ريم', 'خديجة', 'سلمى', 'جنى', 'ملاك', 'رحاب'];
const FATHER_NAMES = ['عبدالله', 'محمود', 'صالح', 'حسن', 'عادل', 'نبيل', 'فرج', 'مفتاح', 'رمضان', 'جمعة'];
const FAMILY_NAMES = ['التجريبي', 'النموذجي', 'المثالي', 'الافتراضي', 'المعياري', 'الاختباري'];

const SUBJECTS = ['الرياضيات', 'اللغة العربية', 'العلوم الطبيعية', 'اللغة الإنجليزية', 'الحاسوب'];

/** مولد أرقام شبه عشوائية ثابت البذرة: نفس البيانات في كل تشغيل */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function evaluationOf(score: number): string {
  if (score >= 85) return 'ممتاز';
  if (score >= 75) return 'جيد جداً';
  if (score >= 65) return 'جيد';
  if (score >= 50) return 'مقبول';
  return 'دور ثانٍ';
}

function buildDemoStudents(): Student[] {
  const rand = seeded(2026);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
  const students: Student[] = [];
  const perClass = 8;

  DEMO_SCHOOL_INFO.classesList.forEach((className, gradeIdx) => {
    for (let i = 0; i < perClass; i++) {
      const seq = gradeIdx * perClass + i + 1;
      const gender: 'male' | 'female' = i % 2 === 0 ? 'male' : 'female';
      const first = gender === 'male' ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
      const father = pick(FATHER_NAMES);
      const family = pick(FAMILY_NAMES);
      const name = `${first} ${father} ${family}`;
      const studentNumber = `D${String(seq).padStart(6, '0')}`;
      const nationalNumber = `9999${String(seq).padStart(8, '0')}`;
      const birthYear = 2019 - gradeIdx;

      const subjects = SUBJECTS.map(subject => {
        const score = 55 + Math.floor(rand() * 45);
        return { name: subject, score, maxScore: 100, teacher: 'أ. معلم تجريبي', evaluation: evaluationOf(score) };
      });
      const total = Math.round(subjects.reduce((a, s) => a + s.score, 0) / subjects.length);
      const coursework = Math.round(total * 0.4);

      students.push({
        id: `std-demo-${seq}`,
        name,
        nationalNumber,
        nationalId: nationalNumber,
        studentNumber,
        linkCode: `DEMO-${String(seq).padStart(3, '0')}`,
        grade: GRADE_NAMES[gradeIdx],
        className,
        motherName: '—',
        birthDate: `${birthYear}-${String(1 + (seq % 12)).padStart(2, '0')}-${String(1 + (seq % 27)).padStart(2, '0')}`,
        birthPlace: DEMO_SCHOOL_INFO.municipality,
        parentName: `ولي أمر ${name}`,
        parentPhone: `0910000${String(seq).padStart(3, '0')}`,
        parentEmail: `parent.${studentNumber.toLowerCase()}@demo.invalid`,
        gender,
        status: 'present',
        attendanceRate: 80 + Math.floor(rand() * 20),
        academicAverage: total,
        courseworkScore: coursework,
        examScore: total - coursework,
        totalScore: total,
        appreciation: evaluationOf(total),
        behaviorRating: total >= 85 ? 'ممتاز' : total >= 75 ? 'جيد جداً' : 'جيد',
        behaviorPointsTotal: Math.floor(rand() * 30),
        avatar: '',
        competencies: [],
        behaviorPoints: [],
        subjects
      });
    }
  });

  return students;
}

export const DEMO_STUDENTS: Student[] = buildDemoStudents();
