import { Student } from '../types';
import { studentFromRosterRow } from '../services/importers/rosterSanitizer';
import { currentAcademicYear } from '../services/domain/libyanCalendar';

/**
 * Generates and downloads an Arabic-encoded Libyan Official School Excel file (.csv with UTF-8 BOM)
 */
export function exportLibyanStudentsToExcel(
  students: Array<any>,
  filename = 'كشف_بيانات_الطلاب_الرسمي_ليبيا_2026.csv'
) {
  const headers = [
    'ت',
    'اسم الطالب رباعي',
    'الرقم الوطني (12 خانة)',
    'اسم الأم',
    'الجنس',
    'تاريخ الميلاد',
    'مكان الميلاد',
    'الصف الدراسي',
    'الفصل / الشعبة',
    'هاتف ولي الأمر',
    'العام الدراسي'
  ];

  const rows = students.map((s, idx) => [
    `"${idx + 1}"`,
    `"${s.name || ''}"`,
    `"${s.nationalNumber || s.nationalId || ''}"`,
    `"${s.motherName || ''}"`,
    `"${s.gender === 'male' ? 'ذكر' : 'أنثى'}"`,
    `"${s.birthDate || ''}"`,
    `"${s.birthPlace || ''}"`,
    `"${s.grade || ''}"`,
    `"${s.className || s.sectionCode || ''}"`,
    `"${s.parentPhone || ''}"`,
    `"${s.academicYear || currentAcademicYear()}"`
  ]);

  // \uFEFF is the UTF-8 BOM for Microsoft Excel Arabic compatibility
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

/** أعمدة نموذج الاستيراد — نفس أعمدة كشف المنظومة الرسمي حتى يعمل التصدير ثم الاستيراد */
const TEMPLATE_HEADERS = [
  'اسم الطالب رباعي',
  'الرقم الوطني (12 خانة)',
  'رقم القيد',
  'الصف الدراسي',
  'الفصل / الشعبة',
  'اسم الأم',
  'تاريخ الميلاد',
  'مكان الميلاد',
  'اسم ولي الأمر',
  'هاتف ولي الأمر',
  'الجنس'
];

/**
 * نموذج CSV فارغ لاستيراد الطلاب (صيغة ليبية: رقم وطني 12 خانة، هواتف 09x، فصول 5/1)
 */
export function downloadSampleExcelTemplate() {
  const sampleRows = [
    ['اسم الطالب الرباعي', '120150000000', '1001', 'الصف الخامس الأساسي', '5/1 صباح', 'اسم الأم الثلاثي', '2015-09-20', 'طرابلس', 'اسم ولي الأمر', '0910000000', 'ذكر'],
  ];

  const csvContent = '\uFEFF' + [
    TEMPLATE_HEADERS.join(','),
    ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'نموذج_استيراد_الطلاب.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/** تقسيم سطر CSV مع احترام النصوص بين علامات تنصيص */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',' || ch === ';' || ch === '\t') { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/**
 * قراءة ملف CSV للطلاب (نموذج الاستيراد أو كشف المنظومة الرسمي) بحسب أسماء الأعمدة.
 * لا يُختلق أي حقل ناقص — الرقم الوطني والهاتف والدرجات تبقى فارغة حتى تُستكمل.
 */
export function parseStudentsCsv(csvText: string): Partial<Student>[] {
  const lines = csvText.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = splitCsvLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());
  const col = (...names: string[]) => names.map(n => headers.indexOf(n)).find(i => i >= 0) ?? -1;
  const idx = {
    name: col('اسم الطالب رباعي', 'اسم الطالب', 'الاسم', 'الاسم الرباعي'),
    nn: col('الرقم الوطني (12 خانة)', 'الرقم الوطني', 'الهوية الوطنية', 'الهوية الوطنية للطالب'),
    sn: col('رقم القيد', 'الرقم الأكاديمي'),
    grade: col('الصف الدراسي', 'الصف'),
    cls: col('الفصل / الشعبة', 'الفصل', 'الشعبة'),
    mother: col('اسم الأم'),
    birthDate: col('تاريخ الميلاد'),
    birthPlace: col('مكان الميلاد'),
    parentName: col('اسم ولي الأمر'),
    parentPhone: col('هاتف ولي الأمر'),
    gender: col('الجنس'),
  };
  if (idx.name < 0) return [];

  const parsedStudents: Partial<Student>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const get = (j: number) => (j >= 0 ? cols[j] || '' : '');
    let className = get(idx.cls);
    const grade = get(idx.grade);
    // نموذج قديم: عمود "الشعبة" حرف فقط (أ) ← "5/أ" من رقم الصف غير متاح، فنُبقيه كما هو
    if (className && /^[أ-ي]$/.test(className) && grade) className = `${grade.replace(/^الصف\s*/, '')} / ${className}`;
    const st = studentFromRosterRow({
      name: get(idx.name),
      nationalNumber: get(idx.nn),
      studentNumber: get(idx.sn),
      grade,
      className,
      motherName: get(idx.mother),
      birthDate: get(idx.birthDate),
      birthPlace: get(idx.birthPlace),
      parentName: get(idx.parentName),
      parentPhone: get(idx.parentPhone),
      gender: get(idx.gender),
    }, i, 'std-csv');
    if (st) parsedStudents.push(st);
  }

  return parsedStudents;
}
