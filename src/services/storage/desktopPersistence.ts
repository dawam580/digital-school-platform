/**
 * الحفظ الدائم على القرص (نسخة ويندوز فقط).
 * ----------------------------------------------------------------------------
 * كل تعديل على مفاتيح المنظومة (madrasa_*) في localStorage يُنسخ تلقائياً إلى
 * ملف على القرص عبر Electron، مع نسخة احتياطية يومية في مجلد المستندات.
 * إذا ضاعت بيانات المتصفح (مسح الكاش، إعادة تثبيت، نقل لجهاز جديد مع نسخ الملف)
 * تُستعاد تلقائياً عند الإقلاع.
 * في نسخة الويب لا يفعل شيئاً.
 */

const PREFIX = 'madrasa_';
// لقطات النسخ الداخلية في المتصفح لا داعي لتكرارها على القرص
const EXCLUDED = [/^madrasa_autobackup_/, /^madrasa_preimport_safety$/];
const DEBOUNCE_MS = 1500;

const tracked = (key: string) => key.startsWith(PREFIX) && !EXCLUDED.some(r => r.test(key));

function snapshotLocal(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && tracked(k)) out[k] = localStorage.getItem(k) ?? '';
  }
  return out;
}

let started = false;

export function initDesktopPersistence(): void {
  if (started || typeof window === 'undefined') return;
  const api = window.electronAPI;
  if (!api?.loadPersistedStore || !api.persistStore) return;
  started = true;

  // 1. استعادة تلقائية إن كانت بيانات المتصفح فارغة والملف موجود
  try {
    const stored = api.loadPersistedStore() || {};
    const localHasData = Object.keys(snapshotLocal()).some(k => k.startsWith('madrasa_db_') || k === 'madrasa_school_profile_v1');
    const storedHasData = Object.keys(stored).some(k => k.startsWith('madrasa_db_') || k === 'madrasa_school_profile_v1');
    if (!localHasData && storedHasData) {
      for (const [k, v] of Object.entries(stored)) {
        try {
          if (k === 'madrasa_school_profile_v1' && (v.includes('الأندلس') || v.includes('Andalus'))) {
            continue;
          }
          localStorage.setItem(k, v);
        } catch {}
      }
    }
  } catch {}

  // 2. مزامنة أولى كاملة (تنشئ الملف عند أول تشغيل بعد التحديث)
  let pending: Record<string, string | null> = snapshotLocal();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    timer = null;
    if (!Object.keys(pending).length) return;
    const batch = pending;
    pending = {};
    api.persistStore!(batch).catch(() => {
      pending = { ...batch, ...pending }; // إعادة المحاولة مع التغيير التالي
    });
  };
  const schedule = () => {
    if (!timer) timer = setTimeout(flush, DEBOUNCE_MS);
  };
  schedule();

  // 3. التقاط كل تعديل على localStorage
  const proto = Storage.prototype;
  const origSet = proto.setItem;
  const origRemove = proto.removeItem;
  const origClear = proto.clear;

  proto.setItem = function (this: Storage, key: string, value: string) {
    origSet.call(this, key, value);
    if (this === window.localStorage && tracked(key)) {
      pending[key] = String(value);
      schedule();
    }
  };
  proto.removeItem = function (this: Storage, key: string) {
    origRemove.call(this, key);
    if (this === window.localStorage && tracked(key)) {
      pending[key] = null;
      schedule();
    }
  };
  proto.clear = function (this: Storage) {
    if (this === window.localStorage) {
      for (const k of Object.keys(snapshotLocal())) pending[k] = null;
      schedule();
    }
    origClear.call(this);
  };

  // 4. لا نفقد آخر تعديل عند إغلاق البرنامج
  window.addEventListener('beforeunload', () => {
    if (timer) clearTimeout(timer);
    timer = null;
    if (Object.keys(pending).length && api.persistStoreSync) {
      try { api.persistStoreSync(pending); pending = {}; } catch {}
    }
  });
}
