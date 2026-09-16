/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * طبقة المستودعات النمطية (Typed Repository Pattern Layer)
 * ============================================================================
 */

import { 
  Student, 
  SubjectGrade, 
  Assignment, 
  TeacherConversation,
  SchoolClass,
  TeacherAccount,
  NotificationItem,
  SocialCaseStudy,
  FinancialTransaction
} from '../../types';
import { indexedDBManager } from '../storage/indexedDb';
import { CryptoVaultService } from '../security/cryptoVault';

export interface IRepository<T> {
  getAll(): Promise<T[]>;
  saveAll(items: T[]): Promise<boolean>;
  save(item: T): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export class StudentRepository implements IRepository<Student> {
  private readonly storeName = 'students';
  private readonly localKey = 'madrasa_db_students_v3';

  async getAll(): Promise<Student[]> {
    try {
      const idbData = await indexedDBManager.getAll<Student>(this.storeName);
      if (idbData && idbData.length > 0) return CryptoVaultService.decryptStudentsBatch(idbData);
      
      const local = localStorage.getItem(this.localKey);
      return local ? CryptoVaultService.decryptStudentsBatch(JSON.parse(local)) : [];
    } catch {
      const local = localStorage.getItem(this.localKey);
      return local ? CryptoVaultService.decryptStudentsBatch(JSON.parse(local)) : [];
    }
  }

  async saveAll(students: Student[]): Promise<boolean> {
    try {
      const encrypted = CryptoVaultService.encryptStudentsBatch(students);
      localStorage.setItem(this.localKey, JSON.stringify(encrypted));
      await indexedDBManager.putAll(this.storeName, encrypted);
      return true;
    } catch {
      return false;
    }
  }

  async save(student: Student): Promise<boolean> {
    try {
      const all = await this.getAll();
      const idx = all.findIndex(s => s.id === student.id);
      if (idx >= 0) all[idx] = student;
      else all.push(student);
      return this.saveAll(all);
    } catch {
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const all = await this.getAll();
      const filtered = all.filter(s => s.id !== id);
      return this.saveAll(filtered);
    } catch {
      return false;
    }
  }
}

export class ConversationRepository implements IRepository<TeacherConversation> {
  private readonly storeName = 'conversations';
  private readonly localKey = 'madrasa_db_conversations_v3';

  async getAll(): Promise<TeacherConversation[]> {
    try {
      const idbData = await indexedDBManager.getAll<TeacherConversation>(this.storeName);
      if (idbData && idbData.length > 0) return idbData;
      const local = localStorage.getItem(this.localKey);
      return local ? JSON.parse(local) : [];
    } catch {
      const local = localStorage.getItem(this.localKey);
      return local ? JSON.parse(local) : [];
    }
  }

  async saveAll(conversations: TeacherConversation[]): Promise<boolean> {
    try {
      localStorage.setItem(this.localKey, JSON.stringify(conversations));
      await indexedDBManager.putAll(this.storeName, conversations);
      return true;
    } catch {
      return false;
    }
  }

  async save(conversation: TeacherConversation): Promise<boolean> {
    try {
      const all = await this.getAll();
      const idx = all.findIndex(c => c.id === conversation.id);
      if (idx >= 0) all[idx] = conversation;
      else all.push(conversation);
      return this.saveAll(all);
    } catch {
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const all = await this.getAll();
      const filtered = all.filter(c => c.id !== id);
      return this.saveAll(filtered);
    } catch {
      return false;
    }
  }
}

export class ClassRepository implements IRepository<SchoolClass> {
  private readonly storeName = 'classes';
  private readonly localKey = 'madrasa_db_classes_v3';

  async getAll(): Promise<SchoolClass[]> {
    try {
      const idbData = await indexedDBManager.getAll<SchoolClass>(this.storeName);
      if (idbData && idbData.length > 0) return idbData;
      const local = localStorage.getItem(this.localKey);
      return local ? JSON.parse(local) : [];
    } catch {
      const local = localStorage.getItem(this.localKey);
      return local ? JSON.parse(local) : [];
    }
  }

  async saveAll(classes: SchoolClass[]): Promise<boolean> {
    try {
      localStorage.setItem(this.localKey, JSON.stringify(classes));
      await indexedDBManager.putAll(this.storeName, classes);
      return true;
    } catch {
      return false;
    }
  }

  async save(schoolClass: SchoolClass): Promise<boolean> {
    try {
      const all = await this.getAll();
      const idx = all.findIndex(c => c.id === schoolClass.id);
      if (idx >= 0) all[idx] = schoolClass;
      else all.push(schoolClass);
      return this.saveAll(all);
    } catch {
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const all = await this.getAll();
      const filtered = all.filter(c => c.id !== id);
      return this.saveAll(filtered);
    } catch {
      return false;
    }
  }
}

export class TeacherRepository implements IRepository<TeacherAccount> {
  private readonly storeName = 'teachers';
  private readonly localKey = 'madrasa_db_teachers_v4';

  async getAll(): Promise<TeacherAccount[]> {
    try {
      const idbData = await indexedDBManager.getAll<TeacherAccount>(this.storeName);
      if (idbData && idbData.length > 0) return idbData;
      const local = localStorage.getItem(this.localKey);
      return local ? JSON.parse(local) : [];
    } catch {
      const local = localStorage.getItem(this.localKey);
      return local ? JSON.parse(local) : [];
    }
  }

