/**
 * ============================================================================
 * خزنة المدارس (School Vault) — عزل بيانات أكثر من مدرسة على جهاز واحد
 * ----------------------------------------------------------------------------
 * المدرسة النشطة تعمل من مفاتيحها المعتادة في localStorage + قاعدة IndexedDB.
 * عند التبديل أو إنشاء مدرسة جديدة: تُحفظ لقطة كاملة للمدرسة الحالية (كل مفاتيح
 * المدرسة + كل مخازن IndexedDB) في الخزنة، تُمسح مساحة العمل، ثم تُستعاد لقطة
 * المدرسة الهدف كاملة، ويُعاد تحميل المنظومة لتقرأ كل الشاشات من الصفر.
 *
 * الخزنة في قاعدة IndexedDB مستقلة (بلا حد 5MB الخاص بـ localStorage) فتتسع
 * لعشرات المدارس، وفي نسخة ويندوز تُنسخ كل لقطة أيضاً لملف القرص الدائم.
 *
 * كل مفتاح madrasa_* يُعامل كبيان مدرسة ما لم يكن في قائمة مفاتيح الجهاز أدناه
 * (الجلسة، تفضيلات العرض، أختام التجربة، سجل تراخيص المورّد...). الأصل أن
 * المفتاح الجديد معزول تلقائياً — الخطأ الآمن هو العزل لا التسريب.
 * ============================================================================
 */

const PREFIX = 'madrasa_';
const SCHOOL_DB_NAME = 'MadrasaDigitalSchoolDB_v4';
const VAULT_DB_NAME = 'MadrasaSchoolVault_v1';
const VAULT_STORE = 'schools';

/** مفاتيح على مستوى الجهاز — لا تُنقل مع المدرسة */
const DEVICE_KEYS = new Set<string>([
  'madrasa_saved_schools_v1',
  // الجلسة الحالية (يبقى المدير داخلاً بعد التبديل)
  'madrasa_session_active',
  'madrasa_auth_role',
  'madrasa_active_role',
  'madrasa_active_tab',
  'madrasa_active_teacher_id',
  'madrasa_parent_child_id',
  'madrasa_parent_linked_ids',
  'madrasa_superadmin_unlocked',
  'madrasa_secure_jwt_session_v1',
  'madrasa_offline_credentials_cache_v1',
  // المالك/المورّد والجهاز
  'madrasa_superadmin_pin_sec',
  'madrasa_developer_mode',
  'madrasa_admin_schools_registry_v1',
  'madrasa_renewal_requests_v1',
  'madrasa_license_attempt_lock_v1',
  'madrasa_machine_hwid_v2',
  'madrasa_ai_credentials_v2',
  // أختام التجربة المجانية ومضاد إرجاع الساعة (على مستوى الجهاز عمداً)
  'madrasa_device_trial_v1',
  'madrasa_device_trial_seal_v1',
  'madrasa_trial_used_v1',
  'madrasa_trial_ext_v1',
  'madrasa_trial_start_timestamp_v2',
  'madrasa_trial_seal_a_v2',
  'madrasa_trial_seal_b_v2',
  'madrasa_trial_start_ms',
  'madrasa_trial_start_mirror_a',
  'madrasa_trial_start_mirror_b',
  'madrasa_clock_guard_last_seen_v2',
  'madrasa_last_seen_ts',
  // تفضيلات العرض
  'madrasa_dark_mode',
  'madrasa_large_font_mode',
]);

const DEVICE_KEY_PATTERNS = [/^madrasa_ui_collapsed_/, /^madrasa_school_data_/, /^madrasa_vault_/];

export function isSchoolScopedKey(key: string): boolean {
  if (!key.startsWith(PREFIX)) return false;
  if (DEVICE_KEYS.has(key)) return false;
  return !DEVICE_KEY_PATTERNS.some(r => r.test(key));
}

export interface SchoolSnapshot {
  schoolId: string;
  savedAt: string;
  local: Record<string, string>;
  idb: Record<string, unknown[]>;
}

