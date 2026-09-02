import { Student, SchoolClass, NotificationItem, DailyReportData, SubjectGrade, Assignment, TeacherConversation, DaySchedule } from '../types';

const STORAGE_KEY_STUDENTS = 'madrasa_db_students_v3';
const STORAGE_KEY_CLASSES = 'madrasa_db_classes_v3';
const STORAGE_KEY_NOTIFICATIONS = 'madrasa_db_notifications_v3';
const STORAGE_KEY_REPORTS = 'madrasa_db_reports_v3';
const STORAGE_KEY_CONVERSATIONS = 'madrasa_db_conversations_v3';
const STORAGE_KEY_SCHEDULE = 'madrasa_db_schedule_v3';

export const SAMPLE_GRADES_RAYAN: SubjectGrade[] = [
  {
    id: 'g1',
    subjectName: 'الرياضيات',
    code: 'MATH-501',
    icon: '📐',
    teacherName: 'أ. أحمد الغامدي',
    period1: 20,
    period2: 19,
    quizzes: 10,
    homework: 10,
    participation: 10,
    finalExam: 29,
    total: 98,
    maxTotal: 100,
    letter: 'A+',
    appreciation: 'ممتاز مرتفع - تفوق بارز في الهندسة والحساب الذهني'
  },
  {
    id: 'g2',
    subjectName: 'لغتي الجميلة',
    code: 'ARB-502',
    icon: '📖',
    teacherName: 'أ. عبدالمحسن الدوسري',
    period1: 19,
    period2: 19,
    quizzes: 10,
    homework: 10,
    participation: 9,
    finalExam: 28,
    total: 95,
    maxTotal: 100,
    letter: 'A',
    appreciation: 'ممتاز - إلقاء فصيح وإملاء متميز'
  },
  {
    id: 'g3',
    subjectName: 'العلوم',
    code: 'SCI-503',
    icon: '🔬',
    teacherName: 'أ. خالد الشهري',
    period1: 20,
    period2: 20,
    quizzes: 10,
    homework: 9,
    participation: 10,
    finalExam: 28,
    total: 97,
    maxTotal: 100,
    letter: 'A+',
    appreciation: 'ممتاز مرتفع - شغف علمي ومشاركة نموذجية في التجارب'
  },
  {
    id: 'g4',
    subjectName: 'الدراسات الإسلامية',
    code: 'ISL-504',
    icon: '🕌',
    teacherName: 'أ. محمد السبيعي',
    period1: 20,
    period2: 20,
    quizzes: 10,
    homework: 10,
    participation: 10,
    finalExam: 29,
    total: 99,
    maxTotal: 100,
    letter: 'A+',
    appreciation: 'ممتاز مرتفع - حفظ متقن وأخلاق فاضلة'
  },
  {
    id: 'g5',
    subjectName: 'اللغة الإنجليزية (English)',
    code: 'ENG-505',
    icon: '🌍',
    teacherName: 'Mr. Tariq Al-Mansoor',
    period1: 18,
    period2: 19,
    quizzes: 9,
    homework: 10,
    participation: 10,
    finalExam: 28,
    total: 94,
    maxTotal: 100,
    letter: 'A',
    appreciation: 'Excellent - Great vocabulary and active speaking'
  },
  {
    id: 'g6',
    subjectName: 'المهارات الرقمية والتكنولوجيا',
    code: 'TECH-506',
    icon: '💻',
    teacherName: 'م. عمر القرني',
    period1: 20,
    period2: 20,
    quizzes: 10,
    homework: 10,
    participation: 10,
    finalExam: 30,
    total: 100,
    maxTotal: 100,
    letter: 'A+',
    appreciation: 'درجة كاملة - إتقان مذهل لأساسيات البرمجة والتصميم'
  },
  {
    id: 'g7',
    subjectName: 'التربية البدنية والدفاع عن النفس',
    code: 'PE-507',
    icon: '⚽',
    teacherName: 'ك. صالح الزهراني',
    period1: 20,
    period2: 20,
    quizzes: 10,
    homework: 10,
    participation: 10,
    finalExam: 30,
    total: 100,
    maxTotal: 100,
    letter: 'A+',
    appreciation: 'ممتاز - لياقة بدنية عالية والتزام بالروح الرياضية'
  }
];

