/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * وحدة المصادقة العميقة والتحقق من الهوية (Deep Authentication Engine)
 * المصممة وفق مبادئ هندسة البرمجيات (Codebase Design - Deep Module)
 * ============================================================================
 */

import { UserRole, Student, TeacherAccount } from '../../types';
import { SecurityEngine } from './securityEngine';
import { auditLogger } from '../audit/auditLogger';
import { getSchoolProfile, SEED_TEACHERS, db } from '../db';
import { DEV_MODE } from '../../config/devMode';

/** أرقام الهواتف المحمولة الليبية: المدار (091/093) • ليبيانا (092/094) • ليبيا فون/LTT (095/096) */
export const LIBYAN_PHONE_RE = /^09[1-6]\d{7}$/;

/**
 * توحيد صيغة الهاتف الليبي: يقبل +218 / 00218 / 218 / المسافات والشرطات والأرقام
 * العربية الهندية (٠٩١...) ويُرجع الصيغة المحلية 09xxxxxxxx، أو النص كما هو إن لم يكن هاتفاً.
 */
export function normalizeLibyanPhone(input: string): string {
  const raw = (input || '').trim();
  const western = raw.replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  const digits = western.replace(/[\s\-().]/g, '');
  if (!/^\+?\d+$/.test(digits)) return raw;
  let d = digits.replace(/^\+/, '');
  if (d.startsWith('00218')) d = d.slice(5);
  else if (d.startsWith('218')) d = d.slice(3);
  if (/^9[1-6]\d{7}$/.test(d)) d = '0' + d;
  return LIBYAN_PHONE_RE.test(d) ? d : raw;
}

/** هل هذا رمز دخول أخصائي اجتماعي؟ (الرمز التاريخي LIB-SOC-01 أو أي حساب بمادة COUNSEL) */
export function isCounselorAccount(t: Pick<TeacherAccount, 'code' | 'subjectCode'>): boolean {
  return t.code?.toUpperCase() === 'LIB-SOC-01' || t.subjectCode === 'COUNSEL';
}

/** مفتاح كلمة مرور ولي الأمر المخصصة (يعيّنها ولي الأمر بنفسه من حسابه) */
export const parentPasswordKey = (studentId: string) => `madrasa_parent_pwd_${studentId}`;

/** أقصى عدد أبناء يُربطون تلقائياً بهاتف ولي أمر واحد */
export const MAX_SIBLINGS = 8;

export interface AuthCredentials {
  role: UserRole;
  identifier: string;
  password?: string;
  pin?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  role?: UserRole;
  actorName?: string;
  actorId?: string;
  /** رمز المعلم/الأخصائي الرسمي (للدخول عبر loginWithTeacherCode) */
  actorCode?: string;
  /** أبناء ولي الأمر الذين يحق له الاطلاع عليهم بعد التحقق (الإخوة بنفس الهاتف) */
  studentIds?: string[];
  isLockedOut?: boolean;
  remainingSeconds?: number;
}

interface AttemptTracker {
  count: number;
  lockoutUntil: number;
}

export class AuthEngine {
  private static attemptsMap: Map<string, AttemptTracker> = new Map();
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION_MS = 30000; // 30 seconds
  private static readonly SUPER_LOCKOUT_DURATION_MS = 45000; // 45 seconds

  /**
   * أسرار مخزنة مخصصة (كلمات مرور عيّنها المدير من الإعدادات) — لا أسرار كونية هنا أبداً.
   */
  private static storedSecrets(keys: string[]): Set<string> {
    const s = new Set<string>();
    for (const k of keys) {
      try {
        const v = localStorage.getItem(k);
        if (v && v.trim()) s.add(v.trim());
      } catch {}
    }
    return s;
  }

  /**
   * أسرار التطوير فقط (123456/2026) — موجودة في DEV_MODE وحده، ميتة تماماً في بناء الإنتاج.
   */
  private static devSecrets(): string[] {
    try {
      if (DEV_MODE) return ['123456', '2026'];
    } catch {}
    return [];
  }

