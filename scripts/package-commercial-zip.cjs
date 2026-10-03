/**
 * ============================================================================
 * سكريبت تحزيم النسخة التجارية للمدارس والزبائن
 * Package Commercial Digital School Platform ZIP
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { checkLicenseKeyPair, findWindowsExecutables } = require('./release-checks.cjs');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const STAGING_DIR = path.join(ROOT_DIR, 'منظومة_المدرسة_الرقمية_النسخة_التجارية');
const OUTPUT_ZIP = path.join(ROOT_DIR, 'منظومة_المدرسة_الرقمية_النسخة_التجارية.zip');

console.log('================================================================');
console.log('🚀 بدء تحزيم النسخة التجارية النظيفة (Commercial Clean Delivery)...');
console.log('================================================================\n');

// 0. لا نحزم نسخة لا تقبل مفاتيح المورّد
const keyCheck = checkLicenseKeyPair();
console.log(`${keyCheck.ok ? '✓' : '✗'} ${keyCheck.message}`);
if (!keyCheck.ok) process.exit(1);

// 1. Ensure production build exists
if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  console.log('📦 جاري بناء حزمة الإنتاج النظيفة أولاً (Building dist)...');
  execSync('npm.cmd run build', { cwd: ROOT_DIR, stdio: 'inherit' });
} else {
  console.log('✓ تم التحقق من وجود حزمة الإنتاج المجمعة في dist/');
}

// 2. Prepare clean staging directory
if (fs.existsSync(STAGING_DIR)) {
  fs.rmSync(STAGING_DIR, { recursive: true, force: true });
}
fs.mkdirSync(STAGING_DIR, { recursive: true });

// 3. Helper to copy recursive
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 4. Copy required files to staging
console.log('\n📋 نسخ ملفات التشغيل والإنتاج إلى مجلد الحزمة:');

// dist/
console.log('  -> نسخ مجلد الإنتاج dist/...');
copyRecursive(DIST_DIR, path.join(STAGING_DIR, 'dist'));

// Launcher .bat
const launcherBat = path.join(ROOT_DIR, 'تشغيل_المنظومة.bat');
if (fs.existsSync(launcherBat)) {
  fs.copyFileSync(launcherBat, path.join(STAGING_DIR, 'تشغيل_المنظومة.bat'));
  console.log('  -> ✓ تشغيل_المنظومة.bat');
}

// Guide files
const guides = [
  // دليل التسليم للمورّد فقط — لا يُضمَّن في حزمة الزبون
  'دليل_التشغيل_والترخيص_المدرسي.txt'
];

for (const g of guides) {
  const src = path.join(ROOT_DIR, g);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(STAGING_DIR, g));
    console.log(`  -> ✓ ${g}`);
  }
}

// Windows executables (any product name / version)
const exeFiles = findWindowsExecutables();
if (exeFiles.length > 0) {
  const destElectron = path.join(STAGING_DIR, 'dist-electron');
  fs.mkdirSync(destElectron, { recursive: true });
  for (const exe of exeFiles) {
    fs.copyFileSync(exe, path.join(destElectron, path.basename(exe)));
    console.log(`  -> ✓ تم تضمين التطبيق المستقل (${path.basename(exe)})`);
  }
}

// 5. Create native ZIP using PowerShell Compress-Archive
console.log('\n🗜️ جاري إنشاء ملف الـ ZIP المضغوط عبر PowerShell...');
try {
  if (fs.existsSync(OUTPUT_ZIP)) {
    fs.unlinkSync(OUTPUT_ZIP);
  }
  
  const psCommand = `Compress-Archive -Path "${STAGING_DIR}\\*" -DestinationPath "${OUTPUT_ZIP}" -Force`;
  execSync(`powershell.exe -NoProfile -Command "${psCommand}"`, { stdio: 'inherit' });
  
  if (fs.existsSync(OUTPUT_ZIP)) {
    const sizeMb = (fs.statSync(OUTPUT_ZIP).size / (1024 * 1024)).toFixed(2);
    console.log(`\n================================================================`);
    console.log(`✅ تم إنشاء الحزمة التجارية المضغوطة بنجاح 100%!`);
    console.log(`📁 المسار: ${OUTPUT_ZIP}`);
    console.log(`📦 الحجم: ${sizeMb} MB`);
    console.log(`================================================================\n`);
  }
} catch (err) {
  console.error('❌ خطأ أثناء ضغط ملف الـ ZIP:', err.message);
  process.exit(1);
}