export const SAMPLE_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    subject: 'الرياضيات',
    title: 'واجب الزوايا والمضلعات الرباعية',
    description: 'حل أسئلة التحدي للأشكال الهندسية وقياسات الزوايا مع التبرير المنطقي.',
    dueDate: 'اليوم، 09:00 مساءً',
    teacherName: 'أ. أحمد الغامدي',
    totalPoints: 10,
    status: 'pending',
    questions: [
      {
        id: 'q1',
        text: 'ما هو مجموع قياسات الزوايا الداخلية لأي شكل رباعي؟',
        options: ['180 درجة', '360 درجة', '270 درجة', '540 درجة'],
        correctIndex: 1,
        explanation: 'مجموع قياسات الزوايا الداخلية لأي مضلع رباعي يساوي دائماً 360° (2 × 180°).',
        points: 5
      },
      {
        id: 'q2',
        text: 'إذا كان قياس زاوية في مستطيل هو 90°، فما نوع هذه الزاوية؟',
        options: ['زاوية حادة', 'زاوية قائمة', 'زاوية منفرجة', 'زاوية مستقيمة'],
        correctIndex: 1,
        explanation: 'الزاوية التي قياسها 90 درجة هي زاوية قائمة بالضبط.',
        points: 5
      }
    ]
  },
  {
    id: 'asg-2',
    subject: 'العلوم',
    title: 'تحدي دورة الماء وحالات المادة',
    description: 'تطبيق عملي على التبخر والتكثف وهطول الأمطار.',
    dueDate: 'غداً، 06:00 مساءً',
    teacherName: 'أ. خالد الشهري',
    totalPoints: 10,
    status: 'pending',
    questions: [
      {
        id: 'q3',
        text: 'العملية التي يتحول فيها الماء من الحالة السائلة إلى الحالة الغازية تسمى:',
        options: ['التكثف', 'التجمد', 'التبخر', 'الانصهار'],
        correctIndex: 2,
        explanation: 'التبخر هو تحول السائل إلى بخار نتيجة ارتفاع درجة الحرارة.',
        points: 5
      },
      {
        id: 'q4',
        text: 'تتكون الغيوم في السماء نتيجة لعملية:',
        options: ['التكثف', 'الترشيح', 'التبخر', 'الترسيب'],
        correctIndex: 0,
        explanation: 'يصعد بخار الماء إلى طبقات الجو العليا ويبرد ليتكثف على شكل غيوم.',
        points: 5
      }
    ]
  },
  {
    id: 'asg-3',
    subject: 'لغتي الجميلة',
    title: 'واجب الفاعل وعلامات إعرابه الأصيلة',
    description: 'تحديد الفاعل في الجملة وتحديد علامة الرفع المناسبة.',
    dueDate: 'الخميس، 08:00 مساءً',
    teacherName: 'أ. عبدالمحسن الدوسري',
    totalPoints: 10,
    status: 'submitted',
    studentScore: 10,
    teacherFeedback: 'أحسنت يا بطل! إجابات نموذجية متقنة.',
    questions: [
      {
        id: 'q5',
        text: 'في جملة (كتبَ الطالبُ الدرسَ)، ما هو الفاعل؟',
        options: ['كتبَ', 'الطالبُ', 'الدرسَ', 'ضمير مستتر'],
        correctIndex: 1,
        points: 5
      },
      {
        id: 'q6',
        text: 'علامة رفع الفاعل المفرد الأصلية هي:',
        options: ['الفتحة', 'الكسرة', 'الضمة', 'الألف'],
        correctIndex: 2,
        points: 5
      }
    ]
  }
];

