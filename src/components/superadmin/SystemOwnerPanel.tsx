import React, { useState, useMemo } from 'react';
import {
  Crown, KeyRound, ShieldAlert, HardDrive, LogOut, Trash2,
  CheckCircle2, Database, FileWarning, Eye, EyeOff
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { SecurityEngine } from '../../services/security/securityEngine';
import { auditLogger } from '../../services/audit/auditLogger';
import { SecurityPinConfirmModal } from '../common/SecurityPinConfirmModal';
import { sound } from '../../utils/soundEffects';

const num = (v: string) => v.replace(/\D/g, '').slice(0, 8);

/**
 * SystemOwnerPanel — صفحة مالك المشروع للتحكم الكامل.
 * تظهر فقط داخل بوابة السوبر بجلسة ماستر مفتوحة (محمية مسبقاً بـ requireRole + بوابة القفل).
 * - تدوير الرموز السرية (بتحقق من الحالي أولاً)
 * - المركز الأمني (محاولات مرفوضة، أقفال تخمين، أحداث حرجة)
 * - صحة التخزين والنسخ التلقائية
 * - إنهاء الجلسة + منطقة الخطر (تصفير/مسح أختام التجارب)
 */
export const SystemOwnerPanel: React.FC = () => {
  const {
    resetDatabase, showToast, logout, listAutoBackups,
    currentUserPhone, authenticatedRole,
  } = useSchool();

  const [showPin, setShowPin] = useState(false);
  const [curPin, setCurPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinTarget, setPinTarget] = useState<'super' | 'director'>('super');
  const [pinMsg, setPinMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [showResetPin, setShowResetPin] = useState(false);
  const [showSealWipe, setShowSealWipe] = useState(false);

  // المركز الأمني من سجل التدقيق الحقيقي
  const securityStats = useMemo(() => {
    const logs = auditLogger.getLogs();
    const denied = logs.filter(l =>
      l.action.includes('DENIED') || l.action.includes('BLOCKED') || l.action.includes('TAMPER')
    );
    const critical = logs.filter(l => l.severity === 'CRITICAL');
    const unlocks = logs.filter(l =>
      l.action.includes('UNLOCK') || l.action.includes('SUPERADMIN_ENTER') || l.action.includes('ROLE_VIEW_AS')
    );
    return {
      total: logs.length,
      denied: denied.slice(0, 8),
      deniedCount: denied.length,
      critical: critical.slice(0, 8),
      criticalCount: critical.length,
      unlocks: unlocks.slice(0, 6),
    };
  }, []);

  const superLock = SecurityEngine.isSuperAdminLockedOut();
  const dirLock = SecurityEngine.isPinLockedOut();

  // صحة التخزين المحلي (تقدير الحجم الفعلي لمفاتيح المنظومة)
  const storage = useMemo(() => {
    let bytes = 0;
    let keys = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (k.startsWith('madrasa_')) {
          keys++;
          bytes += ((localStorage.getItem(k) || '').length + k.length) * 2;
        }
      }
    } catch {}
    const QUOTA = 5 * 1024 * 1024;
    const pct = Math.min(100, Math.round((bytes / QUOTA) * 100));
    return { mb: (bytes / 1024 / 1024).toFixed(2), pct, keys };
  }, []);

  const backups = listAutoBackups();

  const handleRotatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMsg(null);
    if (newPin.length < 4 || newPin !== confirmPin) {
      setPinMsg({ ok: false, text: 'الرمز الجديد: 4 أرقام على الأقل مع تطابق التأكيد.' });
      sound.playAlert();
      return;
    }
    const check = pinTarget === 'super'
      ? SecurityEngine.verifySuperAdminPin(curPin)
      : SecurityEngine.verifyDirectorPin(curPin);
    if (!check.valid) {
      setPinMsg({ ok: false, text: check.message });
      sound.playAlert();
      return;
    }
    const saved = pinTarget === 'super'
      ? SecurityEngine.setSuperAdminPin(newPin)
      : SecurityEngine.setDirectorPin(newPin);
    if (!saved) {
      setPinMsg({ ok: false, text: 'تعذر الحفظ — حاول مجدداً.' });
      return;
    }
    sound.playSuccess();
    setCurPin(''); setNewPin(''); setConfirmPin('');
    setPinMsg({ ok: true, text: `تم تغيير ${pinTarget === 'super' ? 'رمز الماستر' : 'رمز المدير'} بنجاح — القديم مات فوراً.` });
    auditLogger.log({
      actorName: currentUserPhone,
      actorRole: authenticatedRole,
      action: 'OWNER_PIN_ROTATED',
      entity: 'Security',
      details: `تدوير ${pinTarget === 'super' ? 'رمز الماستر' : 'رمز المدير'} من لوحة المالك`,
      severity: 'CRITICAL'
    });
  };

  const handleWipeSeals = () => {
    try {
      localStorage.removeItem('madrasa_device_trial_v1');
      localStorage.removeItem('madrasa_trial_used_v1');
      localStorage.removeItem('madrasa_trial_ext_v1');
    } catch {}
    sound.playSuccess();
    setShowSealWipe(false);
    showToast('gold', 'مُسحت أختام التجارب 🗝️', 'الجهاز يقبل تجربة جديدة — مخصص لنقل الملكية أو إعادة البيع.');
    auditLogger.log({
      actorName: currentUserPhone,
      actorRole: authenticatedRole,
      action: 'TRIAL_SEALS_WIPED',
      entity: 'Licensing',
      details: 'مسح أختام التجارب من لوحة المالك (نقل ملكية/إعادة بيع)',
      severity: 'CRITICAL'
    });
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-l from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-300 dark:border-amber-800 flex items-center gap-3">
        <span className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg">
          <Crown className="w-6 h-6" />
        </span>
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">صفحة مالك المشروع — تحكم كامل 👑</h2>
          <p className="text-[11px] text-slate-500">الرموز السرية • المركز الأمني • صحة التخزين • منطقة الخطر — كل إجراء هنا مسجل تدقيقياً.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PIN rotation */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>تدوير الرموز السرية</span>
          </h3>
          <div className="flex gap-2">
            {(['super', 'director'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setPinTarget(t); setPinMsg(null); sound.playTap(); }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition ${pinTarget === t ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                {t === 'super' ? 'رمز الماستر 🔑' : 'رمز المدير 🏛️'}
              </button>
            ))}
          </div>
          <form onSubmit={handleRotatePin} className="space-y-2">
            <input
              type={showPin ? 'text' : 'password'} inputMode="numeric"
              value={curPin} onChange={e => setCurPin(num(e.target.value))}
              placeholder="الرمز الحالي"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-black text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type={showPin ? 'text' : 'password'} inputMode="numeric"
                value={newPin} onChange={e => setNewPin(num(e.target.value))}
                placeholder="الجديد (4+ أرقام)"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-black text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type={showPin ? 'text' : 'password'} inputMode="numeric"
                value={confirmPin} onChange={e => setConfirmPin(num(e.target.value))}
                placeholder="تأكيد الجديد"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-black text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button" onClick={() => setShowPin(s => !s)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"
                title="إظهار/إخفاء"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow transition active:scale-95"
              >
                تغيير الرمز الآن
              </button>
            </div>
            {pinMsg && (
              <p className={`text-[11px] font-bold text-center p-2 rounded-xl ${pinMsg.ok ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'}`}>
                {pinMsg.text}
              </p>
            )}
          </form>
          <p className="text-[10px] text-slate-400 font-bold">
            {superLock.isLocked ? `🔒 بوابة السوبر مجمدة: ${superLock.remainingSeconds} ث` : '🟢 بوابة السوبر مفتوحة للمحاولات'} •
            {dirLock.isLocked ? ` 🔒 رمز المدير مجمد: ${dirLock.remainingSeconds} ث` : ' 🟢 رمز المدير متاح'}
          </p>
        </div>

        {/* Security center */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>المركز الأمني — من السجل الحقيقي</span>
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <p className="text-xl font-black tabular-nums text-slate-900 dark:text-white">{securityStats.total}</p>
              <p className="text-[10px] text-slate-400 font-bold">كل القيود</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40">
              <p className="text-xl font-black tabular-nums text-amber-600">{securityStats.deniedCount}</p>
              <p className="text-[10px] text-amber-600/80 font-bold">محاولات مرفوضة</p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40">
              <p className="text-xl font-black tabular-nums text-rose-600">{securityStats.criticalCount}</p>
              <p className="text-[10px] text-rose-600/80 font-bold">أحداث حرجة</p>
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto space-y-1.5">
            {securityStats.denied.length === 0 && securityStats.critical.length === 0 && (
              <p className="text-[11px] text-slate-400 font-bold text-center py-3 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> سجل نظيف — لا محاولات مرفوضة ولا أحداث حرجة.
              </p>
            )}
            {[...securityStats.critical, ...securityStats.denied].slice(0, 8).map(l => (
              <div key={l.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[11px]">
                <p className="font-black text-slate-800 dark:text-slate-200">{l.action} <span className="text-slate-400 font-mono" dir="ltr">{l.timestamp}</span></p>
                <p className="text-slate-500 mt-0.5">{l.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Storage health */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-500" />
            <span>صحة التخزين ({storage.mb}MB من ~5MB)</span>
          </h3>
          <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${storage.pct > 85 ? 'bg-rose-500' : storage.pct > 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.max(2, storage.pct)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {storage.keys} مفتاحاً • {storage.pct}% ممتلئ
            {storage.pct > 85 ? ' — ⚠️ المساحة حرجة: نزّل نسخة احتياطية ونظّف اللقطات القديمة.' : ' — الوضع آمن.'}
          </p>
          <div className="space-y-1.5">
            <p className="text-[11px] font-black text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> اللقطات التلقائية ({backups.length}):
            </p>
            {backups.length === 0 && <p className="text-[11px] text-slate-400">لا لقطات بعد.</p>}
            {backups.map(b => (
              <p key={b.index} className="text-[11px] text-slate-500 font-mono" dir="ltr">
                {b.index === 99 ? '🛟 safety' : '💾 auto'} • {new Date(b.takenAt).toLocaleDateString('ar-LY')} • {b.students} طالب
              </p>
            ))}
          </div>
        </div>

        {/* Session + Danger zone */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-rose-500" />
            <span>الجلسة ومنطقة الخطر</span>
          </h3>
          <button
            type="button"
            onClick={() => { logout(); sound.playTap(); }}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>إنهاء الجلسة والخروج لشاشة الدخول</span>
          </button>
          <button
            type="button"
            onClick={() => { setShowSealWipe(true); sound.playTap(); }}
            className="w-full py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <KeyRound className="w-4 h-4" />
            <span>مسح أختام التجارب (لنقل الملكية/إعادة البيع)</span>
          </button>
          <button
            type="button"
            onClick={() => { setShowResetPin(true); sound.playTap(); }}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>تصفير المصنع الكامل (برمز المدير)</span>
          </button>
        </div>
      </div>

      {/* PIN-gated modals */}
      <SecurityPinConfirmModal
        isOpen={showResetPin}
        onClose={() => setShowResetPin(false)}
        onSuccess={() => { setShowResetPin(false); resetDatabase(); }}
        title="تصفير المصنع الكامل"
        description="سيُمسح كل شيء (طلاب، درجات، إعدادات) وتُستعاد البذور — مع بقاء شاهد التصفير في السجل. أدخل رمز المدير للتأكيد."
        actionBadge="تصفير جذري ⚠️"
        isDestructive={true}
      />
      <SecurityPinConfirmModal
        isOpen={showSealWipe}
        onClose={() => setShowSealWipe(false)}
        onSuccess={handleWipeSeals}
        title="مسح أختام التجارب"
        description="سيتمكن هذا الجهاز من تجربة جديدة. استخدمها فقط عند بيع الجهاز أو نقله لمدرسة أخرى — الفعل مسجل كحدث حرج."
        actionBadge="مسح الأختام 🗝️"
        isDestructive={true}
      />
    </div>
  );
};
