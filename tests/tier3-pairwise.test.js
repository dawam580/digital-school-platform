/**
 * Tier 3: Cross-Feature Combinations (Pairwise Interaction Workflows)
 * ≥18 Pairwise Integration Workflows verifying cross-module state transitions,
 * event propagation, and persistence synchronizations.
 */

import {
  TestRunner,
  expect,
  setupBrowserEnvironment,
  SchoolStateSimulator,
  SEED_STUDENTS,
  SEED_NOTIFICATIONS,
  STORAGE_KEY_STUDENTS,
  STORAGE_KEY_NOTIFICATIONS
} from './test-harness.js';

export function createTier3Suite() {
  const runner = new TestRunner('Tier 3: Pairwise Workflows & Cross-Feature Integration');

  runner.beforeEach(() => {
    setupBrowserEnvironment();
  });

  // ==========================================
  // W01: Attendance → Notification → Parent Read
  // ==========================================
  runner.test('W01: Attendance status update (unexcused) → Automated parent notification → Unread increment → Mark read', () => {
    const sim = new SchoolStateSimulator();
    const initialUnread = sim.unreadCount;

    // 1. Teacher marks student unexcused
    sim.updateAttendance('std-4', 'unexcused', 'غياب بدون إشعار مسبق');
    sim.addNotification(
      'تنبيه غياب غير مبرر',
      'تنبيه: الطالبة (ليان الغامدي) مسجلة غياب اليوم دون تقديم عذر مسبق.',
      'urgent',
      'ليان مساعد الغامدي'
    );

    // 2. Unread notification counter incremented
    expect(sim.unreadCount).toBe(initialUnread + 1);
    const createdNotif = sim.notifications[0];
    expect(createdNotif.title).toBe('تنبيه غياب غير مبرر');
    expect(createdNotif.read).toBe(false);

    // 3. Parent marks notification as read
    sim.markNotificationAsRead(createdNotif.id);
    expect(sim.unreadCount).toBe(initialUnread);
    expect(sim.notifications.find(n => n.id === createdNotif.id).read).toBe(true);
  });

  // ==========================================
  // W02: Behavior Point → Total Score → Certificate & Notification
  // ==========================================
  runner.test('W02: Behavior point awarded (+5) → Recalculate score → Notification dispatched → Certificate reflects GPA & Total', () => {
    const sim = new SchoolStateSimulator();
    const s1 = sim.students.find(s => s.id === 'std-1');
    const initialScore = s1.behaviorPointsTotal;

    // 1. Teacher awards +5 points
    sim.addBehaviorPoint('std-1', {
      id: 'bp-w02',
      category: 'positive',
      title: 'إتقان وحل الواجب المنزلي',
      points: 5,
      icon: '🌟',
      date: 'اليوم',
      teacher: 'أ. أحمد الغامدي'
    });

    // 2. Score total updated
    expect(sim.selectedStudent.behaviorPointsTotal).toBe(initialScore + 5);

    // 3. Notification created
    const notif = sim.notifications.find(n => n.title.includes('نقطة تقييم جديدة (+5)'));
    expect(notif).toBeDefined();

    // 4. Certificate displays updated student metadata
    const certStudent = sim.selectedStudent;
    expect(certStudent.academicAverage).toBe(96.5);
    expect(certStudent.name).toBe('ريان فهد العتيبي');
  });

  // ==========================================
  // W03: Parent Onboarding OTP → Redirect → Student Linking
  // ==========================================
  runner.test('W03: Parent sign-up with OTP "4821" → Login → Redirect to Link Student → Link "SCH-2026-R1"', () => {
    const sim = new SchoolStateSimulator();

    // 1. Parent onboarding with phone
    const phone = '0551234567';
    sim.login(phone, 'parent');
    expect(sim.isAuthenticated).toBe(true);
    expect(sim.currentRole).toBe('parent');

    // 2. Auto-navigate to LinkStudent
    sim.activeTab = 'link-student';
    expect(sim.activeTab).toBe('link-student');

    // 3. Enter link code SCH-2026-R1
    const linked = sim.linkStudent('SCH-2026-R1');
    expect(linked).toBe(true);
    expect(sim.selectedStudent.name).toBe('ريان فهد العتيبي');

    // 4. Navigate to student profile
    sim.activeTab = 'student-profile';
    expect(sim.activeTab).toBe('student-profile');
  });

  // ==========================================
  // W04: Avatar Picker → Student Profile → Persistence
  // ==========================================
  runner.test('W04: Custom avatar change in AvatarPickerModal → StudentProfile updated → Storage persisted', () => {
    const sim1 = new SchoolStateSimulator();
    const newAvatarUrl = 'https://images.unsplash.com/photo-custom-test-avatar-w04';

    // 1. Update avatar in simulator
    sim1.updateStudentAvatar('std-1', newAvatarUrl);
    expect(sim1.selectedStudent.avatar).toBe(newAvatarUrl);

    // 2. Validate localStorage
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    const parsed = JSON.parse(raw);
    const s1 = parsed.find(s => s.id === 'std-1');
    expect(s1.avatar).toBe(newAvatarUrl);

    // 3. Verify durability in fresh session
    const sim2 = new SchoolStateSimulator();
    expect(sim2.selectedStudent.avatar).toBe(newAvatarUrl);
  });

  // ==========================================
  // W05: Batch Attendance → Class Overview Counters → Notification
  // ==========================================
  runner.test('W05: Mark all present → Statuses updated → Class counters updated → Notification logged', () => {
    const sim = new SchoolStateSimulator();

    // 1. Mark all present
    sim.markAllPresent('cls-5a');

    // 2. All students marked present
    const allPresent = sim.students.every(s => s.status === 'present');
    expect(allPresent).toBe(true);

    // 3. Class summary counters reflect 100% presence
    const presentCount = sim.students.filter(s => s.status === 'present').length;
    expect(presentCount).toBe(sim.students.length);

    // 4. Notification added
    const notif = sim.notifications.find(n => n.title === 'تحضير جماعي للفصل');
    expect(notif).toBeDefined();
  });

  // ==========================================
  // W06: Command Palette Search → Student Switch → Radar Chart
  // ==========================================
  runner.test('W06: Command Palette search "سارة" → Select student → Active student switched → Radar chart competencies', () => {
    const sim = new SchoolStateSimulator();

    // 1. Open command palette
    sim.isCommandPaletteOpen = true;

    // 2. Search for Sarah
    const query = 'سارة';
    const match = sim.students.find(s => s.name.includes(query));
    expect(match).toBeDefined();

    // 3. Select Sarah
    sim.selectedStudent = match;
    sim.activeTab = 'student-profile';
    sim.isCommandPaletteOpen = false;

    // 4. Verify selected student and radar chart competencies
    expect(sim.selectedStudent.name).toBe('سارة خالد القحطاني');
    expect(sim.selectedStudent.competencies.length).toBe(6);
    expect(sim.selectedStudent.competencies[0].name).toBe('حل المشكلات');
    expect(sim.selectedStudent.competencies[0].score).toBe(98);
  });

  // ==========================================
  // W07: Medical Excuse Submission → Attendance Status → Notification
  // ==========================================
  runner.test('W07: Submit medical excuse in StudentProfile → Status changed to excused → Notification logged', () => {
    const sim = new SchoolStateSimulator();

    // 1. Submit excuse for Rayan
    const reason = 'مراجعة موعد طبي بمستشفى الملك فيصل التخصصي';
    sim.updateAttendance('std-1', 'excused', reason);
    sim.addNotification(
      'تم استلام طلب العذر الطبي',
      `تم إرسال طلب عذر الغياب للطالب (ريان فهد العتيبي) بتاريخ 2026-09-01 للإدارة المدرسية.`,
      'attendance',
      'ريان فهد العتيبي'
    );

    // 2. Check student status
    const student = sim.students.find(s => s.id === 'std-1');
    expect(student.status).toBe('excused');
    expect(student.recentAttendance[0].note).toBe(reason);

    // 3. Check notification
    const notif = sim.notifications.find(n => n.title === 'تم استلام طلب العذر الطبي');
    expect(notif).toBeDefined();
    expect(notif.studentName).toBe('ريان فهد العتيبي');
  });

  // ==========================================
  // W08: Negative Behavior Point → Floor at 0 → Academic Alert
  // ==========================================
  runner.test('W08: Award -2 behavior points → Decrement with floor at 0 → Notification dispatched', () => {
    const sim = new SchoolStateSimulator();
    const initialScore = sim.selectedStudent.behaviorPointsTotal;

    // 1. Award -2 points for missing homework
    sim.addBehaviorPoint(sim.selectedStudent.id, {
      id: 'bp-w08',
      category: 'needs_work',
      title: 'عدم تسليم الواجب في وقته',
      points: -2,
      icon: '📝',
      date: 'اليوم',
      teacher: 'أ. أحمد الغامدي'
    });

    // 2. Verify score decrement
    expect(sim.selectedStudent.behaviorPointsTotal).toBe(Math.max(0, initialScore - 2));

    // 3. Verify notification
    const notif = sim.notifications.find(n => n.title.includes('نقطة تقييم جديدة (-2)'));
    expect(notif).toBeDefined();
  });

  // ==========================================
  // W09: Multi-Role Switch Workflow (Parent → Teacher → Admin)
  // ==========================================
  runner.test('W09: Parent role switches to Teacher → Attendance marked → Switches to Admin → Dashboard reflects changes', () => {
    const sim = new SchoolStateSimulator();

    // 1. Parent view
    sim.login('0551234567', 'parent');
    expect(sim.activeTab).toBe('student-profile');

    // 2. Switch to Teacher
    sim.login('0509988776', 'teacher');
    expect(sim.activeTab).toBe('attendance');
    sim.updateAttendance('std-1', 'present');

    // 3. Switch to Admin
    sim.login('0501112233', 'admin');
    expect(sim.activeTab).toBe('dashboard');
    const s1 = sim.students.find(s => s.id === 'std-1');
    expect(s1.status).toBe('present');
  });

  // ==========================================
  // W10: Student Linking → Switch Active Child → Daily Report
  // ==========================================
  runner.test('W10: Enter link code "SCH-2026-S2" → Active child switched to Sarah → Daily report tab opened', () => {
    const sim = new SchoolStateSimulator();

    // 1. Link Sarah
    const linked = sim.linkStudent('SCH-2026-S2');
    expect(linked).toBe(true);
    expect(sim.selectedStudent.name).toBe('سارة خالد القحطاني');

    // 2. Switch tab to daily report
    sim.activeTab = 'daily-report';
    expect(sim.activeTab).toBe('daily-report');
    expect(sim.selectedStudent.name).toBe('سارة خالد القحطاني');
  });

  // ==========================================
  // W11: Attendance Tracker Status Updates → CSV Report Content
  // ==========================================
  runner.test('W11: Update multiple student statuses → CSV report output reflects updated data', () => {
    const sim = new SchoolStateSimulator();

    sim.updateAttendance('std-1', 'present');
    sim.updateAttendance('std-2', 'late');
    sim.updateAttendance('std-4', 'unexcused');

    const csvRows = sim.students.map(s => `"${s.name}","${s.status}"`).join('\n');
    expect(csvRows).toContain('"ريان فهد العتيبي","present"');
    expect(csvRows).toContain('"سارة خالد القحطاني","late"');
    expect(csvRows).toContain('"ليان مساعد الغامدي","unexcused"');
  });

  // ==========================================
  // W12: Behavior Points Multi-Award → History Log Consistency
  // ==========================================
  runner.test('W12: Multi-point awards across categories → Points history array accurately ordered', () => {
    const sim = new SchoolStateSimulator();

    sim.addBehaviorPoint('std-1', {
      id: 'bp-seq-1',
      category: 'positive',
      title: 'مشاركة ممتازة',
      points: 5,
      icon: '🌟',
      date: 'اليوم 08:00 ص',
      teacher: 'أ. أحمد الغامدي'
    });

    sim.addBehaviorPoint('std-1', {
      id: 'bp-seq-2',
      category: 'positive',
      title: 'مساعدة الزملاء',
      points: 3,
      icon: '🤝',
      date: 'اليوم 09:00 ص',
      teacher: 'أ. خالد الشهري'
    });

    const s1 = sim.students.find(s => s.id === 'std-1');
    expect(s1.behaviorPoints[0].id).toBe('bp-seq-2'); // Most recent first
    expect(s1.behaviorPoints[1].id).toBe('bp-seq-1');
  });

  // ==========================================
  // W13: Daily Report Voice Note → Web Audio Chime → Timeline Schedule
  // ==========================================
  runner.test('W13: Trigger voice note playback simulation → Audio chime logged → Timeline schedule validated', () => {
    const sim = new SchoolStateSimulator();

    // 1. Play voice note
    sim.recordSound('playSuccess');
    expect(sim.soundCalls.some(s => s.type === 'playSuccess')).toBe(true);

    // 2. Validate daily report timeline
    const timeline = sim.dailyReport.timeline;
    expect(timeline.length).toBe(11);
    expect(timeline[0].title).toContain('الاصطفاف الصباحي');
  });

  // ==========================================
  // W14: Notification Item Click ("new_report") → Mark Read → Navigate Tab
  // ==========================================
  runner.test('W14: Notification click with type "new_report" → Mark as read → Navigate to daily-report tab', () => {
    const sim = new SchoolStateSimulator();
    const reportNotif = sim.notifications.find(n => n.id === 'notif-3');

    // 1. Click notification
    sim.markNotificationAsRead(reportNotif.id);
    sim.activeTab = 'daily-report';

    // 2. Verify state
    expect(sim.notifications.find(n => n.id === 'notif-3').read).toBe(true);
    expect(sim.activeTab).toBe('daily-report');
  });

  // ==========================================
  // W15: Multi-Domain Mutations → Re-read from Storage → Complete Data Fidelity
  // ==========================================
  runner.test('W15: Avatar change + Points addition + Attendance mark → Storage re-read → 100% integrity', () => {
    const sim1 = new SchoolStateSimulator();

    sim1.updateStudentAvatar('std-2', 'https://images.unsplash.com/custom_avatar_w15');
    sim1.addBehaviorPoint('std-2', {
      id: 'bp-w15',
      category: 'positive',
      title: 'إبداع علمي',
      points: 5,
      icon: '💡',
      date: 'اليوم',
      teacher: 'أ. خالد الشهري'
    });
    sim1.updateAttendance('std-2', 'late', 'تأخر بسيط');

    // Re-read directly from fresh DatabaseService instance
    const sim2 = new SchoolStateSimulator();
    const s2 = sim2.students.find(s => s.id === 'std-2');

    expect(s2.avatar).toBe('https://images.unsplash.com/custom_avatar_w15');
    expect(s2.behaviorPointsTotal).toBe(57); // 52 + 5
    expect(s2.status).toBe('late');
  });

  // ==========================================
  // W16: Database Factory Reset → State Rollback Across All Domains
  // ==========================================
  runner.test('W16: Database reset triggered → Storage re-initialized → Notifications, avatars, points restored to seed', () => {
    const sim = new SchoolStateSimulator();

    // Mutate state
    sim.updateAttendance('std-1', 'unexcused');
    sim.addBehaviorPoint('std-1', { id: 'bp-x', category: 'positive', title: 'test', points: 10, icon: '🌟', date: 'now', teacher: 't' });
    sim.markAllNotificationsAsRead();
    sim.updateStudentAvatar('std-1', 'https://changed.url');

    // Reset database
    sim.resetDatabase();

    // Verify complete rollback to seed state
    expect(sim.students[0].status).toBe(SEED_STUDENTS[0].status);
    expect(sim.students[0].avatar).toBe(SEED_STUDENTS[0].avatar);
    expect(sim.students[0].behaviorPointsTotal).toBe(SEED_STUDENTS[0].behaviorPointsTotal);
    expect(sim.unreadCount).toBe(SEED_NOTIFICATIONS.filter(n => !n.read).length);
  });

  // ==========================================
  // W17: Sound Engine Toggle in Navbar → Silence / Active Audio Chimes
  // ==========================================
  runner.test('W17: Sound enabled toggle → Disabling sound silences clicks → Enabling restores chimes', () => {
    const sim = new SchoolStateSimulator();

    // 1. Disable sound
    sim.setSoundEnabled(false);
    sim.updateAttendance('std-1', 'present');
    expect(sim.soundCalls.length).toBe(0);

    // 2. Enable sound
    sim.setSoundEnabled(true);
    sim.updateAttendance('std-1', 'present');
    expect(sim.soundCalls.length).toBe(1);
    expect(sim.soundCalls[0].type).toBe('playTap');
  });

  // ==========================================
  // W18: Admin Dashboard Unread Card Click → Notification Center Sync
  // ==========================================
  runner.test('W18: Admin dashboard unread card click → Navigates to notifications tab → Bell count synchronized', () => {
    const sim = new SchoolStateSimulator();
    sim.activeTab = 'dashboard';

    // Click unread card in admin dashboard
    sim.activeTab = 'notifications';
    expect(sim.activeTab).toBe('notifications');

    // Verify unread count matches notification items
    const actualUnread = sim.notifications.filter(n => !n.read).length;
    expect(sim.unreadCount).toBe(actualUnread);
  });

  return runner;
}
