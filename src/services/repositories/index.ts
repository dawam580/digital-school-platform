/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * طبقة المستودعات النمطية (Typed Repository Pattern Layer)
 * ============================================================================
 */

import { Student, SubjectGrade, Assignment, TeacherConversation } from '../../types';
import { indexedDBManager } from '../storage/indexedDb';

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
      if (idbData && idbData.length > 0) return idbData;
      
      const local = localStorage.getItem(this.localKey);
      return local ? JSON.parse(local) : [];
    } catch {
      const local = localStorage.getItem(this.localKey);
      return local ? JSON.parse(local) : [];
    }
  }

  async saveAll(students: Student[]): Promise<boolean> {
    try {
      localStorage.setItem(this.localKey, JSON.stringify(students));
      await indexedDBManager.putAll(this.storeName, students);
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

export const studentRepository = new StudentRepository();
export const conversationRepository = new ConversationRepository();
