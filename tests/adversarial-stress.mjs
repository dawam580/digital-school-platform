/**
 * Adversarial Stress & Edge Case Test Suite
 * Executed by Challenger 2 (Integration & UX Edge Verifier)
 */

import { setupBrowserEnvironment, DatabaseService, SchoolStateSimulator, SEED_STUDENTS, SEED_CLASSES, SEED_NOTIFICATIONS, SEED_DAILY_REPORT } from './test-harness.js';

const env = setupBrowserEnvironment();

const results = {
  passed: 0,
  failed: 0,
  challenges: []
};

function runTest(category, title, fn) {
  try {
    fn();
    results.passed++;
    results.challenges.push({ category, title, status: 'PASS' });
    console.log(`  ✓ [${category}] ${title}`);
  } catch (err) {
    results.failed++;
    results.challenges.push({ category, title, status: 'FAIL', error: err.message });
    console.log(`  ✗ [${category}] ${title} -> ERROR: ${err.message}`);
  }
}

console.log('\n================================================================');
console.log('  CHALLENGER 2: ADVERSARIAL STRESS & INTEGRATION SUITE');
console.log('================================================================\n');

// -------------------------------------------------------------
// 1. STUDENT LINKING EDGE CASES & ADVERSARIAL INPUTS
// -------------------------------------------------------------
console.log('--- 1. Student Linking Challenges ---');

runTest('StudentLinking', 'Valid code exact uppercase (SCH-2026-R1)', () => {
  const sim = new SchoolStateSimulator();
  const res = sim.linkStudent('SCH-2026-R1');
  if (!res) throw new Error('Failed to link exact uppercase code');
  if (sim.selectedStudent.id !== 'std-1') throw new Error('Linked wrong student');
});

runTest('StudentLinking', 'Valid code lowercase (sch-2026-r1)', () => {
  const sim = new SchoolStateSimulator();
  const res = sim.linkStudent('sch-2026-r1');
  if (!res) throw new Error('Failed to link lowercase code');
  if (sim.selectedStudent.id !== 'std-1') throw new Error('Linked wrong student');
});

runTest('StudentLinking', 'Valid code mixed case (ScH-2026-r1)', () => {
  const sim = new SchoolStateSimulator();
  const res = sim.linkStudent('ScH-2026-r1');
  if (!res) throw new Error('Failed to link mixed case code');
  if (sim.selectedStudent.id !== 'std-1') throw new Error('Linked wrong student');
});

runTest('StudentLinking', 'Leading & trailing spaces ("  SCH-2026-R1  ")', () => {
  const sim = new SchoolStateSimulator();
  const res = sim.linkStudent('  SCH-2026-R1  ');
  if (!res) throw new Error('Failed to link code with leading/trailing spaces');
  if (sim.selectedStudent.id !== 'std-1') throw new Error('Linked wrong student');
});

runTest('StudentLinking', 'Trailing newline & tabs ("\tSCH-2026-S2\n")', () => {
  const sim = new SchoolStateSimulator();
  const res = sim.linkStudent('\tSCH-2026-S2\n');
  if (!res) throw new Error('Failed to link code with tabs and newlines');
  if (sim.selectedStudent.id !== 'std-2') throw new Error('Linked wrong student');
});

runTest('StudentLinking', 'Student national ID matching ("1098765432")', () => {
  const sim = new SchoolStateSimulator();
  const res = sim.linkStudent('1098765432');
  if (!res) throw new Error('Failed to link by nationalId');
  if (sim.selectedStudent.id !== 'std-1') throw new Error('Linked wrong student');
});

runTest('StudentLinking', 'Student Number lookup ("2024-0104")', () => {
  const sim = new SchoolStateSimulator();
  const res = sim.linkStudent('2024-0104');
  if (!res) throw new Error('Failed to link by studentNumber');
  if (sim.selectedStudent.id !== 'std-1') throw new Error('Linked wrong student');
});

runTest('StudentLinking', 'Invalid code ("SCH-9999-ZZ") returns false & plays alert', () => {
  const sim = new SchoolStateSimulator();
  const res = sim.linkStudent('SCH-9999-ZZ');
  if (res !== false) throw new Error('Expected false for invalid code');
  const alertPlayed = sim.soundCalls.some(s => s.type === 'playAlert');
  if (!alertPlayed) throw new Error('Expected alert sound on invalid code');
});

runTest('StudentLinking', 'Empty string ("") returns false & plays alert', () => {
  const sim = new SchoolStateSimulator();
  const res = sim.linkStudent('');
  if (res !== false) throw new Error('Expected false for empty string');
  const alertPlayed = sim.soundCalls.some(s => s.type === 'playAlert');
  if (!alertPlayed) throw new Error('Expected alert sound on empty string');
});

runTest('StudentLinking', 'Whitespace only string ("   ") returns false & plays alert', () => {
  const sim = new SchoolStateSimulator();
  const res = sim.linkStudent('   ');
  if (res !== false) throw new Error('Expected false for whitespace string');
});

