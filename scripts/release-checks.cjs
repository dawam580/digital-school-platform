/**
 * فحوصات ما قبل التسليم (نموذج بنيان) — يستخدمها سكريبتا التحزيم.
 * 1) المفتاح العام المضمَّن في المنظومة يجب أن يطابق مفتاح توقيع المورّد،
 *    وإلا فكل مفتاح يصدره المورّد لهذه المدرسة سيُرفض عند التفعيل.
 * 2) العثور على ملفات التشغيل (.exe) أيّاً كان اسم المنتج/الإصدار.
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

function bundledPublicKeyHex() {
  const src = fs.readFileSync(path.join(ROOT_DIR, 'src/services/licensing/licensePublicKey.ts'), 'utf8');
  const m = src.match(/LICENSE_PUBLIC_KEY_HEX\s*=\s*'([0-9a-f]{64})'/i);
  return m ? m[1].toLowerCase() : null;
}

/** يعيد { ok, message } — ok=false يعني: لا تسلّم هذه النسخة */
function checkLicenseKeyPair() {
  const bundled = bundledPublicKeyHex();
  if (!bundled) return { ok: false, message: 'تعذّر قراءة المفتاح العام من licensePublicKey.ts' };
  let vendorKey;
  try { vendorKey = require('../electron/vendorKey.cjs'); } catch { vendorKey = null; }
  const priv = vendorKey && vendorKey.loadPrivateKey();
  if (!priv) {
    return { ok: true, message: `لا يوجد مفتاح توقيع المورّد على هذا الجهاز — تأكد أنك تبني على جهاز المورّد (المفتاح العام المضمَّن: ${bundled.slice(0, 12)}…)` };
  }
  const vendorPub = vendorKey.publicKeyHex(priv).toLowerCase();
  if (vendorPub !== bundled) {
    return { ok: false, message: `المفتاح العام المضمَّن (${bundled.slice(0, 12)}…) لا يطابق مفتاح توقيع المورّد (${vendorPub.slice(0, 12)}…). مفاتيح التراخيص التي تصدرها ستُرفض. أعد البناء بعد تصحيح licensePublicKey.ts.` };
  }
  return { ok: true, message: `المفتاح العام المضمَّن يطابق مفتاح توقيع المورّد (${bundled.slice(0, 12)}…)` };
}

function findWindowsExecutables() {
  const dir = path.join(ROOT_DIR, 'dist-electron');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.exe')).map(f => path.join(dir, f));
}

module.exports = { ROOT_DIR, bundledPublicKeyHex, checkLicenseKeyPair, findWindowsExecutables };