// ── IndexedDB helpers ─────────────────────────────────────────────────────

function openDb(name: string, upgrade?: (db: IDBDatabase) => void): Promise<IDBDatabase | null> {
  return new Promise(resolve => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = upgrade ? indexedDB.open(name, 1) : indexedDB.open(name);
      if (upgrade) req.onupgradeneeded = () => upgrade(req.result);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function txDone(tx: IDBTransaction): Promise<boolean> {
  return new Promise(resolve => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
    tx.onabort = () => resolve(false);
  });
}

async function readSchoolIdb(): Promise<Record<string, unknown[]>> {
  const out: Record<string, unknown[]> = {};
  const db = await openDb(SCHOOL_DB_NAME);
  if (!db) return out;
  try {
    const names = Array.from(db.objectStoreNames);
    if (!names.length) return out;
    const tx = db.transaction(names, 'readonly');
    await Promise.all(names.map(name => new Promise<void>(resolve => {
      const req = tx.objectStore(name).getAll();
      req.onsuccess = () => { out[name] = req.result || []; resolve(); };
      req.onerror = () => resolve();
    })));
  } finally {
    db.close();
  }
  return out;
}

async function writeSchoolIdb(data: Record<string, unknown[]>): Promise<void> {
  const db = await openDb(SCHOOL_DB_NAME);
  if (!db) return;
  try {
    const names = Array.from(db.objectStoreNames);
    if (!names.length) return;
    const tx = db.transaction(names, 'readwrite');
    for (const name of names) {
      const store = tx.objectStore(name);
      store.clear();
      const rows = data[name] || [];
      for (const row of rows) {
        try {
          // مخازن autoIncrement بلا مفتاح ضمني تقبل put(row) — والمفتاح المضمّن يُحترم
          store.put(row as never);
        } catch {}
      }
    }
    await txDone(tx);
  } finally {
    db.close();
  }
}

async function vaultDb(): Promise<IDBDatabase | null> {
  return openDb(VAULT_DB_NAME, db => {
    if (!db.objectStoreNames.contains(VAULT_STORE)) db.createObjectStore(VAULT_STORE, { keyPath: 'schoolId' });
  });
}

// ── Snapshot / restore of the active workspace ───────────────────────────

export function readSchoolLocal(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && isSchoolScopedKey(k)) out[k] = localStorage.getItem(k) ?? '';
  }
  return out;
}

export function clearSchoolLocal(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && isSchoolScopedKey(k)) keys.push(k);
  }
  keys.forEach(k => { try { localStorage.removeItem(k); } catch {} });
}

export async function captureActiveSchool(schoolId: string): Promise<SchoolSnapshot> {
  return {
    schoolId,
    savedAt: new Date().toISOString(),
    local: readSchoolLocal(),
    idb: await readSchoolIdb(),
  };
}

async function putSnapshot(snapshot: SchoolSnapshot): Promise<boolean> {
  let ok = false;
  const db = await vaultDb();
  if (db) {
    try {
      const tx = db.transaction(VAULT_STORE, 'readwrite');
      tx.objectStore(VAULT_STORE).put(snapshot);
      ok = await txDone(tx);
    } finally {
      db.close();
    }
  }
  // نسخة ويندوز: ملف مستقل على القرص لكل مدرسة (ينجو من مسح بيانات المتصفح)
  try {
    const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
    if (api?.vaultSave) {
      ok = (await api.vaultSave(snapshot.schoolId, JSON.stringify(snapshot))) || ok;
    }
  } catch {}
  return ok;
}

export async function getSnapshot(schoolId: string): Promise<SchoolSnapshot | null> {
  const db = await vaultDb();
  if (db) {
    try {
      const found = await new Promise<SchoolSnapshot | null>(resolve => {
        const req = db.transaction(VAULT_STORE, 'readonly').objectStore(VAULT_STORE).get(schoolId);
        req.onsuccess = () => resolve((req.result as SchoolSnapshot) || null);
        req.onerror = () => resolve(null);
      });
      if (found) return found;
    } finally {
      db.close();
    }
  }
  try {
    const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
    const raw = api?.vaultLoad?.(schoolId);
    if (raw) return JSON.parse(raw) as SchoolSnapshot;
  } catch {}
  return null;
}

