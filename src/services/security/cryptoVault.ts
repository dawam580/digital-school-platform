/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * خزنة التشفير الحبيبي للبيانات الحساسة محلياً (Field-Level Client Crypto Vault)
 * ============================================================================
 */

import { Student } from '../../types';

const CIPHER_PREFIX = 'ENC::';
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
      ...student,
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
      ...student,
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
