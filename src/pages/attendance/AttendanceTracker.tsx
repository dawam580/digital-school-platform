import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AttendanceStatus } from '../../types';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Save,
  Check,
  Sparkles,
  Download,
  Users
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

export const AttendanceTracker: React.FC = () => {
  const { students, updateAttendance, markAllPresent, addNotification } = useSchool();
  
  const [selectedGrade, setSelectedGrade] = useState('الصف الخامس');
  const [selectedSection, setSelectedSection] = useState('أ');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Filter students
  const filteredStudents = students.filter(s => {
    return s.name.includes(searchQuery) || s.studentNumber.includes(searchQuery);
  });

  const handleStatusClick = (studentId: string, status: AttendanceStatus) => {
    updateAttendance(studentId, status);
  };

  const handleMarkAllPresent = () => {
    markAllPresent();
    triggerConfetti();
  };

  const handleSaveAttendance = () => {
    sound.playSuccess();
    setSavedSuccess(true);
    triggerConfetti();
    addNotification(
      'تم حفظ واعتماد الحضور اليومي',
      `تم رصد وتثبيت سجل الحضور والغياب لـ (${selectedGrade} - شعبة ${selectedSection}) وإرسال التنبيهات المباشرة لأولياء الأمور.`,
      'attendance'
    );
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  const handleExportCsv = () => {
    sound.playTap();
    const headers = 'اسم الطالب,الرقم المدرسي,الصف,الشعبة,الحالة,التاريخ\n';
    const rows = filteredStudents.map(s => `"${s.name.replace(/"/g, '""')}","${s.studentNumber}","${s.grade}","${selectedSection}","${s.status}","2026-09-01"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `سجل_حضور_${selectedGrade}_شعبة_${selectedSection}_2026-09-01.csv`;
    a.click();
  };

  // Status Counts
  const presentCount = filteredStudents.filter(s => s.status === 'present').length;
  const absentCount = filteredStudents.filter(s => s.status === 'unexcused').length;
  const lateCount = filteredStudents.filter(s => s.status === 'late').length;
  const excusedCount = filteredStudents.filter(s => s.status === 'excused').length;

  return (
    <div className="space-y-6 text-right animate-in fade-in pb-24 relative max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            تسجيل الحضور اليومي التفاعلي
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            رصد لحظي وسريع لحالات حضور وغياب طلاب الفصل مع إشعار أولياء الأمور
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200 shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>تحضير جماعي للكل (حاضر)</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 shadow-card flex items-center gap-1.5 transition-all"
            title="تصدير كملف Excel / CSV"
          >
            <Download className="w-4 h-4 text-[#00288e]" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-card flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">حاضرون</span>
          <span className="text-lg font-black text-emerald-600 font-tajawal">{presentCount} طالب</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-card flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">غائبون</span>
          <span className="text-lg font-black text-red-600 font-tajawal">{absentCount} طالب</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-card flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">متأخرون</span>
          <span className="text-lg font-black text-amber-600 font-tajawal">{lateCount} طالب</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-card flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">غياب بعذر</span>
          <span className="text-lg font-black text-blue-600 font-tajawal">{excusedCount} طالب</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="بحث بالاسم أو الرقم الأكاديمي..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pr-10 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>الصف:</span>
            <select
              value={selectedGrade}
              onChange={e => { setSelectedGrade(e.target.value); sound.playTap(); }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="الصف الرابع">الصف الرابع الابتدائي</option>
              <option value="الصف الخامس">الصف الخامس الابتدائي</option>
              <option value="الصف السادس">الصف السادس الابتدائي</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>الشعبة:</span>
            <select
              value={selectedSection}
              onChange={e => { setSelectedSection(e.target.value); sound.playTap(); }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="أ">شعبة (أ)</option>
              <option value="ب">شعبة (ب)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Student List */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-100 divide-y divide-slate-100 overflow-hidden">
        {filteredStudents.map((student, idx) => (
          <div
            key={student.id}
            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
          >
            {/* Student Info */}
            <div className="flex items-center gap-3.5">
              <span className="text-slate-400 font-mono text-xs w-4">{idx + 1}</span>
              <img
                src={student.avatar}
                alt={student.name}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
              />
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-slate-900">{student.name}</h3>
                <p className="text-xs text-slate-400 font-mono">الرقم: {student.studentNumber}</p>
              </div>
            </div>

            {/* 4 Circular Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
              
              {/* Present 🟢 */}
              <button
                type="button"
                onClick={() => handleStatusClick(student.id, 'present')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  student.status === 'present'
                    ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100 scale-105'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
                title="حاضر"
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  student.status === 'present' ? 'border-white bg-white/20' : 'border-emerald-500'
                }`}>
                  {student.status === 'present' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                </div>
                <span>حاضر</span>
              </button>

              {/* Absent 🔴 */}
              <button
                type="button"
                onClick={() => handleStatusClick(student.id, 'unexcused')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  student.status === 'unexcused'
                    ? 'bg-red-600 text-white shadow-md ring-4 ring-red-100 scale-105'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
                title="غائب"
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  student.status === 'unexcused' ? 'border-white bg-white/20' : 'border-red-500'
                }`}>
                  {student.status === 'unexcused' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                </div>
                <span>غائب</span>
              </button>

              {/* Late 🟡 */}
              <button
                type="button"
                onClick={() => handleStatusClick(student.id, 'late')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  student.status === 'late'
                    ? 'bg-amber-600 text-white shadow-md ring-4 ring-amber-100 scale-105'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
                title="متأخر"
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  student.status === 'late' ? 'border-white bg-white/20' : 'border-amber-500'
                }`}>
                  {student.status === 'late' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                </div>
                <span>متأخر</span>
              </button>

              {/* Excused 🔵 */}
              <button
                type="button"
                onClick={() => handleStatusClick(student.id, 'excused')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  student.status === 'excused'
                    ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100 scale-105'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
                title="غياب بعذر"
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  student.status === 'excused' ? 'border-white bg-white/20' : 'border-blue-500'
                }`}>
                  {student.status === 'excused' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                </div>
                <span>بعذر</span>
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* Floating Save Button at Bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4">
        <button
          onClick={handleSaveAttendance}
          className="w-full py-4 px-6 bg-[#00288e] hover:bg-[#002072] text-white font-bold text-base rounded-full shadow-2xl hover:shadow-soft-lg active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-white/20"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-300 animate-bounce" />
              <span>تم حفظ واعتماد الحضور بنجاح!</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>حفظ الحضور واعتماد السجل وإشعار أولياء الأمور</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
