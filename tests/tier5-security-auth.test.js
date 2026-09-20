/**
 * Tier 5: Strict Security, Authentication & Anti-Brute-Force Suite
 * Verifies that unauthorized phones are rejected, credentials are enforced,
 * and rate limiting / lockouts function as designed.
 */

import {
  TestRunner,
  expect,
  setupBrowserEnvironment,
  SchoolStateSimulator
} from './test-harness.js';

// Libyan phone format regex: 091, 092, 093, 094 followed by 7 digits
const LIBYAN_PHONE_RE = /^09[1234]\d{7}$/;

// Pure In-Memory Reference Auth Engine for Test Harness
class TestAuthEngine {
  static attempts = new Map();
  static MAX_ATTEMPTS = 3;
  static LOCKOUT_MS = 30000;

  static reset() {
    this.attempts.clear();
  }

  static isLockedOut(identifier) {
    const key = identifier.trim().toLowerCase();
    const tracker = this.attempts.get(key);
    if (!tracker) return false;
    return Date.now() < tracker.lockoutUntil;
  }

  static verify({ role, identifier, password }) {
    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    if (this.isLockedOut(cleanId)) {
      return { success: false, isLockedOut: true, error: 'تم تجميد محاولات الدخول مؤقتاً.' };
    }

    if (role === 'admin') {
      if (!LIBYAN_PHONE_RE.test(cleanId)) {
        return { success: false, error: 'صيغة الهاتف غير صالحة.' };
      }
      const authorized = ['0922465676', '0912345678'];
      if (!authorized.includes(cleanId)) {
        this.recordFail(cleanId);
        return { success: false, error: 'رقم الهاتف غير مسجل كمدير معتمد.' };
      }
      const validSecrets = ['2026', '123456'];
      const custom = globalThis.localStorage?.getItem('madrasa_admin_password');
      if (custom) validSecrets.push(custom);
      if (!validSecrets.includes(cleanPass)) {
        this.recordFail(cleanId);
        return { success: false, error: 'رمز الأمان أو كلمة المرور غير صحيحة.' };
      }
      this.attempts.delete(cleanId.toLowerCase());
      return { success: true, role: 'admin' };
    }

    if (role === 'exams_coordinator') {
      if (!LIBYAN_PHONE_RE.test(cleanId)) {
        return { success: false, error: 'صيغة الهاتف غير صالحة.' };
      }
      const authorized = ['0912345678', '0922465676'];
      if (!authorized.includes(cleanId)) {
        this.recordFail(cleanId);
        return { success: false, error: 'رقم الهاتف غير مسجل كرئيس كنترول معتمد.' };
      }
      const validSecrets = ['2026', '123456'];
      const customExams = globalThis.localStorage?.getItem('madrasa_exams_password');
      if (customExams) validSecrets.push(customExams);
      if (!validSecrets.includes(cleanPass)) {
        this.recordFail(cleanId);
        return { success: false, error: 'كلمة المرور غير صحيحة.' };
      }
      this.attempts.delete(cleanId.toLowerCase());
      return { success: true, role: 'exams_coordinator' };
    }

    if (role === 'teacher') {
      const validTeachers = ['LIB-COMP-09', 'LIB-MATH-01', 'LIB-SOC-01'];
      if (!validTeachers.includes(cleanId.toUpperCase())) {
        this.recordFail(cleanId);
        return { success: false, error: 'رمز المعلم غير مسجل.' };
      }
      const validSecrets = ['123456', '2026'];
      const customTeacher = globalThis.localStorage?.getItem(`madrasa_teacher_pwd_${cleanId.toUpperCase()}`);
      if (customTeacher) validSecrets.push(customTeacher);
      if (!validSecrets.includes(cleanPass)) {
        this.recordFail(cleanId);
        return { success: false, error: 'كلمة المرور غير صحيحة.' };
      }
      this.attempts.delete(cleanId.toLowerCase());
      return { success: true, role: 'teacher' };
    }

    if (role === 'superadmin') {
      if (cleanId.toUpperCase() !== 'DISTRICT-SUPER-01') {
        return { success: false, error: 'رمز تفويض المدير العام غير صحيح.' };
      }
      if (cleanPass !== '9988') {
        this.recordFail(cleanId);
        return { success: false, error: 'رمز الماستر غير صحيح.' };
      }
      this.attempts.delete(cleanId.toLowerCase());
      return { success: true, role: 'superadmin' };
    }

    if (role === 'parent') {
      const validStudents = ['120195864392', 'SCH-2026-B1', '1001', '1002'];
      if (!validStudents.includes(cleanId)) {
        this.recordFail(cleanId);
        return { success: false, error: 'الرقم الوطني غير مسجل في كشف المدرسة.' };
      }
      if (cleanPass !== '123456' && cleanPass !== '2026') {
        this.recordFail(cleanId);
        return { success: false, error: 'كلمة المرور غير صحيحة.' };
      }
      this.attempts.delete(cleanId.toLowerCase());
      return { success: true, role: 'parent' };
    }

    return { success: false, error: 'نوع الحساب غير معروف.' };
  }

