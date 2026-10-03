import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Smartphone, RefreshCw, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { getParentSyncConfig, setParentSyncConfig, normalizeRelayUrl } from '../../services/parentSync/schoolSync';
import { LicenseService } from '../../services/licensing/licenseService';
import { sound } from '../../utils/soundEffects';

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString('ar-LY', { dateStyle: 'short', timeStyle: 'short' }) : '—');

/**
 * تطبيق أولياء الأمور على الجوال: تفعيل المزامنة المشفّرة مع خادم المورّد ومتابعة حالتها.
 */
export const ParentAppSyncModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { parentSyncStatus, syncParentAppNow, showToast, students } = useSchool();
  const initial = getParentSyncConfig();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [url, setUrl] = useState(initial.url);
  if (!isOpen) return null;

  const licensed = /^MADRASA-v3-/.test((LicenseService.getActiveLicenseKey() || '').trim());
  const withCards = students.filter(s => s.parentAccessCode).length;
  const s = parentSyncStatus;

  const save = async () => {
    if (enabled && !normalizeRelayUrl(url)) {
      showToast('error', 'عنوان الخادم', 'أدخل العنوان الذي سلّمه لكم المورّد ويبدأ بـ https://');
      return;
    }
    setParentSyncConfig({ enabled, url });
    sound.playSuccess();
    showToast('success', enabled ? 'تم تفعيل تطبيق أولياء الأمور' : 'تم إيقاف المزامنة', enabled ? 'تُرفع بيانات أولياء الأمور الآن مشفّرة.' : 'لن تُرفع أي بيانات جديدة.');
    if (enabled) await syncParentAppNow();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm font-cairo text-right" role="dialog" aria-modal="true" aria-label="تطبيق أولياء الأمور">
      <div className="w-full max-w-lg max-h-[94vh] overflow-y-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-l from-sky-700 to-indigo-800 text-white rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-black text-sm">تطبيق أولياء الأمور على الجوال</h3>
              <p className="text-[11px] text-sky-100">الحضور، الدرجات المنشورة، التنبيهات، الاستدعاءات، ومراسلة المعلمين</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="إغلاق" className="p-2 rounded-xl hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex gap-2.5 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p>
              تُشفَّر بيانات كل طالب على هذا الحاسوب ببطاقة ولي أمره (رقم الدخول + الرمز) قبل رفعها. خادم المورّد يخزن نصاً
              مشفّراً لا يستطيع قراءته، وولي الأمر يفك تشفير بيانات ابنه فقط على هاتفه. تغيير «رمز جديد» لبطاقة يلغي وصول القديمة.
            </p>
          </div>

          {!licensed && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex gap-2 font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>يتطلب مفتاح ترخيص مفعّلاً — غير متاح في التجربة المجانية.</span>
            </div>
          )}

          <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <span className="font-black text-sm">تفعيل المزامنة مع تطبيق الجوال</span>
            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="w-5 h-5 accent-sky-600" aria-label="تفعيل المزامنة" />
          </label>

          <div>
            <label className="block font-bold mb-1" htmlFor="relay-url">عنوان خادم التطبيق (من المورّد)</label>
            <input
              id="relay-url"
              dir="ltr"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://parents.example.ly"
              className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-500 block">بطاقات أولياء الأمور</span>
              <span className="font-black text-base">{withCards} / {students.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-500 block">الحالة</span>
              <span className={`font-black text-base flex items-center gap-1 ${s.state === 'error' ? 'text-rose-600' : s.state === 'ok' ? 'text-emerald-600' : ''}`} data-testid="parent-sync-state">
                {s.state === 'ok' && <CheckCircle2 className="w-4 h-4" />}
                {s.state === 'off' ? 'متوقفة' : s.state === 'syncing' ? 'جارٍ المزامنة…' : s.state === 'ok' ? 'تعمل' : 'خطأ'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-500 block">آخر رفع</span>
              <span className="font-bold">{fmt(s.lastPublishAt)}</span>
              {s.published !== undefined && <span className="block text-[10px] text-slate-500">{s.published} طالب • تغيّر {s.uploaded ?? 0}</span>}
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-500 block">رسائل مستلمة من التطبيق</span>
              <span className="font-bold">{s.appliedMessages ?? 0}</span>
              <span className="block text-[10px] text-slate-500">آخر سحب {fmt(s.lastPullAt)}</span>
            </div>
          </div>

          {s.error && <p className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold" role="alert">{s.error}</p>}

          <p className="text-slate-500 leading-relaxed">
            بعد التفعيل: اطبع «بطاقات دخول أولياء الأمور» من جديد — الباركود يفتح تطبيق الجوال مباشرة.
            أعذار الغياب المرسلة من التطبيق تصل كتنبيه للمراجعة ولا تغيّر سجل الحضور تلقائياً.
          </p>

          <div className="flex gap-2 pt-1">
            <button onClick={save} className="flex-1 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black transition active:scale-95">حفظ</button>
            <button
              onClick={() => { sound.playTap(); void syncParentAppNow(); }}
              disabled={!getParentSyncConfig().enabled || s.state === 'syncing'}
              className="px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${s.state === 'syncing' ? 'animate-spin' : ''}`} />
              <span>مزامنة الآن</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
