/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * خزنة التشفير الحبيبي للبيانات الحساسة محلياً (Field-Level Client Crypto Vault)
 * ============================================================================
 */

import { Student } from '../../types';
import { getCleanAvatar } from '../../utils/avatarHelper';

const CIPHER_PREFIX = 'ENC::';

/*
 * ضغط سجل الحضور عند التخزين: مدرسة بـ900 طالب × عام دراسي كامل تتجاوز حد
 * localStorage (5MB) إن خُزّن كل يوم ككائن JSON (~40 حرفاً). الأيام بلا ملاحظة
 * تُخزن كنص مضغوط "20260901p,20260902u" (10 أحرف لليوم)، وذات الملاحظة تبقى كائنات.
 */
const STATUS_TO_CODE: Record<string, string> = { present: 'p', late: 'l', excused: 'e', unexcused: 'u' };
const CODE_TO_STATUS: Record<string, 'present' | 'late' | 'excused' | 'unexcused'> = { p: 'present', l: 'late', e: 'excused', u: 'unexcused' };
type PackedStudent = Student & { _att?: string };

/** الصورة الرمزية المولّدة (SVG من الاسم والجنس) لا تُخزَّن — ~1.3KB لكل طالب — وتُعاد عند القراءة */
const isGeneratedAvatar = (a: string | undefined) => typeof a === 'string' && a.startsWith('data:image/svg+xml');

function packAttendance(input: Student): Student {
  const student = isGeneratedAvatar(input.avatar) ? { ...input, avatar: '' } : input;
  const list = student.recentAttendance;
  if (!Array.isArray(list) || list.length === 0) return student;
  const packed: string[] = [];
  const kept: NonNullable<Student['recentAttendance']> = [];
  for (const r of list) {
    const code = STATUS_TO_CODE[r.status];
    if (code && !r.note && /^\d{4}-\d{2}-\d{2}$/.test(r.date)) packed.push(r.date.replace(/-/g, '') + code);
    else kept.push(r);
  }
  if (packed.length === 0) return student;
  return { ...student, recentAttendance: kept, _att: packed.join(',') } as PackedStudent;
}

function unpackAttendance(input: Student): Student {
  const student = input.avatar ? input : { ...input, avatar: getCleanAvatar(input.name, input.gender) };
  const packed = (student as PackedStudent)._att;
  if (typeof packed !== 'string') return student;
  const { _att, ...rest } = student as PackedStudent;
  const entries = packed.split(',').filter(Boolean).map(t => ({
    date: `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}`,
    status: CODE_TO_STATUS[t[8]] || 'present',
  }));
  const merged = [...(rest.recentAttendance || []), ...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return { ...rest, recentAttendance: merged };
}
const DEFAULT_SALT = 'LY-MADRASA-SEC-VAULT-2026-KEY';

export class CryptoVaultService {
  private static masterSalt: string = DEFAULT_SALT;

  public static setMasterSalt(customSalt: string) {
    if (customSalt && customSalt.trim().length >= 6) {
      this.masterSalt = customSalt.trim();
    }
  }

  /**
   * Check if a given string is already encrypted with our vault
   */
  public static isEncrypted(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return value.startsWith(CIPHER_PREFIX);
  }

  /**
   * Encrypt a sensitive text field (Synchronous, browser & Node.js friendly)
   */
  public static encryptField(plaintext: string | undefined | null): string {
    if (!plaintext || typeof plaintext !== 'string') return '';
    if (this.isEncrypted(plaintext)) return plaintext; // Already encrypted

    const salt = this.masterSalt;
    let result = '';
    
    // Polyalphabetic salted cyclic XOR transformation with UTF-8 support
    for (let i = 0; i < plaintext.length; i++) {
      const charCode = plaintext.charCodeAt(i);
      const saltCode = salt.charCodeAt(i % salt.length);
      const shift = (saltCode * (i + 1)) % 256;
      const cipherChar = String.fromCharCode(charCode ^ shift);
      result += cipherChar;
    }

    try {
      // Safe base64 encoding with URI component escape for Arabic characters
      const b64 = btoa(encodeURIComponent(result));
      return `${CIPHER_PREFIX}${b64}`;
    } catch {
      // Fallback in case of edge case strings
      return plaintext;
    }
  }

  /**
   * Decrypt a sensitive text field
   */
  public static decryptField(ciphertext: string | undefined | null): string {
    if (!ciphertext || typeof ciphertext !== 'string') return '';
    if (!this.isEncrypted(ciphertext)) return ciphertext; // Return plain as-is

    try {
      const b64 = ciphertext.substring(CIPHER_PREFIX.length);
      const raw = decodeURIComponent(atob(b64));
      const salt = this.masterSalt;
      let plaintext = '';

      for (let i = 0; i < raw.length; i++) {
        const charCode = raw.charCodeAt(i);
        const saltCode = salt.charCodeAt(i % salt.length);
        const shift = (saltCode * (i + 1)) % 256;
        const plainChar = String.fromCharCode(charCode ^ shift);
        plaintext += plainChar;
      }

      return plaintext;
    } catch {
      // If decryption fails, return original value without crashing
      return ciphertext;
    }
  }

  /**
   * Mask a sensitive string for safe UI presentation (e.g. 1201900*****)
   */
  public static maskSensitiveString(value: string | undefined | null, visibleStart = 4, visibleEnd = 2): string {
    if (!value) return '—';
    const plain = this.decryptField(value);
    if (plain.length <= visibleStart + visibleEnd) return plain;
    const start = plain.substring(0, visibleStart);
    const end = plain.substring(plain.length - visibleEnd);
    const stars = '•'.repeat(Math.max(3, plain.length - visibleStart - visibleEnd));
    return `${start}${stars}${end}`;
  }

  /**
   * Encrypt sensitive fields of a student object before storage
   */
  public static encryptStudent(student: Student): Student {
    return {
      ...packAttendance(student),
      nationalNumber: student.nationalNumber ? this.encryptField(student.nationalNumber) : student.nationalNumber,
      parentPhone: student.parentPhone ? this.encryptField(student.parentPhone) : student.parentPhone,
      parentEmail: student.parentEmail && student.parentEmail !== '—' ? this.encryptField(student.parentEmail) : student.parentEmail
    };
  }

  /**
   * Decrypt sensitive fields of a student object for runtime memory use
   */
  public static decryptStudent(student: Student): Student {
    return {
      ...unpackAttendance(student),
      nationalNumber: student.nationalNumber ? this.decryptField(student.nationalNumber) : student.nationalNumber,
      parentPhone: student.parentPhone ? this.decryptField(student.parentPhone) : student.parentPhone,
      parentEmail: student.parentEmail ? this.decryptField(student.parentEmail) : student.parentEmail
    };
  }

  /**
   * Batch encrypt an array of students
   */
  public static encryptStudentsBatch(students: Student[]): Student[] {
    return students.map(s => this.encryptStudent(s));
  }

  /**
   * Batch decrypt an array of students
   */
  public static decryptStudentsBatch(students: Student[]): Student[] {
    return students.map(s => this.decryptStudent(s));
  }
}
