import { Student, SchoolClass, NotificationItem, DailyReportData, BehaviorPoint } from '../types';

const STORAGE_KEY_STUDENTS = 'madrasa_db_students_v2';
const STORAGE_KEY_CLASSES = 'madrasa_db_classes_v2';
const STORAGE_KEY_NOTIFICATIONS = 'madrasa_db_notifications_v2';
const STORAGE_KEY_REPORTS = 'madrasa_db_reports_v2';

export const SEED_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'ريان فهد العتيبي',
    nationalId: '1098765432',
    studentNumber: '2024-0104',
    linkCode: 'SCH-2026-R1',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    grade: 'الصف الخامس الابتدائي',
    className: 'خامس / أ',
    gender: 'male',
    parentName: 'فهد بن ناصر العتيبي',
    parentPhone: '0551234567',
    parentEmail: 'fahad.otb@gmail.com',
    status: 'present',
    attendanceRate: 98,
    academicAverage: 96.5,
    behaviorRating: 'ممتاز',
    behaviorPointsTotal: 48,
    lastSeenTime: '07:15 صباحاً (البوابة الرئيسية)',
    competencies: [
      { name: 'حل المشكلات', score: 95, maxScore: 100 },
      { name: 'التفكير الإبداعي', score: 92, maxScore: 100 },
      { name: 'العمل الجماعي', score: 98, maxScore: 100 },
      { name: 'الانضباط والمسؤولية', score: 96, maxScore: 100 },
      { name: 'التعبير اللغوي', score: 94, maxScore: 100 },
      { name: 'اللياقة والنشاط', score: 100, maxScore: 100 },
    ],
    behaviorPoints: [
      { id: 'bp-1', category: 'positive', title: 'مشاركة ممتازة في الرياضيات', points: 5, icon: '🌟', date: 'اليوم 08:30 ص', teacher: 'أ. أحمد الغامدي' },
      { id: 'bp-2', category: 'positive', title: 'مساعدة الزملاء في التجربة', points: 3, icon: '🤝', date: 'اليوم 10:15 ص', teacher: 'أ. خالد الشهري' },
      { id: 'bp-3', category: 'positive', title: 'حل الواجب الإضافي', points: 4, icon: '📚', date: 'أمس', teacher: 'أ. عبدالمحسن الدوسري' },
    ],
    badges: [
      { id: 'b1', title: 'نجم الحساب الذهني', icon: '🏆', date: '28 أغسطس 2026', description: 'المركز الأول في مسابقة الرياضيات الصفية' },
      { id: 'b2', title: 'صديق البيئة والمكتبة', icon: '🌿', date: '25 أغسطس 2026', description: 'المشاركة الفعالة في تنظيم المركز التعليمي' },
      { id: 'b3', title: 'فارس الانضباط الصباحي', icon: '⭐', date: '20 أغسطس 2026', description: 'حضور مبكر بدون أي تأخير طوال الشهر' }
    ],
    subjects: [
      { name: 'الرياضيات', score: 98, maxScore: 100, teacher: 'أ. أحمد الغامدي', evaluation: 'متميز في حل المعادلات والتفكير الهندسي' },
      { name: 'لغتي الجميلة', score: 95, maxScore: 100, teacher: 'أ. عبدالمحسن الدوسري', evaluation: 'قراءة معبرة وإملاء سليم' },
      { name: 'العلوم', score: 97, maxScore: 100, teacher: 'أ. خالد الشهري', evaluation: 'مشاركة ممتازة في التجارب المعملية' },
      { name: 'الدراسات الإسلامية', score: 99, maxScore: 100, teacher: 'أ. محمد السبيعي', evaluation: 'حفظ متقن وسلوك قدوة' },
      { name: 'اللغة الإنجليزية', score: 94, maxScore: 100, teacher: 'Mr. Tariq', evaluation: 'Fluent pronunciation and active in class' },
      { name: 'التربية البدنية', score: 100, maxScore: 100, teacher: 'ك. صالح الزهراني', evaluation: 'لياقة عالية وروح رياضية' },
    ],
    recentAttendance: [
      { date: '2026-09-01', status: 'present', note: 'حضور مبكر' },
      { date: '2026-08-31', status: 'present' },
      { date: '2026-08-30', status: 'late', note: 'تأخر 10 دقائق بسبب الازدحام' },
      { date: '2026-08-27', status: 'present' },
      { date: '2026-08-26', status: 'present' },
    ],
    notes: [
      { id: 'n1', date: '2026-08-31', teacher: 'أ. أحمد الغامدي', type: 'positive', text: 'حصل ريان على نجمة الأسبوع في مادة الرياضيات للتفوق في مسابقة الحساب الذهني.' },
      { id: 'n2', date: '2026-08-28', teacher: 'المرشد الطلابي', type: 'info', text: 'تم إجراء الفحص الدوري السنوي للسمع والبصر، والنتائج ممتازة.' }
    ]
  },
  {
    id: 'std-2',
    name: 'سارة خالد القحطاني',
    nationalId: '1087654321',
    studentNumber: '2024-0105',
    linkCode: 'SCH-2026-S2',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    grade: 'الصف الخامس الابتدائي',
    className: 'خامس / أ',
    gender: 'female',
    parentName: 'خالد بن سعد القحطاني',
    parentPhone: '0559876543',
    parentEmail: 'khaled.qahtani@outlook.com',
    status: 'present',
    attendanceRate: 99,
    academicAverage: 98.2,
    behaviorRating: 'ممتاز',
    behaviorPointsTotal: 52,
    lastSeenTime: '07:10 صباحاً (الحافلة المدرسية #12)',
    competencies: [
      { name: 'حل المشكلات', score: 98, maxScore: 100 },
      { name: 'التفكير الإبداعي', score: 96, maxScore: 100 },
      { name: 'العمل الجماعي', score: 95, maxScore: 100 },
      { name: 'الانضباط والمسؤولية', score: 100, maxScore: 100 },
      { name: 'التعبير اللغوي', score: 99, maxScore: 100 },
      { name: 'اللياقة والنشاط', score: 94, maxScore: 100 },
    ],
    behaviorPoints: [
      { id: 'bp-4', category: 'positive', title: 'إلقاء متميز في الإذاعة', points: 5, icon: '🎤', date: 'اليوم 07:15 ص', teacher: 'رائدة النشاط' }
    ],
    badges: [
      { id: 'b4', title: 'فصيحة الأسبوع', icon: '📖', date: '26 أغسطس 2026', description: 'إلقاء إذاعي مميز وطلاقة في التعبير' }
    ],
    subjects: [
      { name: 'الرياضيات', score: 99, maxScore: 100, teacher: 'أ. أحمد الغامدي', evaluation: 'دقة فائقة في حل المسائل' },
      { name: 'لغتي الجميلة', score: 100, maxScore: 100, teacher: 'أ. عبدالمحسن الدوسري', evaluation: 'فصاحة وإلقاء مبهر' },
      { name: 'العلوم', score: 97, maxScore: 100, teacher: 'أ. خالد الشهري', evaluation: 'شغف بالاستكشاف العلمي' },
      { name: 'الدراسات الإسلامية', score: 98, maxScore: 100, teacher: 'أ. محمد السبيعي', evaluation: 'التزام وأخلاق رفيعة' },
    ],
    recentAttendance: [
      { date: '2026-09-01', status: 'present' },
      { date: '2026-08-31', status: 'present' },
    ],
    notes: []
  },
  {
    id: 'std-3',
    name: 'عمر ياسر السعيد',
    nationalId: '1076543210',
    studentNumber: '2024-0106',
    linkCode: 'SCH-2026-O3',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    grade: 'الصف الخامس الابتدائي',
    className: 'خامس / أ',
    gender: 'male',
    parentName: 'ياسر بن سليمان السعيد',
    parentPhone: '0501122334',
    parentEmail: 'yasser.saeed@gmail.com',
    status: 'late',
    attendanceRate: 91,
    academicAverage: 88.0,
    behaviorRating: 'جيد جداً',
    behaviorPointsTotal: 25,
    lastSeenTime: '07:45 صباحاً (تأخر 20 دقيقة)',
    competencies: [
      { name: 'حل المشكلات', score: 85, maxScore: 100 },
      { name: 'التفكير الإبداعي', score: 88, maxScore: 100 },
      { name: 'العمل الجماعي', score: 90, maxScore: 100 },
      { name: 'الانضباط والمسؤولية', score: 80, maxScore: 100 },
      { name: 'التعبير اللغوي', score: 86, maxScore: 100 },
      { name: 'اللياقة والنشاط', score: 92, maxScore: 100 },
    ],
    behaviorPoints: [
      { id: 'bp-5', category: 'needs_work', title: 'تأخر عن الطابور الصباحي', points: -1, icon: '⏰', date: 'اليوم 07:45 ص', teacher: 'المشرف الإداري' }
    ],
    badges: [],
    subjects: [
      { name: 'الرياضيات', score: 85, maxScore: 100, teacher: 'أ. أحمد الغامدي', evaluation: 'يحتاج لمزيد من التركيز' },
      { name: 'لغتي الجميلة', score: 89, maxScore: 100, teacher: 'أ. عبدالمحسن الدوسري', evaluation: 'مستوى جيد مع تحسن ملحوظ' },
      { name: 'العلوم', score: 92, maxScore: 100, teacher: 'أ. خالد الشهري', evaluation: 'تفاعل إيجابي' },
    ],
    recentAttendance: [
      { date: '2026-09-01', status: 'late', note: 'تأخر 20 دقيقة' },
      { date: '2026-08-31', status: 'present' },
    ],
    notes: []
  },
  {
    id: 'std-4',
    name: 'ليان مساعد الغامدي',
    nationalId: '1065432109',
    studentNumber: '2024-0107',
    linkCode: 'SCH-2026-L4',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    grade: 'الصف الخامس الابتدائي',
    className: 'خامس / ب',
    gender: 'female',
    parentName: 'مساعد بن علي الغامدي',
    parentPhone: '0543322110',
    parentEmail: 'mosaad.gh@gmail.com',
    status: 'unexcused',
    attendanceRate: 89,
    academicAverage: 91.4,
    behaviorRating: 'ممتاز',
    behaviorPointsTotal: 34,
    competencies: [
      { name: 'حل المشكلات', score: 90, maxScore: 100 },
      { name: 'التفكير الإبداعي', score: 94, maxScore: 100 },
      { name: 'العمل الجماعي', score: 92, maxScore: 100 },
      { name: 'الانضباط والمسؤولية', score: 85, maxScore: 100 },
      { name: 'التعبير اللغوي', score: 95, maxScore: 100 },
      { name: 'اللياقة والنشاط', score: 90, maxScore: 100 },
    ],
    behaviorPoints: [],
    badges: [],
    subjects: [
      { name: 'الرياضيات', score: 93, maxScore: 100, teacher: 'أ. هدى العنزي', evaluation: 'طالبة مجتهدة' },
      { name: 'لغتي الجميلة', score: 95, maxScore: 100, teacher: 'أ. منيرة الحربي', evaluation: 'خط وإملاء متميز' }
    ],
    recentAttendance: [
      { date: '2026-09-01', status: 'unexcused', note: 'غياب بدون إشعار مسبق' },
    ],
    notes: []
  },
  {
    id: 'std-5',
    name: 'خالد إبراهيم الشمري',
    nationalId: '1054321098',
    studentNumber: '2024-0108',
    linkCode: 'SCH-2026-K5',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    grade: 'الصف الخامس الابتدائي',
    className: 'خامس / ب',
    gender: 'male',
    parentName: 'إبراهيم بن عبدالله الشمري',
    parentPhone: '0567788990',
    parentEmail: 'ibrahim.sh@gmail.com',
    status: 'excused',
    attendanceRate: 94,
    academicAverage: 93.0,
    behaviorRating: 'ممتاز',
    behaviorPointsTotal: 38,
    competencies: [
      { name: 'حل المشكلات', score: 92, maxScore: 100 },
      { name: 'التفكير الإبداعي', score: 90, maxScore: 100 },
      { name: 'العمل الجماعي', score: 96, maxScore: 100 },
      { name: 'الانضباط والمسؤولية', score: 95, maxScore: 100 },
      { name: 'التعبير اللغوي', score: 90, maxScore: 100 },
      { name: 'اللياقة والنشاط', score: 96, maxScore: 100 },
    ],
    behaviorPoints: [],
    badges: [],
    subjects: [
      { name: 'الرياضيات', score: 90, maxScore: 100, teacher: 'أ. أحمد الغامدي', evaluation: 'مستوى متقدم' },
      { name: 'العلوم', score: 96, maxScore: 100, teacher: 'أ. خالد الشهري', evaluation: 'مشروع علمي متفوق' }
    ],
    recentAttendance: [
      { date: '2026-09-01', status: 'excused', note: 'إجازة مرضية معتمدة' },
    ],
    notes: []
  }
];

