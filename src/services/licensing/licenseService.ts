/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك التحقق من التراخيص والاشتراكات السحابية (Cloud License Service)
 * ============================================================================
 */

import { SchoolLicenseDoc, LicenseVerificationResult, SubscriptionStatus, RenewalRequest, RequestedLicenseType } from './licenseTypes';
import { CryptoLicenseHelper, secureRandomSuffix, isSignedLicenseFormat } from './cryptoHelper';

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDSR-Wu-95GoJ_Y63gHGy4IWpbtMvqCNYk",
  authDomain: "madrasa-license-2026.firebaseapp.com",
  projectId: "madrasa-license-2026",
  storageBucket: "madrasa-license-2026.firebasestorage.app",
  messagingSenderId: "819978504512",
  appId: "1:819978504512:web:540db9d20a7697166a12a5"
};

const STORAGE_KEYS = {
  ACTIVE_LICENSE_KEY: 'madrasa_active_license_key',
  CACHED_LICENSE_DOC: 'madrasa_cached_license_doc_v1',
  LOCAL_SCHOOLS_REGISTRY: 'madrasa_admin_schools_registry_v1',
  RENEWAL_REQUESTS: 'madrasa_renewal_requests_v1',
  ACTIVATION_ATTEMPTS: 'madrasa_license_attempt_lock_v1',
};

// خنق محاولات التفعيل: 5 محاولات خاطئة لكل مفتاح = تجميد 60 ثانية (ضد التخمين)
const ACTIVATION_MAX_ATTEMPTS = 5;
const ACTIVATION_LOCK_MS = 60 * 1000;

interface AttemptRecord { count: number; lockUntil: number; }

function readAttemptMap(): Record<string, AttemptRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVATION_ATTEMPTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}
  return {};
}

function writeAttemptMap(map: Record<string, AttemptRecord>): void {
  try {
    // تقليم السجلات المنتهية حتى لا يتضخم المفتاح
    const now = Date.now();
    for (const k of Object.keys(map)) {
      if (map[k].lockUntil < now && map[k].count <= 0) delete map[k];
    }
    localStorage.setItem(STORAGE_KEYS.ACTIVATION_ATTEMPTS, JSON.stringify(map));
  } catch {}
}

// Initial default trial license for newly delivered school platform (7-day trial)
export const DEFAULT_INITIAL_LICENSE: SchoolLicenseDoc = {
  license_key: 'SCH-TRIPOLI-2026-TRIAL',
  school_name: 'منظومة المدرسة الرقمية للتعليم الأساسي',
  subscription_status: 'trial',
  trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days trial
  created_at: new Date().toISOString(),
  admin_phone: '0912345678',
  notes: 'ترخيص تجريبي أولي لمدة أسبوع (7 أيام)',
  offline_grace_allowed_days: 7
};

export class LicenseService {
  /**
   * جلب مفتاح الترخيص المفعل حالياً على هذا الجهاز
   */
  static getActiveLicenseKey(): string | null {
    try {
      const key = localStorage.getItem(STORAGE_KEYS.ACTIVE_LICENSE_KEY);
      if (key && key.trim()) return key.trim();
      // Default to initial license if not yet set so school runs seamlessly
      this.setActiveLicenseKey(DEFAULT_INITIAL_LICENSE.license_key);
      return DEFAULT_INITIAL_LICENSE.license_key;
    } catch {
      return DEFAULT_INITIAL_LICENSE.license_key;
    }
  }

  /**
   * حفظ مفتاح الترخيص عند التفعيل لأول مرة
   * (مفاتيح MADRASA-v3 تُحفظ بحالتها الأصلية لأن Base64 حساسة للأحرف)
   */
  static setActiveLicenseKey(key: string): void {
    try {
      const clean = key.trim();
      localStorage.setItem(
        STORAGE_KEYS.ACTIVE_LICENSE_KEY,
        isSignedLicenseFormat(clean) ? clean : clean.toUpperCase()
      );
    } catch {}
  }

  /**
   * فحص ما إذا كانت البيئة الحالية هي بيئة المطور أو المالك أو بيئة التطوير المحلية
   * المطور والمالك يملكان ترخيصاً نشطاً دائماً ولا تخضع بيئتهما لقفل الفترة التجريبية إطلاقاً.
   */
  static isDeveloperOrOwnerEnvironment(): boolean {
    if (typeof window === 'undefined') return false;

    // 1. جهاز المورّد عبر Electron (يحمل مفتاح توقيع التراخيص — لا يمكن تزويره من المتصفح)
    if (window.electronAPI?.isVendorMachine?.() === true) return true;

    // 2. خادم التطوير Vite (import.meta.env.DEV يُطوى إلى false في بناء الإنتاج)
    if (import.meta.env.DEV) return true;

    // لا تجاوز بالرابط (?developer=true) ولا بالنطاق (github.io) ولا بعلم محلي في localStorage:
    // كلها قابلة للتزوير من أي زائر وكانت تمنح ترخيصاً دائماً مجاناً.
    return false;
  }

