import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { X, Mail, Phone, Calendar, Clock, User, Check, Send, ShieldCheck } from 'lucide-react';
import { ParentSummon } from '../../types';
import { sound } from '../../utils/soundEffects';

interface NewSummonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendSummon: (summon: ParentSummon) => void;
}

export const NewSummonModal: React.FC<NewSummonModalProps> = ({
  isOpen,
  onClose,
  onSendSummon
}) => {
  const { students } = useSchool();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [reason, setReason] = useState('مناقشة المستوى التربوي والدراسي للطالب وتنسيق خطة المتابعة المشتركة');
  const [requestedDate, setRequestedDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [requestedTime, setRequestedTime] = useState('09:30 ص');

  if (!isOpen) return null;

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const newSummon: ParentSummon = {
      id: `sum-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      parentName: selectedStudent.parentName || `ولي أمر الطالب ${selectedStudent.name}`,
      parentPhone: selectedStudent.parentPhone || '0922465676',
      reason: reason.trim(),
      requestedDate,
      requestedTime,
      status: 'sent',
      outcomeNotes: 'تم إرسال الاستدعاء عبر المنظومة وتوثيقه في سجل الخدمة الاجتماعية.'
    };

    onSendSummon(newSummon);
    sound.playSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-cairo">
      <div className="relative w-full max-w-lg bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-700 to-amber-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <Mail className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">إصدار استدعاء رسمي لولي الأمر</h3>
              <p className="text-xs text-amber-200">مكتب الخدمة الاجتماعية • وزارة التربية والتعليم - ليبيا</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-amber-200 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Student Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">اختر الطالب:</label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:outline-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.className}) - هاتف ولي الأمر: {s.parentPhone || '0922465676'}
                </option>
              ))}
            </select>
          </div>

          {/* Parent Info Preview */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-amber-950">{selectedStudent.parentName || `ولي أمر ${selectedStudent.name}`}</p>
              <p className="text-[11px] text-amber-800 font-mono">رقم التواصل: {selectedStudent.parentPhone || '0922465676'}</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-200/80 text-amber-900 rounded-xl font-bold text-[10px]">
              فصل {selectedStudent.className}
            </span>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">تاريخ المقابلة المقترح:</label>
              <input
                type="date"
                value={requestedDate}
                onChange={e => setRequestedDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">وقت المقابلة في مكتب الأخصائي:</label>
              <input
                type="text"
                value={requestedTime}
                onChange={e => setRequestedTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">سبب الاستدعاء والتوجيه الإرشادي:</label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>إشعار رسمي موجه ومسجل في سجلات الإدارة</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold shadow-md flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>إرسال وتوثيق الاستدعاء</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