export const SEED_CONVERSATIONS: TeacherConversation[] = [
  {
    id: 'conv-1',
    teacherId: 't-1',
    teacherName: 'أ. أحمد الغامدي',
    subject: 'معلم الرياضيات',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'السلام عليكم يا أبا ريان، ريان أبدع اليوم في حل مسألة التحدي الرياضي 🌟',
    lastMessageTime: '10:45 ص',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        senderRole: 'teacher',
        senderName: 'أ. أحمد الغامدي',
        text: 'السلام عليكم ورحمة الله وبركاته يا أبا ريان. يسعدني إبلاغكم بأن ريان أظهر تميزاً لافتاً في اختبار الهندسة القصير.',
        timestamp: 'أمس 04:15 م',
        read: true
      },
      {
        id: 'm2',
        senderRole: 'parent',
        senderName: 'فهد العتيبي (ولي الأمر)',
        text: 'وعليكم السلام ورحمة الله وبركاته أستاذ أحمد. جزاكم الله خيراً على جهودكم واهتمامكم الدائم.',
        timestamp: 'أمس 04:30 م',
        read: true
      },
      {
        id: 'm3',
        senderRole: 'teacher',
        senderName: 'أ. أحمد الغامدي',
        text: 'السلام عليكم يا أبا ريان، ريان أبدع اليوم في حل مسألة التحدي الرياضي 🌟 ونرشحه للمشاركة في أولمبياد الرياضيات.',
        timestamp: '10:45 ص',
        read: false
      }
    ]
  },
  {
    id: 'conv-2',
    teacherId: 't-2',
    teacherName: 'أ. خالد الشهري',
    subject: 'معلم العلوم',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'نحتاج إحضار نموذج مجسم بركاني ليوم المعرض الأسبوع القادم.',
    lastMessageTime: 'أمس',
    unreadCount: 0,
    messages: [
      {
        id: 'm4',
        senderRole: 'teacher',
        senderName: 'أ. خالد الشهري',
        text: 'مرحباً بكم، تم تكليف ريان بمشروع علمي مميز عن طبقات الأرض، يرجى متابعة تسليم النموذج المطلوب.',
        timestamp: 'أمس 01:20 م',
        read: true
      }
    ]
  },
  {
    id: 'conv-3',
    teacherId: 't-3',
    teacherName: 'أ. عبدالمحسن الدوسري',
    subject: 'معلم لغتي الجميلة',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'تم تصحيح الواجب وحصل على الدرجة الكاملة 10/10.',
    lastMessageTime: '28 أغسطس',
    unreadCount: 0,
    messages: [
      {
        id: 'm5',
        senderRole: 'teacher',
        senderName: 'أ. عبدالمحسن الدوسري',
        text: 'أحييكم على حرصكم، خط ريان وإملاءه في تحسن مستمر ومبهر.',
        timestamp: '28 أغسطس 02:00 م',
        read: true
      }
    ]
  }
];

