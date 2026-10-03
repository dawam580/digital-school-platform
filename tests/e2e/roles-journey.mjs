/**
 * فحص الواجهات معاً في متصفح حقيقي (المدير ← المعلم ← ولي الأمر ← الأخصائي ← تعدد المدارس).
 *
 * التشغيل:
 *   npm run build && npx vite preview --port 4173 --strictPort &
 *   npm i --no-save playwright && node tests/e2e/roles-journey.mjs
 *
 * متغيرات اختيارية: BASE_URL (افتراضي http://localhost:4173/) و CHROMIUM_PATH.
 * كل خطوة تطبع ✓ أو ✗، ورمز الخروج 1 عند أي فشل.
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
const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1366, height: 800 };
const ADMIN = { phone: '0915551234', password: 'Nour@2026x' };
const results = [];
const check = (name, ok, extra = '') => {
  results.push(ok);
  console.log(`${ok ? '✓' : '✗'} ${name}${extra ? ` — ${extra}` : ''}`);
};

const root = mkdtempSync(path.join(tmpdir(), 'madrasa-e2e-'));
const snapshot = path.join(root, 'school-a');

async function browser(viewport, fromSnapshot = true) {
  const dir = mkdtempSync(path.join(root, 'p-'));
  if (fromSnapshot) cpSync(snapshot, dir, { recursive: true });
  const ctx = await chromium.launchPersistentContext(dir, {
    viewport,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.on('dialog', d => d.accept());
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  return { ctx, page, errors, dir };
}
const text = page => page.innerText('body');
/** حفظ حالة المتصفح بعد خطوة تعدّل البيانات لتبني عليها الخطوة التالية */
async function persist(ctx, dir) {
  await ctx.close();
  rmSync(snapshot, { recursive: true, force: true });
  cpSync(dir, snapshot, { recursive: true });
}

async function login(page, id, secret) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  if (await page.getByRole('button', { name: 'تسجيل الخروج' }).count()) {
    await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
  }
  await page.getByRole('button', { name: /دخول المنظومة/ }).first().click();
  await page.getByPlaceholder(/09xxxxxxxx أو كود المعلم/).fill(id);
  await page.locator('input[type=password]').fill(secret);
  await page.getByRole('button', { name: /دخول المنظومة الآمن/ }).click();
  await page.waitForTimeout(1500);
}

