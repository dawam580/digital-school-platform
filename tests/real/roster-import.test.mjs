/**
 * استيراد قوائم الطلاب الحقيقية: لا اختلاق بيانات، لا هواتف تعبئة، وحضور عام كامل يتسع في التخزين.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSrc, installLocalStorage } from './build-module.mjs';

installLocalStorage();
globalThis.window = { dispatchEvent() {}, addEventListener() {} };
const PROD = { 'config/devMode': 'export const DEV_MODE = false;' };
const roster = await importSrc('src/services/importers/rosterSanitizer.ts', PROD);
const { CryptoVaultService } = await importSrc('src/services/security/cryptoVault.ts', PROD);
const { parseStudentsCsv } = await importSrc('src/utils/excelHelper.ts', PROD);
const { SmartDataEngine } = await importSrc('src/services/ai/smartDataEngine.ts', PROD);

test('هواتف التعبئة والصيغ غير الليبية لا تُربط بولي أمر', () => {
  assert.equal(roster.cleanParentPhone('0912000001'), '');
  assert.equal(roster.cleanParentPhone('0912345678'), '');
  assert.equal(roster.cleanParentPhone('0550000000'), '');
  assert.equal(roster.cleanParentPhone('+218 92 123 4567'), '0921234567');
  assert.equal(roster.cleanParentPhone('٠٩١٧٧٧٨٨٩٩'), '0917778899');
});

test('صف قائمة رسمية ← طالب بلا درجات أو حضور مختلق', () => {
  const s = roster.studentFromRosterRow({ name: ' أحمد  محمد عيسى ', nationalNumber: '220195864392', className: '1/1 مساء', grade: 'الصف الأول الأساسي', motherName: '—', parentName: 'ولي أمر أحمد', parentPhone: '0912000001' }, 0);
  assert.equal(s.name, 'أحمد محمد عيسى');
  assert.equal(s.gender, 'female'); // الخانة الأولى 2
  assert.equal(s.motherName, '');
  assert.equal(s.parentName, '');
  assert.equal(s.parentPhone, '');
  assert.equal(s.academicAverage, 0);
  assert.deepEqual(s.subjects, []);
  assert.deepEqual(s.recentAttendance, []);
  assert.ok(s.linkCode); // فهرس IndexedDB فريد على linkCode
});

test('المستورد الذكي لا يولّد رقماً وطنياً ولا درجات', () => {
  const s = SmartDataEngine.completeStudentData({ name: 'سالم علي', className: '5/1 صباح' }, 3);
  assert.equal(s.nationalNumber, '');
  assert.equal(s.grade, 'الصف الخامس الأساسي');
  assert.equal(s.academicAverage, 0);
  assert.equal(s.motherName, '');
  assert.deepEqual(s.subjects, []);
  const t = SmartDataEngine.completeTeacherData({ name: 'أ. خالد', assignedClasses: [] }, 0);
  assert.equal(t.phone, '');
  assert.deepEqual(t.assignedClasses, []);
});

test('CSV: يقرأ كشف المنظومة الرسمي بأسماء الأعمدة', () => {
  const csv = '﻿"ت","اسم الطالب رباعي","الرقم الوطني (12 خانة)","اسم الأم","الجنس","تاريخ الميلاد","مكان الميلاد","الصف الدراسي","الفصل / الشعبة","هاتف ولي الأمر","العام الدراسي"\n'
    + '"1","فاطمة سالم علي الورفلي","220150000001","خديجة","أنثى","2015-03-02","توكرة","الصف الخامس الأساسي","5/1 صباح","0925550001","2026 - 2027 م"\n'
    + '"2","علي, محمد","","","ذكر","","","الصف الخامس الأساسي","5/1 صباح","",""';
  const list = parseStudentsCsv(csv);
  assert.equal(list.length, 2);
  assert.equal(list[0].className, '5/1 صباح');
  assert.equal(list[0].parentPhone, '0925550001');
  assert.equal(list[0].birthPlace, 'توكرة');
  assert.equal(list[1].name, 'علي, محمد');
  assert.equal(list[1].nationalNumber, '');
});

test('منع التكرار بالرقم الوطني ثم رقم القيد', () => {
  assert.equal(roster.studentDedupKey({ id: 'a', studentNumber: '9', nationalNumber: '120150000001' }), 'nn:120150000001');
  assert.equal(roster.studentDedupKey({ id: 'a', studentNumber: '9' }), 'sn:9');
});

test('ضغط سجل الحضور: عام كامل لـ900 طالب يتسع في localStorage ويُستعاد كما هو', () => {
  const days = [];
  const d = new Date(2026, 8, 1);
  while (days.length < 180) { if (d.getDay() < 5) days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`); d.setDate(d.getDate() + 1); }
  const history = days.reverse().map((date, i) => ({ date, status: i % 11 ? 'present' : 'unexcused', ...(i === 5 ? { note: 'مرض' } : {}) }));
  const base = roster.studentFromRosterRow({ name: 'طالب تجريبي', nationalNumber: '120150000001', className: '5/1' }, 0);
  const student = { ...base, recentAttendance: history };
  const stored = CryptoVaultService.encryptStudent(student);
  const back = CryptoVaultService.decryptStudent(JSON.parse(JSON.stringify(stored)));
  assert.deepEqual(back.recentAttendance, history);
  assert.equal(back._att, undefined);
  const perStudent = JSON.stringify(stored).length;
  assert.ok(perStudent * 900 < 3_000_000, `حجم 900 طالب ${perStudent * 900}`);
});
