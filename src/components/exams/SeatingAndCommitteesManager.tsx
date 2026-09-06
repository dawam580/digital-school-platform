import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Building2,
  QrCode,
  ShieldCheck,
  Search,
  ChevronDown
} from 'lucide-react';
import { Student } from '../../types';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import {
  ExamStorageService,
  ExamCommittee
} from '../../services/exams/examStorageService';
import { LibyanExamEngine } from '../../services/exams/libyanExamEngine';

interface SeatingAndCommitteesManagerProps {
  students: Student[];
  availableClasses: string[];
  schoolName: string;
  showToast: (type: 'gold' | 'error' | 'info' | 'success', title: string, message: string) => void;
}

export const SeatingAndCommitteesManager: React.FC<SeatingAndCommitteesManagerProps> = ({
  students,
  availableClasses,
  schoolName,
  showToast
}) => {
  const [committees, setCommittees] = useState<ExamCommittee[]>([]);
  const [seatingStartNumber, setSeatingStartNumber] = useState<number>(26001);
  const [selectedClassScope, setSelectedClassScope] = useState<string>('all');
  const [seatingMap, setSeatingMap] = useState<Map<string, string>>(new Map());

  // Printable Modal States
  const [printingCardStudent, setPrintingCardStudent] = useState<Student | null>(null);
  const [printingCommittee, setPrintingCommittee] = useState<ExamCommittee | null>(null);
  const [searchStudent, setSearchStudent] = useState('');

  // Initial load
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const coms = await ExamStorageService.getCommittees();
        if (isMounted) {
          if (coms && coms.length > 0) {
            setCommittees(coms);
          } else {
            // Seed 4 standard exam halls
            const seedHalls: ExamCommittee[] = [
              {
                id: 'comm-1',
                name: 'لجنة رقم 1 (قاعة الخوارزمي)',
                roomNumber: 'قاعة 101',
                capacity: 35,
                supervisorName: 'أ. عبدالسلام الورفلي',
                proctorNames: ['أ. طارق الفيتوري', 'أ. سالم المقريف'],
                seatStart: 26001,
                seatEnd: 26035,
                assignedStudentIds: [],
                academicYear: '2025 - 2026 م'
              },
              {
                id: 'comm-2',
                name: 'لجنة رقم 2 (قاعة ابن الهيثم)',
                roomNumber: 'قاعة 102',
                capacity: 35,
                supervisorName: 'أ. عثمان السويحلي',
                proctorNames: ['أ. محمد الزوي', 'أ. خالد الترهوني'],
                seatStart: 26036,
                seatEnd: 26070,
                assignedStudentIds: [],
                academicYear: '2025 - 2026 م'
              },
              {
                id: 'comm-3',
                name: 'لجنة رقم 3 (مختبر الحاسوب)',
                roomNumber: 'مختبر 1',
                capacity: 30,
                supervisorName: 'أ. فاطمة المجبري',
                proctorNames: ['أ. خديجة الترهوني', 'أ. مريم المنفي'],
                seatStart: 26071,
                seatEnd: 26100,
                assignedStudentIds: [],
                academicYear: '2025 - 2026 م'
              }
            ];
            setCommittees(seedHalls);
            await ExamStorageService.saveCommittees(seedHalls);
          }
        }
      } catch (err) {
        console.error('Error loading committees:', err);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  // Filter students based on scope
  const targetStudents = useMemo(() => {
    if (selectedClassScope === 'all') return students;
    return students.filter(s => (s.className || '').trim() === selectedClassScope.trim());
  }, [students, selectedClassScope]);

  // Generate seating numbers
  const handleGenerateSeatingNumbers = () => {
    sound.playTap();
    if (targetStudents.length === 0) {
      showToast('error', 'تنبيه', 'لا يوجد طلاب مسجلين في النطاق المحدد.');
      return;
    }

    const generated = LibyanExamEngine.generateSeatingNumbers(targetStudents, seatingStartNumber);
    setSeatingMap(generated);

    // Save to student objects in memory
    targetStudents.forEach(st => {
      const sNum = generated.get(st.id);
      if (sNum) st.studentNumber = sNum;
    });

    sound.playFanfare();
    triggerConfetti();
    showToast('gold', 'تم توليد أرقام الجلوس 🌟', `تم توليد (${generated.size}) رقم جلوس تسلسلي يبدأ من (${seatingStartNumber}).`);
  };

  // Auto distribute students to committees
  const handleAutoDistributeToCommittees = async () => {
    sound.playTap();
    if (targetStudents.length === 0) {
      showToast('error', 'تنبيه', 'لا يوجد طلاب لتوزيعهم على القاعات.');
      return;
    }

    // Ensure seating numbers generated
    let curMap = seatingMap;
    if (curMap.size === 0) {
      curMap = LibyanExamEngine.generateSeatingNumbers(targetStudents, seatingStartNumber);
      setSeatingMap(curMap);
    }

    const distributed = LibyanExamEngine.distributeStudentsToCommittees(
      targetStudents,
      curMap,
      committees
    );

    setCommittees(distributed);
    await ExamStorageService.saveCommittees(distributed);

    sound.playSuccess();
    triggerConfetti();
    showToast('gold', 'تم توزيع اللجان بنجاح 🏢', `تم توزيع (${targetStudents.length}) طالب على (${distributed.length}) لجان امتحانية.`);
  };

  // Add a new committee
  const handleAddCommittee = async () => {
    sound.playTap();
    const newComm: ExamCommittee = {
      id: `comm-${Date.now()}`,
      name: `لجنة رقم ${committees.length + 1}`,
      roomNumber: `قاعة ${100 + committees.length + 1}`,
      capacity: 35,
      supervisorName: 'أ. مشرف القاعة',
      proctorNames: ['أ. مراقب أول', 'أ. مراقب ثانٍ'],
      seatStart: 0,
      seatEnd: 0,
      assignedStudentIds: [],
      academicYear: '2025 - 2026 م'
    };

    const updated = [...committees, newComm];
    setCommittees(updated);
    await ExamStorageService.saveCommittees(updated);
    showToast('info', 'تمت إضافة قاعة', `تمت إضافة ${newComm.name} بنجاح.`);
  };

  // Delete committee
  const handleDeleteCommittee = async (id: string) => {
    sound.playTap();
    const updated = committees.filter(c => c.id !== id);
    setCommittees(updated);
    await ExamStorageService.saveCommittees(updated);
    showToast('info', 'تم الحذف', 'تم حذف اللجنة بنجاح.');
  };

  // Export seating roster to Excel
  const handleExportSeatingExcel = () => {
    sound.playTap();
    if (targetStudents.length === 0) {
      showToast('error', 'تنبيه', 'لا توجد بيانات طلاب لتصديرها.');
      return;
    }

    const headers = ['ت', 'رقم الجلوس', 'رقم القيد', 'اسم الطالب الرباعي', 'الصف والفصل', 'القاعة / اللجنة'];
    const rows = targetStudents.map((st, idx) => {
      const seat = seatingMap.get(st.id) || st.studentNumber || '—';
      const assignedComm = committees.find(c => c.assignedStudentIds.includes(st.id));
      return [
        String(idx + 1),
        seat,
        st.nationalNumber || st.nationalId || '—',
        `"${st.name}"`,
        `"${st.className}"`,
        `"${assignedComm ? assignedComm.name : 'غير محدد'}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `كشف_أرقام_الجلوس_وتوزيع_اللجان_2026.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('gold', 'تم التصدير بنجاح 📊', `تم تصدير كشف أرقام الجلوس لـ (${targetStudents.length}) طالب.`);
  };

  // Filtered student list for printable seating card search
  const filteredStudents = useMemo(() => {
    if (!searchStudent.trim()) return targetStudents.slice(0, 20);
    const q = searchStudent.toLowerCase().trim();
    return targetStudents.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.studentNumber && s.studentNumber.includes(q)) ||
      (s.nationalNumber && s.nationalNumber.includes(q))
    ).slice(0, 30);
  }, [targetStudents, searchStudent]);

  return (
    <div className="space-y-6 font-cairo">
      {/* Control Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                أرقام الجلوس ولجان الامتحانات والقاعات
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                توليد أرقام جلوس تسلسلية وتوزيع الطلاب على القاعات وطباعة بطاقات الجلوس وكشوفات المناداة
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Scope selection */}
            <select
              value={selectedClassScope}
              onChange={e => setSelectedClassScope(e.target.value)}
              className="p-2.5 pr-3 pl-8 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs cursor-pointer focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="all">جميع الفصول (873 طالب)</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>
                  فصل: {cls}
                </option>
              ))}
            </select>

            {/* Start Number input */}
            <div className="flex items-center gap-1.5 p-1 px-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <label className="text-[11px] font-bold text-slate-500">رقم البداية:</label>
              <input
                type="number"
                value={seatingStartNumber}
                onChange={e => setSeatingStartNumber(parseInt(e.target.value, 10) || 26001)}
                className="w-20 p-1 text-center font-mono font-black text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300"
              />
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerateSeatingNumbers}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>توليد أرقام الجلوس</span>
            </button>

            {/* Auto Distribute Button */}
            <button
              type="button"
              onClick={handleAutoDistributeToCommittees}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>توزيع القاعات آلياً</span>
            </button>

            {/* Export Excel Button */}
            <button
              type="button"
              onClick={handleExportSeatingExcel}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Committees Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>قاعات ولجان الامتحانات المعتمدة ({committees.length})</span>
          </h3>

          <button
            type="button"
            onClick={handleAddCommittee}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1 border border-indigo-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة قاعة جديدة</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {committees.map((comm, idx) => (
            <div
              key={comm.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">{comm.name}</h4>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {comm.roomNumber} • السعة: {comm.capacity} طالب
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteCommittee(comm.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="حذف اللجنة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">رئيس القاعة:</span>
                  <span className="font-bold">{comm.supervisorName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">المراقبون:</span>
                  <span className="font-bold truncate max-w-[160px]">
                    {comm.proctorNames?.join(' ، ') || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">نطاق أرقام الجلوس:</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {comm.seatStart > 0 ? `${comm.seatStart} - ${comm.seatEnd}` : 'لم يتم التعيين'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">الطلاب المسجلون:</span>
                  <span className="font-black text-slate-800 dark:text-white font-mono">
                    {comm.assignedStudentIds?.length || 0} طالب
                  </span>
                </div>
              </div>

              {/* Committee Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintingCommittee(comm)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة كشف مناداة اللجنة</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Seating Card Search & Print */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              معاينة وطباعة بطاقات أرقام الجلوس للطلاب
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ابحث عن أي طالب لطباعة بطاقة رقم الجلوس المعتمدة بختم المدرسة والباركود
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchStudent}
              onChange={e => setSearchStudent(e.target.value)}
              placeholder="ابحث بالاسم أو رقم القيد..."
              className="w-full p-2 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStudents.map(st => {
            const seat = seatingMap.get(st.id) || st.studentNumber || '—';
            const comm = committees.find(c => c.assignedStudentIds.includes(st.id));

            return (
              <div
                key={st.id}
                className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 flex items-center justify-between gap-3 hover:border-indigo-300 transition"
              >
                <div className="truncate">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{st.name}</h5>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                    <span>قيد: {st.nationalNumber}</span>
                    <span>•</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">جلوس: {seat}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPrintingCardStudent(st)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center gap-1 transition shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>البطاقة</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= MODAL: PRINTABLE STUDENT SEATING CARD ================= */}
      {printingCardStudent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border-4 border-indigo-600 space-y-4 text-right">
            {/* Header */}
            <div className="text-center border-b-2 border-indigo-100 pb-3 space-y-1">
              <div className="text-xs font-black text-slate-700">دولة ليبيا • وزارة التربية والتعليم</div>
              <div className="text-xs text-slate-500">المركز الوطني للامتحانات • مكتب الامتحانات</div>
              <div className="text-sm font-black text-indigo-800 mt-1">{schoolName}</div>
              <div className="inline-block px-3 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-black border border-indigo-300">
                بطاقة رقم جلوس طالب (امتحانات النقل والشهادة)
              </div>
            </div>

            {/* Student Info Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-indigo-100 pb-1.5">
                <span className="text-slate-500 font-bold">اسم الطالب:</span>
                <span className="font-black text-slate-900">{printingCardStudent.name}</span>
              </div>
              <div className="flex justify-between border-b border-indigo-100 pb-1.5 font-mono">
                <span className="text-slate-500 font-bold font-cairo">رقم القيد الرسمي:</span>
                <span className="font-bold text-slate-800">{printingCardStudent.nationalNumber}</span>
              </div>
              <div className="flex justify-between border-b border-indigo-100 pb-1.5">
                <span className="text-slate-500 font-bold">الصف والفصل:</span>
                <span className="font-bold text-slate-800">{printingCardStudent.className}</span>
              </div>
              <div className="flex justify-between border-b border-indigo-100 pb-1.5">
                <span className="text-slate-500 font-bold">القاعة المخصصة:</span>
                <span className="font-bold text-indigo-700">
                  {committees.find(c => c.assignedStudentIds.includes(printingCardStudent.id))?.name || 'قاعة الامتحانات العامة'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-700 font-black text-sm">رقم الجلوس:</span>
                <span className="font-mono font-black text-2xl text-indigo-700 px-3 py-1 bg-white rounded-xl border border-indigo-300 shadow-inner">
                  {seatingMap.get(printingCardStudent.id) || printingCardStudent.studentNumber || '26001'}
                </span>
              </div>
            </div>

            {/* Barcode and Stamp Mockup */}
            <div className="flex items-center justify-between pt-2 px-3">
              <div className="text-center">
                <div className="w-16 h-16 border-2 border-dashed border-indigo-300 rounded-full flex items-center justify-center text-[10px] text-indigo-500 font-black rotate-[-12deg]">
                  ختم المدرسة
                </div>
              </div>

              <div className="text-center font-mono text-[10px] text-slate-400">
                <div className="tracking-widest text-base font-black text-slate-800">||| | |||| | ||| ||</div>
                <span>SCH-2026-LY</span>
              </div>

              <div className="text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">توقيع منسق الامتحانات</span>
                <div className="font-serif italic text-xs text-slate-700">أ. منسق الكنترول</div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة البطاقة</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintingCardStudent(null)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PRINTABLE COMMITTEE CALL SHEET ================= */}
      {printingCommittee && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 text-right">
            <div className="text-center border-b pb-3 space-y-1">
              <h3 className="font-black text-base">{schoolName}</h3>
              <h4 className="font-bold text-sm text-indigo-700">
                كشف مناداة وتوقيع حضور الطلاب في اللجنة الامتحانية ({printingCommittee.name})
              </h4>
              <p className="text-xs text-slate-500">
                {printingCommittee.roomNumber} • المشرف: {printingCommittee.supervisorName} • العام الدراسي: {printingCommittee.academicYear}
              </p>
            </div>

            <div className="overflow-x-auto max-h-[50vh] border rounded-2xl">
              <table className="w-full text-right text-xs border-collapse">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-2.5 text-center font-black w-10">ت</th>
                    <th className="p-2.5 text-center font-black w-24">رقم الجلوس</th>
                    <th className="p-2.5 text-center font-black w-24">رقم القيد</th>
                    <th className="p-2.5 font-black">اسم الطالب</th>
                    <th className="p-2.5 text-center font-black w-20">الفصل</th>
                    <th className="p-2.5 text-center font-black w-28">توقيع الطالب</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students
                    .filter(s => printingCommittee.assignedStudentIds.includes(s.id))
                    .map((st, idx) => (
                      <tr key={st.id}>
                        <td className="p-2 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-2 text-center font-mono font-black text-indigo-700">
                          {seatingMap.get(st.id) || st.studentNumber}
                        </td>
                        <td className="p-2 text-center font-mono text-slate-500">{st.nationalNumber}</td>
                        <td className="p-2 font-bold">{st.name}</td>
                        <td className="p-2 text-center">{st.className}</td>
                        <td className="p-2 text-center border-b border-dashed"></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 text-xs border-t">
              <div className="space-y-1">
                <span className="font-bold block">توقيع مراقبي اللجنة:</span>
                <span className="text-slate-500">{printingCommittee.proctorNames.join(' • ')}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الكشف</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintingCommittee(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
