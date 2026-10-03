/**
 * ============================================================================
 * مزامنة تطبيق ولي الأمر — جهة حاسوب المدرسة
 * ----------------------------------------------------------------------------
 * يرفع لكل طالب (له بطاقة ولي أمر) ملخصه مشفّراً ببطاقته، ويسحب رسائل أولياء
 * الأمور المشفّرة. المصادقة بمفتاح ترخيص المدرسة. ما لم يتغير لا يُعاد رفعه.
 * ============================================================================
 */
import { deriveParentKeys, sealJson, openJson, sha256Hex, ParentKeys, normalizeLoginId, normalizeAccessCode } from '../../parent-sync/crypto';
import { ParentView, ParentInboxMessage, viewFingerprintSource, validateInboxMessage } from '../../parent-sync/protocol';
import { PARENT_RELAY_URL } from '../../config/vendor';

const KEY_CONFIG = 'madrasa_parent_sync_config_v1';
const KEY_KEYS = 'madrasa_parent_sync_keys_v1';
const KEY_HASHES = 'madrasa_parent_sync_hashes_v1';
const KEY_CURSOR = 'madrasa_parent_sync_cursor_v1';
const KEY_APPLIED = 'madrasa_parent_inbox_applied_v1';
const BATCH = 40;

export interface ParentSyncConfig {
  enabled: boolean;
  url: string;
}

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const writeJson = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

export function getParentSyncConfig(): ParentSyncConfig {
  const c = readJson<Partial<ParentSyncConfig>>(KEY_CONFIG, {});
  return { enabled: !!c.enabled, url: (c.url ?? PARENT_RELAY_URL ?? '').trim() };
}

export function setParentSyncConfig(c: ParentSyncConfig): void {
  writeJson(KEY_CONFIG, { enabled: c.enabled, url: c.url.trim() });
}

/** عنوان صالح: https، أو http على الجهاز المحلي للتجربة فقط */
export function normalizeRelayUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
    if (u.protocol !== 'https:' && !(u.protocol === 'http:' && local)) return null;
    return u.origin + u.pathname.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

/** رابط بطاقة ولي الأمر (الباركود): يفتح التطبيق ويضيف الابن مباشرة — الرمز في الجزء بعد # فلا يصل لسجلات الخادم */
export function parentAppCardLink(loginId: string, code: string): string | null {
  const base = normalizeRelayUrl(getParentSyncConfig().url);
  if (!base) return null;
  return `${base}/#id=${encodeURIComponent(normalizeLoginId(loginId))}&code=${encodeURIComponent(normalizeAccessCode(code))}`;
}

async function request<T>(base: string, path: string, license: string, init?: { method?: string; body?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method: init?.method || 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `License ${license}` },
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new Error('تعذر الاتصال بخادم تطبيق أولياء الأمور — تحقق من الإنترنت');
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error || `خطأ من الخادم (${res.status})`);
  return json as T;
}

// ─── مفاتيح البطاقات (PBKDF2 مكلف: تُحسب مرة واحدة لكل بطاقة وتُحفظ) ───
const keyCache: Record<string, ParentKeys> = readJson(KEY_KEYS, {});
async function keysFor(loginId: string, code: string): Promise<ParentKeys> {
  const id = `${normalizeLoginId(loginId)}|${normalizeAccessCode(code)}`;
  if (!keyCache[id]) keyCache[id] = await deriveParentKeys(loginId, code);
  return keyCache[id];
}

export interface PublishEntry {
  studentId: string;
  loginId: string;
  code: string;
  view: ParentView;
}

export interface PublishResult {
  total: number;
  uploaded: number;
  conflicts: number;
  /** معرّف البحث ← (المفاتيح، الطالب) لفك رسائل الصندوق */
  lidMap: Map<string, { keys: ParentKeys; studentId: string }>;
}

