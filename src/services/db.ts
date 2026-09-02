import {
  Student,
  SchoolClass,
  NotificationItem,
  DailyReportData,
  SubjectGrade,
  Assignment,
  TeacherConversation,
  DaySchedule,
  TeacherAccount,
  SocialCaseStudy,
  CounselingSession,
  ParentSummon
} from '../types';

const STORAGE_KEY_STUDENTS = 'madrasa_db_students_v3';
const STORAGE_KEY_TEACHERS = 'madrasa_db_teachers_v3';
const STORAGE_KEY_CLASSES = 'madrasa_db_classes_v3';
const STORAGE_KEY_NOTIFICATIONS = 'madrasa_db_notifications_v3';
const STORAGE_KEY_REPORTS = 'madrasa_db_reports_v3';
const STORAGE_KEY_CONVERSATIONS = 'madrasa_db_conversations_v3';
const STORAGE_KEY_SCHEDULE = 'madrasa_db_schedule_v3';
const STORAGE_KEY_CASE_STUDIES = 'madrasa_db_case_studies_v3';
const STORAGE_KEY_SESSIONS = 'madrasa_db_counseling_sessions_v3';
const STORAGE_KEY_SUMMONS = 'madrasa_db_parent_summons_v3';

// Libyan Teachers Directory
export const SEED_TEACHERS: TeacherAccount[] = [
  {
    id: 't-1',
    code: 'LIB-MATH-01',
    name: 'أ. طارق الفيتوري',
    phone: '0912345678',
    subject: 'الرياضيات',
    subjectCode: 'MATH',
    assignedClasses: ['3/أ', '3/ب', '2/أ'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    email: 'tariq.fitouri@school.edu.ly'
  },
  {
    id: 't-2',
    code: 'LIB-ARA-02',
    name: 'أ. عبدالسلام الورفلي',
    phone: '0923456789',
    subject: 'اللغة العربية',
    subjectCode: 'ARA',
    assignedClasses: ['3/أ', '3/ب'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'abdulsalam.werfelli@school.edu.ly'
  },
  {
    id: 't-3',
    code: 'LIB-SCI-03',
    name: 'أ. مريم الترهوني',
    phone: '0945678901',
    subject: 'العلوم الطبيعية',
    subjectCode: 'SCI',
    assignedClasses: ['3/أ', '2/أ'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'maryam.tarhouni@school.edu.ly'
  },
  {
    id: 't-4',
    code: 'LIB-COMP-04',
    name: 'أ. أسامة المقريف',
    phone: '0916789012',
    subject: 'الحاسوب وتقنية المعلومات',
    subjectCode: 'COMP',
    assignedClasses: ['3/أ', '3/ب', '2/أ', '1/أ'],
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    email: 'osama.megrahi@school.edu.ly'
  },
  {
    id: 't-5',
    code: 'LIB-ISL-05',
    name: 'أ. محمود السويحلي',
    phone: '0927890123',
    subject: 'التربية الإسلامية',
    subjectCode: 'ISL',
    assignedClasses: ['3/أ', '3/ب', '2/أ'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'mahmoud.sweihli@school.edu.ly'
  },
  {
    id: 't-6',
    code: 'LIB-ENG-06',
    name: 'أ. فاطمة الزوي',
    phone: '0948901234',
    subject: 'اللغة الإنجليزية',
    subjectCode: 'ENG',
    assignedClasses: ['3/أ', '3/ب'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    email: 'fatima.zway@school.edu.ly'
  },
  {
    id: 't-7',
    code: 'LIB-SOC-07',
    name: 'أ. وليد المصراتي',
    phone: '0919012345',
    subject: 'الدراسات الاجتماعية',
    subjectCode: 'SOC',
    assignedClasses: ['3/أ', '2/أ'],
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    email: 'walid.misrati@school.edu.ly'
  },
  {
    id: 't-8',
    code: 'LIB-SOC-01',
    name: 'أ. نجوى القماطي',
    phone: '0922465676',
    subject: 'الإرشاد الاجتماعي والنفسي',
    subjectCode: 'COUNSEL',
    assignedClasses: ['كافة الفصول والمراحل'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'najwa.gammati@school.edu.ly'
  }
];

// Libyan School Grades (40 coursework + 60 final exam = 100)
export const SAMPLE_GRADES_RAYAN: SubjectGrade[] = [
  {
    id: 'g1',
    subjectName: 'الرياضيات',
    code: 'MATH-101',
    icon: '📐',
    teacherName: 'أ. طارق الفيتوري',
    period1: 20,
    period2: 20,
    quizzes: 10,
    homework: 10,
    participation: 10,
    finalExam: 58,
    total: 98,
    maxTotal: 100,
    letter: 'A+',
    appreciation: 'ممتاز - تفوق بارز في الهندسة والحساب الذهني'
  },
  {
    id: 'g2',
    subjectName: 'اللغة العربية',
    code: 'ARA-102',
    icon: '📖',
    teacherName: 'أ. عبدالسلام الورفلي',
    period1: 19,
    period2: 19,
    quizzes: 10,
    homework: 10,
    participation: 9,
    finalExam: 56,
    total: 95,
    maxTotal: 100,
    letter: 'A',
    appreciation: 'ممتاز - إلقاء فصيح وإملاء وقواعد متميزة'
  },
  {
    id: 'g3',
    subjectName: 'العلوم الطبيعية',
    code: 'SCI-103',
    icon: '🔬',
    teacherName: 'أ. مريم الترهوني',
    period1: 20,
    period2: 20,
    quizzes: 10,
    homework: 9,
    participation: 10,
    finalExam: 58,
    total: 97,
    maxTotal: 100,
    letter: 'A+',
    appreciation: 'ممتاز - شغف علمي ومشاركة نموذجية في التجارب'
  },
  {
    id: 'g4',
    subjectName: 'الحاسوب وتقنية المعلومات',
    code: 'COMP-104',
    icon: '💻',
    teacherName: 'أ. أسامة المقريف',
    period1: 20,
    period2: 20,
    quizzes: 10,
    homework: 10,
    participation: 10,
    finalExam: 60,
    total: 100,
    maxTotal: 100,
    letter: 'A+',
    appreciation: 'درجة كاملة - إتقان عملي متميز لأساسيات الحاسوب'
  },
  {
    id: 'g5',
    subjectName: 'التربية الإسلامية',
    code: 'ISL-105',
    icon: '🕌',
    teacherName: 'أ. محمود السويحلي',
    period1: 20,
    period2: 20,
    quizzes: 10,
    homework: 10,
    participation: 10,
    finalExam: 59,
    total: 99,
    maxTotal: 100,
    letter: 'A+',
    appreciation: 'ممتاز - حفظ متقن للقرآن الكريم وسلوك قدوة'
  },
  {
    id: 'g6',
    subjectName: 'اللغة الإنجليزية',
    code: 'ENG-106',
    icon: '🌐',
    teacherName: 'أ. فاطمة الزوي',
    period1: 18,
    period2: 19,
    quizzes: 9,
    homework: 10,
    participation: 10,
    finalExam: 56,
    total: 94,
    maxTotal: 100,
    letter: 'A',
    appreciation: 'ممتاز - مهارات تحدث وقراءة جيدة'
  },
  {
    id: 'g7',
    subjectName: 'الدراسات الاجتماعية',
    code: 'SOC-107',
    icon: '🗺️',
    teacherName: 'أ. وليد المصراتي',
    period1: 20,
    period2: 19,
    quizzes: 10,
    homework: 10,
    participation: 10,
    finalExam: 57,
    total: 96,
    maxTotal: 100,
    letter: 'A+',
    appreciation: 'ممتاز - إلمام بتضاريس وتاريخ دولة ليبيا'
  }
];

export const SAMPLE_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    subject: 'الرياضيات',
    title: 'واجب الهندسة والمضلعات الرباعية',
    description: 'حل أسئلة الهندسة وقياسات الزوايا للعام الدراسي 2025/2026.',
    dueDate: 'اليوم، 09:00 مساءً',
    teacherName: 'أ. طارق الفيتوري',
    totalPoints: 10,
    status: 'pending',
    questions: [
      {
        id: 'q1',
        text: 'ما هو مجموع قياسات الزوايا الداخلية لأي شكل رباعي؟',
        options: ['180 درجة', '360 درجة', '270 درجة', '540 درجة'],
        correctIndex: 1,
        explanation: 'مجموع قياسات الزوايا الداخلية لأي مضلع رباعي يساوي دائماً 360 درجة.',
        points: 5
      },
      {
        id: 'q2',
        text: 'إذا كان قياس زاوية في مستطيل هو 90°، فما نوع هذه الزاوية؟',
        options: ['زاوية حادة', 'زاوية قائمة', 'زاوية منفرجة', 'زاوية مستقيمة'],
        correctIndex: 1,
        explanation: 'الزاوية التي قياسها 90 درجة هي زاوية قائمة.',
        points: 5
      }
    ]
  },
  {
    id: 'asg-2',
    subject: 'الحاسوب وتقنية المعلومات',
    title: 'تطبيق عملي: وحدات الإدخال والإخراج',
    description: 'تصنيف مكونات الحاسوب ووحدات المعالجة المركزية.',
    dueDate: 'غداً، 06:00 مساءً',
    teacherName: 'أ. أسامة المقريف',
    totalPoints: 10,
    status: 'pending',
    questions: [
      {
        id: 'q3',
        text: 'تعتبر لوحة المفاتيح (Keyboard) من وحدات:',
        options: ['الإدخال', 'الإخراج', 'التخزين الثانوي', 'المعالجة'],
        correctIndex: 0,
        explanation: 'لوحة المفاتيح تُستخدم لإدخال البيانات والأوامر للحاسوب.',
        points: 5
      },
      {
        id: 'q4',
        text: 'الشاشة وسماعات الصوت تعتبر من وحدات:',
        options: ['الإخراج', 'الإدخال', 'التحكم', 'الذاكرة العشوائية'],
        correctIndex: 0,
        explanation: 'تقوم الشاشة بعرض وإخراج النتائج للمستخدم.',
        points: 5
      }
    ]
  }
];

export const SEED_CONVERSATIONS: TeacherConversation[] = [
  {
    id: 'conv-1',
    teacherId: 't-1',
    teacherName: 'أ. طارق الفيتوري',
    subject: 'معلم الرياضيات',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'السلام عليكم يا ولي الأمر، معتز أبدع اليوم في حل مسألة الحساب الذهني 🌟',
    lastMessageTime: '10:45 ص',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        senderRole: 'teacher',
        senderName: 'أ. طارق الفيتوري',
        text: 'السلام عليكم ورحمة الله وبركاته. يسعدني إبلاغكم بأن معتز أظهر تميزاً لافتاً في اختبار الهندسة.',
        timestamp: 'أمس 04:15 م',
        read: true
      },
      {
        id: 'm2',
        senderRole: 'parent',
        senderName: 'سالم الورفلي (ولي الأمر)',
        text: 'وعليكم السلام ورحمة الله وبركاته أستاذ طارق. بارك الله فيكم على اهتمامكم ومتابعتكم.',
        timestamp: 'أمس 04:30 م',
        read: true
      },
      {
        id: 'm3',
        senderRole: 'teacher',
        senderName: 'أ. طارق الفيتوري',
        text: 'السلام عليكم يا ولي الأمر، معتز أبدع اليوم في حل مسألة الحساب الذهني 🌟 ونرشحه لأولمبياد المدرسة.',
        timestamp: '10:45 ص',
        read: false
      }
    ]
  }
];

export const SEED_SCHEDULE: DaySchedule[] = [
  {
    dayName: 'الأحد',
    dayIndex: 0,
    periods: [
      { periodNumber: 1, time: '08:00 - 08:45', subject: 'الرياضيات', teacher: 'أ. طارق الفيتوري', room: 'قاعة 3/أ', icon: '📐', color: 'blue' },
      { periodNumber: 2, time: '08:50 - 09:35', subject: 'اللغة العربية', teacher: 'أ. عبدالسلام الورفلي', room: 'قاعة 3/أ', icon: '📖', color: 'emerald' },
      { periodNumber: 3, time: '09:40 - 10:25', subject: 'العلوم الطبيعية', teacher: 'أ. مريم الترهوني', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
      { periodNumber: 4, time: '10:50 - 11:35', subject: 'الحاسوب', teacher: 'أ. أسامة المقريف', room: 'معمل الحاسوب', icon: '💻', color: 'cyan' },
      { periodNumber: 5, time: '11:40 - 12:25', subject: 'التربية الإسلامية', teacher: 'أ. محمود السويحلي', room: 'قاعة 3/أ', icon: '🕌', color: 'amber' },
      { periodNumber: 6, time: '12:30 - 01:15', subject: 'اللغة الإنجليزية', teacher: 'أ. فاطمة الزوي', room: 'معمل اللغات', icon: '🌐', color: 'indigo' },
    ]
  },
  {
    dayName: 'الإثنين',
    dayIndex: 1,
    periods: [
      { periodNumber: 1, time: '08:00 - 08:45', subject: 'العلوم الطبيعية', teacher: 'أ. مريم الترهوني', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
      { periodNumber: 2, time: '08:50 - 09:35', subject: 'الرياضيات', teacher: 'أ. طارق الفيتوري', room: 'قاعة 3/أ', icon: '📐', color: 'blue' },
      { periodNumber: 3, time: '09:40 - 10:25', subject: 'اللغة العربية', teacher: 'أ. عبدالسلام الورفلي', room: 'قاعة 3/أ', icon: '📖', color: 'emerald' },
      { periodNumber: 4, time: '10:50 - 11:35', subject: 'الدراسات الاجتماعية', teacher: 'أ. وليد المصراتي', room: 'قاعة 3/أ', icon: '🗺️', color: 'teal' },
      { periodNumber: 5, time: '11:40 - 12:25', subject: 'الحاسوب', teacher: 'أ. أسامة المقريف', room: 'معمل الحاسوب', icon: '💻', color: 'cyan' },
      { periodNumber: 6, time: '12:30 - 01:15', subject: 'التربية البدنية', teacher: 'أ. سامي المجبري', room: 'الصالة الرياضية', icon: '⚽', color: 'rose' },
    ]
  },
  {
    dayName: 'الثلاثاء',
    dayIndex: 2,
    periods: [
      { periodNumber: 1, time: '08:00 - 08:45', subject: 'اللغة العربية', teacher: 'أ. عبدالسلام الورفلي', room: 'قاعة 3/أ', icon: '📖', color: 'emerald' },
      { periodNumber: 2, time: '08:50 - 09:35', subject: 'التربية الإسلامية', teacher: 'أ. محمود السويحلي', room: 'قاعة 3/أ', icon: '🕌', color: 'amber' },
      { periodNumber: 3, time: '09:40 - 10:25', subject: 'الرياضيات', teacher: 'أ. طارق الفيتوري', room: 'قاعة 3/أ', icon: '📐', color: 'blue' },
      { periodNumber: 4, time: '10:50 - 11:35', subject: 'اللغة الإنجليزية', teacher: 'أ. فاطمة الزوي', room: 'معمل اللغات', icon: '🌐', color: 'indigo' },
      { periodNumber: 5, time: '11:40 - 12:25', subject: 'العلوم الطبيعية', teacher: 'أ. مريم الترهوني', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
      { periodNumber: 6, time: '12:30 - 01:15', subject: 'التربية الفنية', teacher: 'أ. وائل الدرسي', room: 'المرسم', icon: '🎨', color: 'pink' },
    ]
  },
  {
    dayName: 'الأربعاء',
    dayIndex: 3,
    periods: [
      { periodNumber: 1, time: '08:00 - 08:45', subject: 'الرياضيات', teacher: 'أ. طارق الفيتوري', room: 'قاعة 3/أ', icon: '📐', color: 'blue' },
      { periodNumber: 2, time: '08:50 - 09:35', subject: 'العلوم الطبيعية', teacher: 'أ. مريم الترهوني', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
      { periodNumber: 3, time: '09:40 - 10:25', subject: 'التربية الإسلامية', teacher: 'أ. محمود السويحلي', room: 'قاعة 3/أ', icon: '🕌', color: 'amber' },
      { periodNumber: 4, time: '10:50 - 11:35', subject: 'اللغة العربية', teacher: 'أ. عبدالسلام الورفلي', room: 'قاعة 3/أ', icon: '📖', color: 'emerald' },
      { periodNumber: 5, time: '11:40 - 12:25', subject: 'الدراسات الاجتماعية', teacher: 'أ. وليد المصراتي', room: 'قاعة 3/أ', icon: '🗺️', color: 'teal' },
      { periodNumber: 6, time: '12:30 - 01:15', subject: 'الحاسوب', teacher: 'أ. أسامة المقريف', room: 'معمل الحاسوب', icon: '💻', color: 'cyan' },
    ]
  },
  {
    dayName: 'الخميس',
    dayIndex: 4,
    periods: [
      { periodNumber: 1, time: '08:00 - 08:45', subject: 'التربية الإسلامية', teacher: 'أ. محمود السويحلي', room: 'قاعة 3/أ', icon: '🕌', color: 'amber' },
      { periodNumber: 2, time: '08:50 - 09:35', subject: 'الرياضيات', teacher: 'أ. طارق الفيتوري', room: 'قاعة 3/أ', icon: '📐', color: 'blue' },
      { periodNumber: 3, time: '09:40 - 10:25', subject: 'اللغة الإنجليزية', teacher: 'أ. فاطمة الزوي', room: 'معمل اللغات', icon: '🌐', color: 'indigo' },
      { periodNumber: 4, time: '10:50 - 11:35', subject: 'العلوم الطبيعية', teacher: 'أ. مريم الترهوني', room: 'معمل العلوم', icon: '🔬', color: 'purple' },
      { periodNumber: 5, time: '11:40 - 12:25', subject: 'اللغة العربية', teacher: 'أ. عبدالسلام الورفلي', room: 'قاعة 3/أ', icon: '📖', color: 'emerald' },
      { periodNumber: 6, time: '12:30 - 01:15', subject: 'النشاط المدرسي', teacher: 'رائد النشاط', room: 'مسرح المدرسة', icon: '🌟', color: 'amber' },
    ]
  }
];

// Clean Libyan Students Dataset (12-Digit National Numbers & 2025/2026 Academic Year)
export const SEED_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'معتز سالم الورفلي',
    nationalId: '120081234567',
    nationalNumber: '120081234567',
    studentNumber: '2025-0101',
    linkCode: 'SCH-2026-L1',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    grade: 'الصف الثالث الأساسي',
    className: '3/أ',
    gender: 'male',
    parentName: 'سالم بن علي الورفلي',
    parentPhone: '0922465676',
    parentEmail: 'salem.werfelli@gmail.com',
    status: 'present',
    attendanceRate: 98,
    academicAverage: 96.5,
    courseworkScore: 39,
    examScore: 58,
    totalScore: 97,
    appreciation: 'ممتاز',
    behaviorRating: 'ممتاز',
    behaviorPointsTotal: 48,
    lastSeenTime: '07:50 صباحاً (البوابة المدرسية)',
    grades: SAMPLE_GRADES_RAYAN,
    assignments: SAMPLE_ASSIGNMENTS,
    competencies: [
      { name: 'حل المسائل الرياضية', score: 96, maxScore: 100 },
      { name: 'التفكير العلمي والابتكار', score: 94, maxScore: 100 },
      { name: 'مهارات الحاسوب والتطبيقات', score: 100, maxScore: 100 },
      { name: 'الانضباط والسمت المدرسي', score: 98, maxScore: 100 },
      { name: 'التعبير اللغوي والإملاء', score: 95, maxScore: 100 },
    ],
    behaviorPoints: [
      { id: 'bp-1', category: 'positive', title: 'مشاركة ممتازة في الرياضيات والحساب الذهني', points: 5, icon: '🌟', date: 'اليوم 08:30 ص', teacher: 'أ. طارق الفيتوري' },
      { id: 'bp-2', category: 'positive', title: 'إتقان تطبيق معمل الحاسوب', points: 4, icon: '💻', date: 'اليوم 10:15 ص', teacher: 'أ. أسامة المقريف' },
      { id: 'bp-3', category: 'positive', title: 'حل واجب العلوم الميداني', points: 4, icon: '🔬', date: 'أمس', teacher: 'أ. مريم الترهوني' },
    ],
    badges: [
      { id: 'b1', title: 'نجم الحساب الذهني', icon: '🏆', date: 'سبتمبر 2025', description: 'الترتيب الأول في مسابقة الرياضيات' },
      { id: 'b2', title: 'صديق معمل الحاسوب', icon: '💻', date: 'أكتوبر 2025', description: 'التميز في التطبيقات التقنية' },
      { id: 'b3', title: 'فارس الانضباط الصباحي', icon: '⭐', date: 'نوفمبر 2025', description: 'حضور مبكر بدون أي تأخير' }
    ],
    subjects: [
      { name: 'الرياضيات', score: 98, maxScore: 100, teacher: 'أ. طارق الفيتوري', evaluation: 'متميز في التفكير المنطقي' },
      { name: 'اللغة العربية', score: 95, maxScore: 100, teacher: 'أ. عبدالسلام الورفلي', evaluation: 'قراءة معبرة وخط واضح' },
      { name: 'العلوم الطبيعية', score: 97, maxScore: 100, teacher: 'أ. مريم الترهوني', evaluation: 'مشاركة ممتازة في المعمل' },
      { name: 'الحاسوب', score: 100, maxScore: 100, teacher: 'أ. أسامة المقريف', evaluation: 'درجة كاملة في التطبيق العملي' },
      { name: 'التربية الإسلامية', score: 99, maxScore: 100, teacher: 'أ. محمود السويحلي', evaluation: 'حفظ وتلاوة وسلوك قدوة' },
    ],
    recentAttendance: [
      { date: '2025-09-01', status: 'present', note: 'حضور مبكر' },
      { date: '2025-09-02', status: 'present', note: 'حضور منتظم' },
    ],
    notes: [
      { id: 'n-1', date: 'اليوم', teacher: 'أ. طارق الفيتوري', type: 'positive', text: 'معتز طالب مجتهد ومتفاعل دائماً في حصة الرياضيات.' }
    ]
  },
  {
    id: 'std-2',
    name: 'آية مصطفى الترهوني',
    nationalId: '220082345678',
    nationalNumber: '220082345678',
    studentNumber: '2025-0102',
    linkCode: 'SCH-2026-L2',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    grade: 'الصف الثالث الأساسي',
    className: '3/أ',
    gender: 'female',
    parentName: 'مصطفى بن رمضان الترهوني',
    parentPhone: '0912233445',
    parentEmail: 'mustafa.tarhouni@gmail.com',
    status: 'present',
    attendanceRate: 99,
    academicAverage: 98.2,
    courseworkScore: 40,
    examScore: 59,
    totalScore: 99,
    appreciation: 'ممتاز',
    behaviorRating: 'ممتاز',
    behaviorPointsTotal: 52,
    grades: SAMPLE_GRADES_RAYAN,
    competencies: [
      { name: 'التفوق اللغوي', score: 100, maxScore: 100 },
      { name: 'العلوم والبحث', score: 98, maxScore: 100 },
      { name: 'الحاسوب والمهارات الرقمية', score: 96, maxScore: 100 }
    ],
    behaviorPoints: [],
    subjects: []
  },
  {
    id: 'std-3',
    name: 'عبدالرحمن علي المقريف',
    nationalId: '120083456789',
    nationalNumber: '120083456789',
    studentNumber: '2025-0103',
    linkCode: 'SCH-2026-L3',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    grade: 'الصف الثالث الأساسي',
    className: '3/ب',
    gender: 'male',
    parentName: 'علي بن فرج المقريف',
    parentPhone: '0923344556',
    parentEmail: 'ali.megrahi@gmail.com',
    status: 'present',
    attendanceRate: 95,
    academicAverage: 94.0,
    courseworkScore: 38,
    examScore: 56,
    totalScore: 94,
    appreciation: 'ممتاز',
    behaviorRating: 'ممتاز',
    behaviorPointsTotal: 35,
    grades: SAMPLE_GRADES_RAYAN,
    competencies: [],
    behaviorPoints: [],
    subjects: []
  },
  {
    id: 'std-4',
    name: 'سارة عمر الفيتوري',
    nationalId: '220084567890',
    nationalNumber: '220084567890',
    studentNumber: '2025-0104',
    linkCode: 'SCH-2026-L4',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    grade: 'الصف الثاني الأساسي',
    className: '2/أ',
    gender: 'female',
    parentName: 'عمر بن الهادي الفيتوري',
    parentPhone: '0944455667',
    parentEmail: 'omar.fitouri@gmail.com',
    status: 'present',
    attendanceRate: 97,
    academicAverage: 96.0,
    courseworkScore: 39,
    examScore: 57,
    totalScore: 96,
    appreciation: 'ممتاز',
    behaviorRating: 'ممتاز',
    behaviorPointsTotal: 40,
    grades: SAMPLE_GRADES_RAYAN,
    competencies: [],
    behaviorPoints: [],
    subjects: []
  },
  {
    id: 'std-5',
    name: 'يوسف فتحي السويحلي',
    nationalId: '120085678901',
    nationalNumber: '120085678901',
    studentNumber: '2025-0105',
    linkCode: 'SCH-2026-L5',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    grade: 'الصف الأول الأساسي',
    className: '1/أ',
    gender: 'male',
    parentName: 'فتحي بن مسعود السويحلي',
    parentPhone: '0915566778',
    parentEmail: 'fathi.sweihli@gmail.com',
    status: 'present',
    attendanceRate: 98,
    academicAverage: 99.0,
    courseworkScore: 40,
    examScore: 59,
    totalScore: 99,
    appreciation: 'ممتاز',
    behaviorRating: 'ممتاز',
    behaviorPointsTotal: 45,
    grades: SAMPLE_GRADES_RAYAN,
    competencies: [],
    behaviorPoints: [],
    subjects: []
  }
];

export const SEED_CLASSES: SchoolClass[] = [
  { id: 'c-1', name: '3/أ', grade: 'الصف الثالث الأساسي', studentCount: 28, presentCount: 27, absentCount: 1, lateCount: 0, supervisor: 'أ. طارق الفيتوري' },
  { id: 'c-2', name: '3/ب', grade: 'الصف الثالث الأساسي', studentCount: 27, presentCount: 26, absentCount: 1, lateCount: 0, supervisor: 'أ. عبدالسلام الورفلي' },
  { id: 'c-3', name: '2/أ', grade: 'الصف الثاني الأساسي', studentCount: 30, presentCount: 29, absentCount: 1, lateCount: 0, supervisor: 'أ. مريم الترهوني' },
  { id: 'c-4', name: '1/أ', grade: 'الصف الأول الأساسي', studentCount: 26, presentCount: 26, absentCount: 0, lateCount: 0, supervisor: 'أ. أسامة المقريف' },
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'تأكيد الحضور الصباحي',
    message: 'تم تسجيل حضور الطالب معتز سالم الورفلي في تمام الساعة 07:50 صباحاً.',
    time: 'منذ 15 دقيقة',
    date: 'اليوم',
    category: 'attendance',
    read: false,
    studentName: 'معتز سالم الورفلي'
  },
  {
    id: 'n2',
    title: 'واجب جديد في مادة الحاسوب',
    message: 'أضاف الأستاذ أسامة المقريف واجباً جديداً: "تطبيق عملي: وحدات الإدخال والإخراج" للعام الدراسي 2025/2026.',
    time: 'منذ ساعتين',
    date: 'اليوم',
    category: 'academic',
    read: false,
    studentName: 'معتز سالم الورفلي'
  },
  {
    id: 'n3',
    title: 'شهادة تميز في الرياضيات',
    message: 'تهنئة خاصة من إدارة المدرسة لحصول معتز على وسام الحساب الذهني.',
    time: 'أمس',
    date: 'أمس',
    category: 'admin',
    read: true,
    studentName: 'معتز سالم الورفلي'
  }
];

export const SEED_DAILY_REPORT: DailyReportData = {
  id: 'rep-1',
  studentId: 'std-1',
  studentName: 'معتز سالم الورفلي',
  date: '2025-09-02',
  dayOfWeek: 'الثلاثاء',
  overallMood: 'ممتاز',
  attendanceStatus: 'present',
  checkInTime: '07:50 ص',
  checkOutTime: '01:15 م',
  timeline: [
    { id: 't1', time: '08:00 ص', title: 'طابور الصباح والنشيد الوطني', status: 'completed' },
    { id: 't2', time: '08:15 ص', title: 'حصة الرياضيات - الأشكال والمجسمات', status: 'completed', teacher: 'أ. طارق الفيتوري' },
    { id: 't3', time: '09:00 ص', title: 'حصة اللغة العربية - القراءة الصامتة', status: 'completed', teacher: 'أ. عبدالسلام الورفلي' },
    { id: 't4', time: '10:00 ص', title: 'استراحة الفطور المدرسية', status: 'completed' },
    { id: 't5', time: '10:30 ص', title: 'حصة العلوم - التجارب المعملية', status: 'completed', teacher: 'أ. مريم الترهوني' },
    { id: 't6', time: '11:15 ص', title: 'حصة الحاسوب وتقنية المعلومات', status: 'current', teacher: 'أ. أسامة المقريف' },
    { id: 't7', time: '12:00 م', title: 'التربية الإسلامية والانصراف', status: 'upcoming' },
  ],
  subjectsSummary: [
    { subject: 'الرياضيات', topic: 'الأشكال والمجسمات', participation: 5, homeworkStatus: 'مكتمل', teacherNote: 'معتز قدم أداءً نموذجياً في حل المسائل اليوم.' },
    { subject: 'الحاسوب', topic: 'وحدات الإدخال والإخراج', participation: 5, homeworkStatus: 'مكتمل', teacherNote: 'تفاعل ممتاز مع بيئة التطبيق العملي.' },
  ],
  teacherNotes: 'معتز طالب مجتهد ومتفاعل دائماً في حصص اليوم.',
  parentAcknowledged: true
};

export const SEED_CASE_STUDIES: SocialCaseStudy[] = [
  {
    id: 'case-1',
    studentId: 'std-1',
    studentName: 'معتز سالم الورفلي',
    studentNationalNumber: '120081234567',
    grade: 'الصف الثالث الأساسي',
    className: '3/أ',
    category: 'academic_lag',
    categoryLabel: 'التأخر الدراسي وصعوبات القراءة والحساب',
    status: 'in_progress',
    priority: 'medium',
    openDate: '2025-09-01',
    symptomsAndObservations: 'ملاحظة تردد أثناء القراءة الجهرية في مادة اللغة العربية مع تميز في الحساب الذهني.',
    diagnosis: 'حاجة لتعزيز الثقة في الإلقاء وتدريب على استراتيجيات الطلاقة اللغوية.',
    actionPlan: [
      'جلسة فردية أسبوعية لتدريب مهارات التحدث والتنفس الهادئ.',
      'تكليف الطالب بقراءة فقرات قصيرة مشجعة ومعدّة مسبقاً في الإذاعة الصفية.',
      'توجيه معلم اللغة العربية لدعم الطالب ومدح تقدمه المستمر.'
    ],
    parentEngagement: 'cooperative',
    progressEvaluation: 'تحسن ملحوظ بنسبة 40% في الطلاقة والمشاركة الصفية.',
    sessionsCount: 2,
    lastSessionDate: '2025-09-02'
  },
  {
    id: 'case-2',
    studentId: 'std-2',
    studentName: 'آية منصور الترهوني',
    studentNationalNumber: '220082345678',
    grade: 'الصف الثالث الأساسي',
    className: '3/أ',
    category: 'psychological_crisis',
    categoryLabel: 'الضغوط النفسية وقلق الامتحانات',
    status: 'monitoring',
    priority: 'high',
    openDate: '2025-08-28',
    symptomsAndObservations: 'توتر ملحوظ وشكوى من الصداع قبل موعد الاختبارات الشهرية.',
    diagnosis: 'قلق أداء امتحاني ناتج عن الرغبة الشديدة في الكمال وخوف الخطأ.',
    actionPlan: [
      'تدريب الطالبة على تمارين الاسترخاء والتنفس البطني العميق.',
      'جلسة إرشاد أسري مع الأم للتخفيف من التوقعات المشحونة بالضغط.',
      'منح الطالبة 5 دقائق استراحة هادئة قبل توزيع أوراق الاختبار.'
    ],
    parentEngagement: 'cooperative',
    progressEvaluation: 'تجاوزت الاختبار الأخير بهدوء وثقة وحققت الدرجة الكاملة.',
    sessionsCount: 3,
    lastSessionDate: '2025-09-01'
  },
  {
    id: 'case-3',
    studentId: 'std-3',
    studentName: 'عبدالرحمن طارق المقريف',
    studentNationalNumber: '120083456789',
    grade: 'الصف الثاني الأساسي',
    className: '2/أ',
    category: 'absence_dropout',
    categoryLabel: 'الغياب المتكرر وخطر الانقطاع',
    status: 'open',
    priority: 'urgent',
    openDate: '2025-09-02',
    symptomsAndObservations: 'تكرار الغياب يومي الأحد والخميس مع التأخر عن الطابور الصباحي.',
    diagnosis: 'صعوبات لوجستية في المواصلات الصباحية وضعف متابعة الاستيقاظ المبكر.',
    actionPlan: [
      'استدعاء فوري لولي الأمر لتنظيم خط السير والمواصلات المدرسية.',
      'توقيع ميثاق الحضور الصباحي وتحفيز الطالب بنقاط الشرف اليومية.'
    ],
    parentEngagement: 'partial',
    progressEvaluation: 'بانتظار حضور ولي الأمر للمقابلة المقررة غداً.',
    sessionsCount: 1,
    lastSessionDate: '2025-09-02'
  }
];

export const SEED_COUNSELING_SESSIONS: CounselingSession[] = [
  {
    id: 'ses-1',
    caseId: 'case-1',
    studentId: 'std-1',
    studentName: 'معتز سالم الورفلي',
    date: '2025-09-02',
    time: '10:00 ص',
    sessionType: 'individual',
    objective: 'تعزيز مهارات الإلقاء والتغلب على التردد في القراءة',
    discussionSummary: 'تمت قراءة قصة قصيرة بهدوء ومناقشة مشاعر الطالب الإيجابية مع مدح مخارج الحروف وثقته.',
    recommendations: 'مواصلة القراءة اليومية 10 دقائق في المنزل مع الوالد وتكليفه بفقرة في إذاعة الغد.',
    nextFollowUpDate: '2025-09-09',
    counselorName: 'أ. نجوى القماطي'
  },
  {
    id: 'ses-2',
    caseId: 'case-2',
    studentId: 'std-2',
    studentName: 'آية منصور الترهوني',
    date: '2025-09-01',
    time: '11:15 ص',
    sessionType: 'parent_conference',
    objective: 'مؤتمر إرشادي مع والدة الطالبة لتخفيف ضغط الامتحانات',
    discussionSummary: 'تم التوافق مع الأم على تجنب المقارنات وتوفير بيئة نوم مريحة وتشجيع آية على الاسترخاء.',
    recommendations: 'تطبيق جدول استذكار مرن لا يتجاوز ساعتين يومياً مع فترات راحة نشطة.',
    nextFollowUpDate: '2025-09-08',
    counselorName: 'أ. نجوى القماطي'
  }
];

export const SEED_PARENT_SUMMONS: ParentSummon[] = [
  {
    id: 'sum-1',
    studentId: 'std-3',
    studentName: 'عبدالرحمن طارق المقريف',
    parentName: 'طارق المقريف',
    parentPhone: '0912345678',
    reason: 'مناقشة خطة معالجة الغياب المتكرر وتنظيم الحضور الصباحي المنتظم للطالب',
    requestedDate: '2025-09-03',
    requestedTime: '09:30 ص',
    status: 'sent',
    outcomeNotes: 'تم إرسال الإشعار والتأكيد عبر الرسائل والمنظومة.'
  }
];

export const db = {
  onSync(callback: any) {
    return () => {};
  },

  resetAllData() {
    try {
      localStorage.removeItem(STORAGE_KEY_STUDENTS);
      localStorage.removeItem(STORAGE_KEY_TEACHERS);
      localStorage.removeItem(STORAGE_KEY_CLASSES);
      localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
      localStorage.removeItem(STORAGE_KEY_REPORTS);
      localStorage.removeItem(STORAGE_KEY_CONVERSATIONS);
      localStorage.removeItem(STORAGE_KEY_SCHEDULE);
      localStorage.removeItem(STORAGE_KEY_CASE_STUDIES);
      localStorage.removeItem(STORAGE_KEY_SESSIONS);
      localStorage.removeItem(STORAGE_KEY_SUMMONS);
    } catch {}
  },

  getTeachers(): TeacherAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TEACHERS);
      return data ? JSON.parse(data) : SEED_TEACHERS;
    } catch {
      return SEED_TEACHERS;
    }
  },

  getTeacherByCode(code: string): TeacherAccount | undefined {
    const teachers = this.getTeachers();
    return teachers.find(t => t.code.trim().toUpperCase() === code.trim().toUpperCase());
  },

  saveTeachers(teachers: TeacherAccount[]) {
    try {
      localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachers));
    } catch {}
  },

  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return SEED_STUDENTS;
    } catch {
      return SEED_STUDENTS;
    }
  },

  saveStudents(students: Student[], force: boolean = false): void {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
      if (force) {
        localStorage.setItem('madrasa_last_sync_timestamp', Date.now().toString());
      }
    } catch {}
  },

  getStudentById(id: string): Student | undefined {
    const students = this.getStudents();
    return students.find(s => s.id === id);
  },

  getStudentByNationalId(nationalId: string): Student | undefined {
    const students = this.getStudents();
    return students.find(s => (s.nationalNumber || s.nationalId) === nationalId.trim());
  },

  getStudentByLinkCode(code: string): Student | undefined {
    const students = this.getStudents();
    return students.find(s => s.linkCode.toLowerCase() === code.trim().toLowerCase());
  },

  getClasses(): SchoolClass[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CLASSES);
      return data ? JSON.parse(data) : SEED_CLASSES;
    } catch {
      return SEED_CLASSES;
    }
  },

  saveClasses(classes: SchoolClass[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes));
    } catch {}
  },

  getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      return data ? JSON.parse(data) : SEED_NOTIFICATIONS;
    } catch {
      return SEED_NOTIFICATIONS;
    }
  },

  saveNotifications(notifications: NotificationItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    } catch {}
  },

  getDailyReport(): DailyReportData {
    try {
      const data = localStorage.getItem(STORAGE_KEY_REPORTS);
      return data ? JSON.parse(data) : SEED_DAILY_REPORT;
    } catch {
      return SEED_DAILY_REPORT;
    }
  },

  saveDailyReport(report: DailyReportData): void {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(report));
    } catch {}
  },

  getConversations(): TeacherConversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      return data ? JSON.parse(data) : SEED_CONVERSATIONS;
    } catch {
      return SEED_CONVERSATIONS;
    }
  },

  saveConversations(conversations: TeacherConversation[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
    } catch {}
  },

  getSchedule(): DaySchedule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SCHEDULE);
      return data ? JSON.parse(data) : SEED_SCHEDULE;
    } catch {
      return SEED_SCHEDULE;
    }
  },

  saveSchedule(schedule: DaySchedule[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(schedule));
    } catch {}
  },

  getCaseStudies(): SocialCaseStudy[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CASE_STUDIES);
      return data ? JSON.parse(data) : SEED_CASE_STUDIES;
    } catch {
      return SEED_CASE_STUDIES;
    }
  },

  saveCaseStudies(cases: SocialCaseStudy[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CASE_STUDIES, JSON.stringify(cases));
    } catch {}
  },

  getCounselingSessions(): CounselingSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return data ? JSON.parse(data) : SEED_COUNSELING_SESSIONS;
    } catch {
      return SEED_COUNSELING_SESSIONS;
    }
  },

  saveCounselingSessions(sessions: CounselingSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch {}
  },

  getParentSummons(): ParentSummon[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SUMMONS);
      return data ? JSON.parse(data) : SEED_PARENT_SUMMONS;
    } catch {
      return SEED_PARENT_SUMMONS;
    }
  },

  saveParentSummons(summons: ParentSummon[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_SUMMONS, JSON.stringify(summons));
    } catch {}
  },

  generate1000StudentsBenchmark(): {
    students: Student[];
    count: number;
    durationMs: number;
    generateTimeMs: number;
    memoryEstimateKb: number;
    memorySizeKb: number;
  } {
    const startTime = performance.now();
    const gradesList = ['الصف الأول الأساسي', 'الصف الثاني الأساسي', 'الصف الثالث الأساسي', 'الصف الرابع الأساسي', 'الصف الخامس الأساسي', 'الصف السادس الأساسي'];
    const sections = ['أ', 'ب', 'ج'];
    const firstNames = ['معتز', 'عبدالرحمن', 'يوسف', 'محمد', 'علي', 'أحمد', 'طارق', 'سالم', 'حمزة', 'خالد', 'عمر', 'إبراهيم', 'مصطفى', 'وليد'];
    const familyNames = ['الورفلي', 'الترهوني', 'المقريف', 'الفيتوري', 'السويحلي', 'الزوي', 'المصراتي', 'الدرسي', 'المجبري', 'القماطي', 'المنفي'];

    const benchmarkStudents: Student[] = [];

    for (let i = 1; i <= 1000; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = familyNames[i % familyNames.length];
      const grade = gradesList[i % gradesList.length];
      const sec = sections[i % sections.length];
      const classNum = (i % 6) + 1;
      const natId = `12008${String(1000000 + i).slice(-7)}`;

      benchmarkStudents.push({
        id: `bench-std-${i}`,
        name: `${fn} ${ln}`,
        nationalId: natId,
        nationalNumber: natId,
        studentNumber: `2025-${String(1000 + i).padStart(4, '0')}`,
        linkCode: `SCH-2026-L${i}`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        grade,
        className: `${classNum}/${sec}`,
        gender: 'male',
        parentName: `ولي أمر ${fn} ${ln}`,
        parentPhone: `092${String(1000000 + i).slice(-7)}`,
        parentEmail: `parent.${natId}@school.edu.ly`,
        status: i % 15 === 0 ? 'unexcused' : 'present',
        attendanceRate: 90 + (i % 10),
        academicAverage: 85 + (i % 15),
        courseworkScore: 35 + (i % 5),
        examScore: 50 + (i % 10),
        totalScore: 85 + (i % 15),
        appreciation: 'ممتاز',
        behaviorRating: 'ممتاز',
        behaviorPointsTotal: 20 + (i % 30),
        behaviorPoints: [],
        competencies: [],
        subjects: [],
        recentAttendance: [],
        notes: [],
        badges: []
      });
    }

    const endTime = performance.now();
    const generateTimeMs = Math.round((endTime - startTime) * 100) / 100;
    const memorySizeKb = Math.round((JSON.stringify(benchmarkStudents).length / 1024) * 10) / 10;

    return {
      students: benchmarkStudents,
      count: 1000,
      durationMs: generateTimeMs,
      generateTimeMs,
      memoryEstimateKb: memorySizeKb,
      memorySizeKb
    };
  }
};
