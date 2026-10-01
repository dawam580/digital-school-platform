/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك التحقق من تواقيع التراخيص وبصمة الجهاز (Offline Ed25519)
 * ----------------------------------------------------------------------------
 * - التراخيص موقّعة بـ Ed25519. البرنامج يحمل المفتاح العام فقط (للتحقق)،
 *   والمفتاح الخاص (للإصدار) يبقى لدى المورّد خارج المشروع.
 *   ⇒ فك ملفات البرنامج لا يكفي لتوليد مفاتيح مزورة.
 * - بصمة الجهاز في نسخة ويندوز مأخوذة من MachineGuid عبر عملية Electron الرئيسية.
 * - ختم بداية التجربة محفوظ خارج بيانات المتصفح أيضاً (لا يُصفَّر بمسح الكاش).
 * ============================================================================
 */

import { ed25519 } from '@noble/curves/ed25519';
import { LICENSE_PUBLIC_KEY_HEX } from './licensePublicKey';

const TOKEN_PREFIX = 'MADRASA-v3-';
const TRIAL_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const STORAGE_KEYS = {
  CLIENT_HWID: 'madrasa_machine_hwid_v2',
  TRIAL_START: 'madrasa_trial_start_timestamp_v2',
  // أختام احتياطية لبداية التجربة: أي حذف لختم واحد يُرمَّم من الباقي،
  // وعند التعارض يُعتمد الأقدم (يمنع تمديد التجربة بحذف المفتاح الأساسي).
  TRIAL_START_MIRROR_A: 'madrasa_trial_seal_a_v2',
  TRIAL_START_MIRROR_B: 'madrasa_trial_seal_b_v2',
  LAST_SEEN_TIME: 'madrasa_clock_guard_last_seen_v2',
};

/**
 * عشوائية مشفرة آمنة (crypto.getRandomValues) مع تراجع آمن لـ Math.random
 * عند غياب WebCrypto — تُستخدم لكل المفاتيح والأكواد المولدة.
 */
export function secureRandomSuffix(length: number): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // بدون الملتبس (0/O/1/I)
  const out: string[] = [];
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const buf = new Uint32Array(length);
      crypto.getRandomValues(buf);
      for (let i = 0; i < length; i++) out.push(alphabet[buf[i] % alphabet.length]);
      return out.join('');
    }
  } catch {}
  for (let i = 0; i < length; i++) {
    out.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
  }
  return out.join('');
}

export interface OfflineLicensePayload {
  v: number;
  id?: string;
  schoolName: string;
  hwid: string; // Machine Hardware ID or '*' for all
  licenseType: 'lifetime' | 'annual' | 'trial_extended';
  issuedAt: string;
  expiresAt: string; // ISO 8601 string
  adminPhone?: string;
  features?: string[];
}

