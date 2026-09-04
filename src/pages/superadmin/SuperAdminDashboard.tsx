import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Building2,
  Plus,
  Users,
  GraduationCap,
  Award,
  Download,
  Copy,
  CheckCircle2,
  ExternalLink,
  Phone,
  Search,
  Sparkles,
  School,
  ArrowRight,
  Share2,
  CalendarCheck,
  Shield,
  Layers
} from 'lucide-react';
import { SchoolProfile } from '../../types';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { getRoleLink, copyTextToClipboard } from '../../utils/inviteMessageHelper';
import { DirectorInviteModal } from '../../components/common/DirectorInviteModal';

export const SuperAdminDashboard: React.FC = () => {
  const {
    schoolProfile,
    savedSchools,
    switchSchool,
    createNewSchool,
    students,
    teachers,
    setCurrentRole,
    setActiveTab,
    showToast
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedSchoolId, setCopiedSchoolId] = useState<string | null>(null);

  // New School Form State
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [newDistrict, setNewDistrict] = useState('مراقبة التربية والتعليم - توكرة');
  const [newDirector, setNewDirector] = useState('');
  const [newPhone, setNewPhone] = useState('0912345678');
  const [startFresh, setStartFresh] = useState(true);

  const filteredSchools = savedSchools.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.directorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNewSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) {
      showToast('error', 'تنبيه', 'يرجى إدخال اسم المدرسة.');
      return;
    }

    sound.playSuccess();
    createNewSchool(
      newSchoolName.trim(),
      newDistrict.trim(),
      newDirector.trim() || 'مدير المدرسة',
      newPhone.trim(),
      startFresh
    );
    triggerConfetti();
    showToast('gold', 'تمت إضافة المدرسة بنجاح 🏛️', `تم تسجيل مدرسة (${newSchoolName}) في ديوان المدارس بنجاح.`);
    setShowAddSchoolModal(false);
    setNewSchoolName('');
    setNewSchoolCode('');
    setNewDirector('');
  };

  const handleEnterAsDirector = (school: SchoolProfile) => {
    sound.playTap();
    switchSchool(school.id);
    setCurrentRole('admin');
    setActiveTab('dashboard');
    showToast('info', 'تم التبديل للمدرسة', `أنت الآن في لوحة تحكم مدير: ${school.name}`);
  };

  const handleCopyDirectorLink = async (school: SchoolProfile) => {
    sound.playTap();
    const link = getRoleLink('admin');
    const ok = await copyTextToClipboard(link);
    if (ok) {
      setCopiedSchoolId(school.id);
      showToast('success', 'تم نسخ رابط المدير 🔗', `تم نسخ رابط مدير (${school.name}) بنجاح.`);
      setTimeout(() => setCopiedSchoolId(null), 2000);
    }
  };

  // Mock aggregates
  const totalSchools = Math.max(savedSchools.length, 1);
  const totalStudents = students.length;
  const totalTeachers = teachers.length;

  return (
    <div className="space-y-6 animate-in fade-in text-right font-cairo">
      
      {/* Super Admin Prestigious Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl border border-white/20 shadow-inner shrink-0">
              🌐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                  صلاحيات السوبر أدمن الكاملة (Super Admin)
                </span>
                <span className="text-xs text-blue-200">ديوان مراقبة التربية والتعليم</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                لوحة تحكم المدير العام والسوبر أدمن لكافة المدارس
              </h2>
              <p className="text-xs text-blue-100/80 mt-1 max-w-2xl">
                إدارة مركزية شاملة لجميع المدارس الأساسية والثانوية في البلدية، إضافة مدارس جديدة، تعيين المدراء، وتوزيع الروابط المستقلة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            <button
              type="button"
              onClick={() => { setShowAddSchoolModal(true); sound.playTap(); }}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مدرسة جديدة ➕</span>
            </button>

            <button
              type="button"
              onClick={() => { setShowInviteModal(true); sound.playTap(); }}
              className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-xs border border-white/20 shadow-md transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>✉️ رسالة دعوة المدراء والروابط</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block">إجمالي المدارس المسجلة</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
              {totalSchools} مدارس
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center text-xl">
            🏛️
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block">إجمالي الطلاب في المنظومة</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
              {totalStudents} طالباً
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center text-xl">
            👥
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block">إجمالي المعلمين المعتمدين</span>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1 block">
              {totalTeachers} معلماً
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center text-xl">
            👨‍🏫
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block">اعتماد الامتحانات والكنترول</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1 block">
              100% معتمد
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center text-xl">
            📜
          </div>
        </div>
      </div>

      {/* Schools Directory & Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث عن مدرسة باسم المدرسة، الكود، البلدية، أو اسم المدير..."
            className="w-full py-2.5 px-3.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span>المدرسة المحددة حالياً:</span>
          <span className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-black">
            {schoolProfile.name}
          </span>
        </div>
      </div>

      {/* Schools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchools.map((school) => {
          const isCurrentActive = school.id === schoolProfile.id;
          const isCopied = copiedSchoolId === school.id;

          return (
            <div
              key={school.id}
              className={`p-5 rounded-3xl border transition shadow-sm hover:shadow-md flex flex-col justify-between gap-4 ${
                isCurrentActive
                  ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-400 dark:border-blue-700 ring-2 ring-blue-400/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-lg font-black shrink-0">
                      🏛️
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white leading-snug">
                        {school.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-slate-400">
                          كود: {school.code}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                          نشطة ومفعلة 🟢
                        </span>
                      </div>
                    </div>
                  </div>

                  {isCurrentActive && (
                    <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-black text-[10px] shrink-0">
                      المدرسة النشطة
                    </span>
                  )}
                </div>

                {/* Info List */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>المنطقة / المراقبة:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{school.district}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>مدير المدرسة:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{school.directorName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>رقم هاتف المدير:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{school.directorPhone}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>العام الدراسي:</span>
                    <span className="font-bold text-emerald-600">{school.academicYear}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEnterAsDirector(school)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>دخول كمدير للمدرسة 👁️</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyDirectorLink(school)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition active:scale-95"
                  title="نسخ الرابط المباشر لمدير هذه المدرسة"
                >
                  {isCopied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New School Modal */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-cairo">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in text-right">
            
            <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
              <h3 className="text-base font-black">تسجيل وإضافة مدرسة جديدة إلى المنظومة</h3>
              <p className="text-xs text-blue-200 mt-1">
                إتاحة إنشاء منصة مستقلة لمدرسة أخرى بكامل كشوفاتها وإعداداتها
              </p>
            </div>

            <form onSubmit={handleCreateNewSchool} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المدرسة بالكامل:
                </label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={e => setNewSchoolName(e.target.value)}
                  placeholder="مثال: مدرسة توكرة الثانوية للبنين"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    كود المدرسة الإحصائي:
                  </label>
                  <input
                    type="text"
                    value={newSchoolCode}
                    onChange={e => setNewSchoolCode(e.target.value)}
                    placeholder="مثال: 30714"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    البلدية / المراقبة:
                  </label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={e => setNewDistrict(e.target.value)}
                    placeholder="مراقبة التربية والتعليم توكرة"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم مدير المدرسة:
                  </label>
                  <input
                    type="text"
                    value={newDirector}
                    onChange={e => setNewDirector(e.target.value)}
                    placeholder="أ. محمد البرغثي"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    هاتف مدير المدرسة:
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200">
                💡 سيتم إنشاء بيئة مستقلة تماماً للمدرسة الجديدة مع تمكين مديرها من استيراد كشوفات الـ PDF والإكسل الخاصة بطلابه ومعلميه.
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSchoolModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md transition active:scale-95"
                >
                  تأكيد إضافة المدرسة 🏛️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Director Invite Modal */}
      <DirectorInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

    </div>
  );
};
