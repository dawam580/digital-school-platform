/**
 * عزل بيانات المدارس على جهاز واحد (src/services/storage/schoolVault.ts)
 * يُشغَّل الكود الحقيقي مع خزنة قرص وهمية (جسر Electron) لأن Node بلا IndexedDB.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSrc, installLocalStorage } from './build-module.mjs';

const vault = await importSrc('src/services/storage/schoolVault.ts');

function setup() {
  const store = installLocalStorage();
  const files = new Map();
  globalThis.window = {
    electronAPI: {
      vaultSave: async (id, json) => { files.set(id, json); return true; },
      vaultLoad: id => files.get(id) ?? null,
      vaultDelete: async id => { files.delete(id); return true; },
    },
  };
  return { store, files };
}

const schoolKeys = (store) => [...store.keys()].filter(k => vault.isSchoolScopedKey(k)).sort();

test('سياسة المفاتيح: بيانات المدرسة معزولة، والجلسة وأختام الجهاز تبقى', () => {
  for (const k of ['madrasa_db_students_v3', 'madrasa_db_teachers_v4', 'madrasa_school_profile_v1',
    'madrasa_director_pin_sec', 'madrasa_active_license_key', 'madrasa_exam_grades_v2',
    'madrasa_parent_pwd_std-1', 'madrasa_teacher_pwd_LIB-X', 'madrasa_some_future_key']) {
    assert.equal(vault.isSchoolScopedKey(k), true, k);
  }
  for (const k of ['madrasa_saved_schools_v1', 'madrasa_auth_role', 'madrasa_session_active',
    'madrasa_device_trial_v1', 'madrasa_superadmin_pin_sec', 'madrasa_dark_mode',
    'madrasa_ui_collapsed_admin-actions', 'other_app_key']) {
    assert.equal(vault.isSchoolScopedKey(k), false, k);
  }
});

test('إنشاء مدرسة جديدة: تُحفظ الحالية وتبدأ الجديدة فارغة مع بقاء جلسة المدير', async () => {
  const { store, files } = setup();
  localStorage.setItem('madrasa_db_students_v3', '[{"id":"a1"}]');
  localStorage.setItem('madrasa_db_notifications_v3', '[{"id":"n1"}]');
  localStorage.setItem('madrasa_director_pin_sec', '482913');
  localStorage.setItem('madrasa_auth_role', 'admin');
  localStorage.setItem('madrasa_session_active', '1');

  assert.equal(await vault.swapActiveSchool('school-A', null), true);

  assert.deepEqual(schoolKeys(store), []);
  assert.equal(localStorage.getItem('madrasa_auth_role'), 'admin');
  assert.equal(localStorage.getItem('madrasa_session_active'), '1');
  const saved = JSON.parse(files.get('school-A'));
  assert.equal(saved.local['madrasa_db_students_v3'], '[{"id":"a1"}]');
  assert.equal(saved.local['madrasa_auth_role'], undefined);
});

test('التبديل ذهاباً وإياباً يعيد كل مدرسة كما كانت دون أي تسرب', async () => {
  const { store } = setup();
  localStorage.setItem('madrasa_db_students_v3', 'A-students');
  localStorage.setItem('madrasa_db_case_studies_v3', 'A-cases');
  await vault.swapActiveSchool('A', null);

  localStorage.setItem('madrasa_db_students_v3', 'B-students');
  await vault.swapActiveSchool('B', 'A');
  assert.equal(localStorage.getItem('madrasa_db_students_v3'), 'A-students');
  assert.equal(localStorage.getItem('madrasa_db_case_studies_v3'), 'A-cases');

  await vault.swapActiveSchool('A', 'B');
  assert.equal(localStorage.getItem('madrasa_db_students_v3'), 'B-students');
  assert.equal(localStorage.getItem('madrasa_db_case_studies_v3'), null, 'ملفات A الاجتماعية لا تظهر في B');
  assert.deepEqual(schoolKeys(store), ['madrasa_db_students_v3']);
});

test('25 مدرسة على جهاز واحد: كل مدرسة تُستعاد ببياناتها فقط', async () => {
  setup();
  const N = 25;
  const big = 'x'.repeat(200_000); // ~200KB لكل مدرسة (كشف طلاب كبير)
  for (let i = 0; i < N; i++) {
    localStorage.setItem('madrasa_db_students_v3', `school-${i}:${big}`);
    localStorage.setItem('madrasa_school_profile_v1', JSON.stringify({ id: `s${i}`, name: `مدرسة ${i}` }));
    assert.equal(await vault.swapActiveSchool(`s${i}`, null), true);
  }
  for (const i of [0, 7, 13, 24]) {
    await vault.swapActiveSchool('scratch', `s${i}`, { saveCurrent: false });
    assert.ok(localStorage.getItem('madrasa_db_students_v3').startsWith(`school-${i}:`));
    assert.equal(JSON.parse(localStorage.getItem('madrasa_school_profile_v1')).name, `مدرسة ${i}`);
  }
});

test('توافق خلفي: لقطة الإصدار القديم (طلاب/فصول/معلمين) تُستعاد', async () => {
  setup();
  localStorage.setItem('madrasa_school_data_old-1', JSON.stringify({ students: [{ id: 'o1' }], teachers: [] }));
  await vault.swapActiveSchool('current', 'old-1');
  assert.deepEqual(JSON.parse(localStorage.getItem('madrasa_db_students_v3')), [{ id: 'o1' }]);
  assert.deepEqual(JSON.parse(localStorage.getItem('madrasa_db_teachers_v4')), []);
});

test('فشل حفظ المدرسة الحالية = لا يُمس شيء', async () => {
  installLocalStorage();
  globalThis.window = { electronAPI: { vaultSave: async () => false } };
  localStorage.setItem('madrasa_db_students_v3', 'keep-me');
  assert.equal(await vault.swapActiveSchool('A', null), false);
  assert.equal(localStorage.getItem('madrasa_db_students_v3'), 'keep-me');
});
