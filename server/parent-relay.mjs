#!/usr/bin/env node
/**
 * ============================================================================
 * خادم تطبيق ولي الأمر (يشغّله المورّد) — Node 18+ بدون أي حزم خارجية
 * ----------------------------------------------------------------------------
 * 1. حاسوب المدرسة يرفع ملخص كل طالب مشفّراً ببطاقة ولي أمره (POST /v1/publish).
 *    المصادقة بمفتاح ترخيص المدرسة نفسه (MADRASA-v3 موقّع Ed25519):
 *    مدرسة بلا ترخيص ساري لا ترفع شيئاً.
 * 2. تطبيق ولي الأمر يطلب ملخص ابنه بمعرّف البحث (GET /v1/view/:lid) ويفك تشفيره
 *    على الهاتف. الخادم لا يملك المفاتيح ولا يرى أي بيانات مقروءة.
 * 3. رسائل ولي الأمر (مشفّرة أيضاً) تُوضع في صندوق المدرسة، وحاسوب المدرسة يسحبها.
 * ويقدّم ملفات تطبيق ولي الأمر نفسها (dist-parent) على نفس النطاق.
 *
 * التشغيل: npm run build:parent && node server/parent-relay.mjs
 * المتغيرات: PORT (8787) • DATA_DIR (./relay-data) • STATIC_DIR (./dist-parent)
 *            LICENSE_PUBLIC_KEY_HEX (افتراضياً من src/services/licensing/licensePublicKey.ts)
 * في الإنتاج يوضع خلف HTTPS (Caddy/Nginx) — التطبيق يحتاج https لتعمل أدوات التشفير.
 * ============================================================================
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const PORT = Number(process.env.PORT || 8787);
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'relay-data'));
const STATIC_DIR = path.resolve(process.env.STATIC_DIR || path.join(ROOT, 'dist-parent'));

const LIMITS = {
  publishBody: 24 * 1024 * 1024,
  blob: 256 * 1024,
  inboxBlob: 16 * 1024,
  lidsPerSchool: 5000,
  inboxPerSchool: 5000,
  // شبكات الجوال في ليبيا تضع آلاف المشتركين خلف عنوان واحد (CGNAT): حدود العنوان واسعة،
  // والحماية الفعلية في معرّف البحث (64 خانة لا تُخمَّن) والحد اليومي لكل بطاقة
  viewPerIpPerMin: 3000,
  inboxPerIpPerMin: 300,
  inboxPerLidPerDay: 60,
};

// ─────────────────────────────── الترخيص ───────────────────────────────
function loadPublicKeyHex() {
  if (process.env.LICENSE_PUBLIC_KEY_HEX) return process.env.LICENSE_PUBLIC_KEY_HEX.trim().toLowerCase();
  const src = fs.readFileSync(path.join(ROOT, 'src/services/licensing/licensePublicKey.ts'), 'utf8');
  const m = src.match(/LICENSE_PUBLIC_KEY_HEX\s*=\s*'([0-9a-f]{64})'/i);
  if (!m) throw new Error('LICENSE_PUBLIC_KEY_HEX غير موجود');
  return m[1].toLowerCase();
}
const PUBLIC_KEY = crypto.createPublicKey({
  key: Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), Buffer.from(loadPublicKeyHex(), 'hex')]),
  format: 'der',
  type: 'spki',
});

const b64uToBuf = s => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

/** يعيد { schoolKey, schoolName, expiresAt } أو يرمي رسالة مفهومة */
export function verifyLicense(header) {
  const m = /^License\s+(MADRASA-v3-[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+)$/.exec(String(header || '').trim());
  if (!m) throw httpError(401, 'مفتاح الترخيص مطلوب');
  const rest = m[1].slice('MADRASA-v3-'.length);
  const dot = rest.lastIndexOf('.');
  const body = rest.slice(0, dot);
  const sig = b64uToBuf(rest.slice(dot + 1));
  if (sig.length !== 64 || !crypto.verify(null, Buffer.from(body, 'utf8'), PUBLIC_KEY, sig)) {
    throw httpError(401, 'توقيع الترخيص غير صالح');
  }
  const payload = JSON.parse(b64uToBuf(body).toString('utf8'));
  if (payload.v !== 3 || !payload.schoolName || !payload.expiresAt) throw httpError(401, 'ترخيص تالف');
  if (Date.parse(payload.expiresAt) < Date.now()) throw httpError(402, 'انتهى اشتراك المدرسة — جدّد الترخيص لتحديث تطبيق أولياء الأمور');
  // هوية المدرسة ثابتة عبر التجديد: نفس الجهاز ونفس الاسم ← نفس المساحة
  const schoolKey = crypto.createHash('sha256').update(`${String(payload.hwid).toUpperCase()}|${payload.schoolName.trim()}`).digest('hex').slice(0, 24);
  return { schoolKey, schoolName: payload.schoolName.trim(), expiresAt: payload.expiresAt };
}

// ─────────────────────────────── التخزين ───────────────────────────────
const schools = new Map(); // schoolKey -> { schoolKey, schoolName, views: {lid: {b, t}}, inbox: [{id, lid, b, t}], seq }
const lidOwner = new Map(); // lid -> schoolKey
const dirty = new Set();

function loadAll() {
  fs.mkdirSync(path.join(DATA_DIR, 'schools'), { recursive: true });
  for (const f of fs.readdirSync(path.join(DATA_DIR, 'schools'))) {
    if (!f.endsWith('.json')) continue;
    try {
      const s = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'schools', f), 'utf8'));
      schools.set(s.schoolKey, s);
      for (const lid of Object.keys(s.views || {})) lidOwner.set(lid, s.schoolKey);
    } catch (e) {
      console.error('تعذر قراءة', f, e.message);
    }
  }
}