try {
  // 1) المدير ينشئ مدرسة تجريبية ويطبع بطاقات أولياء الأمور
  {
    const { ctx, page, errors, dir } = await browser(DESKTOP, false);
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
    check('المدير: إنشاء مدرسة تجريبية', (await text(page)).includes('لوحة تحكم إدارة المدرسة'));
    await ctx.close();
    cpSync(dir, snapshot, { recursive: true });
    check('المدير: لا أخطاء تشغيل', errors.length === 0, errors.join(' | '));
  }

  // 2) الدخول الآمن: لا تجاوز بالرابط ولا رموز افتراضية
  {
    const { ctx, page } = await browser(DESKTOP);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
    await page.goto(`${BASE}?role=admin`, { waitUntil: 'networkidle' });
    check('الأمان: ?role=admin لا يفتح لوحة المدير', !(await text(page)).includes('لوحة تحكم إدارة المدرسة'));
    await page.goto(`${BASE}?role=superadmin`, { waitUntil: 'networkidle' });
    check('الأمان: ?role=superadmin لا يفتح بوابة المدير العام', !(await text(page)).includes('صلاحيات المدير العام'));
    await login(page, '0912345678', '2026');
    check('الأمان: هاتف العرض 0912345678/2026 مرفوض', !(await text(page)).includes('لوحة تحكم إدارة المدرسة'));
    await ctx.close();
  }

  // 3) بطاقات أولياء الأمور
  let A, B;
  {
    const { ctx, page } = await browser(DESKTOP);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /بطاقات دخول أولياء الأمور/ }).click();
    await page.locator('select[aria-label="الفصل"]').selectOption({ label: 'فصل 9/1 صباح' });
    await page.waitForTimeout(500);
    const cards = await page.$$eval('.print-portal-root .break-inside-avoid', els => els.map(e => e.innerText));
    const parse = c => ({ name: c.split('\n').filter(Boolean)[1], id: c.match(/رقم الدخول: (\S+)/)[1], pin: c.match(/رمز ولي الأمر: (\d+)/)[1] });
    A = parse(cards[0]);
    B = parse(cards[1]);
    check('المدير: بطاقات أولياء الأمور برموز من 6 أرقام', /^\d{6}$/.test(A.pin) && A.pin !== B.pin);
    await ctx.close();
  }

  // 4) ولي الأمر: لا دخول بدون الرمز
  {
    const { ctx, page } = await browser(MOBILE);
    await login(page, A.id, '000000');
    check('ولي الأمر: رمز خاطئ مرفوض', !(await text(page)).includes('حالة الحضور اليوم'));
    await ctx.close();
  }

  // 5) المعلم يرصد غياباً ويراسل ولي أمر الطالب A
  {
    const { ctx, page, dir } = await browser(MOBILE);
    await login(page, 'LIB-COMP-09', ADMIN.password);
    await page.getByRole('button', { name: /^غائب/ }).first().click();
    await page.getByRole('button', { name: /حفظ واعتماد كشف الحضور/ }).click();
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'رسائل أولياء الأمور' }).click();
    await page.locator('select[aria-label="اختر الطالب"]').selectOption({ label: `${A.name} — 9/1 صباح` });
    await page.getByRole('button', { name: 'فتح' }).click();
    await page.getByLabel('نص الرسالة').fill('ابنكم تغيب عن حصة الحاسوب اليوم');
    await page.getByRole('button', { name: 'إرسال' }).click();
    await page.waitForTimeout(500);
    check('المعلم: رصد الغياب وإرسال رسالة', (await text(page)).includes('تغيب عن حصة الحاسوب'));
    await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
    await persist(ctx, dir);
  }

  // 6) ولي الأمر A: يرى الغياب ورسالة المعلم ويرد
  {
    const { ctx, page, dir } = await browser(MOBILE);
    await login(page, A.id, A.pin);
    check('ولي الأمر: يرى غياب ابنه اليوم', (await text(page)).includes('مسجل كغائب'));
    await page.getByRole('button', { name: /مراسلة المعلمين/ }).click();
    await page.waitForTimeout(600);
    check('ولي الأمر: يرى رسالة المعلم', (await text(page)).includes('تغيب عن حصة الحاسوب'));
    await page.getByRole('button', { name: /أدم المنصوري/ }).first().click();
    await page.getByLabel('نص الرسالة').fill('كان مريضاً وسنرسل العذر');
    await page.getByRole('button', { name: 'إرسال' }).click();
    await page.waitForTimeout(2500);
    check('المحادثة: لا ردود آلية مختلقة باسم المعلم', !/سيتم متابعة الطالب باهتمام|نموذج يحتذى به/.test(await text(page)));
    await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
    await persist(ctx, dir);
  }

  // 7) ولي الأمر B لا يرى شيئاً عن A
  {
    const { ctx, page, dir } = await browser(MOBILE);
    await login(page, B.id, B.pin);
    await page.getByRole('button', { name: /مراسلة المعلمين/ }).click();
    await page.waitForTimeout(600);
    const t = await text(page);
    check('الخصوصية: ولي أمر آخر لا يرى محادثة A', !t.includes('تغيب عن حصة الحاسوب') && !t.includes('كان مريضاً'));
    await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
    await persist(ctx, dir);
  }

  // 8) الأخصائي يستدعي ولي أمر A
  {
    const { ctx, page, dir } = await browser(DESKTOP);
    await login(page, 'LIB-SOC-01', ADMIN.password);
    await page.getByRole('button', { name: /المتابعة والاستدعاءات/ }).click();
    await page.getByRole('button', { name: /\+ استدعاء جديد/ }).click();
    const sel = page.locator('select').filter({ has: page.locator(`option:has-text("${A.name}")`) }).first();
    await sel.selectOption(await sel.locator(`option:has-text("${A.name}")`).first().getAttribute('value'));
    await page.locator('form button[type=submit]').last().click();
    await page.waitForTimeout(600);
    check('الأخصائي: إرسال استدعاء', (await text(page)).includes(A.name));
    await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
    await persist(ctx, dir);
  }

  // 9) ولي الأمر A يستلم الاستدعاء ويؤكده
  {
    const { ctx, page, dir } = await browser(MOBILE);
    await login(page, A.id, A.pin);
    check('ولي الأمر: وصول الاستدعاء', (await text(page)).includes('استدعاء من مكتب الخدمة الاجتماعية'));
    await page.getByRole('button', { name: /تأكيد الحضور في الموعد/ }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
    await persist(ctx, dir);
  }

  // 10) الأخصائي يرى التأكيد، والمعلم يرى الرد
  {
    const { ctx, page } = await browser(DESKTOP);
    await login(page, 'LIB-SOC-01', ADMIN.password);
    await page.getByRole('button', { name: /المتابعة والاستدعاءات/ }).click();
    check('الأخصائي: يرى تأكيد ولي الأمر', (await text(page)).includes('أكد ولي الأمر'));
    await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
    await login(page, 'LIB-COMP-09', ADMIN.password);
    await page.goto(`${BASE}?tab=chat`, { waitUntil: 'networkidle' });
    check('المعلم: يرى رد ولي الأمر', (await text(page)).includes('كان مريضاً'));
    await ctx.close();
  }

  // 11) تعدد المدارس: مدرسة جديدة فارغة ثم العودة للأولى كما هي
  {
    const { ctx, page } = await browser(DESKTOP);
    await login(page, ADMIN.phone, ADMIN.password);
    const count = async () => (await text(page)).match(/1\. الطلاب \((\d+)\)/)?.[1];
    const before = await count();
    await page.getByRole('button', { name: /أدوات المنظومة/ }).click();
    await page.getByRole('button', { name: /المدارس \(إضافة/ }).click();
    await page.getByRole('button', { name: /^إنشاء مدرسة جديدة/ }).click();
    await page.getByPlaceholder('مثال: مدرسة النور للتعليم الأساسي').fill('مدرسة الفجر الجديد');
    await page.getByPlaceholder('مثال: 0912345678').fill('0927771234');
    const cb = page.locator('input[type=checkbox]').last();
    if (!(await cb.isChecked())) await cb.check();
    await page.getByRole('button', { name: /إنشاء وتشغيل المدرسة الجديدة/ }).click();
    await page.waitForTimeout(4000);
    check('تعدد المدارس: المدرسة الجديدة بلا طلاب ولا معلمين', (await count()) === '0' && (await text(page)).includes('مدرسة الفجر الجديد'));
    await page.getByRole('button', { name: /مدرسة النور/ }).first().click();
    await page.waitForTimeout(4000);
    check('تعدد المدارس: العودة للمدرسة الأولى ببياناتها كاملة', (await count()) === before, `قبل ${before} بعد ${await count()}`);
    await ctx.close();
  }
} catch (e) {
  check('تعذر إكمال السيناريو', false, e.message);
}

rmSync(root, { recursive: true, force: true });
const failed = results.filter(r => !r).length;
console.log(`\n${results.length - failed}/${results.length} ناجح`);
process.exit(failed ? 1 : 0);
