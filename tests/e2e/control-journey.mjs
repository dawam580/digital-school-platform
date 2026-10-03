/**
 * دورة الكنترول كاملة في متصفح حقيقي:
 * المدير يسجل رئيس الكنترول ← الرصد بلا قيم افتراضية ← الاعتماد بكلمة مرور الكنترول
 * ← ولي الأمر: محجوب ← النشر ← النتيجة الرسمية تظهر ← فتح الشيت يسحب النشر
 * ← أرقام الجلوس لا تمس رقم القيد.
 *
 * التشغيل: npm run build && npx vite preview --port 4173 --strictPort &
 *          node tests/e2e/control-journey.mjs
 */
import { mkdtempSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('playwright غير مثبت: npm i --no-save playwright');
  process.exit(2);
}

const BASE = process.env.BASE_URL || 'http://localhost:4173/';
const ADMIN = { phone: '0915551234', password: 'Nour@2026x' };
const CONTROL = { phone: '0925550101', password: 'Ktrl#4821' };
const results = [];
const check = (name, ok, extra = '') => {
  results.push(ok);
  console.log(`${ok ? '✓' : '✗'} ${name}${extra ? ` — ${extra}` : ''}`);
};
const root = mkdtempSync(path.join(tmpdir(), 'madrasa-control-'));
const profile = path.join(root, 'school');
const errors = [];

