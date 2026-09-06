import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import {
  ExamStorageService,
  ExamSubject,
  DEFAULT_LIBYAN_EXAM_SUBJECTS
} from '../../services/exams/examStorageService';

interface SubjectManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (type: 'gold' | 'error' | 'info' | 'success', title: string, message: string) => void;
}

export const SubjectManagementModal: React.FC<SubjectManagementModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const [subjects, setSubjects] = useState<ExamSubject[]>([]);
  const [editingSubject, setEditingSubject] = useState<ExamSubject | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New subject draft
  const [draftCode, setDraftCode] = useState('');
  const [draftName, setDraftName] = useState('');
  const [draftPeriods, setDraftPeriods] = useState<number>(4);
  const [draftCourseworkMax, setDraftCourseworkMax] = useState<number>(40);
  const [draftExamMax, setDraftExamMax] = useState<number>(60);
  const [draftMinScore, setDraftMinScore] = useState<number>(50);
  const [draftTeacher, setDraftTeacher] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      const subs = await ExamStorageService.getSubjects();
      setSubjects(subs);
    };
    load();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveDraft = async () => {
    if (!draftName.trim() || !draftCode.trim()) {
      showToast('error', 'تنبيه', 'يرجى إدخال اسم المادة وكود المادة بالإنجليزية.');
      return;
    }

    sound.playTap();
    const newSub: ExamSubject = {
      code: draftCode.trim().toUpperCase(),
      name: draftName.trim(),
      weeklyPeriods: draftPeriods,
      maxScore: draftCourseworkMax + draftExamMax,
      minScore: draftMinScore,
      courseworkMax: draftCourseworkMax,
      examMax: draftExamMax,
      teacherName: draftTeacher.trim() || 'أ. معلم المادة'
    };

    await ExamStorageService.addOrUpdateSubject(newSub);
    const updated = await ExamStorageService.getSubjects();
    setSubjects(updated);

    setIsAddingNew(false);
    setEditingSubject(null);
    setDraftCode('');
    setDraftName('');
    setDraftTeacher('');
    sound.playSuccess();
    showToast('gold', 'تم الحفظ بنجاح', `تم تحديث المادة (${newSub.name}) في قاعدة البيانات.`);
  };

  const handleEditClick = (sub: ExamSubject) => {
    sound.playTap();
    setEditingSubject(sub);
    setDraftCode(sub.code);
    setDraftName(sub.name);
    setDraftPeriods(sub.weeklyPeriods);
    setDraftCourseworkMax(sub.courseworkMax || 40);
    setDraftExamMax(sub.examMax || 60);
    setDraftMinScore(sub.minScore || 50);
    setDraftTeacher(sub.teacherName || '');
    setIsAddingNew(true);
  };

  const handleDeleteClick = async (code: string) => {
    sound.playTap();
    await ExamStorageService.deleteSubject(code);
    const updated = await ExamStorageService.getSubjects();
    setSubjects(updated);
    showToast('info', 'تم الحذف', 'تم حذف المادة بنجاح.');
  };

  const handleResetToDefaults = async () => {
    sound.playTap();
    await ExamStorageService.saveSubjects([...DEFAULT_LIBYAN_EXAM_SUBJECTS]);
    setSubjects([...DEFAULT_LIBYAN_EXAM_SUBJECTS]);
    showToast('gold', 'تمت استعادة المقررات الليبية', 'تمت استعادة القائمة الرسمية لوزارة التربية والتعليم.');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-cairo">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <BookOpen className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-black text-base">إدارة المواد الدراسية وقواعد الرصد</h3>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                تخصيص المقررات، تعيين نصاب الحصص، درجات أعمال السنة والامتحان، والمعلمين المكلفين
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(true);
                  setEditingSubject(null);
                  setDraftCode('');
                  setDraftName('');
                  setDraftTeacher('');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مادة جديدة</span>
              </button>

              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                title="استعادة المقررات الرسمية للوزارة"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة الافتراضي الوزاري</span>
              </button>
            </div>

            <span className="text-xs font-bold text-slate-500">
              إجمالي المواد: {subjects.length} مادة
            </span>
          </div>

          {/* Add / Edit Form Box */}
          {isAddingNew && (
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700 space-y-4">
              <h4 className="font-black text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{editingSubject ? `تعديل مادة: ${editingSubject.name}` : 'إضافة مادة دراسية جديدة'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">اسم المادة باللغة العربية *</label>
                  <input
                    type="text"
                    value={draftName}
                    onChange={e => setDraftName(e.target.value)}
                    placeholder="مثال: التربية الوطنية"
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">كود المادة (رمز إنجليزي فريد) *</label>
                  <input
                    type="text"
                    value={draftCode}
                    onChange={e => setDraftCode(e.target.value)}
                    placeholder="مثال: CIV"
                    disabled={!!editingSubject}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">المعلم المسؤول</label>
                  <input
                    type="text"
                    value={draftTeacher}
                    onChange={e => setDraftTeacher(e.target.value)}
                    placeholder="مثال: أ. فتحي المنفي"
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">أعمال السنة (الحد الأقصى)</label>
                  <input
                    type="number"
                    value={draftCourseworkMax}
                    onChange={e => setDraftCourseworkMax(parseInt(e.target.value, 10) || 40)}
                    className="w-full p-2 text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">الامتحان النهائي (الحد الأقصى)</label>
                  <input
                    type="number"
                    value={draftExamMax}
                    onChange={e => setDraftExamMax(parseInt(e.target.value, 10) || 60)}
                    className="w-full p-2 text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">درجة النجاح الصغرى</label>
                  <input
                    type="number"
                    value={draftMinScore}
                    onChange={e => setDraftMinScore(parseInt(e.target.value, 10) || 50)}
                    className="w-full p-2 text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition"
                >
                  حفظ المادة
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAddingNew(false); setEditingSubject(null); }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Subjects Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-right text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="p-3 font-black">كود المادة</th>
                  <th className="p-3 font-black">اسم المقرر الدراسي</th>
                  <th className="p-3 text-center font-black">الحصص/أسبوع</th>
                  <th className="p-3 text-center font-black">أعمال السنة</th>
                  <th className="p-3 text-center font-black">الامتحان</th>
                  <th className="p-3 text-center font-black">المجموع</th>
                  <th className="p-3 text-center font-black">الصغرى</th>
                  <th className="p-3 font-black">المعلم المسؤول</th>
                  <th className="p-3 text-center font-black">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subjects.map(sub => (
                  <tr key={sub.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {sub.code}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {sub.name}
                    </td>
                    <td className="p-3 text-center font-mono font-bold">
                      {sub.weeklyPeriods}
                    </td>
                    <td className="p-3 text-center font-mono font-bold">
                      {sub.courseworkMax || 40}
                    </td>
                    <td className="p-3 text-center font-mono font-bold">
                      {sub.examMax || 60}
                    </td>
                    <td className="p-3 text-center font-mono font-black text-emerald-800 dark:text-emerald-300">
                      {sub.maxScore || 100}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-500">
                      {sub.minScore || 50}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {sub.teacherName || '—'}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditClick(sub)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                          title="تعديل المادة"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(sub.code)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 transition"
                          title="حذف المادة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
