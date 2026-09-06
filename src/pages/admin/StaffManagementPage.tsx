import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { StaffMember, StaffRole, StaffDocumentChecklist } from '../../types';
import { STAFF_ROLE_LABELS } from '../../data/mockStaffData';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  FileCheck2,
  FileWarning,
  ArrowRight,
  Edit2,
  Trash2,
  Phone,
  Calendar,
  CreditCard,
  Shield,
  Briefcase,
  CheckCircle2,
  X,
  User,
  Sparkles,
  Printer,
  ChevronDown
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

const ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: 'admin', label: 'إداري' },
  { value: 'supervisor', label: 'مشرف' },
  { value: 'teacher', label: 'مدرس مادة' },
  { value: 'cleaner', label: 'عامل نظافة' },
  { value: 'gardener', label: 'بستاني' },
  { value: 'student_affairs', label: 'شؤون طلبة' },
  { value: 'maintenance', label: 'صيانة' },
];

const STAFF_DOCUMENTS_META: { key: keyof StaffDocumentChecklist; label: string; desc: string }[] = [
  { key: 'contract', label: 'عقد العمل / قرار التعيين', desc: 'القرار الوزاري أو عقد العمل المعتمد' },
  { key: 'healthCert', label: 'الشهادة والبطاقة الصحية', desc: 'فحص اللياقة والسلامة الصحية السارية' },
  { key: 'qualification', label: 'المؤهل العلمي / الشهادات', desc: 'إفادة التخرج أو شهادات الخبرة والكفاءة' },
  { key: 'nationalIdCopy', label: 'صورة الرقم الوطني والبطاقة', desc: 'مستخرج الرقم الوطني أو صورة جواز السفر' },
  { key: 'criminalClearance', label: 'الحالة الجنائية (خلو سوابق)', desc: 'شهادة عدم المحكومية الصادرة من الجهات الأمنية' },
  { key: 'personalPhotos', label: 'الصور الشخصية (4 صور)', desc: 'صور خلفية بيضاء لملف شؤون العاملين' },
];

