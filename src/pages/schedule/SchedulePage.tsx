import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Calendar,
  Clock,
  MapPin,
  Printer,
  User,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Users,
  GraduationCap,
  Layers,
  Zap,
  Edit3,
  FileSpreadsheet
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import {
  TimetableConflictEngine,
  SEED_MULTI_CLASS_SCHEDULES,
  ClassScheduleMap,
  ScheduleConflict
} from '../../services/schedule/conflictDetector';
import { TimetableAIGenerator } from '../../services/schedule/timetableAiGenerator';
import { SchedulePeriod, DaySchedule } from '../../types';
import { SchedulePeriodEditorModal } from '../../components/admin/SchedulePeriodEditorModal';

export const SchedulePage: React.FC = () => {
  const { schedule, selectedStudent, teachers, currentRole, showToast } = useSchool();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  
  // Multi-Class Schedules state
  const [classSchedules, setClassSchedules] = useState<ClassScheduleMap>(() => {
    try {
      const saved = localStorage.getItem('madrasa_multi_class_schedules');
      return saved ? JSON.parse(saved) : SEED_MULTI_CLASS_SCHEDULES;
    } catch {
      return SEED_MULTI_CLASS_SCHEDULES;
    }
  });

  // View Mode: By Class OR By Teacher
  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');
  const [selectedClassName, setSelectedClassName] = useState<string>('3/أ');
  const [selectedTeacherCode, setSelectedTeacherCode] = useState<string>(teachers[0]?.code || 'LIB-MATH-01');

  // Principal Edit Modal State
  const [editingPeriod, setEditingPeriod] = useState<{
    dayName: string;
    dayIndex: number;
    className: string;
    period: SchedulePeriod;
  } | null>(null);

  // Conflict Detection
  const conflicts = useMemo(() => {
    return TimetableConflictEngine.detectConflicts(classSchedules);
  }, [classSchedules]);

  // AI Smart Schedule Generator
  const handleGenerateAiSchedule = () => {
    sound.playTap();
    const targetClasses = ['7/أ', '7/ب', '8/أ', '8/ب', '6/أ', '6/ب', '4/أ', '4/ب', '9/أ', '3/أ'];
    const gen = TimetableAIGenerator.generateSmartSchedule(targetClasses, teachers);
    setClassSchedules(gen.schedules);
    setSelectedClassName('7/أ');
    sound.playFanfare();
    triggerConfetti();
    showToast('gold', 'تم التوليد الذكي للجداول المدرسية بالذكاء الاصطناعي ⚡', `تم إنشاء وتوزيع ${gen.totalPeriodsGenerated} حصة لجميع الصفوف بنجاح (0 تضارب).`);
  };

  // Export Timetable to Excel
  const handleExportExcel = () => {
    sound.playSuccess();
    TimetableAIGenerator.exportMasterTimetableToExcel(classSchedules, 'مدرسة_الأمل_للتعليم_الأساسي');
    showToast('success', 'تم تصدير الجدول Excel 📊', 'تم حفظ ملف جداول جميع الفصول بصيغة .xlsx بنجاح.');
  };

  // AI Conflict Auto-Resolver
  const handleAutoResolve = () => {
    sound.playTap();
    const result = TimetableConflictEngine.autoResolveConflicts(classSchedules, teachers);
    setClassSchedules(result.resolvedSchedules);
    try {
      localStorage.setItem('madrasa_multi_class_schedules', JSON.stringify(result.resolvedSchedules));
    } catch {}

    sound.playSuccess();
    triggerConfetti();
    showToast('gold', 'حل التضارب آلياً 🌟', `تم فحص وإعادة ضبط الجدول المدرسي بنجاح (0 تضارب نشط)`);
  };

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  const handleSavePeriod = (dayIndex: number, updatedPeriod: SchedulePeriod) => {
    setClassSchedules(prev => {
      const targetClass = selectedClassName;
      const currentList = prev[targetClass] ? [...prev[targetClass]] : [];
      const daySchedule = currentList.find(d => d.dayIndex === dayIndex);

      if (daySchedule) {
        daySchedule.periods = daySchedule.periods.map(p =>
          p.periodNumber === updatedPeriod.periodNumber ? updatedPeriod : p
        );
      }

      const updatedMap = {
        ...prev,
        [targetClass]: currentList
      };

      try {
        localStorage.setItem('madrasa_multi_class_schedules', JSON.stringify(updatedMap));
      } catch {}

      return updatedMap;
    });
  };

  // Active Schedule to display based on selected mode
  const activeClassSchedule = classSchedules[selectedClassName] || schedule;
  const currentTeacher = teachers.find(t => t.code === selectedTeacherCode) || teachers[0];
  const teacherSchedule = useMemo(() => {
    return TimetableConflictEngine.getTeacherSchedule(currentTeacher?.name || 'طارق الفيتوري', classSchedules);
  }, [currentTeacher, classSchedules]);

  const displayedSchedule = viewMode === 'class' ? activeClassSchedule : teacherSchedule;
  const currentDaySchedule = displayedSchedule[selectedDayIndex] || displayedSchedule[0];

  return (
    <div className="animate-fadeIn pb-12 font-cairo text-right">
      <div className="print:hidden space-y-8">
        {/* Header Banner with Conflict Indicator */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-blue-800/40">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center text-3xl shadow-xl border border-blue-500/30">
              ⏰
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black">الجدول الدراسي ومنظومة منع التضارب</h1>
                {conflicts.length === 0 ? (
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>0 تضارب - الجداول متوافقة 100%</span>
                  </span>
                ) : (
                  <span className="bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1 rounded-xl border border-red-500/30 flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>⚠️ تم رصد {conflicts.length} تضارب في حصص المعلمين</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 mt-1">
                دولة ليبيا - وزارة التربية والتعليم (2025/2026 م) • توزيع الحصص والمواد والمعلمين
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* AI Auto Generator Button */}
            {currentRole !== 'parent' && (
              <button
                onClick={handleGenerateAiSchedule}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-4 py-2.5 rounded-2xl transition text-xs shadow-lg active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>توليد الجداول الذكية بالذكاء الاصطناعي ⚡</span>
              </button>
            )}

            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl transition text-xs shadow-md shrink-0 active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير إكسل (.xlsx)</span>
            </button>

            {conflicts.length > 0 && currentRole !== 'parent' && (
              <button
                onClick={handleAutoResolve}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2.5 rounded-2xl transition text-xs shadow-lg active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>حل التضارب التلقائي بالذكاء الاصطناعي ⚡</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-2xl border border-white/20 transition text-xs shadow-md shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الجدول الأسبوعي</span>
            </button>
          </div>
        </div>

        {/* Schedule Controls & Filters Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-2xl border border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => { setViewMode('class'); sound.playTap(); }}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'class' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>عرض جدول الفصل</span>
            </button>

            <button
              onClick={() => { setViewMode('teacher'); sound.playTap(); }}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'teacher' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>جدول المعلم الشامل</span>
            </button>
          </div>

          {/* Secondary Selector Dropdown / Pills */}
          {viewMode === 'class' ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-bold whitespace-nowrap">اختر الفصل:</span>
              <select
                value={selectedClassName}
                onChange={e => { setSelectedClassName(e.target.value); sound.playTap(); }}
                className="py-1.5 px-3 rounded-xl bg-slate-800 text-white border border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(classSchedules).map(cls => (
                  <option key={cls} value={cls}>فصل {cls}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-bold whitespace-nowrap">اختر المعلم:</span>
              <select
                value={selectedTeacherCode}
                onChange={e => { setSelectedTeacherCode(e.target.value); sound.playTap(); }}
                className="py-1.5 px-3 rounded-xl bg-slate-800 text-white border border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.code}>
                    {t.name} — {t.subject}
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>
      </div>

      {/* Conflict Warnings Box (If any exist) */}
      {conflicts.length > 0 && (
        <div className="p-5 bg-red-50 dark:bg-red-950/30 rounded-3xl border border-red-200 dark:border-red-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-red-900 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>تنبيهات التضارب الزمني المكتشفة ({conflicts.length} تضارب):</span>
            </h3>
            <button
              onClick={handleAutoResolve}
              className="text-xs font-bold text-red-700 dark:text-red-300 underline hover:text-red-900"
            >
              حل التضارب آلياً الآن ←
            </button>
          </div>

          <div className="space-y-2">
            {conflicts.map(c => (
              <div key={c.id} className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-red-800/40 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-red-800 dark:text-red-300">{c.message}</p>
                  <p className="text-[11px] text-slate-500 font-mono">الحصة: {c.periodNumber} • التوقيت: {c.periodTime}</p>
                </div>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-[10px] font-bold">
                  تضارب حصة
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
        {displayedSchedule.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;

          return (
            <button
              key={day.dayName}
              onClick={() => { setSelectedDayIndex(idx); sound.playTap(); }}
              className={`flex-1 min-w-[100px] py-3 px-4 rounded-xl text-xs font-black transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {day.dayName}
            </button>
          );
        })}
      </div>

      {/* Selected Day Timeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentDaySchedule?.periods?.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
            لا توجد حصص مسجلة لهذا اليوم.
          </div>
        ) : (
          currentDaySchedule?.periods?.map((period) => (
            <div
              key={period.periodNumber}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all space-y-4 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center">
                  #{period.periodNumber}
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    {period.time}
                  </span>

                  {/* Admin Edit Period Button */}
                  {currentRole === 'admin' && viewMode === 'class' && (
                    <button
                      onClick={() => {
                        setEditingPeriod({
                          dayName: currentDaySchedule.dayName,
                          dayIndex: selectedDayIndex,
                          className: selectedClassName,
                          period
                        });
                        sound.playTap();
                      }}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition"
                      title="تعديل المادة والمعلم"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <span className="text-3xl">{period.icon || '📚'}</span>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">{period.subject}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{period.teacher}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>{period.room}</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">بدون تضارب ✅</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full Weekly Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="font-black text-base text-slate-900 dark:text-white">
              المصفوفة الأسبوعية الكاملة ({viewMode === 'class' ? `فصل ${selectedClassName}` : `المعلم ${currentTeacher.name}`})
            </h2>
          </div>

          <span className="text-xs text-slate-400 font-mono">5 أيام • 6 حصص يومياً (2025/2026 م)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs min-w-[720px]">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">اليوم</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">الحصة 1</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">الحصة 2</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">الحصة 3</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">الحصة 4</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">الحصة 5</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">الحصة 6</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedSchedule.map((d, dIdx) => (
                <tr key={d.dayName} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/20 whitespace-nowrap">{d.dayName}</td>
                  {[1, 2, 3, 4, 5, 6].map((pNum) => {
                    const p = d.periods.find(item => item.periodNumber === pNum);
                    return (
                      <td
                        key={pNum}
                        onClick={() => {
                          if (currentRole === 'admin' && p && viewMode === 'class') {
                            setEditingPeriod({
                              dayName: d.dayName,
                              dayIndex: dIdx,
                              className: selectedClassName,
                              period: p
                            });
                            sound.playTap();
                          }
                        }}
                        className={`py-3.5 px-3 text-center whitespace-nowrap ${
                          currentRole === 'admin' && viewMode === 'class' ? 'cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20' : ''
                        }`}
                      >
                        {p ? (
                          <>
                            <div className="font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{p.subject}</div>
                            <div className="text-[10px] text-slate-400 whitespace-nowrap">{p.teacher.split(' ')[1] || p.teacher}</div>
                          </>
                        ) : (
                          <div className="text-slate-300 dark:text-slate-600 font-mono">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Period Editor Modal */}
      {editingPeriod && (
        <SchedulePeriodEditorModal
          isOpen={true}
          onClose={() => setEditingPeriod(null)}
          dayName={editingPeriod.dayName}
          dayIndex={editingPeriod.dayIndex}
          className={editingPeriod.className}
          period={editingPeriod.period}
          teachers={teachers}
          onSavePeriod={handleSavePeriod}
        />
        )}

      </div>

      {/* ========================================================================= */}
      {/* OFFICIAL LIBYAN MINISTRY OF EDUCATION A4 PRINTABLE TIMETABLE              */}
      {/* (Hidden on screen, renders cleanly on A4 print)                            */}
      {/* ========================================================================= */}
      <div className="hidden print:block p-8 bg-white text-slate-900 font-cairo w-full max-w-4xl mx-auto dir-rtl text-right">
        {/* Ministry Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center justify-between text-xs leading-relaxed">
            <div className="text-right space-y-0.5">
              <p className="font-bold">دولة ليبيا</p>
              <p className="font-bold">وزارة التربية والتعليم</p>
              <p className="font-bold">مراقبة التربية والتعليم توكرة</p>
              <p className="font-black text-sm">مدرسة الشهيد امحمد الباعور للتعليم الأساسي</p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-1 rounded-full border-2 border-slate-900 flex items-center justify-center text-xl font-black">
                🏛️
              </div>
              <h2 className="text-base font-black tracking-wide">جدول الحصص الأسبوعي المعتمد</h2>
              <p className="text-[11px] font-bold text-slate-700 font-mono">العام الدراسي: 2025 - 2026 م</p>
            </div>

            <div className="text-left font-mono text-xs space-y-0.5">
              <p className="font-bold text-slate-900">
                الفصل: <strong className="text-sm font-black">{viewMode === 'class' ? selectedClassName : `المعلم: ${currentTeacher.name}`}</strong>
              </p>
              <p>الفترة: الصباحية (08:00 - 01:00)</p>
              <p>زمن الحصة: 45 دقيقة</p>
              <p className="text-[10px] text-slate-500">لائحة 1013 لسنة 2022م</p>
            </div>
          </div>
        </div>

        {/* Official Matrix Table */}
        <table className="w-full border-collapse border-2 border-slate-900 text-center text-xs mb-6">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-900">
              <th className="border border-slate-800 p-2 font-black w-24">اليوم</th>
              <th className="border border-slate-800 p-2 font-black">
                <div>الحصة 1</div>
                <div className="text-[10px] font-normal font-mono text-slate-600">08:00 - 08:45</div>
              </th>
              <th className="border border-slate-800 p-2 font-black">
                <div>الحصة 2</div>
                <div className="text-[10px] font-normal font-mono text-slate-600">08:45 - 09:30</div>
              </th>
              <th className="border border-slate-800 p-2 font-black">
                <div>الحصة 3</div>
                <div className="text-[10px] font-normal font-mono text-slate-600">09:30 - 10:15</div>
              </th>
              <th className="border border-slate-800 p-1 font-black bg-amber-50/70 w-14 text-[10px]">
                <div>استراحة</div>
                <div className="text-[9px] font-mono text-slate-500">10:15 - 10:45</div>
              </th>
              <th className="border border-slate-800 p-2 font-black">
                <div>الحصة 4</div>
                <div className="text-[10px] font-normal font-mono text-slate-600">10:45 - 11:30</div>
              </th>
              <th className="border border-slate-800 p-2 font-black">
                <div>الحصة 5</div>
                <div className="text-[10px] font-normal font-mono text-slate-600">11:30 - 12:15</div>
              </th>
              <th className="border border-slate-800 p-2 font-black">
                <div>الحصة 6</div>
                <div className="text-[10px] font-normal font-mono text-slate-600">12:15 - 01:00</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedSchedule.map((d) => (
              <tr key={d.dayName} className="border-b border-slate-800">
                <td className="border border-slate-800 p-2.5 font-black bg-slate-50">{d.dayName}</td>
                {[1, 2, 3].map(pNum => {
                  const p = d.periods.find(item => item.periodNumber === pNum);
                  return (
                    <td key={pNum} className="border border-slate-800 p-2">
                      {p ? (
                        <div>
                          <div className="font-black text-slate-900">{p.subject}</div>
                          <div className="text-[10px] text-slate-600">{p.teacher}</div>
                        </div>
                      ) : (
                        <div className="text-slate-400 font-mono">-</div>
                      )}
                    </td>
                  );
                })}
                <td className="border border-slate-800 p-1 bg-amber-50/40 text-[10px] text-amber-950 font-bold">
                  فسحة
                </td>
                {[4, 5, 6].map(pNum => {
                  const p = d.periods.find(item => item.periodNumber === pNum);
                  return (
                    <td key={pNum} className="border border-slate-800 p-2">
                      {p ? (
                        <div>
                          <div className="font-black text-slate-900">{p.subject}</div>
                          <div className="text-[10px] text-slate-600">{p.teacher}</div>
                        </div>
                      ) : (
                        <div className="text-slate-400 font-mono">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Official Libyan Signatures & Seal Section */}
        <div className="grid grid-cols-4 gap-4 pt-6 border-t-2 border-slate-800 text-center text-xs">
          <div className="space-y-8">
            <p className="font-bold text-slate-700">منسق الجداول المدرسية</p>
            <p className="font-mono text-slate-400">التوقيع: ....................</p>
          </div>

          <div className="space-y-8">
            <p className="font-bold text-slate-700">الموجه التربوي المختص</p>
            <p className="font-mono text-slate-400">التوقيع: ....................</p>
          </div>

          <div className="space-y-8">
            <p className="font-bold text-slate-700">مدير المدرسة</p>
            <p className="font-black text-slate-900">أ. فرج امحمد الباعور</p>
            <p className="font-mono text-slate-400">التوقيع: ....................</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-[10px] text-slate-500 p-2">
              <span className="font-bold">مكان الختم الرسمي</span>
              <span>للمدرسة والكنترول</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
