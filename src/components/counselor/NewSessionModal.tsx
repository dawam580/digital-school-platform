import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { X, Calendar, Clock, User, Check, MessageSquare, BookOpen, Sparkles } from 'lucide-react';
import { CounselingSession, SocialCaseStudy } from '../../types';
import { sound } from '../../utils/soundEffects';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (session: CounselingSession) => void;
  caseStudies: SocialCaseStudy[];
  preselectedCaseId?: string;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  isOpen,
  onClose,
  onSaveSession,
  caseStudies,
  preselectedCaseId
}) => {
  const { students } = useSchool();
  const [selectedCaseId, setSelectedCaseId] = useState(preselectedCaseId || (caseStudies[0]?.id || ''));
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [sessionType, setSessionType] = useState<CounselingSession['sessionType']>('individual');
  const [objective, setObjective] = useState('');
  const [discussionSummary, setDiscussionSummary] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionTime, setSessionTime] = useState('10:00 ص');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const currentCase = caseStudies.find(c => c.id === selectedCaseId);
  const studentName = currentCase ? currentCase.studentName : (students.find(s => s.id === selectedStudentId)?.name || 'طالب');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: CounselingSession = {
      id: `ses-${Date.now()}`,
      caseId: selectedCaseId || undefined,
      studentId: currentCase ? currentCase.studentId : selectedStudentId,
      studentName,
      date: sessionDate,
      time: sessionTime,
      sessionType,
      objective: objective.trim() || 'جلسة إرشاد ومتابعة سلوكية وتربوية',
      discussionSummary: discussionSummary.trim(),
      recommendations: recommendations.trim(),
      nextFollowUpDate,
      counselorName: 'أ. نجوى القماطي'
    };

    onSaveSession(newSession);
    sound.playSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-cairo">
      <div className="relative w-full max-w-xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <MessageSquare className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">توثيق جلسة إرشادية جديدة</h3>
              <p className="text-xs text-blue-200">مكتب الخدمة الاجتماعية • جلسات التوجيه والمتابعة الفردية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Case Study / Student Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">ربط الجلسة بملف دراسة حالة:</label>
            <select
              value={selectedCaseId}
              onChange={e => setSelectedCaseId(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="">-- جلسة إرشاد عامة غير مقيدة بملف --</option>
              {caseStudies.map(cs => (
                <option key={cs.id} value={cs.id}>
                  ملف: {cs.studentName} ({cs.className}) - {cs.categoryLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Session Type */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">نوع الجلسة الإرشادية:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'individual', label: 'إرشاد فردي' },
                { id: 'group', label: 'إرشاد جمعي' },
                { id: 'parent_conference', label: 'مؤتمر ولي أمر' },
                { id: 'teacher_consultation', label: 'استشارة معلّم' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setSessionType(t.id as any); sound.playTap(); }}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                    sessionType === t.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-black'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">تاريخ الجلسة:</label>
              <input
                type="date"
                value={sessionDate}
                onChange={e => setSessionDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">توقيت الجلسة:</label>
              <input
                type="text"
                placeholder="10:00 ص"
                value={sessionTime}
                onChange={e => setSessionTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">موعد المتابعة القادم:</label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={e => setNextFollowUpDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
              />
            </div>
          </div>

          {/* Objective */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">الهدف من الجلسة:</label>
            <input
              type="text"
              placeholder="مثال: تعزيز الثقة في الإلقاء، تنظيم جدول المذاكرة، معالجة أسباب التأخر..."
              value={objective}
              onChange={e => setObjective(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              required
            />
          </div>

          {/* Discussion Summary */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">وقائع وملخص ما تم مناقشته:</label>
            <textarea
              rows={3}
              placeholder="أبرز النقاط والمشاعر والملاحظات التي تم تداولها خلال الجلسة..."
              value={discussionSummary}
              onChange={e => setDiscussionSummary(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              required
            />
          </div>

          {/* Recommendations & Agreement */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">التوصيات والاتفاق المبرم:</label>
            <textarea
              rows={2}
              placeholder="التوصيات المسندة للطالب، لولي الأمر، أو لمعلمي المواد..."
              value={recommendations}
              onChange={e => setRecommendations(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">الأخصائية الاجتماعية: أ. نجوى القماطي</span>

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
                className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>حفظ وتوثيق الجلسة</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
