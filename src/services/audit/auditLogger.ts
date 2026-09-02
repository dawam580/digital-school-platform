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

class AuditLogger {
  private inMemoryLogs: AuditLogEntry[] = [];

  constructor() {
    this.loadInitialLogs();
  }

  private loadInitialLogs() {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        this.inMemoryLogs = JSON.parse(stored);
      } else {
        // Seed some initial audit records
        this.inMemoryLogs = [
          {
            id: 'AUD-001',
            timestamp: new Date(Date.now() - 3600000).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            actorName: 'إدارة المدرسة (النظام)',
            actorRole: 'admin',
            action: 'INITIALIZE_SECURITY_MATRIX',
            entity: 'System',
            details: 'تم تفعيل منظومة الأمان والتشفير الثلاثي وحماية قواعد البيانات بنجاح.',
            severity: 'INFO'
          },
          {
            id: 'AUD-002',
            timestamp: new Date(Date.now() - 1800000).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            actorName: 'أ. خالد الشهري',
            actorRole: 'teacher',
            action: 'UPDATE_GRADES',
            entity: 'SubjectGrade',
            details: 'رصد درجات الفترة الأولى لمادة الرياضيات لفصل 3/أ.',
            severity: 'INFO'
          }
        ];
        this.persist();
      }
    } catch {
      this.inMemoryLogs = [];
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
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
