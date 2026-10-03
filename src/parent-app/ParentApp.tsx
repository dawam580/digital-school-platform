import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Home, CalendarCheck, Award, MessageCircle, Bell, Plus, LogOut, RefreshCw, ChevronDown, Send, ArrowRight,
  ShieldCheck, Clock, CheckCircle2, AlertTriangle, FileText, Phone, X,
} from 'lucide-react';
import { deriveParentKeys, normalizeAccessCode, normalizeLoginId } from '../parent-sync/crypto';
import type { ParentView, ParentInboxMessage } from '../parent-sync/protocol';
import { OfficialResultCard } from '../components/parent/OfficialResultCard';
import { store, SavedChild, CachedView } from './store';
import { fetchView, sendToSchool, newMessageId, ApiError } from './api';

type Tab = 'home' | 'attendance' | 'grades' | 'messages' | 'notices';

const STATUS_AR: Record<string, { label: string; cls: string }> = {
  present: { label: 'حاضر', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  late: { label: 'متأخر', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  excused: { label: 'غياب بعذر', cls: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  unexcused: { label: 'غائب', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
};

const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtDate = (iso: string) => {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('ar-LY', { weekday: 'long', day: 'numeric', month: 'long' });
};
const fmtStamp = (iso?: string) => (iso ? new Date(iso).toLocaleString('ar-LY', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const isWeekend = (d = new Date()) => d.getDay() === 5 || d.getDay() === 6;

const card = 'rounded-2xl bg-[#14213d]/80 border border-white/10';

// ───────────────────────────── تسجيل البطاقة ─────────────────────────────
const AddChild: React.FC<{ onAdded: (c: SavedChild) => void; onCancel?: () => void; prefill?: { id: string; code: string } }> = ({ onAdded, onCancel, prefill }) => {
  const [id, setId] = useState(prefill?.id || '');
  const [code, setCode] = useState(prefill?.code || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fails = useRef(0);
  const lockedUntil = useRef(0);
  const auto = useRef(!!prefill);

  const submit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (Date.now() < lockedUntil.current) {
      setError(`محاولات كثيرة — انتظر ${Math.ceil((lockedUntil.current - Date.now()) / 1000)} ثانية`);
      return;
    }
    const cleanId = normalizeLoginId(id);
    const cleanCode = normalizeAccessCode(code);
    if (!cleanId || cleanCode.length < 6) {
      setError('اكتب رقم الدخول ورمز ولي الأمر (6 أرقام) كما في البطاقة');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const keys = await deriveParentKeys(cleanId, cleanCode);
      const { view, updatedAt } = await fetchView(keys);
      const child: SavedChild = { ...keys, name: view.student.name, className: view.student.className };
      store.saveChild(child);
      store.saveView(keys.lid, { view, updatedAt, fetchedAt: new Date().toISOString() });
      onAdded(child);
    } catch (err) {
      fails.current += 1;
      if (fails.current >= 5) { lockedUntil.current = Date.now() + 60_000; fails.current = 0; }
      setError(err instanceof ApiError && err.status === 404
        ? 'البطاقة غير معروفة: تأكد من الرقم والرمز، أو أن المدرسة فعّلت تطبيق الجوال.'
        : err instanceof Error ? err.message : 'تعذر التحقق');
    } finally {
      setBusy(false);
    }
  }, [id, code, onAdded]);

  useEffect(() => {
    if (auto.current) { auto.current = false; void submit(); }
  }, [submit]);

  return (
    <div className="min-h-full flex flex-col justify-center p-5 space-y-5">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-white">تطبيق ولي الأمر</h1>
        <p className="text-xs text-slate-400 leading-relaxed">أدخل البيانات المطبوعة على بطاقة ولي الأمر التي سلّمتها لك المدرسة، أو امسح باركود البطاقة بكاميرا الهاتف.</p>
      </div>
      <form onSubmit={submit} className={`${card} p-4 space-y-3`}>
        <label className="block text-xs font-bold text-slate-300">
          رقم الدخول (الرقم الوطني للطالب أو رقم القيد)
          <input
            value={id}
            onChange={e => setId(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            dir="ltr"
            className="mt-1 w-full px-3 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white font-mono text-base text-center focus:border-amber-400 outline-none"
            placeholder="120150000000"
            aria-label="رقم الدخول"
          />
        </label>
        <label className="block text-xs font-bold text-slate-300">
          رمز ولي الأمر (6 أرقام)
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            inputMode="numeric"
            type="password"
            autoComplete="off"
            dir="ltr"
            maxLength={8}
            className="mt-1 w-full px-3 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white font-mono text-lg tracking-[0.4em] text-center focus:border-amber-400 outline-none"
            placeholder="••••••"
            aria-label="رمز ولي الأمر"
          />
        </label>
        {error && <p className="text-xs font-bold text-rose-300" role="alert">{error}</p>}
        <button disabled={busy} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black disabled:opacity-60 flex items-center justify-center gap-2">
          {busy && <RefreshCw className="w-4 h-4 animate-spin" />}
          <span>{busy ? 'جارٍ التحقق…' : 'دخول'}</span>
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="w-full py-2 text-xs font-bold text-slate-400">رجوع</button>
        )}
      </form>
      <p className="text-[11px] text-slate-500 text-center leading-relaxed">
        بيانات ابنك مشفّرة ولا تُفتح إلا بهذه البطاقة. لا يُحفظ الرمز على الهاتف، ويمكنك الخروج في أي وقت.
      </p>
    </div>
  );
};

function takeCardFromHash(): { id: string; code: string } | null {
  const h = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const id = h.get('id');
  const code = h.get('code');
  if (!id || !code) return null;
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  return { id, code };
}

// ───────────────────────────── التطبيق ─────────────────────────────
export const ParentApp: React.FC = () => {
  const [children, setChildren] = useState<SavedChild[]>(() => store.children());
  const [activeLid, setActiveLid] = useState<string | null>(() => store.activeLid() || store.children()[0]?.lid || null);
  const [cached, setCached] = useState<CachedView | null>(() => (activeLid ? store.view(activeLid) : null));
  const [outbox, setOutbox] = useState<ParentInboxMessage[]>(() => (activeLid ? store.outbox(activeLid) : []));
  const [initialCard] = useState(takeCardFromHash);
  const [adding, setAdding] = useState(!!initialCard);
  const [prefill, setPrefill] = useState<{ id: string; code: string } | undefined>(initialCard || undefined);
  const [tab, setTab] = useState<Tab>('home');
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState('');
  const [picker, setPicker] = useState(false);
  const [thread, setThread] = useState<string | null>(null);
  const [excuseOpen, setExcuseOpen] = useState(false);

  const active = children.find(c => c.lid === activeLid) || null;
  const view = cached?.view || null;

  // باركود البطاقة يفتح ‎#id=...&code=...‎ — يُقرأ ثم يُمسح من شريط العنوان فوراً
  useEffect(() => {
    const onHash = () => {
      const card = takeCardFromHash();
      if (card) { setPrefill(card); setAdding(true); }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const refresh = useCallback(async () => {
    if (!active) return;
    setRefreshing(true);
    try {
      const { view: v, updatedAt } = await fetchView(active);
      const next = { view: v, updatedAt, fetchedAt: new Date().toISOString() };
      store.saveView(active.lid, next);
      setCached(next);
      // الرسائل التي ظهرت في سجل المدرسة وصلت — تُحذف من قائمة الانتظار
      const delivered = new Set(v.threads.flatMap(t => t.messages.map(m => m.id)));
      const confirmed = new Set(v.summons.filter(s => s.parentConfirmedAt).map(s => s.id));
      const remaining = store.outbox(active.lid).filter(m =>
        m.type === 'chat' ? !delivered.has(m.id) : m.type === 'summons-confirm' ? !confirmed.has(m.summonsId) : Date.now() - Date.parse(m.sentAt) < 7 * 864e5);
      store.saveOutbox(active.lid, remaining);
      setOutbox(remaining);
      if (v.student.name !== active.name || v.student.className !== active.className) {
        store.saveChild({ ...active, name: v.student.name, className: v.student.className });
        setChildren(store.children());
      }
      setNotice('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setNotice('هذه البطاقة لم تعد صالحة (ربما أصدرت المدرسة رمزاً جديداً). أضف البطاقة الجديدة.');
      else setNotice(err instanceof Error ? err.message : 'تعذر التحديث');
    } finally {
      setRefreshing(false);
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;
    setCached(store.view(active.lid));
    setOutbox(store.outbox(active.lid));
    void refresh();
    const t = setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 60_000);
    const onVis = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.lid]);

  const selectChild = (lid: string) => {
    store.setActive(lid);
    setActiveLid(lid);
    setPicker(false);
    setThread(null);
    setTab('home');
  };

  const send = async (msg: ParentInboxMessage) => {
    if (!active) return false;
    try {
      await sendToSchool(active, msg);
      const next = [...store.outbox(active.lid), msg];
      store.saveOutbox(active.lid, next);
      setOutbox(next);
      return true;
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'تعذر الإرسال');
      return false;
    }
  };

  const logout = () => {
    if (!active) return;
    if (!window.confirm(`إزالة بطاقة ${active.name} من هذا الهاتف؟`)) return;
    store.removeChild(active.lid);
    const rest = store.children();
    setChildren(rest);
    setActiveLid(rest[0]?.lid || null);
    if (rest[0]) store.setActive(rest[0].lid);
    setCached(rest[0] ? store.view(rest[0].lid) : null);
  };

  if (!active || adding) {
    return (
      <Shell>
        <AddChild
          key={prefill ? `${prefill.id}|${prefill.code}` : 'manual'}
          prefill={prefill}
          onCancel={active ? () => { setAdding(false); setPrefill(undefined); } : undefined}
          onAdded={c => {
            setChildren(store.children());
            setAdding(false);
            setPrefill(undefined);
            selectChild(c.lid);
            setCached(store.view(c.lid));
          }}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      {/* الرأس */}
      <header className="sticky top-0 z-20 px-4 pt-4 pb-3 bg-[#0b1324]/95 backdrop-blur border-b border-white/10 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="relative min-w-0">
            <button onClick={() => setPicker(p => !p)} className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 border border-white/10 min-w-0" aria-label="اختيار الابن">
              <div className="w-8 h-8 shrink-0 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center">{active.name.charAt(0)}</div>
              <div className="text-right min-w-0">
                <span className="block text-xs font-black text-white truncate max-w-[150px]">{active.name.split(' ').slice(0, 2).join(' ')}</span>
                <span className="block text-[10px] text-amber-300">{active.className}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {picker && (
              <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-2 z-30">
                {children.map(c => (
                  <button key={c.lid} onClick={() => selectChild(c.lid)} className={`w-full text-right px-3 py-2 rounded-xl text-xs ${c.lid === active.lid ? 'bg-amber-500/20 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                    <span className="font-bold block">{c.name}</span>
                    <span className="text-[10px] text-slate-400">{c.className}</span>
                  </button>
                ))}
                <button onClick={() => { setPicker(false); setAdding(true); }} className="w-full mt-1 pt-2 border-t border-white/10 text-xs font-bold text-sky-300 flex items-center justify-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> إضافة ابن آخر ببطاقته
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => void refresh()} aria-label="تحديث" className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-slate-200">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-300' : ''}`} />
            </button>
            <button onClick={logout} aria-label="تسجيل الخروج" title="إزالة البطاقة من الهاتف" className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-rose-300">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="truncate">{view?.school.name}</span>
          <span className="shrink-0">آخر تحديث من المدرسة: {fmtStamp(cached?.updatedAt)}</span>
        </div>
        {notice && <p className="text-[11px] font-bold text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2" role="status">{notice}</p>}
      </header>

      <main className="flex-1 p-4 pb-28 space-y-4">
        {!view ? (
          <p className="text-center text-sm text-slate-400 pt-10">جارٍ تحميل بيانات الطالب…</p>
        ) : tab === 'home' ? (
          <HomeTab view={view} outbox={outbox} onSend={send} onExcuse={() => setExcuseOpen(true)} goto={setTab} />
        ) : tab === 'attendance' ? (
          <AttendanceTab view={view} onExcuse={() => setExcuseOpen(true)} />
        ) : tab === 'grades' ? (
          <GradesTab view={view} />
        ) : tab === 'messages' ? (
          <MessagesTab view={view} outbox={outbox} thread={thread} setThread={setThread} onSend={send} />
        ) : (
          <NoticesTab view={view} />
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-20 bg-[#0b1324]/95 backdrop-blur border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto grid grid-cols-5">
          {([
            ['home', 'الرئيسية', Home],
            ['attendance', 'الحضور', CalendarCheck],
            ['grades', 'الدرجات', Award],
            ['messages', 'الرسائل', MessageCircle],
            ['notices', 'التنبيهات', Bell],
          ] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => { setTab(id); setThread(null); }} className={`py-2.5 flex flex-col items-center gap-0.5 text-[10px] font-bold ${tab === id ? 'text-amber-300' : 'text-slate-400'}`}>
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {excuseOpen && view && (
        <ExcuseSheet
          onClose={() => setExcuseOpen(false)}
          onSubmit={async (date, reason) => {
            const ok = await send({ id: newMessageId(), type: 'excuse', studentId: view.student.id, date, reason, sentAt: new Date().toISOString() });
            if (ok) { setExcuseOpen(false); setNotice('أُرسل العذر للمدرسة للمراجعة ✓'); }
          }}
        />
      )}
    </Shell>
  );
};

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div dir="rtl" className="min-h-screen bg-[#0b1324] text-white font-cairo flex flex-col max-w-md mx-auto">{children}</div>
);

// ───────────────────────────── الرئيسية ─────────────────────────────
const HomeTab: React.FC<{ view: ParentView; outbox: ParentInboxMessage[]; onSend: (m: ParentInboxMessage) => Promise<boolean>; onExcuse: () => void; goto: (t: Tab) => void }> = ({ view, outbox, onSend, onExcuse, goto }) => {
  const today = view.attendance.find(a => a.date === localDate());
  const stats = useMemo(() => attendanceStats(view), [view]);
  const pendingSummons = view.summons.filter(s => s.status === 'sent');
  const pendingConfirm = new Set(outbox.filter(m => m.type === 'summons-confirm').map(m => (m as { summonsId: string }).summonsId));
  const status = today ? STATUS_AR[today.status] : null;

  return (
    <>
      <section className={`${card} p-4 flex items-center justify-between`}>
        <div>
          <span className="text-[11px] text-slate-400 block">حالة الحضور اليوم</span>
          <span className="text-sm font-black text-white">
            {status ? status.label : isWeekend() ? 'عطلة نهاية الأسبوع' : 'لم يُرصد الحضور بعد'}
          </span>
          {today?.note && <span className="block text-[11px] text-slate-400 mt-0.5">{today.note}</span>}
        </div>
        {status ? <span className={`px-3 py-1 rounded-full border text-xs font-black ${status.cls}`}>{status.label}</span> : <Clock className="w-6 h-6 text-slate-500" />}
      </section>

      {pendingSummons.map(s => (
        <section key={s.id} className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 space-y-2">
          <div className="flex items-center gap-2 text-rose-200 font-black text-sm"><AlertTriangle className="w-4 h-4" /> استدعاء ولي الأمر</div>
          <p className="text-xs text-rose-100 leading-relaxed">{s.reason}</p>
          <p className="text-xs font-bold text-white">الموعد: {fmtDate(s.requestedDate)} — {s.requestedTime}</p>
          {s.parentConfirmedAt ? (
            <p className="text-xs font-bold text-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> أكدتم الحضور</p>
          ) : pendingConfirm.has(s.id) ? (
            <p className="text-xs font-bold text-amber-200">⏳ أُرسل التأكيد — يظهر بعد وصوله للمدرسة</p>
          ) : (
            <button
              onClick={() => void onSend({ id: newMessageId(), type: 'summons-confirm', studentId: view.student.id, summonsId: s.id, sentAt: new Date().toISOString() })}
              className="w-full py-2.5 rounded-xl bg-rose-500 text-white text-xs font-black"
            >
              تأكيد استلام الاستدعاء والحضور
            </button>
          )}
        </section>
      ))}

      <section className="grid grid-cols-2 gap-2.5">
        <button onClick={() => goto('attendance')} className={`${card} p-3.5 text-right`}>
          <span className="text-[11px] text-slate-400 block">نسبة الحضور</span>
          <span className="text-lg font-black text-white">{stats.total ? `${stats.rate}%` : '—'}</span>
          <span className="block text-[10px] text-slate-400">{stats.total ? `${stats.absent} غياب • ${stats.late} تأخير` : 'لا سجل بعد'}</span>
        </button>
        <button onClick={() => goto('grades')} className={`${card} p-3.5 text-right`}>
          <span className="text-[11px] text-slate-400 block">النتيجة</span>
          <span className="text-lg font-black text-white">{view.official && view.official.status !== 'pending' ? `${view.official.percentage}%` : '—'}</span>
          <span className="block text-[10px] text-slate-400">{view.grades.held ? 'قيد اعتماد الكنترول' : view.official ? view.official.generalAppreciation : 'لم تُنشر بعد'}</span>
        </button>
        <button onClick={onExcuse} className={`${card} p-3.5 text-right`}>
          <FileText className="w-5 h-5 text-sky-300" />
          <span className="text-xs font-black text-white block mt-1">تقديم عذر غياب</span>
        </button>
        <button onClick={() => goto('messages')} className={`${card} p-3.5 text-right`}>
          <MessageCircle className="w-5 h-5 text-emerald-300" />
          <span className="text-xs font-black text-white block mt-1">مراسلة المعلمين</span>
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-black text-slate-400 px-1">آخر التنبيهات</h2>
        {view.notifications.slice(0, 3).map(n => <NoticeItem key={n.id} n={n} />)}
        {view.notifications.length === 0 && <p className={`${card} p-4 text-xs text-slate-400 text-center`}>لا تنبيهات بعد</p>}
      </section>

      {view.school.phone && (
        <a href={`tel:${view.school.phone}`} className={`${card} p-3.5 flex items-center justify-between text-xs`}>
          <span className="flex items-center gap-2 text-slate-300"><Phone className="w-4 h-4 text-emerald-300" /> هاتف إدارة المدرسة</span>
          <span className="font-mono font-black text-amber-300" dir="ltr">{view.school.phone}</span>
        </a>
      )}
    </>
  );
};

function attendanceStats(view: ParentView) {
  const a = view.attendance;
  const present = a.filter(r => r.status === 'present').length;
  const late = a.filter(r => r.status === 'late').length;
  const excused = a.filter(r => r.status === 'excused').length;
  const absent = a.filter(r => r.status === 'unexcused').length;
  const total = a.length;
  return { present, late, excused, absent, total, rate: total ? Math.round(((present + late + excused) / total) * 100) : 0 };
}

// ───────────────────────────── الحضور ─────────────────────────────
const AttendanceTab: React.FC<{ view: ParentView; onExcuse: () => void }> = ({ view, onExcuse }) => {
  const s = attendanceStats(view);
  return (
    <>
      <section className="grid grid-cols-4 gap-2 text-center">
        {[['حضور', s.present, 'text-emerald-300'], ['تأخير', s.late, 'text-amber-300'], ['بعذر', s.excused, 'text-sky-300'], ['غياب', s.absent, 'text-rose-300']].map(([l, v, c]) => (
          <div key={l as string} className={`${card} py-3`}>
            <span className={`block text-lg font-black ${c}`}>{v as number}</span>
            <span className="text-[10px] text-slate-400">{l}</span>
          </div>
        ))}
      </section>
      <button onClick={onExcuse} className="w-full py-3 rounded-xl bg-sky-600 text-white text-xs font-black">تقديم عذر غياب للمدرسة</button>
      <section className="space-y-1.5">
        {view.attendance.slice(0, 60).map(r => (
          <div key={r.date} className={`${card} px-3.5 py-2.5 flex items-center justify-between`}>
            <div>
              <span className="text-xs font-bold text-white">{fmtDate(r.date)}</span>
              {r.note && <span className="block text-[10px] text-slate-400">{r.note}</span>}
            </div>
            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-black ${STATUS_AR[r.status]?.cls || ''}`}>{STATUS_AR[r.status]?.label || r.status}</span>
          </div>
        ))}
        {view.attendance.length === 0 && <p className={`${card} p-6 text-center text-xs text-slate-400`}>لم يُرصد أي حضور بعد</p>}
      </section>
    </>
  );
};

// ───────────────────────────── الدرجات ─────────────────────────────
const GradesTab: React.FC<{ view: ParentView }> = ({ view }) => {
  if (view.grades.held) {
    return (
      <section className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-center space-y-2">
        <ShieldCheck className="w-8 h-8 mx-auto text-amber-300" />
        <h2 className="font-black">الدرجات قيد المراجعة والاعتماد</h2>
        <p className="text-xs text-amber-100/80">يراجع رئيس الكنترول درجات الفصل. تظهر النتيجة هنا فور نشرها رسمياً.</p>
      </section>
    );
  }
  return (
    <>
      {view.official && <OfficialResultCard report={view.official} dark />}
      <section className="space-y-2">
        <h2 className="text-xs font-black text-slate-400 px-1">رصد المعلمين خلال العام (متابعة مستمرة)</h2>
        {view.grades.items.map((g, i) => {
          const pct = g.maxTotal ? Math.round((g.total / g.maxTotal) * 100) : 0;
          return (
            <div key={i} className={`${card} p-3.5 space-y-2`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black block">{g.subjectName}</span>
                  <span className="text-[10px] text-slate-400">{g.teacherName}</span>
                </div>
                <span className="text-xs font-mono font-black">{g.total} / {g.maxTotal}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className={`h-full rounded-full ${pct >= 85 ? 'bg-emerald-400' : pct >= 65 ? 'bg-sky-400' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        {view.grades.items.length === 0 && !view.official && <p className={`${card} p-6 text-center text-xs text-slate-400`}>لم تُرصد درجات بعد</p>}
      </section>
    </>
  );
};

// ───────────────────────────── الرسائل ─────────────────────────────
const MessagesTab: React.FC<{
  view: ParentView;
  outbox: ParentInboxMessage[];
  thread: string | null;
  setThread: (t: string | null) => void;
  onSend: (m: ParentInboxMessage) => Promise<boolean>;
}> = ({ view, outbox, thread, setThread, onSend }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const contact = view.contacts.find(c => c.teacherId === thread);
  const delivered = view.threads.find(t => t.teacherId === thread)?.messages || [];
  const pending = outbox.filter((m): m is Extract<ParentInboxMessage, { type: 'chat' }> => m.type === 'chat' && m.teacherId === thread);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [thread, delivered.length, pending.length]);

  if (!contact) {
    return (
      <section className="space-y-2">
        <h2 className="text-xs font-black text-slate-400 px-1">معلمو فصل {view.student.className}</h2>
        {view.contacts.map(c => {
          const last = view.threads.find(t => t.teacherId === c.teacherId)?.messages.slice(-1)[0];
          return (
            <button key={c.teacherId} onClick={() => setThread(c.teacherId)} className={`${card} w-full p-3.5 text-right flex items-center gap-3`}>
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black ${c.isCounselor ? 'bg-purple-500/30 text-purple-200' : 'bg-emerald-500/20 text-emerald-200'}`}>{c.name.replace(/^أ\.\s*/, '').charAt(0)}</div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-black">{c.name}</span>
                <span className="block text-[10px] text-slate-400 truncate">{last ? last.text : c.subject}</span>
              </div>
            </button>
          );
        })}
        {view.contacts.length === 0 && <p className={`${card} p-6 text-center text-xs text-slate-400`}>لم تُسند معلمون لهذا الفصل بعد</p>}
      </section>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    const ok = await onSend({ id: newMessageId(), type: 'chat', studentId: view.student.id, teacherId: contact.teacherId, text: t.slice(0, 1000), sentAt: new Date().toISOString() });
    setSending(false);
    if (ok) setText('');
  };

  return (
    <section className="flex flex-col gap-3">
      <button onClick={() => setThread(null)} className="flex items-center gap-1.5 text-xs font-bold text-slate-300"><ArrowRight className="w-4 h-4" /> {contact.name} • {contact.subject}</button>
      <div className="space-y-2 min-h-[40vh]">
        {delivered.map(m => (
          <div key={m.id} className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm ${m.fromParent ? 'mr-auto bg-amber-500 text-slate-950 rounded-bl-md' : 'ml-auto bg-white/10 text-white rounded-br-md'}`}>
            <p className="whitespace-pre-wrap break-words">{m.text}</p>
            <span className={`block text-[10px] mt-0.5 ${m.fromParent ? 'text-slate-800' : 'text-slate-400'}`}>{m.timestamp}</span>
          </div>
        ))}
        {pending.map(m => (
          <div key={m.id} className="max-w-[85%] mr-auto px-3.5 py-2 rounded-2xl rounded-bl-md bg-amber-500/60 text-slate-950 text-sm">
            <p className="whitespace-pre-wrap break-words">{m.text}</p>
            <span className="block text-[10px] mt-0.5">⏳ بانتظار وصولها لحاسوب المدرسة</span>
          </div>
        ))}
        {delivered.length === 0 && pending.length === 0 && <p className="text-center text-xs text-slate-500 pt-8">ابدأ المحادثة — الرسالة خاصة بينك وبين {contact.name}</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="sticky bottom-20 flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} maxLength={1000} placeholder="اكتب رسالتك…" aria-label="نص الرسالة" className="flex-1 px-3.5 py-3 rounded-xl bg-slate-900 border border-white/15 text-sm outline-none focus:border-amber-400" />
        <button disabled={!text.trim() || sending} aria-label="إرسال" className="px-4 rounded-xl bg-amber-500 text-slate-950 disabled:opacity-50"><Send className="w-4 h-4" /></button>
      </form>
    </section>
  );
};

// ───────────────────────────── التنبيهات ─────────────────────────────
const NoticeItem: React.FC<{ n: ParentView['notifications'][number] }> = ({ n }) => (
  <div className={`${card} p-3.5 space-y-1`}>
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-black">{n.title}</span>
      <span className="text-[10px] text-slate-500 shrink-0">{n.date} {n.time}</span>
    </div>
    {n.message && <p className="text-[11px] text-slate-300 leading-relaxed">{n.message}</p>}
  </div>
);

const NoticesTab: React.FC<{ view: ParentView }> = ({ view }) => (
  <section className="space-y-2">
    {view.notifications.map(n => <NoticeItem key={n.id} n={n} />)}
    {view.notifications.length === 0 && <p className={`${card} p-6 text-center text-xs text-slate-400`}>لا تنبيهات</p>}
  </section>
);

// ───────────────────────────── العذر ─────────────────────────────
const ExcuseSheet: React.FC<{ onClose: () => void; onSubmit: (date: string, reason: string) => Promise<void> }> = ({ onClose, onSubmit }) => {
  const [date, setDate] = useState(localDate());
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-end justify-center" role="dialog" aria-modal="true" aria-label="تقديم عذر غياب">
      <form
        onSubmit={async e => { e.preventDefault(); if (!reason.trim()) return; setBusy(true); await onSubmit(date, reason.trim()); setBusy(false); }}
        className="w-full max-w-md bg-slate-900 rounded-t-3xl p-5 space-y-3 border-t border-white/10"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-black">تقديم عذر غياب</h2>
          <button type="button" onClick={onClose} aria-label="إغلاق"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <label className="block text-xs font-bold text-slate-300">التاريخ
          <input type="date" value={date} max={localDate()} onChange={e => setDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white" />
        </label>
        <label className="block text-xs font-bold text-slate-300">السبب
          <textarea value={reason} onChange={e => setReason(e.target.value)} maxLength={500} rows={3} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm" placeholder="مثال: مراجعة طبية — مرفق تقرير يُسلّم للإدارة" aria-label="سبب الغياب" />
        </label>
        <p className="text-[11px] text-slate-400">يصل العذر لإدارة المدرسة للمراجعة، ولا يغيّر سجل الحضور إلا بعد اعتمادها.</p>
        <button disabled={busy || !reason.trim()} className="w-full py-3 rounded-xl bg-sky-600 text-white font-black disabled:opacity-50">{busy ? 'جارٍ الإرسال…' : 'إرسال العذر'}</button>
      </form>
    </div>
  );
};