  async saveAll(teachers: TeacherAccount[]): Promise<boolean> {
    try {
      localStorage.setItem(this.localKey, JSON.stringify(teachers));
      await indexedDBManager.putAll(this.storeName, teachers);
      return true;
    } catch {
      return false;
    }
  }

  async save(teacher: TeacherAccount): Promise<boolean> {
    try {
      const all = await this.getAll();
      const idx = all.findIndex(t => t.id === teacher.id);
      if (idx >= 0) all[idx] = teacher;
      else all.push(teacher);
      return this.saveAll(all);
    } catch {
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const all = await this.getAll();
      const filtered = all.filter(t => t.id !== id);
      return this.saveAll(filtered);
    } catch {
      return false;
    }
  }
}

export class NotificationRepository implements IRepository<NotificationItem> {
  private readonly storeName = 'notifications';
  private readonly localKey = 'madrasa_db_notifications_v3';

  async getAll(): Promise<NotificationItem[]> {
    try {
      const idbData = await indexedDBManager.getAll<NotificationItem>(this.storeName);
      if (idbData && idbData.length > 0) return idbData;
      const local = localStorage.getItem(this.localKey);
      return local ? JSON.parse(local) : [];
    } catch {
      const local = localStorage.getItem(this.localKey);
      return local ? JSON.parse(local) : [];
    }
  }

  async saveAll(notifications: NotificationItem[]): Promise<boolean> {
    try {
      localStorage.setItem(this.localKey, JSON.stringify(notifications));
      await indexedDBManager.putAll(this.storeName, notifications);
      return true;
    } catch {
      return false;
    }
  }

  async save(notif: NotificationItem): Promise<boolean> {
    try {
      const all = await this.getAll();
      const idx = all.findIndex(n => n.id === notif.id);
      if (idx >= 0) all[idx] = notif;
      else all.push(notif);
      return this.saveAll(all);
    } catch {
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const all = await this.getAll();
      const filtered = all.filter(n => n.id !== id);
      return this.saveAll(filtered);
    } catch {
      return false;
    }
  }
}

export class CounselingRepository implements IRepository<SocialCaseStudy> {
  private readonly storeName = 'case_studies';
  private readonly localKey = 'madrasa_db_case_studies_v3';

  async getAll(): Promise<SocialCaseStudy[]> {
    try {
      const idbData = await indexedDBManager.getAll<SocialCaseStudy>(this.storeName);
      if (idbData && idbData.length > 0) return idbData;
      const local = localStorage.getItem(this.localKey);
      return local ? JSON.parse(local) : [];
    } catch {
      const local = localStorage.getItem(this.localKey);
      return local ? JSON.parse(local) : [];
    }
  }

  async saveAll(cases: SocialCaseStudy[]): Promise<boolean> {
    try {
      localStorage.setItem(this.localKey, JSON.stringify(cases));
      await indexedDBManager.putAll(this.storeName, cases);
      return true;
    } catch {
      return false;
    }
  }

  async save(c: SocialCaseStudy): Promise<boolean> {
    try {
      const all = await this.getAll();
      const idx = all.findIndex(item => item.id === c.id);
      if (idx >= 0) all[idx] = c;
      else all.push(c);
      return this.saveAll(all);
    } catch {
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const all = await this.getAll();
      const filtered = all.filter(c => c.id !== id);
      return this.saveAll(filtered);
    } catch {
      return false;
    }
  }
}

export class FinanceRepository implements IRepository<FinancialTransaction> {
  private readonly storeName = 'financial_records';
  private readonly localKey = 'madrasa_db_finance_transactions_v1';

  async getAll(): Promise<FinancialTransaction[]> {
    try {
      const idbData = await indexedDBManager.getAll<FinancialTransaction>(this.storeName);
      if (idbData && idbData.length > 0) return idbData;
      const local = localStorage.getItem(this.localKey);
      return local ? JSON.parse(local) : [];
    } catch {
      const local = localStorage.getItem(this.localKey);
      return local ? JSON.parse(local) : [];
    }
  }

  async saveAll(items: FinancialTransaction[]): Promise<boolean> {
    try {
      localStorage.setItem(this.localKey, JSON.stringify(items));
      await indexedDBManager.putAll(this.storeName, items);
      return true;
    } catch {
      return false;
    }
  }

  async save(item: FinancialTransaction): Promise<boolean> {
    try {
      const all = await this.getAll();
      const idx = all.findIndex(t => t.id === item.id);
      if (idx >= 0) all[idx] = item;
      else all.push(item);
      return this.saveAll(all);
    } catch {
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const all = await this.getAll();
      const filtered = all.filter(t => t.id !== id);
      return this.saveAll(filtered);
    } catch {
      return false;
    }
  }
}

export const studentRepository = new StudentRepository();
export const conversationRepository = new ConversationRepository();
export const classRepository = new ClassRepository();
export const teacherRepository = new TeacherRepository();
export const notificationRepository = new NotificationRepository();
export const counselingRepository = new CounselingRepository();
export const financeRepository = new FinanceRepository();
