/**
 * مسار مفتاح التوقيع الخاص بالمورّد — خارج المشروع دائماً.
 * لا يُرفع إلى git ولا يُضمَّن في المثبّت. من يملك هذا الملف يملك حق إصدار التراخيص.
 */
const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');

const VENDOR_DIR = process.env.MADRASA_LICENSE_DIR || path.join(os.homedir(), '.madrasa-license');
const PRIVATE_KEY_PATH = path.join(VENDOR_DIR, 'private.pem');
// سجل كل التراخيص المُصدرة (سطر JSON لكل ترخيص) — مصدر قائمة المدارس المشتركة لدى المورّد
const LEDGER_PATH = path.join(VENDOR_DIR, 'issued-licenses.jsonl');

function loadPrivateKey() {
  if (!fs.existsSync(PRIVATE_KEY_PATH)) return null;
  return crypto.createPrivateKey(fs.readFileSync(PRIVATE_KEY_PATH, 'utf8'));
}

function publicKeyHex(privateKey) {
  const der = crypto.createPublicKey(privateKey).export({ format: 'der', type: 'spki' });
  return der.subarray(der.length - 32).toString('hex');
}

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const DAY = 24 * 60 * 60 * 1000;

/** إصدار مفتاح MADRASA-v3 موقّع بـ Ed25519 */
function signLicense(privateKey, { schoolName, hwid, licenseType, adminPhone }) {
  if (!schoolName || !String(schoolName).trim()) throw new Error('اسم المدرسة مطلوب');
  const type = licenseType || 'annual';
  if (!['annual', 'lifetime', 'trial_extended'].includes(type)) throw new Error('نوع ترخيص غير معروف: ' + type);
  const now = Date.now();
  const expiresAt = type === 'lifetime'
    ? '2099-12-31T23:59:59.000Z'
    : new Date(now + (type === 'annual' ? 365 : 7) * DAY).toISOString();
  const payload = {
    v: 3,
    id: crypto.randomBytes(8).toString('hex'),
    schoolName: String(schoolName).trim(),
    hwid: String(hwid || '').trim().toUpperCase() || '*',
    licenseType: type,
    issuedAt: new Date(now).toISOString(),
    expiresAt,
    adminPhone: String(adminPhone || '').trim(),
  };
  const body = b64url(Buffer.from(JSON.stringify(payload), 'utf8'));
  const sig = crypto.sign(null, Buffer.from(body, 'utf8'), privateKey);
  const token = `MADRASA-v3-${body}.${b64url(sig)}`;
  try {
    fs.appendFileSync(LEDGER_PATH, JSON.stringify({ ...payload, token }) + '\n', 'utf8');
  } catch {}
  return { token, payload };
}

/** قراءة سجل التراخيص المُصدرة (الأحدث أولاً) */
function readLedger() {
  try {
    return fs.readFileSync(LEDGER_PATH, 'utf8').split(/\r?\n/).filter(Boolean)
      .map(line => { try { return JSON.parse(line); } catch { return null; } })
      .filter(Boolean)
      .reverse();
  } catch {
    return [];
  }
}

module.exports = { VENDOR_DIR, PRIVATE_KEY_PATH, LEDGER_PATH, loadPrivateKey, publicKeyHex, signLicense, readLedger };
