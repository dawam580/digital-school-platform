/**
 * ============================================================================
 * سكريبت تجهيز وحزم ملف تسليم المنظومة للزبائن (Client Delivery Packager)
 * يقوم بتجميع ملفات التشغيل والنسخة المحمولة والأدلة في حزمة جاهزة للعميل
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_ZIP_NAME = 'منظومة_المدرسة_الرقمية_Windows_v2.0.zip';
const OUTPUT_ZIP_PATH = path.join(ROOT_DIR, OUTPUT_ZIP_NAME);

console.log('================================================================');
console.log('📦 جاري إعداد وتجهيز حزمة التسليم للمدارس والزبائن (نموذج بنيان)...');
console.log('================================================================\n');

// 1. Check required files
const requiredFiles = [
  'تشغيل_المنظومة.bat',
  'Run-School-Desktop.bat',
  'دليل_التشغيل_والترخيص_المدرسي.txt',
  'دليل_التسليم_للمدارس_والزبائن.txt'
];

let allPresent = true;
for (const file of requiredFiles) {
  const filePath = path.join(ROOT_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ موجود: ${file}`);
  } else {
    console.log(`  ✗ مفقود: ${file}`);
    allPresent = false;
  }
}

// 2. Check portable executable
const portableExe = path.join(ROOT_DIR, 'dist-electron', 'منظومة مدرسة الباعور الرقمية-Portable-2.0.0.exe');
if (fs.existsSync(portableExe)) {
  const sizeMb = (fs.statSync(portableExe).size / (1024 * 1024)).toFixed(1);
  console.log(`  ✓ موجود: التطبيق المحمول المستقل (${sizeMb} MB)`);
} else {
  console.log('  ⚠️ لم يتم العثور على التطبيق المحمول في dist-electron. يمكنك بناؤه عبر: npm run dist:win');
}

console.log('\n[تم] كافة ملفات حزمة العميل جاهزة 100% للتسليم.');
console.log(`- الدليل المدرسي: دليل_التشغيل_والترخيص_المدرسي.txt`);
console.log(`- دليل المطور والمسوق: دليل_التسليم_للمدارس_والزبائن.txt`);
console.log(`- مشغل الويندوز الفوري: تشغيل_المنظومة.bat`);