export const SEED_SCHEDULE: DaySchedule[] = [
  {
    dayName: 'الأحد',
    dayIndex: 0,
    periods: [
      { periodNumber: 1, time: '07:15 - 08:00', subject: 'القرآن الكريم والدراسات الإسلامية', teacher: 'أ. محمد السبيعي', room: 'قاعة 5/أ', icon: '🕌', color: 'emerald' },
      { periodNumber: 2, time: '08:05 - 08:50', subject: 'الرياضيات', teacher: 'أ. أحمد الغامدي', room: 'قاعة 5/أ', icon: '📐', color: 'blue' },
      { periodNumber: 3, time: '09:15 - 10:00', subject: 'لغتي الجميلة', teacher: 'أ. عبدالمحسن الدوسري', room: 'قاعة 5/أ', icon: '📖', color: 'amber' },
      { periodNumber: 4, time: '10:05 - 10:50', subject: 'العلوم', teacher: 'أ. خالد الشهري', room: 'المختبر العلمي', icon: '🔬', color: 'purple' },
      { periodNumber: 5, time: '11:10 - 11:55', subject: 'اللغة الإنجليزية', teacher: 'Mr. Tariq', room: 'قاعة اللغات', icon: '🌍', color: 'cyan' },
      { periodNumber: 6, time: '12:00 - 12:45', subject: 'المهارات الرقمية', teacher: 'م. عمر القرني', room: 'معمل الحاسب', icon: '💻', color: 'indigo' },
    ]
  },
  {
    dayName: 'الإثنين',
    dayIndex: 1,
    periods: [
      { periodNumber: 1, time: '07:15 - 08:00', subject: 'الرياضيات', teacher: 'أ. أحمد الغامدي', room: 'قاعة 5/أ', icon: '📐', color: 'blue' },
      { periodNumber: 2, time: '08:05 - 08:50', subject: 'العلوم', teacher: 'أ. خالد الشهري', room: 'المختبر العلمي', icon: '🔬', color: 'purple' },
      { periodNumber: 3, time: '09:15 - 10:00', subject: 'الدراسات الإسلامية', teacher: 'أ. محمد السبيعي', room: 'قاعة 5/أ', icon: '🕌', color: 'emerald' },
      { periodNumber: 4, time: '10:05 - 10:50', subject: 'لغتي الجميلة', teacher: 'أ. عبدالمحسن الدوسري', room: 'قاعة 5/أ', icon: '📖', color: 'amber' },
      { periodNumber: 5, time: '11:10 - 11:55', subject: 'التربية الفنية', teacher: 'أ. فيصل الشمري', room: 'مرسم الفنون', icon: '🎨', color: 'rose' },
      { periodNumber: 6, time: '12:00 - 12:45', subject: 'التربية البدنية', teacher: 'ك. صالح الزهراني', room: 'الصالة الرياضية', icon: '⚽', color: 'green' },
    ]
  },
  {
    dayName: 'الثلاثاء',
    dayIndex: 2,
    periods: [
      { periodNumber: 1, time: '07:15 - 08:00', subject: 'لغتي الجميلة', teacher: 'أ. عبدالمحسن الدوسري', room: 'قاعة 5/أ', icon: '📖', color: 'amber' },
      { periodNumber: 2, time: '08:05 - 08:50', subject: 'الرياضيات', teacher: 'أ. أحمد الغامدي', room: 'قاعة 5/أ', icon: '📐', color: 'blue' },
      { periodNumber: 3, time: '09:15 - 10:00', subject: 'اللغة الإنجليزية', teacher: 'Mr. Tariq', room: 'قاعة اللغات', icon: '🌍', color: 'cyan' },
      { periodNumber: 4, time: '10:05 - 10:50', subject: 'الاجتماعيات والمواطنة', teacher: 'أ. سلطان الحربي', room: 'قاعة 5/أ', icon: '🗺️', color: 'teal' },
      { periodNumber: 5, time: '11:10 - 11:55', subject: 'العلوم', teacher: 'أ. خالد الشهري', room: 'المختبر العلمي', icon: '🔬', color: 'purple' },
      { periodNumber: 6, time: '12:00 - 12:45', subject: 'نشاط الإرشاد الصفي', teacher: 'المرشد الطلابي', room: 'قاعة 5/أ', icon: '⭐', color: 'yellow' },
    ]
  },
  {
    dayName: 'الأربعاء',
    dayIndex: 3,
    periods: [
      { periodNumber: 1, time: '07:15 - 08:00', subject: 'العلوم', teacher: 'أ. خالد الشهري', room: 'المختبر العلمي', icon: '🔬', color: 'purple' },
      { periodNumber: 2, time: '08:05 - 08:50', subject: 'المهارات الرقمية', teacher: 'م. عمر القرني', room: 'معمل الحاسب', icon: '💻', color: 'indigo' },
      { periodNumber: 3, time: '09:15 - 10:00', subject: 'الرياضيات', teacher: 'أ. أحمد الغامدي', room: 'قاعة 5/أ', icon: '📐', color: 'blue' },
      { periodNumber: 4, time: '10:05 - 10:50', subject: 'الدراسات الإسلامية', teacher: 'أ. محمد السبيعي', room: 'قاعة 5/أ', icon: '🕌', color: 'emerald' },
      { periodNumber: 5, time: '11:10 - 11:55', subject: 'لغتي الجميلة', teacher: 'أ. عبدالمحسن الدوسري', room: 'قاعة 5/أ', icon: '📖', color: 'amber' },
      { periodNumber: 6, time: '12:00 - 12:45', subject: 'التربية البدنية', teacher: 'ك. صالح الزهراني', room: 'الملعب العشبي', icon: '⚽', color: 'green' },
    ]
  },
  {
    dayName: 'الخميس',
    dayIndex: 4,
    periods: [
      { periodNumber: 1, time: '07:15 - 08:00', subject: 'الدراسات الإسلامية', teacher: 'أ. محمد السبيعي', room: 'قاعة 5/أ', icon: '🕌', color: 'emerald' },
      { periodNumber: 2, time: '08:05 - 08:50', subject: 'اللغة الإنجليزية', teacher: 'Mr. Tariq', room: 'قاعة اللغات', icon: '🌍', color: 'cyan' },
      { periodNumber: 3, time: '09:15 - 10:00', subject: 'الرياضيات (مراجعة)', teacher: 'أ. أحمد الغامدي', room: 'قاعة 5/أ', icon: '📐', color: 'blue' },
      { periodNumber: 4, time: '10:05 - 10:50', subject: 'لغتي الجميلة', teacher: 'أ. عبدالمحسن الدوسري', room: 'قاعة 5/أ', icon: '📖', color: 'amber' },
      { periodNumber: 5, time: '11:10 - 11:55', subject: 'الأنشطة والموهبة', teacher: 'رائد النشاط', room: 'المسرح المدرسي', icon: '🎭', color: 'pink' },
      { periodNumber: 6, time: '12:00 - 12:45', subject: 'الاصطفاف والانصراف الأسبوعي', teacher: 'إدارة المدرسة', room: 'الفناء الخارجي', icon: '🚌', color: 'orange' },
    ]
  }
];

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
    grades: SAMPLE_GRADES_RAYAN,
    assignments: SAMPLE_ASSIGNMENTS,
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
    grades: SAMPLE_GRADES_RAYAN,
    assignments: SAMPLE_ASSIGNMENTS,
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
      { name: 'لغتي الجميلة', score: 99, maxScore: 100, teacher: 'أ. عبدالمحسن الدوسري', evaluation: 'فصاحة وتمكن لغوي استثنائي' },
      { name: 'العلوم', score: 98, maxScore: 100, teacher: 'أ. خالد الشهري', evaluation: 'إجابات علمية منظمة' },
      { name: 'الدراسات الإسلامية', score: 100, maxScore: 100, teacher: 'أ. محمد السبيعي', evaluation: 'حفظ وتلاوة نموذجية' },
      { name: 'اللغة الإنجليزية', score: 97, maxScore: 100, teacher: 'Mr. Tariq', evaluation: 'Outstanding writing skills' },
      { name: 'التربية الفنية', score: 98, maxScore: 100, teacher: 'أ. فيصل الشمري', evaluation: 'حس جمالي وإبداع لوني' },
    ],
    recentAttendance: [
      { date: '2026-09-01', status: 'present' },
      { date: '2026-08-31', status: 'present' },
      { date: '2026-08-30', status: 'present' },
    ],
    notes: [
      { id: 'n3', date: '2026-08-30', teacher: 'مديرة المدرسة', type: 'positive', text: 'شكر وتقدير لمشاركتها المميزة في تقديم الإذاعة المدرسية الصباحية.' }
    ]
  }
];

