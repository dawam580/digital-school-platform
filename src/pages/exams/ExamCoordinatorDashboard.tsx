import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  Users,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  AlertTriangle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Student } from '../../types';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { LibyanExamEngine, StudentFullExamReport } from '../../services/exams/libyanExamEngine';
import { PrintableStudentGradeCard } from '../../components/exams/PrintableStudentGradeCard';
import { DirectorInviteModal } from '../../components/common/DirectorInviteModal';

export const ExamCoordinatorDashboard: React.FC = () => {
  const { schoolProfile, students, showToast } = useSchool();

  // Selected Class for Control Sheet
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.className) set.add(s.className.trim());
    });
    if (set.size === 0) {
      ['9/1 صباح', '9/2 صباح', '8/1 صباح', '7/1 صباح', '6/1 صباح'].forEach(c => set.add(c));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ar', { numeric: true }));
  }, [students]);

  const [selectedExamClass, setSelectedExamClass] = useState<string>('9/1 صباح');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterResult, setFilterResult] = useState<'all' | 'passed' | 'makeup'>('all');

  // Modal states
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<Student | null>(null);
  const [selectedStudentRank, setSelectedStudentRank] = useState<number>(1);
  const [showGradeCardModal, setShowGradeCardModal] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showRollCallModal, setShowRollCallModal] = useState<boolean>(false);

  // Filter students for current class
  const classStudents = useMemo(() => {
    const list = students.filter(s => s.className === selectedExamClass || (s.className && s.className.startsWith(selectedExamClass.split('/')[0])));
    return list.length > 0 ? list : students.slice(0, 35);
  }, [students, selectedExamClass]);

  // Compute Official Libyan Rankings & 1120 Scores
  const examReports: StudentFullExamReport[] = useMemo(() => {
    return LibyanExamEngine.calculateClassRankings(classStudents);
  }, [classStudents]);

  // Filtered reports
  // Filtered reports
  const filteredReports = useMemo(() => {
    return examReports.filter(r => {
      const matchSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nationalNumber.includes(searchQuery) ||
        (r.seatNumber && r.seatNumber.includes(searchQuery));

      const matchStatus =
        filterResult === 'all'
          ? true
          : filterResult === 'passed'
          ? (r.status === 'passed' || r.status === 'passed_honors')
          : r.status === 'makeup_exam';

      return matchSearch && matchStatus;
    });
  }, [examReports, searchQuery, filterResult]);

  // KPIs
  const totalClass = examReports.length;
  const passedCount = examReports.filter(r => r.status === 'passed' || r.status === 'passed_honors').length;
  const makeupCount = examReports.filter(r => r.status === 'makeup_exam').length;
  const passRate = totalClass > 0 ? Math.round((passedCount / totalClass) * 100) : 0;

  // Helper for subject score
  const getSubScore = (report: StudentFullExamReport, code: string) => {
    const it = report.results.find(res => res.subjectCode === code);
    return it ? it.totalScore : 0;
  };

  // Export Excel
  const handleExportControlExcel = () => {
    sound.playTap();
    const headers = [
      'الترتيب',
      'رقم الجلوس',
      'رقم القيد',
      'اسم التلميذ',
      'عربي (240)',
      'رياضيات (200)',
      'علوم (160)',
      'إنجليزي (160)',
      'إسلامية (120)',
      'تاريخ (80)',
      'جغرافيا (80)',
      'حاسوب (80)',
      'المجموع الكلي (1120)',
      'النسبة المئوية',
      'النتيجة والتقدير'
    ];

    const rows = examReports.map((r, i) => [
      i + 1,
      r.seatNumber || (1000 + i + 1),
      r.nationalNumber,
      `"${r.studentName}"`,
      getSubScore(r, 'ARB'),
      getSubScore(r, 'MATH'),
      getSubScore(r, 'SCI'),
      getSubScore(r, 'ENG'),
      getSubScore(r, 'ISL'),
      getSubScore(r, 'HIST'),
      getSubScore(r, 'GEOG'),
      getSubScore(r, 'COMP'),
      r.totalEarnedScore,
      `${r.percentage}%`,
      `"${r.generalAppreciation}"`
    ].join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `شيت_كنترول_${selectedExamClass}_${schoolProfile.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'تم تصدير شيت الكنترول 📊', `تم تصدير كشف درجات (${selectedExamClass}) بنجاح.`);
  };

  const certStatus = LibyanExamEngine.getCertificationStatus(selectedExamClass);
  const isApproved = certStatus.status === 'approved_by_admin';

  return (
    <div className="space-y-6 animate-in fade-in text-right font-cairo max-w-7xl mx-auto pb-16">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-900 via-purple-950 to-slate-900 text-white shadow-xl border border-amber-500/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-3xl border border-amber-400/40 shadow-inner shrink-0">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                  لجنة النظام والمراقبة (الكنترول المركزي)
                </span>
                <span className="text-xs text-amber-200/80">
                  لائحة الامتحانات رقم (1013) لسنة 2022م
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                بوابة منسق الامتحانات والتقويم: {schoolProfile.name}
              </h1>
              <p className="text-xs text-amber-100/70 mt-1 max-w-2xl">
                رصد أعمال السنة والامتحانات النهائية بمجموع (1120 درجة)، استخراج كشوفات المناداة وأرقام الجلوس، واعتماد وطباعة بطاقات الدرجات والشهادات A4.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <button
              type="button"
              onClick={handleExportControlExcel}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>

            <button
              type="button"
              onClick={() => { sound.playTap(); window.print(); }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs border border-white/30 transition flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الشيت A4</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRollCallModal(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5"
            >
              <span>📋 كشف المناداة والجلوس</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Exam Certification Banner */}
      <div className={`p-4 rounded-3xl border-2 flex flex-col sm:flex-row items-center justify-between gap-3 ${
        isApproved
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200'
          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{isApproved ? '🏛️' : '⏳'}</span>
          <div>
            <strong className="block text-sm font-black">
              {isApproved
                ? `✓ تم قفل واعتماد شيت درجات (${selectedExamClass}) رسمياً بختم الكنترول والوزارة 🔒`
                : `حالة شيت فصل (${selectedExamClass}): مسودة قيد الرصد الميداني والمراجعة`}
            </strong>
            <span className="text-xs opacity-80 block">
              {isApproved
                ? `معتمد برقم إقفال رسمي • معتمد بواسطة: ${certStatus.adminSign} بتاريخ ${certStatus.approvedAt}`
                : 'اضغط على زر الاعتماد بالأسفل لإقفال الكنترول وطباعة الشهادات المعتمدة.'}
            </span>
          </div>
        </div>

        {!isApproved && (
          <button
            type="button"
            onClick={() => {
              LibyanExamEngine.certifyAndLockGrades(selectedExamClass, schoolProfile.directorName);
              sound.playFanfare();
              triggerConfetti();
              showToast('gold', 'تم اعتماد النتيجة رسمياً 🏛️', `تم إقفال واعتماد شيت فصل (${selectedExamClass}) بنجاح.`);
            }}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 shrink-0"
          >
            <span>🏛️ اعتماد النتيجة وقفل الكنترول</span>
          </button>
        )}
      </div>

      {/* Class Selector & Key Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Class Picker */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-500 block">اختر الفصل الدراسي:</span>
          <select
            value={selectedExamClass}
            onChange={e => { setSelectedExamClass(e.target.value); sound.playTap(); }}
            className="w-full py-2.5 px-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-black text-purple-700 dark:text-purple-300 focus:outline-none"
          >
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>فصل ({cls})</option>
            ))}
          </select>
        </div>

        {/* Metric 1: Pass Rate */}
        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">نسبة النجاح العامة</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-200 font-mono mt-1 block">
            {passRate}%
          </span>
        </div>

        {/* Metric 2: Passed Count */}
        <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-center">
          <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block">الناجحون دور أول 🟢</span>
          <span className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-200 font-mono mt-1 block">
            {passedCount} طالب
          </span>
        </div>

        {/* Metric 3: Makeup Count */}
        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">الدور الثاني (رسوب مواد) 🟡</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-200 font-mono mt-1 block">
            {makeupCount} طالب
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، رقم القيد، أو رقم الجلوس..."
            className="w-full py-2 px-3.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterResult('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
              filterResult === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            الكل ({examReports.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterResult('passed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
              filterResult === 'passed'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            الناجحون ({passedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterResult('makeup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
              filterResult === 'makeup'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            الدور الثاني ({makeupCount})
          </button>
        </div>
      </div>

      {/* Central Control Sheet Table (1120 Scores) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs min-w-[1250px]">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-3 px-2 text-center whitespace-nowrap">الترتيب</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">رقم الجلوس</th>
                <th className="py-3 px-3 whitespace-nowrap">اسم التلميذ</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">عربي (240)</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">رياضيات (200)</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">علوم (160)</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">إنجليزي (160)</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">إسلامية (120)</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">تاريخ (80)</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">جغرافيا (80)</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">حاسوب (80)</th>
                <th className="py-3 px-2 text-center bg-purple-100 dark:bg-purple-950/60 font-black text-purple-900 dark:text-purple-200 whitespace-nowrap">
                  المجموع (1120)
                </th>
                <th className="py-3 px-2 text-center whitespace-nowrap">النسبة</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">النتيجة والتقدير</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">الشهادة A4</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    لا يوجد تلاميذ مطابقون في هذا الفصل
                  </td>
                </tr>
              ) : (
                filteredReports.map((r, idx) => {
                  const originalStudent = students.find(s => s.id === r.studentId) || students[0];

                  return (
                    <tr key={r.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-2 text-center font-mono whitespace-nowrap">
                        <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-[11px] ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-900 font-black ring-2 ring-amber-400'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-800'
                            : idx === 2
                            ? 'bg-amber-50 text-amber-800'
                            : 'text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-purple-700 dark:text-purple-300 font-black whitespace-nowrap">
                        {r.seatNumber}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-black text-slate-900 dark:text-white text-xs block whitespace-nowrap">
                          {r.studentName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          قيد: {r.nationalNumber || '-'}
                        </span>
                      </td>

                      {/* Subjects */}
                      <td className="py-3 px-2 text-center font-mono whitespace-nowrap">{getSubScore(r, 'ARB')}</td>
                      <td className="py-3 px-2 text-center font-mono whitespace-nowrap">{getSubScore(r, 'MATH')}</td>
                      <td className="py-3 px-2 text-center font-mono whitespace-nowrap">{getSubScore(r, 'SCI')}</td>
                      <td className="py-3 px-2 text-center font-mono whitespace-nowrap">{getSubScore(r, 'ENG')}</td>
                      <td className="py-3 px-2 text-center font-mono whitespace-nowrap">{getSubScore(r, 'ISL')}</td>
                      <td className="py-3 px-2 text-center font-mono whitespace-nowrap">{getSubScore(r, 'HIST')}</td>
                      <td className="py-3 px-2 text-center font-mono whitespace-nowrap">{getSubScore(r, 'GEOG')}</td>
                      <td className="py-3 px-2 text-center font-mono whitespace-nowrap">{getSubScore(r, 'COMP')}</td>

                      {/* Total */}
                      <td className="py-3 px-2 text-center font-mono font-black bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 whitespace-nowrap">
                        {r.totalEarnedScore}
                      </td>

                      {/* Percentage */}
                      <td className="py-3 px-2 text-center font-mono font-black text-slate-800 dark:text-white whitespace-nowrap">
                        {r.percentage}%
                      </td>

                      {/* Result */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-block whitespace-nowrap ${
                          r.status === 'passed' || r.status === 'passed_honors'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {r.status === 'passed' || r.status === 'passed_honors' ? `ناجح (${r.generalAppreciation})` : 'دور ثان (مواد رسوب)'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentForCard(originalStudent);
                            setSelectedStudentRank(idx + 1);
                            setShowGradeCardModal(true);
                            sound.playTap();
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 transition"
                          title="طباعة إخطار الدرجات والشهادة A4"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roll Call Sheet Modal */}
      {showRollCallModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md font-cairo">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-base">كشف المناداة وأرقام الجلوس: فصل ({selectedExamClass})</h3>
              <button
                type="button"
                onClick={() => setShowRollCallModal(false)}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                إغلاق
              </button>
            </div>

            <div className="space-y-2">
              {examReports.map((r, i) => (
                <div key={r.studentId} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-mono font-black flex items-center justify-center text-[10px]">
                      {i + 1}
                    </span>
                    <div>
                      <strong className="block text-slate-900 dark:text-white">{r.studentName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">قيد: {r.nationalNumber}</span>
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-black border border-purple-200">
                      رقم الجلوس: {r.seatNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="button"
                onClick={() => { sound.playTap(); window.print(); }}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-black text-xs"
              >
                طباعة كشف المناداة A4 🖨️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Card / Certificate Modal */}
      {selectedStudentForCard && (
        <PrintableStudentGradeCard
          isOpen={showGradeCardModal}
          onClose={() => { setShowGradeCardModal(false); setSelectedStudentForCard(null); }}
          student={selectedStudentForCard}
          rank={selectedStudentRank}
        />
      )}

      {/* Director Invite Modal */}
      <DirectorInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

    </div>
  );
};
