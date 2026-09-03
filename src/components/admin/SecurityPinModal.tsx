import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, X, KeyRound, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface SecurityPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const SecurityPinModal: React.FC<SecurityPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'تأكيد الأمان الإداري',
  description = 'هذه المنطقة مخصصة للإدارة والمعلمين فقط لمنع وصول وتعديل الطلاب وأولياء الأمور.'
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default Admin password is 123456 or phone number
    if (pin === '123456' || pin === '0922465676') {
      sound.playSuccess();
      setError(false);
      setPin('');
      onSuccess();
      onClose();
    } else {
      sound.playAlert();
      setError(true);
      setAttempts(prev => prev + 1);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in font-cairo text-right">
      <div className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 transition-transform ${error ? 'animate-bounce' : ''}`}>
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl shrink-0 shadow-sm border border-rose-200 dark:border-rose-900">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                حماية الصلاحيات ومنع التلاعب
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-800/60">
          🔒 {description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              أدخل كلمة مرور الإدارة المعتمدة (الافتراضية: 123456):
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={20}
                autoFocus
                placeholder="••••••"
                value={pin}
                onChange={e => { setPin(e.target.value); setError(false); }}
                className="w-full px-4 py-3.5 pr-11 text-center font-mono text-xl tracking-widest rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all shadow-inner"
                required
              />
              <KeyRound className="w-5 h-5 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-bold mt-2 flex items-center gap-1 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>كلمة المرور غير صحيحة! يرجى إدخال كلمة سر الإدارة لمنع التلاعب.</span>
              </p>
            )}
          </div>

          {/* Quick Demo Hint */}
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>كلمة مرور التجربة: <strong>123456</strong></span>
            {attempts > 0 && <span className="text-rose-500 font-bold">محاولات خاطئة: {attempts}</span>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              إلغاء الأمر
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>التحقق وتأكيد الدخول</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
