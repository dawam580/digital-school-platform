/**
 * قواعد التعليم الليبي: العام الدراسي، العطلة الأسبوعية، والنتائج بلا درجات مختلقة.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSrc, installLocalStorage } from './build-module.mjs';

installLocalStorage();
globalThis.window = {};
const PROD = { 'config/devMode': 'export const DEV_MODE = false;' };
const cal = await importSrc('src/services/domain/libyanCalendar.ts');
const { LibyanExamEngine } = await importSrc('src/services/exams/libyanExamEngine.ts', PROD);

test('العام الدراسي يتحول في أغسطس', () => {
  assert.equal(cal.currentAcademicYear(new Date(2026, 9, 3)), '2026 - 2027 م');
  assert.equal(cal.currentAcademicYear(new Date(2027, 4, 20)), '2026 - 2027 م');
  assert.equal(cal.currentAcademicYear(new Date(2027, 7, 1)), '2027 - 2028 م');
  assert.equal(cal.academicYearStart('2025 - 2026 م'), 2025);
});

test('العطلة الأسبوعية الليبية: الجمعة والسبت', () => {
  assert.equal(cal.isLibyanWeekend(new Date(2026, 9, 2)), true);  // الجمعة
  assert.equal(cal.isLibyanWeekend(new Date(2026, 9, 3)), true);  // السبت
  assert.equal(cal.isLibyanWeekend(new Date(2026, 9, 4)), false); // الأحد
});

test('سلّم التقديرات الليبي', () => {
  assert.equal(cal.libyanAppreciation(85), 'ممتاز');
  assert.equal(cal.libyanAppreciation(75), 'جيد جداً');
  assert.equal(cal.libyanAppreciation(65), 'جيد');
  assert.equal(cal.libyanAppreciation(50), 'مقبول');
  assert.equal(cal.libyanAppreciation(49.9), 'ضعيف');
});

const subjects = [
  { code: 'ARA', name: 'اللغة العربية', maxScore: 100, minScore: 50, courseworkMax: 40, examMax: 60, weeklyPeriods: 6 },
  { code: 'MATH', name: 'الرياضيات', maxScore: 100, minScore: 50, courseworkMax: 40, examMax: 60, weeklyPeriods: 6 },
];
const student = { id: 's1', name: 'طالب', className: '9/1', studentNumber: '1', subjects: [] };

test('طالب بلا درجات مرصودة: "بانتظار الرصد" لا "ناجح بمرتبة الشرف"', () => {
  const r = LibyanExamEngine.calculateStudentExamReport(student, subjects, new Map());
  assert.equal(r.status, 'pending');
  assert.equal(r.totalEarnedScore, 0);
});

test('رصد كامل: النتيجة الرسمية وفق الصغرى 50 والدور الثاني', () => {
  const rec = (code, cw, ex) => [`s1_${code}`, { id: `s1_${code}`, studentId: 's1', subjectCode: code, courseworkScore: cw, examScore: ex }];
  const pass = LibyanExamEngine.calculateStudentExamReport(student, subjects, new Map([rec('ARA', 35, 50), rec('MATH', 30, 40)]));
  assert.equal(pass.status, 'passed');
  const makeup = LibyanExamEngine.calculateStudentExamReport(student, subjects, new Map([rec('ARA', 35, 50), rec('MATH', 20, 20)]));
  assert.equal(makeup.status, 'makeup_exam');
  assert.deepEqual(makeup.failedSubjects, ['الرياضيات']);
});
