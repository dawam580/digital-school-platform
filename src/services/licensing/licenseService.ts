/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك التحقق من التراخيص والاشتراكات السحابية (Cloud License Service)
 * ============================================================================
 */

import { SchoolLicenseDoc, LicenseVerificationResult, SubscriptionStatus } from './licenseTypes';

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
}
