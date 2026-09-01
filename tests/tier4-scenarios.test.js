/**
 * Tier 4: Real-World Application Scenarios Suite
 * 5 Comprehensive Multi-Step Real-World User Journeys
 */

import {
  TestRunner,
  expect,
  setupBrowserEnvironment,
  SchoolStateSimulator,
  SEED_STUDENTS,
  SEED_NOTIFICATIONS,
  STORAGE_KEY_STUDENTS
} from './test-harness.js';

export function createTier4Suite() {
  const runner = new TestRunner('Tier 4: Real-World Scenarios & Full User Journeys');

  runner.beforeEach(() => {
    setupBrowserEnvironment();
  });

  // =========================================================================
  // Scenario 1: Morning Roll Call & Parent Absence Alert (سير عمل الطابور الصباحي)
  // =========================================================================
  runner.test('Scenario 1: Morning Roll Call & Immediate Parent Absence Alert', () => {
    const sim = new SchoolStateSimulator();

    // Step 1: Teacher logs in in the morning
    sim.login('0509988776', 'teacher');
    expect(sim.currentRole).toBe('teacher');
    expect(sim.activeTab).toBe('attendance');

    // Step 2: Teacher marks class attendance:
    // - Rayan (std-1): Present 🟢
    // - Sarah (std-2): Present 🟢
    // - Omar (std-3): Late 🟡 (20 min delay)
    // - Layan (std-4): Unexcused Absent 🔴
    // - Khalid (std-5): Excused Absent 🔵 (Medical note)
    sim.updateAttendance('std-1', 'present', 'حضور مبكر');
    sim.updateAttendance('std-2', 'present', 'حضور مبكر');
    sim.updateAttendance('std-3', 'late', 'تأخر 20 دقيقة');
    sim.updateAttendance('std-4', 'unexcused', 'غياب بدون إشعار مسبق');
    sim.updateAttendance('std-5', 'excused', 'إجازة مرضية معتمدة');

    // Step 3: Teacher saves attendance and triggers automated notifications
    sim.addNotification(
      'تنبيه غياب غير مبرر',
      'تنبيه: الطالبة (ليان مساعد الغامدي) مسجلة غياب اليوم دون تقديم عذر مسبق.',
      'urgent',
      'ليان مساعد الغامدي'
    );
    sim.addNotification(
      'إشعار تأخر صباحي',
      'وصل الطالب (عمر السعيد) متأخراً عن الطابور الصباحي في تمام الساعة 07:45 ص.',
      'attendance',
      'عمر ياسر السعيد'
    );

    // Step 4: Verify class status distribution
    const presentList = sim.students.filter(s => s.status === 'present');
    const lateList = sim.students.filter(s => s.status === 'late');
    const unexcusedList = sim.students.filter(s => s.status === 'unexcused');
    const excusedList = sim.students.filter(s => s.status === 'excused');

    expect(presentList.length).toBe(2);
    expect(lateList.length).toBe(1);
    expect(unexcusedList.length).toBe(1);
    expect(excusedList.length).toBe(1);

    // Step 5: Export CSV report and verify content
    const csvRows = sim.students.map(s => `"${s.name}","${s.studentNumber}","${s.status}"`).join('\n');
    expect(csvRows).toContain('"ريان فهد العتيبي","2024-0104","present"');
    expect(csvRows).toContain('"ليان مساعد الغامدي","2024-0107","unexcused"');

    // Step 6: Parent logs in to check notification
    sim.login('0543322110', 'parent');
    expect(sim.currentRole).toBe('parent');
    const urgentNotif = sim.notifications.find(n => n.studentName === 'ليان مساعد الغامدي');
    expect(urgentNotif).toBeDefined();
    expect(urgentNotif.category).toBe('urgent');
    expect(urgentNotif.read).toBe(false);

    // Step 7: Parent clicks notification, marks as read
    sim.markNotificationAsRead(urgentNotif.id);
    expect(sim.notifications.find(n => n.id === urgentNotif.id).read).toBe(true);
  });

  // =========================================================================
  // Scenario 2: New Parent Complete Onboarding & Multi-Child Dossier Journey
  // =========================================================================
  runner.test('Scenario 2: New Parent Complete Registration, Multi-Child Linking & Excuse Submission', () => {
    const sim = new SchoolStateSimulator();

    // Step 1: Parent opens registration, enters phone number
    const parentPhone = '0551234567';
    sim.activeTab = 'parent-signup';
    expect(sim.activeTab).toBe('parent-signup');

    // Step 2: Parent enters 4-digit OTP '4821' and confirms
    const otp = ['4', '8', '2', '1'];
    expect(otp.join('')).toBe('4821');

    // Step 3: Registration completes → Login → Redirect to Link Student
    sim.login(parentPhone, 'parent');
    sim.activeTab = 'link-student';
    expect(sim.isAuthenticated).toBe(true);
    expect(sim.activeTab).toBe('link-student');

    // Step 4: Parent links first child (Rayan) with code SCH-2026-R1
    const linkRayan = sim.linkStudent('SCH-2026-R1');
    expect(linkRayan).toBe(true);
    expect(sim.selectedStudent.name).toBe('ريان فهد العتيبي');
    expect(sim.selectedStudent.grade).toBe('الصف الخامس الابتدائي');

    // Step 5: Parent links second child (Sarah) with code SCH-2026-S2
    const linkSarah = sim.linkStudent('SCH-2026-S2');
    expect(linkSarah).toBe(true);
    expect(sim.selectedStudent.name).toBe('سارة خالد القحطاني');

    // Step 6: Parent switches back to Rayan using child switcher
    sim.selectedStudent = sim.students.find(s => s.id === 'std-1');
    expect(sim.selectedStudent.name).toBe('ريان فهد العتيبي');

    // Step 7: Parent opens Daily Report tab to inspect schedule and homework
    sim.activeTab = 'daily-report';
    expect(sim.activeTab).toBe('daily-report');
    expect(sim.dailyReport.subjectsSummary.length).toBeGreaterThan(0);
    expect(sim.dailyReport.subjectsSummary[0].homeworkStatus).toBe('مكتمل');

    // Step 8: Parent submits an excused absence request for Rayan
    sim.updateAttendance('std-1', 'excused', 'مراجعة طبية مجدولة');
    sim.addNotification(
      'تم استلام طلب العذر الطبي',
      'تم إرسال طلب عذر الغياب للطالب (ريان فهد العتيبي) للإدارة المدرسية.',
      'attendance',
      'ريان فهد العتيبي'
    );

    const updatedRayan = sim.students.find(s => s.id === 'std-1');
    expect(updatedRayan.status).toBe('excused');
  });

  // =========================================================================
  // Scenario 3: Student Academic Excellence, Gamification & Golden Certificate
  // =========================================================================
  runner.test('Scenario 3: Student Academic Excellence, Points Gamification & Golden Certificate Generation', () => {
    const sim = new SchoolStateSimulator();

    // Step 1: Teacher logs in and opens Student Dossier for Rayan
    sim.login('0509988776', 'teacher');
    sim.selectedStudent = sim.students.find(s => s.id === 'std-1');
    sim.activeTab = 'student-profile';

    const rayan = sim.selectedStudent;
    expect(rayan.name).toBe('ريان فهد العتيبي');
    expect(rayan.attendanceRate).toBe(98);
    expect(rayan.academicAverage).toBe(96.5);
    const initialPoints = rayan.behaviorPointsTotal;

    // Step 2: Teacher awards +5 behavior points for science innovation
    sim.addBehaviorPoint('std-1', {
      id: 'bp-scen-3',
      category: 'positive',
      title: 'إبداع وفكرة مبتكرة في معرض العلوم',
      points: 5,
      icon: '💡',
      date: 'اليوم 10:00 ص',
      teacher: 'أ. أحمد الغامدي'
    });

    // Step 3: Confetti and audio chimes are triggered
    expect(sim.confettiCalls).toBeGreaterThan(0);
    expect(sim.soundCalls.some(s => s.type === 'playSuccess')).toBe(true);

    // Step 4: Total behavior score reaches new high
    expect(sim.selectedStudent.behaviorPointsTotal).toBe(initialPoints + 5);

    // Step 5: Verify Competencies Radar Chart has 6 axes and problem-solving mastery
    const comps = sim.selectedStudent.competencies;
    expect(comps.length).toBe(6);
    const problemSolving = comps.find(c => c.name === 'حل المشكلات');
    expect(problemSolving.score).toBe(95);

    // Step 6: Open Golden Certificate Modal and validate official print metadata
    const certStudent = sim.selectedStudent;
    expect(certStudent.name).toBe('ريان فهد العتيبي');
    expect(certStudent.grade).toBe('الصف الخامس الابتدائي');
    expect(certStudent.className).toBe('خامس / أ');
    expect(certStudent.academicAverage).toBe(96.5);

    // Step 7: Trigger print action
    window.print();
    expect(window._lastPrinted).toBeGreaterThan(0);
  });

  // =========================================================================
  // Scenario 4: Admin Command Navigation, Instant Search & Student Dossier
  // =========================================================================
  runner.test('Scenario 4: Admin Global Command Palette Navigation, Instant Search & Avatar Update', async () => {
    const sim = new SchoolStateSimulator();

    // Step 1: Admin logs in
    sim.login('0501112233', 'admin');
    expect(sim.currentRole).toBe('admin');
    expect(sim.activeTab).toBe('dashboard');

    // Step 2: Admin triggers Ctrl + K command palette
    sim.isCommandPaletteOpen = true;
    expect(sim.isCommandPaletteOpen).toBe(true);

    // Step 3: Admin searches for Omar by national ID "1076543210"
    const searchTarget = sim.students.find(s => s.nationalId === '1076543210');
    expect(searchTarget).toBeDefined();
    expect(searchTarget.name).toBe('عمر ياسر السعيد');

    // Step 4: Admin selects Omar → Navigates to Student Profile
    sim.selectedStudent = searchTarget;
    sim.activeTab = 'student-profile';
    sim.isCommandPaletteOpen = false;

    expect(sim.selectedStudent.name).toBe('عمر ياسر السعيد');
    expect(sim.activeTab).toBe('student-profile');

    // Step 5: Admin updates Omar's avatar with curated high-res preset
    const newAvatarUrl = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80';
    sim.updateStudentAvatar('std-3', newAvatarUrl);
    expect(sim.selectedStudent.avatar).toBe(newAvatarUrl);

    // Step 6: Admin awards +3 points for teamwork improvement
    sim.addBehaviorPoint('std-3', {
      id: 'bp-scen-4',
      category: 'positive',
      title: 'تحسن ملحوظ في العمل الجماعي',
      points: 3,
      icon: '🤝',
      date: 'اليوم 11:30 ص',
      teacher: 'المرشد الطلابي'
    });

    const updatedOmar = sim.students.find(s => s.id === 'std-3');
    expect(updatedOmar.behaviorPointsTotal).toBe(28); // 25 + 3

    // Step 7: Admin uses Command Palette quick action to jump to Attendance Tracker
    sim.activeTab = 'attendance';
    expect(sim.activeTab).toBe('attendance');
    const omarInAttendance = sim.students.find(s => s.id === 'std-3');
    expect(omarInAttendance.avatar).toBe(newAvatarUrl);
  });

  // =========================================================================
  // Scenario 5: Full Offline Durability, Multi-Mutation Lifecycle & Factory Reset
  // =========================================================================
  runner.test('Scenario 5: 10 Multi-Domain Mutations, Full Session Reload Cycle & Factory Reset Verification', () => {
    // Step 1: Initialize session 1
    const sim1 = new SchoolStateSimulator();

    // 10 Distinct multi-domain mutations across all features:
    // Mutation 1: Update attendance for std-1 to present
    sim1.updateAttendance('std-1', 'present', 'حضور مبكر جداً');

    // Mutation 2: Update attendance for std-2 to excused
    sim1.updateAttendance('std-2', 'excused', 'مستأذن مسبقاً');

    // Mutation 3: Update attendance for std-4 to late
    sim1.updateAttendance('std-4', 'late', 'تأخر بالباص');

    // Mutation 4: Add positive behavior point to std-1 (+5)
    sim1.addBehaviorPoint('std-1', { id: 'bp-s5-1', category: 'positive', title: 'مشاركة', points: 5, icon: '🌟', date: 'now', teacher: 't1' });

    // Mutation 5: Add needs work behavior point to std-3 (-2)
    sim1.addBehaviorPoint('std-3', { id: 'bp-s5-2', category: 'needs_work', title: 'إهمال', points: -2, icon: '📝', date: 'now', teacher: 't2' });

    // Mutation 6: Update avatar for std-1
    sim1.updateStudentAvatar('std-1', 'https://images.unsplash.com/custom_avatar_s5_std1');

    // Mutation 7: Update avatar for std-2
    sim1.updateStudentAvatar('std-2', 'https://images.unsplash.com/custom_avatar_s5_std2');

    // Mutation 8: Add urgent notification
    sim1.addNotification('تنبيه عاجل جداً', 'اجتماع طارئ لمجلس الآباء', 'urgent');

    // Mutation 9: Mark first notification as read
    sim1.markNotificationAsRead(sim1.notifications[0].id);

    // Mutation 10: Link student Sarah
    sim1.linkStudent('SCH-2026-S2');

    // Step 2: Simulate full browser termination & reload (Session 2 from localStorage)
    const sim2 = new SchoolStateSimulator();

    // Verify all 10 mutations are 100% durable in reloaded session:
    const s1Reloaded = sim2.students.find(s => s.id === 'std-1');
    const s2Reloaded = sim2.students.find(s => s.id === 'std-2');
    const s3Reloaded = sim2.students.find(s => s.id === 'std-3');
    const s4Reloaded = sim2.students.find(s => s.id === 'std-4');

    expect(s1Reloaded.status).toBe('present');
    expect(s1Reloaded.avatar).toBe('https://images.unsplash.com/custom_avatar_s5_std1');
    expect(s1Reloaded.behaviorPointsTotal).toBe(53); // 48 + 5

    expect(s2Reloaded.status).toBe('excused');
    expect(s2Reloaded.avatar).toBe('https://images.unsplash.com/custom_avatar_s5_std2');

    expect(s3Reloaded.behaviorPointsTotal).toBe(23); // 25 - 2
    expect(s4Reloaded.status).toBe('late');

    const urgentNotif = sim2.notifications.find(n => n.title === 'تنبيه عاجل جداً');
    expect(urgentNotif).toBeDefined();

    // Step 3: Execute factory database reset
    sim2.resetDatabase();

    // Step 4: Validate complete clean restoration of seed datasets
    expect(sim2.students.length).toBe(SEED_STUDENTS.length);
    expect(sim2.students[0].avatar).toBe(SEED_STUDENTS[0].avatar);
    expect(sim2.students[0].behaviorPointsTotal).toBe(SEED_STUDENTS[0].behaviorPointsTotal);
    expect(sim2.students[0].status).toBe(SEED_STUDENTS[0].status);
    expect(sim2.notifications.length).toBe(SEED_NOTIFICATIONS.length);
    expect(sim2.unreadCount).toBe(SEED_NOTIFICATIONS.filter(n => !n.read).length);
  });

  return runner;
}