async function browser(viewport = { width: 1366, height: 800 }) {
  const ctx = await chromium.launchPersistentContext(profile, {
    viewport,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.on('dialog', d => d.accept());
  page.on('pageerror', e => errors.push(e.message));
  return { ctx, page };
}
const text = page => page.innerText('body');

async function login(page, id, secret) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const out = page.getByRole('button', { name: 'تسجيل الخروج' });
  if (await out.count()) await out.first().click();
  await page.getByRole('button', { name: /دخول المنظومة/ }).first().click();
  await page.getByPlaceholder(/09xxxxxxxx أو كود المعلم/).fill(id);
  await page.locator('input[type=password]').fill(secret);
  await page.getByRole('button', { name: /دخول المنظومة الآمن/ }).click();
  await page.waitForTimeout(1800);
}

async function confirmWithControlPassword(page, button) {
  await page.getByRole('button', { name: button }).click();
  await page.getByLabel('رمز الأمان').fill(CONTROL.password);
  await page.getByRole('button', { name: /تأكيد الإجراء/ }).click();
  await page.waitForTimeout(800);
}

let className, studentName, card;
try {
  // 1) مدرسة تجريبية ببيانات نموذجية + حساب رئيس الكنترول
  {
    const { ctx, page } = await browser();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.getByText('ليس لديك مفتاح؟ ابدأ تجربة مجانية').click();
    await page.getByPlaceholder(/مدرسة قرطبة/).fill('مدرسة النور للتعليم الأساسي');
    await page.getByText('متابعة لبيانات التواصل').click();
    await page.getByPlaceholder('09xxxxxxxx').fill(ADMIN.phone);
    await page.getByPlaceholder('أ. فتحي الشريف').fill('أ. سالم المبروك');
    await page.locator('input[type=password]').fill(ADMIN.password);
    await page.getByRole('button', { name: /متابعة لتخصيص/ }).click();
    await page.getByText('بيئة نموذجية متكاملة').click();
    await page.getByRole('button', { name: /بدء التجهيز/ }).click();
    await page.waitForTimeout(8000);
    await page.getByRole('button', { name: /إعدادات المدير وتغيير الرمز/ }).click();
    await page.getByLabel('هاتف رئيس الكنترول').fill(CONTROL.phone);
    await page.getByLabel('كلمة مرور رئيس الكنترول').fill(CONTROL.password);
    await page.getByRole('button', { name: /حفظ التغييرات/ }).click();
    await page.waitForTimeout(1500);
    check('المدير: تسجيل حساب رئيس الكنترول', (await page.evaluate(() => localStorage.getItem('madrasa_exams_phone'))) === CONTROL.phone);
    await ctx.close();
  }

  // 2) رئيس الكنترول يرصد ويعتمد
  {
    const { ctx, page } = await browser();
    await login(page, CONTROL.phone, CONTROL.password);
    check('الكنترول: الدخول بحسابه الخاص', (await text(page)).includes('منظومة الكنترول'));
    const select = page.locator('select').filter({ hasText: 'فصل:' }).first();
    className = (await select.inputValue()).trim();
    const cols = await page.$$eval('tbody tr:first-child input[data-col]', els => els.map(e => e.getAttribute('data-col')));
    const cell = c => page.locator(`tbody tr:first-child input[data-col="${c}"]`);
    // صف بلا رصد سابق: نبحث عن أول طالب بخانات فارغة
    await cell(cols[0]).fill('30');
    await page.waitForTimeout(300);
    check('الكنترول: رصد الأعمال لا يملأ الامتحان تلقائياً', (await cell(cols[1]).inputValue()) === '');
    for (const c of cols) {
      await cell(c).fill(c.startsWith('cw_') ? '32' : '48');
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(400);
    studentName = (await page.locator('tbody tr').first().locator('td').nth(3).innerText()).replace(/تقديري.*/s, '').trim();
    check('الكنترول: اكتمال الرصد يعطي نتيجة', /ناجح/.test(await page.locator('tbody tr').first().innerText()));
    await confirmWithControlPassword(page, /اعتماد وقفل النتيجة/);
    check('الكنترول: الاعتماد بكلمة مرور الكنترول', (await text(page)).includes('معتمد ومقفل'));
    await ctx.close();
  }

  // 3) بطاقة ولي أمر ذلك الطالب
  {
    const { ctx, page } = await browser();
    await login(page, ADMIN.phone, ADMIN.password);
    await page.getByRole('button', { name: /بطاقات دخول أولياء الأمور/ }).click();
    await page.locator('select[aria-label="الفصل"]').selectOption({ label: `فصل ${className}` });
    await page.waitForTimeout(500);
    const cards = await page.$$eval('.print-portal-root .break-inside-avoid', els => els.map(e => e.innerText));
    const c = cards.find(x => x.includes(studentName));
    card = { id: c.match(/رقم الدخول: (\S+)/)[1], pin: c.match(/رمز ولي الأمر: (\d+)/)[1] };
    await ctx.close();
  }

  const parentGrades = async () => {
    const { ctx, page } = await browser({ width: 390, height: 844 });
    await login(page, card.id, card.pin);
    await page.getByRole('button', { name: /^الدرجات$/ }).last().click();
    await page.waitForTimeout(1200);
    const r = { t: await text(page), official: await page.locator('[data-testid="official-result"]').count() };
    await ctx.close();
    return r;
  };
  const controlStep = async button => {
    const { ctx, page } = await browser();
    await login(page, CONTROL.phone, CONTROL.password);
    await page.locator('select').filter({ hasText: 'فصل:' }).first().selectOption(className);
    await page.waitForTimeout(600);
    await confirmWithControlPassword(page, button);
    const t = await text(page);
    await ctx.close();
    return t;
  };

  let r = await parentGrades();
  check('ولي الأمر: الدرجات محجوبة بعد الاعتماد وقبل النشر', r.t.includes('قيد المراجعة') && r.official === 0);
  await controlStep(/نشر النتائج لأولياء الأمور/);
  r = await parentGrades();
  check('ولي الأمر: النتيجة الرسمية تظهر بعد النشر', r.official === 1);
  const t = await controlStep(/إلغاء القفل والتعديل/);
  check('الكنترول: فتح الشيت يسحب النشر', t.includes('نشر النتائج لأولياء الأمور'));
  r = await parentGrades();
  check('ولي الأمر: لا نتيجة رسمية بعد السحب', r.official === 0);

  // 4) أرقام الجلوس منفصلة عن رقم القيد
  {
    const { ctx, page } = await browser();
    await login(page, CONTROL.phone, CONTROL.password);
    const reg = () => page.evaluate(() => JSON.parse(localStorage.getItem('madrasa_db_students_v3') || '[]').map(s => s.studentNumber).join(','));
    const before = await reg();
    await page.getByRole('button', { name: /أرقام الجلوس ولجان الامتحانات/ }).click();
    await page.getByRole('button', { name: /توليد أرقام الجلوس/ }).click();
    await page.waitForTimeout(800);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    check('الجلوس: أرقام القيد لم تتغير', (await reg()) === before);
    await ctx.close();
  }
  check('لا أخطاء تشغيل', errors.length === 0, errors.join(' | ').slice(0, 300));
} catch (e) {
  check('تعذر إكمال السيناريو', false, e.message);
}

rmSync(root, { recursive: true, force: true });
const failed = results.filter(x => !x).length;
console.log(`\n${results.length - failed}/${results.length} ناجح`);
process.exit(failed ? 1 : 0);
