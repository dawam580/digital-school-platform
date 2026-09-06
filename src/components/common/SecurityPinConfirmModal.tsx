import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, KeyRound, Check, X, AlertTriangle, Lock } from 'lucide-react';
import { SecurityEngine } from '../../services/security/securityEngine';
import { sound } from '../../utils/soundEffects';

interface SecurityPinConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  description: string;
  actionBadge?: string;
  isDestructive?: boolean;
}

export const SecurityPinConfirmModal: React.FC<SecurityPinConfirmModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
  actionBadge = 'عملية حرجة',
  isDestructive = false
}) => {
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [shake, setShake] = useState(false);
  const [lockoutSecs, setLockoutSecs] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check lockout on mount and interval
  useEffect(() => {
    if (!isOpen) {
      setPinDigits(['', '', '', '']);
      setErrorMessage('');
      return;
    }

    const checkLockout = () => {
      const st = SecurityEngine.isPinLockedOut();
      if (st.isLocked) {
        setLockoutSecs(st.remainingSeconds);
      } else {
        setLockoutSecs(0);
      }
    };

    checkLockout();
    const timer = setInterval(checkLockout, 1000);

    // Auto-focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    if (lockoutSecs > 0) return;
    const clean = value.replace(/\D/g, '').slice(-1); // Only 1 digit
    const updated = [...pinDigits];
    updated[index] = clean;
    setPinDigits(updated);
    setErrorMessage('');

    if (clean && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // If 4 digits entered, verify automatically
    if (clean && index === 3 && updated.every(d => d !== '')) {
      verifyPin(updated.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      verifyPin(pinDigits.join(''));
    }
  };

  const verifyPin = (fullPin: string) => {
    if (fullPin.length < 4) {
      setErrorMessage('يرجى إدخال رمز الأمان المكون من 4 أرقام');
      return;
    }

    const res = SecurityEngine.verifyDirectorPin(fullPin);
    if (res.valid) {
      sound.playSuccess();
      onSuccess();
      onClose();
    } else {
      sound.playAlert();
      setErrorMessage(res.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPinDigits(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in font-cairo text-right">
      <div
        className={`relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border ${
          isDestructive ? 'border-rose-500/50' : 'border-amber-500/50'
        } ${shake ? 'animate-bounce' : ''}`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Badge */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
              isDestructive
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                : 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
            }`}
          >
            {isDestructive ? <AlertTriangle className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            <span>{actionBadge}</span>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs">
            {description}
          </p>
        </div>

        {/* Warning Note */}
        <div className="mt-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            يتطلب هذا الإجراء تأكيداً برمز الأمان الإداري لمدير المدرسة لمنع أي تعديل أو مسح غير مصرح به (الرمز الافتراضي: <strong className="font-mono">2026</strong>).
          </p>
        </div>

        {/* 4-digit PIN Inputs */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-center gap-3 dir-ltr">
            {[0, 1, 2, 3].map((idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="password"
                inputMode="numeric"
                maxLength={1}
                disabled={lockoutSecs > 0}
                value={pinDigits[idx]}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center font-mono text-2xl font-black rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-amber-500/20 outline-none transition disabled:opacity-50"
              />
            ))}
          </div>

          {/* Error / Lockout Messages */}
          {lockoutSecs > 0 ? (
            <div className="text-center text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl">
              ⏳ تم قفل المحاولات مؤقتاً. يرجى الانتظار ({lockoutSecs}) ثانية.
            </div>
          ) : errorMessage ? (
            <div className="text-center text-xs font-bold text-rose-600 dark:text-rose-400">
              {errorMessage}
            </div>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          >
            إلغاء
          </button>

          <button
            type="button"
            disabled={lockoutSecs > 0 || pinDigits.some((d) => d === '')}
            onClick={() => verifyPin(pinDigits.join(''))}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm text-white shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>تأكيد الإجراء</span>
          </button>
        </div>
      </div>
    </div>
  );
};