export async function deleteSnapshot(schoolId: string): Promise<void> {
  const db = await vaultDb();
  if (db) {
    try {
      const tx = db.transaction(VAULT_STORE, 'readwrite');
      tx.objectStore(VAULT_STORE).delete(schoolId);
      await txDone(tx);
    } finally {
      db.close();
    }
  }
  try {
    const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
    if (api?.vaultDelete) await api.vaultDelete(schoolId);
  } catch {}
}

/** يملأ مساحة العمل بلقطة مدرسة (أو يتركها فارغة لمدرسة جديدة) */
export async function loadIntoWorkspace(snapshot: SchoolSnapshot | null): Promise<void> {
  clearSchoolLocal();
  if (snapshot) {
    for (const [k, v] of Object.entries(snapshot.local)) {
      if (isSchoolScopedKey(k)) {
        try { localStorage.setItem(k, v); } catch {}
      }
    }
  }
  await writeSchoolIdb(snapshot?.idb || {});
}

/**
 * يحفظ المدرسة الحالية في الخزنة ثم يفرغ مساحة العمل (أو يملؤها بالمدرسة الهدف).
 * يُرجع false إذا تعذر حفظ لقطة المدرسة الحالية — عندها لا يُمس شيء.
 */
export async function swapActiveSchool(
  currentSchoolId: string,
  targetSchoolId: string | null,
  options: { saveCurrent?: boolean } = {}
): Promise<boolean> {
  const { saveCurrent = true } = options;
  if (saveCurrent) {
    const snap = await captureActiveSchool(currentSchoolId);
    const saved = await putSnapshot(snap);
    if (!saved) return false;
  }
  let target: SchoolSnapshot | null = null;
  if (targetSchoolId) {
    target = await getSnapshot(targetSchoolId);
    if (!target) target = legacySnapshot(targetSchoolId);
  }
  await loadIntoWorkspace(target);
  return true;
}

/**
 * توافق خلفي: الإصدارات السابقة حفظت لقطة جزئية (طلاب/فصول/معلمين) في
 * madrasa_school_data_<id>. تُحوَّل إلى لقطة بالمفاتيح الحالية عند أول تبديل.
 */
function legacySnapshot(schoolId: string): SchoolSnapshot | null {
  try {
    const raw = localStorage.getItem(`madrasa_school_data_${schoolId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const local: Record<string, string> = {};
    if (Array.isArray(parsed.students)) local['madrasa_db_students_v3'] = JSON.stringify(parsed.students);
    if (Array.isArray(parsed.classes)) local['madrasa_db_classes_v3'] = JSON.stringify(parsed.classes);
    if (Array.isArray(parsed.teachers)) local['madrasa_db_teachers_v4'] = JSON.stringify(parsed.teachers);
    if (Array.isArray(parsed.financialTransactions)) local['madrasa_finance_tx'] = JSON.stringify(parsed.financialTransactions);
    if (Array.isArray(parsed.tuitionFees)) local['madrasa_tuition_fees'] = JSON.stringify(parsed.tuitionFees);
    return { schoolId, savedAt: new Date().toISOString(), local, idb: {} };
  } catch {
    return null;
  }
}

/** رسالة تُعرض بعد إعادة التحميل (sessionStorage — لا تُنقل مع المدرسة) */
export const SWITCH_NOTICE_KEY = 'madrasa_switch_notice';

export function setSwitchNotice(title: string, message: string): void {
  try { sessionStorage.setItem(SWITCH_NOTICE_KEY, JSON.stringify({ title, message })); } catch {}
}

export function takeSwitchNotice(): { title: string; message: string } | null {
  try {
    const raw = sessionStorage.getItem(SWITCH_NOTICE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(SWITCH_NOTICE_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
