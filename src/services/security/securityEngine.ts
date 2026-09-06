/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك الأمان، الصلاحيات، وفحص التلاعب (Security, RBAC & Anti-Tamper Engine)
 * ============================================================================
 */

import { UserRole, Student } from '../../types';

export type Permission =
  | 'VIEW_STUDENT_PROFILE'
  | 'EDIT_STUDENT_PROFILE'
  | 'VIEW_GRADES'
  | 'EDIT_GRADES'
  | 'APPROVE_GRADES'
  | 'SOLVE_ASSIGNMENT'
  | 'CREATE_ASSIGNMENT'
  | 'GRADE_ASSIGNMENT'
  | 'SEND_CHAT'
  | 'VIEW_ALL_CHATS'
  | 'TAKE_ATTENDANCE'
  | 'VIEW_ATTENDANCE_REPORTS'
  | 'ACCESS_EXCEL_HUB'
  | 'ACCESS_DB_STUDIO'
  | 'VIEW_AUDIT_LOGS'
  | 'EXPORT_DATA'
  | 'IMPORT_DATA'
  | 'RESET_SYSTEM';

// Granular RBAC Permissions Matrix
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  parent: [
    'VIEW_STUDENT_PROFILE',
    'VIEW_GRADES',
    'SOLVE_ASSIGNMENT',
    'SEND_CHAT',
    'VIEW_ATTENDANCE_REPORTS'
  ],
  teacher: [
    'VIEW_STUDENT_PROFILE',
    'VIEW_GRADES',
    'EDIT_GRADES',
    'SOLVE_ASSIGNMENT',
    'CREATE_ASSIGNMENT',
    'GRADE_ASSIGNMENT',
    'SEND_CHAT',
    'VIEW_ALL_CHATS',
    'TAKE_ATTENDANCE',
    'VIEW_ATTENDANCE_REPORTS'
  ],
  counselor: [
    'VIEW_STUDENT_PROFILE',
    'VIEW_GRADES',
    'VIEW_ATTENDANCE_REPORTS',
    'SEND_CHAT',
    'VIEW_ALL_CHATS'
  ],
  exams_coordinator: [
    'VIEW_STUDENT_PROFILE',
    'VIEW_GRADES',
    'EDIT_GRADES',
    'APPROVE_GRADES',
    'VIEW_ATTENDANCE_REPORTS',
    'ACCESS_EXCEL_HUB',
    'EXPORT_DATA',
    'IMPORT_DATA'
  ],
  admin: [
    'VIEW_STUDENT_PROFILE',
    'EDIT_STUDENT_PROFILE',
    'VIEW_GRADES',
    'EDIT_GRADES',
    'APPROVE_GRADES',
    'SOLVE_ASSIGNMENT',
    'CREATE_ASSIGNMENT',
    'GRADE_ASSIGNMENT',
    'SEND_CHAT',
    'VIEW_ALL_CHATS',
    'TAKE_ATTENDANCE',
    'VIEW_ATTENDANCE_REPORTS',
    'ACCESS_EXCEL_HUB',
    'ACCESS_DB_STUDIO',
    'VIEW_AUDIT_LOGS',
    'EXPORT_DATA',
    'IMPORT_DATA',
    'RESET_SYSTEM'
  ],
  superadmin: [
    'VIEW_STUDENT_PROFILE',
    'EDIT_STUDENT_PROFILE',
    'VIEW_GRADES',
    'EDIT_GRADES',
    'APPROVE_GRADES',
    'SOLVE_ASSIGNMENT',
    'CREATE_ASSIGNMENT',
    'GRADE_ASSIGNMENT',
    'SEND_CHAT',
    'VIEW_ALL_CHATS',
    'TAKE_ATTENDANCE',
    'VIEW_ATTENDANCE_REPORTS',
    'ACCESS_EXCEL_HUB',
    'ACCESS_DB_STUDIO',
    'VIEW_AUDIT_LOGS',
    'EXPORT_DATA',
    'IMPORT_DATA',
    'RESET_SYSTEM'
  ]
};

export class SecurityEngine {
  // Check permission for role
  public static hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  // Assert permission with throw
  public static assertPermission(role: UserRole, permission: Permission): void {
    if (!this.hasPermission(role, permission)) {
      throw new Error(`Access Denied: Role '${role}' lacks permission '${permission}'`);
    }
  }

  // Sanitize text against XSS
  public static sanitizeString(input: string): string {
    if (!input) return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Clean / strip dangerous characters for chat and notes
  public static cleanText(input: string): string {
    if (!input) return '';
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
  }

  // Generate simple hash checksum for student academic record
  public static calculateStudentChecksum(student: Student): string {
    const raw = `${student.id}|${student.nationalId}|${student.academicAverage}|${student.attendanceRate}|${student.behaviorPointsTotal}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  // Validate student record integrity
  public static verifyStudentIntegrity(student: Student, expectedChecksum?: string): boolean {
    if (!expectedChecksum) return true;
    return this.calculateStudentChecksum(student) === expectedChecksum;
  }

  // Rate Limiting helper
  private static submissionTimestamps: Map<string, number> = new Map();

  public static checkRateLimit(key: string, cooldownMs: number = 1000): boolean {
    const now = Date.now();
    const last = this.submissionTimestamps.get(key) || 0;
    if (now - last < cooldownMs) {
      return false; // Rate limited
    }
    this.submissionTimestamps.set(key, now);
    return true; // Allowed
  }

  // ================= 2FA / DIRECTOR SECURITY PIN ================= //
  private static STORAGE_KEY_PIN = 'madrasa_director_pin_sec';
  private static failedAttempts = 0;
  private static lockoutUntil = 0;

  public static getDirectorPin(): string {
    try {
      return localStorage.getItem(this.STORAGE_KEY_PIN) || '2026';
    } catch {
      return '2026';
    }
  }

  public static setDirectorPin(newPin: string): boolean {
    if (!newPin || newPin.length < 4) return false;
    try {
      localStorage.setItem(this.STORAGE_KEY_PIN, newPin);
      return true;
    } catch {
      return false;
    }
  }

  public static isPinLockedOut(): { isLocked: boolean; remainingSeconds: number } {
    const now = Date.now();
    if (now < this.lockoutUntil) {
      const remaining = Math.ceil((this.lockoutUntil - now) / 1000);
      return { isLocked: true, remainingSeconds: remaining };
    }
    return { isLocked: false, remainingSeconds: 0 };
  }

  public static verifyDirectorPin(inputPin: string): { valid: boolean; message: string } {
    const lockout = this.isPinLockedOut();
    if (lockout.isLocked) {
      return {
        valid: false,
        message: `تم تجميد المحاولات مؤقتاً لحماية النظام. يرجى الانتظار (${lockout.remainingSeconds}) ثانية.`
      };
    }

    const expected = this.getDirectorPin();
    if (inputPin.trim() === expected.trim()) {
      this.failedAttempts = 0;
      this.lockoutUntil = 0;
      return { valid: true, message: 'رمز الأمان صحيح' };
    }

    this.failedAttempts++;
    if (this.failedAttempts >= 3) {
      this.lockoutUntil = Date.now() + 30000; // 30s lockout
      return {
        valid: false,
        message: 'تم استنفاد 3 محاولات خاطئة. تم قفل المحاولات مؤقتاً لمدة 30 ثانية للحماية من التخمين.'
      };
    }

    return {
      valid: false,
      message: `رمز الأمان غير صحيح. المحاولات المتبقية: (${3 - this.failedAttempts})`
    };
  }
}

export { CryptoVaultService } from './cryptoVault';
