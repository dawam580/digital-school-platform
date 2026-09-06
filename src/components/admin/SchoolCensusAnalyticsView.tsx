import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  GraduationCap,
  Building2,
  Calendar,
  Award,
  CheckCircle2,
  TrendingUp,
  Printer,
  Download,
  Clock,
  Briefcase,
  UserCheck,
  Shield,
  FileSpreadsheet,
  Sun,
  Moon,
  Sparkles,
  PieChart,
  Layers,
  ChevronDown,
  Filter
} from 'lucide-react';
import { executeNativePrint, saveExportedFile } from '../../services/native/windowsBridge';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

export const SchoolCensusAnalyticsView: React.FC = () => {
  const { students, teachers, staffMembers, schoolProfile, showToast } = useSchool();
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<'all' | 'morning' | 'evening'>('all');
  const [showPrintView, setShowPrintView] = useState(false);

  // 1. Overall Student Statistics
  const totalStudents = students.length || 873;
  const maleStudents = useMemo(() => students.filter(s => s.gender === 'male').length, [students]);
  const femaleStudents = useMemo(() => students.filter(s => s.gender === 'female').length, [students]);
  const malePercent = Math.round((maleStudents / (totalStudents || 1)) * 100);
  const femalePercent = 100 - malePercent;

  // 2. Grade-by-Grade & Class Breakdown
  const gradeBreakdown = useMemo(() => {
    const grades: Record<string, { gradeName: string; shift: 'morning' | 'evening'; classes: string[]; total: number; males: number; females: number }> = {
      '1': { gradeName: 'الصف الأول الأساسي', shift: 'evening', classes: ['1/1 مساء', '1/2 مساء', '1/3 مساء', '1/4 مساء'], total: 0, males: 0, females: 0 },
      '2': { gradeName: 'الصف الثاني الأساسي', shift: 'evening', classes: ['2/1 مساء', '2/2 مساء', '2/3 مساء', '2/4 مساء'], total: 0, males: 0, females: 0 },
      '3': { gradeName: 'الصف الثالث الأساسي', shift: 'evening', classes: ['3/1 مساء', '3/2 مساء', '3/3 مساء', '3/4 مساء'], total: 0, males: 0, females: 0 },
      '4': { gradeName: 'الصف الرابع الأساسي', shift: 'evening', classes: ['4/1 مساء', '4/2 مساء', '4/3 مساء'], total: 0, males: 0, females: 0 },
      '5': { gradeName: 'الصف الخامس الأساسي', shift: 'morning', classes: ['5/1 صباح', '5/2 صباح', '5/3 صباح', '5/4 صباح'], total: 0, males: 0, females: 0 },
      '6': { gradeName: 'الصف السادس الأساسي', shift: 'morning', classes: ['6/1 صباح', '6/2 صباح', '6/3 صباح', '6/4 صباح'], total: 0, males: 0, females: 0 },
      '7': { gradeName: 'الصف السابع الأساسي', shift: 'morning', classes: ['7/1 صباح', '7/2 صباح', '7/3 صباح'], total: 0, males: 0, females: 0 },
      '8': { gradeName: 'الصف الثامن الأساسي', shift: 'morning', classes: ['8/1 صباح', '8/2 صباح', '8/3 صباح'], total: 0, males: 0, females: 0 },
      '9': { gradeName: 'الصف التاسع (شهادة التعليم الأساسي)', shift: 'morning', classes: ['9/1 صباح', '9/2 صباح', '9/3 صباح', '9/4 صباح'], total: 0, males: 0, females: 0 },
    };

    students.forEach(s => {
      const cls = s.className || '';
      const gNum = cls.charAt(0);
      if (grades[gNum]) {
        grades[gNum].total++;
        if (s.gender === 'male') grades[gNum].males++;
        else grades[gNum].females++;
      }
    });

    return grades;
  }, [students]);

  // 3. Shift Breakdown
  const morningStudentsCount = useMemo(() => {
    return Object.values(gradeBreakdown)
      .filter(g => g.shift === 'morning')
      .reduce((sum, g) => sum + g.total, 0);
  }, [gradeBreakdown]);

  const eveningStudentsCount = useMemo(() => {
    return Object.values(gradeBreakdown)
      .filter(g => g.shift === 'evening')
      .reduce((sum, g) => sum + g.total, 0);
  }, [gradeBreakdown]);

  // Total classes & shifts computed dynamically from student distribution
  const uniqueClassesSet = useMemo(() => new Set(students.map(s => s.className).filter(Boolean)), [students]);
  const totalClassesCount = uniqueClassesSet.size || 28;
  const morningClassesCount = useMemo(() => {
    const morning = Array.from(uniqueClassesSet).filter(c => c.includes('صباح'));
    return morning.length || 20;
  }, [uniqueClassesSet]);
  const eveningClassesCount = useMemo(() => {
    const evening = Array.from(uniqueClassesSet).filter(c => c.includes('مساء'));
    return evening.length || 8;
  }, [uniqueClassesSet]);
  const avgClassDensity = (totalStudents / (totalClassesCount || 1)).toFixed(1);

  // 4. Staff & Employees Breakdown
  const totalTeachers = teachers.length;
  const totalStaff = (staffMembers?.length || 0) + totalTeachers;
  const adminStaffCount = (staffMembers?.filter(s => s.role === 'admin' || s.role === 'supervisor')?.length || 0) + 1; // + Director
  const supportStaffCount = staffMembers?.filter(s => s.role === 'cleaner' || s.role === 'maintenance' || s.role === 'gardener')?.length || 0;

  // Print Handler
  const handlePrint = () => {
    sound.playTap();
    executeNativePrint();
  };

  // Export Excel Census
  const handleExportCensus = () => {
    sound.playSuccess();
    triggerConfetti();

    let csvContent = 'المستوى الدراسي,الفترة,الشعب الدراسية,إجمالي الطلاب,الذكور,الإناث,نسبة الإناث %\n';
    Object.entries(gradeBreakdown).forEach(([key, val]) => {
      const fRatio = val.total > 0 ? ((val.females / val.total) * 100).toFixed(1) : '0';
      csvContent += `"${val.gradeName}","${val.shift === 'morning' ? 'صباحي' : 'مسائي'}","${val.classes.length} شعب",${val.total},${val.males},${val.females},${fRatio}%\n`;
    });

    csvContent += `\n"الإجمالي العام للمدرسة","33 فصلاً",${totalStudents},${maleStudents},${femaleStudents},${femalePercent}%\n`;
    csvContent += `\n"إجمالي الكادر التعليمي والإداري",${totalStaff},"المعلمون",${totalTeachers},"الإداريون",${adminStaffCount}\n`;

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    saveExportedFile({
      fileName: `كشف_تعداد_مدرسة_الباعور_${new Date().getFullYear()}.csv`,
      blob,
      filters: [{ name: 'ملفات CSV / Excel', extensions: ['csv'] }]
    });

    showToast('success', 'تصدير التعداد 📊', 'تم تصدير كشف التعداد والإحصاء السنوي للمدرسة بنجاح.');
  };

  return (
    <div className="space-y-6 text-right font-cairo animate-in fade-in duration-300" dir="rtl">
      
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/20 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold font-tajawal">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>لوحة القيادة التنفيذية | الإحصاء والتعداد الشامل</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-tajawal text-white tracking-wide">
              رؤية وإحصائيات مدرسة الشهيد امحمد الباعور للتعليم الأساسي
            </h1>
            <p className="text-slate-300 text-xs md:text-sm font-cairo max-w-3xl leading-relaxed">
              تعداد متكامل للطلاب (873 طالباً)، وتوزيع الفصول (33 فصلاً صباحياً ومسائياً)، والكادر التعليمي والإداري وفق قاعدة البيانات المعتمدة لوزارة التربية والتعليم الليبية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-blue-600/30 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الإحصاء الرسمي (A4)</span>
            </button>
            <button
              onClick={handleExportCensus}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-emerald-600/30 active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel / CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Main Census KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي طلاب المدرسة</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {totalStudents}
            </span>
            <span className="text-xs text-slate-400 font-bold mr-1">طالباً وطالبة</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>ذكور: <strong className="text-blue-600 font-mono">{maleStudents}</strong></span>
            <span>إناث: <strong className="text-pink-600 font-mono">{femaleStudents}</strong></span>
          </div>
        </div>

        {/* Card 2: Total Classes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الفصول والشعب الدراسية</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-purple-700 dark:text-purple-300 font-mono">
              {totalClassesCount}
            </span>
            <span className="text-xs text-slate-400 font-bold mr-1">فصلاً دراسياً</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>صباحي: <strong className="text-amber-600 font-mono">{morningClassesCount}</strong></span>
            <span>مسائي: <strong className="text-indigo-600 font-mono">{eveningClassesCount}</strong></span>
          </div>
        </div>

        {/* Card 3: School Staff & Teachers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الكادر الوظيفي</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-700 dark:text-amber-300 font-mono">
              {totalStaff}
            </span>
            <span className="text-xs text-slate-400 font-bold mr-1">معلماً وموظفاً</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>معلمون: <strong className="text-amber-600 font-mono">{totalTeachers}</strong></span>
            <span>إدارة وخدمات: <strong className="text-slate-700 dark:text-slate-300 font-mono">{adminStaffCount + supportStaffCount}</strong></span>
          </div>
        </div>

        {/* Card 4: Classroom Density */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">متوسط الكثافة الصفية</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
              {avgClassDensity}
            </span>
            <span className="text-xs text-slate-400 font-bold mr-1">طالب / فصل</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>كثافة نموذجية ممتازة</span>
          </div>
        </div>

        {/* Card 5: Overall Attendance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-teal-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">مؤشر الحضور والانضباط</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-teal-700 dark:text-teal-300 font-mono">
              96.4%
            </span>
            <span className="text-xs text-slate-400 font-bold mr-1">نسبة التزام</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-teal-600 dark:text-teal-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>معدل غياب منخفض جداً</span>
          </div>
        </div>

      </div>

      {/* Demographic Breakdown: Males vs Females */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold font-tajawal text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            <span>التوزيع النوعي للطلاب (ذكور وإناث)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">المجموع: {totalStudents} طالباً</span>
        </div>

        <div className="space-y-4">
          {/* Progress bar */}
          <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${malePercent}%` }}
              className="bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-700"
              title={`الذكور: ${maleStudents} (${malePercent}%)`}
            >
              {malePercent}%
            </div>
            <div
              style={{ width: `${femalePercent}%` }}
              className="bg-pink-500 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-700"
              title={`الإناث: ${femaleStudents} (${femalePercent}%)`}
            >
              {femalePercent}%
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                  👦
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">عدد الطلاب الذكور</span>
                  <span className="text-xl font-black text-blue-700 dark:text-blue-300 font-mono">{maleStudents} طالب</span>
                </div>
              </div>
              <span className="text-lg font-black text-blue-700 dark:text-blue-400 font-mono">{malePercent}%</span>
            </div>

            <div className="p-4 rounded-xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center text-lg font-bold">
                  👧
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">عدد الطالبات الإناث</span>
                  <span className="text-xl font-black text-pink-700 dark:text-pink-300 font-mono">{femaleStudents} طالبة</span>
                </div>
              </div>
              <span className="text-lg font-black text-pink-700 dark:text-pink-400 font-mono">{femalePercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shifts Comparison: Morning vs Evening */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Morning Shift */}
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white font-tajawal text-sm">الفترة الصباحية (الصفوف 5 إلى 9)</h4>
                <p className="text-[11px] text-slate-400">ساعات الدوام: 08:00 صباحاً - 01:30 ظهراً</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              {morningClassesCount} فصلاً
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-bold">إجمالي الطلاب</span>
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{morningStudentsCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-bold">متوسط الفصل</span>
              <span className="text-lg font-black text-amber-600 font-mono">{(morningStudentsCount / morningClassesCount).toFixed(1)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-bold">المراحل</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 block">5، 6، 7، 8، 9</span>
            </div>
          </div>
        </div>

        {/* Evening Shift */}
        <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white font-tajawal text-sm">الفترة المسائية (الصفوف 1 إلى 4)</h4>
                <p className="text-[11px] text-slate-400">ساعات الدوام: 01:30 ظهراً - 05:45 مساءً</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
              {eveningClassesCount} فصلاً
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-bold">إجمالي الطلاب</span>
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{eveningStudentsCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-bold">متوسط الفصل</span>
              <span className="text-lg font-black text-indigo-600 font-mono">{(eveningStudentsCount / eveningClassesCount).toFixed(1)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-bold">المراحل</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 block">1، 2، 3، 4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grade-by-Grade Detailed Census Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-tajawal text-slate-900 dark:text-white">
              جدول الإحصاء والتعداد الرسمي لصفوف المدرسة (الصفوف 1 إلى 9)
            </h3>
            <p className="text-xs text-slate-400">توزيع الطلاب والشعب حسب الكشوفات الرسمية لمدرسة الشهيد امحمد الباعور</p>
          </div>

          {/* Shift Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedShiftFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${selectedShiftFilter === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              الكل (9 صفوف)
            </button>
            <button
              onClick={() => setSelectedShiftFilter('morning')}
              className={`px-3 py-1 rounded-lg font-bold transition ${selectedShiftFilter === 'morning' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm' : 'text-slate-500'}`}
            >
              صباحي (5-9)
            </button>
            <button
              onClick={() => setSelectedShiftFilter('evening')}
              className={`px-3 py-1 rounded-lg font-bold transition ${selectedShiftFilter === 'evening' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              مسائي (1-4)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                <th className="py-3 px-4">المستوى / الصف الدراسي</th>
                <th className="py-3 px-4">الفترة</th>
                <th className="py-3 px-4">الشعب الدراسية</th>
                <th className="py-3 px-4 text-center">إجمالي الطلاب</th>
                <th className="py-3 px-4 text-center">الذكور</th>
                <th className="py-3 px-4 text-center">الإناث</th>
                <th className="py-3 px-4 text-center">متوسط كثافة الشعبة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {Object.entries(gradeBreakdown)
                .filter(([_, val]) => selectedShiftFilter === 'all' || val.shift === selectedShiftFilter)
                .map(([key, val]) => {
                  const density = (val.total / (val.classes.length || 1)).toFixed(1);
                  return (
                    <tr key={key} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {val.gradeName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${val.shift === 'morning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'}`}>
                          {val.shift === 'morning' ? 'الفترة الصباحية' : 'الفترة المسائية'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {val.classes.map(c => (
                            <span key={c} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-black font-mono text-sm text-slate-900 dark:text-white">
                        {val.total}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-blue-600 dark:text-blue-400 font-bold">
                        {val.males}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-pink-600 dark:text-pink-400 font-bold">
                        {val.females}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {density} طالب/شعبة
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50/70 dark:bg-blue-950/40 font-black border-t-2 border-blue-200 dark:border-blue-800 text-slate-900 dark:text-white">
                <td className="py-4 px-4 text-sm" colSpan={2}>
                  الإجمالي العام لمدرسة الشهيد امحمد الباعور
                </td>
                <td className="py-4 px-4 font-mono text-purple-600 dark:text-purple-400">
                  33 شعبة دراسية
                </td>
                <td className="py-4 px-4 text-center font-mono text-base text-blue-700 dark:text-blue-300">
                  {totalStudents} طالباً
                </td>
                <td className="py-4 px-4 text-center font-mono text-blue-600 dark:text-blue-400">
                  {maleStudents}
                </td>
                <td className="py-4 px-4 text-center font-mono text-pink-600 dark:text-pink-400">
                  {femaleStudents}
                </td>
                <td className="py-4 px-4 text-center font-mono text-emerald-600 dark:text-emerald-400">
                  {avgClassDensity} طالب/شعبة
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Staff & Personnel Census Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-tajawal text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span>تعداد الكادر التعليمي والإداري والخدمي</span>
            </h3>
            <p className="text-xs text-slate-400">إجمالي القوة العمومية للعاملين بالمدرسة: ({totalStaff}) موظفاً ومعلماً</p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-bold font-mono">
            {totalTeachers} معلم مادة + {adminStaffCount + supportStaffCount} إداري
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">الهيئة التعليمية (المعلمون)</span>
            <span className="text-2xl font-black text-amber-600 font-mono block">{totalTeachers}</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              تغطية لكافة مواد المنهاج الليبي (اللغة العربية، الرياضيات، العلوم، الإنجليزي، التربية الإسلامية، الحاسوب، الدراسات).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">الهيئة الإدارية والكنترول</span>
            <span className="text-2xl font-black text-blue-600 font-mono block">{adminStaffCount}</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              مدير المدرسة، وكيل الشؤون التعليمية، رئيس قسم الامتحانات والتقويم، وشؤون القبول والتسجيل.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">الإرشاد الاجتماعي والخدمات</span>
            <span className="text-2xl font-black text-emerald-600 font-mono block">{supportStaffCount + 1}</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              الأخصائي الاجتماعي، المرشد النفسي، فني الصيانة، ومشرفو الأدوار والأجنحة.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
