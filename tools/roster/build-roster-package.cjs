#!/usr/bin/env node
/**
 * تحويل قائمة طلاب مدرسة (server_db.json أو حزمة قديمة) إلى حزمة استيراد نظيفة
 * تُستورد على حاسوب تلك المدرسة فقط: إدارة المدارس ← استرجاع المنظومة من ملف احتياطي.
 *
 *   node tools/roster/build-roster-package.cjs --in server_db.json --out ~/الباعور.madrasa.json [--school "اسم المدرسة"]
 *
 * يُبقي: الاسم، الرقم الوطني، رقم القيد، الصف، الفصل، الأم، الميلاد، الجنس، ولي الأمر.
 * يحذف: الدرجات والحضور والسلوك المولّدة، هواتف التعبئة (0912000xxx…)، البريد المولّد،
 *        المعلمين التجريبيين. لا يضع الحزمة داخل dist ولا في نسخة العرض.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
}
const ROOT = path.resolve(__dirname, '../..');
const input = path.resolve(args.in || path.join(ROOT, 'server_db.json'));
const output = path.resolve(String(args.out || path.join(os.homedir(), 'roster.madrasa.json')).replace(/^~(?=\/|\\)/, os.homedir()));

if (output.startsWith(path.join(ROOT, 'dist')) || output.startsWith(path.join(ROOT, 'public'))) {
  console.error('❌ لا تضع بيانات طلاب حقيقية داخل dist/ أو public/ — ستُنشر مع المنظومة لكل الزبائن.');
  process.exit(1);
}

const src = JSON.parse(fs.readFileSync(input, 'utf8'));
const students = Array.isArray(src.students) ? src.students : [];
if (!students.length) { console.error('❌ لا يوجد طلاب في', input); process.exit(1); }

const PLACEHOLDER = new Set(['0912345678', '0550000000', '0922465676', '0900000000']);
const toWestern = (v) => String(v || '').replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
function phone(raw) {
  let d = toWestern(raw).replace(/[\s\-().+]/g, '');
  if (d.startsWith('00218')) d = d.slice(5); else if (d.startsWith('218')) d = d.slice(3);
  if (/^9[1-6]\d{7}$/.test(d)) d = '0' + d;
  if (!/^09[1-6]\d{7}$/.test(d) || PLACEHOLDER.has(d) || /^0912000\d{3}$/.test(d)) return '';
  return d;
}
const nn = (raw) => { const d = toWestern(raw).replace(/\D/g, ''); return /^\d{12}$/.test(d) ? d : ''; };
const txt = (v) => { const s = String(v ?? '').trim(); return s === '—' || s === '-' || s === 'غير مسجل' ? '' : s; };
const placeholderParent = (n) => /^ولي (أمر|الأمر)( الطالب)?\s/.test(n);

const seen = new Set();
let dropped = 0, phones = 0;
const clean = [];
for (const s of students) {
  const nationalNumber = nn(s.nationalNumber || s.nationalId);
  const key = nationalNumber || txt(s.studentNumber) || s.id;
  if (!txt(s.name) || seen.has(key)) { dropped++; continue; }
  seen.add(key);
  const parentPhone = phone(s.parentPhone);
  if (parentPhone) phones++;
  const parentName = txt(s.parentName);
  const gender = s.gender === 'female' || nationalNumber.startsWith('2') ? 'female' : 'male';
  clean.push({
    id: s.id || `std-${key}`,
    name: txt(s.name).replace(/\s+/g, ' '),
    nationalId: nationalNumber,
    nationalNumber,
    studentNumber: txt(s.studentNumber),
    linkCode: s.linkCode || `STD-${key}`,
    avatar: '',
    grade: txt(s.grade),
    className: txt(s.className),
    gender,
    motherName: txt(s.motherName),
    birthDate: /^\d{4}-\d{2}-\d{2}$/.test(txt(s.birthDate)) ? txt(s.birthDate) : '',
    birthPlace: txt(s.birthPlace),
    parentName: placeholderParent(parentName) ? '' : parentName,
    parentPhone,
    parentEmail: '',
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
  });
}

const byClass = new Map();
for (const s of clean) if (s.className) byClass.set(s.className, (byClass.get(s.className) || 0) + 1);
const srcClasses = Array.isArray(src.classes) ? src.classes : [];
const classes = [...byClass.entries()].map(([name, count], i) => {
  const c = srcClasses.find(x => x.name === name) || {};
  const grade = c.grade || (clean.find(s => s.className === name) || {}).grade || '';
  return { id: c.id || `cls-${i + 1}`, name, grade, studentCount: count, presentCount: 0, absentCount: 0, lateCount: 0, supervisor: '' };
}).sort((a, b) => a.name.localeCompare(b.name, 'ar', { numeric: true }));

const pkg = {
  ...(args.school ? { schoolProfile: { name: String(args.school).trim() } } : {}),
  students: clean,
  classes,
  exportedAt: new Date().toISOString(),
  platform: 'Digital School Platform Libya 360',
  source: 'roster-import',
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(pkg), 'utf8');
console.log(`✅ ${clean.length} طالب • ${classes.length} فصل • هواتف أولياء أمور صالحة: ${phones}${dropped ? ` • مُسقط (بلا اسم/مكرر): ${dropped}` : ''}`);
console.log('📁', output, `(${(fs.statSync(output).size / 1024).toFixed(0)} KB)`);
console.log('ℹ️  المعلمون غير مضمَّنين — يضيفهم المدير من «التحكم في المعلمين». هواتف أولياء الأمور تُستكمل من ملفات الطلاب.');
