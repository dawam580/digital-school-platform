/**
 * ============================================================================
 * تشفير بيانات تطبيق ولي الأمر (طرف لطرف) — يعمل في المتصفح وفي Node 18+
 * ----------------------------------------------------------------------------
 * من بطاقة ولي الأمر (رقم الدخول + الرمز السري) يُشتق بـ PBKDF2:
 *   - مفتاح AES-GCM (256 بت) يشفّر ملخص الطالب والرسائل.
 *   - معرّف بحث (lid) = SHA-256 لنصف آخر من المادة المشتقة.
 * خادم المورّد يخزن (lid ← نص مشفّر) فقط: لا يرى اسماً ولا درجة ولا رمزاً،
 * ولا يستطيع حساب lid أو المفتاح دون البطاقة نفسها.
 * ============================================================================
 */

export const PARENT_KDF_ITERATIONS = 100_000;
const SALT_PREFIX = 'madrasa-parent-v1|';
const BLOB_PREFIX = 'v1.';
const enc = new TextEncoder();
const dec = new TextDecoder();

const subtle = (): SubtleCrypto => {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (!c?.subtle) throw new Error('التشفير غير متاح: افتح التطبيق عبر https');
  return c.subtle;
};

export function toB64u(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromB64u(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const toHex = (bytes: Uint8Array) => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');

/** توحيد رقم الدخول كما يكتبه ولي الأمر: أرقام عربية ← لاتينية، بلا مسافات، أحرف كبيرة */
export function normalizeLoginId(id: string): string {
  return String(id || '')
    .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/\s+/g, '')
    .toUpperCase();
}

export function normalizeAccessCode(code: string): string {
  return String(code || '').replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/\D/g, '');
}

export interface ParentKeys {
  /** معرّف البحث على الخادم (64 خانة hex) */
  lid: string;
  /** مفتاح AES الخام (base64url) — لا يغادر جهاز المدرسة أو هاتف ولي الأمر */
  rawKey: string;
}

export async function deriveParentKeys(loginId: string, accessCode: string): Promise<ParentKeys> {
  const id = normalizeLoginId(loginId);
  const code = normalizeAccessCode(accessCode);
  if (!id || !code) throw new Error('رقم الدخول والرمز مطلوبان');
  const base = await subtle().importKey('raw', enc.encode(code), 'PBKDF2', false, ['deriveBits']);
  const bits = new Uint8Array(await subtle().deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(SALT_PREFIX + id), iterations: PARENT_KDF_ITERATIONS },
    base,
    512
  ));
  const lidHash = new Uint8Array(await subtle().digest('SHA-256', bits.slice(32)));
  return { lid: toHex(lidHash), rawKey: toB64u(bits.slice(0, 32)) };
}

const importAes = (rawKey: string) =>
  subtle().importKey('raw', fromB64u(rawKey), 'AES-GCM', false, ['encrypt', 'decrypt']);

/** تشفير كائن JSON مربوط بمعرّف البحث (AAD) — لا يمكن نقل نص مشفّر لطالب آخر */
export async function sealJson(keys: ParentKeys, value: unknown): Promise<string> {
  const iv = new Uint8Array(12);
  globalThis.crypto.getRandomValues(iv);
  const ct = new Uint8Array(await subtle().encrypt(
    { name: 'AES-GCM', iv, additionalData: enc.encode(keys.lid) },
    await importAes(keys.rawKey),
    enc.encode(JSON.stringify(value))
  ));
  return `${BLOB_PREFIX}${toB64u(iv)}.${toB64u(ct)}`;
}

export async function openJson<T>(keys: ParentKeys, blob: string): Promise<T> {
  if (typeof blob !== 'string' || !blob.startsWith(BLOB_PREFIX)) throw new Error('صيغة بيانات غير معروفة');
  const [ivPart, ctPart] = blob.slice(BLOB_PREFIX.length).split('.');
  const pt = await subtle().decrypt(
    { name: 'AES-GCM', iv: fromB64u(ivPart), additionalData: enc.encode(keys.lid) },
    await importAes(keys.rawKey),
    fromB64u(ctPart)
  );
  return JSON.parse(dec.decode(pt)) as T;
}

export async function sha256Hex(text: string): Promise<string> {
  return toHex(new Uint8Array(await subtle().digest('SHA-256', enc.encode(text))));
}
