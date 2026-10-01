/**
 * اختبار حقيقي للحفظ الدائم على القرص (src/services/storage/desktopPersistence.ts)
 * مع جسر Electron وهمي يحاكي ملف القرص.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSrc } from './build-module.mjs';

class FakeStorage {
  #m = new Map();
  getItem(k) { return this.#m.has(k) ? this.#m.get(k) : null; }
  setItem(k, v) { this.#m.set(k, String(v)); }
  removeItem(k) { this.#m.delete(k); }
  clear() { this.#m.clear(); }
  key(i) { return [...this.#m.keys()][i] ?? null; }
  get length() { return this.#m.size; }
}

function setupEnv(diskEntries) {
  const disk = { ...diskEntries };
  const listeners = {};
  globalThis.Storage = FakeStorage;
  globalThis.localStorage = new FakeStorage();
  globalThis.window = {
    localStorage: globalThis.localStorage,
    addEventListener: (ev, fn) => { listeners[ev] = fn; },
    electronAPI: {
      loadPersistedStore: () => ({ ...disk }),
      persistStore: async changes => {
        for (const [k, v] of Object.entries(changes)) v === null ? delete disk[k] : (disk[k] = v);
        return true;
      },
      persistStoreSync: changes => {
        for (const [k, v] of Object.entries(changes)) v === null ? delete disk[k] : (disk[k] = v);
        return true;
      }
    }
  };
  return { disk, listeners };
}

test('تُستعاد بيانات المدرسة من القرص إذا مُسحت من المتصفح، وتُحفظ التعديلات الجديدة', async () => {
  const { disk, listeners } = setupEnv({
    madrasa_school_profile_v1: '{"name":"مدرسة النور"}',
    madrasa_db_students_v3: '[1,2,3]'
  });
  const { initDesktopPersistence } = await importSrc('src/services/storage/desktopPersistence.ts');
  initDesktopPersistence();

  assert.equal(localStorage.getItem('madrasa_db_students_v3'), '[1,2,3]');
  assert.equal(localStorage.getItem('madrasa_school_profile_v1'), '{"name":"مدرسة النور"}');

  localStorage.setItem('madrasa_db_students_v3', '[1,2,3,4]');
  localStorage.setItem('unrelated_key', 'x');
  localStorage.setItem('madrasa_autobackup_0', 'big');
  localStorage.removeItem('madrasa_school_profile_v1');
  listeners.beforeunload();

  assert.equal(disk.madrasa_db_students_v3, '[1,2,3,4]');
  assert.equal('madrasa_school_profile_v1' in disk, false);
  assert.equal('unrelated_key' in disk, false, 'مفاتيح غير المنظومة لا تُحفظ');
  assert.equal('madrasa_autobackup_0' in disk, false, 'لقطات المتصفح الداخلية لا تُكرر على القرص');
});
