/**
 * verify-dist.mjs — حارس ما بعد البناء (درس الصفحة البيضاء).
 * يفشل بصوت عالٍ عند:
 *  1. إشارة index.html لأصول غير موجودة (HTML قديم + حزم محذوفة = بياض).
 *  2. أي حافة استيراد من eager-chunk نحو async-chunk (دائرة TDZ قاتلة).
 *  3. غياب chunk الرسوم الكسول (AnalyticsCharts) — انهيار التقسيم.
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const ASSETS = join(DIST, 'assets');

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`[verify-dist] FAIL: ${msg}`);
};
const ok = (msg) => console.log(`[verify-dist] OK: ${msg}`);

const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map(m => m[1]);

if (refs.length === 0) fail('index.html لا يشير لأي أصل — بناء مكسور');
const currentFiles = new Set();
for (const ref of refs) {
  const p = join(DIST, ref.replace('./', ''));
  currentFiles.add(ref.split('/').pop());
  if (!existsSync(p)) fail(`أصل مفقود: ${ref}`);
}
if (failures === 0) ok(`${refs.length} أصل مشار إليه موجودة`);

// تُفحص ملفات الحزمة الحالية فقط (dist المحلي قد يحوي بقايا قديمة متجاهلة)
const allJs = readdirSync(ASSETS).filter(f => f.endsWith('.js'));
const vendorFiles = allJs.filter(f => f.startsWith('vendor-') && currentFiles.has(f));
// الـchunks الكسولة تُجلب عند الطلب (لا preload لها في index.html) — يكفي وجودها
const asyncChunks = allJs.filter(f => /charts-vendor|AnalyticsCharts/.test(f));

if (asyncChunks.length === 0) fail('لا يوجد chunk كسول للرسوم — التقسيم انهار');
else ok(`chunks كسولة: ${asyncChunks.join(', ')}`);

for (const v of vendorFiles) {
  const content = readFileSync(join(ASSETS, v), 'utf8');
  for (const a of asyncChunks) {
    const base = a.replace(/-[A-Za-z0-9_-]+\.js$/, '');
    if (content.includes(`./${a}`) || content.includes(base + '-')) {
      // تحقق دقيق: استيراد استاتيكي فعلي لا مجرد ذكر نصي
      const staticImport = new RegExp(`from\\s*["']\\.\\/${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`);
      if (staticImport.test(content)) {
        fail(`${v} يستورد ${a} استاتيكياً — دائرة TDZ قاتلة (صفحة بيضاء)`);
      }
    }
  }
}
if (failures === 0) ok('لا حواف eager→async — الرسم البياني للملفات سليم');

if (failures > 0) {
  console.error(`[verify-dist] ${failures} فشل — أوقف النشر`);
  process.exit(1);
}
console.log('[verify-dist] كل الفحوصات خضراء ✅');
