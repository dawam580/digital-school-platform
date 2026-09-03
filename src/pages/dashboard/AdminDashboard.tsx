import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  LogOut,
  Search,
  Download,
  Trash2,
  Edit2,
  Plus,
  Tag,
  BookOpen,
  Phone,
  Calendar,
  Check,
  Sparkles,
  ChevronLeft,
  Filter,
  UserCheck
} from 'lucide-react';
import { TeacherManagerModal } from '../../components/admin/TeacherManagerModal';
import { exportLibyanStudentsToExcel } from '../../utils/excelHelper';
import { sound } from '../../utils/soundEffects';
import { TeacherAccount, Student } from '../../types';
import { db } from '../../services/db';

export const AdminDashboard: React.FC = () => {
  const {
    students,
    setStudents,
    teachers,
    setTeachers,
    schoolProfile,
    setShowPdfImporterModal,
    logout,
    showToast,
    updateAttendance,
    markAllPresent
  } = useSchool();

  // Active Tab: 'students' | 'teachers' | 'attendance'
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'attendance'>('students');

  // Students Tab State
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  // Teachers Tab State
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<TeacherAccount | null>(null);

  // Available classes dynamically extracted from students
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.className) set.add(s.className);
    });
    return Array.from(set).sort();
  }, [students]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch =
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (s.nationalNumber && s.nationalNumber.includes(studentSearch)) ||
        (s.nationalId && s.nationalId.includes(studentSearch)) ||
        (s.motherName && s.motherName.includes(studentSearch));

      const matchClass =
        selectedClassFilter === 'all' || s.className === selectedClassFilter;

      return matchSearch && matchClass;
    });
  }, [students, studentSearch, selectedClassFilter]);

  // Attendance Metrics
  const totalStudentsCount = students.length;
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'unexcused').length;
  const lateCount = students.filter(s => s.status === 'late').length;
  const excusedCount = students.filter(s => s.status === 'excused').length;
  const attendancePercentage = totalStudentsCount > 0
    ? Math.round((presentCount / totalStudentsCount) * 100 * 10) / 10
    : 95.6;

  // Delete Student Handler
  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الطالب (${name}) من المنظومة؟`)) {
      const updated = students.filter(s => s.id !== id);
      setStudents(updated);
      db.saveStudents(updated, true);
      sound.playTap();
      showToast('info', 'تم حذف الطالب', `تمت إزالة ${name} بنجاح.`);
    }
  };

  // Delete Teacher Handler
  const handleDeleteTeacher = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المعلم (${name})؟`)) {
      const updated = teachers.filter(t => t.id !== id);
      setTeachers(updated);
      db.saveTeachers(updated);
      sound.playTap();
      showToast('info', 'تم حذف المعلم', `تمت إزالة ${name} بنجاح.`);
    }
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in max-w-6xl mx-auto pb-16 font-cairo">
      
      {/* Top Header & Fast Actions */}
      <div className="p-5 sm:p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 mb-1.5">
            <span>🇱🇾 {schoolProfile.district} • العام {schoolProfile.academicYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            لوحة تحكم إدارة المدرسة: {schoolProfile.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            إدارة كشوفات الطلاب، التحكم في المعلمين، ومتابعة تسجيل الحضور اليومي
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* PDF Importer Button */}
          <button
            onClick={() => { setShowPdfImporterModal(true); sound.playTap(); }}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
            title="استيراد كشف الطلبة من ملف PDF للمنظومة القديمة"
          >
            <FileText className="w-5 h-5 text-emerald-200" />
            <span>📄 استيراد كشف PDF للطلبة</span>
          </button>

          {/* Prominent Back Button */}
          <button
            onClick={() => { logout(); sound.playTap(); }}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm border border-rose-400/50 shadow-md flex items-center justify-center gap-2 transition active:scale-95"
            title="الرجوع إلى شاشة تسجيل الدخول"
          >
            <LogOut className="w-5 h-5" />
            <span>⬅️ رجوع (خروج)</span>
          </button>
        </div>
      </div>

      {/* 3 Main Stat Cards (Clean & Focused) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Students Count */}
        <div
          onClick={() => setActiveTab('students')}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95 ${
            activeTab === 'students'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-500 block">إجمالي الطلاب المسجلين</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">
              {totalStudentsCount} طالب
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 inline-block">
              عرض الكشف الكامل ←
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-2xl">
            👥
          </div>
        </div>

        {/* Card 2: Teachers Count */}
        <div
          onClick={() => setActiveTab('teachers')}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95 ${
            activeTab === 'teachers'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-500 block">التحكم في المعلمين</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">
              {teachers.length} معلم
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1 inline-block">
              إدارة الرموز والفصول ←
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-2xl">
            👨‍🏫
          </div>
        </div>

        {/* Card 3: Attendance Rate */}
        <div
          onClick={() => setActiveTab('attendance')}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95 ${
            activeTab === 'attendance'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-500 block">تسجيل الحضور اليومي</span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {attendancePercentage}%
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold mt-1 inline-block">
              {presentCount} حاضر • {absentCount} غائب
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-2xl">
            📊
          </div>
        </div>

      </div>

      {/* Big Main Tab Selector Pills */}
      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => { setActiveTab('students'); sound.playTap(); }}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'students'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. كشف الطلاب المسجلين والمستوردين ({students.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('teachers'); sound.playTap(); }}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'teachers'
              ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>2. التحكم في المعلمين ورموزهم ({teachers.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('attendance'); sound.playTap(); }}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'attendance'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>3. متابعة تسجيل الحضور بالكامل</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REGISTERED & IMPORTED STUDENTS LIST                                */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Controls Bar: Search + Class Filter + Export */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full sm:w-auto">
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="بحث باسم الطالب، الرقم الوطني، أو اسم الأم..."
                className="w-full py-2.5 px-3.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {/* Actions: Export + Add Student */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  exportLibyanStudentsToExcel(filteredStudents, `كشف_طلاب_${schoolProfile.name}`);
                  sound.playSuccess();
                  showToast('success', 'تم التصدير', 'تم تنزيل ملف إكسل بكافة بيانات الطلبة.');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>تصدير Excel</span>
              </button>

              <button
                onClick={() => { setShowPdfImporterModal(true); sound.playTap(); }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>استيراد كشف PDF</span>
              </button>
            </div>
          </div>

          {/* Section Filter Pills */}
          {availableClasses.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-slate-500 shrink-0">الفصل:</span>
              <button
                onClick={() => { setSelectedClassFilter('all'); sound.playTap(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedClassFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                الكل ({students.length})
              </button>
              {availableClasses.map(cls => (
                <button
                  key={cls}
                  onClick={() => { setSelectedClassFilter(cls); sound.playTap(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    selectedClassFilter === cls
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  فصل ({cls})
                </button>
              ))}
            </div>
          )}

          {/* Students Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-black border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">اسم الطالب الرباعي</th>
                    <th className="py-3.5 px-4">الصف والفصل</th>
                    <th className="py-3.5 px-4">الرقم الوطني</th>
                    <th className="py-3.5 px-4">اسم الأم</th>
                    <th className="py-3.5 px-4">تاريخ الميلاد</th>
                    <th className="py-3.5 px-4">حالة الحضور</th>
                    <th className="py-3.5 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Users className="w-12 h-12 text-slate-300" />
                          <p className="text-sm font-bold">لم يتم العثور على أي طلاب مطابقين</p>
                          <button
                            onClick={() => { setShowPdfImporterModal(true); sound.playTap(); }}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition"
                          >
                            📄 اضغط هنا لاستيراد كشف الطلبة من PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, idx) => (
                      <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={st.avatar}
                              alt={st.name}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <span className="font-black text-slate-900 dark:text-white text-sm">
                              {st.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-black border border-blue-200 dark:border-blue-800">
                            {st.className || st.grade || 'غير محدد'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-slate-700 dark:text-slate-300">
                          {st.nationalNumber || st.nationalId || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {st.motherName || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {st.birthDate || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black inline-block ${
                            st.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : st.status === 'late'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                              : st.status === 'excused'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                          }`}>
                            {st.status === 'present' ? 'حاضر 🟢' : st.status === 'late' ? 'متأخر 🟡' : st.status === 'excused' ? 'إذن رسمي 🔵' : 'غائب 🔴'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteStudent(st.id, st.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="حذف الطالب من المنظومة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>عرض <strong>{filteredStudents.length}</strong> من أصل <strong>{students.length}</strong> طالب مسجل</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ قاعدة بيانات الطلاب محفوظة محلياً ومؤمنة</span>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TEACHERS MANAGEMENT & CONTROLS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'teachers' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Header Action Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                التحكم في المعلمين ورموز الدخول
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                يمكنك إضافة معلمين جدد، تعديل رموز الدخول والمواد، وتحديد الفصول لكل معلم
              </p>
            </div>

            <button
              onClick={() => { setTeacherToEdit(null); setShowTeacherModal(true); sound.playTap(); }}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة معلم جديد</span>
            </button>
          </div>

          {/* Teacher Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map(teacher => (
              <div
                key={teacher.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top: Avatar, Name, Subject */}
                  <div className="flex items-center gap-3">
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div>
                      <h4 className="font-black text-base text-slate-900 dark:text-white">
                        {teacher.name}
                      </h4>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-bold block mt-0.5">
                        مادة: {teacher.subject}
                      </span>
                    </div>
                  </div>

                  {/* Teacher Login Code Pill (Giant & Clear) */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block">
                        رمز الدخول للبوابة:
                      </span>
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                        {teacher.code}
                      </span>
                    </div>
                    <button
                      onClick={() => { setTeacherToEdit(teacher); setShowTeacherModal(true); sound.playTap(); }}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg shadow-sm transition active:scale-95"
                      title="تغيير وتخصيص رمز المعلم"
                    >
                      تعديل الرمز ✏️
                    </button>
                  </div>

                  {/* Phone & Assigned Classes */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>رقم الهاتف:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{teacher.phone || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">الفصول المسندة:</span>
                      <div className="flex flex-wrap gap-1">
                        {teacher.assignedClasses.map(cls => (
                          <span
                            key={cls}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-black border border-slate-200 dark:border-slate-700"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => { setTeacherToEdit(teacher); setShowTeacherModal(true); sound.playTap(); }}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل البيانات</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50"
                    title="حذف المعلم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FULL ATTENDANCE TRACKING                                          */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Attendance Action Bar */}
          <div className="p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black">
                سجل متابعة الحضور الشامل لجميع فصول المدرسة
              </h3>
              <p className="text-xs text-emerald-200 mt-1">
                حالة الحضور المسجلة لليوم: {presentCount} حاضر • {absentCount} غائب • {lateCount} متأخر • {excusedCount} إذن رسمي
              </p>
            </div>

            <button
              onClick={() => {
                markAllPresent();
                sound.playSuccess();
                showToast('gold', 'تم تحضير جميع الطلاب 🟢', 'تم اعتماد الحضور لكافة الطلاب في المدرسة بنجاح.');
              }}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm shadow-md transition active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>🟢 تحضير الجميع حاضر بلمسة واحدة</span>
            </button>
          </div>

          {/* 4 Attendance Status Summary Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">الحاضرون 🟢</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-200 mt-1 block font-mono">{presentCount}</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block">الغائبون 🔴</span>
              <span className="text-2xl font-black text-rose-700 dark:text-rose-200 mt-1 block font-mono">{absentCount}</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">المتأخرون 🟡</span>
              <span className="text-2xl font-black text-amber-700 dark:text-amber-200 mt-1 block font-mono">{lateCount}</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block">إذن رسمي 🔵</span>
              <span className="text-2xl font-black text-blue-700 dark:text-blue-200 mt-1 block font-mono">{excusedCount}</span>
            </div>
          </div>

          {/* Quick Class-by-Class Attendance List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
            <h4 className="font-black text-sm text-slate-900 dark:text-white">
              نسبة الحضور حسب الفصول الدراسية:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {availableClasses.map(cls => {
                const clsStudents = students.filter(s => s.className === cls);
                const clsPresent = clsStudents.filter(s => s.status === 'present').length;
                const clsRate = clsStudents.length > 0 ? Math.round((clsPresent / clsStudents.length) * 100) : 100;

                return (
                  <div
                    key={cls}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-800 dark:text-white">فصل ({cls})</span>
                      <span className="font-black text-sm font-mono text-emerald-600">{clsRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${clsRate}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{clsPresent} حاضر</span>
                      <span>إجمالي {clsStudents.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Teacher Manager Modal */}
      <TeacherManagerModal
        isOpen={showTeacherModal}
        onClose={() => { setShowTeacherModal(false); setTeacherToEdit(null); }}
        teacherToEdit={teacherToEdit}
      />

    </div>
  );
};