export const SEED_CLASSES: SchoolClass[] = [
  { id: 'c1', name: 'خامس / أ', grade: 'الصف الخامس', studentCount: 26, presentCount: 25, absentCount: 1, lateCount: 2, supervisor: 'أ. أحمد الغامدي' },
  { id: 'c2', name: 'خامس / ب', grade: 'الصف الخامس', studentCount: 28, presentCount: 27, absentCount: 1, lateCount: 0, supervisor: 'أ. خالد الشهري' },
  { id: 'c3', name: 'سادس / أ', grade: 'الصف السادس', studentCount: 25, presentCount: 25, absentCount: 0, lateCount: 1, supervisor: 'أ. عبدالمحسن الدوسري' },
  { id: 'c4', name: 'سادس / ب', grade: 'الصف السادس', studentCount: 27, presentCount: 24, absentCount: 3, lateCount: 3, supervisor: 'أ. محمد السبيعي' }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', title: 'تسجيل حضور صباحي', message: 'تم تسجيل حضور الطالب ريان فهد العتيبي في تمام الساعة 07:15 ص.', date: 'اليوم', time: '07:16 ص', category: 'attendance', read: false, studentName: 'ريان فهد العتيبي' },
  { id: 'n2', title: 'واجب إلكتروني جديد 📝', message: 'أضاف أ. أحمد الغامدي واجباً جديداً في مادة الرياضيات (الزوايا والمضلعات).', date: 'اليوم', time: '08:30 ص', category: 'academic', read: false, studentName: 'ريان فهد العتيبي' },
  { id: 'n3', title: 'كشف الدرجات الأكاديمي جاهز 📊', message: 'تم رصد درجات الفترات واعتمادها رسمياً، يمكنك استعراضها وطباعة الكشف الرسمي الآن.', date: 'اليوم', time: '09:00 ص', category: 'academic', read: false, studentName: 'ريان فهد العتيبي' },
  { id: 'n4', title: 'رسالة جديدة من معلم المادة 💬', message: 'أرسل أ. أحمد الغامدي رسالة جديدة في محادثة الرياضيات.', date: 'اليوم', time: '10:45 ص', category: 'admin', read: false, studentName: 'ريان فهد العتيبي' }
];

