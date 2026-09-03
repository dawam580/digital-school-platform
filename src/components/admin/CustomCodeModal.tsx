import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  X,
  Key,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  User,
  GraduationCap
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface CustomCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomCodeModal: React.FC<CustomCodeModalProps> = ({ isOpen, onClose }) => {
  const { currentTeacher, updateTeacherCode, showToast } = useSchool();

  const [newCode, setNewCode] = useState(currentTeacher?.code || 'LIB-MATH-01');

  if (!isOpen || !currentTeacher) return null;

  // Smart suggestions tailored for this teacher
  const teacherFirstName = currentTeacher.name.replace(/^أ\.\s*/, '').split(' ')[0] || 'المعلم';
  const subjectSlug = currentTeacher.subjectCode || 'EDU';
  const presets = [
    `أستاذ-${teacherFirstName}`,
    `${teacherFirstName}-${subjectSlug}`,
    currentTeacher.phone,
    `${subjectSlug}-1`
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      showToast('error', 'تنبيه', 'يرجى كتابة رمز مخصص.');
      return;
    }

    const success = updateTeacherCode(currentTeacher.id, newCode.trim());
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm font-cairo text-right animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Top Header Banner */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20 text-2xl">
              🏷️
            </div>
            <div>
              <h3 className="text-base font-black">تخصيص رمز الدخول الخاص بك</h3>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                اختر رمزاً سهلاً وسريع الحفظ لتسجيل دخولك دون تعقيد
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Teacher Summary Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-black flex items-center justify-center text-lg">
                👨‍🏫
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white">{currentTeacher.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">مادة: {currentTeacher.subject}</p>
              </div>
            </div>

            <div className="text-left">
              <span className="text-[10px] text-slate-400 block">الرمز الحالي:</span>
              <span className="font-mono font-black text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600 inline-block">
                {currentTeacher.code}
              </span>
            </div>
          </div>

          {/* New Code Input */}
          <div className="space-y-2">
            <label className="block text-sm font-black text-slate-800 dark:text-slate-200">
              اكتب الرمز الجديد الذي تريده:
            </label>
            <div className="relative">
              <input
                type="text"
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                placeholder="مثال: أستاذ-طارق أو رقم هاتفك"
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 text-center"
                required
                autoFocus
              />
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500">
              يمكنك كتابة اسمك بالعربي، أو رمز بالإنجليزية، أو رقم هاتفك ليسهل عليك تذكره.
            </p>
          </div>

          {/* 1-Click Smart Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
              أو اختر من الرموز المقترحة الجاهزة بنقرة واحدة:
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setNewCode(preset); sound.playTap(); }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition active:scale-95"
                >
                  ⚡ {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg transition active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ واعتماد رمزي الجديد 💾</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
