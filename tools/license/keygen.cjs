#!/usr/bin/env node
/**
 * توليد زوج مفاتيح الترخيص (مرة واحدة فقط في عمر المنتج).
 *  - المفتاح الخاص  → %USERPROFILE%\.madrasa-license\private.pem (احتفظ بنسخة احتياطية آمنة!)
 *  - المفتاح العام  → src/services/licensing/licensePublicKey.ts (يُضمَّن في البرنامج)
 * تغيير المفتاح لاحقاً يبطل كل التراخيص المُصدرة سابقاً.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { VENDOR_DIR, PRIVATE_KEY_PATH, loadPrivateKey, publicKeyHex } = require('../../electron/vendorKey.cjs');

const force = process.argv.includes('--force');
let privateKey = loadPrivateKey();
if (privateKey && !force) {
  console.log('ℹ️  يوجد مفتاح خاص مسبقاً — سيُعاد استخدامه:', PRIVATE_KEY_PATH);
} else {
  fs.mkdirSync(VENDOR_DIR, { recursive: true });
  const pair = crypto.generateKeyPairSync('ed25519');
  fs.writeFileSync(PRIVATE_KEY_PATH, pair.privateKey.export({ format: 'pem', type: 'pkcs8' }), { mode: 0o600 });
  privateKey = pair.privateKey;
  console.log('✅ تم توليد مفتاح خاص جديد:', PRIVATE_KEY_PATH);
  console.log('⚠️  انسخ هذا الملف احتياطياً (فلاشة مشفرة/خزنة). فقدانه = لا يمكن إصدار تراخيص جديدة.');
}

const hex = publicKeyHex(privateKey);
const out = path.join(__dirname, '..', '..', 'src', 'services', 'licensing', 'licensePublicKey.ts');
fs.writeFileSync(out, `/**
 * المفتاح العام للتحقق من تواقيع التراخيص (Ed25519).
 * مولَّد بواسطة tools/license/keygen.cjs — لا تعدله يدوياً.
 * المفتاح الخاص المقابل محفوظ لدى المورّد فقط وليس في هذا المشروع.
 */
export const LICENSE_PUBLIC_KEY_HEX = '${hex}';
`);
console.log('✅ تم تحديث المفتاح العام في:', path.relative(process.cwd(), out));