export const SEED_DAILY_REPORT: DailyReportData = {
  id: 'rep-2026-09-01',
  studentId: 'std-1',
  studentName: 'ريان فهد العتيبي',
  date: '2026-09-01',
  dayOfWeek: 'الثلاثاء',
  overallMood: 'ممتاز',
  attendanceStatus: 'present',
  checkInTime: '07:15 ص',
  checkOutTime: '01:30 م',
  timeline: [
    { id: 't1', time: '07:00 - 07:20', title: 'الاصطفاف الصباحي والنشيد الوطني', status: 'completed', room: 'الفناء الخارجي' },
    { id: 't2', time: '07:20 - 08:05', title: 'حصة الرياضيات (حل المعادلات)', status: 'completed', room: 'قاعة 5/أ', teacher: 'أ. أحمد الغامدي', note: 'مشاركة ممتازة +5 نقاط' },
    { id: 't3', time: '08:10 - 08:55', title: 'حصة لغتي الجميلة (النص الشعري)', status: 'completed', room: 'قاعة 5/أ', teacher: 'أ. عبدالمحسن الدوسري' },
    { id: 't4', time: '08:55 - 09:30', title: 'استراحة الإفطار والنشاط الترفيهي', status: 'completed', room: 'المقصف والساحة' },
    { id: 't5', time: '09:30 - 10:15', title: 'حصة العلوم (مختبر الطاقة والحرارة)', status: 'completed', room: 'المختبر العلمي', teacher: 'أ. خالد الشهري', note: 'تجربة التوصيل الحراري' },
    { id: 't6', time: '10:20 - 11:05', title: 'حصة المهارات الرقمية (البرمجة بلغة بايثون)', status: 'completed', room: 'معمل الحاسب', teacher: 'م. عمر القرني' },
    { id: 't7', time: '11:10 - 11:55', title: 'الدراسات الإسلامية (تفسير سورة النبأ)', status: 'completed', room: 'قاعة 5/أ', teacher: 'أ. محمد السبيعي' },
    { id: 't8', time: '12:00 - 12:45', title: 'التربية البدنية والألعاب الجماعية', status: 'completed', room: 'الصالة الرياضية', teacher: 'ك. صالح الزهراني' },
    { id: 't9', time: '12:45 - 01:15', title: 'أداء صلاة الظهر جماعة والاستعداد للانصراف', status: 'completed', room: 'المصلى المدرسي' }
  ],
  subjectsSummary: [
    { subject: 'الرياضيات', topic: 'الزوايا والمضلعات الرباعية', participation: 5, homeworkStatus: 'مكتمل', teacherNote: 'طرح أسئلة إبداعية وشارك بحماس.' },
    { subject: 'لغتي الجميلة', topic: 'الفاعل وعلامات إعرابه', participation: 5, homeworkStatus: 'مكتمل', teacherNote: 'قراءة معبرة جداً.' },
    { subject: 'العلوم', topic: 'التوصيل الحراري والمواد العازلة', participation: 5, homeworkStatus: 'مكتمل', teacherNote: 'أنجز التجربة بأمان ودقة.' },
    { subject: 'الدراسات الإسلامية', topic: 'آيات سورة النبأ (1-10)', participation: 5, homeworkStatus: 'مكتمل', teacherNote: 'تلاوة مجودة خاشعة.' },
  ],
  behaviorNotes: 'كان سلوك ريان اليوم نموذجياً ومشرفاً، تفاعل بروح تعاونية مع زملائه وأظهر انضباطاً كاملاً في كافة الحصص.',
  achievements: [
    'نجمة التميز في الرياضيات لحل التحدي الهندسي 🌟',
    'إنجاز تجربة العلوم المعملية بنجاح وتسليم تقرير المجموعة 🔬',
    'المحافظة على الحضور الصباحي المبكر ⏰'
  ],
  tasksForTomorrow: [
    'مراجعة جدول الضرب وحل التمارين ص 42 في الرياضيات',
    'قراءة النص القرائي (رحلة إلى الفضاء) في لغتي',
    'إحضار الأدوات الفنية لحصة الرسم'
  ]
};

