/**
 * تطبيق ولي الأمر من الطرف للطرف: مدرسة مفعّلة بترخيص ← مزامنة مشفّرة ← هاتف ولي الأمر
 * ← رسالة وعذر ← وصولهما للمدرسة ← تأكيد الوصول على الهاتف ← الخروج.
 *
 * يحتاج (بيانات وهمية بالكامل):
 *   - نسخة مدرسة مبنية بمفتاح عام تجريبي تُقدَّم على SCHOOL_URL (افتراضي http://localhost:4174/)
 *   - مجلد مفتاح التوقيع التجريبي LICENSE_DIR (private.pem المطابق) لإصدار ترخيص الاختبار
 *   - خادم server/parent-relay.mjs بنفس المفتاح العام على RELAY_URL (افتراضي http://localhost:8787)
 *   - حزمة مدرسة تجريبية PKG (طالبان + معلم + أخصائي)
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
const SCHOOL=process.env.SCHOOL_URL||'http://localhost:4174/', RELAY=process.env.RELAY_URL||'http://localhost:8787';
const LICENSE_DIR=process.env.LICENSE_DIR||'/tmp/madrasa-test-license';
const PKG=process.env.PKG||new URL('./fixtures/parent-app-school.json', import.meta.url).pathname;
const RELAY_DATA=process.env.RELAY_DATA_DIR||'';
const WORK=process.env.WORK_DIR||'/tmp/madrasa-parent-e2e';
const results=[];
const ok=(n,c,x='')=>{results.push(!!c);console.log(`${c?'✓':'✗'} ${n}${x?' — '+x:''}`);};
const errors=[];
execSync(`rm -rf ${WORK}`);
async function school(){ const ctx=await chromium.launchPersistentContext(`${WORK}/school`,{viewport:{width:1366,height:850}}); const p=ctx.pages()[0]||await ctx.newPage(); p.on('pageerror',e=>errors.push('S '+e.message)); p.on('dialog',d=>d.accept()); return {ctx,p}; }
const T=p=>p.innerText('body');
// 1 activate
let {ctx,p}=await school();
await p.goto(SCHOOL,{waitUntil:'networkidle'}); await p.waitForTimeout(800);
const hwid=(await p.locator('[data-testid=machine-hwid]').innerText()).trim();
const token=execSync(`MADRASA_LICENSE_DIR=${LICENSE_DIR} node tools/license/issue-license.cjs --school "مدرسة الأمل التجريبية" --hwid ${hwid} --type annual --phone 0915551234`,{cwd:new URL('../..', import.meta.url).pathname}).toString().match(/MADRASA-v3-\S+/)[0];
await p.getByPlaceholder('MADRASA-v3-...').fill(token);
await p.getByRole('button',{name:/تأكيد وتفعيل المنظومة/}).click();
await p.waitForTimeout(1200);
await p.locator('#setup-pass').fill('Amal#2026x'); await p.locator('#setup-pass2').fill('Amal#2026x');
await p.locator('form button[type=submit]').last().click();
await p.waitForTimeout(3000);
ok('المدرسة: تفعيل بترخيص ودخول المدير', (await T(p)).includes('لوحة تحكم إدارة المدرسة'));
// 2 import fictional package
await p.locator('[title="أدوات ومميزات المنظومة السريعة"]').first().click(); await p.waitForTimeout(300);
await p.getByText(/المدارس \(إضافة/).first().click(); await p.waitForTimeout(500);
await p.locator('input[type=file][accept=".json"]').setInputFiles(PKG);
await p.waitForTimeout(2500);
await p.keyboard.press('Escape');
// 3 enable parent app sync
await p.goto(SCHOOL,{waitUntil:'networkidle'}); await p.waitForTimeout(1500);
await p.getByRole('button',{name:/تطبيق أولياء الأمور/}).click();
await p.getByLabel('تفعيل المزامنة').check();
await p.locator('#relay-url').fill(RELAY);
await p.getByRole('button',{name:/^حفظ$/}).click();
for (let i=0;i<40;i++){ await p.waitForTimeout(1000); const st=await p.locator('[data-testid=parent-sync-state]').innerText(); if(/تعمل|خطأ/.test(st)) break; }
const st=await p.locator('[data-testid=parent-sync-state]').innerText();
const err=await p.locator('[role=alert]').allInnerTexts();
ok('المدرسة: المزامنة تعمل', st.includes('تعمل'), st+' '+err.join(' '));
await p.getByLabel('إغلاق').first().click();
// card for student A
await p.getByRole('button',{name:/بطاقات دخول أولياء الأمور/}).click();
await p.locator('select[aria-label="الفصل"]').selectOption({label:'فصل 5/1 صباح'}); await p.waitForTimeout(800);
const cards=await p.$$eval('.print-portal-root .break-inside-avoid',els=>els.map(e=>e.innerText));
const c=cards.find(x=>x.includes('يوسف'));
const A={id:c.match(/رقم الدخول: (\S+)/)[1], pin:c.match(/رمز ولي الأمر: (\d+)/)[1]};
await ctx.close();
// relay stores no plaintext
const dump=RELAY_DATA?execSync(`cat ${RELAY_DATA}/schools/*.json`).toString():'';
if (RELAY_DATA) ok('الخادم: لا أسماء ولا أرقام وطنية مقروءة', !dump.includes('يوسف') && !dump.includes('120150000101') && !dump.includes(A.pin), `${dump.length} bytes`);
// 4 parent phone via card link
const pctx=await chromium.launchPersistentContext(`${WORK}/phone`,{viewport:{width:390,height:844}});
const pp=pctx.pages()[0]||await pctx.newPage(); pp.on('pageerror',e=>errors.push('P '+e.message)); pp.on('dialog',d=>d.accept());
await pp.goto(`${RELAY}/#id=${A.id}&code=000000`,{waitUntil:'networkidle'}); await pp.waitForTimeout(2500);
ok('ولي الأمر: رمز خاطئ مرفوض', (await T(pp)).includes('البطاقة غير معروفة'));
await pp.goto(`${RELAY}/#id=${A.id}&code=${A.pin}`,{waitUntil:'networkidle'}); await pp.waitForTimeout(3500);
const home=await T(pp);
ok('ولي الأمر: يرى ابنه ومدرسته', home.includes('يوسف') && home.includes('مدرسة الأمل التجريبية'));
ok('ولي الأمر: الرمز لا يبقى في شريط العنوان', !pp.url().includes(A.pin), pp.url());
ok('ولي الأمر: لا يرى طالباً آخر', !home.includes('مريم'));
await pp.getByRole('button',{name:/الرسائل/}).click(); await pp.waitForTimeout(400);
const contacts=await T(pp);
ok('ولي الأمر: معلم الفصل والأخصائي في جهات الاتصال', contacts.includes('أ. خالد المبروك') && contacts.includes('أ. هدى الزوي'));
await pp.getByText('أ. خالد المبروك').click();
await pp.getByLabel('نص الرسالة').fill('السلام عليكم، كيف مستوى يوسف في الرياضيات؟');
await pp.getByLabel('إرسال').click(); await pp.waitForTimeout(800);
ok('ولي الأمر: الرسالة بانتظار الوصول', (await T(pp)).includes('بانتظار وصولها'));
await pp.getByRole('button',{name:/الرئيسية/}).click();
await pp.getByText('تقديم عذر غياب').first().click();
await pp.getByLabel('سبب الغياب').fill('مراجعة طبية في المستشفى');
await pp.getByRole('button',{name:'إرسال العذر'}).click(); await pp.waitForTimeout(800);
ok('ولي الأمر: العذر أُرسل', (await T(pp)).includes('أُرسل العذر'));
// 5 school pulls
({ctx,p}=await school());
await p.goto(SCHOOL,{waitUntil:'networkidle'}); await p.waitForTimeout(1500);
await p.getByRole('button',{name:/تطبيق أولياء الأمور/}).click();
await p.getByRole('button',{name:/مزامنة الآن/}).click();
for (let i=0;i<30;i++){ await p.waitForTimeout(1000); if((await p.locator('[data-testid=parent-sync-state]').innerText()).includes('تعمل')) break; }
await p.waitForTimeout(6000);
const conv=await p.evaluate(()=>JSON.parse(localStorage.getItem('madrasa_db_conversations_v3')||'[]'));
const notifs=await p.evaluate(()=>JSON.parse(localStorage.getItem('madrasa_db_notifications_v3')||'[]'));
ok('المدرسة: رسالة ولي الأمر وصلت لمحادثة المعلم', conv.some(c=>c.teacherId==='t-math' && c.studentId==='st-a' && c.messages.some(m=>m.text.includes('مستوى يوسف'))), JSON.stringify(conv).slice(0,150));
ok('المدرسة: العذر تنبيه للمراجعة دون تغيير الحضور', notifs.some(n=>n.title.includes('عذر غياب') && n.message.includes('مراجعة طبية')));
const stA = await p.evaluate(()=>JSON.parse(localStorage.getItem('madrasa_db_students_v3')).find(s=>s.id==='st-a'));
ok('المدرسة: سجل الحضور لم يتغير بالعذر', !(stA.recentAttendance||[]).length && !stA._att);
await ctx.close();
// 6 parent sees delivered
await pp.goto(RELAY,{waitUntil:'networkidle'}); await pp.waitForTimeout(2500);
await pp.getByRole('button',{name:/الرسائل/}).click(); await pp.getByText('أ. خالد المبروك').click(); await pp.waitForTimeout(500);
const th=await T(pp);
ok('ولي الأمر: الرسالة وصلت (لم تعد بالانتظار)', th.includes('مستوى يوسف') && !th.includes('بانتظار وصولها'));
await pp.getByLabel('تسجيل الخروج').click(); await pp.waitForTimeout(800);
ok('ولي الأمر: الخروج يزيل البطاقة من الهاتف', (await T(pp)).includes('رمز ولي الأمر') && (await pp.evaluate(()=>localStorage.getItem('mp_children_v1')))==='[]');
await pctx.close();
ok('لا أخطاء تشغيل', errors.length===0, errors.join(' | ').slice(0,300));

const failed=results.filter(r=>!r).length;
console.log(`\n${results.length-failed}/${results.length} ناجح`);
process.exit(failed?1:0);
