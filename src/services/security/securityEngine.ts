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
}
