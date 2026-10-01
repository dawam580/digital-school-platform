/**
 * يبني وحدة من كود المنظومة الحقيقي (src/) إلى ESM مؤقت لتختبره node:test مباشرة.
 * بخلاف test-harness.js القديم (محاكاة منفصلة)، هذه الاختبارات تشغّل نفس الكود المشحون للزبون.
 */
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * @param {string} entry مسار الملف نسبةً لجذر المشروع
 * @param {Record<string,string>} overrides استبدال وحدات باسمها (مثلاً المفتاح العام بمفتاح اختبار)
 */
export async function importSrc(entry, overrides = {}) {
  const outDir = mkdtempSync(path.join(tmpdir(), 'madrasa-test-'));
  const outfile = path.join(outDir, 'bundle.mjs');
  await build({
    entryPoints: [path.join(ROOT, entry)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    logLevel: 'silent',
    plugins: [{
      name: 'overrides',
      setup(b) {
        for (const [name, contents] of Object.entries(overrides)) {
          const filter = new RegExp(`(^|/)${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
          b.onResolve({ filter }, args => ({ path: args.path, namespace: 'override' }));
          b.onLoad({ filter: /.*/, namespace: 'override' }, args => {
            const key = Object.keys(overrides).find(k => args.path.endsWith(k));
            return { contents: overrides[key], loader: 'ts' };
          });
        }
      }
    }]
  });
  return import(pathToFileURL(outfile).href);
}

/** localStorage بسيط في الذاكرة لبيئة Node */
export function installLocalStorage() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k),
    clear: () => store.clear(),
    key: i => [...store.keys()][i] ?? null,
    get length() { return store.size; }
  };
  return store;
}

export function writeTemp(name, contents) {
  const dir = mkdtempSync(path.join(tmpdir(), 'madrasa-tmp-'));
  const p = path.join(dir, name);
  writeFileSync(p, contents);
  return p;
}