export interface SignedLicenseToken {
  token: string;
  payload: OfflineLicensePayload;
  signature: string;
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

function base64UrlToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const PUBLIC_KEY = hexToBytes(LICENSE_PUBLIC_KEY_HEX);

function desktopApi() {
  return typeof window !== 'undefined' ? window.electronAPI : undefined;
}

/** هل المفتاح بصيغة الترخيص الموقّع (الحالية أو القديمة)؟ */
export function isSignedLicenseFormat(key: string): boolean {
  return /^MADRASA-V[23]-/i.test((key || '').trim());
}

export const CryptoLicenseHelper = {
  /**
   * بصمة الجهاز (Hardware ID) بصيغة HWID-LY-XXXX-XXXX-XXXX
   * نسخة ويندوز: مشتقة من MachineGuid (ثابتة ولا تتغير بمسح بيانات البرنامج).
   * نسخة الويب: معرّف عشوائي محفوظ محلياً (للمعاينة فقط).
   */
  getOrCreateMachineHwid(): string {
    try {
      const api = desktopApi();
      if (api?.getMachineId) {
        const id = api.getMachineId();
        if (id && id.startsWith('HWID-LY-')) return id.toUpperCase();
      }
    } catch {}
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENT_HWID);
      if (saved && saved.trim().startsWith('HWID-LY-')) return saved.trim().toUpperCase();
      const r = secureRandomSuffix(12);
      const hwid = `HWID-LY-${r.slice(0, 4)}-${r.slice(4, 8)}-${r.slice(8, 12)}`;
      localStorage.setItem(STORAGE_KEYS.CLIENT_HWID, hwid);
      return hwid;
    } catch {
      return 'HWID-LY-UNKNOWN';
    }
  },

  /**
   * فحص التلاعب بساعة الويندوز (Clock Rollback Detection)
   * إذا رجع العميل التاريخ للوراء لأكثر من ساعتين يُعتبر تلاعباً
   */
  checkClockTampering(): { tampered: boolean; reason?: string } {
    try {
      const now = Date.now();
      const lastSeen = Number(localStorage.getItem(STORAGE_KEYS.LAST_SEEN_TIME) || 0);

      // السماح بهامش ساعتين فقط لاختلاف المناطق الزمنية
      if (lastSeen > 0 && now < lastSeen - (2 * 60 * 60 * 1000)) {
        return { tampered: true, reason: 'تم اكتشاف تراجع في تاريخ أو ساعة جهاز الكمبيوتر لحماية المنظومة.' };
      }

      if (now > lastSeen) {
        localStorage.setItem(STORAGE_KEYS.LAST_SEEN_TIME, String(now));
      }

      return { tampered: false };
    } catch {
      return { tampered: false };
    }
  },

  /**
   * حالة الفترة التجريبية المجانية (7 أيام).
   * الأقدم بين أختام المتصفح وأختام نظام الملفات (نسخة ويندوز) هو المرجع.
   */
  getTrialStatus(): { isTrialActive: boolean; daysRemaining: number; trialEndsAt: string } {
    const now = Date.now();
    let startMs = now;
    try {
      const readSeal = (k: string): number => Number(localStorage.getItem(k) || 0) || 0;
      const seals = [
        readSeal(STORAGE_KEYS.TRIAL_START),
        readSeal(STORAGE_KEYS.TRIAL_START_MIRROR_A),
        readSeal(STORAGE_KEYS.TRIAL_START_MIRROR_B),
      ].filter(v => v > 0);
      startMs = seals.length ? Math.min(...seals) : now;

      const api = desktopApi();
      if (api?.getTrialStart) {
        const fsStart = Number(api.getTrialStart(startMs)) || 0;
        if (fsStart > 0) startMs = Math.min(startMs, fsStart);
      }

      localStorage.setItem(STORAGE_KEYS.TRIAL_START, String(startMs));
      localStorage.setItem(STORAGE_KEYS.TRIAL_START_MIRROR_A, String(startMs));
      localStorage.setItem(STORAGE_KEYS.TRIAL_START_MIRROR_B, String(startMs));
    } catch {}

    const trialEndsMs = startMs + TRIAL_DAYS * DAY_MS;
    const diffMs = trialEndsMs - now;
    return {
      isTrialActive: diffMs > 0,
      daysRemaining: Math.max(0, Math.ceil(diffMs / DAY_MS)),
      trialEndsAt: new Date(trialEndsMs).toISOString(),
    };
  },

  /**
   * إصدار مفتاح ترخيص موقّع — يعمل فقط على جهاز المورّد (نسخة ويندوز
   * التي يوجد عليها ملف المفتاح الخاص). في أي جهاز آخر يُرفض الطلب.
   */
  async signLicenseToken(
    schoolName: string,
    hwid: string,
    licenseType: 'lifetime' | 'annual' | 'trial_extended',
    adminPhone: string = ''
  ): Promise<string> {
    const api = desktopApi();
    if (!api?.signLicense) {
      throw new Error('إصدار التراخيص متاح فقط من نسخة ويندوز على جهاز المورّد المعتمد.');
    }
    const res = await api.signLicense({ schoolName, hwid: hwid || '*', licenseType, adminPhone });
    if (!res.success || !res.token) {
      throw new Error(res.error || 'تعذر توقيع الترخيص.');
    }
    return res.token;
  },

  /** هل هذا الجهاز قادر على إصدار التراخيص (جهاز المورّد)؟ */
  async canSignLicenses(): Promise<boolean> {
    try {
      const api = desktopApi();
      return api?.canSignLicense ? await api.canSignLicense() : false;
    } catch {
      return false;
    }
  },

  /**
   * التحقق من مفتاح الترخيص الموقّع ومطابقته لبصمة هذا الجهاز
   */
  verifyLicenseToken(token: string): {
    isValid: boolean;
    payload?: OfflineLicensePayload;
    errorMessage?: string;
  } {
    try {
      const cleanToken = token.replace(/\s+/g, '').trim();
      if (/^MADRASA-v2-/i.test(cleanToken)) {
        return { isValid: false, errorMessage: 'هذا المفتاح من إصدار قديم لم يعد مدعوماً. تواصل معنا لاستبداله بمفتاح جديد مجاناً.' };
      }
      if (!cleanToken.startsWith(TOKEN_PREFIX)) {
        return { isValid: false, errorMessage: 'صيغة مفتاح الترخيص غير صالحة.' };
      }

      const rest = cleanToken.slice(TOKEN_PREFIX.length);
      const dotIndex = rest.lastIndexOf('.');
      if (dotIndex <= 0) {
        return { isValid: false, errorMessage: 'بنية التوقيع الرقمي للمفتاح غير مكتملة.' };
      }

      const body = rest.substring(0, dotIndex);
      const signature = base64UrlToBytes(rest.substring(dotIndex + 1));
      const signedOk = signature.length === 64 &&
        ed25519.verify(signature, new TextEncoder().encode(body), PUBLIC_KEY);
      if (!signedOk) {
        return { isValid: false, errorMessage: 'التوقيع الرقمي للترخيص غير صالح أو تم التعديل عليه.' };
      }

      const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as OfflineLicensePayload;
      if (!payload || payload.v !== 3 || !payload.schoolName || !payload.expiresAt) {
        return { isValid: false, errorMessage: 'محتوى الترخيص تالف أو غير مقروء.' };
      }

      const clockCheck = this.checkClockTampering();
      if (clockCheck.tampered) {
        return { isValid: false, errorMessage: clockCheck.reason };
      }

      const currentHwid = this.getOrCreateMachineHwid().toUpperCase();
      const licenseHwid = (payload.hwid || '').toUpperCase();
      if (licenseHwid !== '*' && licenseHwid !== currentHwid) {
        return {
          isValid: false,
          errorMessage: `هذا الترخيص مخصص لجهاز كمبيوتر آخر (${licenseHwid}) ولا يطابق كود هذا الجهاز (${currentHwid}).`
        };
      }

      const expiresMs = new Date(payload.expiresAt).getTime();
      if (!Number.isFinite(expiresMs) || Date.now() > expiresMs) {
        return {
          isValid: false,
          payload,
          errorMessage: `انتهت صلاحية هذا الترخيص بتاريخ (${new Date(payload.expiresAt).toLocaleDateString('ar-LY')}).`
        };
      }

      return { isValid: true, payload };
    } catch {
      return { isValid: false, errorMessage: 'فشل قراءة المفتاح. تأكد من نسخه كاملاً.' };
    }
  }
};
