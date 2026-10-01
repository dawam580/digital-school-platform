/**
 * اختبارات حقيقية لمنظومة الترخيص (تشغّل src/services/licensing الفعلي).
 * تُصدر المفاتيح بنفس كود المورّد (electron/vendorKey.cjs) لكن بمفتاح اختبار مؤقت.
 */
import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { importSrc, installLocalStorage } from './build-module.mjs';

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// سجل التراخيص للاختبار في مجلد مؤقت — لا نلمس سجل المورّد الحقيقي
process.env.MADRASA_LICENSE_DIR = mkdtempSync(path.join(tmpdir(), 'madrasa-vendor-'));
const require = createRequire(import.meta.url);
const { signLicense, publicKeyHex } = require('../../electron/vendorKey.cjs');

const { privateKey } = crypto.generateKeyPairSync('ed25519');
const attacker = crypto.generateKeyPairSync('ed25519').privateKey;
const overrides = {
  licensePublicKey: `export const LICENSE_PUBLIC_KEY_HEX = '${publicKeyHex(privateKey)}';`
};

let Crypto, Service;
before(async () => {
  installLocalStorage();
  ({ CryptoLicenseHelper: Crypto } = await importSrc('src/services/licensing/cryptoHelper.ts', overrides));
  ({ LicenseService: Service } = await importSrc('src/services/licensing/licenseService.ts', overrides));
});
beforeEach(() => { localStorage.clear(); });

const issue = (extra = {}, key = privateKey) =>
  signLicense(key, { schoolName: 'مدرسة الاختبار', hwid: '*', licenseType: 'annual', ...extra }).token;

test('مفتاح موقّع من المورّد يُقبل', () => {
  const res = Crypto.verifyLicenseToken(issue());
  assert.equal(res.isValid, true, res.errorMessage);
  assert.equal(res.payload.schoolName, 'مدرسة الاختبار');
});

test('مفتاح موقّع بمفتاح خاص آخر (مزوّر) يُرفض', () => {
  assert.equal(Crypto.verifyLicenseToken(issue({}, attacker)).isValid, false);
});

test('تعديل محتوى المفتاح بعد التوقيع يُكتشف', () => {
  const token = issue({ licenseType: 'trial_extended' });
  const [body, sig] = token.slice('MADRASA-v3-'.length).split('.');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  payload.licenseType = 'lifetime';
  payload.expiresAt = '2099-12-31T23:59:59.000Z';
  const forged = `MADRASA-v3-${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${sig}`;
  assert.equal(Crypto.verifyLicenseToken(forged).isValid, false);
});

test('مفاتيح v2 القديمة (السر المكشوف في الكود) تُرفض', () => {
  const payload = JSON.stringify({ v: 2, schoolName: 'x', hwid: '*', licenseType: 'lifetime', issuedAt: '2026-01-01', expiresAt: '2099-12-31T00:00:00Z' });
  const legacySalt = 'MADRASA-SUPER-2026-SECURE-KEY-LIBYA-EDUTECH';
  const sig = crypto.createHash('sha256').update(`${payload}|${legacySalt}`).digest('hex');
  const res = Crypto.verifyLicenseToken(`MADRASA-v2-${Buffer.from(payload).toString('base64')}.${sig}`);
  assert.equal(res.isValid, false);
});

test('مفتاح مربوط ببصمة جهاز آخر يُرفض، وبصمة هذا الجهاز تُقبل', () => {
  const myHwid = Crypto.getOrCreateMachineHwid();
  assert.equal(Crypto.verifyLicenseToken(issue({ hwid: 'HWID-LY-AAAA-BBBB-CCCC' })).isValid, false);
  assert.equal(Crypto.verifyLicenseToken(issue({ hwid: myHwid })).isValid, true);
});

test('وثيقة "مفعّل" مزروعة يدوياً في التخزين لا تفعّل المنظومة', async () => {
  localStorage.setItem('madrasa_active_license_key', 'SCH-FAKE-2026');
  localStorage.setItem('madrasa_cached_license_doc_v1', JSON.stringify({
    license_key: 'SCH-FAKE-2026', school_name: 'x', subscription_status: 'active',
    trial_ends_at: '2099-01-01T00:00:00Z', subscription_ends_at: '2099-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z', last_verified_at: new Date().toISOString(), offline_grace_allowed_days: 9999
  }));
  const res = await Service.checkSubscription();
  assert.equal(res.status, 'trial');
  assert.ok(res.daysRemaining <= 7);
});

test('بعد انتهاء التجربة: المفتاح غير الموقّع لا يعمل، والموقّع يعمل', async () => {
  const eightDaysAgo = String(Date.now() - 8 * 24 * 60 * 60 * 1000);
  localStorage.setItem('madrasa_trial_start_timestamp_v2', eightDaysAgo);
  localStorage.setItem('madrasa_trial_seal_a_v2', eightDaysAgo);
  const expired = await Service.checkSubscription();
  assert.equal(expired.isValid, false);

  const activation = Service.activateOfflineToken(issue());
  assert.equal(activation.success, true, activation.error);
  const active = await Service.checkSubscription();
  assert.equal(active.isValid, true);
  assert.equal(active.status, 'active');
});

test('حذف ختم واحد للتجربة لا يعيد تصفير العداد', () => {
  const old = String(Date.now() - 6 * 24 * 60 * 60 * 1000);
  localStorage.setItem('madrasa_trial_seal_b_v2', old);
  const t = Crypto.getTrialStatus();
  assert.equal(t.daysRemaining, 1);
});