  /**
   * جلب الوثيقة المخزنة محلياً في الـ Cache
   */
  static getCachedLicense(): SchoolLicenseDoc | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CACHED_LICENSE_DOC);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.school_name && (parsed.school_name.includes('الأندلس') || parsed.school_name.includes('Andalus'))) {
          localStorage.removeItem(STORAGE_KEYS.CACHED_LICENSE_DOC);
          return null;
        }
        return parsed;
      }
    } catch {}
    return null;
  }

  /**
   * حفظ أو تحديث الوثيقة في الـ Cache
   */
  static setCachedLicense(doc: SchoolLicenseDoc): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CACHED_LICENSE_DOC, JSON.stringify(doc));
    } catch {}
  }

  /**
   * جلب سجل المدارس المعتمدة لدى السوبر أدمن (مخزن محلياً ومتزامن)
   */
  static getAdminRegisteredSchools(): SchoolLicenseDoc[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_SCHOOLS_REGISTRY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter(s => !s.school_name?.includes('الأندلس') && !s.school_name?.includes('Andalus'));
          return cleaned.length > 0 ? cleaned : [DEFAULT_INITIAL_LICENSE];
        }
      }
    } catch {}
    // Seed with default school
    const initial = [DEFAULT_INITIAL_LICENSE];
    this.saveAdminRegisteredSchools(initial);
    return initial;
  }

  static saveAdminRegisteredSchools(schools: SchoolLicenseDoc[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCAL_SCHOOLS_REGISTRY, JSON.stringify(schools));
    } catch {}
  }

  /**
   * فحص حالة اشتراك المدرسة (سحابياً مع دعم الـ Cache ومهلة الـ 7 أيام بدون إنترنت)
   */
  static async checkSubscription(explicitKey?: string): Promise<LicenseVerificationResult> {
    // 0. جهاز المورّد أو بيئة المطور والمالك: ترخيص دائم نشط مدى الحياة لا ينتهي أبداً
    if (!explicitKey && this.isDeveloperOrOwnerEnvironment()) {
      const cached = this.getCachedLicense() || DEFAULT_INITIAL_LICENSE;
      const schoolName = (cached.school_name && !cached.school_name.includes('الأندلس'))
        ? cached.school_name
        : 'منظومة المدرسة الرقمية للتعليم الأساسي';
      const devDoc: SchoolLicenseDoc = {
        license_key: 'DEVELOPER-LIFETIME-KEY',
        school_name: schoolName,
        subscription_status: 'active',
        trial_ends_at: '2099-12-31T23:59:59.000Z',
        subscription_ends_at: '2099-12-31T23:59:59.000Z',
        created_at: new Date().toISOString(),
        notes: 'ترخيص المطور والمالك المعتمد (مدى الحياة)',
        offline_grace_allowed_days: 36500,
        last_verified_at: new Date().toISOString()
      };
      return {
        isValid: true,
        status: 'active',
        schoolName: devDoc.school_name,
        licenseKey: devDoc.license_key,
        daysRemaining: 36500,
        isOfflineGrace: false,
        offlineDaysRemaining: 36500,
        licenseDoc: devDoc
      };
    }
    const rawKey = (explicitKey || this.getActiveLicenseKey() || DEFAULT_INITIAL_LICENSE.license_key).trim();
    // المفاتيح الموقّعة حساسة لحالة الأحرف (Base64) — لا تُوحَّد أحرفها
    const key = isSignedLicenseFormat(rawKey) ? rawKey.replace(/\s+/g, '') : rawKey.toUpperCase();
    const cached = this.getCachedLicense() || this.findInAdminRegistry(key) || {
      ...DEFAULT_INITIAL_LICENSE,
      license_key: key
    };

    // 0. Clock Tampering Guard (حماية من التلاعب بساعة الويندوز)
    const clockCheck = CryptoLicenseHelper.checkClockTampering();
    if (clockCheck.tampered) {
      return {
        isValid: false,
        status: 'suspended',
        schoolName: cached.school_name,
        licenseKey: key,
        daysRemaining: 0,
        isOfflineGrace: true,
        offlineDaysRemaining: 0,
        errorMessage: clockCheck.reason || 'تم اكتشاف تراجع في تاريخ أو ساعة جهاز الكمبيوتر لحماية المنظومة.',
        licenseDoc: cached
      };
    }

    // 1. Check Cryptographically Signed Hardware-Bound Token (MADRASA-v3-)
    if (isSignedLicenseFormat(key)) {
      const vResult = CryptoLicenseHelper.verifyLicenseToken(key);
      if (!vResult.isValid || !vResult.payload) {
        return {
          isValid: false,
          status: 'expired',
          schoolName: vResult.payload?.schoolName || cached.school_name,
          licenseKey: key,
          daysRemaining: 0,
          isOfflineGrace: true,
          offlineDaysRemaining: 0,
          errorMessage: vResult.errorMessage || 'مفتاح الترخيص المشفر غير صالح أو منتهي.',
          licenseDoc: cached
        };
      }
      const payload = vResult.payload;
      // قائمة الإلغاء: مفتاح أبطله المدير العام يُرفض حتى لو توقيعه سليم
      // (تُفحص من السجل المحلي + الكاش — وتُزامَن سحابياً عند توفر الاتصال)
      if (this.isLicenseRevoked(key)) {
        return {
          isValid: false,
          status: 'suspended',
          schoolName: payload.schoolName,
          licenseKey: key,
          daysRemaining: 0,
          isOfflineGrace: true,
          offlineDaysRemaining: 0,
          errorMessage: 'تم إلغاء هذا الترخيص من قبل الإدارة العامة. تواصل معنا لمراجعة الاشتراك.',
          licenseDoc: cached
        };
      }
      const expiresMs = new Date(payload.expiresAt).getTime();
      const isStillValid = Date.now() <= expiresMs;
      const daysRemaining = Math.max(0, Math.ceil((expiresMs - Date.now()) / (1000 * 60 * 60 * 24)));
      return {
        isValid: isStillValid,
        status: isStillValid ? 'active' : 'expired',
        schoolName: payload.schoolName,
        licenseKey: key,
        daysRemaining,
        isOfflineGrace: true,
        offlineDaysRemaining: daysRemaining,
        errorMessage: isStillValid ? undefined : `انتهت صلاحية الترخيص المعتمد بتاريخ ${new Date(payload.expiresAt).toLocaleDateString('ar-LY')}.`,
        licenseDoc: {
          license_key: key,
          school_name: payload.schoolName,
          subscription_status: isStillValid ? 'active' : 'expired',
          trial_ends_at: payload.expiresAt,
          subscription_ends_at: payload.expiresAt,
          created_at: payload.issuedAt,
          admin_phone: payload.adminPhone || '',
          notes: `ترخيص مشفر (${payload.licenseType}) مقيد بالبصمة ${payload.hwid}`,
          offline_grace_allowed_days: 365,
          last_verified_at: new Date().toISOString()
        }
      };
    }

    // 2. أي مفتاح غير موقّع = فترة تجريبية فقط (7 أيام) محسوبة من الأختام المحمية.
    // لا تُمنح حالة "مفعّل" إلا لمفتاح موقّع من المورّد؛ أي وثيقة محلية أو
    // سحابية بحالة active لا تكفي وحدها (كانت قابلة للتعديل من المتصفح).
    const trial = CryptoLicenseHelper.getTrialStatus();
    const trialDoc: SchoolLicenseDoc = {
      ...cached,
      license_key: key,
      subscription_status: trial.isTrialActive ? 'trial' : 'expired',
      trial_ends_at: trial.trialEndsAt,
      subscription_ends_at: undefined,
    };
    return {
      isValid: trial.isTrialActive,
      status: trial.isTrialActive ? 'trial' : 'expired',
      schoolName: cached.school_name,
      licenseKey: key,
      daysRemaining: trial.daysRemaining,
      isOfflineGrace: true,
      offlineDaysRemaining: trial.daysRemaining,
      errorMessage: trial.isTrialActive
        ? undefined
        : 'انتهت الفترة التجريبية المجانية (7 أيام). يرجى التواصل معنا للحصول على مفتاح التفعيل لمنظومتكم.',
      licenseDoc: trialDoc
    };
  }

  /**
   * كتابة أو تحديث مستند المدرسة في Firestore
   */
  static async pushToFirestore(doc: SchoolLicenseDoc): Promise<boolean> {
    const docId = encodeURIComponent(doc.license_key);
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/schools/${docId}?key=${FIREBASE_CONFIG.apiKey}`;

    const payload = {
      fields: {
        license_key: { stringValue: doc.license_key },
        school_name: { stringValue: doc.school_name },
        subscription_status: { stringValue: doc.subscription_status },
        trial_ends_at: { stringValue: doc.trial_ends_at },
        subscription_ends_at: doc.subscription_ends_at ? { stringValue: doc.subscription_ends_at } : { nullValue: null },
        created_at: { stringValue: doc.created_at },
        admin_phone: { stringValue: doc.admin_phone || '' },
        notes: { stringValue: doc.notes || '' },
        bound_hwid: doc.bound_hwid ? { stringValue: doc.bound_hwid } : { nullValue: null },
        revoked: { booleanValue: doc.revoked === true },
        delivered_at: doc.delivered_at ? { stringValue: doc.delivered_at } : { nullValue: null },
        last_verified_at: { stringValue: new Date().toISOString() }
      }
    };

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private static parseFirestoreFields(fields: any): SchoolLicenseDoc {
    return {
      license_key: fields.license_key?.stringValue || '',
      school_name: fields.school_name?.stringValue || '',
      subscription_status: (fields.subscription_status?.stringValue as SubscriptionStatus) || 'trial',
      trial_ends_at: fields.trial_ends_at?.stringValue || new Date().toISOString(),
      subscription_ends_at: fields.subscription_ends_at?.stringValue,
      created_at: fields.created_at?.stringValue || new Date().toISOString(),
      admin_phone: fields.admin_phone?.stringValue,
      notes: fields.notes?.stringValue,
      bound_hwid: fields.bound_hwid?.stringValue,
      revoked: fields.revoked?.booleanValue === true,
      delivered_at: fields.delivered_at?.stringValue,
      last_verified_at: fields.last_verified_at?.stringValue || new Date().toISOString()
    };
  }

  // --- Super Admin Helpers ---

  /**
   * توليد مفتاح ترخيص فريد جديد (عشوائية مشفرة آمنة — غير قابلة للتخمين)
   */
  static generateLicenseKey(): string {
    const part1 = secureRandomSuffix(4);
    const part2 = secureRandomSuffix(4);
    return `SCH-2026-${part1}-${part2}`;
  }

  /**
   * تسجيل مدرسة جديدة لدى السوبر أدمن
   */
  static async registerSchool(params: {
    schoolName: string;
    phone: string;
    trialDays?: number;
    notes?: string;
    customKey?: string;
  }): Promise<SchoolLicenseDoc> {
    const key = (params.customKey || this.generateLicenseKey()).trim().toUpperCase();
    const trialDays = params.trialDays || 14;

    const newSchool: SchoolLicenseDoc = {
      license_key: key,
      school_name: params.schoolName.trim(),
      subscription_status: 'trial',
      trial_ends_at: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      admin_phone: params.phone.trim(),
      notes: params.notes?.trim(),
      offline_grace_allowed_days: 7,
      last_verified_at: new Date().toISOString()
    };

    // Save to admin registry
    const current = this.getAdminRegisteredSchools().filter(s => s.license_key !== key);
    current.unshift(newSchool);
    this.saveAdminRegisteredSchools(current);

    // Sync to Firestore
    this.pushToFirestore(newSchool).catch(() => {});

    return newSchool;
  }

  /**
   * إنشاء وتوليد مفتاح دخول وترخيص رسمي للمنظومة (System Access Key)
   * يتيح للمدارس والزبائن تفعيل نسختهم بصورة معتمدة محلياً وسحابياً
   */
  static generateSchoolAccessKey(params: {
    schoolName: string;
    licenseType: 'annual' | 'lifetime' | 'trial';
    adminPhone?: string;
    district?: string;
    notes?: string;
  }): {
    licenseDoc: SchoolLicenseDoc;
    accessKey: string;
    formattedKeyCard: {
      key: string;
      schoolName: string;
      licenseTypeLabel: string;
      expiresAt: string;
      features: string[];
      verificationCode: string;
    };
  } {
    const rawName = (params.schoolName || 'مدرسة جديدة').trim();
    // Dynamic school identifier (لا تقييد باسم معين)
    const cleanLetters = rawName.replace(/[^A-Za-z]/g, '').toUpperCase();
    const prefix = cleanLetters.length >= 3
      ? cleanLetters.substring(0, 5)
      : 'LIBYA';
    const rand1 = secureRandomSuffix(4);
    const rand2 = secureRandomSuffix(4);
    const accessKey = `MADRASA-2026-${prefix}-${rand1}-${rand2}`;

    const now = new Date();
    let subscription_status: SubscriptionStatus = 'active';
    let subscription_ends_at: string | undefined = undefined;
    let trial_ends_at = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    let licenseTypeLabel = 'ترخيص سنوي معتمد (2025/2026)';
    let expiresAt = '31 أغسطس 2026';

    if (params.licenseType === 'annual') {
      subscription_status = 'active';
      const annualDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      subscription_ends_at = annualDate.toISOString();
      licenseTypeLabel = 'ترخيص رسمي كامل للعام الدراسي 2025/2026';
      expiresAt = annualDate.toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
    } else if (params.licenseType === 'lifetime') {
      subscription_status = 'active';
      const lifetimeDate = new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000);
      subscription_ends_at = lifetimeDate.toISOString();
      licenseTypeLabel = 'ترخيص دائم مدى الحياة (Enterprise Offline Unlimited)';
      expiresAt = 'ترخيص دائم غير محدود';
    } else {
      subscription_status = 'trial';
      const trialDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      trial_ends_at = trialDate.toISOString();
      licenseTypeLabel = 'ترخيص تجريبي موسع (30 يوماً)';
      expiresAt = trialDate.toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    const licenseDoc: SchoolLicenseDoc = {
      license_key: accessKey,
      school_name: rawName,
      subscription_status,
      trial_ends_at,
      subscription_ends_at,
      created_at: now.toISOString(),
      admin_phone: params.adminPhone?.trim() || '0922465676',
      notes: params.notes || `مفتاح دخول معتمد للمدرسة - ${licenseTypeLabel}`,
      offline_grace_allowed_days: 14,
      last_verified_at: now.toISOString()
    };

    // Save to local registry
    const registry = this.getAdminRegisteredSchools().filter(s => s.license_key !== accessKey);
    registry.unshift(licenseDoc);
    this.saveAdminRegisteredSchools(registry);

    // Sync to Firestore in background
    this.pushToFirestore(licenseDoc).catch(() => {});

    const checksum = (Math.abs(accessKey.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 9000 + 1000).toString();

    return {
      licenseDoc,
      accessKey,
      formattedKeyCard: {
        key: accessKey,
        schoolName: rawName,
        licenseTypeLabel,
        expiresAt,
        features: [
          'لوحة تحكم المدير العام والتعداد المدرسي الشامل',
          'شيت الامتحانات والكنترول (1120 درجة) وحساب الترتيب الآلي',
          'بوابة المعلمين لرصد الأعمال والغياب اليومي',
          'بوابة استعلام أولياء الأمور وحماية الخصوصية',
          'التخزين المحلي الآمن دون الحاجة لإنترنت (Offline-First)'
        ],
        verificationCode: checksum
      }
    };
  }

  /**
   * تمديد فترة التجربة لمدرسة
   */
  static async extendTrial(licenseKey: string, additionalDays = 14): Promise<SchoolLicenseDoc | null> {
    const schools = this.getAdminRegisteredSchools();
    const index = schools.findIndex(s => s.license_key === licenseKey);
    if (index === -1) return null;

    const school = schools[index];
    const currentExpiry = new Date(school.trial_ends_at).getTime();
    const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
    const newExpiry = new Date(baseTime + additionalDays * 24 * 60 * 60 * 1000).toISOString();

    school.trial_ends_at = newExpiry;
    if (school.subscription_status === 'expired') {
      school.subscription_status = 'trial';
    }

    schools[index] = school;
    this.saveAdminRegisteredSchools(schools);

    // If this is the active school, update cache too
    if (this.getActiveLicenseKey() === licenseKey) {
      this.setCachedLicense(school);
    }

    this.pushToFirestore(school).catch(() => {});
    return school;
  }

  /**
   * تفعيل أو تعليق اشتراك مدرسة
   */
  static async updateStatus(licenseKey: string, newStatus: SubscriptionStatus): Promise<SchoolLicenseDoc | null> {
    const schools = this.getAdminRegisteredSchools();
    const index = schools.findIndex(s => s.license_key === licenseKey);
    if (index === -1) return null;

    const school = schools[index];
    school.subscription_status = newStatus;
    if (newStatus === 'active' && !school.subscription_ends_at) {
      // 1 year active by default
      school.subscription_ends_at = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    schools[index] = school;
    this.saveAdminRegisteredSchools(schools);

    if (this.getActiveLicenseKey() === licenseKey) {
      this.setCachedLicense(school);
    }

    this.pushToFirestore(school).catch(() => {});
    return school;
  }

  // --- Renewal Request Loop (حلقة طلب التجديد المغلقة) ---

  /**
   * قراءة طلبات التجديد المحلية
   */
  static getRenewalRequests(): RenewalRequest[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RENEWAL_REQUESTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }

  static saveRenewalRequests(list: RenewalRequest[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RENEWAL_REQUESTS, JSON.stringify(list));
    } catch {}
  }

  /**
   * هل يوجد طلب معلّق لهذا الترخيص؟ (منع الإزعاج والتكرار)
   */
  static hasPendingRenewal(licenseKey: string): boolean {
    const key = licenseKey.trim().toUpperCase();
    return this.getRenewalRequests().some(r => r.license_key === key && r.status === 'pending');
  }

  /**
   * إرسال طلب تجديد/شراء من المدرسة إلى المدير العام.
   * يُحفظ محلياً دائماً، ويُزامَن مع Firestore عند توفر الإنترنت (best-effort).
   * تُرفق بصمة الجهاز (HWID) تلقائياً ليولّد المدير مفتاحاً مقيداً بها بضغطة واحدة.
   */
  static async requestRenewal(params: {
    licenseKey: string;
    schoolName: string;
    adminPhone: string;
    message?: string;
    hwid?: string;
    licenseType?: RequestedLicenseType;
  }): Promise<{ ok: boolean; request?: RenewalRequest; error?: string }> {
    const licenseKey = params.licenseKey.trim().toUpperCase();
    const schoolName = params.schoolName.trim().slice(0, 120);
    const adminPhone = params.adminPhone.trim();
    if (!licenseKey || !schoolName || !adminPhone) {
      return { ok: false, error: 'بيانات الطلب ناقصة (المدرسة / الترخيص / الهاتف).' };
    }
    if (!/^09[1-6]\d{7}$/.test(adminPhone)) {
      return { ok: false, error: 'رقم هاتف المدير غير صالح (يجب أن يكون ليبياً بصيغة 09xxxxxxxx).' };
    }
    if (this.hasPendingRenewal(licenseKey)) {
      return { ok: false, error: 'يوجد طلب تجديد معلّق مسبقاً لهذا الترخيص بانتظار المدير العام.' };
    }

    const cleanHwid = (params.hwid || '').trim().toUpperCase();
    const hwid = /^HWID-LY-[A-Z0-9-]{4,32}$/.test(cleanHwid) ? cleanHwid : undefined;
    const licenseType: RequestedLicenseType =
      params.licenseType === 'lifetime' || params.licenseType === 'trial_extended' ? params.licenseType : 'annual';

    const req: RenewalRequest = {
      id: `REQ-${Date.now()}-${secureRandomSuffix(4)}`,
      license_key: licenseKey,
      school_name: schoolName,
      admin_phone: adminPhone,
      message: params.message?.trim().slice(0, 500),
      status: 'pending',
      created_at: new Date().toISOString(),
      hwid,
      licenseType,
    };

    const list = [req, ...this.getRenewalRequests()].slice(0, 200);
    this.saveRenewalRequests(list);
    this.pushRenewalToFirestore(req).catch(() => {});
    return { ok: true, request: req };
  }

  /**
   * حسم طلب تجديد (قبول = تفعيل سنة كاملة، رفض = أرشفة) — للمدير العام فقط
   */
  static async resolveRenewalRequest(id: string, approve: boolean): Promise<RenewalRequest | null> {
    const list = this.getRenewalRequests();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      status: approve ? 'approved' : 'rejected',
      resolved_at: new Date().toISOString(),
    };
    this.saveRenewalRequests(list);

    if (approve) {
      await this.updateStatus(list[idx].license_key, 'active');
    }
    this.pushRenewalToFirestore(list[idx]).catch(() => {});
    return list[idx];
  }

  /**
   * جلب الطلبات المعلقة من Firestore (لجهاز المدير العام) ودمجها مع المحلية
   */
  static async fetchRemoteRenewals(): Promise<RenewalRequest[]> {
    // لا شبكة = لا طلب (يمنع ضجيج 403 في الكونسول عند العمل أوفلاين)
    if (typeof navigator !== 'undefined' && !navigator.onLine) return [];
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/renewals?pageSize=100&key=${FIREBASE_CONFIG.apiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return [];
      const json = await res.json();
      const docs = json.documents || [];
      const remote: RenewalRequest[] = docs.map((d: any) => this.parseRenewalFields(d.fields || {})).filter((r: RenewalRequest) => r.id && r.status === 'pending');
      if (remote.length > 0) {
        const local = this.getRenewalRequests();
        const ids = new Set(local.map(r => r.id));
        const merged = [...remote.filter(r => !ids.has(r.id)), ...local].slice(0, 200);
        this.saveRenewalRequests(merged);
      }
      return remote;
    } catch {
      return [];
    }
  }

  private static async pushRenewalToFirestore(req: RenewalRequest): Promise<boolean> {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/renewals/${encodeURIComponent(req.id)}?key=${FIREBASE_CONFIG.apiKey}`;
      const payload = {
        fields: {
          id: { stringValue: req.id },
          license_key: { stringValue: req.license_key },
          school_name: { stringValue: req.school_name },
          admin_phone: { stringValue: req.admin_phone },
          message: { stringValue: req.message || '' },
          status: { stringValue: req.status },
          created_at: { stringValue: req.created_at },
          resolved_at: req.resolved_at ? { stringValue: req.resolved_at } : { nullValue: null },
          hwid: req.hwid ? { stringValue: req.hwid } : { nullValue: null },
          licenseType: { stringValue: req.licenseType || 'annual' },
          deliveredKey: req.deliveredKey ? { stringValue: req.deliveredKey } : { nullValue: null },
          delivered_at: req.delivered_at ? { stringValue: req.delivered_at } : { nullValue: null },
        }
      };
      const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      return res.ok;
    } catch {
      return false;
    }
  }

  private static parseRenewalFields(fields: any): RenewalRequest {
    const lt = fields.licenseType?.stringValue;
    return {
      id: fields.id?.stringValue || '',
      license_key: fields.license_key?.stringValue || '',
      school_name: fields.school_name?.stringValue || '',
      admin_phone: fields.admin_phone?.stringValue || '',
      message: fields.message?.stringValue,
      status: (fields.status?.stringValue === 'approved' || fields.status?.stringValue === 'rejected') ? fields.status.stringValue : 'pending',
      created_at: fields.created_at?.stringValue || new Date().toISOString(),
      resolved_at: fields.resolved_at?.stringValue,
      hwid: fields.hwid?.stringValue,
      licenseType: (lt === 'lifetime' || lt === 'trial_extended' || lt === 'annual') ? lt : 'annual',
      deliveredKey: fields.deliveredKey?.stringValue,
      delivered_at: fields.delivered_at?.stringValue,
    };
  }

  private static findInAdminRegistry(licenseKey: string): SchoolLicenseDoc | undefined {
    return this.getAdminRegisteredSchools().find(s => s.license_key === licenseKey);
  }

  private static syncToAdminRegistry(doc: SchoolLicenseDoc): void {
    const list = this.getAdminRegisteredSchools();
    const idx = list.findIndex(s => s.license_key === doc.license_key);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...doc };
    } else {
      list.push(doc);
    }
    this.saveAdminRegisteredSchools(list);
  }

  /**
   * تفعيل ترخيص مشفر وموقع رقمياً غير متصل بالإنترنت (Offline Hardware-Bound Activation)
   * مع خنق التخمين (5 محاولات/دقيقة لكل مفتاح) وفحص قائمة الإلغاء.
   */
  static activateOfflineToken(token: string): { success: boolean; schoolName?: string; expiresAt?: string; error?: string; retryAfterSec?: number } {
    const clean = token.replace(/\s+/g, '').trim();
    if (!clean) {
      return { success: false, error: 'يرجى لصق كود الترخيص هنا.' };
    }
    const throttleKey = clean.substring(0, 24).toUpperCase();
    const now = Date.now();
    const attempts = readAttemptMap();
    const rec = attempts[throttleKey];
    if (rec && rec.lockUntil > now) {
      const retryAfterSec = Math.ceil((rec.lockUntil - now) / 1000);
      return { success: false, retryAfterSec, error: `محاولات كثيرة خاطئة — أُقفل التفعيل مؤقتاً (${retryAfterSec} ثانية) لحماية المنظومة.` };
    }

    const res = CryptoLicenseHelper.verifyLicenseToken(clean);
    if (!res.isValid || !res.payload) {
      const next: AttemptRecord = { count: (rec?.count || 0) + 1, lockUntil: 0 };
      if (next.count >= ACTIVATION_MAX_ATTEMPTS) {
        next.lockUntil = now + ACTIVATION_LOCK_MS;
        next.count = 0;
      }
      attempts[throttleKey] = next;
      writeAttemptMap(attempts);
      const left = ACTIVATION_MAX_ATTEMPTS - next.count;
      return {
        success: false,
        retryAfterSec: next.lockUntil > now ? Math.ceil((next.lockUntil - now) / 1000) : undefined,
        error: next.lockUntil > now
          ? 'تم استنفاد المحاولات — أُقفل التفعيل 60 ثانية.'
          : `${res.errorMessage || 'مفتاح الترخيص المشفر غير صالح.'} (المحاولات المتبقية: ${left})`
      };
    }

    // نجاح التحقق = تصفير العداد
    if (rec) {
      delete attempts[throttleKey];
      writeAttemptMap(attempts);
    }

    if (this.isLicenseRevoked(clean)) {
      return { success: false, error: 'تم إلغاء هذا الترخيص من قبل الإدارة العامة.' };
    }

    this.setActiveLicenseKey(clean);
    const doc: SchoolLicenseDoc = {
      license_key: clean,
      school_name: res.payload.schoolName,
      subscription_status: 'active',
      trial_ends_at: res.payload.expiresAt,
      subscription_ends_at: res.payload.expiresAt,
      created_at: res.payload.issuedAt,
      admin_phone: res.payload.adminPhone || '',
      notes: `ترخيص مشفر (${res.payload.licenseType}) مقيد بالبصمة ${res.payload.hwid}`,
      bound_hwid: res.payload.hwid,
      offline_grace_allowed_days: 365,
      last_verified_at: new Date().toISOString()
    };
    this.setCachedLicense(doc);
    this.syncToAdminRegistry(doc);
    return {
      success: true,
      schoolName: res.payload.schoolName,
      expiresAt: res.payload.expiresAt
    };
  }

  /**
   * تنفيذ طلب بضغطة واحدة (للمدير العام): توليد مفتاح مشفر مقيد ببصمة
   * جهاز الزبون المرفقة بالطلب + اعتباره مسلَّماً. يُرسَل المفتاح للزبون
   * عبر واتساب من الواجهة، ويُحفظ أثر التسليم في الطلب والسجل.
   */
  static async fulfillRenewalWithOfflineKey(
    id: string,
    licenseType?: RequestedLicenseType
  ): Promise<{ request: RenewalRequest; token: string } | null> {
    const list = this.getRenewalRequests();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1 || list[idx].status !== 'pending') return null;

    const req = list[idx];
    const type: RequestedLicenseType = licenseType || req.licenseType || 'annual';
    const hwid = req.hwid && req.hwid.trim() ? req.hwid.trim().toUpperCase() : '*';
    const token = await CryptoLicenseHelper.signLicenseToken(req.school_name, hwid, type, req.admin_phone);
    const nowIso = new Date().toISOString();

    list[idx] = {
      ...req,
      licenseType: type,
      status: 'approved',
      resolved_at: nowIso,
      deliveredKey: token,
      delivered_at: nowIso,
    };
    this.saveRenewalRequests(list);
    this.pushRenewalToFirestore(list[idx]).catch(() => {});

    // قيد الترخيص المسلَّم في سجل المدير (تتبع التسليم + الإلغاء لاحقاً)
    const verify = CryptoLicenseHelper.verifyLicenseToken(token);
    const doc: SchoolLicenseDoc = {
      license_key: token,
      school_name: req.school_name,
      subscription_status: 'active',
      trial_ends_at: verify.payload?.expiresAt || nowIso,
      subscription_ends_at: verify.payload?.expiresAt,
      created_at: nowIso,
      admin_phone: req.admin_phone,
      notes: `مفتاح مشفر مسلَّم للزبون (${type}) — طلب ${req.id}`,
      bound_hwid: hwid,
      delivered_at: nowIso,
      last_verified_at: nowIso
    };
    this.syncToAdminRegistry(doc);
    this.pushToFirestore(doc).catch(() => {});

    return { request: list[idx], token };
  }

  /**
   * إلغاء ترخيص (قائمة الإلغاء): يُعلق فوراً في السجل المحلي ويُزامَن سحابياً.
   * المفاتيح المشفرة المبطلة تُرفض في كل فحص لاحق (متصل أو غير متصل).
   */
  static async revokeLicense(licenseKey: string): Promise<boolean> {
    const key = licenseKey.trim();
    if (!key) return false;
    const schools = this.getAdminRegisteredSchools();
    const idx = schools.findIndex(s => s.license_key === key);
    if (idx !== -1) {
      schools[idx] = { ...schools[idx], subscription_status: 'suspended', revoked: true };
      this.saveAdminRegisteredSchools(schools);
      this.pushToFirestore(schools[idx]).catch(() => {});
    } else {
      // قيد إلغاء حتى لو لم يكن في السجل (مفتاح مشفر خارجي)
      const stub: SchoolLicenseDoc = {
        license_key: key,
        school_name: 'ترخيص ملغي',
        subscription_status: 'suspended',
        trial_ends_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        revoked: true,
      };
      this.syncToAdminRegistry(stub);
    }
    if ((this.getActiveLicenseKey() || '').toUpperCase() === key.toUpperCase()) {
      const cached = this.getCachedLicense();
      if (cached) {
        this.setCachedLicense({ ...cached, subscription_status: 'suspended', revoked: true });
      }
    }
    return true;
  }

  /**
   * استعادة ترخيص ملغي (فك الإلغاء): يزيل علامة revoked ويعيد التفعيل.
   * للترخيص التجريبي الافتراضي يعيده تجريبياً، ولغيره يمنحه سنة عند غياب تاريخ انتهاء.
   */
  static async restoreLicense(licenseKey: string): Promise<boolean> {
    const key = licenseKey.trim();
    if (!key) return false;
    const nowIso = new Date().toISOString();
    const schools = this.getAdminRegisteredSchools();
    const idx = schools.findIndex(s => s.license_key === key);
    if (idx === -1) return false;
    const school = schools[idx];
    const isDefaultTrial = key.toUpperCase() === DEFAULT_INITIAL_LICENSE.license_key.toUpperCase();
    schools[idx] = {
      ...school,
      revoked: false,
      subscription_status: isDefaultTrial ? 'trial' : 'active',
      trial_ends_at: isDefaultTrial
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : school.trial_ends_at,
      subscription_ends_at: isDefaultTrial
        ? school.subscription_ends_at
        : (school.subscription_ends_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()),
      last_verified_at: nowIso,
    };
    this.saveAdminRegisteredSchools(schools);
    this.pushToFirestore(schools[idx]).catch(() => {});
    if ((this.getActiveLicenseKey() || '').toUpperCase() === key.toUpperCase()) {
      const cached = this.getCachedLicense();
      if (cached) {
        this.setCachedLicense({ ...cached, revoked: false, subscription_status: schools[idx].subscription_status, trial_ends_at: schools[idx].trial_ends_at, subscription_ends_at: schools[idx].subscription_ends_at });
      }
    }
    return true;
  }

  /**
   * دمج سجل التراخيص المُصدرة من جهاز المورّد (ملف issued-licenses.jsonl)
   * في سجل المدارس المعروض بلوحة المالك. الحالة تُحسب من تاريخ الانتهاء،
   * مع الإبقاء على أي إلغاء/تعليق سجّله المالك يدوياً.
   */
  static importIssuedLedger(entries: Array<{
    token: string; schoolName: string; hwid: string;
    licenseType: string; issuedAt: string; expiresAt: string; adminPhone?: string;
  }>): void {
    const list = this.getAdminRegisteredSchools();
    const typeLabel: Record<string, string> = { annual: 'سنوي', lifetime: 'دائم', trial_extended: 'تمديد تجريبي' };
    for (const e of entries) {
      if (!e || !e.token) continue;
      const expired = new Date(e.expiresAt).getTime() < Date.now();
      const existing = list.find(s => s.license_key === e.token);
      const manuallyBlocked = existing && (existing.revoked || existing.subscription_status === 'suspended');
      const doc: SchoolLicenseDoc = {
        ...(existing || {}),
        license_key: e.token,
        school_name: e.schoolName,
        subscription_status: manuallyBlocked ? 'suspended' : expired ? 'expired' : 'active',
        trial_ends_at: e.expiresAt,
        subscription_ends_at: e.expiresAt,
        created_at: e.issuedAt,
        admin_phone: e.adminPhone || existing?.admin_phone || '',
        bound_hwid: e.hwid,
        notes: existing?.notes || `ترخيص ${typeLabel[e.licenseType] || e.licenseType} موقّع — الجهاز ${e.hwid}`,
      };
      if (existing) Object.assign(existing, doc);
      else list.push(doc);
    }
    // إخفاء المدرسة الافتراضية الوهمية من سجل المالك
    const cleaned = list.filter(s => s.license_key !== DEFAULT_INITIAL_LICENSE.license_key);
    cleaned.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    this.saveAdminRegisteredSchools(cleaned);
  }

  /**
   * هل هذا المفتاح في قائمة الإلغاء؟ (السجل المحلي + الكاش)
   */
  static isLicenseRevoked(licenseKey: string): boolean {
    const key = licenseKey.trim().toUpperCase();
    if (!key) return false;
    const inRegistry = this.getAdminRegisteredSchools().some(
      s => s.license_key.toUpperCase() === key && (s.revoked === true || s.subscription_status === 'suspended')
    );
    if (inRegistry) return true;
    try {
      const cached = this.getCachedLicense();
      if (cached && cached.license_key.toUpperCase() === key && (cached.revoked === true || cached.subscription_status === 'suspended')) {
        return true;
      }
    } catch {}
    return false;
  }

  /**
   * توليد ترخيص مشفر وموقع رقمياً لمدرسة محددة وبصمة جهاز (للسوبر أدمن فقط)
   */
  static async generateOfflineLicense(params: {
    schoolName: string;
    hwid: string;
    licenseType: 'lifetime' | 'annual' | 'trial_extended';
    adminPhone?: string;
  }): Promise<{
    token: string;
    formattedCard: {
      schoolName: string;
      hwid: string;
      licenseTypeLabel: string;
      token: string;
    };
  }> {
    const token = await CryptoLicenseHelper.signLicenseToken(
      params.schoolName,
      params.hwid,
      params.licenseType,
      params.adminPhone
    );
    const licenseTypeLabel =
      params.licenseType === 'lifetime'
        ? 'ترخيص دائم مدى الحياة (Enterprise Unlimited)'
        : params.licenseType === 'annual'
        ? 'ترخيص سنوي معتمد (1 Year)'
        : 'تمديد تجريبي (7 أيام)';

    return {
      token,
      formattedCard: {
        schoolName: params.schoolName,
        hwid: params.hwid.toUpperCase(),
        licenseTypeLabel,
        token
      }
    };
  }
}
