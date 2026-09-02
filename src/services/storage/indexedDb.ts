/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك التخزين وقواعد البيانات المتقدم IndexedDB Transactional Engine
 * ============================================================================
 */

const DB_NAME = 'MadrasaDigitalSchoolDB_v4';
const DB_VERSION = 1;

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private isReadyPromise: Promise<IDBDatabase>;

  constructor() {
    this.isReadyPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('IndexedDB not supported in this environment, falling back to LocalStorage.');
        return reject(new Error('IndexedDB not supported'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Students Store
        if (!db.objectStoreNames.contains('students')) {
          const studentStore = db.createObjectStore('students', { keyPath: 'id' });
          studentStore.createIndex('nationalId', 'nationalId', { unique: true });
          studentStore.createIndex('linkCode', 'linkCode', { unique: true });
          studentStore.createIndex('className', 'className', { unique: false });
        }

        // 2. Grades Store
        if (!db.objectStoreNames.contains('grades')) {
          const gradesStore = db.createObjectStore('grades', { keyPath: 'id', autoIncrement: true });
          gradesStore.createIndex('studentId', 'studentId', { unique: false });
          gradesStore.createIndex('subjectCode', 'subjectCode', { unique: false });
        }

        // 3. Assignments Store
        if (!db.objectStoreNames.contains('assignments')) {
          const assignmentStore = db.createObjectStore('assignments', { keyPath: 'id' });
          assignmentStore.createIndex('subject', 'subject', { unique: false });
          assignmentStore.createIndex('dueDate', 'dueDate', { unique: false });
        }

        // 4. Conversations & Messages Store
        if (!db.objectStoreNames.contains('conversations')) {
          const convStore = db.createObjectStore('conversations', { keyPath: 'id' });
          convStore.createIndex('teacherId', 'teacherId', { unique: false });
        }

        // 5. Audit Logs Store
        if (!db.objectStoreNames.contains('audit_logs')) {
          const auditStore = db.createObjectStore('audit_logs', { keyPath: 'id', autoIncrement: true });
          auditStore.createIndex('timestamp', 'timestamp', { unique: false });
          auditStore.createIndex('actorRole', 'actorRole', { unique: false });
          auditStore.createIndex('action', 'action', { unique: false });
        }

        // 6. Settings & Metadata Store
        if (!db.objectStoreNames.contains('system_settings')) {
          db.createObjectStore('system_settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event: Event) => {
        console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  public async getDatabase(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return this.isReadyPromise;
  }

  // Generic Get All
  public async getAll<T>(storeName: string): Promise<T[]> {
    try {
      const db = await this.getDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Fallback to localStorage
      const fallbackKey = `madrasa_db_${storeName}_v3`;
      const fallback = localStorage.getItem(fallbackKey);
      return fallback ? JSON.parse(fallback) : [];
    }
  }

  // Generic Put / Upsert
  public async put<T>(storeName: string, item: T): Promise<StorageResult<T>> {
    try {
      const db = await this.getDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => resolve({ success: true, data: item });
        request.onerror = () => resolve({ success: false, error: request.error?.message });
      });
    } catch (e: any) {
      return { success: false, error: e?.message || 'Storage error' };
    }
  }

  // Generic Bulk Put / Batch Transaction
  public async putAll<T>(storeName: string, items: T[]): Promise<StorageResult<boolean>> {
    try {
      const db = await this.getDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear(); // Clear existing to maintain consistency
        items.forEach((item) => store.put(item));

        tx.oncomplete = () => resolve({ success: true, data: true });
        tx.onerror = () => resolve({ success: false, error: tx.error?.message });
      });
    } catch (e: any) {
      return { success: false, error: e?.message || 'Bulk storage error' };
    }
  }

  // Delete by Key
  public async delete(storeName: string, key: IDBValidKey): Promise<StorageResult<boolean>> {
    try {
      const db = await this.getDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => resolve({ success: true, data: true });
        request.onerror = () => resolve({ success: false, error: request.error?.message });
      });
    } catch (e: any) {
      return { success: false, error: e?.message || 'Delete error' };
    }
  }

  // Clear Entire Store
  public async clear(storeName: string): Promise<StorageResult<boolean>> {
    try {
      const db = await this.getDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve({ success: true, data: true });
        request.onerror = () => resolve({ success: false, error: request.error?.message });
      });
    } catch (e: any) {
      return { success: false, error: e?.message || 'Clear error' };
    }
  }
}

export const indexedDBManager = new IndexedDBManager();
