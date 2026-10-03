import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { X, Printer, RefreshCw, KeyRound, Search, MessageCircle } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { db, generateParentAccessCode } from '../../services/db';
import { getBaseUrl } from '../../utils/inviteMessageHelper';
import { normalizeLibyanPhone, LIBYAN_PHONE_RE } from '../../services/security/authEngine';
import { Student } from '../../types';
import { sound } from '../../utils/soundEffects';

interface ParentAccessCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** معرّف الطالب الذي يكتبه ولي الأمر: الرقم الوطني أولاً ثم رقم القيد */
export const parentLoginId = (s: Student) => s.nationalNumber || s.studentNumber || s.nationalId || s.linkCode;

/** رابط الدخول المباشر لولي الأمر (الباركود): يفتح تطبيقه ويُدخله فوراً */
export const parentLoginLink = (s: Student) => {
  const base = getBaseUrl().replace(/\/+$/, '');
  return `${base}?portal=parent&code=${encodeURIComponent(parentLoginId(s))}&pin=${encodeURIComponent(s.parentAccessCode || '')}`;
};

/**
 * بطاقات دخول أولياء الأمور — تُطبع لكل فصل وتُسلّم لولي الأمر يداً بيد.
 * تحمل: الرقم الذي يكتبه ولي الأمر + رمز الدخول (6 أرقام) + باركود دخول مباشر.
 * الباركود يُولَّد محلياً (لا يُرسل أي رمز لخدمة خارجية).
 */
export const ParentAccessCardsModal: React.FC<ParentAccessCardsModalProps> = ({ isOpen, onClose }) => {
  const { students, setStudents, schoolProfile, showToast } = useSchool();

  const classNames = useMemo(
    () => Array.from(new Set(students.map(s => s.className).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ar')),
    [students]
  );
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [query, setQuery] = useState('');
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && !selectedClass && classNames.length) setSelectedClass(classNames[0]);
  }, [isOpen, classNames, selectedClass]);

  const visible = useMemo(() => {
    const q = query.trim();
    return students
      .filter(s => (q ? (s.name.includes(q) || parentLoginId(s)?.includes(q)) : s.className === selectedClass))
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [students, selectedClass, query]);

  // توليد الباركود محلياً للطلاب الظاهرين فقط
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      const next: Record<string, string> = {};
      for (const s of visible) {
        if (!s.parentAccessCode) continue;
        try {
          next[s.id] = await QRCode.toDataURL(parentLoginLink(s), { margin: 1, width: 132, errorCorrectionLevel: 'M' });
        } catch {}
      }
      if (!cancelled) setQrMap(next);
    })();
    return () => { cancelled = true; };
  }, [isOpen, visible]);

  useEffect(() => {
    const onAfterPrint = () => document.body.classList.remove('printing-portal');
    window.addEventListener('afterprint', onAfterPrint);
    return () => window.removeEventListener('afterprint', onAfterPrint);
  }, []);

  if (!isOpen) return null;

  const regenerate = (student: Student) => {
    if (!window.confirm(`إصدار رمز جديد لولي أمر الطالب (${student.name})؟ سيتوقف الرمز القديم فوراً.`)) return;
    const code = generateParentAccessCode();
    const updated = students.map(s => (s.id === student.id ? { ...s, parentAccessCode: code } : s));
    setStudents(updated);
    db.saveStudents(updated, true);
    sound.playSuccess();
    showToast('success', 'تم إصدار رمز جديد 🔑', `الرمز القديم لولي أمر ${student.name} لم يعد صالحاً.`);
  };

  const whatsappLink = (s: Student) => {
    const phone = normalizeLibyanPhone(s.parentPhone || '');
    const text = `السلام عليكم، ولي أمر الطالب/ة (${s.name}) — ${schoolProfile.name}\n` +
      `لمتابعة الحضور والدرجات والملاحظات افتح الرابط:\n${parentLoginLink(s)}\n` +
      `أو أدخل يدوياً: الرقم ${parentLoginId(s)} — رمز الدخول ${s.parentAccessCode}\n` +
      `يرجى عدم مشاركة الرمز مع أحد.`;
    const target = LIBYAN_PHONE_RE.test(phone) ? `218${phone.slice(1)}` : '';
    return `https://wa.me/${target}?text=${encodeURIComponent(text)}`;
  };

  const handlePrint = () => {
    sound.playTap();
    document.body.classList.add('printing-portal');
    setTimeout(() => window.print(), 50);
  };

  return createPortal(
    <div className="print-portal-root fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md font-cairo text-right overflow-y-auto print:static print:bg-white print:p-0 print:block" dir="rtl">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl max-w-5xl w-full my-auto overflow-hidden print:shadow-none print:rounded-none print:bg-white print:text-slate-900">
        <div className="print:hidden flex flex-col gap-3 px-5 py-4 bg-slate-900 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-300" />
              <div>
                <h3 className="text-sm font-black">بطاقات دخول أولياء الأمور</h3>
                <p className="text-[11px] text-slate-300">سلّم كل بطاقة لولي الأمر يداً بيد أو أرسلها لرقمه عبر واتساب — الرمز سري ولكل طالب رمز مستقل.</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="إغلاق" className="p-2 rounded-xl hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedClass}
              onChange={e => { setSelectedClass(e.target.value); setQuery(''); }}
              aria-label="الفصل"
              className="px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-sm font-bold"
            >
              {classNames.map(c => <option key={c} value={c}>فصل {c}</option>)}
            </select>
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="بحث باسم الطالب أو رقمه (لإعادة طباعة بطاقة واحدة)"
                className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handlePrint}
              disabled={visible.length === 0}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              طباعة ({visible.length}) بطاقة
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3 print:p-2">
          {visible.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-500 py-10">لا يوجد طلاب في هذا الفصل.</p>
          )}
          {visible.map(s => (
            <div key={s.id} className="break-inside-avoid rounded-2xl border-2 border-dashed border-slate-300 p-4 flex gap-3 items-stretch bg-white text-slate-900">
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-500 truncate">{schoolProfile.name}</p>
                <p className="text-sm font-black leading-tight">{s.name}</p>
                <p className="text-[11px] text-slate-600">الفصل: {s.className}</p>
                <div className="text-[11px] space-y-0.5 pt-1">
                  <p>رقم الدخول: <span className="font-mono font-black" dir="ltr">{parentLoginId(s)}</span></p>
                  <p>رمز ولي الأمر: <span className="font-mono font-black text-base tracking-[0.25em] bg-amber-100 px-1.5 rounded" dir="ltr">{s.parentAccessCode || '—'}</span></p>
                </div>
                <p className="text-[9px] text-slate-500 leading-snug pt-1">
                  امسح الباركود بكاميرا الهاتف للدخول المباشر، أو افتح تطبيق ولي الأمر وأدخل الرقم والرمز. لا تشارك الرمز.
                </p>
                <div className="flex gap-1.5 pt-1 print:hidden">
                  <a
                    href={whatsappLink(s)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold"
                  >
                    <MessageCircle className="w-3 h-3" /> واتساب
                  </a>
                  <button
                    type="button"
                    onClick={() => regenerate(s)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold hover:bg-slate-200"
                  >
                    <RefreshCw className="w-3 h-3" /> رمز جديد
                  </button>
                </div>
              </div>
              {qrMap[s.id] ? (
                <img src={qrMap[s.id]} alt="باركود دخول ولي الأمر" className="w-[104px] h-[104px] self-center shrink-0" />
              ) : (
                <div className="w-[104px] h-[104px] self-center shrink-0 rounded-lg bg-slate-100" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ParentAccessCardsModal;
