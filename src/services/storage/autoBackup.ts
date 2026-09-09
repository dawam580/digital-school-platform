/**
 * النسخ الاحتياطي التلقائي الدوّار (Auto-Backup).
 * لقطة يومية صامتة في فتحتين دوّارتين + فتحة أمان ما قبل الاستعادة.
 * مصمم لسقف localStorage (~5MB): فتحتان فقط، وأي فشل مساحة يُبتلع بصمت
 * (النسخة اليدوية الأسبوعية للملف تبقى هي الأرشيف الحقيقي).
 */

export interface AutoBackupMeta {
  index: number;
  takenAt: string;
  students: number;
  teachers: number;
  classes: number;
}

export interface FullSnapshot {
  schoolProfile: unknown;
  students: unknown[];
  teachers: unknown[];
  classes: unknown[];
  notifications: unknown[];
  conversations: unknown[];
  schedule: unknown[];
  takenAt: string;
}

const PREFIX = 'madrasa_autobackup_';
const SLOTS = 2;
const SAFETY_KEY = 'madrasa_preimport_safety';
const LAST_KEY = 'madrasa_autobackup_last';
const INTERVAL_MS = 20 * 60 * 60 * 1000; // ~20 ساعة

function safeGet(key: string): FullSnapshot | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.students)) return null;
    return parsed as FullSnapshot;
  } catch {
    return null;
  }
}

function safeSet(key: string, snap: FullSnapshot): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(snap));
    return true;
  } catch {
    return false; // امتلاء المساحة: تُهمل اللقطة بصمت ولا تكسر الإقلاع
  }
}

export const autoBackupService = {
  /** هل حان موعد لقطة جديدة؟ */
  isDue(): boolean {
    try {
      const last = Number(localStorage.getItem(LAST_KEY) || 0);
      return Date.now() - last > INTERVAL_MS;
    } catch {
      return false;
    }
  },

  /** أخذ لقطة دوّارة (تُستدعى عند الإقلاع إن حان الموعد) */
  take(snap: Omit<FullSnapshot, 'takenAt'>): boolean {
    const full: FullSnapshot = { ...snap, takenAt: new Date().toISOString() };
    try {
      const cursor = Number(localStorage.getItem(`${PREFIX}cursor`) || 0) % SLOTS;
      if (!safeSet(`${PREFIX}${cursor}`, full)) return false;
      localStorage.setItem(`${PREFIX}cursor`, String((cursor + 1) % SLOTS));
      localStorage.setItem(LAST_KEY, String(Date.now()));
      return true;
    } catch {
      return false;
    }
  },

  /** سرد اللقطات المتاحة للاستعادة */
  list(): AutoBackupMeta[] {
    const out: AutoBackupMeta[] = [];
    for (let i = 0; i < SLOTS; i++) {
      const s = safeGet(`${PREFIX}${i}`);
      if (s) {
        out.push({
          index: i,
          takenAt: s.takenAt,
          students: s.students.length,
          teachers: (s.teachers as unknown[]).length,
          classes: (s.classes as unknown[]).length,
        });
      }
    }
    const safety = safeGet(SAFETY_KEY);
    if (safety) {
      out.push({
        index: 99,
        takenAt: safety.takenAt,
        students: safety.students.length,
        teachers: (safety.teachers as unknown[]).length,
        classes: (safety.classes as unknown[]).length,
      });
    }
    return out.sort((a, b) => (a.takenAt < b.takenAt ? 1 : -1));
  },

  /** جلب لقطة (99 = لقطة الأمان ما قبل آخر استعادة/استيراد) */
  get(index: number): FullSnapshot | null {
    return safeGet(index === 99 ? SAFETY_KEY : `${PREFIX}${index}`);
  },

  /** حفظ الحالة الحالية في فتحة الأمان قبل أي استعادة/استيراد (شبكة الرجوع) */
  stashSafety(snap: Omit<FullSnapshot, 'takenAt'>): void {
    safeSet(SAFETY_KEY, { ...snap, takenAt: new Date().toISOString() });
  },
};
