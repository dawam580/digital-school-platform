/**
 * تخزين تطبيق ولي الأمر على هاتفه فقط: مفاتيح البطاقات المشتقة (لا يُحفظ الرمز نفسه)،
 * آخر ملخص لكل ابن (للعمل دون إنترنت)، والرسائل التي لم تصل المدرسة بعد.
 */
import type { ParentKeys } from '../parent-sync/crypto';
import type { ParentView, ParentInboxMessage } from '../parent-sync/protocol';

export interface SavedChild extends ParentKeys {
  name: string;
  className: string;
}

export interface CachedView {
  view: ParentView;
  updatedAt: string;
  fetchedAt: string;
}

const K_CHILDREN = 'mp_children_v1';
const K_ACTIVE = 'mp_active_v1';
const kView = (lid: string) => `mp_view_${lid}`;
const kOutbox = (lid: string) => `mp_outbox_${lid}`;
const kSent = (lid: string) => `mp_sent_${lid}`;

const read = <T,>(k: string, fb: T): T => {
  try { const r = localStorage.getItem(k); return r ? (JSON.parse(r) as T) : fb; } catch { return fb; }
};
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const store = {
  children: (): SavedChild[] => read(K_CHILDREN, []),
  saveChild(c: SavedChild) {
    const list = store.children().filter(x => x.lid !== c.lid);
    write(K_CHILDREN, [...list, c]);
  },
  removeChild(lid: string) {
    write(K_CHILDREN, store.children().filter(x => x.lid !== lid));
    try { localStorage.removeItem(kView(lid)); localStorage.removeItem(kOutbox(lid)); localStorage.removeItem(kSent(lid)); } catch {}
  },
  activeLid: (): string | null => read<string | null>(K_ACTIVE, null),
  setActive: (lid: string) => write(K_ACTIVE, lid),
  view: (lid: string): CachedView | null => read(kView(lid), null),
  saveView: (lid: string, v: CachedView) => write(kView(lid), v),
  outbox: (lid: string): ParentInboxMessage[] => read(kOutbox(lid), []),
  saveOutbox: (lid: string, items: ParentInboxMessage[]) => {
    write(kOutbox(lid), items);
    const sent: Record<string, number> = read(kSent(lid), {});
    const keep = new Set(items.map(i => i.id));
    write(kSent(lid), Object.fromEntries(Object.entries(sent).filter(([id]) => keep.has(id))));
  },
  /** آخر وقت إرسال للرسالة (للإعادة إن لم يصل إيصال المدرسة) */
  lastSent: (lid: string, id: string, fallbackIso: string): number => read<Record<string, number>>(kSent(lid), {})[id] || Date.parse(fallbackIso) || 0,
  markSent(lid: string, id: string) {
    const sent: Record<string, number> = read(kSent(lid), {});
    sent[id] = Date.now();
    write(kSent(lid), sent);
  },
  clearAll() {
    for (const c of store.children()) store.removeChild(c.lid);
    try { localStorage.removeItem(K_CHILDREN); localStorage.removeItem(K_ACTIVE); } catch {}
  },
};