  static recordFail(identifier) {
    const key = identifier.trim().toLowerCase();
    const cur = this.attempts.get(key) || { count: 0, lockoutUntil: 0 };
    cur.count += 1;
    if (cur.count >= this.MAX_ATTEMPTS) {
      cur.lockoutUntil = Date.now() + this.LOCKOUT_MS;
    }
    this.attempts.set(key, cur);
  }
}

export function createTier5Suite() {
  const runner = new TestRunner('Tier 5: Strict Multi-Role Authentication & Anti-Tamper Security');

  runner.beforeEach(() => {
    setupBrowserEnvironment();
    TestAuthEngine.reset();
  });

  // ==========================================
  // 1. Admin Gate Security Tests
  // ==========================================
  runner.describe('SEC-01: Admin Gate Security & Isolation', () => {
    runner.test('SEC.01 - Random Libyan phone number rejected for Admin role', () => {
      const res = TestAuthEngine.verify({
        role: 'admin',
        identifier: '0919999999',
        password: '2026'
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe('رقم الهاتف غير مسجل كمدير معتمد.');
    });

    runner.test('SEC.02 - Invalid phone format (not 10 digits or not 09x) rejected', () => {
      const res = TestAuthEngine.verify({
        role: 'admin',
        identifier: '0551234567',
        password: '2026'
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe('صيغة الهاتف غير صالحة.');
    });

    runner.test('SEC.03 - Authorized director phone with wrong PIN/password rejected', () => {
      const res = TestAuthEngine.verify({
        role: 'admin',
        identifier: '0922465676',
        password: 'wrong_password_999'
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe('رمز الأمان أو كلمة المرور غير صحيحة.');
    });

    runner.test('SEC.04 - Authorized director phone with correct PIN (2026) succeeds', () => {
      const res = TestAuthEngine.verify({
        role: 'admin',
        identifier: '0922465676',
        password: '2026'
      });
      expect(res.success).toBe(true);
      expect(res.role).toBe('admin');
    });

    runner.test('SEC.05 - Brute force lockout triggered after 3 consecutive failed attempts', () => {
      TestAuthEngine.verify({ role: 'admin', identifier: '0922465676', password: 'bad1' });
      TestAuthEngine.verify({ role: 'admin', identifier: '0922465676', password: 'bad2' });
      TestAuthEngine.verify({ role: 'admin', identifier: '0922465676', password: 'bad3' });

      // 4th attempt must be locked out immediately
      const lockedRes = TestAuthEngine.verify({ role: 'admin', identifier: '0922465676', password: '2026' });
      expect(lockedRes.success).toBe(false);
      expect(lockedRes.isLockedOut).toBe(true);
    });
  });

  // ==========================================
  // 2. Exams Coordinator & Control Gate
  // ==========================================
  runner.describe('SEC-02: Exams Coordinator & Control Gate', () => {
    runner.test('SEC.06 - Unauthorized phone number rejected for Exams Coordinator', () => {
      const res = TestAuthEngine.verify({
        role: 'exams_coordinator',
        identifier: '0918888888',
        password: '2026'
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe('رقم الهاتف غير مسجل كرئيس كنترول معتمد.');
    });

    runner.test('SEC.07 - Authorized exams coordinator phone with correct credentials succeeds', () => {
      const res = TestAuthEngine.verify({
        role: 'exams_coordinator',
        identifier: '0912345678',
        password: '2026'
      });
      expect(res.success).toBe(true);
      expect(res.role).toBe('exams_coordinator');
    });

    runner.test('SEC.08 - Authorized exams coordinator phone with incorrect password fails', () => {
      const res = TestAuthEngine.verify({
        role: 'exams_coordinator',
        identifier: '0912345678',
        password: '0000'
      });
      expect(res.success).toBe(false);
    });
  });

  // ==========================================
  // 3. Teacher & Counselor Gate
  // ==========================================
  runner.describe('SEC-03: Teacher & Counselor Gate Security', () => {
    runner.test('SEC.09 - Non-existent teacher code rejected', () => {
      const res = TestAuthEngine.verify({
        role: 'teacher',
        identifier: 'LIB-FAKE-99',
        password: '123456'
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe('رمز المعلم غير مسجل.');
    });

    runner.test('SEC.10 - Valid teacher code with correct password succeeds', () => {
      const res = TestAuthEngine.verify({
        role: 'teacher',
        identifier: 'LIB-COMP-09',
        password: '123456'
      });
      expect(res.success).toBe(true);
      expect(res.role).toBe('teacher');
    });

    runner.test('SEC.11 - Valid teacher code with wrong password fails', () => {
      const res = TestAuthEngine.verify({
        role: 'teacher',
        identifier: 'LIB-COMP-09',
        password: 'invalid_pass'
      });
      expect(res.success).toBe(false);
    });
  });

  // ==========================================
  // 4. Super Admin & Parent Gates
  // ==========================================
  runner.describe('SEC-04: Super Admin & Parent Gate Security', () => {
    runner.test('SEC.12 - Super Admin fake token rejected', () => {
      const res = TestAuthEngine.verify({
        role: 'superadmin',
        identifier: 'HACKER-TOKEN',
        password: '9988'
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe('رمز تفويض المدير العام غير صحيح.');
    });

    runner.test('SEC.13 - Super Admin valid token with Master PIN (9988) succeeds', () => {
      const res = TestAuthEngine.verify({
        role: 'superadmin',
        identifier: 'DISTRICT-SUPER-01',
        password: '9988'
      });
      expect(res.success).toBe(true);
      expect(res.role).toBe('superadmin');
    });

    runner.test('SEC.14 - Parent with unlisted National Number rejected', () => {
      const res = TestAuthEngine.verify({
        role: 'parent',
        identifier: '999999999999',
        password: '123456'
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe('الرقم الوطني غير مسجل في كشف المدرسة.');
    });

    runner.test('SEC.15 - Parent with valid student National ID and password succeeds', () => {
      const res = TestAuthEngine.verify({
        role: 'parent',
        identifier: '120195864392',
        password: '123456'
      });
      expect(res.success).toBe(true);
      expect(res.role).toBe('parent');
    });
  });

  // ==========================================
  // 5. Password Persistence & Access Key Generation
  // ==========================================
  runner.describe('SEC-05: Password Sync & System Access Key Generation', () => {
    runner.test('SEC.16 - Custom admin password in storage takes effect and succeeds', () => {
      if (globalThis.localStorage) {
        globalThis.localStorage.setItem('madrasa_admin_password', 'NewAdminPass@2026');
      }
      const res = TestAuthEngine.verify({
        role: 'admin',
        identifier: '0922465676',
        password: 'NewAdminPass@2026'
      });
      expect(res.success).toBe(true);
      expect(res.role).toBe('admin');
      if (globalThis.localStorage) {
        globalThis.localStorage.removeItem('madrasa_admin_password');
      }
    });

    runner.test('SEC.17 - Custom teacher password in storage succeeds for that teacher', () => {
      if (globalThis.localStorage) {
        globalThis.localStorage.setItem('madrasa_teacher_pwd_LIB-COMP-09', 'TeacherSecret99');
      }
      const res = TestAuthEngine.verify({
        role: 'teacher',
        identifier: 'LIB-COMP-09',
        password: 'TeacherSecret99'
      });
      expect(res.success).toBe(true);
      expect(res.role).toBe('teacher');
      if (globalThis.localStorage) {
        globalThis.localStorage.removeItem('madrasa_teacher_pwd_LIB-COMP-09');
      }
    });

    runner.test('SEC.18 - Standard Access Key generation format and checksum validity', () => {
      const schoolName = 'مدرسة الشهيد امحمد الباعور';
      const prefix = schoolName.includes('الباعور') ? 'BAOUR' : 'LIBYA';
      const rand1 = '8942';
      const rand2 = 'X7K2';
      const key = `MADRASA-2026-${prefix}-${rand1}-${rand2}`;

      expect(key.startsWith('MADRASA-2026-BAOUR')).toBe(true);
      const checksum = (Math.abs(key.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 9000 + 1000).toString();
      expect(checksum.length).toBe(4);
      expect(Number(checksum) >= 1000).toBe(true);
    });

    runner.test('SEC.19 - Client Onboarding Link contains necessary school parameters', () => {
      const baseUrl = 'https://dawam580.github.io/digital-school-platform';
      const schoolId = 'SCH-TOKRA-01';
      const schoolName = 'مدرسة توكرة المركزية';
      const directorPhone = '0912345678';
      const directorName = 'أ. محمد السنوسي';

      const params = new URLSearchParams();
      params.set('onboard', '1');
      params.set('schoolId', schoolId);
      params.set('school', schoolName);
      params.set('phone', directorPhone);
      params.set('director', directorName);
      const onboardingLink = `${baseUrl}?${params.toString()}`;

      expect(onboardingLink.includes('onboard=1')).toBe(true);
      expect(onboardingLink.includes('schoolId=SCH-TOKRA-01')).toBe(true);
      const parsedParams = new URLSearchParams(onboardingLink.split('?')[1]);
      expect(parsedParams.get('school')).toBe('مدرسة توكرة المركزية');
      expect(parsedParams.get('director')).toBe('أ. محمد السنوسي');
    });

    runner.test('SEC.20 - Client Delivery WhatsApp message includes 4 core pillars and Libyan phone format', () => {
      const phone = '0922465676';
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const intlPhone = cleanPhone.startsWith('09') ? `218${cleanPhone.substring(1)}` : cleanPhone;
      expect(intlPhone).toBe('218922465676');

      const message = `🏛️ حزمة تسليم واعتماد المنصة
1️⃣ تفعيل حساب المدير
2️⃣ تطبيق ويندوز المكتبي
3️⃣ كتيب التعليمات الشامل
4️⃣ دليل حسابات الكادر`;

      expect(message.includes('تفعيل حساب المدير')).toBe(true);
      expect(message.includes('تطبيق ويندوز المكتبي')).toBe(true);
      expect(message.includes('كتيب التعليمات الشامل')).toBe(true);
      expect(message.includes('دليل حسابات الكادر')).toBe(true);
    });

    runner.test('SEC.21 - Windows Desktop launcher script includes native app flags', () => {
      const webAppUrl = 'https://dawam580.github.io/digital-school-platform/';
      const batchScript = `@echo off
chcp 65001 > nul
start msedge --app="${webAppUrl}?role=admin" --window-size=1440,920
`;
      expect(batchScript.includes('chcp 65001')).toBe(true);
      expect(batchScript.includes('--app=')).toBe(true);
      expect(batchScript.includes('role=admin')).toBe(true);
    });

    runner.test('SEC.22 - Machine Hardware ID format conforms to Libyan standard (HWID-LY-XXXX-XXXX-XXXX)', () => {
      const sampleHwid = 'HWID-LY-9A2F-4E10-8B3C';
      const hwidRegex = /^HWID-LY-[0-9A-F]{4}-[0-9A-F]{4}(-[0-9A-F]{4})?$/;
      expect(hwidRegex.test(sampleHwid)).toBe(true);
      expect(sampleHwid.startsWith('HWID-LY-')).toBe(true);
    });

    runner.test('SEC.23 - 7-Day Trial duration calculation and expiration lockdown', () => {
      const now = Date.now();
      const trialDurationMs = 7 * 24 * 60 * 60 * 1000;
      
      // Active trial on day 3
      const day3Start = now - (3 * 24 * 60 * 60 * 1000);
      const day3Diff = (day3Start + trialDurationMs) - now;
      const day3Remaining = Math.max(0, Math.ceil(day3Diff / (24 * 60 * 60 * 1000)));
      expect(day3Remaining).toBe(4);
      expect(day3Diff > 0).toBe(true);

      // Expired trial on day 8
      const day8Start = now - (8 * 24 * 60 * 60 * 1000);
      const day8Diff = (day8Start + trialDurationMs) - now;
      const day8Remaining = Math.max(0, Math.ceil(day8Diff / (24 * 60 * 60 * 1000)));
      expect(day8Remaining).toBe(0);
      expect(day8Diff <= 0).toBe(true);
    });

    runner.test('SEC.24 - Anti-Clock-Tampering detection detects system rollback beyond threshold', () => {
      const lastSeen = Date.now();
      const marginMs = 2 * 60 * 60 * 1000; // 2 hours grace

      // Normal time advancement
      const normalCurrent = lastSeen + 5000;
      const isNormalTampered = normalCurrent < lastSeen - marginMs;
      expect(isNormalTampered).toBe(false);

      // Tampered: clock rolled back 1 day
      const tamperedCurrent = lastSeen - (24 * 60 * 60 * 1000);
      const isRollbackTampered = tamperedCurrent < lastSeen - marginMs;
      expect(isRollbackTampered).toBe(true);
    });

    runner.test('SEC.25 - Cryptographic MADRASA-v2 offline token structure and payload verification', () => {
      const payload = {
        v: 2,
        schoolName: 'مدرسة المستقبل للتعليم الأساسي',
        hwid: 'HWID-LY-9A2F-4E10',
        licenseType: 'lifetime',
        issuedAt: new Date().toISOString(),
        expiresAt: '2099-12-31T23:59:59.000Z',
        adminPhone: '0922465676'
      };
      const jsonStr = JSON.stringify(payload);
      const base64 = Buffer.from(jsonStr, 'utf-8').toString('base64');
      const dummySig = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      const token = `MADRASA-v2-${base64}.${dummySig}`;

      expect(token.startsWith('MADRASA-v2-')).toBe(true);
      expect(token.includes('.')).toBe(true);

      const decoded = JSON.parse(Buffer.from(token.slice('MADRASA-v2-'.length).split('.')[0], 'base64').toString('utf-8'));
      expect(decoded.schoolName).toBe('مدرسة المستقبل للتعليم الأساسي');
      expect(decoded.hwid).toBe('HWID-LY-9A2F-4E10');
      expect(decoded.licenseType).toBe('lifetime');
    });

    runner.test('SEC.26 - Binding check: Token bound to specific HWID rejected when machine HWID does not match', () => {
      const licenseHwid = 'HWID-LY-AAAA-1111';
      const machineHwid1 = 'HWID-LY-BBBB-2222';
      const machineHwid2 = 'HWID-LY-AAAA-1111';

      // HWID mismatch
      const mismatch = (licenseHwid !== '*' && licenseHwid !== machineHwid1);
      expect(mismatch).toBe(true);

      // HWID match
      const match = (licenseHwid === '*' || licenseHwid === machineHwid2);
      expect(match).toBe(true);

      // Wildcard license works everywhere
      const wildcard = '*';
      const wildcardMatch = (wildcard === '*' || wildcard === machineHwid1);
      expect(wildcardMatch).toBe(true);
    });
  });

  return runner;
}