export async function publishParentViews(entries: PublishEntry[], license: string, url: string): Promise<PublishResult> {
  const base = normalizeRelayUrl(url);
  if (!base) throw new Error('عنوان الخادم غير صالح (يجب أن يبدأ بـ https://)');
  const hashes: Record<string, string> = readJson(KEY_HASHES, {});
  const lidMap = new Map<string, { keys: ParentKeys; studentId: string }>();
  const pending: { lid: string; blob: string; hash: string }[] = [];

  for (const e of entries) {
    const keys = await keysFor(e.loginId, e.code);
    lidMap.set(keys.lid, { keys, studentId: e.studentId });
    const hash = await sha256Hex(viewFingerprintSource(e.view));
    if (hashes[keys.lid] === hash) continue;
    pending.push({ lid: keys.lid, blob: await sealJson(keys, e.view), hash });
  }

  // البطاقات الملغاة (رمز جديد/طالب محذوف) تُنسى محلياً أيضاً
  const liveIds = new Set(entries.map(e => `${normalizeLoginId(e.loginId)}|${normalizeAccessCode(e.code)}`));
  for (const k of Object.keys(keyCache)) if (!liveIds.has(k)) delete keyCache[k];
  writeJson(KEY_KEYS, keyCache);

  let uploaded = 0;
  let conflicts = 0;
  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH);
    const r = await request<{ conflicts: string[] }>(base, '/v1/publish', license, {
      method: 'POST',
      body: { items: batch.map(({ lid, blob }) => ({ lid, blob })) },
    });
    const bad = new Set(r.conflicts || []);
    conflicts += bad.size;
    for (const it of batch) {
      if (bad.has(it.lid)) continue;
      hashes[it.lid] = it.hash;
      uploaded += 1;
    }
    writeJson(KEY_HASHES, hashes);
  }

  const prune = await request<{ missing: string[] }>(base, '/v1/prune', license, { method: 'POST', body: { lids: [...lidMap.keys()] } });
  const nextHashes: Record<string, string> = {};
  for (const lid of lidMap.keys()) if (hashes[lid] && !(prune.missing || []).includes(lid)) nextHashes[lid] = hashes[lid];
  writeJson(KEY_HASHES, nextHashes);

  return { total: entries.length, uploaded, conflicts, lidMap };
}

export interface PulledInbox {
  messages: ParentInboxMessage[];
  /** يُستدعى بعد تطبيق الرسائل: يؤكد للخادم حذفها */
  ack: () => Promise<void>;
}

export async function pullParentInbox(
  lidMap: Map<string, { keys: ParentKeys; studentId: string }>,
  license: string,
  url: string
): Promise<PulledInbox> {
  const base = normalizeRelayUrl(url);
  if (!base) throw new Error('عنوان الخادم غير صالح');
  const cursor = Number(readJson<number>(KEY_CURSOR, 0)) || 0;
  const applied: string[] = readJson(KEY_APPLIED, []);
  const seen = new Set(applied);
  const r = await request<{ messages: { id: number; lid: string; blob: string }[] }>(base, `/v1/inbox?after=${cursor}`, license);
  const out: ParentInboxMessage[] = [];
  let maxId = cursor;
  for (const m of r.messages || []) {
    maxId = Math.max(maxId, m.id);
    const owner = lidMap.get(m.lid);
    if (!owner) continue;
    try {
      const msg = validateInboxMessage(await openJson(owner.keys, m.blob), owner.studentId);
      // الخادم قد يعيد إرسال رسالة قديمة: معرّف الرسالة داخل النص المشفّر يمنع التكرار
      if (msg && !seen.has(msg.id)) {
        out.push(msg);
        seen.add(msg.id);
      }
    } catch {
      // نص لا يُفك بمفتاح البطاقة: يُهمل
    }
  }
  return {
    messages: out,
    ack: async () => {
      writeJson(KEY_APPLIED, [...seen].slice(-3000));
      if (maxId > cursor) {
        await request(base, '/v1/inbox-ack', license, { method: 'POST', body: { upTo: maxId } });
        writeJson(KEY_CURSOR, maxId);
      }
    },
  };
}

export async function fetchRelaySchoolStatus(license: string, url: string) {
  const base = normalizeRelayUrl(url);
  if (!base) throw new Error('عنوان الخادم غير صالح');
  return request<{ schoolName: string; views: number; pendingInbox: number; expiresAt: string }>(base, '/v1/school-status', license);
}