export const db = {
  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.length > 0) return parsed;
      }
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

  getConversations(): TeacherConversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (data) return JSON.parse(data);
    } catch {}
    this.saveConversations(SEED_CONVERSATIONS, false);
    return SEED_CONVERSATIONS;
  },

  saveConversations(convs: TeacherConversation[], broadcast = true) {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(convs));
      if (broadcast) {
        this.broadcastAction({ type: 'UPDATE_CONVERSATIONS', conversations: convs });
      }
    } catch {}
  },

  getSchedule(): DaySchedule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SCHEDULE);
      if (data) return JSON.parse(data);
    } catch {}
    this.saveSchedule(SEED_SCHEDULE, false);
    return SEED_SCHEDULE;
  },

  saveSchedule(schedule: DaySchedule[], broadcast = true) {
    try {
      localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(schedule));
      if (broadcast) {
        this.broadcastAction({ type: 'UPDATE_SCHEDULE', schedule });
      }
    } catch {}
  },

  // Cross-Tab and window synchronizer
  broadcastAction(payload: any) {
    try {
      if (typeof window !== 'undefined') {
        const fullState = {
          students: this.getStudents(),
          classes: this.getClasses(),
          notifications: this.getNotifications(),
          dailyReport: this.getDailyReport(),
          conversations: this.getConversations(),
          schedule: this.getSchedule(),
        };

        const syncMessage = { ...payload, fullState };

        if ('BroadcastChannel' in window) {
          const channel = new BroadcastChannel('madrasa_school_sync_v3');
          channel.postMessage(syncMessage);
          channel.close();
        }

        localStorage.setItem('madrasa_last_sync_timestamp', Date.now().toString());
      }
    } catch {}
  },

  onSync(callback: (data: any) => void) {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('madrasa_school_sync_v3');
      channel.onmessage = (event) => {
        if (event.data?.fullState) {
          callback(event.data.fullState);
        } else if (event.data) {
          callback(event.data);
        }
      };
      return () => channel.close();
    }
    return () => {};
  },

  resetAllData() {
    this.saveStudents(SEED_STUDENTS, false);
    this.saveClasses(SEED_CLASSES, false);
    this.saveNotifications(SEED_NOTIFICATIONS, false);
    this.saveDailyReport(SEED_DAILY_REPORT, false);
    this.saveConversations(SEED_CONVERSATIONS, false);
    this.saveSchedule(SEED_SCHEDULE, false);
    this.broadcastAction({ type: 'RESET_ALL' });
  }
};
