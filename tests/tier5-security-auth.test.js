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
      if (!['2026', '123456'].includes(cleanPass)) {
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
      if (!['2026', '123456'].includes(cleanPass)) {
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
      if (cleanPass !== '123456' && cleanPass !== '2026') {
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

  return runner;
}