export const SEED_CLASSES: SchoolClass[] = [
  { id: 'cls-5a', name: 'خامس / أ', grade: 'الصف الخامس الابتدائي', studentCount: 28, presentCount: 26, absentCount: 1, lateCount: 1, supervisor: 'أ. أحمد الغامدي' },
  { id: 'cls-5b', name: 'خامس / ب', grade: 'الصف الخامس الابتدائي', studentCount: 27, presentCount: 24, absentCount: 2, lateCount: 1, supervisor: 'أ. خالد الشهري' },
  { id: 'cls-6a', name: 'سادس / أ', grade: 'الصف السادس الابتدائي', studentCount: 30, presentCount: 29, absentCount: 0, lateCount: 1, supervisor: 'أ. عبدالمحسن الدوسري' },
  { id: 'cls-6b', name: 'سادس / ب', grade: 'الصف السادس الابتدائي', studentCount: 29, presentCount: 27, absentCount: 1, lateCount: 1, supervisor: 'أ. محمد السبيعي' },
  { id: 'cls-4a', name: 'رابع / أ', grade: 'الصف الرابع الابتدائي', studentCount: 26, presentCount: 25, absentCount: 1, lateCount: 0, supervisor: 'أ. سلطان العتيبي' },
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'تأكيد تسجيل الحضور الصباحي',
    message: 'تم تسجيل دخول الطالب (ريان العتيبي) للمدرسة عبر البوابة الرئيسية في تمام الساعة 07:15 ص.',
    date: 'اليوم',
    time: '07:16 ص',
    category: 'attendance',
    read: false,
    studentName: 'ريان فهد العتيبي',
  },
  {
    id: 'notif-2',
    title: 'إشعار تأخر عن الطابور الصباحي',
    message: 'نحيطكم علماً بأن الطالب (عمر السعيد) وصل متأخراً في الساعة 07:45 ص.',
    date: 'اليوم',
    time: '07:46 ص',
    category: 'attendance',
    read: false,
    studentName: 'عمر ياسر السعيد',
  },
  {
    id: 'notif-3',
    title: 'تقرير يومي جديد متاح',
    message: 'تم اعتماد وتحديث التقرير اليومي الشامل للواجبات والمهام التعليمية للصف الخامس.',
    date: 'منذ ساعة',
    time: '08:30 ص',
    category: 'academic',
    read: false,
  },
  {
    id: 'notif-4',
    title: 'تنبيه غياب غير مبرر',
    message: 'تنبيه: الطالبة (ليان الغامدي) مسجلة غياب اليوم دون تقديم عذر مسبق.',
    date: 'اليوم',
    time: '08:15 ص',
    category: 'urgent',
    read: false,
    studentName: 'ليان مساعد الغامدي',
  },
  {
    id: 'notif-5',
    title: 'إشعار خروج وانصراف معتمد',
    message: 'تم تسجيل خروج الطالبة (سارة القحطاني) مع الحافلة المدرسية #12 بنجاح.',
    date: 'أمس',
    time: '01:30 م',
    category: 'attendance',
    read: true,
  }
];

