import React, { useState } from 'react';
import { ShieldCheck, KeyRound, UserCheck, AlertCircle, ChevronLeft, IdCard } from 'lucide-react';
import { Student } from '../../types';
import { sound } from '../../utils/soundEffects';
import logoImg from '../../assets/logo.png';

interface ParentStudentGateProps {
  /** يتحقق من رقم الطالب + رمز دخول ولي الأمر ويربطه بالحساب */
  onLink: (identifier: string, accessCode: string) => boolean;
  /** أبناء ولي الأمر الموثقون سابقاً في هذه الجلسة فقط */
  previouslyLinkedStudents?: Student[];
  onSelectStudent: (student: Student) => void;
  schoolName?: string;
}

const toWesternDigits = (v: string) => v.replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

/**
 * بوابة ربط ولي الأمر بأبنائه.
 * لا بحث بالاسم ولا قائمة طلاب ولا عينات: الاطلاع على ملف طالب يتطلب رقمه + رمز دخول
 * ولي الأمر (6 أرقام عشوائية مطبوعة على بطاقة ولي الأمر من المدرسة).
 */
export const ParentStudentGate: React.FC<ParentStudentGateProps> = ({
  onLink,
  previouslyLinkedStudents = [],
  onSelectStudent,
  schoolName
}) => {
  const [identifier, setIdentifier] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = toWesternDigits(identifier.trim());
    const code = toWesternDigits(accessCode.trim());
    if (!id || code.length < 6) {
      setError('أدخل الرقم الوطني للطالب (أو رقم القيد) ورمز الدخول المكون من 6 أرقام.');
      return;
    }
    setError('');
    if (!onLink(id, code)) {
      setError('البيانات غير متطابقة. تأكد من الرقم ورمز الدخول المطبوعين على بطاقة ولي الأمر.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 font-cairo text-right animate-in fade-in duration-300">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center space-y-3 pb-5 border-b border-white/10">
            <img src={logoImg} alt="" className="h-12 w-auto mx-auto object-contain bg-white rounded-xl px-2 py-1" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>بوابة أولياء الأمور</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black leading-tight">متابعة أبنائي 👨‍👩‍👧</h1>
            {schoolName && <p className="text-xs text-slate-300">{schoolName}</p>}
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 pt-5 space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="pg-id" className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <IdCard className="w-4 h-4 text-blue-300" />
                الرقم الوطني للطالب أو رقم القيد
              </label>
              <input
                id="pg-id"
                type="text"
                inputMode="numeric"
                autoComplete="username"
                value={identifier}
                onChange={e => { setIdentifier(e.target.value); if (error) setError(''); }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-base font-mono text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="مثال: 120140012345"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pg-code" className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <KeyRound className="w-4 h-4 text-amber-300" />
                رمز دخول ولي الأمر (6 أرقام)
              </label>
              <input
                id="pg-code"
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                maxLength={6}
                value={accessCode}
                onChange={e => { setAccessCode(toWesternDigits(e.target.value).replace(/\D/g, '')); if (error) setError(''); }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-500 text-lg font-mono tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="••••••"
                dir="ltr"
              />
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-100 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>دخول ومتابعة ابني</span>
            </button>

            <p className="text-[11px] text-slate-400 leading-relaxed text-center">
              لا تملك الرمز؟ تسلّمه من إدارة المدرسة مع <strong className="text-slate-200">بطاقة ولي الأمر</strong>.
              الإخوة المسجلون بنفس رقم هاتفك يظهرون تلقائياً.
            </p>
          </form>
        </div>

        {previouslyLinkedStudents.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <p className="text-xs font-black text-slate-600 dark:text-slate-300 px-1">أبنائي</p>
            {previouslyLinkedStudents.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => { sound.playTap(); onSelectStudent(s); }}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 transition text-right"
              >
                <div className="flex items-center gap-3">
                  <img src={s.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{s.name}</p>
                    <p className="text-[11px] text-slate-500">{s.className}</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentStudentGate;