  /**
   * فحص حالة الحظر المؤقت بسبب تكرار المحاولات الخاطئة
   */
  public static isLockedOut(identifier: string): { isLocked: boolean; remainingSeconds: number } {
    const key = identifier.trim().toLowerCase();
    const tracker = this.attemptsMap.get(key);
    if (!tracker) return { isLocked: false, remainingSeconds: 0 };

    const now = Date.now();
    if (now < tracker.lockoutUntil) {
      const remainingSeconds = Math.ceil((tracker.lockoutUntil - now) / 1000);
      return { isLocked: true, remainingSeconds };
    }

    if (tracker.lockoutUntil > 0 && now >= tracker.lockoutUntil) {
      this.attemptsMap.delete(key);
    }

    return { isLocked: false, remainingSeconds: 0 };
  }

  /**
   * تسجيل محاولة فاشلة مع احتساب الحظر
   */
  private static recordFailedAttempt(identifier: string, isSuper: boolean = false): { isLocked: boolean; remainingSeconds: number; attemptsLeft: number } {
    const key = identifier.trim().toLowerCase();
    let tracker = this.attemptsMap.get(key) || { count: 0, lockoutUntil: 0 };
    tracker.count += 1;

    const limit = this.MAX_ATTEMPTS;
    if (tracker.count >= limit) {
      const duration = isSuper ? this.SUPER_LOCKOUT_DURATION_MS : this.LOCKOUT_DURATION_MS;
      tracker.lockoutUntil = Date.now() + duration;
      this.attemptsMap.set(key, tracker);
      const remainingSeconds = Math.ceil(duration / 1000);
      return { isLocked: true, remainingSeconds, attemptsLeft: 0 };
    }

    this.attemptsMap.set(key, tracker);
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: limit - tracker.count };
  }

  /**
   * إعادة ضبط المحاولات بعد تسجيل دخول ناجح
   */
  public static clearAttempts(identifier: string): void {
    this.attemptsMap.delete(identifier.trim().toLowerCase());
  }

  /**
   * إعادة ضبط كافة محاولات الدخول وفك أي تجميد
   */
  public static clearAllAttempts(): void {
    this.attemptsMap.clear();
    SecurityEngine.resetDirectorPinLockout();
  }

  /**
   * قائمة أرقام هواتف الإدارة المعتمدة للمدرسة
   */
  public static getAuthorizedAdminPhones(): string[] {
    const phones: Set<string> = new Set();

    // 1. رقم هاتف المدير من الملف التعريفي للمدرسة
    try {
      const profile = getSchoolProfile();
      if (profile && profile.directorPhone) {
        phones.add(profile.directorPhone.trim());
      }
    } catch {}

    // 2. الرقم المسجل في التخزين المحلي للإدارة
    try {
      const localPhone = localStorage.getItem('madrasa_admin_phone');
      if (localPhone) phones.add(localPhone.trim());
    } catch {}

    // 3. أرقام العرض التجريبي — بيئة التطوير فقط. في الإنتاج لا يدخل إلا هاتف مدير هذه المدرسة.
    if (DEV_MODE) {
      phones.add('0922465676');
      phones.add('0912345678');
    }

    return Array.from(phones).filter(p => LIBYAN_PHONE_RE.test(p));
  }

  /**
   * مدرسة لم يُسجَّل لها هاتف مدير بعد (تثبيت جديد بمفتاح ترخيص دون معالج التجربة).
   * أول دخول برقم ليبي صحيح + رمز المدير الحالي يسجّل ذلك الهاتف مديراً، ثم يُفرض تغيير الرمز.
   */
  public static isAdminUnclaimed(): boolean {
    try {
      if ((getSchoolProfile().directorPhone || '').trim()) return false;
      if ((localStorage.getItem('madrasa_admin_phone') || '').trim()) return false;
    } catch {}
    return this.getAuthorizedAdminPhones().length === 0;
  }

  /**
   * قائمة أرقام هواتف منسق الامتحانات ورئيس الكنترول المعتمدة
   */
  public static getAuthorizedExamsPhones(): string[] {
    const phones: Set<string> = new Set();
    try {
      const savedExamsPhone = localStorage.getItem('madrasa_exams_phone');
      if (savedExamsPhone) phones.add(savedExamsPhone.trim());
    } catch {}
    if (DEV_MODE) {
      phones.add('0912345678');
      phones.add('0922465676');
    }
    return Array.from(phones).filter(p => LIBYAN_PHONE_RE.test(p));
  }

  /** قائمة الكادر الحالية (المحفوظة أو البذرة) */
  public static loadTeachers(): TeacherAccount[] {
    try {
      const stored = localStorage.getItem('madrasa_db_teachers_v4');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return SEED_TEACHERS;
  }

  /** الأسرار المقبولة لولي أمر طالب: رمز الدخول الصادر من المدرسة + كلمة مروره المخصصة */
  private static parentSecretsFor(s: Student): string[] {
    const secrets: string[] = [];
    if (s.parentAccessCode) secrets.push(s.parentAccessCode.trim());
    try {
      const custom = localStorage.getItem(parentPasswordKey(s.id));
      if (custom && custom.trim()) secrets.push(custom.trim());
    } catch {}
    secrets.push(...this.devSecrets());
    return secrets;
  }

  /**
   * تحقق ولي الأمر من ملكية طالب (لربط ابن إضافي من داخل حسابه) — نفس قواعد الدخول.
   */
  public static verifyParentAccess(identifier: string, secret: string): AuthResult {
    return this.verifyCredentials({ role: 'parent', identifier, password: secret });
  }

  /**
   * التحقق الشامل والعميق من هوية وبيانات الدخول
   * (الواجهة الموحدة للمصادقة عبر كافة البوابات)
   */
  public static verifyCredentials(creds: AuthCredentials): AuthResult {
    const { role, identifier, password, pin } = creds;
    const cleanId = normalizeLibyanPhone(identifier || '');
    const cleanSecret = (password || pin || '').trim();

    if (!cleanId) {
      return { success: false, error: 'يرجى إدخال رقم الهاتف أو رمز المستخدم.' };
    }

    // 1. فحص الحظر المؤقت من محاولات التخمين
    const lockCheck = this.isLockedOut(cleanId);
    if (lockCheck.isLocked) {
      return {
        success: false,
        isLockedOut: true,
        remainingSeconds: lockCheck.remainingSeconds,
        error: `تم تجميد محاولات الدخول لحماية الحساب. يرجى الانتظار ${lockCheck.remainingSeconds} ثانية قبل المحاولة مجدداً.`
      };
    }

    // 2. التحقق بحسب الدور (Role-Specific Verification)

    // ── أ. بوابة المدير (Admin) ──
    if (role === 'admin') {
      if (!LIBYAN_PHONE_RE.test(cleanId)) {
        return { success: false, error: 'صيغة رقم الهاتف غير صالحة. يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (09xxxxxxxx).' };
      }

      const authorizedPhones = this.getAuthorizedAdminPhones();
      const claiming = this.isAdminUnclaimed();
      const isAuthorizedPhone = claiming || authorizedPhones.includes(cleanId);

      if (!isAuthorizedPhone) {
        const fail = this.recordFailedAttempt(cleanId);
        auditLogger.log({
          actorName: cleanId,
          actorRole: 'admin',
          action: 'LOGIN_FAILED_UNAUTHORIZED_PHONE',
          entity: 'Security',
          details: `محاولة دخول بهاتف غير مصرح له كمدير (${cleanId})`,
          severity: 'WARN'
        });
        return {
          success: false,
          error: fail.isLocked
            ? `تم استنفاد المحاولات. تم تجميد البوابة مؤقتاً ${fail.remainingSeconds} ثانية.`
            : `رقم الهاتف (${cleanId}) غير مسجل كمدير معتمد لهذه المدرسة. يرجى مراجعة إدارة التعليم.`
        };
      }

      // فحص كلمة المرور أو رمز أمان المدير (PIN): الحالي + المخصصة المخزنة فقط.
      // لا أسرار كونية — التمهيد هو رمز المدير نفسه (قابل للتدوير من لوحة المالك).
      const currentPin = SecurityEngine.getDirectorPin();
      const validSecrets = new Set<string>([
        currentPin,
        ...this.storedSecrets(['madrasa_admin_password', 'madrasa_global_pwd', `madrasa_pwd_${cleanId}`]),
        ...this.devSecrets(),
      ]);

      if (!cleanSecret) {
        return { success: false, error: 'يرجى إدخال كلمة المرور أو رمز الأمان (PIN) للمدير.' };
      }

      if (!validSecrets.has(cleanSecret)) {
        const fail = this.recordFailedAttempt(cleanId);
        auditLogger.log({
          actorName: cleanId,
          actorRole: 'admin',
          action: 'LOGIN_FAILED_WRONG_PASSWORD',
          entity: 'Security',
          details: `كلمة مرور خاطئة لإدارة المدرسة بالهاتف (${cleanId})`,
          severity: 'WARN'
        });
        return {
          success: false,
          error: fail.isLocked
            ? `تم استنفاد 3 محاولات خاطئة. تم قفل البوابة مؤقتاً لمدة ${fail.remainingSeconds} ثانية للحماية من التخمين.`
            : `كلمة المرور أو رمز الأمان غير صحيح. المحاولات المتبقية: (${fail.attemptsLeft}).`
        };
      }

      // نجاح الدخول
      this.clearAttempts(cleanId);
      if (claiming) {
        try { localStorage.setItem('madrasa_admin_phone', cleanId); } catch {}
        auditLogger.log({
          actorName: cleanId,
          actorRole: 'admin',
          action: 'ADMIN_PHONE_CLAIMED',
          entity: 'Security',
          details: `تسجيل هاتف المدير لأول مرة على هذا الجهاز (${cleanId})`,
          severity: 'WARN'
        });
      }
      auditLogger.log({
        actorName: cleanId,
        actorRole: 'admin',
        action: 'ADMIN_LOGIN_SUCCESS',
        entity: 'Security',
        details: `دخول ناجح وموثق لمدير المدرسة بالهاتف (${cleanId})`,
        severity: 'INFO'
      });

      return {
        success: true,
        role: 'admin',
        actorName: 'مدير المدرسة المعتمد',
        actorId: cleanId
      };
    }

    // ── ب. بوابة منسق الامتحانات والكنترول (Exams Coordinator) ──
    if (role === 'exams_coordinator') {
      if (!LIBYAN_PHONE_RE.test(cleanId)) {
        return { success: false, error: 'صيغة رقم الهاتف غير صالحة. أدخل رقماً ليبياً بصيغة 09xxxxxxxx.' };
      }

      const authorizedPhones = this.getAuthorizedExamsPhones();
      if (!authorizedPhones.includes(cleanId)) {
        const fail = this.recordFailedAttempt(cleanId);
        auditLogger.log({
          actorName: cleanId,
          actorRole: 'exams_coordinator',
          action: 'LOGIN_FAILED_UNAUTHORIZED_EXAMS_PHONE',
          entity: 'Security',
          details: `محاولة دخول لرئيس الكنترول بهاتف غير مسجل (${cleanId})`,
          severity: 'WARN'
        });
        return {
          success: false,
          error: fail.isLocked
            ? `تم تجميد الدخول مؤقتاً ${fail.remainingSeconds} ثانية.`
            : `رقم الهاتف (${cleanId}) غير مسجل كرئيس كنترول معتمد في المنظومة.`
        };
      }

      if (!cleanSecret) {
        return { success: false, error: 'يرجى إدخال كلمة المرور الخاصة بمنسق الامتحانات.' };
      }

      // رمز المدير الحالي + المخصصة المخزنة فقط — لا أسرار كونية.
      const validSecrets = new Set<string>([
        SecurityEngine.getDirectorPin(),
        ...this.storedSecrets(['madrasa_exams_password', `madrasa_pwd_${cleanId}`]),
        ...this.devSecrets(),
      ]);

      if (!validSecrets.has(cleanSecret)) {
        const fail = this.recordFailedAttempt(cleanId);
        return {
          success: false,
          error: fail.isLocked
            ? `تم تجميد الدخول مؤقتاً لمدة ${fail.remainingSeconds} ثانية.`
            : `كلمة مرور منسق الامتحانات غير صحيحة. المحاولات المتبقية: (${fail.attemptsLeft}).`
        };
      }

      this.clearAttempts(cleanId);
      auditLogger.log({
        actorName: cleanId,
        actorRole: 'exams_coordinator',
        action: 'EXAMS_LOGIN_SUCCESS',
        entity: 'Security',
        details: `دخول ناجح لرئيس الكنترول بالهاتف (${cleanId})`,
        severity: 'INFO'
      });

      return {
        success: true,
        role: 'exams_coordinator',
        actorName: 'رئيس الكنترول ومنسق الامتحانات',
        actorId: cleanId
      };
    }

    // ── ج. بوابة المعلم (Teacher) ──
    if (role === 'teacher') {
      const teacherList: TeacherAccount[] = this.loadTeachers();

      const cleanCode = cleanId.toUpperCase();
      const foundTeacher = teacherList.find(
        t => t.code.trim().toUpperCase() === cleanCode || (t.phone && t.phone.trim() === cleanId)
      );

      if (!foundTeacher) {
        const fail = this.recordFailedAttempt(cleanId);
        auditLogger.log({
          actorName: cleanId,
          actorRole: 'teacher',
          action: 'LOGIN_FAILED_UNKNOWN_TEACHER',
          entity: 'Security',
          details: `رمز معلم غير موجود بالسجلات (${cleanId})`,
          severity: 'WARN'
        });
        return {
          success: false,
          error: fail.isLocked
            ? `تم تجميد الدخول ${fail.remainingSeconds} ثانية.`
            : 'رمز المعلم غير مسجل في سجلات المدرسة. يرجى مراجعة إدارة المدرسة.'
        };
      }

      if (foundTeacher.status && foundTeacher.status !== 'active') {
        return { success: false, error: 'حساب المعلم غير متاح حالياً (في إجازة أو انتداب). يرجى مراجعة إدارة المدرسة.' };
      }

      if (!cleanSecret) {
        return { success: false, error: 'يرجى إدخال كلمة مرور المعلم.' };
      }

      // كلمة مرور المعلم المخصصة + رمز المدير (تجاوز المالك) — لا أسرار كونية.
      // التمهيد: المدير يعيّن كلمات المعلمين من الإعدادات؛ رمز المدير يبقى مخرج الطوارئ للمالك.
      const validSecrets = new Set<string>([
        ...this.storedSecrets([`madrasa_teacher_pwd_${foundTeacher.code.toUpperCase()}`, `madrasa_pwd_${cleanId}`]),
        SecurityEngine.getDirectorPin(),
        ...this.devSecrets(),
      ]);

      if (!validSecrets.has(cleanSecret)) {
        const fail = this.recordFailedAttempt(cleanId);
        return {
          success: false,
          error: fail.isLocked
            ? `تم تجميد الدخول ${fail.remainingSeconds} ثانية.`
            : `كلمة المرور غير صحيحة. المحاولات المتبقية: (${fail.attemptsLeft}).`
        };
      }

      this.clearAttempts(cleanId);
      const finalRole: UserRole = isCounselorAccount(foundTeacher) ? 'counselor' : 'teacher';

      auditLogger.log({
        actorName: foundTeacher.name,
        actorRole: finalRole,
        action: 'TEACHER_LOGIN_SUCCESS',
        entity: 'Security',
        details: `دخول ناجح للمعلم (${foundTeacher.name} - ${foundTeacher.code})`,
        severity: 'INFO'
      });

      return {
        success: true,
        role: finalRole,
        actorName: foundTeacher.name,
        actorId: foundTeacher.id,
        actorCode: foundTeacher.code
      };
    }

    // ── د. بوابة الأخصائي الاجتماعي (Counselor) ──
    // حساب الأخصائي حساب كادر عادي بمادة COUNSEL — نفس مسار المعلم بكلمة مروره الخاصة.
    if (role === 'counselor') {
      const counselor = this.loadTeachers().find(
        t => isCounselorAccount(t) && (t.code.trim().toUpperCase() === cleanId.toUpperCase() || (t.phone && t.phone.trim() === cleanId))
      );
      if (!counselor) {
        const fail = this.recordFailedAttempt(cleanId);
        return {
          success: false,
          error: fail.isLocked
            ? `تم تجميد الدخول ${fail.remainingSeconds} ثانية.`
            : 'رمز الأخصائي الاجتماعي غير مسجل. يرجى مراجعة إدارة المدرسة.'
        };
      }
      return this.verifyCredentials({ role: 'teacher', identifier: counselor.code, password: cleanSecret });
    }

    // ── هـ. بوابة السوبر أدمن (Super Admin) ──
    if (role === 'superadmin') {
      const superToken = cleanId.toUpperCase();
      if (superToken !== 'DISTRICT-SUPER-01' && superToken !== 'SUPERADMIN' && superToken !== 'ADMIN-SUPER') {
        const fail = this.recordFailedAttempt(cleanId, true);
        return {
          success: false,
          error: fail.isLocked
            ? `تم قفل البوابة مؤقتاً ${fail.remainingSeconds} ثانية.`
            : 'رمز تفويض المدير العام غير صحيح.'
        };
      }

      const masterPin = cleanSecret;
      const verifyRes = SecurityEngine.verifySuperAdminPin(masterPin);
      if (!verifyRes.valid) {
        const fail = this.recordFailedAttempt(cleanId, true);
        auditLogger.log({
          actorName: 'مجهول',
          actorRole: 'superadmin',
          action: 'SUPERADMIN_LOGIN_FAILED',
          entity: 'Security',
          details: `محاولة فاشلة لدخول السوبر أدمن برمز ماستر خاطئ`,
          severity: 'CRITICAL'
        });
        return {
          success: false,
          error: verifyRes.message || 'رمز الماستر غير صحيح.'
        };
      }

      this.clearAttempts(cleanId);
      auditLogger.log({
        actorName: 'المدير العام',
        actorRole: 'superadmin',
        action: 'SUPERADMIN_LOGIN_SUCCESS',
        entity: 'Security',
        details: 'دخول موثق وصالح للمدير العام برمز الماستر الحصري',
        severity: 'INFO'
      });

      return {
        success: true,
        role: 'superadmin',
        actorName: 'المدير العام للمدارس (سوبر أدمن)',
        actorId: 'super-admin-01'
      };
    }

    // ── و. بوابة ولي الأمر (Parent) ──
    // المعرّف: الرقم الوطني أو رقم القيد أو هاتف ولي الأمر أو رمز الربط.
    // السر إلزامي: رمز دخول ولي الأمر (6 أرقام عشوائية تصدرها المدرسة) أو كلمة مروره المخصصة.
    // لا دخول بدون سر، ولا دخول برقم هاتف غير مسجل لأي طالب.
    if (role === 'parent') {
      let studentList: Student[] = [];
      try {
        studentList = db.getAllStudents();
      } catch {}

      const idLower = cleanId.toLowerCase();
      const candidates = studentList.filter(
        s => (s.nationalNumber && s.nationalNumber === cleanId) ||
             (s.nationalId && s.nationalId === cleanId) ||
             (s.studentNumber && s.studentNumber === cleanId) ||
             (s.parentPhone && normalizeLibyanPhone(s.parentPhone) === cleanId) ||
             (s.linkCode && s.linkCode.toLowerCase() === idLower) ||
             // أكواد العرض 1001/1002 — DEV_MODE فقط، ميتة في الإنتاج
             (DEV_MODE && ((cleanId === '1001' && (s.id === 'std-1' || s.studentNumber === '2025-0101' || s.studentNumber === '5864392')) ||
             (cleanId === '1002' && (s.id === 'std-2' || s.studentNumber === '2025-0102'))))
      );

      if (candidates.length === 0) {
        const fail = this.recordFailedAttempt(cleanId);
        auditLogger.log({
          actorName: cleanId,
          actorRole: 'parent',
          action: 'PARENT_LOGIN_FAILED_UNKNOWN_STUDENT',
          entity: 'Security',
          details: `محاولة دخول ولي أمر بمعرّف غير مسجل (${cleanId})`,
          severity: 'WARN'
        });
        return {
          success: false,
          error: fail.isLocked
            ? `تم تجميد الدخول ${fail.remainingSeconds} ثانية.`
            : 'لم نجد طالباً بهذا الرقم. أدخل الرقم الوطني للطالب أو رقم القيد أو هاتف ولي الأمر المسجل لدى المدرسة.'
        };
      }

      if (!cleanSecret) {
        return { success: false, error: 'يرجى إدخال رمز دخول ولي الأمر (6 أرقام) المسلّم من إدارة المدرسة.' };
      }

      const matched = candidates.filter(s => this.parentSecretsFor(s).includes(cleanSecret));
      if (matched.length === 0) {
        const fail = this.recordFailedAttempt(cleanId);
        auditLogger.log({
          actorName: cleanId,
          actorRole: 'parent',
          action: 'PARENT_LOGIN_FAILED_WRONG_CODE',
          entity: 'Security',
          details: `رمز دخول ولي أمر خاطئ للمعرّف (${cleanId})`,
          severity: 'WARN'
        });
        return {
          success: false,
          error: fail.isLocked
            ? `تم تجميد الدخول ${fail.remainingSeconds} ثانية.`
            : `رمز الدخول غير صحيح. المحاولات المتبقية: (${fail.attemptsLeft}). الرمز مطبوع على بطاقة ولي الأمر من المدرسة.`
        };
      }

      // الإخوة: كل طالب يحمل نفس هاتف ولي الأمر يُضاف تلقائياً لحسابه
      const primary = matched[0];
      const phone = primary.parentPhone ? normalizeLibyanPhone(primary.parentPhone) : '';
      // حد أقصى معقول للإخوة: إن تكرر الهاتف على عدد كبير فهو رقم افتراضي/خاطئ في الكشف لا هاتف أسرة
      const samePhone = phone && LIBYAN_PHONE_RE.test(phone)
        ? studentList.filter(s => s.parentPhone && normalizeLibyanPhone(s.parentPhone) === phone)
        : [];
      const siblings = samePhone.length <= MAX_SIBLINGS ? samePhone : [];
      const studentIds = Array.from(new Set([...matched, ...siblings].map(s => s.id)));

      this.clearAttempts(cleanId);
      const parentName = primary.parentName || `ولي أمر ${primary.name}`;
      auditLogger.log({
        actorName: parentName,
        actorRole: 'parent',
        action: 'PARENT_LOGIN_SUCCESS',
        entity: 'Security',
        details: `دخول ناجح لولي الأمر (${primary.name}) — عدد الأبناء: ${studentIds.length}`,
        severity: 'INFO'
      });

      return {
        success: true,
        role: 'parent',
        actorName: parentName,
        actorId: primary.id,
        studentIds
      };
    }

    return { success: false, error: 'نوع الحساب غير معروف.' };
  }

  /**
   * الفحص الذكي التلقائي وتحديد الدور تلقائياً (Smart Dynamic Login)
   * يفحص الهوية الممررة ويطابقها مع الحسابات المعتمدة دون الحاجة لاختيار الدور مسبقاً
   */
  public static detectAndVerify(identifier: string, secret: string): AuthResult {
    const cleanId = normalizeLibyanPhone(identifier || '');
    const cleanSecret = (secret || '').trim();

    if (!cleanId) {
      return { success: false, error: 'يرجى إدخال رقم الهاتف أو المعرّف الرسمي أو كود الدخول.' };
    }

    // 1. فحص المدير العام (Super Admin)
    if (cleanId.toUpperCase() === 'DISTRICT-SUPER-01' || cleanId.toLowerCase() === 'superadmin') {
      return this.verifyCredentials({ role: 'superadmin', identifier: cleanId, password: cleanSecret });
    }

    // 2. إذا كان رقم هاتف ليبي
    if (LIBYAN_PHONE_RE.test(cleanId)) {
      const adminPhones = this.getAuthorizedAdminPhones();
      if (adminPhones.includes(cleanId)) {
        const res = this.verifyCredentials({ role: 'admin', identifier: cleanId, password: cleanSecret });
        if (res.success || !this.getAuthorizedExamsPhones().includes(cleanId)) {
          return res;
        }
      } else if (this.isAdminUnclaimed() && cleanSecret === SecurityEngine.getDirectorPin()) {
        // تثبيت جديد: لا يُسجَّل الهاتف مديراً إلا برمز المدير الصحيح (وإلا يُفحص كمعلم/ولي أمر)
        return this.verifyCredentials({ role: 'admin', identifier: cleanId, password: cleanSecret });
      }

      const examsPhones = this.getAuthorizedExamsPhones();
      if (examsPhones.includes(cleanId)) {
        return this.verifyCredentials({ role: 'exams_coordinator', identifier: cleanId, password: cleanSecret });
      }

      // فحص إذا كان هاتف معلم
      const teacherList: TeacherAccount[] = this.loadTeachers();

      const foundTeacherByPhone = teacherList.find(t => t.phone && t.phone.trim() === cleanId);
      if (foundTeacherByPhone) {
        return this.verifyCredentials({ role: 'teacher', identifier: foundTeacherByPhone.code, password: cleanSecret });
      }

      // محاولة فحص ولي الأمر بالهاتف
      return this.verifyCredentials({ role: 'parent', identifier: cleanId, password: cleanSecret });
    }

    // 3. كود معلم أو أخصائي مسجل فعلاً في كادر المدرسة
    const upper = cleanId.toUpperCase();
    if (this.loadTeachers().some(t => t.code.trim().toUpperCase() === upper)) {
      return this.verifyCredentials({ role: 'teacher', identifier: cleanId, password: cleanSecret });
    }

    // 4. رقم وطني (12 رقماً) أو رقم قيد أو رمز ربط طالب ← ولي الأمر.
    // كود يشبه رموز الكادر ولم يُعثر عليه: رسالة معلم واضحة بدل رسالة ولي الأمر.
    if (upper.startsWith('LIB-')) {
      return this.verifyCredentials({ role: 'teacher', identifier: cleanId, password: cleanSecret });
    }
    return this.verifyCredentials({ role: 'parent', identifier: cleanId, password: cleanSecret });
  }
}