function school(key, name) {
  let s = schools.get(key);
  if (!s) {
    s = { schoolKey: key, schoolName: name, views: {}, inbox: [], seq: 0 };
    schools.set(key, s);
  }
  if (name) s.schoolName = name;
  return s;
}

function markDirty(key) {
  dirty.add(key);
}

function flush() {
  for (const key of [...dirty]) {
    const s = schools.get(key);
    if (!s) { dirty.delete(key); continue; }
    try {
      fs.mkdirSync(path.join(DATA_DIR, 'schools'), { recursive: true });
      const file = path.join(DATA_DIR, 'schools', `${key}.json`);
      const tmp = `${file}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(s));
      fs.renameSync(tmp, file);
      dirty.delete(key);
    } catch (e) {
      // القرص ممتلئ/المجلد حُذف: يبقى في الذاكرة ويُعاد المحاولة في الدورة التالية — الخادم لا يتوقف
      console.error('تعذر حفظ بيانات مدرسة', key, e.message);
    }
  }
}
setInterval(flush, 1000).unref();
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { flush(); process.exit(0); });

// ─────────────────────────────── حدود المعدل ───────────────────────────────
const buckets = new Map();
function rateLimited(key, limit, windowMs) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.start > windowMs) {
    buckets.set(key, { start: now, n: 1 });
    return false;
  }
  b.n += 1;
  return b.n > limit;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) if (now - b.start > 24 * 3600_000) buckets.delete(k);
}, 600_000).unref();

// ─────────────────────────────── HTTP ───────────────────────────────
function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

const LID_RE = /^[0-9a-f]{64}$/;
const BLOB_RE = /^v1\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+$/;

function readBody(req, max) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > max) {
        reject(httpError(413, 'الطلب أكبر من المسموح'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(httpError(400, 'JSON غير صالح'));
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(body));
}

const clientIp = req => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';

async function api(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean); // ['v1', ...]

  if (req.method === 'GET' && parts[1] === 'health') return send(res, 200, { ok: true });

  // ولي الأمر: ملخص ابنه المشفّر
  if (req.method === 'GET' && parts[1] === 'view' && LID_RE.test(parts[2] || '')) {
    if (rateLimited(`v:${clientIp(req)}`, LIMITS.viewPerIpPerMin, 60_000)) throw httpError(429, 'طلبات كثيرة — حاول بعد دقيقة');
    const owner = lidOwner.get(parts[2]);
    const v = owner && schools.get(owner)?.views[parts[2]];
    if (!v) throw httpError(404, 'غير موجود');
    return send(res, 200, { blob: v.b, updatedAt: v.t });
  }

  // ولي الأمر: رسالة مشفّرة للمدرسة
  if (req.method === 'POST' && parts[1] === 'inbox' && LID_RE.test(parts[2] || '')) {
    if (rateLimited(`i:${clientIp(req)}`, LIMITS.inboxPerIpPerMin, 60_000)) throw httpError(429, 'طلبات كثيرة — حاول بعد دقيقة');
    if (rateLimited(`il:${parts[2]}`, LIMITS.inboxPerLidPerDay, 24 * 3600_000)) throw httpError(429, 'تجاوزت عدد الرسائل اليومي');
    const owner = lidOwner.get(parts[2]);
    if (!owner) throw httpError(404, 'غير موجود');
    const body = await readBody(req, LIMITS.inboxBlob + 1024);
    if (typeof body.blob !== 'string' || body.blob.length > LIMITS.inboxBlob || !BLOB_RE.test(body.blob)) throw httpError(400, 'رسالة غير صالحة');
    const s = schools.get(owner);
    if (s.inbox.length >= LIMITS.inboxPerSchool) throw httpError(507, 'صندوق المدرسة ممتلئ مؤقتاً');
    s.seq += 1;
    s.inbox.push({ id: s.seq, lid: parts[2], b: body.blob, t: new Date().toISOString() });
    markDirty(owner);
    return send(res, 201, { ok: true });
  }

  // ─── طلبات المدرسة (مفتاح الترخيص) ───
  const lic = verifyLicense(req.headers.authorization);
  const s = school(lic.schoolKey, lic.schoolName);

  if (req.method === 'POST' && parts[1] === 'publish') {
    const body = await readBody(req, LIMITS.publishBody);
    const items = Array.isArray(body.items) ? body.items : [];
    const now = new Date().toISOString();
    const conflicts = [];
    for (const it of items) {
      if (!it || !LID_RE.test(it.lid) || typeof it.blob !== 'string' || it.blob.length > LIMITS.blob || !BLOB_RE.test(it.blob)) {
        throw httpError(400, 'عنصر غير صالح');
      }
      const owner = lidOwner.get(it.lid);
      if (owner && owner !== s.schoolKey) { conflicts.push(it.lid); continue; }
      if (!s.views[it.lid] && Object.keys(s.views).length >= LIMITS.lidsPerSchool) throw httpError(413, 'تجاوز عدد الطلاب المسموح');
      s.views[it.lid] = { b: it.blob, t: now };
      lidOwner.set(it.lid, s.schoolKey);
    }
    markDirty(s.schoolKey);
    return send(res, 200, { ok: true, stored: items.length - conflicts.length, conflicts });
  }

  // القائمة الكاملة الحالية: يُحذف ما ليس فيها (طالب حُذف أو رمز ولي أمر تغيّر)
  if (req.method === 'POST' && parts[1] === 'prune') {
    const body = await readBody(req, 1024 * 1024);
    if (!Array.isArray(body.lids)) throw httpError(400, 'lids مطلوبة');
    const keep = new Set(body.lids.filter(l => LID_RE.test(l)));
    let removed = 0;
    for (const lid of Object.keys(s.views)) {
      if (!keep.has(lid)) {
        delete s.views[lid];
        lidOwner.delete(lid);
        removed += 1;
      }
    }
    s.inbox = s.inbox.filter(m => keep.has(m.lid));
    markDirty(s.schoolKey);
    // ما تعتقد المدرسة أنه مرفوع وليس على الخادم (مثلاً بعد استعادة الخادم) — تعيد رفعه
    const missing = [...keep].filter(l => !s.views[l]);
    return send(res, 200, { ok: true, removed, missing });
  }

  if (req.method === 'GET' && parts[1] === 'inbox') {
    const after = Number(url.searchParams.get('after') || 0);
    const messages = s.inbox.filter(m => m.id > after).slice(0, 500).map(m => ({ id: m.id, lid: m.lid, blob: m.b, at: m.t }));
    return send(res, 200, { messages });
  }

  if (req.method === 'POST' && parts[1] === 'inbox-ack') {
    const body = await readBody(req, 1024);
    const upTo = Number(body.upTo || 0);
    s.inbox = s.inbox.filter(m => m.id > upTo);
    markDirty(s.schoolKey);
    return send(res, 200, { ok: true });
  }

  if (req.method === 'GET' && parts[1] === 'school-status') {
    return send(res, 200, { schoolName: s.schoolName, views: Object.keys(s.views).length, pendingInbox: s.inbox.length, expiresAt: lic.expiresAt });
  }

  throw httpError(404, 'غير موجود');
}

// ─────────────────────────────── ملفات التطبيق ───────────────────────────────
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
};
const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()',
};

function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  let file = path.join(STATIC_DIR, path.normalize(rel).replace(/^([/\\])+/, ''));
  if (!file.startsWith(STATIC_DIR)) { res.writeHead(403); return res.end(); }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(STATIC_DIR, 'index.html');
  if (!fs.existsSync(file)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('تطبيق ولي الأمر غير مبني بعد: npm run build:parent');
  }
  const ext = path.extname(file).toLowerCase();
  const immutable = file.includes(`${path.sep}assets${path.sep}`);
  res.writeHead(200, {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    ...SECURITY_HEADERS,
  });
  fs.createReadStream(file).pipe(res);
}

export function createRelayServer() {
  loadAll();
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://relay');
    if (url.pathname.startsWith('/v1/')) {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Max-Age': '86400',
        });
        return res.end();
      }
      try {
        await api(req, res, url);
      } catch (e) {
        const status = e.status || 500;
        if (status === 500) console.error(e);
        send(res, status, { error: status === 500 ? 'خطأ في الخادم' : e.message });
      }
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    serveStatic(req, res, url);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createRelayServer().listen(PORT, () => {
    console.log(`خادم تطبيق ولي الأمر يعمل على المنفذ ${PORT} • البيانات: ${DATA_DIR} • التطبيق: ${STATIC_DIR}`);
  });
}
