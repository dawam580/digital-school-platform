/**
 * تقوية الدخول في بناء الإنتاج (DEV_MODE=false) — الكود الحقيقي لـ authEngine/securityEngine.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { importSrc, installLocalStorage } from './build-module.mjs';

const PROD = { 'config/devMode': 'export const DEV_MODE = false;' };
installLocalStorage();
globalThis.window = {};
const { AuthEngine, normalizeLibyanPhone } = await importSrc('src/services/security/authEngine.ts', PROD);
const { SecurityEngine } = await importSrc('src/services/security/securityEngine.ts', PROD);
const { db } = await importSrc('src/services/db.ts', PROD);

const student = (over) => ({
  id: 'std-1', name: 'سالم علي', nationalId: '', nationalNumber: '120150000001', studentNumber: '5000001',
  linkCode: 'SCH-2026-L1', parentAccessCode: '483920', avatar: 'x', grade: '9', className: '9/1',
  gender: 'male', parentName: 'علي', parentPhone: '0912223344', parentEmail: '', status: 'present',
  attendanceRate: 100, academicAverage: 0, behaviorRating: 'جيد', behaviorPointsTotal: 0,
  behaviorPoints: [], competencies: [], subjects: [], ...over,
});

beforeEach(() => {
  localStorage.clear();
  AuthEngine.clearAllAttempts();
  db.saveStudents([
    student(),
    student({ id: 'std-2', name: 'مريم علي', nationalNumber: '120150000002', studentNumber: '5000002', linkCode: 'SCH-2026-L2', parentAccessCode: '771204' }),
    student({ id: 'std-3', name: 'غريب', nationalNumber: '120150000003', studentNumber: '5000003', linkCode: 'SCH-2026-L3', parentAccessCode: '650981', parentPhone: '0945556677' }),
  ]);
});

test('صيغ الهاتف الليبي تُوحَّد (+218 / 00218 / أرقام عربية / 095)', () => {
  assert.equal(normalizeLibyanPhone('+218 91 222 3344'), '0912223344');
  assert.equal(normalizeLibyanPhone('00218-92-1234567'), '0921234567');
  assert.equal(normalizeLibyanPhone('٠٩٤٥٥٥٦٦٧٧'), '0945556677');
  assert.equal(normalizeLibyanPhone('0951234567'), '0951234567');
  assert.equal(normalizeLibyanPhone('LIB-COMP-09'), 'LIB-COMP-09');
});

test('ولي الأمر: لا دخول بدون رمز، ولا برمز خاطئ، ولا برقم هاتف غير مسجل', () => {
  assert.equal(AuthEngine.verifyCredentials({ role: 'parent', identifier: '5000001', password: '' }).success, false);
  assert.equal(AuthEngine.verifyCredentials({ role: 'parent', identifier: '5000001', password: '5000001' }).success, false, 'رقم القيد ليس كلمة مرور');
  AuthEngine.clearAllAttempts();
  assert.equal(AuthEngine.verifyCredentials({ role: 'parent', identifier: '0919999999', password: '483920' }).success, false);
  AuthEngine.clearAllAttempts();
  assert.equal(AuthEngine.verifyCredentials({ role: 'parent', identifier: 'SCH-2026-L1', password: '' }).success, false, 'رمز الربط وحده لا يكفي');
});

test('ولي الأمر برمزه الصحيح يرى أبناءه (الإخوة بنفس الهاتف) فقط', () => {
  const res = AuthEngine.verifyCredentials({ role: 'parent', identifier: '120150000001', password: '483920' });
  assert.equal(res.success, true);
  assert.deepEqual([...res.studentIds].sort(), ['std-1', 'std-2']);
  assert.ok(!res.studentIds.includes('std-3'));
});

test('رمز ولي أمر طالب آخر لا يفتح هذا الطالب', () => {
  const res = AuthEngine.verifyCredentials({ role: 'parent', identifier: '5000001', password: '650981' });
  assert.equal(res.success, false);
});

test('محاولات التخمين تُجمَّد بعد 3 أخطاء', () => {
  for (let i = 0; i < 3; i++) AuthEngine.verifyCredentials({ role: 'parent', identifier: '5000001', password: '000000' });
  const res = AuthEngine.verifyCredentials({ role: 'parent', identifier: '5000001', password: '483920' });
  assert.equal(res.success, false);
  assert.equal(res.isLockedOut, true);
});

test('الإنتاج: هواتف العرض 0912345678/0922465676 ليست مدراء لأي مدرسة', () => {
  localStorage.setItem('madrasa_admin_phone', '0915551234');
  const phones = AuthEngine.getAuthorizedAdminPhones();
  assert.ok(!phones.includes('0912345678'));
  assert.ok(!phones.includes('0922465676'));
  assert.equal(AuthEngine.verifyCredentials({ role: 'admin', identifier: '0912345678', password: '2026' }).success, false);
});

test('الإنتاج: لا رمز ماستر افتراضي (9988 مرفوض)', () => {
  assert.equal(SecurityEngine.getSuperAdminPin(), '');
  localStorage.setItem('madrasa_superadmin_pin_sec', '730194');
  assert.equal(SecurityEngine.verifySuperAdminPin('9988').valid, false);
  assert.equal(SecurityEngine.verifySuperAdminPin('730194').valid, true);
});

test('الكشف الذكي: كود المعلم يُرجع رمزه الرسمي لا معرّفه الداخلي', () => {
  localStorage.setItem('madrasa_db_teachers_v4', JSON.stringify([{ id: 't-77', code: 'LIB-ARA-01', name: 'أ. هدى', subject: 'العربية', phone: '0913334455', status: 'active', assignedClasses: [] }]));
  localStorage.setItem('madrasa_teacher_pwd_LIB-ARA-01', 'Huda@2026');
  const res = AuthEngine.detectAndVerify('lib-ara-01', 'Huda@2026');
  assert.equal(res.success, true);
  assert.equal(res.role, 'teacher');
  assert.equal(res.actorCode, 'LIB-ARA-01');
  AuthEngine.clearAllAttempts();
  assert.equal(AuthEngine.detectAndVerify('+218913334455', 'Huda@2026').success, true, 'الدخول بهاتف المعلم الدولي');
});

test('كل طالب يحصل تلقائياً على رمز ولي أمر عشوائي من 6 أرقام', () => {
  db.saveStudents([student({ parentAccessCode: undefined }), student({ id: 'x2', parentAccessCode: undefined })]);
  const all = db.getAllStudents();
  for (const s of all) assert.match(s.parentAccessCode, /^\d{6}$/);
  assert.notEqual(all[0].parentAccessCode, all[1].parentAccessCode);
});

test('تثبيت جديد بلا هاتف مدير: أول دخول يسجّل الهاتف، وبعده لا يدخل غيره', () => {
  assert.equal(AuthEngine.isAdminUnclaimed(), true);
  assert.equal(AuthEngine.verifyCredentials({ role: 'admin', identifier: '0927770000', password: '0000' }).success, false, 'رمز خاطئ يُرفض حتى قبل التسجيل');
  AuthEngine.clearAllAttempts();
  assert.equal(AuthEngine.verifyCredentials({ role: 'admin', identifier: '0927770000', password: SecurityEngine.getDirectorPin() }).success, true);
  assert.equal(localStorage.getItem('madrasa_admin_phone'), '0927770000');
  assert.equal(AuthEngine.isAdminUnclaimed(), false);
  assert.equal(AuthEngine.verifyCredentials({ role: 'admin', identifier: '0911111112', password: SecurityEngine.getDirectorPin() }).success, false);
});
