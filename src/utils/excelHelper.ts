import { Student } from '../types';

/**
 * Generates and downloads an Arabic-encoded Excel (CSV with UTF-8 BOM) file
 */
export function exportStudentsToExcel(students: Student[], filename = 'قائمة_طلاب_المدرسة_2026.csv') {
  const headers = [
    'الرقم الأكاديمي',
    'اسم الطالب',
    'الهوية الوطنية للطالب',
    'الصف',
    'الشعبة',
    'اسم ولي الأمر',
    'هاتف ولي الأمر',
    'كود الربط',
    'نسبة الحضور',
    'المعدل الأكاديمي',
    'نقاط السلوك',
    'حالة اليوم'
  ];

  const rows = students.map(s => [
    `"${s.studentNumber}"`,
    `"${s.name}"`,
    `"${s.nationalId}"`,
    `"${s.grade}"`,
    `"${s.className.split('/')[1]?.trim() || s.className}"`,
    `"${s.parentName}"`,
    `"${s.parentPhone}"`,
    `"${s.linkCode}"`,
    `"${s.attendanceRate}%"`,
    `"${s.academicAverage}%"`,
    `"${s.behaviorPointsTotal}"`,
    `"${s.status === 'present' ? 'حاضر' : s.status === 'unexcused' ? 'غائب' : s.status === 'late' ? 'متأخر' : 'بعذر'}"`
  ]);

  // \uFEFF is the UTF-8 BOM for Microsoft Excel compatibility
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generates an empty sample Excel/CSV template for importing students from other systems (e.g. Noor System)
 */
export function downloadSampleExcelTemplate() {
  const headers = [
    'اسم الطالب',
    'الهوية الوطنية',
    'الرقم الأكاديمي',
    'الصف',
    'الشعبة',
    'اسم ولي الأمر',
    'هاتف ولي الأمر',
    'الجنس'
  ];

  const sampleRows = [
    ['محمد بن عبدالله الدوسري', '1102938475', '2026-0201', 'الصف الخامس الابتدائي', 'أ', 'عبدالله بن محمد الدوسري', '0551122334', 'male'],
    ['نورة بنت فهد الشمري', '1109847261', '2026-0202', 'الصف الخامس الابتدائي', 'ب', 'فهد بن ناصر الشمري', '0559988776', 'female'],
    ['عبدالرحمن بن خالد الزهراني', '1108273645', '2026-0203', 'الصف السادس الابتدائي', 'أ', 'خالد بن سعد الزهراني', '0501234567', 'male']
  ];

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'نموذج_استيراد_الطلاب_نظام_المدرسة.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parses uploaded CSV / Excel text file and converts into Student objects
 */
export function parseStudentsCsv(csvText: string): Partial<Student>[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  // Remove BOM if present
  const cleanFirstLine = lines[0].replace(/^\uFEFF/, '');
  const headers = cleanFirstLine.split(',').map(h => h.replace(/^["']|["']$/g, '').trim());

  const parsedStudents: Partial<Student>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Regex for CSV with quoted strings
    const match = rawLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    const cols = (match || rawLine.split(',')).map(c => c.replace(/^["']|["']$/g, '').trim());

    if (cols.length >= 3 && cols[0]) {
      const name = cols[0];
      const nationalId = cols[1] || `10${Math.floor(10000000 + Math.random() * 90000000)}`;
      const studentNumber = cols[2] || `2026-${1000 + i}`;
      const grade = cols[3] || 'الصف الخامس الابتدائي';
      const section = cols[4] || 'أ';
      const parentName = cols[5] || `ولي أمر الطالب ${name.split(' ')[0]}`;
      const parentPhone = cols[6] || '0550000000';
      const gender = (cols[7] === 'female' || cols[7] === 'أنثى') ? 'female' : 'male';

      parsedStudents.push({
        id: `std-imp-${Date.now()}-${i}`,
        name,
        nationalId,
        studentNumber,
        linkCode: `SCH-2026-${name.charAt(0).toUpperCase()}${i}`,
        avatar: gender === 'female'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        grade,
        className: `${grade.includes('السادس') ? 'سادس' : grade.includes('الرابع') ? 'رابع' : 'خامس'} / ${section}`,
        gender,
        parentName,
        parentPhone,
        parentEmail: `parent.${nationalId}@school.edu`,
        status: 'present',
        attendanceRate: 100,
        academicAverage: 95.0,
        behaviorRating: 'ممتاز',
        behaviorPointsTotal: 20,
        lastSeenTime: '07:15 صباحاً (البوابة)',
        competencies: [
          { name: 'حل المشكلات', score: 90, maxScore: 100 },
          { name: 'التفكير الإبداعي', score: 92, maxScore: 100 },
          { name: 'العمل الجماعي', score: 95, maxScore: 100 },
          { name: 'الانضباط والمسؤولية', score: 95, maxScore: 100 },
          { name: 'التعبير اللغوي', score: 90, maxScore: 100 },
          { name: 'اللياقة والنشاط', score: 95, maxScore: 100 },
        ],
        behaviorPoints: [],
        badges: [],
        subjects: [
          { name: 'الرياضيات', score: 95, maxScore: 100, teacher: 'أ. أحمد الغامدي', evaluation: 'مستوى ممتاز' },
          { name: 'لغتي الجميلة', score: 94, maxScore: 100, teacher: 'أ. عبدالمحسن الدوسري', evaluation: 'قراءة ومشاركة جيدة' },
          { name: 'العلوم', score: 96, maxScore: 100, teacher: 'أ. خالد الشهري', evaluation: 'تفاعل ممتاز' },
        ],
        recentAttendance: [{ date: '2026-09-01', status: 'present' }],
        notes: []
      });
    }
  }

  return parsedStudents;
}