export const SEED_DAILY_REPORT: DailyReportData = {
  id: 'rep-today',
  studentId: 'std-1',
  studentName: 'ريان فهد العتيبي',
  date: '2026-09-01',
  dayOfWeek: 'الثلاثاء',
  overallMood: 'نشط',
  attendanceStatus: 'present',
  checkInTime: '07:15 ص',
  checkOutTime: '01:30 م',
  timeline: [
    { id: 't1', time: '07:00 ص', title: 'الاصطفاف الصباحي والإذاعة المدرسية', status: 'completed', room: 'ساحة المدرسة الرئيسية' },
    { id: 't2', time: '07:30 ص', title: 'الحصة الأولى: الرياضيات (الكسور الاعتيادية)', status: 'completed', teacher: 'أ. أحمد الغامدي', room: 'فصل 5/أ' },
    { id: 't3', time: '08:15 ص', title: 'الحصة الثانية: العلوم (دورة الماء في الطبيعة)', status: 'completed', teacher: 'أ. خالد الشهري', room: 'مختبر العلوم' },
    { id: 't4', time: '09:00 ص', title: 'الحصة الثالثة: لغتي الجميلة (نص الاستماع)', status: 'completed', teacher: 'أ. عبدالمحسن الدوسري', room: 'فصل 5/أ' },
    { id: 't5', time: '09:45 ص', title: 'الفسحة المدرسية والإفطار الصحي', status: 'completed', room: 'المطعم المدرسي والساحات' },
    { id: 't6', time: '10:15 ص', title: 'الحصة الرابعة: الدراسات الإسلامية (سورة النبأ)', status: 'current', teacher: 'أ. محمد السبيعي', room: 'فصل 5/أ' },
    { id: 't7', time: '11:00 ص', title: 'الحصة الخامسة: اللغة الإنجليزية (Daily Routine)', status: 'upcoming', teacher: 'Mr. Tariq', room: 'فصل 5/أ' },
    { id: 't8', time: '11:45 ص', title: 'صلاة الظهر جماعة', status: 'upcoming', room: 'مصلى المدرسة' },
    { id: 't9', time: '12:15 م', title: 'الحصة السادسة: التربية البدنية والرياضية', status: 'upcoming', teacher: 'ك. صالح الزهراني', room: 'الصالة الرياضية' },
    { id: 't10', time: '01:00 م', title: 'الحصة السابعة: نشاط الموهبة والابتكار', status: 'upcoming', room: 'مركز مصادر التعلم' },
    { id: 't11', time: '01:30 م', title: 'الانصراف وركوب الحافلات المدرسية', status: 'upcoming' },
  ],
  subjectsSummary: [
    {
      subject: 'الرياضيات',
      topic: 'الكسور الاعتيادية وتحويلها',
      participation: 5,
      homeworkStatus: 'مكتمل',
      teacherNote: 'إجابات ممتازة وسريعة في حل التمارين التفاعلية على السبورة الذكية.'
    },
    {
      subject: 'العلوم',
      topic: 'دورة الماء في الطبيعة والتكثف',
      participation: 4,
      homeworkStatus: 'مكتمل',
      teacherNote: 'قام بتجربة نموذج التبخر بنجاح في مختبر العلوم.'
    },
    {
      subject: 'لغتي الجميلة',
      topic: 'نص الاستماع: قصة بطل',
      participation: 5,
      homeworkStatus: 'مكتمل',
      teacherNote: 'استيعاب قرائي فائق وإعادة سرد ممتازة للأفكار الرئيسية.'
    },
    {
      subject: 'الدراسات الإسلامية',
      topic: 'تلاوة وحفظ سورة النبأ (1-15)',
      participation: 5,
      homeworkStatus: 'لا يوجد',
      teacherNote: 'حفظ متقن ومراعاة لأحكام التجويد الأساسية.'
    },
    {
      subject: 'اللغة الإنجليزية',
      topic: 'Unit 1: My Daily Routine - Vocabulary',
      participation: 4,
      homeworkStatus: 'مكتمل',
      teacherNote: 'Great pronunciation of time expressions and daily activities.'
    }
  ],
  behaviorNotes: 'التزام رائع بالهدوء والتعاون مع الزملاء ومساعدة الفريق في نشاط العلوم الجماعي.',
  achievements: [
    'وسام التميز في حل لغز الرياضيات الصباحي',
    'شكر وتقدير من رائد الفصل لترتيب المكتبة الصفية'
  ],
  tasksForTomorrow: [
    'إحضار مجسم أو رسم بياني لدورة الماء للعلوم',
    'حل ورقة العمل رقم (3) في مادة لغتي الجميلة',
    'تجهيز الزي الرياضي لحصة التربية البدنية'
  ]
};

