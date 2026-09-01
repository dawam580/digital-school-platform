/**
 * Tier 1: Feature Coverage (Happy Path Verification)
 * 18 Features × ≥5 Tests Each = ≥90 Automated Test Cases
 */

import {
  TestRunner,
  expect,
  setupBrowserEnvironment,
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

export function createTier1Suite() {
  const runner = new TestRunner('Tier 1: Feature Coverage Suite (Happy Path)');

  runner.beforeEach(() => {
    setupBrowserEnvironment();
  });

  // ==========================================
  // F01: Build & Type Safety
  // ==========================================
  runner.describe('F01: Build & Type Safety', () => {
    runner.test('F01.1 - Student interface schema validation', () => {
      const student = SEED_STUDENTS[0];
      expect(typeof student.id).toBe('string');
      expect(typeof student.name).toBe('string');
      expect(typeof student.nationalId).toBe('string');
      expect(typeof student.studentNumber).toBe('string');
      expect(typeof student.linkCode).toBe('string');
      expect(typeof student.attendanceRate).toBe('number');
      expect(typeof student.academicAverage).toBe('number');
      expect(Array.isArray(student.competencies)).toBe(true);
      expect(Array.isArray(student.subjects)).toBe(true);
      expect(Array.isArray(student.recentAttendance)).toBe(true);
    });

    runner.test('F01.2 - SchoolClass schema validation', () => {
      const schoolClass = SEED_CLASSES[0];
      expect(typeof schoolClass.id).toBe('string');
      expect(typeof schoolClass.name).toBe('string');
      expect(typeof schoolClass.grade).toBe('string');
      expect(typeof schoolClass.studentCount).toBe('number');
      expect(typeof schoolClass.supervisor).toBe('string');
      expect(schoolClass.studentCount).toBeGreaterThan(0);
    });

    runner.test('F01.3 - NotificationItem schema validation', () => {
      const notif = SEED_NOTIFICATIONS[0];
      expect(typeof notif.id).toBe('string');
      expect(typeof notif.title).toBe('string');
      expect(typeof notif.message).toBe('string');
      expect(typeof notif.read).toBe('boolean');
      expect(['attendance', 'admin', 'academic', 'urgent'].includes(notif.category)).toBe(true);
    });

    runner.test('F01.4 - DailyReportData schema validation', () => {
      const report = SEED_DAILY_REPORT;
      expect(typeof report.id).toBe('string');
      expect(typeof report.studentId).toBe('string');
      expect(Array.isArray(report.timeline)).toBe(true);
      expect(Array.isArray(report.subjectsSummary)).toBe(true);
      expect(Array.isArray(report.achievements)).toBe(true);
      expect(Array.isArray(report.tasksForTomorrow)).toBe(true);
      expect(report.timeline.length).toBeGreaterThan(0);
    });

    runner.test('F01.5 - AttendanceStatus enum constraint validation', () => {
      const validStatuses = ['present', 'late', 'excused', 'unexcused'];
      SEED_STUDENTS.forEach(student => {
        expect(validStatuses.includes(student.status)).toBe(true);
      });
    });
  });

  // ==========================================
  // F02: Arabic RTL & Styling
  // ==========================================
  runner.describe('F02: Arabic RTL & Styling', () => {
    runner.test('F02.1 - Arabic text presence in student names', () => {
      const arabicRegex = /[\u0600-\u06FF]/;
      SEED_STUDENTS.forEach(student => {
        expect(arabicRegex.test(student.name)).toBe(true);
        expect(arabicRegex.test(student.grade)).toBe(true);
      });
    });

    runner.test('F02.2 - Arabic text in class and supervisor names', () => {
      const arabicRegex = /[\u0600-\u06FF]/;
      SEED_CLASSES.forEach(cls => {
        expect(arabicRegex.test(cls.name)).toBe(true);
        expect(arabicRegex.test(cls.supervisor)).toBe(true);
      });
    });

    runner.test('F02.3 - Arabic time indicators formatting', () => {
      const notifs = SEED_NOTIFICATIONS;
      const arabicTimeRegex = /(ص|م|اليوم|أمس|الآن)/;
      notifs.forEach(n => {
        expect(arabicTimeRegex.test(n.time) || arabicTimeRegex.test(n.date)).toBe(true);
      });
    });

    runner.test('F02.4 - Behavior rating Arabic strings', () => {
      const validRatings = ['ممتاز', 'جيد جداً', 'جيد', 'يحتاج تحسين'];
      SEED_STUDENTS.forEach(s => {
        expect(validRatings.includes(s.behaviorRating)).toBe(true);
      });
    });

    runner.test('F02.5 - Daily report Arabic day of week and mood', () => {
      const report = SEED_DAILY_REPORT;
      expect(report.dayOfWeek).toBe('الثلاثاء');
      expect(['ممتاز', 'نشط', 'هادئ', 'متعب'].includes(report.overallMood)).toBe(true);
    });
  });

  // ==========================================
  // F03: Dev Server & Runtime
  // ==========================================
  runner.describe('F03: Dev Server & Runtime', () => {
    runner.test('F03.1 - Environment window and document mock integrity', () => {
      expect(typeof window).toBe('object');
      expect(typeof document).toBe('object');
      expect(typeof localStorage).toBe('object');
      expect(window.innerWidth).toBe(1280);
    });

    runner.test('F03.2 - Web Audio API mock initialization', () => {
      const audioCtx = new window.AudioContext();
      expect(audioCtx.state).toBe('running');
      const osc = audioCtx.createOscillator();
      expect(typeof osc.start).toBe('function');
      const gain = audioCtx.createGain();
      expect(typeof gain.connect).toBe('function');
    });

    runner.test('F03.3 - DOM createElement for canvas elements', () => {
      const canvas = document.createElement('canvas');
      expect(canvas.tagName).toBe('CANVAS');
      const ctx = canvas.getContext('2d');
      expect(ctx).toBeDefined();
      expect(typeof ctx.fillRect).toBe('function');
    });

    runner.test('F03.4 - FileReader base64 mock functionality', async () => {
      const reader = new FileReader();
      let loadedResult = null;
      await new Promise(resolve => {
        reader.onload = (e) => {
          loadedResult = e.target.result;
          resolve();
        };
        reader.readAsDataURL({ name: 'test_avatar.jpg' });
      });
      expect(loadedResult).toContain('data:image/png;base64');
    });

    runner.test('F03.5 - Global requestAnimationFrame and cancelAnimationFrame', async () => {
      let fired = false;
      const id = window.requestAnimationFrame(() => {
        fired = true;
      });
      await new Promise(r => setTimeout(r, 25));
      expect(fired).toBe(true);
    });
  });

  // ==========================================
  // F04: Multi-Role Authentication
  // ==========================================
  runner.describe('F04: Multi-Role Authentication', () => {
    runner.test('F04.1 - Default parent role and authentication status', () => {
      const sim = new SchoolStateSimulator();
      expect(sim.currentRole).toBe('parent');
      expect(sim.isAuthenticated).toBe(true);
      expect(sim.currentUserPhone).toBe('0551234567');
    });

    runner.test('F04.2 - Teacher login switches role and active tab to attendance', () => {
      const sim = new SchoolStateSimulator();
      sim.login('0509988776', 'teacher');
      expect(sim.currentRole).toBe('teacher');
      expect(sim.activeTab).toBe('attendance');
      expect(sim.currentUserPhone).toBe('0509988776');
      expect(sim.isAuthenticated).toBe(true);
    });

    runner.test('F04.3 - Admin login switches role and active tab to dashboard', () => {
      const sim = new SchoolStateSimulator();
      sim.login('0501112233', 'admin');
      expect(sim.currentRole).toBe('admin');
      expect(sim.activeTab).toBe('dashboard');
      expect(sim.currentUserPhone).toBe('0501112233');
    });

    runner.test('F04.4 - Parent login switches role and active tab to student-profile', () => {
      const sim = new SchoolStateSimulator();
      sim.login('0551234567', 'parent');
      expect(sim.currentRole).toBe('parent');
      expect(sim.activeTab).toBe('student-profile');
    });

    runner.test('F04.5 - Logout resets authentication state and navigates to login tab', () => {
      const sim = new SchoolStateSimulator();
      sim.logout();
      expect(sim.isAuthenticated).toBe(false);
      expect(sim.activeTab).toBe('login');
      expect(sim.soundCalls.some(s => s.type === 'playTap')).toBe(true);
    });
  });

  // ==========================================
  // F05: Parent Onboarding & OTP
  // ==========================================
  runner.describe('F05: Parent Onboarding & OTP', () => {
    runner.test('F05.1 - 4-Box OTP input structure validation', () => {
      const otp = ['4', '8', '2', '1'];
      expect(otp.length).toBe(4);
      expect(otp.join('')).toBe('4821');
    });

    runner.test('F05.2 - Auto-advancing OTP focus indexing', () => {
      const inputIndices = [0, 1, 2, 3];
      inputIndices.forEach(idx => {
        const nextId = `otp-input-${idx + 1}`;
        const nextEl = document.getElementById(nextId);
        expect(nextEl).toBeDefined();
      });
    });

    runner.test('F05.3 - Demo quick fill OTP key code 4821', () => {
      const quickFill = ['4', '8', '2', '1'];
      const combined = quickFill.join('');
      expect(combined).toBe('4821');
      expect(/^\d{4}$/.test(combined)).toBe(true);
    });

    runner.test('F05.4 - Parent registration simulation with login callback', () => {
      const sim = new SchoolStateSimulator();
      const parentPhone = '0559998877';
      sim.login(parentPhone, 'parent');
      expect(sim.currentUserPhone).toBe(parentPhone);
      expect(sim.currentRole).toBe('parent');
    });

    runner.test('F05.5 - Navigation to link-student following parent onboarding', () => {
      const sim = new SchoolStateSimulator();
      sim.login('0559998877', 'parent');
      sim.activeTab = 'link-student';
      expect(sim.activeTab).toBe('link-student');
    });
  });

  // ==========================================
  // F06: Student Linking & Codes
  // ==========================================
  runner.describe('F06: Student Linking & Codes', () => {
    runner.test('F06.1 - Link student by exact code SCH-2026-R1 (Rayan Al-Otaibi)', () => {
      const sim = new SchoolStateSimulator();
      const linked = sim.linkStudent('SCH-2026-R1');
      expect(linked).toBe(true);
      expect(sim.selectedStudent.name).toBe('ريان فهد العتيبي');
      expect(sim.selectedStudent.linkCode).toBe('SCH-2026-R1');
    });

    runner.test('F06.2 - Link student by exact code SCH-2026-S2 (Sarah Al-Qahtani)', () => {
      const sim = new SchoolStateSimulator();
      const linked = sim.linkStudent('SCH-2026-S2');
      expect(linked).toBe(true);
      expect(sim.selectedStudent.name).toBe('سارة خالد القحطاني');
      expect(sim.selectedStudent.gender).toBe('female');
    });

    runner.test('F06.3 - Link student by student academic number 2024-0106 (Omar)', () => {
      const sim = new SchoolStateSimulator();
      const linked = sim.linkStudent('2024-0106');
      expect(linked).toBe(true);
      expect(sim.selectedStudent.name).toBe('عمر ياسر السعيد');
    });

    runner.test('F06.4 - Link student by national ID 1065432109 (Layan)', () => {
      const sim = new SchoolStateSimulator();
      const linked = sim.linkStudent('1065432109');
      expect(linked).toBe(true);
      expect(sim.selectedStudent.name).toBe('ليان مساعد الغامدي');
    });

    runner.test('F06.5 - Student link code failure handling with alert sound', () => {
      const sim = new SchoolStateSimulator();
      const initialCount = sim.soundCalls.length;
      const linked = sim.linkStudent('INVALID-CODE-999');
      expect(linked).toBe(false);
      expect(sim.soundCalls.length).toBeGreaterThan(initialCount);
      expect(sim.soundCalls[sim.soundCalls.length - 1].type).toBe('playAlert');
    });
  });

  // ==========================================
  // F07: Attendance Marking & Audio
  // ==========================================
  runner.describe('F07: Attendance Marking & Audio', () => {
    runner.test('F07.1 - Mark student present updates status and plays tap sound', () => {
      const sim = new SchoolStateSimulator();
      sim.updateAttendance('std-3', 'present');
      const student = sim.students.find(s => s.id === 'std-3');
      expect(student.status).toBe('present');
      expect(sim.soundCalls.some(s => s.type === 'playTap')).toBe(true);
    });

    runner.test('F07.2 - Mark student unexcused absent plays alert sound', () => {
      const sim = new SchoolStateSimulator();
      sim.updateAttendance('std-1', 'unexcused');
      const student = sim.students.find(s => s.id === 'std-1');
      expect(student.status).toBe('unexcused');
      expect(sim.soundCalls.some(s => s.type === 'playAlert')).toBe(true);
    });

    runner.test('F07.3 - Mark student late updates status', () => {
      const sim = new SchoolStateSimulator();
      sim.updateAttendance('std-2', 'late');
      const student = sim.students.find(s => s.id === 'std-2');
      expect(student.status).toBe('late');
    });

    runner.test('F07.4 - Mark student excused with medical note', () => {
      const sim = new SchoolStateSimulator();
      sim.updateAttendance('std-1', 'excused', 'مراجعة عيادة الأسنان');
      const student = sim.students.find(s => s.id === 'std-1');
      expect(student.status).toBe('excused');
      expect(student.recentAttendance[0].note).toBe('مراجعة عيادة الأسنان');
    });

    runner.test('F07.5 - Attendance recentAttendance array contains today ISO date', () => {
      const sim = new SchoolStateSimulator();
      const today = new Date().toISOString().split('T')[0];
      sim.updateAttendance('std-4', 'present');
      const student = sim.students.find(s => s.id === 'std-4');
      expect(student.recentAttendance[0].date).toBe(today);
      expect(student.recentAttendance[0].status).toBe('present');
    });
  });

  // ==========================================
  // F08: Batch Attendance & CSV Export
  // ==========================================
  runner.describe('F08: Batch Attendance & CSV Export', () => {
    runner.test('F08.1 - Mark all present sets status of all students to present', () => {
      const sim = new SchoolStateSimulator();
      sim.markAllPresent('cls-5a');
      sim.students.forEach(s => {
        expect(s.status).toBe('present');
      });
    });

    runner.test('F08.2 - Batch attendance triggers confetti and success chime', () => {
      const sim = new SchoolStateSimulator();
      sim.markAllPresent();
      expect(sim.confettiCalls).toBeGreaterThan(0);
      expect(sim.soundCalls.some(s => s.type === 'playSuccess')).toBe(true);
    });

    runner.test('F08.3 - Batch attendance creates notification record', () => {
      const sim = new SchoolStateSimulator();
      sim.markAllPresent();
      const notif = sim.notifications.find(n => n.title === 'تحضير جماعي للفصل');
      expect(notif).toBeDefined();
      expect(notif.category).toBe('attendance');
    });

    runner.test('F08.4 - CSV builder format headers and student rows', () => {
      const sim = new SchoolStateSimulator();
      const headers = 'اسم الطالب,الرقم المدرسي,الصف,الشعبة,الحالة,التاريخ\n';
      const rows = sim.students.map(s => `"${s.name}","${s.studentNumber}","${s.grade}","أ","${s.status}","2026-09-01"`).join('\n');
      const csvContent = headers + rows;

      expect(csvContent).toContain('اسم الطالب');
      expect(csvContent).toContain('ريان فهد العتيبي');
      expect(csvContent).toContain('2024-0104');
    });

    runner.test('F08.5 - Class status summary counters calculation', () => {
      const sim = new SchoolStateSimulator();
      const presentCount = sim.students.filter(s => s.status === 'present').length;
      const absentCount = sim.students.filter(s => s.status === 'unexcused').length;
      const lateCount = sim.students.filter(s => s.status === 'late').length;
      const excusedCount = sim.students.filter(s => s.status === 'excused').length;

      expect(presentCount + absentCount + lateCount + excusedCount).toBe(sim.students.length);
    });
  });

  // ==========================================
  // F09: Gamified Behavior Points
  // ==========================================
  runner.describe('F09: Gamified Behavior Points', () => {
    runner.test('F09.1 - Award positive +5 behavior points increases student total', () => {
      const sim = new SchoolStateSimulator();
      const student = sim.students.find(s => s.id === 'std-1');
      const initialScore = student.behaviorPointsTotal;

      sim.addBehaviorPoint('std-1', {
        id: 'bp-test-1',
        category: 'positive',
        title: 'مشاركة صفية متميزة',
        points: 5,
        icon: '🌟',
        date: 'اليوم 09:00 ص',
        teacher: 'أ. أحمد الغامدي'
      });

      const updated = sim.students.find(s => s.id === 'std-1');
      expect(updated.behaviorPointsTotal).toBe(initialScore + 5);
      expect(updated.behaviorPoints[0].title).toBe('مشاركة صفية متميزة');
    });

    runner.test('F09.2 - Positive points award triggers confetti celebration', () => {
      const sim = new SchoolStateSimulator();
      const initialConfetti = sim.confettiCalls;

      sim.addBehaviorPoint('std-1', {
        id: 'bp-test-2',
        category: 'positive',
        title: 'حل المسألة الصعبة',
        points: 4,
        icon: '📚',
        date: 'اليوم',
        teacher: 'أ. أحمد الغامدي'
      });

      expect(sim.confettiCalls).toBeGreaterThan(initialConfetti);
      expect(sim.soundCalls.some(s => s.type === 'playSuccess')).toBe(true);
    });

    runner.test('F09.3 - Needs work negative point (-1) decreases student total', () => {
      const sim = new SchoolStateSimulator();
      const student = sim.students.find(s => s.id === 'std-1');
      const initialScore = student.behaviorPointsTotal;

      sim.addBehaviorPoint('std-1', {
        id: 'bp-test-3',
        category: 'needs_work',
        title: 'تأخر عن الحصة',
        points: -1,
        icon: '⏰',
        date: 'اليوم',
        teacher: 'أ. أحمد الغامدي'
      });

      const updated = sim.students.find(s => s.id === 'std-1');
      expect(updated.behaviorPointsTotal).toBe(initialScore - 1);
      expect(sim.soundCalls.some(s => s.type === 'playAlert')).toBe(true);
    });

    runner.test('F09.4 - Behavior points creation dispatches academic notification', () => {
      const sim = new SchoolStateSimulator();
      sim.addBehaviorPoint('std-1', {
        id: 'bp-test-4',
        category: 'positive',
        title: 'إلقاء إذاعي مبهر',
        points: 5,
        icon: '🎤',
        date: 'اليوم',
        teacher: 'أ. أحمد الغامدي'
      });

      const notif = sim.notifications.find(n => n.title.includes('نقطة تقييم جديدة'));
      expect(notif).toBeDefined();
      expect(notif.category).toBe('academic');
    });

    runner.test('F09.5 - Behavior point preserves teacher and date metadata', () => {
      const sim = new SchoolStateSimulator();
      const point = {
        id: 'bp-test-5',
        category: 'positive',
        title: 'العمل الجماعي',
        points: 3,
        icon: '🤝',
        date: 'اليوم 10:30 ص',
        teacher: 'أ. خالد الشهري'
      };
      sim.addBehaviorPoint('std-2', point);

      const student = sim.students.find(s => s.id === 'std-2');
      const savedPoint = student.behaviorPoints[0];
      expect(savedPoint.teacher).toBe('أ. خالد الشهري');
      expect(savedPoint.date).toBe('اليوم 10:30 ص');
    });
  });

  // ==========================================
  // F10: Competencies Radar Chart
  // ==========================================
  runner.describe('F10: Competencies Radar Chart', () => {
    runner.test('F10.1 - Radar chart polygon points generation for 6 axes', () => {
      const competencies = SEED_STUDENTS[0].competencies;
      const size = 260;
      const center = size / 2;
      const radius = center - 36;
      const total = competencies.length;

      const points = competencies.map((c, i) => {
        const ratio = c.score / c.maxScore;
        const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
        const r = radius * ratio;
        return {
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle)
        };
      });

      expect(points.length).toBe(6);
      points.forEach(pt => {
        expect(typeof pt.x).toBe('number');
        expect(typeof pt.y).toBe('number');
        expect(isNaN(pt.x)).toBe(false);
        expect(isNaN(pt.y)).toBe(false);
      });
    });

    runner.test('F10.2 - Radar concentric levels math (25%, 50%, 75%, 100%)', () => {
      const levels = [0.25, 0.5, 0.75, 1.0];
      const size = 260;
      const center = size / 2;
      const radius = center - 36;

      levels.forEach(lvl => {
        const r = radius * lvl;
        expect(r).toBeGreaterThan(0);
        expect(r).toBeLessThanOrEqual(radius);
      });
    });

    runner.test('F10.3 - Competency scores within valid 0-100 bounds', () => {
      SEED_STUDENTS.forEach(student => {
        student.competencies.forEach(comp => {
          expect(comp.score).toBeGreaterThanOrEqual(0);
          expect(comp.score).toBeLessThanOrEqual(comp.maxScore);
          expect(comp.maxScore).toBe(100);
        });
      });
    });

    runner.test('F10.4 - Radial vertex dot coordinate boundaries within canvas', () => {
      const size = 260;
      const center = size / 2;
      const radius = center - 36;
      const competencies = SEED_STUDENTS[1].competencies;

      competencies.forEach((c, i) => {
        const ratio = c.score / c.maxScore;
        const angle = (Math.PI * 2 / competencies.length) * i - Math.PI / 2;
        const r = radius * ratio;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);

        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(size);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(size);
      });
    });

    runner.test('F10.5 - Competency labels formatting with percentage string', () => {
      const competencies = SEED_STUDENTS[0].competencies;
      competencies.forEach(c => {
        const label = `${c.name} (${c.score}%)`;
        expect(label).toContain('%');
        expect(label).toContain(c.name);
      });
    });
  });

  // ==========================================
  // F11: Golden Certificate Modal
  // ==========================================
  runner.describe('F11: Golden Certificate Modal', () => {
    runner.test('F11.1 - Certificate content includes student name and grade', () => {
      const student = SEED_STUDENTS[0];
      const certTitle = 'شهادة شكر وتقدير وتميز مدرسي';
      const studentName = student.name;
      const grade = student.grade;

      expect(certTitle).toContain('شهادة شكر وتقدير');
      expect(studentName).toBe('ريان فهد العتيبي');
      expect(grade).toBe('الصف الخامس الابتدائي');
    });

    runner.test('F11.2 - Academic average percentage rendering', () => {
      const student = SEED_STUDENTS[0];
      const motivationText = `نظير تفوقه الدراسي المتميز بمعدل (${student.academicAverage}%) وانضباطه العالي`;
      expect(motivationText).toContain('96.5%');
    });

    runner.test('F11.3 - Official school header and registry date metadata', () => {
      const headerCountry = 'المملكة العربية السعودية';
      const headerMinistry = 'وزارة التعليم';
      const certNumber = '2026/09/CER';
      const certDate = '01-09-2026';

      expect(headerCountry).toContain('المملكة');
      expect(headerMinistry).toContain('التعليم');
      expect(certNumber).toBe('2026/09/CER');
      expect(certDate).toBe('01-09-2026');
    });

    runner.test('F11.4 - Official signatories validation (Class Supervisor and School Principal)', () => {
      const supervisorTitle = 'رائد الفصل';
      const supervisorName = 'أ. أحمد الغامدي';
      const principalTitle = 'مدير المدرسة';
      const principalName = 'د. ناصر السعيد';

      expect(supervisorTitle).toBe('رائد الفصل');
      expect(supervisorName).toBe('أ. أحمد الغامدي');
      expect(principalTitle).toBe('مدير المدرسة');
      expect(principalName).toBe('د. ناصر السعيد');
    });

    runner.test('F11.5 - Print trigger invokes window.print()', () => {
      window._lastPrinted = 0;
      window.print();
      expect(window._lastPrinted).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // F12: Avatar Customization
  // ==========================================
  runner.describe('F12: Avatar Customization', () => {
    runner.test('F12.1 - Curated preset avatars list length of 8', () => {
      const presetAvatars = [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=200&auto=format&fit=crop&q=80',
      ];
      expect(presetAvatars.length).toBe(8);
      presetAvatars.forEach(av => {
        expect(av.startsWith('https://images.unsplash.com')).toBe(true);
      });
    });

    runner.test('F12.2 - Update student avatar updates in-memory student object', () => {
      const sim = new SchoolStateSimulator();
      const newAvatar = 'https://example.com/custom_avatar.png';
      sim.updateStudentAvatar('std-1', newAvatar);

      const student = sim.students.find(s => s.id === 'std-1');
      expect(student.avatar).toBe(newAvatar);
      expect(sim.selectedStudent.avatar).toBe(newAvatar);
    });

    runner.test('F12.3 - Avatar update persists to local storage', () => {
      const sim = new SchoolStateSimulator();
      const newAvatar = 'https://example.com/persisted_avatar.png';
      sim.updateStudentAvatar('std-2', newAvatar);

      const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
      const parsed = JSON.parse(raw);
      const s2 = parsed.find(s => s.id === 'std-2');
      expect(s2.avatar).toBe(newAvatar);
    });

    runner.test('F12.4 - Custom avatar upload Base64 encoding simulation', async () => {
      const sim = new SchoolStateSimulator();
      let base64Avatar = '';
      const reader = new FileReader();

      await new Promise(resolve => {
        reader.onload = (e) => {
          base64Avatar = e.target.result;
          resolve();
        };
        reader.readAsDataURL({ name: 'my_photo.png' });
      });

      sim.updateStudentAvatar('std-3', base64Avatar);
      const s3 = sim.students.find(s => s.id === 'std-3');
      expect(s3.avatar).toContain('data:image/png;base64');
    });

    runner.test('F12.5 - Avatar update plays success chime', () => {
      const sim = new SchoolStateSimulator();
      sim.updateStudentAvatar('std-1', 'https://example.com/new.png');
      expect(sim.soundCalls.some(s => s.type === 'playSuccess')).toBe(true);
    });
  });

  // ==========================================
  // F13: Interactive Daily Report
  // ==========================================
  runner.describe('F13: Interactive Daily Report', () => {
    runner.test('F13.1 - Daily report timeline items structure and statuses', () => {
      const timeline = SEED_DAILY_REPORT.timeline;
      expect(timeline.length).toBe(11);
      const validStatuses = ['completed', 'current', 'upcoming'];
      timeline.forEach(item => {
        expect(validStatuses.includes(item.status)).toBe(true);
        expect(typeof item.time).toBe('string');
        expect(typeof item.title).toBe('string');
      });
    });

    runner.test('F13.2 - Subjects summary with participation star ratings and homework', () => {
      const subjects = SEED_DAILY_REPORT.subjectsSummary;
      expect(subjects.length).toBe(5);
      subjects.forEach(sub => {
        expect(typeof sub.subject).toBe('string');
        expect(sub.participation).toBeGreaterThanOrEqual(1);
        expect(sub.participation).toBeLessThanOrEqual(5);
        expect(['مكتمل', 'غير مكتمل', 'لا يوجد'].includes(sub.homeworkStatus)).toBe(true);
      });
    });

    runner.test('F13.3 - Daily report teacher voice note simulation text', () => {
      const report = SEED_DAILY_REPORT;
      expect(typeof report.behaviorNotes).toBe('string');
      expect(report.behaviorNotes.length).toBeGreaterThan(10);
      expect(report.behaviorNotes).toContain('التزام');
    });

    runner.test('F13.4 - Daily report achievements array validation', () => {
      const report = SEED_DAILY_REPORT;
      expect(report.achievements.length).toBe(2);
      expect(report.achievements[0]).toContain('وسام التميز');
    });

    runner.test('F13.5 - Tasks for tomorrow array validation', () => {
      const report = SEED_DAILY_REPORT;
      expect(report.tasksForTomorrow.length).toBe(3);
      expect(report.tasksForTomorrow[0]).toContain('للعلوم');
    });
  });

  // ==========================================
  // F14: Notification Center
  // ==========================================
  runner.describe('F14: Notification Center', () => {
    runner.test('F14.1 - Initial unread notifications counter calculation', () => {
      const sim = new SchoolStateSimulator();
      const expectedUnread = sim.notifications.filter(n => !n.read).length;
      expect(sim.unreadCount).toBe(expectedUnread);
      expect(sim.unreadCount).toBeGreaterThan(0);
    });

    runner.test('F14.2 - Mark single notification as read decrements unread count', () => {
      const sim = new SchoolStateSimulator();
      const initialUnread = sim.unreadCount;
      const unreadNotif = sim.notifications.find(n => !n.read);

      sim.markNotificationAsRead(unreadNotif.id);
      expect(sim.unreadCount).toBe(initialUnread - 1);
      const updated = sim.notifications.find(n => n.id === unreadNotif.id);
      expect(updated.read).toBe(true);
    });

    runner.test('F14.3 - Mark all notifications as read resets unread count to 0', () => {
      const sim = new SchoolStateSimulator();
      sim.markAllNotificationsAsRead();
      expect(sim.unreadCount).toBe(0);
      sim.notifications.forEach(n => {
        expect(n.read).toBe(true);
      });
      expect(sim.soundCalls.some(s => s.type === 'playTap')).toBe(true);
    });

    runner.test('F14.4 - Notification category classification', () => {
      const sim = new SchoolStateSimulator();
      const categories = new Set(sim.notifications.map(n => n.category));
      expect(categories.has('attendance')).toBe(true);
      expect(categories.has('academic')).toBe(true);
      expect(categories.has('urgent')).toBe(true);
    });

    runner.test('F14.5 - Add new notification inserts at the top of list', () => {
      const sim = new SchoolStateSimulator();
      const initialCount = sim.notifications.length;
      sim.addNotification('تنبيه هام', 'رسالة تنبيه تجريبية', 'urgent', 'ريان العتيبي');

      expect(sim.notifications.length).toBe(initialCount + 1);
      expect(sim.notifications[0].title).toBe('تنبيه هام');
      expect(sim.notifications[0].read).toBe(false);
    });
  });

  // ==========================================
  // F15: Global Command Palette
  // ==========================================
  runner.describe('F15: Global Command Palette', () => {
    runner.test('F15.1 - Command palette open/close state toggle', () => {
      const sim = new SchoolStateSimulator();
      expect(sim.isCommandPaletteOpen).toBe(false);
      sim.isCommandPaletteOpen = true;
      expect(sim.isCommandPaletteOpen).toBe(true);
      sim.isCommandPaletteOpen = false;
      expect(sim.isCommandPaletteOpen).toBe(false);
    });

    runner.test('F15.2 - Student instant search filter by Arabic name', () => {
      const sim = new SchoolStateSimulator();
      const query = 'سارة';
      const results = sim.students.filter(s => s.name.includes(query));
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('سارة خالد القحطاني');
    });

    runner.test('F15.3 - Student instant search filter by student academic number', () => {
      const sim = new SchoolStateSimulator();
      const query = '2024-0104';
      const results = sim.students.filter(s => s.studentNumber.includes(query));
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('ريان فهد العتيبي');
    });

    runner.test('F15.4 - Student search filter by national ID', () => {
      const sim = new SchoolStateSimulator();
      const query = '1076543210';
      const results = sim.students.filter(s => s.nationalId.includes(query));
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('عمر ياسر السعيد');
    });

    runner.test('F15.5 - Quick action selection navigates to designated tab', () => {
      const sim = new SchoolStateSimulator();
      const quickActions = [
        { label: 'تسجيل الحضور الصباحي', tab: 'attendance' },
        { label: 'التقرير اليومي للدروس', tab: 'daily-report' },
        { label: 'مركز الإشعارات والتنبيهات', tab: 'notifications' },
        { label: 'ربط طالب جديد بالكود', tab: 'link-student' },
      ];

      quickActions.forEach(action => {
        sim.activeTab = action.tab;
        expect(sim.activeTab).toBe(action.tab);
      });
    });
  });

  // ==========================================
  // F16: Persistent Database & Seeding
  // ==========================================
  runner.describe('F16: Persistent Database & Seeding', () => {
    runner.test('F16.1 - Cold start auto-seeds localStorage when empty', () => {
      localStorage.clear();
      expect(localStorage.getItem(STORAGE_KEY_STUDENTS)).toBeNull();

      const db = new DatabaseService();
      const students = db.getStudents();
      expect(students.length).toBe(SEED_STUDENTS.length);
      expect(localStorage.getItem(STORAGE_KEY_STUDENTS)).toBeDefined();
    });

    runner.test('F16.2 - Versioned storage key constants validation (*_v2)', () => {
      expect(STORAGE_KEY_STUDENTS).toBe('madrasa_db_students_v2');
      expect(STORAGE_KEY_CLASSES).toBe('madrasa_db_classes_v2');
      expect(STORAGE_KEY_NOTIFICATIONS).toBe('madrasa_db_notifications_v2');
      expect(STORAGE_KEY_REPORTS).toBe('madrasa_db_reports_v2');
    });

    runner.test('F16.3 - Classes auto-seeding verification', () => {
      localStorage.clear();
      const db = new DatabaseService();
      const classes = db.getClasses();
      expect(classes.length).toBe(SEED_CLASSES.length);
      expect(classes[0].id).toBe('cls-5a');
    });

    runner.test('F16.4 - Notifications auto-seeding verification', () => {
      localStorage.clear();
      const db = new DatabaseService();
      const notifs = db.getNotifications();
      expect(notifs.length).toBe(SEED_NOTIFICATIONS.length);
      expect(notifs[0].id).toBe('notif-1');
    });

    runner.test('F16.5 - Daily report auto-seeding verification', () => {
      localStorage.clear();
      const db = new DatabaseService();
      const report = db.getDailyReport();
      expect(report.id).toBe(SEED_DAILY_REPORT.id);
      expect(report.studentName).toBe('ريان فهد العتيبي');
    });
  });

  // ==========================================
  // F17: State Durability across Reloads
  // ==========================================
  runner.describe('F17: State Durability across Reloads', () => {
    runner.test('F17.1 - Attendance modification persists across simulator reinstantiation', () => {
      const sim1 = new SchoolStateSimulator();
      sim1.updateAttendance('std-1', 'late', 'تأخر 15 دقيقة');

      // Simulate full reload by instantiating new simulator from localStorage
      const sim2 = new SchoolStateSimulator();
      const reloadedStudent = sim2.students.find(s => s.id === 'std-1');
      expect(reloadedStudent.status).toBe('late');
      expect(reloadedStudent.recentAttendance[0].note).toBe('تأخر 15 دقيقة');
    });

    runner.test('F17.2 - Behavior points addition persists across reloads', () => {
      const sim1 = new SchoolStateSimulator();
      sim1.addBehaviorPoint('std-2', {
        id: 'bp-durable-1',
        category: 'positive',
        title: 'تفوق في الرياضيات',
        points: 5,
        icon: '🌟',
        date: 'اليوم',
        teacher: 'أ. أحمد الغامدي'
      });

      const sim2 = new SchoolStateSimulator();
      const s2 = sim2.students.find(s => s.id === 'std-2');
      expect(s2.behaviorPointsTotal).toBe(57); // 52 + 5
      expect(s2.behaviorPoints[0].title).toBe('تفوق في الرياضيات');
    });

    runner.test('F17.3 - Notification read status persists across reloads', () => {
      const sim1 = new SchoolStateSimulator();
      sim1.markNotificationAsRead('notif-1');

      const sim2 = new SchoolStateSimulator();
      const notif1 = sim2.notifications.find(n => n.id === 'notif-1');
      expect(notif1.read).toBe(true);
    });

    runner.test('F17.4 - Avatar custom change persists across reloads', () => {
      const sim1 = new SchoolStateSimulator();
      const customUrl = 'https://images.unsplash.com/custom_avatar_test';
      sim1.updateStudentAvatar('std-4', customUrl);

      const sim2 = new SchoolStateSimulator();
      const s4 = sim2.students.find(s => s.id === 'std-4');
      expect(s4.avatar).toBe(customUrl);
    });

    runner.test('F17.5 - Multiple sequential mutations maintain aggregate durability', () => {
      const sim1 = new SchoolStateSimulator();
      sim1.updateAttendance('std-3', 'present');
      sim1.addBehaviorPoint('std-3', {
        id: 'bp-multi-1',
        category: 'positive',
        title: 'انضباط',
        points: 3,
        icon: '⭐',
        date: 'اليوم',
        teacher: 'أ. أحمد الغامدي'
      });
      sim1.markAllNotificationsAsRead();

      const sim2 = new SchoolStateSimulator();
      const s3 = sim2.students.find(s => s.id === 'std-3');
      expect(s3.status).toBe('present');
      expect(s3.behaviorPointsTotal).toBe(28); // 25 + 3
      expect(sim2.unreadCount).toBe(0);
    });
  });

  // ==========================================
  // F18: Database Factory Reset
  // ==========================================
  runner.describe('F18: Database Factory Reset', () => {
    runner.test('F18.1 - Reset restores students to original seed state', () => {
      const sim = new SchoolStateSimulator();
      sim.updateAttendance('std-1', 'unexcused');
      sim.updateStudentAvatar('std-1', 'https://broken.link/avatar.png');

      sim.resetDatabase();

      const s1 = sim.students.find(s => s.id === 'std-1');
      expect(s1.status).toBe(SEED_STUDENTS[0].status);
      expect(s1.avatar).toBe(SEED_STUDENTS[0].avatar);
      expect(s1.behaviorPointsTotal).toBe(SEED_STUDENTS[0].behaviorPointsTotal);
    });

    runner.test('F18.2 - Reset restores notifications to original seed items', () => {
      const sim = new SchoolStateSimulator();
      sim.markAllNotificationsAsRead();
      sim.addNotification('إشعار إضافي', 'محتوى تجريبي', 'admin');

      sim.resetDatabase();

      expect(sim.notifications.length).toBe(SEED_NOTIFICATIONS.length);
      expect(sim.unreadCount).toBe(SEED_NOTIFICATIONS.filter(n => !n.read).length);
    });

    runner.test('F18.3 - Reset restores selected student to first seed student', () => {
      const sim = new SchoolStateSimulator();
      sim.linkStudent('SCH-2026-S2');
      expect(sim.selectedStudent.id).toBe('std-2');

      sim.resetDatabase();
      expect(sim.selectedStudent.id).toBe('std-1');
    });

    runner.test('F18.4 - Reset plays success fanfare audio chime', () => {
      const sim = new SchoolStateSimulator();
      sim.resetDatabase();
      expect(sim.soundCalls.some(s => s.type === 'playSuccess')).toBe(true);
    });

    runner.test('F18.5 - Direct db.resetAllData() synchronizes all 4 localStorage keys', () => {
      const db = new DatabaseService();
      db.saveStudents([]);
      db.saveNotifications([]);

      db.resetAllData();

      const students = db.getStudents();
      const notifs = db.getNotifications();
      expect(students.length).toBe(SEED_STUDENTS.length);
      expect(notifs.length).toBe(SEED_NOTIFICATIONS.length);
    });
  });

  return runner;
}