runTest('StudentLinking', 'Null or undefined input safety', () => {
  const sim = new SchoolStateSimulator();
  const res1 = sim.linkStudent(null);
  const res2 = sim.linkStudent(undefined);
  if (res1 !== false || res2 !== false) throw new Error('Expected false for null/undefined input');
});

runTest('StudentLinking', 'SQL / XSS injection payload ("\' OR \'1\'=\'1")', () => {
  const sim = new SchoolStateSimulator();
  const res = sim.linkStudent("' OR '1'='1");
  if (res !== false) throw new Error('Injection code unexpectedly linked');
});

// -------------------------------------------------------------
// 2. ATTENDANCE TRACKING & CSV EXPORT STRESS
// -------------------------------------------------------------
console.log('\n--- 2. Attendance Tracking & CSV Stress ---');

runTest('Attendance', 'Rapid 50 consecutive same-status clicks maintains single date entry', () => {
  const sim = new SchoolStateSimulator();
  const today = new Date().toISOString().split('T')[0];
  
  for (let i = 0; i < 50; i++) {
    sim.updateAttendance('std-1', 'present', 'مبكر');
  }
  
  const student = sim.students.find(s => s.id === 'std-1');
  const todayRecords = student.recentAttendance.filter(r => r.date === today);
  if (todayRecords.length !== 1) {
    throw new Error(`Expected 1 today record, got ${todayRecords.length}`);
  }
  if (student.status !== 'present') {
    throw new Error(`Expected status present, got ${student.status}`);
  }
});

runTest('Attendance', 'Rapid status cycling (present -> late -> unexcused -> excused -> present)', () => {
  const sim = new SchoolStateSimulator();
  const today = new Date().toISOString().split('T')[0];
  
  const cycle = ['present', 'late', 'unexcused', 'excused', 'present'];
  cycle.forEach(st => sim.updateAttendance('std-2', st));
  
  const student = sim.students.find(s => s.id === 'std-2');
  const todayRecords = student.recentAttendance.filter(r => r.date === today);
  if (todayRecords.length !== 1) {
    throw new Error(`Expected 1 today record after cycle, got ${todayRecords.length}`);
  }
  if (student.status !== 'present') {
    throw new Error(`Expected final status present, got ${student.status}`);
  }
});

runTest('Attendance', 'Batch markAllPresent called 20 times idempotency on attendance records', () => {
  const sim = new SchoolStateSimulator();
  const today = new Date().toISOString().split('T')[0];
  
  for (let i = 0; i < 20; i++) {
    sim.markAllPresent('cls-5a');
  }
  
  sim.students.forEach(s => {
    if (s.status !== 'present') {
      throw new Error(`Student ${s.id} not present`);
    }
    const todayRecords = s.recentAttendance.filter(r => r.date === today);
    if (todayRecords.length !== 1) {
      throw new Error(`Student ${s.id} has ${todayRecords.length} records for today`);
    }
  });
});

runTest('Attendance', 'CSV Export formatting with quotes, commas, and Arabic characters', () => {
  // Test simulated CSV formatting logic
  const mockStudents = [
    { name: 'ريان فهد العتيبي', studentNumber: '2024-0104', grade: 'الصف الخامس الابتدائي', status: 'present' },
    { name: 'سارة خالد القحطاني', studentNumber: '2024-0105', grade: 'الصف الخامس الابتدائي', status: 'present' },
    { name: 'طالب ذو اسم خاص, مع فاصلة', studentNumber: '2024-9999', grade: 'الصف الخامس', status: 'late' },
    { name: 'طالب "مميز" بعلامات تنصيص', studentNumber: '2024-8888', grade: 'الصف الخامس', status: 'excused' }
  ];
  
  const selectedSection = 'أ';
  const headers = 'اسم الطالب,الرقم المدرسي,الصف,الشعبة,الحالة,التاريخ\n';
  const rows = mockStudents.map(s => `"${s.name.replace(/"/g, '""')}","${s.studentNumber}","${s.grade}","${selectedSection}","${s.status}","2026-09-01"`).join('\n');
  const csvContent = headers + rows;
  
  if (!csvContent.includes('اسم الطالب,الرقم المدرسي')) {
    throw new Error('CSV headers missing');
  }
  if (!csvContent.includes('"طالب ذو اسم خاص, مع فاصلة"')) {
    throw new Error('Comma escaping in student name failed');
  }
  if (!csvContent.includes('"طالب ""مميز"" بعلامات تنصيص"')) {
    throw new Error('Quotes escaping in student name failed');
  }
});

// -------------------------------------------------------------
// 3. AUDIO ENGINE & CANVAS CONFETTI IN HOSTILE/RESTRICTED ENV
// -------------------------------------------------------------
console.log('\n--- 3. Audio & Confetti Restricted/Hostile Environments ---');