// Database Service API with Realtime Cloud Sync across Devices
export const db = {
  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (data) return JSON.parse(data);
    } catch {}
    this.saveStudents(SEED_STUDENTS, false);
    return SEED_STUDENTS;
  },

  saveStudents(students: Student[], broadcast = true) {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
      if (broadcast) {
        this.broadcastAction({ type: 'UPDATE_STUDENTS', students });
      }
    } catch {}
  },

  getClasses(): SchoolClass[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CLASSES);
      if (data) return JSON.parse(data);
    } catch {}
    this.saveClasses(SEED_CLASSES, false);
    return SEED_CLASSES;
  },

  saveClasses(classes: SchoolClass[], broadcast = true) {
    try {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes));
      if (broadcast) {
        this.broadcastAction({ type: 'UPDATE_CLASSES', classes });
      }
    } catch {}
  },

  getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (data) return JSON.parse(data);
    } catch {}
    this.saveNotifications(SEED_NOTIFICATIONS, false);
    return SEED_NOTIFICATIONS;
  },

  saveNotifications(notifs: NotificationItem[], broadcast = true) {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifs));
      if (broadcast) {
        this.broadcastAction({ type: 'UPDATE_NOTIFICATIONS', notifications: notifs });
      }
    } catch {}
  },

  getDailyReport(): DailyReportData {
    try {
      const data = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (data) return JSON.parse(data);
    } catch {}
    this.saveDailyReport(SEED_DAILY_REPORT, false);
    return SEED_DAILY_REPORT;
  },

  saveDailyReport(report: DailyReportData, broadcast = true) {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(report));
      if (broadcast) {
        this.broadcastAction({ type: 'UPDATE_REPORT', dailyReport: report });
      }
    } catch {}
  },

  // Broadcast action to all other devices in real-time
  async broadcastAction(payload: any) {
    try {
      if (typeof window !== 'undefined') {
        const fullState = {
          students: this.getStudents(),
          classes: this.getClasses(),
          notifications: this.getNotifications(),
          dailyReport: this.getDailyReport(),
        };

        fetch('/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, fullState })
        }).catch(() => {});
      }
    } catch {}
  },

  resetAllData() {
    this.saveStudents(SEED_STUDENTS, false);
    this.saveClasses(SEED_CLASSES, false);
    this.saveNotifications(SEED_NOTIFICATIONS, false);
    this.saveDailyReport(SEED_DAILY_REPORT, false);
    this.broadcastAction({ type: 'RESET_ALL' });
  }
};
