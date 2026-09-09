/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك سجلات التدقيق والمتابعة الأمنية (Audit Logger & Security Trail)
 * ============================================================================
 */

import { UserRole } from '../../types';
import { indexedDBManager } from '../storage/indexedDb';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entity: string;
  details: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
}

const AUDIT_STORAGE_KEY = 'madrasa_db_audit_logs_v4';

export class AuditLogger {
  private inMemoryLogs: AuditLogEntry[] = [];

  constructor() {
    this.loadInitialLogs();
  }

  private loadInitialLogs() {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // هجرة الطوابع القديمة (نصوص عرض عربية) إلى ISO مرة واحدة
        this.inMemoryLogs = (Array.isArray(parsed) ? parsed : []).map((e: AuditLogEntry) => ({
          ...e,
          timestamp: AuditLogger.toISO(e.timestamp),
        })).filter((e: AuditLogEntry) => e && e.id && e.action);
      } else {
        // نزاهة السجل: لا قيود مختلقة — قيد إقلاع حقيقي واحد فقط
        this.inMemoryLogs = [
          {
            id: `AUD-${Date.now().toString(36).toUpperCase()}`,
            timestamp: new Date().toISOString(),
            actorName: 'النظام',
            actorRole: 'admin',
            action: 'SYSTEM_BOOT',
            entity: 'System',
            details: 'تهيئة سجل التدقيق على هذا الجهاز.',
            severity: 'INFO'
          }
        ];
        this.persist();
      }
    } catch {
      this.inMemoryLogs = [];
    }
  }

  /** تحويل أي طابع قديم إلى ISO، مع إبقاء الأصل عند الفشل */
  private static toISO(ts: unknown): string {
    if (typeof ts !== 'string' || !ts) return new Date().toISOString();
    const d = new Date(ts);
    if (!isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(ts)) return ts;
    if (!isNaN(d.getTime())) return d.toISOString();
    return ts; // نص عرض قديم غير قابل للتحويل — يُعرض كما هو
  }

  /** عرض آمن للطابع في الواجهات (ISO → عربي، والقديم كما هو) */
  public static formatTimestamp(ts: string): string {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' } as Intl.DateTimeFormatOptions);
    } catch {
      return ts;
    }
  }

  private persist() {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.inMemoryLogs.slice(-100)));
      indexedDBManager.putAll('audit_logs', this.inMemoryLogs.slice(-100)).catch(() => {});
    } catch {}
  }

  public log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `AUD-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };

    this.inMemoryLogs.unshift(newEntry);
    this.persist();
  }

  public getLogs(): AuditLogEntry[] {
    return this.inMemoryLogs;
  }

  public clearLogs() {
    this.inMemoryLogs = [];
    this.persist();
  }

  public exportCSV(): string {
    const headers = 'ID,Timestamp,Actor,Role,Action,Entity,Details,Severity\n';
    const rows = this.inMemoryLogs.map(l =>
      `"${l.id}","${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.entity}","${l.details.replace(/"/g, '""')}","${l.severity}"`
    ).join('\n');
    return '\uFEFF' + headers + rows;
  }
}

export const auditLogger = new AuditLogger();
