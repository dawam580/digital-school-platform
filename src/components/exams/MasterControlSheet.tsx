import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Lock,
  Unlock,
  Printer,
  Search,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Share2,
  ShieldCheck,
  ChevronDown,
  Info
} from 'lucide-react';
import { Student } from '../../types';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { SecurityPinConfirmModal } from '../common/SecurityPinConfirmModal';
import {
  ExamStorageService,
  ExamSubject,
  ExamGradeRecord,
  ExamLock
} from '../../services/exams/examStorageService';
import {
  LibyanExamEngine,
  StudentFullExamReport
} from '../../services/exams/libyanExamEngine';

interface MasterControlSheetProps {
  students: Student[];
  availableClasses: string[];
  selectedClass: string;
  onSelectClass: (className: string) => void;
  onOpenReportCard: (student: Student, rank: number) => void;
  onOpenGoldenCertificate: (student: Student, report: StudentFullExamReport) => void;
  showToast: (type: 'gold' | 'error' | 'info' | 'success', title: string, message: string) => void;
  addNotification?: (title: string, message: string, category: 'admin' | 'attendance' | 'academic' | 'urgent', studentName?: string) => void;
}

export const MasterControlSheet: React.FC<MasterControlSheetProps> = ({
  students,
  availableClasses,
  selectedClass,
  onSelectClass,
  onOpenReportCard,
  onOpenGoldenCertificate,
  showToast,
  addNotification
}) => {
  const [subjects, setSubjects] = useState<ExamSubject[]>([]);
  const [gradeRecords, setGradeRecords] = useState<Map<string, ExamGradeRecord>>(new Map());
  const [examLock, setExamLock] = useState<ExamLock | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'both' | 'total_only'>('both');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter students belonging to the selected class
  const classStudents = useMemo(() => {
    return students.filter(s => (s.className || '').trim() === selectedClass.trim());
  }, [students, selectedClass]);

  // Load subjects, grades, and lock status
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const subs = await ExamStorageService.getSubjects();
        const records = await ExamStorageService.getGradeRecordsForClass(selectedClass);
        const lock = await ExamStorageService.getExamLock(selectedClass);

        if (isMounted) {
          setSubjects(subs);
          const map = new Map<string, ExamGradeRecord>();
          records.forEach(r => map.set(r.id, r));
          setGradeRecords(map);
          setExamLock(lock);
        }
      } catch (err) {
        console.error('Error loading exam control data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [selectedClass]);

  // Calculate full rankings and reports
  const examReports = useMemo(() => {
    return LibyanExamEngine.calculateClassRankings(classStudents, subjects, gradeRecords);
  }, [classStudents, subjects, gradeRecords]);

  // Search filtered reports
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return examReports;
    const q = searchQuery.toLowerCase().trim();
    return examReports.filter(r =>
      r.studentName.toLowerCase().includes(q) ||
      r.nationalNumber.includes(q) ||
      r.seatNumber.includes(q)
    );
  }, [examReports, searchQuery]);

  // KPIs
  const totalCount = examReports.length;
  const passedCount = examReports.filter(r => r.status === 'passed' || r.status === 'passed_honors' || r.status === 'passed_makeup').length;
  const makeupCount = examReports.filter(r => r.status === 'makeup_exam').length;
  const failedCount = examReports.filter(r => r.status === 'failed').length;
  const passPercentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  const topStudent = examReports.length > 0 ? examReports[0] : null;

  // Handle live grade change
  const handleScoreChange = async (
    student: Student,
    subject: ExamSubject,
    field: 'coursework' | 'exam',
    valueStr: string
  ) => {
    if (examLock?.isLocked) {
      showToast('error', 'الكنترول مقفل 🔒', 'تم قفل واعتماد نتائج هذا الفصل رسمياً. قم بإلغاء القفل أولاً لتعديل الدرجات.');
      return;
    }

    const val = valueStr === '' ? 0 : Math.max(0, parseInt(valueStr, 10) || 0);
    const courseworkMax = subject.courseworkMax || 40;
    const examMax = subject.examMax || 60;

    const recordId = `${student.id}_${subject.code}`;
    const existing = gradeRecords.get(recordId);

    let courseworkScore = existing ? existing.courseworkScore : 35;
    let examScore = existing ? existing.examScore : 50;

    if (field === 'coursework') {
      courseworkScore = Math.min(val, courseworkMax);
    } else {
      examScore = Math.min(val, examMax);
    }

    const totalScore = courseworkScore + examScore;
    const isPassed = totalScore >= (subject.minScore || 50);

    const updatedRecord: ExamGradeRecord = {
      id: recordId,
      studentId: student.id,
      studentNationalId: student.nationalNumber || student.nationalId || '—',
      studentName: student.name,
      className: selectedClass,
      seatNumber: student.studentNumber,
      subjectCode: subject.code,
      subjectName: subject.name,
      courseworkScore,
      examScore,
      totalScore,
      isPassed,
      isSecondRound: !isPassed,
      appreciation: LibyanExamEngine.getAppreciation((totalScore / (subject.maxScore || 100)) * 100),
      updatedAt: new Date().toISOString(),
      updatedBy: 'منسق الامتحانات'
    };

    setGradeRecords(prev => {
      const next = new Map(prev);
      next.set(recordId, updatedRecord);
      return next;
    });

    await ExamStorageService.saveGradeRecord(updatedRecord);
  };

  // Keyboard navigation on grid
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colKey: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = document.querySelector<HTMLInputElement>(`input[data-row="${rowIndex + 1}"][data-col="${colKey}"]`);
      if (nextInput) nextInput.focus();
    }
  };

  const [showLockPinModal, setShowLockPinModal] = useState(false);
  // وضع مودال الرمز: قفل/فتح الشيت أم نشر/سحب النتائج (النشر قرار رسمي يستلزم الرمز أيضاً)
  const [lockModalMode, setLockModalMode] = useState<'lock' | 'release'>('lock');

  // Lock / Unlock control trigger
  const handleToggleLock = () => {
    sound.playTap();
    setLockModalMode('lock');
    setShowLockPinModal(true);
  };

  // Execute after PIN verification
  const executeToggleLock = async () => {
    if (!examLock) return;

    const newLockState = !examLock.isLocked;
    const updatedLock: ExamLock = {
      ...examLock,
      isLocked: newLockState,
      lockedBy: newLockState ? 'أ. منسق الامتحانات والمدير' : undefined,
      lockedAt: newLockState ? new Date().toLocaleString('ar-LY') : undefined
    };

    setExamLock(updatedLock);
    await ExamStorageService.saveExamLock(updatedLock);

    if (newLockState) {
      sound.playSuccess();
      showToast('gold', 'تم اعتماد وقفل الكنترول 🔒', `تم قفل درجات فصل (${selectedClass}) بنجاح وتوثيق المحضر برمز الأمان.`);
      addNotification?.(
        `🔒 اعتماد شيت الكنترول لفصل ${selectedClass}`,
        `تم إقفال رصد الدرجات للفصل وتثبيت النتائج الرسمية بعد التحقق من رمز الأمان.`,
        'admin'
      );
    } else {
      showToast('info', 'تم إلغاء القفل 🔓', `شيت درجات فصل (${selectedClass}) مفتوح الآن للتعديل.`);
    }
  };

  // Release results to parents (PIN-gated + audited — قرار نشر رسمي)
  const handleToggleReleaseToParents = () => {
    if (!examLock) return;
    sound.playTap();
    setLockModalMode('release');
    setShowLockPinModal(true);
  };

  const executeToggleRelease = async () => {
    if (!examLock) return;

    const newReleaseState = !examLock.isReleasedToParents;
    // الأصول الليبية: لا نشر قبل الاعتماد والقفل
    if (newReleaseState && !examLock.isLocked) {
      sound.playAlert();
      showToast('error', 'اعتمد الشيت أولاً 🔒', 'لا تُنشر النتائج قبل اعتماد وقفل شيت الكنترول رسمياً.');
      return;
    }

    const updatedLock: ExamLock = {
      ...examLock,
      isReleasedToParents: newReleaseState,
      releasedAt: newReleaseState ? new Date().toLocaleString('ar-LY') : undefined
    };

    setExamLock(updatedLock);
    await ExamStorageService.saveExamLock(updatedLock);

    if (newReleaseState) {
      sound.playFanfare();
      triggerConfetti();
      showToast('gold', 'تم نشر النتائج لأولياء الأمور 📢', `أصبحت شهادات وكشوفات درجات فصل (${selectedClass}) مرئية الآن لجميع أولياء الأمور.`);
      addNotification?.(
        `📢 إعلان نتائج الامتحانات لفصل ${selectedClass}`,
        `أولياء الأمور الكرام: تم اعتماد ونشر نتائج الامتحانات وكشوفات الدرجات رسمياً.`,
        'academic'
      );
    } else {
      showToast('info', 'تم حجب النتائج 🔒', `تم حجب شهادات درجات فصل (${selectedClass}) عن أولياء الأمور.`);
    }
  };

  // Export Master Control Sheet to CSV / Excel
  const handleExportExcel = () => {
    sound.playTap();
    if (examReports.length === 0) {
      showToast('error', 'تنبيه', 'لا يوجد طلاب مسجلين في هذا الفصل لتصدير درجاتهم.');
      return;
    }

    const headers = [
      'ت',
      'رقم الجلوس',
      'رقم القيد',
      'الاسم الكامل',
      'الصف والفصل',
      ...subjects.flatMap(s => [`${s.name} (أعمال)`, `${s.name} (نهائي)`, `${s.name} (المجموع)`]),
      'المجموع الكلي (من 800)',
      'النسبة المئوية %',
      'الترتيب على الفصل',
      'التقدير العام',
      'النتيجة الرسمية',
      'المواد الراسبة'
    ];

    const rows = examReports.map((rep, idx) => {
      const subjectCols = subjects.flatMap(s => {
        const item = rep.results.find(res => res.subjectCode === s.code);
        return [
          item ? String(item.courseworkScore) : '0',
          item ? String(item.examScore) : '0',
          item ? String(item.totalScore) : '0'
        ];
      });

      return [
        String(idx + 1),
        rep.seatNumber,
        rep.nationalNumber,
        `"${rep.studentName}"`,
        `"${rep.className}"`,
        ...subjectCols,
        String(rep.totalEarnedScore),
        `${rep.percentage}%`,
        String(rep.rank),
        rep.generalAppreciation,
        `"${rep.statusLabel.replace(/[🟢🟡🔴🌟]/g, '').trim()}"`,
        `"${rep.failedSubjects.join(' - ') || 'لا يوجد'}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `شيت_كنترول_فصل_${selectedClass.replace(/[\/\s]/g, '_')}_2026.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('gold', 'تم تصدير شيت الكنترول 📊', `تم تصدير درجات فصل (${selectedClass}) كاملاً بصيغة إكسل بنجاح.`);
  };

  // Import Excel / CSV grades
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playTap();
    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          showToast('error', 'خطأ في الملف', 'الملف لا يحتوي على بيانات كافية.');
          return;
        }

        const newRecords: ExamGradeRecord[] = [];
        // Match students by name or national number
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length < 4) continue;

          const studentName = cols[3];
          const st = classStudents.find(s => s.name.trim() === studentName || s.nationalNumber === cols[2]);
          if (!st) continue;

          // Parse subject scores if present
          let colIdx = 5;
          for (const sub of subjects) {
            if (colIdx + 1 < cols.length) {
              const cw = Math.min(Math.max(0, parseInt(cols[colIdx], 10) || 0), sub.courseworkMax || 40);
              const ex = Math.min(Math.max(0, parseInt(cols[colIdx + 1], 10) || 0), sub.examMax || 60);
              const tot = cw + ex;
              const isPassed = tot >= (sub.minScore || 50);

              newRecords.push({
                id: `${st.id}_${sub.code}`,
                studentId: st.id,
                studentNationalId: st.nationalNumber || st.nationalId || '—',
                studentName: st.name,
                className: selectedClass,
                seatNumber: st.studentNumber,
                subjectCode: sub.code,
                subjectName: sub.name,
                courseworkScore: cw,
                examScore: ex,
                totalScore: tot,
                isPassed,
                isSecondRound: !isPassed,
                appreciation: LibyanExamEngine.getAppreciation((tot / (sub.maxScore || 100)) * 100),
                updatedAt: new Date().toISOString(),
                updatedBy: 'استيراد إكسل'
              });
            }
            colIdx += 3;
          }
        }

        if (newRecords.length > 0) {
          await ExamStorageService.saveGradeRecordsBatch(newRecords);
          setGradeRecords(prev => {
            const next = new Map(prev);
            newRecords.forEach(r => next.set(r.id, r));
            return next;
          });
          sound.playFanfare();
          triggerConfetti();
          showToast('gold', 'تم استيراد الدرجات بنجاح 📥', `تم تحديث (${newRecords.length}) رصد مادة لطلاب فصل (${selectedClass}).`);
        } else {
          showToast('error', 'تنبيه', 'لم يتم العثور على أسماء طلاب مطابقة في الملف المرفوع.');
        }
      } catch (err: any) {
        showToast('error', 'خطأ في معالجة الملف', err.message || 'تعذر قراءة ملف الإكسل.');
      }
    };
    reader.readAsText(file, 'utf-8');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 font-cairo">
      {/* Top Header & Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  شيت الكنترول المجمع لرصد الدرجات والامتحانات
                </h2>
                {examLock?.isLocked ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-black border border-rose-300 dark:border-rose-800">
                    <Lock className="w-3 h-3" />
                    <span>معتمد ومقفل</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-800">
                    <Unlock className="w-3 h-3" />
                    <span>مفتوح للرصد</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                نظام ليبي موحد: أعمال سنة (40) + امتحان نهائي (60) = المجموع (100) • النهاية الصغرى 50
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Class Selector Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedClass}
                onChange={e => onSelectClass(e.target.value)}
                className="w-full sm:w-44 p-2.5 pr-3 pl-8 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs cursor-pointer focus:ring-2 focus:ring-emerald-500 transition"
              >
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>
                    فصل: {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('both')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  viewMode === 'both'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                تفصيل (40 + 60)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('total_only')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  viewMode === 'total_only'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                المجموع (100) فقط
              </button>
            </div>

            {/* Export Excel Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="تصدير شيت درجات الفصل إلى ملف Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>

            {/* Import Excel Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="رفع ملف إكسل معبأ بالدرجات"
            >
              <Upload className="w-4 h-4" />
              <span>استيراد Excel</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleImportExcel}
            />

            {/* Lock / Unlock Button */}
            <button
              type="button"
              onClick={handleToggleLock}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
                examLock?.isLocked
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {examLock?.isLocked ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>إلغاء القفل والتعديل</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>اعتماد وقفل النتيجة</span>
                </>
              )}
            </button>

            {/* Publish to Parents Button */}
            <button
              type="button"
              onClick={handleToggleReleaseToParents}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
                examLock?.isReleasedToParents
                  ? 'bg-purple-700 hover:bg-purple-800 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              title="تمكين أولياء الأمور من رؤية الشهادات والنتائج في حساباتهم"
            >
              <Share2 className="w-4 h-4" />
              <span>{examLock?.isReleasedToParents ? 'النتائج معلنة لأولياء الأمور ✓' : 'نشر النتائج لأولياء الأمور 📢'}</span>
            </button>
          </div>
        </div>

        {/* Search & KPIs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">إجمالي طلاب الفصل</span>
            <span className="text-xl font-black text-emerald-800 dark:text-emerald-300 font-mono">{totalCount} طالب</span>
          </div>

          <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">نسبة النجاح العامة</span>
            <span className="text-xl font-black text-teal-800 dark:text-teal-300 font-mono">{passPercentage}%</span>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">الناجحون 🟢</span>
            <span className="text-xl font-black text-blue-800 dark:text-blue-300 font-mono">{passedCount}</span>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">طلبة الدور الثاني 🟡</span>
            <span className="text-xl font-black text-amber-800 dark:text-amber-300 font-mono">{makeupCount}</span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">الأول على الفصل 🏆</span>
              <span className="text-xs font-black text-purple-900 dark:text-purple-200 truncate max-w-[130px] block">
                {topStudent ? topStudent.studentName : '—'}
              </span>
            </div>
            {topStudent && (
              <span className="text-sm font-black text-purple-700 dark:text-purple-300 font-mono">
                {topStudent.percentage}%
              </span>
            )}
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث فوري برقم الجلوس، رقم القيد، أو اسم الطالب في الشيت..."
            className="w-full p-2.5 pr-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-bold"
          />
        </div>
      </div>

      {/* Interactive Master Grid Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-right text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 sticky top-0 z-10 select-none shadow-sm">
              <tr>
                <th className="p-3 w-10 text-center font-black border-b border-slate-200 dark:border-slate-700">ت</th>
                <th className="p-3 w-20 text-center font-black border-b border-slate-200 dark:border-slate-700">رقم الجلوس</th>
                <th className="p-3 w-24 text-center font-black border-b border-slate-200 dark:border-slate-700">رقم القيد</th>
                <th className="p-3 min-w-[180px] font-black border-b border-slate-200 dark:border-slate-700">اسم الطالب الرباعي</th>
                
                {/* Subjects Column Headers */}
                {subjects.map(sub => (
                  <th
                    key={sub.code}
                    colSpan={viewMode === 'both' ? 2 : 1}
                    className="p-2 text-center border-b border-r border-slate-200 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-700/40 min-w-[110px]"
                  >
                    <div className="font-black text-slate-900 dark:text-white truncate" title={sub.name}>
                      {sub.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      {viewMode === 'both' ? 'أعمال (40) | نهائي (60)' : 'المجموع (100)'}
                    </div>
                  </th>
                ))}

                <th className="p-3 text-center font-black border-b border-slate-200 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-950/40 min-w-[80px]">
                  المجموع
                </th>
                <th className="p-3 text-center font-black border-b border-slate-200 dark:border-slate-700 min-w-[70px]">
                  النسبة %
                </th>
                <th className="p-3 text-center font-black border-b border-slate-200 dark:border-slate-700 min-w-[60px]">
                  الترتيب
                </th>
                <th className="p-3 text-center font-black border-b border-slate-200 dark:border-slate-700 min-w-[120px]">
                  النتيجة
                </th>
                <th className="p-3 text-center font-black border-b border-slate-200 dark:border-slate-700 min-w-[100px]">
                  الإجراءات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredReports.map((report, rIdx) => {
                const studentObj = classStudents.find(s => s.id === report.studentId);
                const isPassed = report.status === 'passed' || report.status === 'passed_honors' || report.status === 'passed_makeup';

                return (
                  <tr
                    key={report.studentId}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition ${
                      rIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-850/40'
                    }`}
                  >
                    {/* Index */}
                    <td className="p-2.5 text-center font-mono font-bold text-slate-400 text-xs">
                      {rIdx + 1}
                    </td>

                    {/* Seat Number */}
                    <td className="p-2.5 text-center font-mono font-black text-emerald-700 dark:text-emerald-400 text-xs">
                      {report.seatNumber}
                    </td>

                    {/* Reg Number */}
                    <td className="p-2.5 text-center font-mono text-slate-500 dark:text-slate-400 text-xs">
                      {report.nationalNumber}
                    </td>

                    {/* Student Name */}
                    <td className="p-2.5 font-black text-slate-900 dark:text-white truncate">
                      {report.studentName}
                      {(report.estimatedCount ?? 0) > 0 && (
                        <span
                          className="mr-1.5 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-black whitespace-nowrap"
                          title="بعض درجات هذا الطالب تقديرية (لم تُرصد رسمياً بعد)"
                        >
                          تقديري {report.estimatedCount}/{report.results.length}
                        </span>
                      )}
                    </td>

                    {/* Subject Score Inputs */}
                    {subjects.map(sub => {
                      const item = report.results.find(res => res.subjectCode === sub.code);
                      const cwScore = item ? item.courseworkScore : 35;
                      const exScore = item ? item.examScore : 50;
                      const totScore = item ? item.totalScore : cwScore + exScore;
                      const isSubPassed = totScore >= (sub.minScore || 50);

                      if (viewMode === 'both') {
                        return (
                          <React.Fragment key={sub.code}>
                            {/* Coursework (0-40) */}
                            <td className="p-1 border-r border-slate-100 dark:border-slate-800 text-center">
                              <input
                                type="number"
                                min={0}
                                max={sub.courseworkMax || 40}
                                disabled={examLock?.isLocked}
                                data-row={rIdx}
                                data-col={`cw_${sub.code}`}
                                value={cwScore}
                                onChange={e => studentObj && handleScoreChange(studentObj, sub, 'coursework', e.target.value)}
                                onKeyDown={e => handleKeyDown(e, rIdx, `cw_${sub.code}`)}
                                className={`w-12 p-1 text-center font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 disabled:opacity-80 ${item?.isEstimated ? 'border-dashed !border-amber-400 !bg-amber-50/60 dark:!bg-amber-950/30' : ''}`}
                                title={item?.isEstimated ? `أعمال السنة لمادة ${sub.name} — قيمة تقديرية، عدّلها للرصد الرسمي` : `أعمال السنة لمادة ${sub.name} (من ${sub.courseworkMax || 40})`}
                              />
                            </td>

                            {/* Final Exam (0-60) */}
                            <td className="p-1 text-center">
                              <input
                                type="number"
                                min={0}
                                max={sub.examMax || 60}
                                disabled={examLock?.isLocked}
                                data-row={rIdx}
                                data-col={`ex_${sub.code}`}
                                value={exScore}
                                onChange={e => studentObj && handleScoreChange(studentObj, sub, 'exam', e.target.value)}
                                onKeyDown={e => handleKeyDown(e, rIdx, `ex_${sub.code}`)}
                                className={`w-12 p-1 text-center font-mono font-bold rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 disabled:opacity-80 ${
                                  item?.isEstimated
                                  ? 'border-dashed border-amber-400 bg-amber-50/60 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                                  : !isSubPassed
                                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white'
                                }`}
                                title={item?.isEstimated ? `امتحان ${sub.name} — قيمة تقديرية، عدّلها للرصد الرسمي` : `امتحان نهاية الفصل لمادة ${sub.name} (من ${sub.examMax || 60})`}
                              />
                            </td>
                          </React.Fragment>
                        );
                      } else {
                        // Total only
                        return (
                          <td key={sub.code} className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-mono font-bold">
                            {item?.isEstimated ? (
                              <span
                                className="text-amber-600 dark:text-amber-400"
                                title="درجة تقديرية — لم تُرصد رسمياً بعد"
                              >
                                ~{totScore}
                              </span>
                            ) : (
                              <span className={isSubPassed ? 'text-slate-800 dark:text-slate-200' : 'text-rose-600 font-black'}>
                                {totScore}
                              </span>
                            )}
                          </td>
                        );
                      }
                    })}

                    {/* Total Score */}
                    <td className="p-2.5 text-center font-mono font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                      {report.totalEarnedScore}
                    </td>

                    {/* Percentage */}
                    <td className="p-2.5 text-center font-mono font-black text-slate-800 dark:text-slate-200">
                      {report.percentage}%
                    </td>

                    {/* Rank */}
                    <td className="p-2.5 text-center font-mono font-black">
                      {report.rank <= 3 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-black">
                          {report.rank}
                        </span>
                      ) : (
                        <span className="text-slate-500">{report.rank}</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-1 rounded-xl text-[11px] font-black inline-block whitespace-nowrap ${
                        report.status === 'passed_honors'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : report.status === 'passed' || report.status === 'passed_makeup'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : report.status === 'makeup_exam'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      }`}>
                        {report.statusLabel}
                      </span>
                      {(report.estimatedCount ?? 0) === report.results.length && report.results.length > 0 && (
                        <span
                          className="block mt-1 text-[10px] font-black text-amber-600 dark:text-amber-400"
                          title="كل درجات هذا الكشف تقديرية — لا يُعتمد رسمياً قبل الرصد"
                        >
                          ⚠ كشف تقديري بالكامل
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => studentObj && onOpenReportCard(studentObj, report.rank)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 transition"
                          title="عرض وطباعة كشف إخطار الدرجات الرسمي A4"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {report.status === 'passed_honors' && (
                          <button
                            type="button"
                            onClick={() => studentObj && onOpenGoldenCertificate(studentObj, report)}
                            className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 transition"
                            title="طباعة شهادة التفوق الذهبية"
                          >
                            <Award className="w-4 h-4 text-amber-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2FA Security PIN Confirmation Modal for Exam Lock & Results Release */}
      <SecurityPinConfirmModal
        isOpen={showLockPinModal}
        onClose={() => setShowLockPinModal(false)}
        onSuccess={() => { lockModalMode === 'release' ? executeToggleRelease() : executeToggleLock(); }}
        title={lockModalMode === 'release'
          ? (examLock?.isReleasedToParents ? 'سحب النتائج المنشورة' : 'نشر النتائج لأولياء الأمور رسمياً')
          : (examLock?.isLocked ? 'إلغاء قفل شيت الكنترول' : 'اعتماد وقفل شيت الكنترول رسمياً')}
        description={lockModalMode === 'release'
          ? (examLock?.isReleasedToParents
            ? `أنت على وشك سحب نتائج فصل (${selectedClass}) وحجبها عن أولياء الأمور.`
            : `أنت على وشك نشر نتائج فصل (${selectedClass}) رسمياً لجميع أولياء الأمور. تأكد من اعتماد الشيت أولاً.`)
          : (examLock?.isLocked
            ? `أنت على وشك إلغاء قفل شيت درجات فصل (${selectedClass}) وإعادة فتحه للتعديل. يرجى إدخال رمز أمان المدير العام للتأكيد.`
            : `أنت على وشك اعتماد شيت درجات فصل (${selectedClass}) وقفله نهائياً وتثبيت النتائج الرسمية لمنع أي تعديل لاحق.`)}
        actionBadge={lockModalMode === 'release'
          ? (examLock?.isReleasedToParents ? 'سحب النشر 🔒' : 'نشر رسمي 📢')
          : (examLock?.isLocked ? 'إلغاء قفل الكنترول 🔓' : 'اعتماد وقفل الكنترول 🔒')}
        isDestructive={lockModalMode === 'lock' && examLock?.isLocked}
      />
    </div>
  );
};