export const StaffManagementPage: React.FC = () => {
  const {
    staffMembers,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    updateStaffDocuments,
    setActiveTab
  } = useSchool();

  // Search and Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [docFilter, setDocFilter] = useState<'all' | 'complete' | 'missing'>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [docsModalStaff, setDocsModalStaff] = useState<StaffMember | null>(null);
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState<StaffMember | null>(null);

  // Form states for Add / Edit
  const [formFirstName, setFormFirstName] = useState('');
  const [formMiddleName, setFormMiddleName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formNationalId, setFormNationalId] = useState('');
  const [formGender, setFormGender] = useState<'male' | 'female'>('male');
  const [formPhone, setFormPhone] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('1990-01-01');
  const [formRole, setFormRole] = useState<StaffRole>('teacher');
  const [formDocs, setFormDocs] = useState<StaffDocumentChecklist>({
    contract: true,
    healthCert: false,
    qualification: true,
    nationalIdCopy: true,
    criminalClearance: false,
    personalPhotos: true,
  });

  const openAddModal = () => {
    sound.playTap();
    setEditingStaff(null);
    setFormFirstName('');
    setFormMiddleName('');
    setFormLastName('');
    setFormNationalId('');
    setFormGender('male');
    setFormPhone('09');
    setFormBirthDate('1990-01-01');
    setFormRole('teacher');
    setFormDocs({
      contract: true,
      healthCert: false,
      qualification: true,
      nationalIdCopy: true,
      criminalClearance: false,
      personalPhotos: true,
    });
    setShowAddModal(true);
  };

  const openEditModal = (staff: StaffMember) => {
    sound.playTap();
    setEditingStaff(staff);
    setFormFirstName(staff.firstName);
    setFormMiddleName(staff.middleName);
    setFormLastName(staff.lastName);
    setFormNationalId(staff.nationalNumber || '');
    setFormGender(staff.gender);
    setFormPhone(staff.phone);
    setFormBirthDate(staff.birthDate);
    setFormRole(staff.role);
    setFormDocs({ ...staff.documents });
    setShowAddModal(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formLastName.trim()) return;

    const fullName = `${formFirstName.trim()} ${formMiddleName.trim()} ${formLastName.trim()}`.replace(/\s+/g, ' ');
    const roleLabel = STAFF_ROLE_LABELS[formRole] || formRole;

    if (editingStaff) {
      updateStaffMember(editingStaff.id, {
        firstName: formFirstName.trim(),
        middleName: formMiddleName.trim(),
        lastName: formLastName.trim(),
        fullName,
        nationalNumber: formNationalId.trim(),
        gender: formGender,
        phone: formPhone.trim(),
        birthDate: formBirthDate,
        role: formRole,
        roleLabel,
        documents: formDocs
      });
    } else {
      addStaffMember({
        firstName: formFirstName.trim(),
        middleName: formMiddleName.trim(),
        lastName: formLastName.trim(),
        fullName,
        nationalNumber: formNationalId.trim(),
        gender: formGender,
        phone: formPhone.trim(),
        birthDate: formBirthDate,
        role: formRole,
        roleLabel,
        hireDate: new Date().toISOString().split('T')[0],
        documents: formDocs
      });
      triggerConfetti();
    }
    setShowAddModal(false);
  };

  const handleDeleteStaff = () => {
    if (!deleteConfirmStaff) return;
    deleteStaffMember(deleteConfirmStaff.id);
    setDeleteConfirmStaff(null);
  };

  // Helper to count documents
  const getDocStatus = (docs: StaffDocumentChecklist) => {
    const total = 6;
    const completed = Object.values(docs).filter(Boolean).length;
    return {
      total,
      completed,
      missing: total - completed,
      isComplete: completed === total
    };
  };

  // KPI Statistics
  const stats = useMemo(() => {
    const total = staffMembers.length;
    let completeCount = 0;
    let missingCount = 0;
    const roleCounts: Record<string, number> = {};

    staffMembers.forEach(m => {
      const st = getDocStatus(m.documents);
      if (st.isComplete) completeCount++;
      else missingCount++;
      roleCounts[m.role] = (roleCounts[m.role] || 0) + 1;
    });

    return { total, completeCount, missingCount, roleCounts };
  }, [staffMembers]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffMembers.filter(m => {
      // Role filter
      if (selectedRole !== 'all' && m.role !== selectedRole) return false;

      // Doc filter
      const docStat = getDocStatus(m.documents);
      if (docFilter === 'complete' && !docStat.isComplete) return false;
      if (docFilter === 'missing' && docStat.isComplete) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const fullName = `${m.firstName} ${m.middleName} ${m.lastName}`.toLowerCase();
        const matchesName = fullName.includes(query);
        const matchesId = (m.nationalNumber || '').includes(query);
        const matchesPhone = m.phone.includes(query);
        const matchesRole = (STAFF_ROLE_LABELS[m.role] || '').toLowerCase().includes(query);
        return matchesName || matchesId || matchesPhone || matchesRole;
      }

      return true;
    });
  }, [staffMembers, selectedRole, docFilter, searchTerm]);

  return (
    <div className="space-y-6 text-right animate-in fade-in max-w-7xl mx-auto pb-12 font-tajawal">
      
      {/* Top Navigation & Return Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <button
          onClick={() => {
            sound.playTap();
            setActiveTab('dashboard');
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-sm active:scale-95 group"
        >
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>الرجوع إلى لوحة الإدارة الرئيسية</span>
        </button>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-700/20 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة موظف / عامل جديد ➕</span>
        </button>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Users className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                منظومة شؤون العاملين والموظفين
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              إدارة الكوادر المدرسية والموظفين والعمال 👥
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              تتبع السجلات الوظيفية، المستندات المكتملة والنواقص، والبيانات الثبوتية لكافة الكوادر من معلمين، إداريين، مشرفين، وعمال.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 min-w-24">
              <span className="block text-2xl font-black text-amber-300">{stats.total}</span>
              <span className="text-[11px] text-white/80">إجمالي الكادر</span>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/20 min-w-24">
              <span className="block text-2xl font-black text-emerald-300">{stats.completeCount}</span>
              <span className="text-[11px] text-emerald-200">ملفات مكتملة</span>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-2xl bg-rose-500/20 backdrop-blur-md border border-rose-400/20 min-w-24">
              <span className="block text-2xl font-black text-rose-300">{stats.missingCount}</span>
              <span className="text-[11px] text-rose-200">ملفات ناقصة</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">المعلمون والمعلمات</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100">{stats.roleCounts['teacher'] || 0} معلم</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">الإدارة والإشراف</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100">
              {(stats.roleCounts['admin'] || 0) + (stats.roleCounts['supervisor'] || 0) + (stats.roleCounts['student_affairs'] || 0)} موظف
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">العمال والخدمات</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100">
              {(stats.roleCounts['cleaner'] || 0) + (stats.roleCounts['gardener'] || 0) + (stats.roleCounts['maintenance'] || 0)} عمال
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
            <FileWarning className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">نسبة اكتمال الوثائق</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100">
              {stats.total > 0 ? Math.round((stats.completeCount / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="البحث بالاسم، الرقم الوطني (12 رقماً)، الهاتف، أو الوظيفة..."
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">كل الوظائف ({stats.total})</option>
              {ROLE_OPTIONS.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label} ({stats.roleCounts[r.value] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Document Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setDocFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                docFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setDocFilter('complete')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                docFilter === 'complete'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              مكتملة ({stats.completeCount})
            </button>
            <button
              onClick={() => setDocFilter('missing')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                docFilter === 'missing'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50'
              }`}
            >
              <FileWarning className="w-3.5 h-3.5" />
              ملفات ناقصة ({stats.missingCount})
            </button>
          </div>
        </div>
      </div>

      {/* Staff Members Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                <th className="p-4">اسم الموظف / العامل</th>
                <th className="p-4">الوظيفة والتصنيف</th>
                <th className="p-4">الرقم الوطني الليبي</th>
                <th className="p-4">الجنس وتاريخ الميلاد</th>
                <th className="p-4">رقم الهاتف</th>
                <th className="p-4 text-center">حالة المستندات</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm">لا توجد نتائج مطابقة لبحثك أو التصنيف المحدد</p>
                    <p className="text-[11px] mt-1">جرّب تغيير كلمات البحث أو إعادة ضبط خيارات التصفية</p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const docStat = getDocStatus(staff.documents);
                  const isComplete = docStat.isComplete;

                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs ${
                            staff.gender === 'male'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}>
                            {staff.firstName[0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {staff.firstName} {staff.middleName} {staff.lastName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              تاريخ التعيين: {staff.hireDate}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold ${
                          staff.role === 'teacher'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60'
                            : staff.role === 'admin' || staff.role === 'supervisor' || staff.role === 'student_affairs'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60'
                        }`}>
                          <Briefcase className="w-3 h-3" />
                          {STAFF_ROLE_LABELS[staff.role] || staff.role}
                        </span>
                      </td>

                      {/* National ID */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-xs">
                          {staff.nationalNumber || 'غير مسجل'}
                        </span>
                      </td>

                      {/* Gender and Birth Date */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="text-slate-800 dark:text-slate-200 font-semibold block">
                            {staff.gender === 'male' ? 'ذكر 👨' : 'أنثى 👩'}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {staff.birthDate}
                          </span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="p-4">
                        <a
                          href={`tel:${staff.phone}`}
                          className="flex items-center gap-1.5 font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {staff.phone}
                        </a>
                      </td>

                      {/* Documents Status */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playTap();
                            setDocsModalStaff(staff);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all hover:scale-105 ${
                            isComplete
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          }`}
                          title="انقر لإدارة وتعديل المستندات"
                        >
                          {isComplete ? (
                            <>
                              <FileCheck2 className="w-3.5 h-3.5" />
                              <span>مكتمل (6/6)</span>
                            </>
                          ) : (
                            <>
                              <FileWarning className="w-3.5 h-3.5" />
                              <span>ملفات ناقصة ({docStat.missing} نواقص)</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              sound.playTap();
                              setDocsModalStaff(staff);
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                            title="تتبع النواقص والمستندات"
                          >
                            <FileCheck2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(staff)}
                            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition-colors"
                            title="تعديل الملف"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmStaff(staff)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors"
                            title="حذف الموظف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Return Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            sound.playTap();
            setActiveTab('dashboard');
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <span>الرجوع إلى القسم السابق</span>
        </button>

        <span className="text-xs text-slate-400">
          منظومة إدارة الكوادر والموظفين — مدرسة رقمية متكاملة
        </span>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Add / Edit Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingStaff ? 'تعديل ملف الموظف / العامل' : 'إضافة موظف أو عامل جديد'}
                  </h3>
                  <p className="text-xs text-blue-100">
                    تسجيل البيانات الثبوتية والوظيفية وقائمة المستندات
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الاسم الأول: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formFirstName}
                    onChange={e => setFormFirstName(e.target.value)}
                    placeholder="مثال: عبدالسلام"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الاسم الأوسط (اسم الأب):
                  </label>
                  <input
                    type="text"
                    value={formMiddleName}
                    onChange={e => setFormMiddleName(e.target.value)}
                    placeholder="مثال: مفتاح"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم العائلة / اللقب: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formLastName}
                    onChange={e => setFormLastName(e.target.value)}
                    placeholder="مثال: الورفلي"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الرقم الوطني الليبي (12 رقماً): <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNationalId}
                    onChange={e => setFormNationalId(e.target.value)}
                    placeholder="مثال: 119850123456"
                    required
                    maxLength={12}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم هاتف التواصل: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="مثال: 0912345678"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الوظيفة والتكليف: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as StaffRole)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none focus:border-blue-500"
                  >
                    {ROLE_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الجنس:
                  </label>
                  <select
                    value={formGender}
                    onChange={e => setFormGender(e.target.value as 'male' | 'female')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none focus:border-blue-500"
                  >
                    <option value="male">ذكر 👨</option>
                    <option value="female">أنثى 👩</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ الميلاد:
                  </label>
                  <input
                    type="date"
                    value={formBirthDate}
                    onChange={e => setFormBirthDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Document Checklist in Add/Edit */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                  قائمة المستندات المسلمة لملف الموظف (الملفات الناقصة والمكتملة):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STAFF_DOCUMENTS_META.map(doc => {
                    const checked = formDocs[doc.key];
                    return (
                      <button
                        key={doc.key}
                        type="button"
                        onClick={() => {
                          sound.playTap();
                          setFormDocs(prev => ({ ...prev, [doc.key]: !checked }));
                        }}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-right transition-all ${
                          checked
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <div className={`p-1 rounded-lg ${checked ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold block text-xs">{doc.label}</span>
                          <span className="text-[10px] opacity-70 block">{doc.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition-all active:scale-95"
                >
                  {editingStaff ? 'حفظ التعديلات' : 'إضافة الموظف الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Documents Checklist Quick Modal */}
      {docsModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    تتبع مستندات {docsModalStaff.firstName} {docsModalStaff.lastName}
                  </h3>
                  <p className="text-xs text-emerald-100">
                    {STAFF_ROLE_LABELS[docsModalStaff.role] || docsModalStaff.role} — انقر لتحديث حالة المستند
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDocsModalStaff(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 font-tajawal text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  حالة الملف العام:
                </span>
                {(() => {
                  const stat = getDocStatus(docsModalStaff.documents);
                  return (
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      stat.isComplete
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                      {stat.isComplete ? 'الملف مكتمل (6 / 6) ✅' : `ملفات ناقصة (${stat.missing} متبقية) ⚠️`}
                    </span>
                  );
                })()}
              </div>

              <div className="space-y-2">
                {STAFF_DOCUMENTS_META.map(doc => {
                  const isChecked = docsModalStaff.documents[doc.key];
                  return (
                    <button
                      key={doc.key}
                      type="button"
                      onClick={() => {
                        sound.playTap();
                        updateStaffDocuments(docsModalStaff.id, { [doc.key]: !isChecked });
                        // update local modal view
                        setDocsModalStaff(prev => prev ? {
                          ...prev,
                          documents: { ...prev.documents, [doc.key]: !isChecked }
                        } : null);
                      }}
                      className={`w-full flex items-start gap-3 p-3 rounded-2xl border text-right transition-all group ${
                        isChecked
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                          : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 text-rose-900 dark:text-rose-300'
                      }`}
                    >
                      <div className={`mt-0.5 p-1 rounded-lg ${
                        isChecked ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 border border-rose-300 text-rose-500'
                      }`}>
                        {isChecked ? <CheckCircle2 className="w-4 h-4" /> : <FileWarning className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{doc.label}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isChecked ? 'bg-emerald-200/60 text-emerald-800' : 'bg-rose-200/60 text-rose-800'
                          }`}>
                            {isChecked ? 'مُسلَّم ✓' : 'ناقص ✗'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {doc.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDocsModalStaff(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Modal */}
      {deleteConfirmStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                تأكيد حذف ملف الموظف
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                هل أنت متأكد من حذف بيانات الموظف ({deleteConfirmStaff.firstName} {deleteConfirmStaff.lastName})؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmStaff(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteStaff}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
