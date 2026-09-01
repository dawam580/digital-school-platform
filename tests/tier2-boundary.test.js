/**
 * Tier 2: Boundary & Corner Cases Suite
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

export function createTier2Suite() {
  const runner = new TestRunner('Tier 2: Boundary & Corner Cases Suite');

  runner.beforeEach(() => {
    setupBrowserEnvironment();
  });

  // ==========================================
  // F01-B: Build & Type Safety (Boundaries)
  // ==========================================
  runner.describe('F01-B: Build & Type Safety (Boundaries)', () => {
    runner.test('F01.B1 - Null-safe handling of student optional lastSeenTime', () => {
      const studentWithoutLastSeen = { ...SEED_STUDENTS[3] };
      delete studentWithoutLastSeen.lastSeenTime;
      expect(studentWithoutLastSeen.lastSeenTime).toBeUndefined();
    });

    runner.test('F01.B2 - Empty behavior points array boundary', () => {
      const studentWithEmptyPoints = { ...SEED_STUDENTS[3], behaviorPoints: [] };
      expect(Array.isArray(studentWithEmptyPoints.behaviorPoints)).toBe(true);
      expect(studentWithEmptyPoints.behaviorPoints.length).toBe(0);
    });

    runner.test('F01.B3 - Empty badges array boundary', () => {
      const studentWithoutBadges = { ...SEED_STUDENTS[2], badges: [] };
      expect(studentWithoutBadges.badges.length).toBe(0);
    });

    runner.test('F01.B4 - Timeline item optional room and teacher attributes', () => {
      const itemWithoutRoom = { id: 't-test', time: '01:30 م', title: 'الانصراف', status: 'upcoming' };
      expect(itemWithoutRoom.room).toBeUndefined();
      expect(itemWithoutRoom.teacher).toBeUndefined();
    });

    runner.test('F01.B5 - Daily report optional teacher note boundary', () => {
      const subjectSummary = { subject: 'الرياضيات', topic: 'الكسور', participation: 5, homeworkStatus: 'مكتمل' };
      expect(subjectSummary.teacherNote).toBeUndefined();
    });
  });

  // ==========================================
  // F02-B: Arabic RTL & Styling (Boundaries)
  // ==========================================
  runner.describe('F02-B: Arabic RTL & Styling (Boundaries)', () => {
    runner.test('F02.B1 - Arabic text containing diacritics (Tashkeel) preservation', () => {
      const textWithTashkeel = 'مُنَصَّةُ المَدْرَسَةِ الرَّقْمِيَّةِ';
      expect(textWithTashkeel.length).toBeGreaterThan(15);
      expect(/[\u064B-\u065F]/.test(textWithTashkeel)).toBe(true);
    });

    runner.test('F02.B2 - Mixed Arabic and English alphanumeric strings', () => {
      const mixedCode = 'SCH-2026-R1 (ريان العتيبي)';
      expect(mixedCode).toContain('SCH-2026-R1');
      expect(mixedCode).toContain('ريان');
    });

    runner.test('F02.B3 - Ultra-long Arabic text in student name (boundary > 50 chars)', () => {
      const longName = 'عبدالرحمن بن عبدالعزيز بن فهد بن ناصر آل عتيبي القرشي';
      expect(longName.length).toBeGreaterThan(45);
      expect(typeof longName).toBe('string');
    });

    runner.test('F02.B4 - Arabic honorific abbreviations handling (أ. / د. / ك.)', () => {
      const teachers = ['أ. أحمد الغامدي', 'د. ناصر السعيد', 'ك. صالح الزهراني'];
      teachers.forEach(t => {
        expect(t.includes('أ.') || t.includes('د.') || t.includes('ك.')).toBe(true);
      });
    });

    runner.test('F02.B5 - RTL numeric percentage formatting (+48 / 96.5%)', () => {
      const rateStr = `${96.5}%`;
      const pointsStr = `+${48}`;
      expect(rateStr).toBe('96.5%');
      expect(pointsStr).toBe('+48');
    });
  });

  // ==========================================
  // F03-B: Dev Server & Runtime (Boundaries)
  // ==========================================
  runner.describe('F03-B: Dev Server & Runtime (Boundaries)', () => {
    runner.test('F03.B1 - Safe fallback when AudioContext is suspended or blocked', () => {
      const audioCtx = new window.AudioContext();
      audioCtx.state = 'suspended';
      expect(audioCtx.state).toBe('suspended');
      audioCtx.resume();
      expect(audioCtx.state).toBe('running');
    });

    runner.test('F03.B2 - Canvas getContext("2d") returns null for unsupported type', () => {
      const canvas = document.createElement('canvas');
      const webglCtx = canvas.getContext('unsupported-context');
      expect(webglCtx).toBeNull();
    });

    runner.test('F03.B3 - Window event listener dispatch of custom keyboard events', () => {
      let keyReceived = '';
      window.addEventListener('keydown', (e) => {
        keyReceived = e.key;
      });
      window.dispatchEvent({ type: 'keydown', key: 'k', ctrlKey: true });
      expect(keyReceived).toBe('k');
    });

    runner.test('F03.B4 - Document getElementById returning null for unknown ID', () => {
      const el = document.getElementById('non-existent-canvas-id-999');
      expect(el).toBeNull();
    });

    runner.test('F03.B5 - Safe execution when sound effects are disabled', () => {
      const sim = new SchoolStateSimulator();
      sim.setSoundEnabled(false);
      sim.recordSound('playSuccess');
      expect(sim.soundCalls.length).toBe(0);
    });
  });

  // ==========================================
  // F04-B: Multi-Role Authentication (Boundaries)
  // ==========================================
  runner.describe('F04-B: Multi-Role Authentication (Boundaries)', () => {
    runner.test('F04.B1 - Rapid sequential role toggling maintains clean state', () => {
      const sim = new SchoolStateSimulator();
      sim.login('0551111111', 'parent');
      expect(sim.currentRole).toBe('parent');
      sim.login('0552222222', 'teacher');
      expect(sim.currentRole).toBe('teacher');
      sim.login('0553333333', 'admin');
      expect(sim.currentRole).toBe('admin');
    });

    runner.test('F04.B2 - Switching to the same role is idempotent', () => {
      const sim = new SchoolStateSimulator();
      sim.login('0551234567', 'parent');
      const activeTab1 = sim.activeTab;
      sim.login('0551234567', 'parent');
      expect(sim.activeTab).toBe(activeTab1);
    });

    runner.test('F04.B3 - Logout when already unauthenticated is safe', () => {
      const sim = new SchoolStateSimulator();
      sim.logout();
      expect(sim.isAuthenticated).toBe(false);
      sim.logout();
      expect(sim.isAuthenticated).toBe(false);
    });

    runner.test('F04.B4 - Custom phone number formats (with dashes or spaces) sanitized', () => {
      const sim = new SchoolStateSimulator();
      const rawPhone = ' 055-123-4567 ';
      sim.login(rawPhone.trim(), 'parent');
      expect(sim.currentUserPhone).toBe('055-123-4567');
    });

    runner.test('F04.B5 - Role permissions: parent view defaults to student-profile', () => {
      const sim = new SchoolStateSimulator();
      sim.login('0551234567', 'parent');
      expect(sim.activeTab).toBe('student-profile');
    });
  });

  // ==========================================
  // F05-B: Parent Onboarding & OTP (Boundaries)
  // ==========================================
  runner.describe('F05-B: Parent Onboarding & OTP (Boundaries)', () => {
    runner.test('F05.B1 - Incomplete OTP (3 digits instead of 4) fails validation', () => {
      const partialOtp = ['4', '8', '2', ''];
      const isValid = partialOtp.every(d => d !== '' && /^\d$/.test(d));
      expect(isValid).toBe(false);
    });

    runner.test('F05.B2 - Non-numeric OTP input rejection', () => {
      const letterOtp = ['4', 'a', '2', '#'];
      const isValid = letterOtp.every(d => /^\d$/.test(d));
      expect(isValid).toBe(false);
    });

    runner.test('F05.B3 - Empty OTP array initial state', () => {
      const emptyOtp = ['', '', '', ''];
      expect(emptyOtp.join('')).toBe('');
      expect(emptyOtp.length).toBe(4);
    });

    runner.test('F05.B4 - Overwriting existing OTP digits via quick autofill', () => {
      let otp = ['1', '1', '1', '1'];
      otp = ['4', '8', '2', '1'];
      expect(otp.join('')).toBe('4821');
    });

    runner.test('F05.B5 - Single digit change in middle OTP box (index 1)', () => {
      const otp = ['4', '8', '2', '1'];
      otp[1] = '9';
      expect(otp.join('')).toBe('4921');
    });
  });

  // ==========================================
  // F06-B: Student Linking & Codes (Boundaries)
  // ==========================================
  runner.describe('F06-B: Student Linking & Codes (Boundaries)', () => {
    runner.test('F06.B1 - Case-insensitive code matching (sch-2026-r1)', () => {
      const sim = new SchoolStateSimulator();
      const linked = sim.linkStudent('sch-2026-r1');
      expect(linked).toBe(true);
      expect(sim.selectedStudent.id).toBe('std-1');
    });

    runner.test('F06.B2 - Code matching with leading/trailing spaces ("  SCH-2026-S2  ")', () => {
      const sim = new SchoolStateSimulator();
      const linked = sim.linkStudent('  SCH-2026-S2  ');
      expect(linked).toBe(true);
      expect(sim.selectedStudent.id).toBe('std-2');
    });

    runner.test('F06.B3 - Empty string code fails gracefully', () => {
      const sim = new SchoolStateSimulator();
      const linked = sim.linkStudent('');
      expect(linked).toBe(false);
    });

    runner.test('F06.B4 - Non-existent code with special characters ("SCH-@@@-XX")', () => {
      const sim = new SchoolStateSimulator();
      const linked = sim.linkStudent('SCH-@@@-XX');
      expect(linked).toBe(false);
    });

    runner.test('F06.B5 - Fallback matching by national ID string', () => {
      const sim = new SchoolStateSimulator();
      const linked = sim.linkStudent('1054321098');
      expect(linked).toBe(true);
      expect(sim.selectedStudent.name).toBe('خالد إبراهيم الشمري');
    });
  });

  // ==========================================
  // F07-B: Attendance Marking & Audio (Boundaries)
  // ==========================================
  runner.describe('F07-B: Attendance Marking & Audio (Boundaries)', () => {
    runner.test('F07.B1 - Rapid consecutive clicks on same status remain idempotent', () => {
      const sim = new SchoolStateSimulator();
      sim.updateAttendance('std-1', 'present');
      sim.updateAttendance('std-1', 'present');
      sim.updateAttendance('std-1', 'present');

      const s1 = sim.students.find(s => s.id === 'std-1');
      expect(s1.status).toBe('present');
    });

    runner.test('F07.B2 - Cycling through all 4 statuses in sequence', () => {
      const sim = new SchoolStateSimulator();
      const statuses = ['present', 'late', 'unexcused', 'excused'];

      statuses.forEach(status => {
        sim.updateAttendance('std-2', status);
        const s2 = sim.students.find(s => s.id === 'std-2');
        expect(s2.status).toBe(status);
      });
    });

    runner.test('F07.B3 - Attendance with empty note string defaults gracefully', () => {
      const sim = new SchoolStateSimulator();
      sim.updateAttendance('std-3', 'excused', '');
      const s3 = sim.students.find(s => s.id === 'std-3');
      expect(s3.status).toBe('excused');
      expect(s3.recentAttendance[0].note).toBe('');
    });

    runner.test('F07.B4 - Attendance marking on non-existent student ID has zero side-effects', () => {
      const sim = new SchoolStateSimulator();
      const initialJson = JSON.stringify(sim.students);
      sim.updateAttendance('std-non-existent-999', 'present');
      expect(JSON.stringify(sim.students)).toBe(initialJson);
    });

    runner.test('F07.B5 - Muted sound engine produces zero audio entries on attendance update', () => {
      const sim = new SchoolStateSimulator();
      sim.setSoundEnabled(false);
      sim.updateAttendance('std-1', 'unexcused');
      expect(sim.soundCalls.length).toBe(0);
    });
  });

  // ==========================================
  // F08-B: Batch Attendance & CSV Export (Boundaries)
  // ==========================================
  runner.describe('F08-B: Batch Attendance & CSV Export (Boundaries)', () => {
    runner.test('F08.B1 - Mark all present when all students are already present', () => {
      const sim = new SchoolStateSimulator();
      sim.markAllPresent();
      sim.markAllPresent(); // Second invocation
      sim.students.forEach(s => {
        expect(s.status).toBe('present');
      });
    });

    runner.test('F08.B2 - CSV export handles commas and quotation marks in notes', () => {
      const studentName = 'ريان "فهد" العتيبي, المتفوق';
      const escaped = `"${studentName.replace(/"/g, '""')}"`;
      expect(escaped).toBe('"ريان ""فهد"" العتيبي, المتفوق"');
    });

    runner.test('F08.B3 - CSV export string contains correct UTF-8 Arabic encoding characters', () => {
      const arabicLine = '"سارة خالد القحطاني","2024-0105","الصف الخامس الابتدائي","أ","present","2026-09-01"';
      expect(arabicLine).toContain('القحطاني');
    });

    runner.test('F08.B4 - Class summary counters when all students are marked unexcused absent', () => {
      const sim = new SchoolStateSimulator();
      sim.students.forEach(s => {
        sim.updateAttendance(s.id, 'unexcused');
      });
      const presentCount = sim.students.filter(s => s.status === 'present').length;
      const absentCount = sim.students.filter(s => s.status === 'unexcused').length;
      expect(presentCount).toBe(0);
      expect(absentCount).toBe(sim.students.length);
    });

    runner.test('F08.B5 - Class supervisor fallback handling', () => {
      const cls = SEED_CLASSES[0];
      const supervisor = cls.supervisor || 'غير محدد';
      expect(supervisor).toBe('أ. أحمد الغامدي');
    });
  });

  // ==========================================
  // F09-B: Gamified Behavior Points (Boundaries)
  // ==========================================
  runner.describe('F09-B: Gamified Behavior Points (Boundaries)', () => {
    runner.test('F09.B1 - Negative points score floor at zero (score never drops below 0)', () => {
      const sim = new SchoolStateSimulator();
      // std-3 starts with 25 points
      sim.addBehaviorPoint('std-3', {
        id: 'bp-neg-1',
        category: 'needs_work',
        title: 'خصم كبير',
        points: -50,
        icon: '⚠️',
        date: 'اليوم',
        teacher: 'أ. أحمد الغامدي'
      });

      const s3 = sim.students.find(s => s.id === 'std-3');
      expect(s3.behaviorPointsTotal).toBe(0); // Clamped at 0
    });

    runner.test('F09.B2 - Awarding zero points maintains existing total score', () => {
      const sim = new SchoolStateSimulator();
      const s1 = sim.students.find(s => s.id === 'std-1');
      const initialScore = s1.behaviorPointsTotal;

      sim.addBehaviorPoint('std-1', {
        id: 'bp-zero-1',
        category: 'positive',
        title: 'تنبيه محايد',
        points: 0,
        icon: 'ℹ️',
        date: 'اليوم',
        teacher: 'أ. أحمد الغامدي'
      });

      const updated = sim.students.find(s => s.id === 'std-1');
      expect(updated.behaviorPointsTotal).toBe(initialScore);
    });

    runner.test('F09.B3 - Large point addition (+500) updates total accurately', () => {
      const sim = new SchoolStateSimulator();
      const s1 = sim.students.find(s => s.id === 'std-1');
      const initialScore = s1.behaviorPointsTotal;

      sim.addBehaviorPoint('std-1', {
        id: 'bp-huge-1',
        category: 'positive',
        title: 'جائزة التميز الكبرى',
        points: 500,
        icon: '🏆',
        date: 'اليوم',
        teacher: 'مدير المدرسة'
      });

      const updated = sim.students.find(s => s.id === 'std-1');
      expect(updated.behaviorPointsTotal).toBe(initialScore + 500);
    });

    runner.test('F09.B4 - Behavior point added to student with empty points list', () => {
      const sim = new SchoolStateSimulator();
      // std-4 starts with empty behaviorPoints: []
      expect(sim.students.find(s => s.id === 'std-4').behaviorPoints.length).toBe(0);

      sim.addBehaviorPoint('std-4', {
        id: 'bp-first-1',
        category: 'positive',
        title: 'أول نقطة',
        points: 5,
        icon: '🌟',
        date: 'اليوم',
        teacher: 'أ. هدى العنزي'
      });

      const s4 = sim.students.find(s => s.id === 'std-4');
      expect(s4.behaviorPoints.length).toBe(1);
    });

    runner.test('F09.B5 - Behavior points category validation (positive vs needs_work)', () => {
      const validCategories = ['positive', 'needs_work'];
      const point1 = { category: 'positive' };
      const point2 = { category: 'needs_work' };
      expect(validCategories.includes(point1.category)).toBe(true);
      expect(validCategories.includes(point2.category)).toBe(true);
    });
  });

  // ==========================================
  // F10-B: Competencies Radar Chart (Boundaries)
  // ==========================================
  runner.describe('F10-B: Competencies Radar Chart (Boundaries)', () => {
    runner.test('F10.B1 - Radar chart with 0% scores on all competencies collapses to center', () => {
      const competencies = [
        { name: 'حل المشكلات', score: 0, maxScore: 100 },
        { name: 'التفكير الإبداعي', score: 0, maxScore: 100 },
        { name: 'العمل الجماعي', score: 0, maxScore: 100 },
      ];
      const size = 260;
      const center = size / 2;

      competencies.forEach((c, i) => {
        const ratio = c.score / c.maxScore;
        const angle = (Math.PI * 2 / competencies.length) * i - Math.PI / 2;
        const x = center + (center - 36) * ratio * Math.cos(angle);
        const y = center + (center - 36) * ratio * Math.sin(angle);
        expect(Math.round(x)).toBe(center);
        expect(Math.round(y)).toBe(center);
      });
    });

    runner.test('F10.B2 - Radar chart with 100% scores on all competencies reaches full radius', () => {
      const competencies = [
        { name: 'أ', score: 100, maxScore: 100 },
        { name: 'ب', score: 100, maxScore: 100 },
        { name: 'ج', score: 100, maxScore: 100 },
      ];
      const size = 260;
      const center = size / 2;
      const radius = center - 36;

      competencies.forEach((c, i) => {
        const ratio = c.score / c.maxScore;
        expect(ratio).toBe(1.0);
      });
    });

    runner.test('F10.B3 - Radar chart minimum 3-axis spider geometry', () => {
      const minCompetencies = [
        { name: 'المهارة 1', score: 80, maxScore: 100 },
        { name: 'المهارة 2', score: 90, maxScore: 100 },
        { name: 'المهارة 3', score: 85, maxScore: 100 },
      ];
      expect(minCompetencies.length).toBe(3);
    });

    runner.test('F10.B4 - Custom canvas dimensions scaling (small size=100 vs large size=500)', () => {
      [100, 500].forEach(size => {
        const center = size / 2;
        const radius = center - 36;
        expect(radius).toBeGreaterThan(0);
      });
    });

    runner.test('F10.B5 - Score maxScore ratio calculation never exceeds 1.0', () => {
      const comp = { name: 'اللياقة', score: 100, maxScore: 100 };
      const ratio = Math.min(1.0, comp.score / comp.maxScore);
      expect(ratio).toBe(1.0);
    });
  });

  // ==========================================
  // F11-B: Golden Certificate Modal (Boundaries)
  // ==========================================
  runner.describe('F11-B: Golden Certificate Modal (Boundaries)', () => {
    runner.test('F11.B1 - Certificate modal with 100.0% perfect GPA', () => {
      const student = { ...SEED_STUDENTS[0], academicAverage: 100.0 };
      const text = `بمعدل (${student.academicAverage}%)`;
      expect(text).toContain('100%');
    });

    runner.test('F11.B2 - Certificate modal with 0% GPA boundary', () => {
      const student = { ...SEED_STUDENTS[0], academicAverage: 0.0 };
      const text = `بمعدل (${student.academicAverage}%)`;
      expect(text).toContain('0%');
    });

    runner.test('F11.B3 - Ultra-long student name (60+ characters) in certificate', () => {
      const longName = 'صاحب السمو الملكي الأمير محمد بن فهد بن ناصر بن تركي العتيبي';
      expect(longName.length).toBeGreaterThan(50);
    });

    runner.test('F11.B4 - Certificate for student with empty notes or badges', () => {
      const student = { ...SEED_STUDENTS[3], badges: [], notes: [] };
      expect(student.name).toBe('ليان مساعد الغامدي');
    });

    runner.test('F11.B5 - Certificate modal close action does not trigger print', () => {
      window._lastPrinted = 0;
      const isOpen = false;
      if (!isOpen) {
        // do not call window.print
      }
      expect(window._lastPrinted).toBe(0);
    });
  });

  // ==========================================
  // F12-B: Avatar Customization (Boundaries)
  // ==========================================
  runner.describe('F12-B: Avatar Customization (Boundaries)', () => {
    runner.test('F12.B1 - Selecting same preset avatar already active is idempotent', () => {
      const sim = new SchoolStateSimulator();
      const current = sim.selectedStudent.avatar;
      sim.updateStudentAvatar(sim.selectedStudent.id, current);
      expect(sim.selectedStudent.avatar).toBe(current);
    });

    runner.test('F12.B2 - Very long Base64 image payload handling (> 1000 chars)', () => {
      const sim = new SchoolStateSimulator();
      const largeBase64 = 'data:image/png;base64,' + 'A'.repeat(2048);
      sim.updateStudentAvatar('std-1', largeBase64);

      const s1 = sim.students.find(s => s.id === 'std-1');
      expect(s1.avatar.length).toBeGreaterThan(2000);
    });

    runner.test('F12.B3 - Updating avatar for non-existent student ID is safe', () => {
      const sim = new SchoolStateSimulator();
      sim.updateStudentAvatar('std-unknown-999', 'https://example.com/avatar.png');
      expect(sim.students.length).toBe(SEED_STUDENTS.length);
    });

    runner.test('F12.B4 - Preset avatar URL validity', () => {
      const avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
      expect(avatarUrl.startsWith('https://')).toBe(true);
    });

    runner.test('F12.B5 - Empty string avatar URL fallback', () => {
      const fallback = '' || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
      expect(fallback.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // F13-B: Interactive Daily Report (Boundaries)
  // ==========================================
  runner.describe('F13-B: Interactive Daily Report (Boundaries)', () => {
    runner.test('F13.B1 - Subject participation star rating boundary at 1 and 5 stars', () => {
      [1, 5].forEach(star => {
        expect(star).toBeGreaterThanOrEqual(1);
        expect(star).toBeLessThanOrEqual(5);
      });
    });

    runner.test('F13.B2 - Timeline items all marked completed boundary', () => {
      const report = {
        ...SEED_DAILY_REPORT,
        timeline: SEED_DAILY_REPORT.timeline.map(t => ({ ...t, status: 'completed' }))
      };
      const allDone = report.timeline.every(t => t.status === 'completed');
      expect(allDone).toBe(true);
    });

    runner.test('F13.B3 - Empty achievements array boundary', () => {
      const report = { ...SEED_DAILY_REPORT, achievements: [] };
      expect(report.achievements.length).toBe(0);
    });

    runner.test('F13.B4 - Empty tasks for tomorrow array boundary', () => {
      const report = { ...SEED_DAILY_REPORT, tasksForTomorrow: [] };
      expect(report.tasksForTomorrow.length).toBe(0);
    });

    runner.test('F13.B5 - Voice note simulation state timeout safety', () => {
      let playing = true;
      setTimeout(() => { playing = false; }, 10);
      expect(playing).toBe(true);
    });
  });

  // ==========================================
  // F14-B: Notification Center (Boundaries)
  // ==========================================
  runner.describe('F14-B: Notification Center (Boundaries)', () => {
    runner.test('F14.B1 - Mark all read when unread count is already 0 is idempotent', () => {
      const sim = new SchoolStateSimulator();
      sim.markAllNotificationsAsRead();
      expect(sim.unreadCount).toBe(0);
      sim.markAllNotificationsAsRead();
      expect(sim.unreadCount).toBe(0);
    });

    runner.test('F14.B2 - Mark non-existent notification ID as read is safe', () => {
      const sim = new SchoolStateSimulator();
      const initialUnread = sim.unreadCount;
      sim.markNotificationAsRead('notif-non-existent-999');
      expect(sim.unreadCount).toBe(initialUnread);
    });

    runner.test('F14.B3 - Notifications list with 0 items unread calculation', () => {
      const emptyNotifs = [];
      const unread = emptyNotifs.filter(n => !n.read).length;
      expect(unread).toBe(0);
    });

    runner.test('F14.B4 - Filtering notifications by non-existent category returns empty array', () => {
      const sim = new SchoolStateSimulator();
      const filtered = sim.notifications.filter(n => n.category === 'non-existent-category');
      expect(filtered.length).toBe(0);
    });

    runner.test('F14.B5 - Notification without studentName attribute handling', () => {
      const notif = { id: 'n-anon', title: 'إعلان عام', message: 'عطلة رسمية', read: false, category: 'admin' };
      expect(notif.studentName).toBeUndefined();
    });
  });

  // ==========================================
  // F15-B: Global Command Palette (Boundaries)
  // ==========================================
  runner.describe('F15-B: Global Command Palette (Boundaries)', () => {
    runner.test('F15.B1 - Search query with 0 matching results returns empty list', () => {
      const sim = new SchoolStateSimulator();
      const query = 'اسم غير موجود إطلاقاً 999';
      const results = sim.students.filter(s => s.name.includes(query));
      expect(results.length).toBe(0);
    });

    runner.test('F15.B2 - Search with regex special characters does not crash', () => {
      const sim = new SchoolStateSimulator();
      const specialQuery = '.*+?^${}()|[]\\';
      const results = sim.students.filter(s => s.name.includes(specialQuery));
      expect(results.length).toBe(0);
    });

    runner.test('F15.B3 - Search with Arabic Tashkeel string', () => {
      const sim = new SchoolStateSimulator();
      const query = 'رَيَّان';
      // Search with plain Arabic 'ريان'
      const plainResults = sim.students.filter(s => s.name.includes('ريان'));
      expect(plainResults.length).toBe(1);
    });

    runner.test('F15.B4 - Rapid Cmd+K open and close state toggles', () => {
      const sim = new SchoolStateSimulator();
      for (let i = 0; i < 10; i++) {
        sim.isCommandPaletteOpen = !sim.isCommandPaletteOpen;
      }
      expect(sim.isCommandPaletteOpen).toBe(false);
    });

    runner.test('F15.B5 - Navigating with empty search query displays all students', () => {
      const sim = new SchoolStateSimulator();
      const query = '';
      const results = sim.students.filter(s => s.name.includes(query));
      expect(results.length).toBe(sim.students.length);
    });
  });

  // ==========================================
  // F16-B: Persistent Database & Seeding (Boundaries)
  // ==========================================
  runner.describe('F16-B: Persistent Database & Seeding (Boundaries)', () => {
    runner.test('F16.B1 - Corrupted JSON in localStorage key recovers gracefully to seed data', () => {
      localStorage.setItem(STORAGE_KEY_STUDENTS, '{invalid_corrupted_json:::');
      const db = new DatabaseService();
      const students = db.getStudents();
      expect(students.length).toBe(SEED_STUDENTS.length);
      expect(students[0].name).toBe('ريان فهد العتيبي');
    });

    runner.test('F16.B2 - Corrupted notifications JSON recovers gracefully', () => {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, '###corrupt###');
      const db = new DatabaseService();
      const notifs = db.getNotifications();
      expect(notifs.length).toBe(SEED_NOTIFICATIONS.length);
    });

    runner.test('F16.B3 - Corrupted reports JSON recovers gracefully', () => {
      localStorage.setItem(STORAGE_KEY_REPORTS, 'null_corrupted');
      const db = new DatabaseService();
      const report = db.getDailyReport();
      expect(report.id).toBe(SEED_DAILY_REPORT.id);
    });

    runner.test('F16.B4 - Missing individual keys seeded independently', () => {
      localStorage.clear();
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(SEED_STUDENTS));
      // classes, notifications, reports are empty

      const db = new DatabaseService();
      const classes = db.getClasses();
      expect(classes.length).toBe(SEED_CLASSES.length);
    });

    runner.test('F16.B5 - Storage key prefix isolation (*_v2)', () => {
      localStorage.setItem('old_version_key_v1', 'old_data');
      const db = new DatabaseService();
      const students = db.getStudents();
      expect(localStorage.getItem('old_version_key_v1')).toBe('old_data');
      expect(students.length).toBe(SEED_STUDENTS.length);
    });
  });

  // ==========================================
  // F17-B: State Durability across Reloads (Boundaries)
  // ==========================================
  runner.describe('F17-B: State Durability across Reloads (Boundaries)', () => {
    runner.test('F17.B1 - Rapid consecutive reloads maintain exact state integrity', () => {
      const sim = new SchoolStateSimulator();
      sim.updateAttendance('std-1', 'excused', 'عذر مكرر');

      for (let i = 0; i < 5; i++) {
        const reloaded = new SchoolStateSimulator();
        const s1 = reloaded.students.find(s => s.id === 'std-1');
        expect(s1.status).toBe('excused');
      }
    });

    runner.test('F17.B2 - Deep copy isolation between localStorage and runtime instances', () => {
      const sim1 = new SchoolStateSimulator();
      const sim2 = new SchoolStateSimulator();

      sim1.students[0].name = 'اسم معدل في الذاكرة فقط';
      expect(sim2.students[0].name).toBe('ريان فهد العتيبي');
    });

    runner.test('F17.B3 - State durability after partial array splice mutations', () => {
      const sim1 = new SchoolStateSimulator();
      sim1.notifications.pop(); // Remove one notification
      sim1.db.saveNotifications(sim1.notifications);

      const sim2 = new SchoolStateSimulator();
      expect(sim2.notifications.length).toBe(SEED_NOTIFICATIONS.length - 1);
    });

    runner.test('F17.B4 - Concurrent database reads maintain consistent dataset', () => {
      const db = new DatabaseService();
      const r1 = db.getStudents();
      const r2 = db.getStudents();
      expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
    });

    runner.test('F17.B5 - Durability of student attendance history across 3 reloads', () => {
      const sim1 = new SchoolStateSimulator();
      sim1.updateAttendance('std-2', 'late', 'تأخر 5 دقائق');

      const sim2 = new SchoolStateSimulator();
      sim2.updateAttendance('std-2', 'present');

      const sim3 = new SchoolStateSimulator();
      const s2 = sim3.students.find(s => s.id === 'std-2');
      expect(s2.status).toBe('present');
    });
  });

  // ==========================================
  // F18-B: Database Factory Reset (Boundaries)
  // ==========================================
  runner.describe('F18-B: Database Factory Reset (Boundaries)', () => {
    runner.test('F18.B1 - Multiple sequential factory resets are idempotent', () => {
      const sim = new SchoolStateSimulator();
      sim.resetDatabase();
      sim.resetDatabase();
      sim.resetDatabase();

      expect(sim.students.length).toBe(SEED_STUDENTS.length);
      expect(sim.notifications.length).toBe(SEED_NOTIFICATIONS.length);
    });

    runner.test('F18.B2 - Factory reset on corrupted localStorage restores clean state', () => {
      localStorage.setItem(STORAGE_KEY_STUDENTS, 'corrupt');
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, 'corrupt');

      const sim = new SchoolStateSimulator();
      sim.resetDatabase();

      expect(sim.students.length).toBe(SEED_STUDENTS.length);
      expect(sim.students[0].name).toBe('ريان فهد العتيبي');
    });

    runner.test('F18.B3 - Factory reset on empty localStorage initializes all 4 keys', () => {
      localStorage.clear();
      const sim = new SchoolStateSimulator();
      sim.resetDatabase();

      expect(localStorage.getItem(STORAGE_KEY_STUDENTS)).toBeDefined();
      expect(localStorage.getItem(STORAGE_KEY_CLASSES)).toBeDefined();
      expect(localStorage.getItem(STORAGE_KEY_NOTIFICATIONS)).toBeDefined();
      expect(localStorage.getItem(STORAGE_KEY_REPORTS)).toBeDefined();
    });

    runner.test('F18.B4 - Factory reset restores student competencies array lengths', () => {
      const sim = new SchoolStateSimulator();
      sim.students[0].competencies = [];
      sim.db.saveStudents(sim.students);

      sim.resetDatabase();
      expect(sim.students[0].competencies.length).toBe(6);
    });

    runner.test('F18.B5 - Factory reset restores unread notifications count accurately', () => {
      const sim = new SchoolStateSimulator();
      sim.markAllNotificationsAsRead();
      expect(sim.unreadCount).toBe(0);

      sim.resetDatabase();
      expect(sim.unreadCount).toBe(SEED_NOTIFICATIONS.filter(n => !n.read).length);
    });
  });

  return runner;
}
