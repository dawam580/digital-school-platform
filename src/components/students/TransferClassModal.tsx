import React, { useState } from 'react';
import { Student } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { 
  ArrowRightLeft, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  School, 
  History, 
  Calendar,
  FileText
} from 'lucide-react';

interface TransferClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

const QUICK_REASONS = [
  'رغبة ولي الأمر وموافقته',
  'تخفيف الكثافة وموازنة الفصول',
  'مصلحة تعليمية وتربوية للطالب',
  'توجيه وإقرار الإدارة المدرسية',
  'تغيير الفترة أو الشعبة'
];

export const TransferClassModal: React.FC<TransferClassModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const { classes, transferStudentClass } = useSchool();
  const [selectedNewClass, setSelectedNewClass] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Available classes excluding the current class
  const availableClasses = classes.filter(c => c.name !== student.className);

  const handleTransfer = () => {
    if (!selectedNewClass) return;
    setIsSubmitting(true);
    const success = transferStudentClass(student.id, selectedNewClass, reason || undefined);
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20">
                <ArrowRightLeft className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-tajawal">نقل الطالب إلى فصل آخر</h3>
                <p className="text-xs text-white/80 font-tajawal mt-0.5">
                  إعادة قيد وترحيل الطالب {student.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 font-tajawal text-slate-800 dark:text-slate-200">
          {/* Transfer Visual Route */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between text-center gap-3">
              <div className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-[11px] text-slate-400 block font-bold mb-1">الفصل الحالي</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {student.className}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-1 text-emerald-600 dark:text-emerald-400">
                <ArrowRightLeft className="w-5 h-5 animate-pulse" />
                <span className="text-[10px] font-bold mt-1">نقل إلى</span>
              </div>

              <div className="flex-1 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 shadow-sm">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-bold mb-1">الفصل الوجهة</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                  {selectedNewClass || 'اختر فصلاً...'}
                </span>
              </div>
            </div>
          </div>

          {/* Destination Class Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              اختر الفصل الدراسي الجديد: <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
              {availableClasses.map((cls) => {
                const isSelected = selectedNewClass === cls.name;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedNewClass(cls.name)}
                    className={`flex items-center justify-between p-3 rounded-xl text-right transition-all border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <School className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">{cls.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transfer Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              سبب النقل وملاحظات الإدارة:
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب سبب النقل أو اختر من الأسباب الجاهزة أدناه..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_REASONS.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    reason === r
                      ? 'bg-teal-100 dark:bg-teal-900/60 border-teal-400 text-teal-800 dark:text-teal-200 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Previous Transfer History */}
          {student.transferHistory && student.transferHistory.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <History className="w-3.5 h-3.5" />
                سجل الانتقالات السابقة للطالب:
              </div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {student.transferHistory.map((th, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {th.fromClass} ⬅️ {th.toClass}
                      </span>
                      {th.reason && (
                        <span className="text-slate-400">({th.reason})</span>
                      )}
                    </div>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {th.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 font-tajawal">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={!selectedNewClass || isSubmitting}
            onClick={handleTransfer}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
              !selectedNewClass || isSubmitting
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20 active:scale-95'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            {isSubmitting ? 'جارٍ النقل...' : 'تأكيد نقل الفصل'}
          </button>
        </div>
      </div>
    </div>
  );
};
