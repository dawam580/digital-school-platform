import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, KeyRound, Lock, X, Check, AlertTriangle, Building2, Sparkles } from 'lucide-react';
import { SecurityEngine } from '../../services/security/securityEngine';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

interface SuperAdminLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SuperAdminLockModal: React.FC<SuperAdminLockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [shake, setShake] = useState(false);
  const [lockoutSecs, setLockoutSecs] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setPinDigits(['', '', '', '']);
      setErrorMessage('');
      return;
    }

    const checkLockout = () => {
      const st = SecurityEngine.isSuperAdminLockedOut();
      if (st.isLocked) {
        setLockoutSecs(st.remainingSeconds);
      } else {
        setLockoutSecs(0);
      }
    };

    checkLockout();
    const timer = setInterval(checkLockout, 1000);

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const next = [...pinDigits];
    next[index] = char;
    setPinDigits(next);
    setErrorMessage('');

    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // If completed 4 digits, automatically verify
    if (char && index === 3 && next.every(d => d !== '')) {
      verifyPin(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      verifyPin(pinDigits.join(''));
    }
  };

  const verifyPin = (pin: string) => {
    if (pin.length < 4) {
      setErrorMessage('يرجى إدخال الرمز السري المكون من 4 أرقام');
      return;
    }

    const res = SecurityEngine.verifySuperAdminPin(pin);
    if (res.valid) {
      sound.playSuccess();
      triggerConfetti();
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

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md bg-[#0b192c] border border-blue-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100 p-6 ${
          shake ? 'animate-bounce' : ''
        }`}
        dir="rtl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Shield Icon */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/40">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
              <span>منطقة المالك والمطور فقط (سوبر أدمن)</span>
            </div>
            <h3 className="text-xl font-black font-tajawal text-white">
              التحقق من رمز الأمان الرئيسي (Master PIN)
            </h3>
            <p className="text-xs text-slate-300 font-cairo mt-1.5 leading-relaxed">
              هذه البوابة مخصصة حصرياً للمدير العام السوبر (مالك ومطور المنظومة). لا يحق لمدير المدرسة أو المعلمين أو أولياء الأمور الدخول إليها.
            </p>
          </div>
        </div>

        {/* PIN Inputs */}
        <div className="my-6">
          <div className="flex justify-center gap-3" dir="ltr">
            {[0, 1, 2, 3].map(idx => (
              <input
                key={idx}
                ref={el => (inputRefs.current[idx] = el)}
                type="password"
                inputMode="numeric"
                maxLength={1}
                disabled={lockoutSecs > 0}
                value={pinDigits[idx]}
                onChange={e => handleDigitChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className="w-13 h-14 text-center text-2xl font-black rounded-2xl bg-white/5 border-2 border-white/10 focus:border-blue-500 focus:bg-blue-950/40 text-white outline-none transition-all shadow-inner disabled:opacity-50"
              />
            ))}
          </div>

          {/* Hint */}
          <div className="text-center mt-3">
            <span className="text-[11px] text-slate-400">
              🔒 رمز الماستر معروف للمالك فقط — لا تشاركه مع أي شخص
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Lockout Warning */}
          {lockoutSecs > 0 && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold text-center">
              محاولات الدخول مجمدة مؤقتاً: متبقي ({lockoutSecs}) ثانية
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 font-cairo">
          <button
            onClick={() => verifyPin(pinDigits.join(''))}
            disabled={lockoutSecs > 0 || pinDigits.some(d => d === '')}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-4 h-4" />
            <span>تأكيد ودخول السوبر أدمن</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
