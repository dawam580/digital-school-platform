import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Assignment } from '../../types';
import { Award, BookOpen, Check, CheckCircle2, Clock, FileText, HelpCircle, Plus, Send, Sparkles, X } from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { selectedStudent, currentRole, submitAssignment } = useSchool();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'submitted'>('all');
  const [activeAssignmentToSolve, setActiveAssignmentToSolve] = useState<Assignment | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [solvedResult, setSolvedResult] = useState<{ score: number; total: number } | null>(null);

  const assignments = selectedStudent.assignments || [];
  const filteredAssignments = assignments.filter(a => {
    if (activeFilter === 'pending') return a.status === 'pending';
    if (activeFilter === 'submitted') return a.status === 'submitted';
    return true;
  });

  const handleStartSolve = (asg: Assignment) => {
    setActiveAssignmentToSolve(asg);
    setUserAnswers({});
    setSolvedResult(null);
  };

  const handleOptionSelect = (qId: string, optIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmitSolution = () => {
    if (!activeAssignmentToSolve) return;

    let totalScore = 0;
    activeAssignmentToSolve.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        totalScore += q.points;
      }
    });

    submitAssignment(selectedStudent.id, activeAssignmentToSolve.id, totalScore, 'تم التصحيح والتقييم الآلي الفوري بنجاح ممتاز.');
    setSolvedResult({ score: totalScore, total: activeAssignmentToSolve.totalPoints });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-purple-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-400 flex items-center justify-center text-3xl shadow-xl">
              📝
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black">بنك الواجبات الإلكترونية التفاعلية</h1>
                <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-xl border border-purple-500/30">
                  حل وتصحيح فوري
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                حل الواجبات المدرسية إلكترونياً وكسب نقاط التميز والشارات الذكية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              الكل ({assignments.length})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'pending' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              مطلوب حله ({assignments.filter(a => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveFilter('submitted')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'submitted' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              تم التسليم ({assignments.filter(a => a.status === 'submitted').length})
            </button>
          </div>
        </div>
      </div>

      {/* Assignment Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((asg) => {
          const isPending = asg.status === 'pending';

          return (
            <div
              key={asg.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${
                isPending
                  ? 'border-purple-200 dark:border-purple-900/50 shadow-sm'
                  : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
              }`}
            >
              <div className="space-y-4">
                {/* Subject & Status */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-xl text-xs font-bold">
                    <BookOpen className="w-3.5 h-3.5" />
                    {asg.subject}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black ${
                      isPending
                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 animate-pulse'
                        : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {isPending ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        قيد الانتظار
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        تم الحل بنجاح
                      </>
                    )}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-purple-600 transition">
                    {asg.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {asg.description}
                  </p>
                </div>

                {/* Teacher and Due Date */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">المعلم المشرف:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{asg.teacherName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">موعد التسليم:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{asg.dueDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">الدرجة المخصصة:</span>
                    <span className="font-black text-blue-600 dark:text-blue-400">{asg.totalPoints} درجات (+5 سلوك)</span>
                  </div>
                </div>

                {/* Feedback if graded */}
                {!isPending && asg.studentScore !== undefined && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">درجة الطالب المحققة:</span>
                      <span className="font-black text-base text-emerald-600 dark:text-emerald-400 font-mono">
                        {asg.studentScore} / {asg.totalPoints}
                      </span>
                    </div>
                    {asg.teacherFeedback && (
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1 font-medium">
                        💬 {asg.teacherFeedback}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                {isPending ? (
                  <button
                    onClick={() => handleStartSolve(asg)}
                    className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black py-3 px-4 rounded-2xl shadow-lg hover:shadow-purple-500/25 transition flex items-center justify-center gap-2 text-sm active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>ابدأ حل الواجب تفاعلياً الآن</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartSolve(asg)}
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-4 rounded-2xl transition flex items-center justify-center gap-2 text-xs"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>مراجعة الإجابات والشرح</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Quiz / Assignment Solver Modal */}
      {activeAssignmentToSolve && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative my-8 animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                  📝
                </div>
                <div>
                  <h3 className="font-black text-lg">{activeAssignmentToSolve.title}</h3>
                  <p className="text-xs text-slate-300">{activeAssignmentToSolve.subject} • {activeAssignmentToSolve.teacherName}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveAssignmentToSolve(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions Container */}
            <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {solvedResult ? (
                /* Solved Celebration Screen */
                <div className="text-center py-8 space-y-4 animate-scaleUp">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
                    🎉
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">تم تصحيح الواجب بنجاح!</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      حصلت على <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">{solvedResult.score} من {solvedResult.total}</span>
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl inline-flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs font-bold">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>تمت إضافة +5 نقاط تميز وسلوك إيجابي إلى رصيد الطالب!</span>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setActiveAssignmentToSolve(null)}
                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black px-6 py-3 rounded-2xl text-sm transition shadow-lg"
                    >
                      إغلاق والعودة للواجبات
                    </button>
                  </div>
                </div>
              ) : (
                /* Questions Form */
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-4 rounded-2xl text-xs text-blue-800 dark:text-blue-300 font-medium flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>اختر الإجابة الصحيحة لكل سؤال، وسيتم التصحيح الفوري ورصد الدرجة تلقائياً.</span>
                  </div>

                  {activeAssignmentToSolve.questions.map((q, idx) => (
                    <div key={q.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          <span className="text-purple-600 dark:text-purple-400 ml-2">سؤال {idx + 1}:</span>
                          {q.text}
                        </h4>
                        <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0">
                          {q.points} درجات
                        </span>
                      </div>

                      {/* Options */}
                      <div className="space-y-2 pt-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswers[q.id] === optIdx;

                          return (
                            <label
                              key={optIdx}
                              onClick={() => handleOptionSelect(q.id, optIdx)}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? 'border-white bg-white' : 'border-slate-400'
                                }`}
                              >
                                {isSelected && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                              </div>
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Submit Button */}
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleSubmitSolution}
                      disabled={Object.keys(userAnswers).length < activeAssignmentToSolve.questions.length}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black px-6 py-3 rounded-2xl text-sm transition shadow-lg flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>تسليم وتصحيح الواجب فورياً</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
