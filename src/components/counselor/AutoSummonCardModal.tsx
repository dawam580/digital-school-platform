import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  X,
  AlertTriangle,
  Mail,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  Printer,
  HeartHandshake,
  ShieldCheck,
  Send,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { AutoSummonCard, ParentSummon, SocialCaseStudy } from '../../types';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import logoImg from '../../assets/logo.png';

interface AutoSummonCardModalProps {
  card: AutoSummonCard | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (updatedCard: AutoSummonCard) => void;
  onOpenNewCase?: (studentId: string) => void;
}

export const AutoSummonCardModal: React.FC<AutoSummonCardModalProps> = ({
  card,
  isOpen,
  onClose,
  onUpdateCard,
  onOpenNewCase
}) => {
  const { setParentSummons, showToast } = useSchool();
  const [interviewNotes, setInterviewNotes] = useState(card?.interviewNotes || '');
  const [parentFeedback, setParentFeedback] = useState(card?.parentFeedback || '');
  const [summonDate, setSummonDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [summonTime, setSummonTime] = useState('09:30 ص');
  const [activeAction, setActiveAction] = useState<'view' | 'send_summon' | 'record_outcome'>('view');

  if (!isOpen || !card) return null;

  const handleSendSummon = (e: React.FormEvent) => {
    e.preventDefault();
    const newSummon: ParentSummon = {
      id: `sum-${Date.now()}`,
      studentId: card.studentId,
      studentName: card.studentName,
      parentName: card.parentName,
      parentPhone: card.parentPhone,
      reason: `استدعاء آلي ناتج عن (${card.periodLabel}): بلغ إجمالي الإنذارات ${card.totalWarningsCount} (${card.breakdown.absencesCount} غياب، ${card.breakdown.misconductCount} سلوك، ${card.breakdown.latenessCount} تأخر)`,
      requestedDate: summonDate,
      requestedTime: summonTime,
      status: 'sent',
      cardId: card.id,
      outcomeNotes: 'تم إرسال بطاقة الاستدعاء الآلية لولي الأمر.'
    };

    setParentSummons(prev => [newSummon, ...prev]);

    const updated: AutoSummonCard = {
      ...card,
      status: 'summon_sent',
      summonDate,
      summonTime
    };

    onUpdateCard(updated);
    sound.playSuccess();
    showToast('gold', 'تم إرسال الاستدعاء بنجاح ✉️', `تم توجيه الاستدعاء لولي أمر الطالب ${card.studentName}.`);
    setActiveAction('view');
  };

  const handleSaveOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AutoSummonCard = {
      ...card,
      status: 'interview_completed',
      interviewNotes,
      parentFeedback
    };

    onUpdateCard(updated);
    sound.playSuccess();
    triggerConfetti();
    showToast('success', 'تم تدوين نتيجة المقابلة ✅', `تم توثيق الاتفاق مع ولي أمر ${card.studentName}.`);
    setActiveAction('view');
  };

  const handlePrintCard = () => {
    sound.playTap();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-cairo">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold">بطاقة استدعاء تلقائية (Trigger Card)</h3>
                <span className="px-2 py-0.5 bg-red-500/30 text-red-200 font-bold text-[10px] rounded-full border border-red-400/40">
                  {card.periodType === 'weekly' ? 'عتبة أسبوعية (3+)' : 'عتبة شهرية (5+)'}
                </span>
              </div>
              <p className="text-xs text-rose-200 mt-0.5">
                توليد آلي فور بلوغ الحد التراكمي للإنذارات • مكتب الخدمة الاجتماعية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrintCard}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
              title="طباعة البطاقة"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Student Profile Overview Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 font-black text-xl flex items-center justify-center">
                ⚠️
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">{card.studentName}</h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  الصف: {card.grade} • فصل: {card.className} • الرقم الوطني: {card.studentNationalNumber}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  ولي الأمر: <strong>{card.parentName}</strong> • هاتف: <span className="font-mono text-blue-700 font-bold">{card.parentPhone}</span>
                </p>
              </div>
            </div>

            <div className="text-center sm:text-left bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">إجمالي الإنذارات المرصودة</span>
              <span className="text-2xl font-black text-red-600 font-mono">{card.totalWarningsCount}</span>
              <span className="text-[10px] text-red-700 block font-bold mt-0.5">{card.periodLabel}</span>
            </div>
          </div>

          {/* Infractions Breakdown Grid */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>تفصيل وتصنيف الإنذارات المتراكمة:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 bg-red-50/70 rounded-2xl border border-red-200">
                <span className="text-xs text-red-900 font-bold block">غياب بدون عذر</span>
                <span className="text-xl font-black text-red-700 font-mono">{card.breakdown.absencesCount}</span>
                <span className="text-[10px] text-red-600 block">حصص / أيام</span>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
                <span className="text-xs text-amber-900 font-bold block">سلوك ومشاغبة</span>
                <span className="text-xl font-black text-amber-700 font-mono">{card.breakdown.misconductCount}</span>
                <span className="text-[10px] text-amber-600 block">مخالفات صفية</span>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200">
                <span className="text-xs text-blue-900 font-bold block">تأخر صباحي</span>
                <span className="text-xl font-black text-blue-700 font-mono">{card.breakdown.latenessCount}</span>
                <span className="text-[10px] text-blue-600 block">طابور / حصة 1</span>
              </div>

              <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200">
                <span className="text-xs text-purple-900 font-bold block">واجبات مهملة</span>
                <span className="text-xl font-black text-purple-700 font-mono">{card.breakdown.academicCount}</span>
                <span className="text-[10px] text-purple-600 block">مهام غير مسلمة</span>
              </div>
            </div>
          </div>

          {/* Chronological Infractions Timeline */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800">السجل الزمني للإنذارات المرصودة:</h4>
            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              {card.infractions.map((inf, idx) => (
                <div
                  key={inf.id || idx}
                  className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{inf.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {inf.typeLabel} • الراصد: {inf.reportedBy}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {inf.date} ({inf.time})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status & Outcome Log */}
          {card.status === 'summon_sent' && (
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>تم إرسال استدعاء رسمي لولي الأمر بتاريخ: <strong>{card.summonDate}</strong> الساعة <strong>{card.summonTime}</strong></span>
              </div>
              <span className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded-lg text-[10px] font-bold">بانتظار المقابلة</span>
            </div>
          )}

          {card.status === 'interview_completed' && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تمت المقابلة وتوثيق الاتفاق مع ولي الأمر:</span>
              </div>
              <p className="text-slate-700 text-[11px]"><strong>نتائج المقابلة:</strong> {card.interviewNotes}</p>
              {card.parentFeedback && (
                <p className="text-slate-600 text-[11px]"><strong>ملاحظات وتعهد ولي الأمر:</strong> {card.parentFeedback}</p>
              )}
            </div>
          )}

          {/* Action Views */}
          {activeAction === 'send_summon' && (
            <form onSubmit={handleSendSummon} className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h5 className="font-extrabold text-amber-900 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-amber-600" />
                  <span>تحديد موعد الاستدعاء الرسمي لولي الأمر:</span>
                </h5>
                <button type="button" onClick={() => setActiveAction('view')} className="text-xs text-slate-400 hover:text-slate-700">إلغاء</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">التاريخ المقترح:</label>
                  <input
                    type="date"
                    value={summonDate}
                    onChange={e => setSummonDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الوقت المقترح:</label>
                  <input
                    type="text"
                    value={summonTime}
                    onChange={e => setSummonTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الاستدعاء الفوري لولي الأمر</span>
              </button>
            </form>
          )}

          {activeAction === 'record_outcome' && (
            <form onSubmit={handleSaveOutcome} className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h5 className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تدوين وقائع المقابلة مع ولي الأمر:</span>
                </h5>
                <button type="button" onClick={() => setActiveAction('view')} className="text-xs text-slate-400 hover:text-slate-700">إلغاء</button>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">وقائع اللقاء وتوصيات الأخصائي:</label>
                <textarea
                  rows={2}
                  value={interviewNotes}
                  onChange={e => setInterviewNotes(e.target.value)}
                  placeholder="اكتب ملخص ما تم التوصل إليه مع ولي الأمر..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">تعهد وملاحظات ولي الأمر:</label>
                <textarea
                  rows={2}
                  value={parentFeedback}
                  onChange={e => setParentFeedback(e.target.value)}
                  placeholder="تعهد بمتابعة الاستيقاظ المبكر، تنظيم وقت الأجهزة الإلكترونية..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ وتوثيق نتائج المقابلة</span>
              </button>
            </form>
          )}

          {/* Action Buttons Toolbar */}
          {activeAction === 'view' && (
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAction('send_summon')}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Mail className="w-4 h-4" />
                  <span>إصدار استدعاء لولي الأمر</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAction('record_outcome')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تدوين نتائج المقابلة</span>
                </button>

                {onOpenNewCase && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenNewCase(card.studentId);
                      onClose();
                    }}
                    className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-bold rounded-xl border border-purple-200 transition flex items-center gap-1.5"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>فتح ملف دراسة حالة</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                إغلاق
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
