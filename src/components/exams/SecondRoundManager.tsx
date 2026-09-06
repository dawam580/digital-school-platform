import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  RefreshCw,
  Award,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Student } from '../../types';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import {
  ExamStorageService,
  ExamSubject,
  ExamGradeRecord
} from '../../services/exams/examStorageService';
import {
  LibyanExamEngine,
  StudentFullExamReport
} from '../../services/exams/libyanExamEngine';

interface SecondRoundManagerProps {
  students: Student[];
  availableClasses: string[];
  showToast: (type: 'gold' | 'error' | 'info' | 'success', title: string, message: string) => void;
  onOpenReportCard: (student: Student, rank: number) => void;
}

export const SecondRoundManager: React.FC<SecondRoundManagerProps> = ({
  students,
  availableClasses,
  showToast,
  onOpenReportCard
}) => {
  const [subjects, setSubjects] = useState<ExamSubject[]>([]);
  const [gradeRecords, setGradeRecords] = useState<Map<string, ExamGradeRecord>>(new Map());
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load all subjects & grades
  const loadData = async () => {
    setIsLoading(true);
    try {
      const subs = await ExamStorageService.getSubjects();
      const allRecords = await ExamStorageService.getAllGradeRecords();
      setSubjects(subs);
      const map = new Map<string, ExamGradeRecord>();
      allRecords.forEach(r => map.set(r.id, r));
      setGradeRecords(map);
    } catch (err) {
      console.error('Error loading second round data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter students based on class selection
  const candidateStudents = useMemo(() => {
    if (selectedClassFilter === 'all') return students;
    return students.filter(s => (s.className || '').trim() === selectedClassFilter.trim());
  }, [students, selectedClassFilter]);

  // Compute reports for candidate students
  const allReports = useMemo(() => {
    return LibyanExamEngine.calculateClassRankings(candidateStudents, subjects, gradeRecords);
  }, [candidateStudents, subjects, gradeRecords]);

  // Filter ONLY students who have make-up exams or failed
  const secondRoundReports = useMemo(() => {
    return allReports.filter(r => r.status === 'makeup_exam' || r.status === 'passed_makeup');
  }, [allReports]);

  // Search filter
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return secondRoundReports;
    const q = searchQuery.toLowerCase().trim();
    return secondRoundReports.filter(r =>
      r.studentName.toLowerCase().includes(q) ||
      r.nationalNumber.includes(q) ||
      r.className.toLowerCase().includes(q)
    );
  }, [secondRoundReports, searchQuery]);

  // Handle Make-up exam score change (0-60)
  const handleMakeupScoreChange = async (
    studentId: string,
    subjectCode: string,
    scoreStr: string
  ) => {
    const student = students.find(s => s.id === studentId);
    const sub = subjects.find(s => s.code === subjectCode);
    if (!student || !sub) return;

    const val = scoreStr === '' ? undefined : Math.min(Math.max(0, parseInt(scoreStr, 10) || 0), sub.examMax || 60);
    const recordId = `${studentId}_${subjectCode}`;
    const existing = gradeRecords.get(recordId);

    const cw = existing ? existing.courseworkScore : 35;
    const ex = existing ? existing.examScore : 30;
    const isPassed = val !== undefined ? (cw + val >= (sub.minScore || 50)) : false;

    const updatedRecord: ExamGradeRecord = {
      id: recordId,
      studentId,
      studentNationalId: student.nationalNumber || student.nationalId || '—',
      studentName: student.name,
      className: student.className || '—',
      seatNumber: student.studentNumber,
      subjectCode,
      subjectName: sub.name,
      courseworkScore: cw,
      examScore: ex,
      makeupExamScore: val,
      totalScore: val !== undefined ? (cw + val) : (cw + ex),
      isPassed,
      isSecondRound: true,
      appreciation: val !== undefined ? LibyanExamEngine.getAppreciation(((cw + val) / (sub.maxScore || 100)) * 100) : 'ضعيف',
      updatedAt: new Date().toISOString(),
      updatedBy: 'منسق الامتحانات (الدور الثاني)'
    };

    setGradeRecords(prev => {
      const next = new Map(prev);
      next.set(recordId, updatedRecord);
      return next;
    });

    await ExamStorageService.saveGradeRecord(updatedRecord);

    if (isPassed) {
      sound.playSuccess();
      showToast('gold', 'اجتياز الدور الثاني بنجاح 🌟', `اجتاز الطالب (${student.name}) مادة (${sub.name}) بمجموع (${cw + (val || 0)} من 100).`);
    }
  };

  // Export second round roster
  const handleExportSecondRoundExcel = () => {
    sound.playTap();
    if (secondRoundReports.length === 0) {
      showToast('error', 'تنبيه', 'لا يوجد طلبة دور ثانٍ لتصدير الكشف.');
      return;
    }

    const headers = [
      'ت',
      'اسم الطالب الرباعي',
      'الفصل الدراسي',
      'رقم القيد',
      'رقم الجلوس',
      'المواد التي له فيها دور ثانٍ',
      'النتيجة الحالية'
    ];

    const rows = secondRoundReports.map((r, idx) => [
      String(idx + 1),
      `"${r.studentName}"`,
      `"${r.className}"`,
      r.nationalNumber,
      r.seatNumber,
      `"${r.failedSubjects.join(' • ')}"`,
      `"${r.statusLabel.replace(/[🟢🟡🔴🌟]/g, '').trim()}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `كشف_طلبة_الدور_الثاني_2026.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('gold', 'تم تصدير كشف الدور الثاني 📊', `تم استخراج بيانات (${secondRoundReports.length}) طالب دور ثانٍ.`);
  };

  return (
    <div className="space-y-6 font-cairo">
      {/* Top Banner & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  إدارة ورصد امتحانات الدور الثاني
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-black border border-amber-300 dark:border-amber-800">
                  {secondRoundReports.length} طالب مستحق
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                حصر آلي لكافة الطلاب الراسبين في (1 إلى 3 مواد) مع رصد فوري لامتحان الدور الثاني وتحديث النتيجة
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Filter by class */}
            <select
              value={selectedClassFilter}
              onChange={e => setSelectedClassFilter(e.target.value)}
              className="p-2.5 pr-3 pl-8 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs cursor-pointer focus:ring-2 focus:ring-amber-500 transition"
            >
              <option value="all">جميع الفصول الدراسية</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>
                  فصل: {cls}
                </option>
              ))}
            </select>

            {/* Export Button */}
            <button
              type="button"
              onClick={handleExportSecondRoundExcel}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير كشف الدور الثاني</span>
            </button>
          </div>
        </div>

        {/* Live Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، رقم القيد، أو الفصل في قائمة طلبة الدور الثاني..."
            className="w-full p-2.5 pr-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-bold"
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto text-2xl">
              🎉
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              لا يوجد طلبة دور ثانٍ في الفصول المحددة
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              جميع الطلاب المسجلين في هذا النطاق ناجحون ومنقولون إلى الصف التالي بنجاح.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200">
                <tr>
                  <th className="p-3.5 text-center font-black w-12">ت</th>
                  <th className="p-3.5 font-black min-w-[170px]">اسم الطالب الرباعي</th>
                  <th className="p-3.5 text-center font-black w-24">الفصل</th>
                  <th className="p-3.5 text-center font-black w-24">رقم الجلوس</th>
                  <th className="p-3.5 font-black min-w-[220px]">المواد والدرجات المطلوبة في الدور الثاني</th>
                  <th className="p-3.5 text-center font-black w-32">النتيجة الحالية</th>
                  <th className="p-3.5 text-center font-black w-20">الشهادة</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReports.map((report, idx) => {
                  const studentObj = candidateStudents.find(s => s.id === report.studentId);
                  const isPassedMakeup = report.status === 'passed_makeup';

                  return (
                    <tr
                      key={report.studentId}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                        isPassedMakeup ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                      }`}
                    >
                      <td className="p-3 text-center font-mono text-slate-400 font-bold">
                        {idx + 1}
                      </td>

                      <td className="p-3 font-black text-slate-900 dark:text-white">
                        {report.studentName}
                        <span className="block text-[10px] font-mono text-slate-400 font-normal">
                          قيد: {report.nationalNumber}
                        </span>
                      </td>

                      <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {report.className}
                      </td>

                      <td className="p-3 text-center font-mono font-black text-emerald-700 dark:text-emerald-400">
                        {report.seatNumber}
                      </td>

                      {/* Failed Subjects & Makeup Scores Inputs */}
                      <td className="p-3 space-y-2">
                        {report.results
                          .filter(r => !r.isPassed || r.isSecondRound)
                          .map(resItem => {
                            const subObj = subjects.find(s => s.code === resItem.subjectCode);
                            const rec = gradeRecords.get(`${report.studentId}_${resItem.subjectCode}`);
                            const currentMakeupScore = rec?.makeupExamScore ?? '';

                            return (
                              <div
                                key={resItem.subjectCode}
                                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                              >
                                <div className="truncate">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {resItem.subjectName}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block">
                                    أعمال سنة سابقة: ({resItem.courseworkScore} من 40)
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <label className="text-[10px] text-slate-500 font-bold">
                                    امتحان الدور الثاني (من 60):
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={60}
                                    value={currentMakeupScore}
                                    placeholder="0 - 60"
                                    onChange={e =>
                                      handleMakeupScoreChange(report.studentId, resItem.subjectCode, e.target.value)
                                    }
                                    className={`w-16 p-1.5 text-center font-mono font-black rounded-lg border text-xs focus:ring-2 focus:ring-amber-500 ${
                                      resItem.isPassed
                                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                                        : 'border-amber-300 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                                    }`}
                                  />
                                  {resItem.isPassed && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black inline-block ${
                          isPassedMakeup
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {report.statusLabel}
                        </span>
                      </td>

                      {/* Report card button */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => studentObj && onOpenReportCard(studentObj, report.rank)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                          title="عرض كشف الدرجات"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