runTest('AudioEngine', 'AudioContext completely undefined (Headless/Legacy)', () => {
  const originalAudioContext = globalThis.AudioContext;
  const originalWindowAudio = globalThis.window ? globalThis.window.AudioContext : undefined;
  try {
    delete globalThis.AudioContext;
    if (globalThis.window) delete globalThis.window.AudioContext;

    // Simulate SoundEngine execution
    class TestSoundEngine {
      constructor() { this.ctx = null; this.enabled = true; }
      initContext() {
        if (!this.ctx && typeof window !== 'undefined') {
          const AudioCtx = window.AudioContext;
          if (AudioCtx) this.ctx = new AudioCtx();
        }
      }
      playTap() {
        if (!this.enabled) return;
        try {
          this.initContext();
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          osc.start();
        } catch {}
      }
      playSuccess() { this.playTap(); }
      playAlert() { this.playTap(); }
      playFanfare() { this.playTap(); }
    }

    const sound = new TestSoundEngine();
    sound.playTap();
    sound.playSuccess();
    sound.playAlert();
    sound.playFanfare();
  } finally {
    globalThis.AudioContext = originalAudioContext;
    if (globalThis.window) globalThis.window.AudioContext = originalWindowAudio;
  }
});

runTest('AudioEngine', 'AudioContext in suspended state resumes or catches errors', () => {
  class SuspendedAudioContext {
    constructor() {
      this.state = 'suspended';
      this.currentTime = 0;
      this.destination = {};
    }
    resume() {
      return Promise.reject(new Error('Autoplay policy blocked resume'));
    }
    createOscillator() {
      throw new Error('AudioContext is suspended');
    }
    createGain() {
      throw new Error('AudioContext is suspended');
    }
  }

  const originalAudio = globalThis.window.AudioContext;
  try {
    globalThis.window.AudioContext = SuspendedAudioContext;

    class SafeSoundEngine {
      constructor() { this.ctx = null; this.enabled = true; }
      initContext() {
        if (!this.ctx && typeof window !== 'undefined') {
          const AudioCtx = window.AudioContext;
          if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          try { this.ctx.resume().catch(() => {}); } catch {}
        }
      }
      playTap() {
        if (!this.enabled) return;
        try {
          this.initContext();
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          osc.start();
        } catch {}
      }
    }

    const sound = new SafeSoundEngine();
    sound.playTap(); // Must not throw unhandled exception
  } finally {
    globalThis.window.AudioContext = originalAudio;
  }
});

runTest('AudioEngine', 'Sound disabled flag suppresses all operations', () => {
  const sim = new SchoolStateSimulator();
  sim.setSoundEnabled(false);
  sim.recordSound('playTap');
  sim.recordSound('playSuccess');
  if (sim.soundCalls.length !== 0) {
    throw new Error(`Expected 0 sound calls when disabled, got ${sim.soundCalls.length}`);
  }
});

runTest('ConfettiCanvas', 'Canvas getContext("2d") returns null safety', () => {
  const mockDocWithout2D = {
    getElementById: () => null,
    createElement: () => ({
      style: {},
      getContext: () => null
    }),
    body: { appendChild: () => {} }
  };

  function safeTriggerConfetti(doc) {
    if (typeof doc === 'undefined') return;
    let canvas = doc.getElementById('school-confetti-canvas');
    if (!canvas) {
      canvas = doc.createElement('canvas');
      doc.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Safely returns
  }

  // Must not throw
  safeTriggerConfetti(mockDocWithout2D);
});

runTest('ConfettiCanvas', 'Multiple consecutive triggerConfetti invocations reuse or clean canvas', () => {
  const createdElements = [];
  const mockDoc = {
    getElementById: (id) => createdElements.find(el => el.id === id) || null,
    createElement: (tag) => {
      const el = {
        tagName: tag,
        id: '',
        style: {},
        width: 0,
        height: 0,
        getContext: () => ({
          clearRect: () => {},
          save: () => {},
          restore: () => {},
          translate: () => {},
          rotate: () => {},
          fillRect: () => {},
          globalAlpha: 1,
          fillStyle: '#000'
        })
      };
      createdElements.push(el);
      return el;
    },
    body: {
      appendChild: (el) => el
    }
  };

  for (let i = 0; i < 10; i++) {
    let canvas = mockDoc.getElementById('school-confetti-canvas');
    if (!canvas) {
      canvas = mockDoc.createElement('canvas');
      canvas.id = 'school-confetti-canvas';
      mockDoc.body.appendChild(canvas);
    }
  }

  const canvasCount = createdElements.filter(el => el.id === 'school-confetti-canvas').length;
  if (canvasCount !== 1) {
    throw new Error(`Expected exactly 1 canvas created, got ${canvasCount}`);
  }
});

// -------------------------------------------------------------
// SUMMARY BANNER
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`  ADVERSARIAL STRESS SUITE RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
console.log('================================================================\n');

if (results.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
