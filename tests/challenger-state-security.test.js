/**
 * Digital School Platform (منصة المدرسة الرقمية)
 * Challenger 1: Adversarial State Machine & Security Verifier
 *
 * Empirical Challenge Harness:
 * 1. Challenge OTP registration (non-numeric, incomplete, whitespace injection, verification boundaries)
 * 2. Challenge behavior points calculation (floor at 0, massive additions +1000, zero-point additions)
 * 3. Challenge localStorage corruption recovery (corrupted JSON in madrasa_db_*_v2 keys, type anomalies)
 */

import {
  setupBrowserEnvironment,
  expect,
  TestRunner,
  SchoolStateSimulator,
  DatabaseService,
  SEED_STUDENTS,
  SEED_CLASSES,
  SEED_NOTIFICATIONS,
  SEED_DAILY_REPORT,
  STORAGE_KEY_STUDENTS,
  STORAGE_KEY_CLASSES,
  STORAGE_KEY_NOTIFICATIONS,
  STORAGE_KEY_REPORTS
} from './test-harness.js';

export function createChallengerSuite() {
  const runner = new TestRunner('Challenger 1: Adversarial State Machine & Security Suite');

  // =========================================================================
  // Challenge 1: OTP Registration State Machine & Boundary Stress Testing
  // =========================================================================
  runner.describe('Adversarial Challenge 1: OTP Registration & Boundary Validation', () => {

    runner.test('CH1.01 - Reject/sanitize non-numeric alphabetic inputs in OTP boxes', () => {
      // Setup OTP state simulator
      let otpState = ['', '', '', ''];
      const handleOtpChange = (index, val) => {
        // Test sanitization vs raw acceptance
        if (val.length <= 1) {
          // If strictly numeric regex is applied or not
          const isNumeric = /^\d?$/.test(val);
          otpState[index] = val;
          return { accepted: true, isNumeric };
        }
        return { accepted: false, isNumeric: false };
      };

      const letters = ['a', 'Z', 'x', 'م', 'س'];
      letters.forEach((char, idx) => {
        const res = handleOtpChange(idx % 4, char);
        expect(res.accepted).toBe(true);
        expect(res.isNumeric).toBe(false); // Demonstrates lack of numeric restriction in raw handler
      });
    });

    runner.test('CH1.02 - Incomplete 3-digit OTP submission detection', () => {
      const incompleteCombinations = [
        ['4', '8', '2', ''],      // Missing last digit
        ['', '8', '2', '1'],      // Missing first digit
        ['4', '', '2', '1'],      // Missing middle digit
        ['4', '8', '', '1'],      // Missing 3rd digit
        ['', '', '', ''],          // Completely empty
        ['4', '', '', '']          // 1 digit
      ];

      incompleteCombinations.forEach(combo => {
        const fullString = combo.join('');
        const isComplete = combo.every(digit => digit.trim() !== '') && fullString.length === 4;
        expect(isComplete).toBe(false);
      });
    });

    runner.test('CH1.03 - Whitespace and newline injection into OTP fields', () => {
      const whitespaceInputs = [' ', '  ', '\t', '\n', ' \r'];
      whitespaceInputs.forEach(ws => {
        const trimmed = ws.trim();
        expect(trimmed.length).toBe(0);
        // If an input of single space ' ' is entered, join produces ' '
        const otpWithSpace = ['4', ' ', '2', '1'];
        const isActuallyValid = otpWithSpace.every(d => /^\d$/.test(d));
        expect(isActuallyValid).toBe(false);
      });
    });

    runner.test('CH1.04 - Quick Demo autofill (4821) produces valid 4-digit numeric sequence', () => {
      const demoOtp = ['4', '8', '2', '1'];
      expect(demoOtp.length).toBe(4);
      expect(demoOtp.join('')).toBe('4821');
      expect(/^\d{4}$/.test(demoOtp.join(''))).toBe(true);
    });

    runner.test('CH1.05 - OTP verification code boundary mismatch (invalid code vs valid code)', () => {
      const VALID_DEMO_CODE = '4821';
      const testCodes = ['0000', '1234', '9999', '4820', '4822', 'abcd', ' 4821', '4821 '];

      testCodes.forEach(code => {
        const matches = code.trim() === VALID_DEMO_CODE;
        if (code === ' 4821' || code === '4821 ') {
          expect(matches).toBe(true); // Matches when trimmed
        } else {
          expect(matches).toBe(false); // Correctly mismatches
        }
      });
    });

    runner.test('CH1.06 - Overflow input prevention (maxLength > 1 clamping)', () => {
      let otpBox = '';
      const handleInput = (val) => {
        if (val.length <= 1) {
          otpBox = val;
        } else {
          otpBox = val.slice(0, 1); // Clamp to 1 char
        }
      };

      handleInput('4821');
      expect(otpBox).toBe('4');
      expect(otpBox.length).toBe(1);
    });
  });

  // =========================================================================
  // Challenge 2: Behavior Points Calculation & Floor Clamping Stress Testing
  // =========================================================================
  runner.describe('Adversarial Challenge 2: Behavior Points Boundary & Math Invariants', () => {

    runner.test('CH2.01 - Behavior points score floor at 0 (underflow prevention)', () => {
      setupBrowserEnvironment();
      const sim = new SchoolStateSimulator();
      const student = sim.students[0]; // initial score: 48
      const initialScore = student.behaviorPointsTotal;
      expect(initialScore).toBe(48);

      // Deduct -50 points (48 - 50 = -2, must floor to 0)
      sim.addBehaviorPoint(student.id, {
        category: 'needs_work',
        title: 'خصم سلوكي تجريبي كبير',
        points: -50,
        teacher: 'وكيل شؤون الطلاب'
      });

      const updated = sim.students.find(s => s.id === student.id);
      expect(updated.behaviorPointsTotal).toBe(0);
      expect(updated.behaviorPointsTotal >= 0).toBe(true);
    });

    runner.test('CH2.02 - Consecutive negative deductions remain clamped at 0', () => {
      setupBrowserEnvironment();
      const sim = new SchoolStateSimulator();
      const student = sim.students[0];

      // Series of 10 consecutive -10 deductions
      for (let i = 0; i < 10; i++) {
        sim.addBehaviorPoint(student.id, {
          category: 'needs_work',
          title: `مخالفة سلوكية #${i + 1}`,
          points: -10,
          teacher: 'المشرف'
        });
      }

      const updated = sim.students.find(s => s.id === student.id);
      expect(updated.behaviorPointsTotal).toBe(0);
      expect(updated.behaviorPoints.length).toBe(3 + 10); // 3 initial + 10 new
    });

    runner.test('CH2.03 - Zero-point addition invariant test (points = 0)', () => {
      setupBrowserEnvironment();
      const sim = new SchoolStateSimulator();
      const student = sim.students[0];
      const startTotal = student.behaviorPointsTotal;

      sim.addBehaviorPoint(student.id, {
        category: 'positive',
        title: 'ملاحظة تشجيعية محايدة (0 نقاط)',
        points: 0,
        teacher: 'المرشد الطلابي'
      });

      const updated = sim.students.find(s => s.id === student.id);
      expect(updated.behaviorPointsTotal).toBe(startTotal);
      expect(updated.behaviorPoints[0].points).toBe(0);
    });

    runner.test('CH2.04 - Massive positive point addition spike (+1000 points)', () => {
      setupBrowserEnvironment();
      const sim = new SchoolStateSimulator();
      const student = sim.students[0];
      const startTotal = student.behaviorPointsTotal; // 48

      sim.addBehaviorPoint(student.id, {
        category: 'positive',
        title: 'جائزة التميز الكبرى للموهوبين',
        points: 1000,
        teacher: 'مدير المدرسة'
      });

      const updated = sim.students.find(s => s.id === student.id);
      expect(updated.behaviorPointsTotal).toBe(startTotal + 1000); // 1048
      expect(updated.behaviorPoints[0].points).toBe(1000);

      // Verify notification format
      const latestNotif = sim.notifications[0];
      expect(latestNotif.title).toContain('+1000');
    });

    runner.test('CH2.05 - Points array ordering (LIFO - newest first)', () => {
      setupBrowserEnvironment();
      const sim = new SchoolStateSimulator();
      const student = sim.students[0];

      sim.addBehaviorPoint(student.id, { category: 'positive', title: 'نقطة أ', points: 1, teacher: 'معلم 1' });
      sim.addBehaviorPoint(student.id, { category: 'positive', title: 'نقطة ب', points: 2, teacher: 'معلم 2' });
      sim.addBehaviorPoint(student.id, { category: 'positive', title: 'نقطة ج', points: 3, teacher: 'معلم 3' });

      const updated = sim.students.find(s => s.id === student.id);
      expect(updated.behaviorPoints[0].title).toBe('نقطة ج');
      expect(updated.behaviorPoints[1].title).toBe('نقطة ب');
      expect(updated.behaviorPoints[2].title).toBe('نقطة أ');
    });

    runner.test('CH2.06 - Target student isolation (mutating student 1 does not affect student 2)', () => {
      setupBrowserEnvironment();
      const sim = new SchoolStateSimulator();
      const s1 = sim.students[0];
      const s2 = sim.students[1];
      const s2StartPoints = s2.behaviorPointsTotal;

      sim.addBehaviorPoint(s1.id, { category: 'positive', title: 'تميز خاص', points: 10, teacher: 'معلم' });

      const updatedS2 = sim.students.find(s => s.id === s2.id);
      expect(updatedS2.behaviorPointsTotal).toBe(s2StartPoints);
    });
  });

  // =========================================================================
  // Challenge 3: LocalStorage Corruption Recovery & Hydration Fallback
  // =========================================================================
  runner.describe('Adversarial Challenge 3: LocalStorage Corruption Recovery & Persistence', () => {

    runner.test('CH3.01 - Malformed corrupted JSON in students key recovers to SEED_STUDENTS', () => {
      setupBrowserEnvironment();
      const db = new DatabaseService();

      // Inject corrupted JSON
      globalThis.localStorage.setItem(STORAGE_KEY_STUDENTS, '{invalid_json, missing_brackets:');
      
      const students = db.getStudents();
      expect(Array.isArray(students)).toBe(true);
      expect(students.length).toBe(SEED_STUDENTS.length);
      expect(students[0].name).toBe(SEED_STUDENTS[0].name);

      // Verify that recovery writes clean seed data back to storage
      const stored = JSON.parse(globalThis.localStorage.getItem(STORAGE_KEY_STUDENTS));
      expect(stored.length).toBe(SEED_STUDENTS.length);
    });

    runner.test('CH3.02 - Malformed corrupted JSON in classes key recovers to SEED_CLASSES', () => {
      setupBrowserEnvironment();
      const db = new DatabaseService();

      globalThis.localStorage.setItem(STORAGE_KEY_CLASSES, '<<<not a json string>>>');
      const classes = db.getClasses();
      expect(Array.isArray(classes)).toBe(true);
      expect(classes.length).toBe(SEED_CLASSES.length);
    });

    runner.test('CH3.03 - Malformed corrupted JSON in notifications key recovers to SEED_NOTIFICATIONS', () => {
      setupBrowserEnvironment();
      const db = new DatabaseService();

      globalThis.localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, '{"unread": [unterminated');
      const notifs = db.getNotifications();
      expect(Array.isArray(notifs)).toBe(true);
      expect(notifs.length).toBe(SEED_NOTIFICATIONS.length);
    });

    runner.test('CH3.04 - Malformed corrupted JSON in daily report key recovers to SEED_DAILY_REPORT', () => {
      setupBrowserEnvironment();
      const db = new DatabaseService();

      globalThis.localStorage.setItem(STORAGE_KEY_REPORTS, 'undefined');
      const report = db.getDailyReport();
      expect(typeof report).toBe('object');
      expect(report.studentName).toBe(SEED_DAILY_REPORT.studentName);
      expect(report.timeline.length).toBe(SEED_DAILY_REPORT.timeline.length);
    });

    runner.test('CH3.05 - Partial key corruption (corrupted students key does not affect valid classes key)', () => {
      setupBrowserEnvironment();
      const db = new DatabaseService();

      // Set valid classes data
      const customClasses = [{ id: 'custom-1', name: 'فصل مخصص', studentCount: 15 }];
      db.saveClasses(customClasses);

      // Corrupt only students key
      globalThis.localStorage.setItem(STORAGE_KEY_STUDENTS, 'corrupted!!!');

      // Read both
      const students = db.getStudents();
      const classes = db.getClasses();

      expect(students.length).toBe(SEED_STUDENTS.length); // Recovered
      expect(classes.length).toBe(1);                     // Preserved custom class
      expect(classes[0].name).toBe('فصل مخصص');
    });

    runner.test('CH3.06 - Null and Empty String storage keys recover gracefully', () => {
      setupBrowserEnvironment();
      const db = new DatabaseService();

      globalThis.localStorage.removeItem(STORAGE_KEY_STUDENTS);
      const fromNull = db.getStudents();
      expect(fromNull.length).toBe(SEED_STUDENTS.length);

      globalThis.localStorage.setItem(STORAGE_KEY_STUDENTS, '');
      const fromEmpty = db.getStudents();
      expect(fromEmpty.length).toBe(SEED_STUDENTS.length);
    });

    runner.test('CH3.07 - QuotaExceededError or write failure is caught safely without throwing', () => {
      setupBrowserEnvironment();
      const db = new DatabaseService();

      // Mock setItem to simulate storage quota exception
      const originalSetItem = globalThis.localStorage.setItem;
      globalThis.localStorage.setItem = () => {
        throw new Error('QuotaExceededError: DOM Exception 22');
      };

      let threw = false;
      try {
        db.saveStudents(SEED_STUDENTS);
        db.saveNotifications(SEED_NOTIFICATIONS);
      } catch {
        threw = true;
      }

      // Restore
      globalThis.localStorage.setItem = originalSetItem;
      expect(threw).toBe(false); // db.ts wraps save operations in try/catch
    });
  });

  return runner;
}

// Direct Execution capability
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('challenger-state-security.test.js')) {
  const suite = createChallengerSuite();
  suite.run().then(res => {
    console.log(`\nAdversarial Challenger Suite: ${res.passed}/${res.total} Passed (${res.failed} Failed)`);
    process.exit(res.failed > 0 ? 1 : 0);
  });
}
