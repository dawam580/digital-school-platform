/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك التشفير والتوقيع الرقمي وبصمة الجهاز (Offline Cryptographic Engine)
 * متوافق 100% مع نمط منظومة بنيان للتراخيص المستقلة بدون إنترنت
 * ============================================================================
 */

// Pure TypeScript implementation of standard SHA-256
function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0, j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash: number[] = [];
  let k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, number> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 = hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
      const temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (let b = 3; b >= 0; b--) {
      const byte = (hash[i] >> (b * 8)) & 255;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

// Master private signing secret (حصري للمشروع لضمان عدم تزوير التراخيص)
const MASTER_SIGNING_SALT = 'MADRASA-SUPER-2026-SECURE-KEY-LIBYA-EDUTECH';

const STORAGE_KEYS = {
  CLIENT_HWID: 'madrasa_machine_hwid_v2',
  TRIAL_START: 'madrasa_trial_start_timestamp_v2',
  LAST_SEEN_TIME: 'madrasa_clock_guard_last_seen_v2',
  PERMANENT_KEY: 'madrasa_permanent_license_v2'
};

export interface OfflineLicensePayload {
  v: number;
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

export const CryptoLicenseHelper = {
  /**
   * توليد أو جلب بصمة الجهاز الفريدة (Hardware ID)
   * تظهر للعميل ككود من 16 خانة مثلاً: HWID-LY-9A2F-4E10
   */
  getOrCreateMachineHwid(): string {
    try {
      let hwid = localStorage.getItem(STORAGE_KEYS.CLIENT_HWID);
      if (hwid && hwid.trim().startsWith('HWID-LY-')) {
        return hwid.trim().toUpperCase();
      }

      // Generate stable pseudo-hardware ID
      const screenInfo = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080';
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'desktop-client';
      const randomSalt = Math.random().toString(36).substring(2, 10);
      const rawEntropy = `${screenInfo}-${userAgent}-${randomSalt}-${Date.now()}`;
      const hash = sha256(rawEntropy).toUpperCase();

      hwid = `HWID-LY-${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}`;
      localStorage.setItem(STORAGE_KEYS.CLIENT_HWID, hwid);
      return hwid;
    } catch {
      return 'HWID-LY-DEFAULT-2026';
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
   * حساب حالة الفترة التجريبية المجانية (7 أيام)
   */
  getTrialStatus(): { isTrialActive: boolean; daysRemaining: number; trialEndsAt: string } {
    try {
      let startMs = Number(localStorage.getItem(STORAGE_KEYS.TRIAL_START) || 0);
      const now = Date.now();

      if (!startMs) {
        startMs = now;
        localStorage.setItem(STORAGE_KEYS.TRIAL_START, String(startMs));
      }

      const trialDurationMs = 7 * 24 * 60 * 60 * 1000; // 7 Days
      const trialEndsMs = startMs + trialDurationMs;
      const diffMs = trialEndsMs - now;
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));

      return {
        isTrialActive: diffMs > 0,
        daysRemaining,
        trialEndsAt: new Date(trialEndsMs).toISOString()
      };
    } catch {
      return { isTrialActive: true, daysRemaining: 7, trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString() };
    }
  },

  /**
   * توليد مفتاح ترخيص مشفر وموقع رقمياً (خاص بالسوبر أدمن فقط)
   */
  generateLicenseToken(
    schoolName: string,
    hwid: string,
    licenseType: 'lifetime' | 'annual' | 'trial_extended',
    adminPhone: string = ''
  ): string {
    const now = new Date();
    let expiresAt: string;

    if (licenseType === 'lifetime') {
      expiresAt = '2099-12-31T23:59:59.000Z'; // مدى الحياة
    } else if (licenseType === 'annual') {
      const nextYear = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
      expiresAt = nextYear.toISOString(); // سنة كاملة
    } else {
      const extra14 = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000));
      expiresAt = extra14.toISOString(); // تمديد تجريبي
    }

    const payload: OfflineLicensePayload = {
      v: 2,
      schoolName: schoolName.trim(),
      hwid: (hwid.trim() || '*').toUpperCase(),
      licenseType,
      issuedAt: now.toISOString(),
      expiresAt,
      adminPhone: adminPhone.trim()
    };

    const canonicalString = JSON.stringify(payload);
    const signature = sha256(`${canonicalString}|${MASTER_SIGNING_SALT}`);

    // Base64 encoding for safe transport
    const base64Payload = typeof btoa !== 'undefined'
      ? btoa(unescape(encodeURIComponent(canonicalString)))
      : Buffer.from(canonicalString, 'utf-8').toString('base64');

    return `MADRASA-v2-${base64Payload}.${signature}`;
  },

  /**
   * التحقق من مفتاح الترخيص المشفر ومطابقته لبصمة هذا الجهاز
   */
  verifyLicenseToken(token: string): {
    isValid: boolean;
    payload?: OfflineLicensePayload;
    errorMessage?: string;
  } {
    try {
      const cleanToken = token.trim();
      if (!cleanToken.startsWith('MADRASA-v2-')) {
        return { isValid: false, errorMessage: 'صيغة مفتاح الترخيص غير صالحة.' };
      }

      const rest = cleanToken.slice('MADRASA-v2-'.length);
      const dotIndex = rest.lastIndexOf('.');
      if (dotIndex === -1) {
        return { isValid: false, errorMessage: 'بنية التوقيع الرقمي للمفتاح غير مكتملة.' };
      }

      const base64Payload = rest.substring(0, dotIndex);
      const signature = rest.substring(dotIndex + 1);

      // Decode payload
      const jsonStr = typeof atob !== 'undefined'
        ? decodeURIComponent(escape(atob(base64Payload)))
        : Buffer.from(base64Payload, 'base64').toString('utf-8');

      const payload = JSON.parse(jsonStr) as OfflineLicensePayload;
      if (!payload || !payload.schoolName || !payload.expiresAt) {
        return { isValid: false, errorMessage: 'محتوى الترخيص تالف أو غير مقروء.' };
      }

      // Verify Signature
      const expectedSig = sha256(`${jsonStr}|${MASTER_SIGNING_SALT}`);
      if (signature.toLowerCase() !== expectedSig.toLowerCase()) {
        return { isValid: false, errorMessage: 'التوقيع الرقمي للترخيص غير صالح أو تم التعديل عليه.' };
      }

      // Verify Clock Tampering
      const clockCheck = this.checkClockTampering();
      if (clockCheck.tampered) {
        return { isValid: false, errorMessage: clockCheck.reason };
      }

      // Verify Hardware ID Binding
      const currentHwid = this.getOrCreateMachineHwid().toUpperCase();
      const licenseHwid = payload.hwid.toUpperCase();
      if (licenseHwid !== '*' && licenseHwid !== currentHwid) {
        return {
          isValid: false,
          errorMessage: `هذا الترخيص مخصص لجهاز كمبيوتر آخر (${licenseHwid}) ولا يطابق كود هذا الجهاز (${currentHwid}).`
        };
      }

      // Verify Expiration Date
      const expiresMs = new Date(payload.expiresAt).getTime();
      if (Date.now() > expiresMs) {
        return {
          isValid: false,
          payload,
          errorMessage: `انتهت صلاحية هذا الترخيص بتاريخ (${new Date(payload.expiresAt).toLocaleDateString('ar-LY')}).`
        };
      }

      return {
        isValid: true,
        payload
      };
    } catch (err: any) {
      return { isValid: false, errorMessage: 'فشل فك تشفير المفتاح. تأكد من نسخه كاملاً.' };
    }
  }
};
