import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, KeyRound, X, Check, Eye, EyeOff } from 'lucide-react';
import { SecurityEngine } from '../../services/security/securityEngine';
import { sound } from '../../utils/soundEffects';

interface PinRotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  needsSuper: boolean;
  needsDirector: boolean;
  onSaved: () => void;
}

const PinFields: React.FC<{
  label: string;
  value: string;
  setValue: (v: string) => void;
  confirm: string;
  setConfirm: (v: string) => void;
}> = ({ label, value, setValue, confirm, setConfirm }) => {
  const [show, setShow] = useState(false);
  const num = (v: string) => v.replace(/\D/g, '').slice(0, 8);
  return (
    <div className="space-y-2 p-3.5 rounded-2xl bg-white/5 border border-white/10">
      <p className="text-xs font-black text-white">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            inputMode="numeric"
            value={value}
            onChange={e => setValue(num(e.target.value))}
            placeholder="رمز جديد (4+ أرقام)"
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border-2 border-white/10 focus:border-amber-500 text-white text-sm font-mono font-black text-center outline-none transition-all"
          />
        </div>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            inputMode="numeric"
            value={confirm}
            onChange={e => setConfirm(num(e.target.value))}
            placeholder="تأكيد الرمز"
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border-2 border-white/10 focus:border-amber-500 text-white text-sm font-mono font-black text-center outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export const PinRotationModal: React.FC<PinRotationModalProps> = ({
  isOpen,
  onClose,
  needsSuper,
  needsDirector,
  onSaved,
}) => {
  const [superPin, setSuperPin] = useState('');
  const [superConfirm, setSuperConfirm] = useState('');
  const [dirPin, setDirPin] = useState('');
  const [dirConfirm, setDirConfirm] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    setError('');
    if (needsSuper) {
      if (superPin.length < 4 || superPin !== superConfirm) {
        setError('رمز الماستر: 4 أرقام على الأقل مع تطابق التأكيد.');
        sound.playAlert();
        return;
      }
    }
    if (needsDirector) {
      if (dirPin.length < 4 || dirPin !== dirConfirm) {
        setError('رمز المدير: 4 أرقام على الأقل مع تطابق التأكيد.');
        sound.playAlert();
        return;
      }
    }
    if (needsSuper) SecurityEngine.setSuperAdminPin(superPin);
    if (needsDirector) SecurityEngine.setDirectorPin(dirPin);
    sound.playSuccess();
    setSuperPin(''); setSuperConfirm(''); setDirPin(''); setDirConfirm('');
    onSaved();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0b192c] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100 p-6" dir="rtl">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          title="تذكيري لاحقاً"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-400/40">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">رموزك ما زالت افتراضية ⚠️</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              أي شخص يعرف الرموز الافتراضية يستطيع فتح بواباتك. غيّرها الآن لمرة واحدة — تستغرق 20 ثانية وتحمي مدرستك بالكامل.
            </p>
          </div>
        </div>

        <div className="my-5 space-y-3">
          {needsSuper && (
            <PinFields label="🔑 رمز الماستر الجديد (المدير العام)" value={superPin} setValue={setSuperPin} confirm={superConfirm} setConfirm={setSuperConfirm} />
          )}
          {needsDirector && (
            <PinFields label="🏛️ رمز المدير الجديد (التصفير والاعتماد)" value={dirPin} setValue={setDirPin} confirm={dirConfirm} setConfirm={setDirConfirm} />
          )}
          {error && (
            <p className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">{error}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <KeyRound className="w-4 h-4" />
            <span>حفظ الرموز الجديدة</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            <span>لاحقاً</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
