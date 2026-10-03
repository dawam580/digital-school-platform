import { ParentKeys, openJson, sealJson } from '../parent-sync/crypto';
import { ParentView, ParentInboxMessage, PARENT_VIEW_VERSION } from '../parent-sync/protocol';

/** التطبيق يُقدَّم من خادم المورّد نفسه — الطلبات نسبية لنفس النطاق */
const BASE = ((import.meta.env.VITE_RELAY_URL as string | undefined) || new URL('.', window.location.href).href).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function call(path: string, init?: RequestInit) {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, cache: 'no-store' });
  } catch {
    throw new ApiError(0, 'لا يوجد اتصال بالإنترنت — تُعرض آخر بيانات محفوظة');
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (json as { error?: string }).error || `خطأ (${res.status})`);
  return json;
}

export async function fetchView(keys: ParentKeys): Promise<{ view: ParentView; updatedAt: string }> {
  const r = (await call(`/v1/view/${keys.lid}`)) as { blob: string; updatedAt: string };
  let view: ParentView;
  try {
    view = await openJson<ParentView>(keys, r.blob);
  } catch {
    throw new ApiError(422, 'تعذر فك بيانات البطاقة');
  }
  if (view.v !== PARENT_VIEW_VERSION) throw new ApiError(426, 'حدّث التطبيق لعرض بيانات المدرسة');
  return { view, updatedAt: r.updatedAt };
}

export async function sendToSchool(keys: ParentKeys, msg: ParentInboxMessage): Promise<void> {
  await call(`/v1/inbox/${keys.lid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blob: await sealJson(keys, msg) }),
  });
}

export const newMessageId = () => {
  const b = new Uint8Array(9);
  crypto.getRandomValues(b);
  return `pm-${Array.from(b, x => x.toString(16).padStart(2, '0')).join('')}`;
};
