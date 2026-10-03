/**
 * ============================================================================
 * فحص جاهزية حزمة التسليم للمدرسة (نموذج بنيان)
 * المدرسة تستلم: ملف التشغيل + دليل المدرسة. تشغّل ← ترسل بصمة الجهاز ←
 * يصدر المورّد مفتاحاً موقّعاً لتلك البصمة ← تلصقه المدرسة فتُفعَّل.
 * دليل المورّد لا يُسلَّم للمدرسة.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { ROOT_DIR, checkLicenseKeyPair, findWindowsExecutables } = require('./release-checks.cjs');

console.log('================================================================');
console.log('📦 فحص حزمة التسليم للمدرسة (نموذج بنيان)...');
console.log('================================================================\n');

let ready = true;

const keyCheck = checkLicenseKeyPair();
console.log(`  ${keyCheck.ok ? '✓' : '✗'} ${keyCheck.message}`);
if (!keyCheck.ok) ready = false;

const clientFiles = ['تشغيل_المنظومة.bat', 'دليل_التشغيل_والترخيص_المدرسي.txt'];
for (const file of clientFiles) {
  const ok = fs.existsSync(path.join(ROOT_DIR, file));
  console.log(`  ${ok ? '✓' : '✗'} ${ok ? 'موجود' : 'مفقود'}: ${file}`);
  if (!ok) ready = false;
}

const exes = findWindowsExecutables();
if (exes.length) {
  for (const exe of exes) {
    const sizeMb = (fs.statSync(exe).size / (1024 * 1024)).toFixed(1);
    console.log(`  ✓ ملف التشغيل: ${path.basename(exe)} (${sizeMb} MB)`);
  }
} else {
  console.log('  ⚠️ لا يوجد ملف تشغيل في dist-electron — ابنِه عبر: npm run dist:win');
}

console.log('\nيُسلَّم للمدرسة: ملف التشغيل + دليل_التشغيل_والترخيص_المدرسي.txt (+ تشغيل_المنظومة.bat اختيارياً).');
console.log('لا يُسلَّم: دليل_التسليم_للمدارس_والزبائن.txt ولا مجلد ~/.madrasa-license.');

if (!ready) {
  console.log('\n❌ الحزمة غير جاهزة للتسليم — أصلح البنود المعلّمة بـ ✗.');
  process.exit(1);
}
console.log('\n✅ الحزمة جاهزة للتسليم.');
