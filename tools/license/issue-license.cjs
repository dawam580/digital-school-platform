#!/usr/bin/env node
/**
 * إصدار مفتاح ترخيص لمدرسة (على جهاز المورّد فقط).
 * الاستخدام:
 *   node tools/license/issue-license.cjs --school "مدرسة النور" --hwid HWID-LY-XXXX-XXXX-XXXX --type annual [--phone 0912345678]
 * الأنواع: annual (سنة) | lifetime (دائم) | trial_extended (7 أيام)
 */
const { loadPrivateKey, signLicense, PRIVATE_KEY_PATH } = require('../../electron/vendorKey.cjs');

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
}
if (!args.school || !args.hwid) {
  console.error('الاستخدام: node tools/license/issue-license.cjs --school "اسم المدرسة" --hwid HWID-LY-.... --type annual|lifetime|trial_extended [--phone 09xxxxxxxx]');
  process.exit(1);
}
const key = loadPrivateKey();
if (!key) {
  console.error('❌ لا يوجد مفتاح توقيع خاص على هذا الجهاز:', PRIVATE_KEY_PATH);
  process.exit(1);
}
const { token, payload } = signLicense(key, { schoolName: args.school, hwid: args.hwid, licenseType: args.type, adminPhone: args.phone });
console.log('المدرسة   :', payload.schoolName);
console.log('بصمة الجهاز:', payload.hwid);
console.log('النوع     :', payload.licenseType);
console.log('ينتهي في  :', payload.expiresAt);
console.log('\n' + token + '\n');
