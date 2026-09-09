import React, { useState, useEffect } from 'react';
import {
  Building2,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Plus,
  Copy,
  Check,
  RotateCw,
  Search,
  Calendar,
  Phone,
  Power,
  Lock,
  Sparkles,
  Send,
  CheckCircle2,
  XCircle,
  Inbox
} from 'lucide-react';
import { LicenseService } from '../../services/licensing/licenseService';
import { SchoolLicenseDoc, SubscriptionStatus, RenewalRequest } from '../../services/licensing/licenseTypes';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { auditLogger } from '../../services/audit/auditLogger';

export const SuperAdminLicenseManager: React.FC = () => {
  const [schools, setSchools] = useState<SchoolLicenseDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // New School Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolPhone, setNewSchoolPhone] = useState('');
  const [newSchoolNotes, setNewSchoolNotes] = useState('');
  const [newSchoolDays, setNewSchoolDays] = useState(14);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSchools();
    loadRenewals();
  }, []);

  const loadSchools = () => {
    const list = LicenseService.getAdminRegisteredSchools();
    setSchools(list);
  };

  // طلبات التجديد المعلقة (محلية + سحابية)
  const [renewals, setRenewals] = useState<RenewalRequest[]>([]);
  const [isLoadingRenewals, setIsLoadingRenewals] = useState(false);

  const loadRenewals = async () => {
    setIsLoadingRenewals(true);
    try {
      await LicenseService.fetchRemoteRenewals().catch(() => []);
    } finally {
      setRenewals(LicenseService.getRenewalRequests());
      setIsLoadingRenewals(false);
    }
  };

  const pendingRenewals = renewals.filter(r => r.status === 'pending');

  const handleResolveRenewal = async (id: string, approve: boolean) => {
    sound.playTap();
    if (!approve && !window.confirm('هل أنت متأكد من رفض طلب التجديد هذا؟')) return;
    const resolved = await LicenseService.resolveRenewalRequest(id, approve);
    if (resolved) {
      if (approve) {
        sound.playSuccess();
        triggerConfetti();
      }
      auditLogger.log({
        actorName: 'المدير العام',
        actorRole: 'superadmin',
        action: approve ? 'RENEWAL_APPROVED' : 'RENEWAL_REJECTED',
        entity: 'Licensing',
        details: `${approve ? 'قبول' : 'رفض'} طلب تجديد (${resolved.school_name} — ${resolved.license_key})`,
        severity: 'WARN'
      });
      loadRenewals();
      loadSchools();
    }
  };

  const handleCopy = (key: string) => {
    sound.playTap();
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExtend = async (licenseKey: string, days: number) => {
    sound.playTap();
    const updated = await LicenseService.extendTrial(licenseKey, days);
    if (updated) {
      sound.playSuccess();
      loadSchools();
    }
  };

  const handleToggleStatus = async (school: SchoolLicenseDoc) => {
    sound.playTap();
    const nextStatus: SubscriptionStatus = school.subscription_status === 'active' ? 'suspended' : 'active';
    const updated = await LicenseService.updateStatus(school.license_key, nextStatus);
    if (updated) {
      sound.playSuccess();
      loadSchools();
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;

    sound.playTap();
    setIsSubmitting(true);

    try {
      const created = await LicenseService.registerSchool({
        schoolName: newSchoolName,
        phone: newSchoolPhone || '0922465676',
        trialDays: newSchoolDays,
        notes: newSchoolNotes
      });

      sound.playSuccess();
      triggerConfetti();
      setShowAddModal(false);
      setNewSchoolName('');
      setNewSchoolPhone('');
      setNewSchoolNotes('');
      loadSchools();
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSchools = schools.filter(s =>
    s.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.license_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    total: schools.length,
    active: schools.filter(s => s.subscription_status === 'active').length,
    trial: schools.filter(s => s.subscription_status === 'trial').length,
    suspendedOrExpired: schools.filter(s => s.subscription_status === 'suspended' || s.subscription_status === 'expired').length,
  };

  return (
    <div className="space-y-6 font-cairo text-right">
      
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>نظام إدارة التراخيص واشتراكات المدارس (Cloud Licensing)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إصدار التراخيص ومفاتيح التحقق السحابية، تمديد الفترات التجريبية، وتفعيل الاشتراكات للمدارس العميلة
          </p>
        </div>

        <button
          onClick={() => { setShowAddModal(true); sound.playTap(); }}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل مدرسة جديدة وتوليد ترخيص ➕</span>
        </button>
      </div>

      {/* Renewal Requests Inbox (طلبات التجديد المعلقة) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Inbox className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>طلبات تجديد الاشتراك</span>
            {pendingRenewals.length > 0 && (
              <span className="bg-rose-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full animate-pulse">
                {pendingRenewals.length} معلّق
              </span>
            )}
          </h2>
          <button
            onClick={() => { loadRenewals(); sound.playTap(); }}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-1.5 transition"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoadingRenewals ? 'animate-spin' : ''}`} />
            <span>تحديث الطلبات</span>
          </button>
        </div>

        {pendingRenewals.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold text-center py-4">
            {isLoadingRenewals ? 'جاري جلب الطلبات...' : 'لا توجد طلبات تجديد معلقة حالياً ✅'}
          </p>
        ) : (
          <div className="space-y-2.5">
            {pendingRenewals.map(req => (
              <div key={req.id} className="p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>{req.school_name}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono" dir="ltr">{req.license_key} • {req.id}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1" dir="ltr">
                    <Phone className="w-3 h-3" /> {req.admin_phone}
                    <span className="font-bold">• {new Date(req.created_at).toLocaleDateString('ar-LY')}</span>
                  </p>
                  {req.message && <p className="text-[11px] text-slate-600 dark:text-slate-300">«{req.message}»</p>}
                </div>
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleResolveRenewal(req.id, true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition active:scale-95 flex items-center gap-1.5"
                    title="تفعيل اشتراك سنة كاملة فوراً"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>قبول وتفعيل سنة ⚡</span>
                  </button>
                  <button
                    onClick={() => handleResolveRenewal(req.id, false)}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 text-rose-600 text-xs font-black transition active:scale-95 flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>رفض</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-400 font-bold">إجمالي المدارس المسجلة</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">الاشتراكات السارية (Active)</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{stats.active}</p>
        </div>
        <div className="p-5 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 shadow-sm">
          <p className="text-xs text-blue-700 dark:text-blue-400 font-bold">في الفترة التجريبية (Trial)</p>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{stats.trial}</p>
        </div>
        <div className="p-5 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 shadow-sm">
          <p className="text-xs text-rose-700 dark:text-rose-400 font-bold">معلقة أو منتهية</p>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{stats.suspendedOrExpired}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم المدرسة، مفتاح الترخيص، أو المدينة..."
          className="w-full pr-11 pl-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Schools List */}
      <div className="space-y-3">
        {filteredSchools.map((school) => {
          const trialEnd = new Date(school.trial_ends_at).getTime();
          const daysLeft = Math.max(0, Math.ceil((trialEnd - Date.now()) / (1000 * 60 * 60 * 24)));
          const isExpired = school.subscription_status === 'expired' || (school.subscription_status === 'trial' && daysLeft === 0);

          return (
            <div
              key={school.license_key}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition hover:border-indigo-300 dark:hover:border-indigo-700"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <span>{school.school_name}</span>
                    </h3>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                      school.subscription_status === 'active'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : school.subscription_status === 'suspended'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : isExpired
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>
                        {school.subscription_status === 'active'
                          ? 'اشتراك ساري (Active)'
                          : school.subscription_status === 'suspended'
                          ? 'معلق (Suspended)'
                          : isExpired
                          ? 'منتهي (Expired)'
                          : `تجريبي (متبقي ${daysLeft} يوم)`}
                      </span>
                    </span>
                  </div>

                  {/* License Key with Copy */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">مفتاح الترخيص:</span>
                    <button
                      onClick={() => handleCopy(school.license_key)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-mono font-bold flex items-center gap-1.5 text-xs transition"
                      title="نسخ مفتاح الترخيص"
                    >
                      <span>{school.license_key}</span>
                      {copiedKey === school.license_key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    {school.admin_phone && (
                      <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1" dir="ltr">
                        <Phone className="w-3 h-3" />
                        {school.admin_phone}
                      </span>
                    )}
                    {school.notes && (
                      <span className="text-slate-400 text-[11px]">• {school.notes}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                  <button
                    onClick={() => handleExtend(school.license_key, 14)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 transition"
                    title="تمديد التجربة أسبوعين"
                  >
                    +14 يوم ⏳
                  </button>

                  <button
                    onClick={() => handleExtend(school.license_key, 30)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition"
                    title="تمديد شهر كامل"
                  >
                    +30 يوم 📅
                  </button>

                  <button
                    onClick={() => handleToggleStatus(school)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition ${
                      school.subscription_status === 'active'
                        ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {school.subscription_status === 'active' ? 'تعليق ⏸️' : 'تفعيل دائم ⚡'}
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Add New School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>تسجيل مدرسة جديدة وتوليد الترخيص</span>
            </h3>

            <form onSubmit={handleCreateSchool} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم المدرسة الرسمي</label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={e => setNewSchoolName(e.target.value)}
                  placeholder="مثال: مدرسة المستقبل الابتدائية"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">رقم هاتف المدير المسؤول</label>
                <input
                  type="tel"
                  value={newSchoolPhone}
                  onChange={e => setNewSchoolPhone(e.target.value)}
                  placeholder="0922465676"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">المدينة / الملاحظات</label>
                <input
                  type="text"
                  value={newSchoolNotes}
                  onChange={e => setNewSchoolNotes(e.target.value)}
                  placeholder="طرابلس / بنغازي / مصراتة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">مدة الفترة التجريبية الأولى</label>
                <select
                  value={newSchoolDays}
                  onChange={e => setNewSchoolDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value={14}>14 يوماً (تجريبي افتراضي)</option>
                  <option value={30}>30 يوماً (شهر كامل)</option>
                  <option value={90}>90 يوماً (فصل دراسي)</option>
                  <option value={365}>365 يوماً (سنة دراسية كاملة)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>توليد الترخيص وحفظ المدرسة 💾</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
