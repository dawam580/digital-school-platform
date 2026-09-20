/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك التحقق من التراخيص والاشتراكات السحابية (Cloud License Service)
 * ============================================================================
 */

import { SchoolLicenseDoc, LicenseVerificationResult, SubscriptionStatus, RenewalRequest } from './licenseTypes';
import { CryptoLicenseHelper, SignedLicenseToken } from './cryptoHelper';

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
};

// Initial default license for existing school (مدرسة الشهيد امحمد الباعور)
export const DEFAULT_INITIAL_LICENSE: SchoolLicenseDoc = {
  license_key: 'SCH-BAOUR-2026-ACTIVE',
  school_name: 'مدرسة الشهيد امحمد الباعور للتعليم الأساسي',
  subscription_status: 'trial',
  trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
  created_at: new Date().toISOString(),
  admin_phone: '0922465676',
  notes: 'الترخيص المعتمد الأساسي',
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
   */
  static setActiveLicenseKey(key: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_LICENSE_KEY, key.trim().toUpperCase());
    } catch {}
  }

  /**
   * جلب الوثيقة المخزنة محلياً في الـ Cache
   */
  static getCachedLicense(): SchoolLicenseDoc | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CACHED_LICENSE_DOC);
      if (raw) return JSON.parse(raw);
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
    const key = (explicitKey || this.getActiveLicenseKey() || DEFAULT_INITIAL_LICENSE.license_key).trim().toUpperCase();
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

    // 1. Check Cryptographically Signed Hardware-Bound Token (MADRASA-v2-)
    if (key.startsWith('MADRASA-V2-') || key.startsWith('MADRASA-v2-')) {
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

    // 2. Check 7-day hardware trial for trial status
    if (cached.subscription_status === 'trial') {
      const trial = CryptoLicenseHelper.getTrialStatus();
      if (!trial.isTrialActive) {
        return {
          isValid: false,
          status: 'expired',
          schoolName: cached.school_name,
          licenseKey: key,
          daysRemaining: 0,
          isOfflineGrace: true,
          offlineDaysRemaining: 0,
          errorMessage: 'انتهت الفترة التجريبية المجانية (7 أيام). يرجى التواصل مع الإدارة للحصول على مفتاح التفعيل الدائم لمنظومتكم.',
          licenseDoc: {
            ...cached,
            subscription_status: 'expired'
          }
        };
      }
    }

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    // 1. If online, attempt to fetch fresh record from Firestore
    if (isOnline) {
      try {
        const freshDoc = await this.fetchFromFirestore(key);
        if (freshDoc) {
          freshDoc.last_verified_at = new Date().toISOString();
          this.setCachedLicense(freshDoc);
          this.syncToAdminRegistry(freshDoc);
          return this.evaluateLicenseDoc(freshDoc, false);
        }
      } catch (err) {
        // Network or permission fallback: continue to offline evaluation
      }
    }

    // 2. Offline / Fallback Evaluation with 7-Day Grace Period
    const lastVerified = cached.last_verified_at ? new Date(cached.last_verified_at).getTime() : Date.now();
    const elapsedDays = (Date.now() - lastVerified) / (1000 * 60 * 60 * 24);
    const graceAllowedDays = cached.offline_grace_allowed_days || 7;

    if (elapsedDays > graceAllowedDays) {
      return {
        isValid: false,
        status: 'grace_expired',
        schoolName: cached.school_name,
        licenseKey: cached.license_key,
        daysRemaining: 0,
        isOfflineGrace: false,
        offlineDaysRemaining: 0,
        errorMessage: `تجاوزت المنظومة مهلة الـ ${graceAllowedDays} أيام للعمل بدون اتصال. يرجى الاتصال بالإنترنت للتحقق من سريان الترخيص.`,
        licenseDoc: cached
      };
    }

    const offlineDaysRemaining = Math.max(0, Math.ceil(graceAllowedDays - elapsedDays));
    const evalResult = this.evaluateLicenseDoc(cached, true);
    return {
      ...evalResult,
      isOfflineGrace: true,
      offlineDaysRemaining
    };
  }

  /**
   * تقييم التواريخ والحالة للوثيقة
   */
  private static evaluateLicenseDoc(doc: SchoolLicenseDoc, isOffline: boolean): LicenseVerificationResult {
    const now = Date.now();
    let status = doc.subscription_status;
    let daysRemaining = 0;

    if (status === 'suspended') {
      return {
        isValid: false,
        status: 'suspended',
        schoolName: doc.school_name,
        licenseKey: doc.license_key,
        daysRemaining: 0,
        isOfflineGrace: isOffline,
        errorMessage: 'تم تعليق ترخيص المنظومة مؤقتاً من قبل الإدارة العامة.',
        licenseDoc: doc
      };
    }

    if (status === 'trial') {
      const trialEnd = new Date(doc.trial_ends_at).getTime();
      const diffMs = trialEnd - now;
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      if (diffMs <= 0) {
        status = 'expired';
        return {
          isValid: false,
          status: 'expired',
          schoolName: doc.school_name,
          licenseKey: doc.license_key,
          daysRemaining: 0,
          isOfflineGrace: isOffline,
          errorMessage: 'انتهت الفترة التجريبية لمدرستكم. يرجى التواصل معنا لتجديد الاشتراك.',
          licenseDoc: doc
        };
      }
    } else if (status === 'active' && doc.subscription_ends_at) {
      const subEnd = new Date(doc.subscription_ends_at).getTime();
      const diffMs = subEnd - now;
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      if (diffMs <= 0) {
        status = 'expired';
        return {
          isValid: false,
          status: 'expired',
          schoolName: doc.school_name,
          licenseKey: doc.license_key,
          daysRemaining: 0,
          isOfflineGrace: isOffline,
          errorMessage: 'انتهت فترة الاشتراك السنوي المعتمدة للمدرسة.',
          licenseDoc: doc
        };
      }
    } else if (status === 'active') {
      daysRemaining = 365; // Unlimited or active
    }

    return {
      isValid: status === 'active' || (status === 'trial' && daysRemaining > 0),
      status,
      schoolName: doc.school_name,
      licenseKey: doc.license_key,
      daysRemaining,
      isOfflineGrace: isOffline,
      licenseDoc: doc
    };
  }

  /**
   * قراءة مستند المدرسة من Firestore عبر REST API
   */
  private static async fetchFromFirestore(licenseKey: string): Promise<SchoolLicenseDoc | null> {
    const docId = encodeURIComponent(licenseKey);
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/schools/${docId}?key=${FIREBASE_CONFIG.apiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return null;
      const json = await res.json();
      if (json.fields) {
        return this.parseFirestoreFields(json.fields);
      }
    } catch {
      clearTimeout(timeout);
    }
    return null;
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
      last_verified_at: fields.last_verified_at?.stringValue || new Date().toISOString()
    };
  }

  // --- Super Admin Helpers ---

  /**
   * توليد مفتاح ترخيص فريد جديد
   */
  static generateLicenseKey(): string {
    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
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
    const prefix = rawName.includes('الباعور')
      ? 'BAOUR'
      : rawName.includes('الأمل')
      ? 'AMAL'
      : 'LIBYA';
    const rand1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const rand2 = Math.random().toString(36).substring(2, 6).toUpperCase();
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
   * إرسال طلب تجديد من المدرسة إلى المدير العام.
   * يُحفظ محلياً دائماً، ويُزامَن مع Firestore عند توفر الإنترنت (best-effort).
   */
  static async requestRenewal(params: {
    licenseKey: string;
    schoolName: string;
    adminPhone: string;
    message?: string;
  }): Promise<{ ok: boolean; request?: RenewalRequest; error?: string }> {
    const licenseKey = params.licenseKey.trim().toUpperCase();
    const schoolName = params.schoolName.trim();
    const adminPhone = params.adminPhone.trim();
    if (!licenseKey || !schoolName || !adminPhone) {
      return { ok: false, error: 'بيانات الطلب ناقصة (المدرسة / الترخيص / الهاتف).' };
    }
    if (this.hasPendingRenewal(licenseKey)) {
      return { ok: false, error: 'يوجد طلب تجديد معلّق مسبقاً لهذا الترخيص بانتظار المدير العام.' };
    }

    const req: RenewalRequest = {
      id: `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      license_key: licenseKey,
      school_name: schoolName,
      admin_phone: adminPhone,
      message: params.message?.trim().slice(0, 500),
      status: 'pending',
      created_at: new Date().toISOString(),
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
        }
      };
      const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      return res.ok;
    } catch {
      return false;
    }
  }

  private static parseRenewalFields(fields: any): RenewalRequest {
    return {
      id: fields.id?.stringValue || '',
      license_key: fields.license_key?.stringValue || '',
      school_name: fields.school_name?.stringValue || '',
      admin_phone: fields.admin_phone?.stringValue || '',
      message: fields.message?.stringValue,
      status: (fields.status?.stringValue === 'approved' || fields.status?.stringValue === 'rejected') ? fields.status.stringValue : 'pending',
      created_at: fields.created_at?.stringValue || new Date().toISOString(),
      resolved_at: fields.resolved_at?.stringValue,
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
   */
  static activateOfflineToken(token: string): { success: boolean; schoolName?: string; expiresAt?: string; error?: string } {
    const clean = token.trim();
    const res = CryptoLicenseHelper.verifyLicenseToken(clean);
    if (!res.isValid || !res.payload) {
      return { success: false, error: res.errorMessage || 'مفتاح الترخيص المشفر غير صالح.' };
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
   * توليد ترخيص مشفر وموقع رقمياً لمدرسة محددة وبصمة جهاز (للسوبر أدمن فقط)
   */
  static generateOfflineLicense(params: {
    schoolName: string;
    hwid: string;
    licenseType: 'lifetime' | 'annual' | 'trial_extended';
    adminPhone?: string;
  }): {
    token: string;
    formattedCard: {
      schoolName: string;
      hwid: string;
      licenseTypeLabel: string;
      token: string;
    };
  } {
    const token = CryptoLicenseHelper.generateLicenseToken(
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
        : 'تمديد تجريبي (14 يوماً إضافية)';

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
