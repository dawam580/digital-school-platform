/**
 * تطبيق ولي الأمر: التشفير طرف لطرف + خادم المورّد (ترخيص حقيقي موقّع Ed25519).
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { importSrc } from './build-module.mjs';

const pc = await importSrc('src/parent-sync/crypto.ts');
const proto = await importSrc('src/parent-sync/protocol.ts');

// مفتاح توقيع اختبار (لا علاقة له بمفتاح المورّد الحقيقي)
const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
const pubHex = publicKey.export({ format: 'der', type: 'spki' }).subarray(-32).toString('hex');
const b64u = buf => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
function license({ schoolName = 'مدرسة النور', hwid = 'HWID-LY-AAAA-BBBB-CCCC', days = 365 } = {}) {
  const payload = { v: 3, id: crypto.randomBytes(8).toString('hex'), schoolName, hwid, licenseType: 'annual', issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + days * 864e5).toISOString(), adminPhone: '' };
  const body = b64u(Buffer.from(JSON.stringify(payload)));
  return `MADRASA-v3-${body}.${b64u(crypto.sign(null, Buffer.from(body), privateKey))}`;
}

const dataDir = mkdtempSync(path.join(tmpdir(), 'relay-test-'));
process.env.LICENSE_PUBLIC_KEY_HEX = pubHex;
process.env.DATA_DIR = dataDir;
process.env.STATIC_DIR = path.join(dataDir, 'no-static');
const { createRelayServer } = await import('../../server/parent-relay.mjs');
let server, base;
before(async () => {
  server = createRelayServer();
  await new Promise(r => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); rmSync(dataDir, { recursive: true, force: true }); });

const call = async (method, p, body, lic) => {
  const res = await fetch(base + p, {
    method,
    headers: { 'Content-Type': 'application/json', ...(lic ? { Authorization: `License ${lic}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json().catch(() => null) };
};

test('الاشتقاق ثابت، والرمز الخاطئ لا يفك التشفير', async () => {
  const a = await pc.deriveParentKeys('١٢٠١٥٠٠٠٠٠٠١', '٤٨٢٩١٧');
  const b = await pc.deriveParentKeys('120150000001', '482917');
  assert.equal(a.lid, b.lid);
  assert.match(a.lid, /^[0-9a-f]{64}$/);
  const blob = await pc.sealJson(a, { hello: 'سلام' });
  assert.deepEqual(await pc.openJson(b, blob), { hello: 'سلام' });
  const wrong = await pc.deriveParentKeys('120150000001', '482918');
  assert.notEqual(wrong.lid, a.lid);
  await assert.rejects(pc.openJson({ ...wrong, lid: a.lid }, blob));
});

test('ملخص ولي الأمر: درجات محجوبة، وإشعارات ومحادثات ابنه فقط', () => {
  const st = { id: 's1', name: 'سالم علي', className: '5/1', grade: 'الصف الخامس الأساسي', gender: 'male', behaviorPointsTotal: 3,
    recentAttendance: [{ date: '2026-10-04', status: 'unexcused' }], grades: [{ subjectName: 'الرياضيات', teacherName: 'أ. خالد', total: 80, maxTotal: 100, appreciation: 'جيد جداً' }] };
  const teachers = [
    { id: 't1', code: 'LIB-MATH-01', name: 'أ. خالد', subject: 'الرياضيات', subjectCode: 'MATH', assignedClasses: ['5/1'], status: 'active' },
    { id: 't2', code: 'LIB-ARB-02', name: 'أ. منى', subject: 'العربية', subjectCode: 'ARB', assignedClasses: ['6/1'] },
    { id: 'c1', code: 'LIB-SOC-01', name: 'أ. هدى', subject: 'إرشاد', subjectCode: 'COUNSEL', assignedClasses: [] },
  ];
  const notifications = [
    { id: 'n1', title: 'غياب', message: '', date: '', time: '', category: 'attendance', studentId: 's1', targetRole: 'parent' },
    { id: 'n2', title: 'غياب آخر', message: '', date: '', time: '', category: 'attendance', studentId: 's2', targetRole: 'parent' },
    { id: 'n3', title: 'للمعلمين', message: '', date: '', time: '', category: 'admin', targetRole: 'teacher' },
    { id: 'n4', title: 'تعميم', message: '', date: '', time: '', category: 'admin', targetRole: 'all' },
  ];
  const conversations = [
    { id: 'conv_t1_s1', teacherId: 't1', teacherName: 'أ. خالد', studentId: 's1', messages: [{ id: 'm1', senderRole: 'teacher', senderName: 'أ. خالد', text: 'مرحباً', timestamp: '10:00', read: false }] },
    { id: 'conv_t1_s2', teacherId: 't1', teacherName: 'أ. خالد', studentId: 's2', messages: [{ id: 'm2', senderRole: 'teacher', senderName: 'أ. خالد', text: 'سر', timestamp: '10:00', read: false }] },
  ];
  const input = { student: st, school: { name: 'مدرسة النور', directorPhone: '0915551234', academicYear: '2026 - 2027 م', district: '' }, teachers, notifications, conversations, summons: [], nameIsUnique: true };
  const open = proto.buildParentView({ ...input, exam: { held: false, official: null } });
  assert.deepEqual(open.notifications.map(n => n.id), ['n1', 'n4']);
  assert.deepEqual(open.contacts.map(c => c.teacherId), ['t1', 'c1']);
  assert.equal(open.threads.length, 1);
  assert.equal(open.threads[0].messages[0].text, 'مرحباً');
  assert.equal(open.grades.items.length, 1);
  const held = proto.buildParentView({ ...input, exam: { held: true, official: null } });
  assert.equal(held.grades.items.length, 0);
  assert.equal(JSON.stringify(held).includes('s2'), false);
});

test('رسائل ولي الأمر: يُرفض ما يخص طالباً آخر أو نوعاً غير معروف', () => {
  assert.ok(proto.validateInboxMessage({ id: 'x', type: 'chat', studentId: 's1', teacherId: 't1', text: ' مرحبا ', sentAt: 'now' }, 's1'));
  assert.equal(proto.validateInboxMessage({ id: 'x', type: 'chat', studentId: 's2', teacherId: 't1', text: 'a', sentAt: 'now' }, 's1'), null);
  assert.equal(proto.validateInboxMessage({ id: 'x', type: 'grade-change', studentId: 's1', sentAt: 'now' }, 's1'), null);
  assert.equal(proto.validateInboxMessage({ id: 'x', type: 'excuse', studentId: 's1', date: 'أمس', reason: 'مرض', sentAt: 'now' }, 's1'), null);
});

test('الخادم: نشر بترخيص ← قراءة ولي الأمر ← رسالة ← سحب المدرسة', async () => {
  const lic = license();
  const keys = await pc.deriveParentKeys('120150000001', '482917');
  const blob = await pc.sealJson(keys, { student: 'سالم' });

  assert.equal((await call('POST', '/v1/publish', { items: [{ lid: keys.lid, blob }] })).status, 401);
  const forged = lic.slice(0, -4) + 'AAAA';
  assert.equal((await call('POST', '/v1/publish', { items: [{ lid: keys.lid, blob }] }, forged)).status, 401);
  assert.equal((await call('POST', '/v1/publish', { items: [{ lid: keys.lid, blob }] }, license({ days: -1 }))).status, 402);

  const pub = await call('POST', '/v1/publish', { items: [{ lid: keys.lid, blob }] }, lic);
  assert.equal(pub.status, 200);
  const view = await call('GET', `/v1/view/${keys.lid}`);
  assert.equal(view.status, 200);
  assert.deepEqual(await pc.openJson(keys, view.json.blob), { student: 'سالم' });
  assert.equal((await call('GET', `/v1/view/${'0'.repeat(64)}`)).status, 404);

  const msg = await pc.sealJson(keys, { id: 'p1', type: 'chat', studentId: 's1', teacherId: 't1', text: 'شكراً', sentAt: 'x' });
  assert.equal((await call('POST', `/v1/inbox/${keys.lid}`, { blob: msg })).status, 201);
  assert.equal((await call('POST', `/v1/inbox/${'1'.repeat(64)}`, { blob: msg })).status, 404);

  // تجديد الترخيص (معرّف جديد، نفس الجهاز والاسم) يرى نفس صندوق المدرسة
  const renewed = license();
  const inbox = await call('GET', '/v1/inbox?after=0', null, renewed);
  assert.equal(inbox.json.messages.length, 1);
  assert.equal((await pc.openJson(keys, inbox.json.messages[0].blob)).text, 'شكراً');
  await call('POST', '/v1/inbox-ack', { upTo: inbox.json.messages[0].id }, renewed);
  assert.equal((await call('GET', '/v1/inbox?after=0', null, lic)).json.messages.length, 0);

  // مدرسة أخرى لا تستطيع الكتابة فوق ملخص طالب ليس لها
  const other = license({ schoolName: 'مدرسة أخرى', hwid: 'HWID-LY-DDDD-EEEE-FFFF' });
  const hijack = await call('POST', '/v1/publish', { items: [{ lid: keys.lid, blob: await pc.sealJson(keys, { evil: 1 }) }] }, other);
  assert.deepEqual(hijack.json.conflicts, [keys.lid]);
  assert.deepEqual(await pc.openJson(keys, (await call('GET', `/v1/view/${keys.lid}`)).json.blob), { student: 'سالم' });

  // القائمة الكاملة الحالية تحذف ما لم يعد موجوداً (طالب حُذف أو رمز أُعيد توليده)
  const prune = await call('POST', '/v1/prune', { lids: [] }, lic);
  assert.equal(prune.json.removed, 1);
  assert.equal((await call('GET', `/v1/view/${keys.lid}`)).status, 404);
});
