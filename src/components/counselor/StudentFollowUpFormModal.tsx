import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  X,
  FileText,
  User,
  BookOpen,
  Award,
  CheckSquare,
  Square,
  Printer,
  Send,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import {
  StudentFollowUpForm,
  SubjectEvaluation,
  AcademicLevel,
  HomeworkPerformance,
  ClassroomParticipation,
  ClassroomBehavior
} from '../../types';
import { DEFAULT_LIBYAN_SUBJECT_EVALUATIONS } from '../../services/db';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import logoImg from '../../assets/logo.png';

interface StudentFollowUpFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveForm: (form: StudentFollowUpForm) => void;
  initialStudentId?: string;
  existingForm?: StudentFollowUpForm | null;
}

export const StudentFollowUpFormModal: React.FC<StudentFollowUpFormModalProps> = ({
  isOpen,
  onClose,
  onSaveForm,
  initialStudentId,
  existingForm
}) => {
  const { students, teachers, showToast, addNotification } = useSchool();

  const [selectedStudentId, setSelectedStudentId] = useState(
    existingForm?.studentId || initialStudentId || students[0]?.id || ''
  );

  const [academicYear, setAcademicYear] = useState(existingForm?.academicYear || '2025 - 2026 م');
  const [semester, setSemester] = useState(existingForm?.semester || 'الفصل الدراسي الأول');
  const [counselorName, setCounselorName] = useState(existingForm?.counselorName || 'أ. نجوى القماطي');

  // Overall Academic Level
  const [overallAcademicLevel, setOverallAcademicLevel] = useState<AcademicLevel>(
    existingForm?.overallAcademicLevel || 'جيد جداً'
  );

  // Full List of Subject Evaluations
  const [subjectEvaluations, setSubjectEvaluations] = useState<SubjectEvaluation[]>(() => {
    if (existingForm?.subjectEvaluations && existingForm.subjectEvaluations.length > 0) {
      return existingForm.subjectEvaluations;
    }
    return DEFAULT_LIBYAN_SUBJECT_EVALUATIONS;
  });

  // Recommendations checkboxes
  const [needsHomeworkFollowUp, setNeedsHomeworkFollowUp] = useState(
    existingForm?.recommendations.needsHomeworkFollowUp ?? false
  );
  const [needsRemedialSupport, setNeedsRemedialSupport] = useState(
    existingForm?.recommendations.needsRemedialSupport ?? false
  );
  const [needsBehavioralGuidance, setNeedsBehavioralGuidance] = useState(
    existingForm?.recommendations.needsBehavioralGuidance ?? false
  );
  const [encourageGoodLevel, setEncourageGoodLevel] = useState(
    existingForm?.recommendations.encourageGoodLevel ?? true
  );
  const [customNote, setCustomNote] = useState(existingForm?.recommendations.customNote || '');

  // Signatures
  const [preparedDate, setPreparedDate] = useState(
    existingForm?.preparedDate || new Date().toISOString().split('T')[0]
  );
  const [counselorSignature, setCounselorSignature] = useState(
    existingForm?.counselorSignature || 'أ. نجوى القماطي (المرشد التربوي)'
  );
  const [principalSignature, setPrincipalSignature] = useState(
    existingForm?.principalSignature || 'إدارة المدرسة المعتمدة'
  );
  const [notifyParent, setNotifyParent] = useState(true);

  if (!isOpen) return null;

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handleSubjectFieldChange = (
    index: number,
    field: keyof SubjectEvaluation,
    value: any
  ) => {
    setSubjectEvaluations(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const form: StudentFollowUpForm = {
      id: existingForm?.id || `followup-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentNationalNumber: currentStudent.nationalNumber || currentStudent.nationalId,
      grade: currentStudent.grade,
      className: currentStudent.className,
      academicYear,
      semester,
      counselorName,
      parentName: currentStudent.parentName || `ولي أمر الطالب ${currentStudent.name}`,
      parentPhone: currentStudent.parentPhone || '0922465676',
      overallAcademicLevel,
      subjectEvaluations,
      recommendations: {
        needsHomeworkFollowUp,
        needsRemedialSupport,
        needsBehavioralGuidance,
        encourageGoodLevel,
        customNote: customNote.trim() ? customNote : undefined
      },
      preparedDate,
      counselorSignature,
      principalSignature,
      parentReceivedDate: notifyParent ? new Date().toISOString().split('T')[0] : undefined,
      parentAcknowledged: false
    };

    onSaveForm(form);
    sound.playSuccess();
    triggerConfetti();

    if (notifyParent) {
      addNotification(
        `📄 استمارة متابعة وتصنيف مستوى الطالب: ${currentStudent.name}`,
        `أصدر المرشد التربوي استمارة المتابعة الشاملة لجميع المواد الدراسية مع تقييم الواجبات والسلوك.`,
        'academic',
        currentStudent.name
      );
      showToast('gold', 'تم حفظ وتوجيه الاستمارة 🌟', `تم إصدار استمارة متابعة الطالب ${currentStudent.name} وإشعار ولي الأمر.`);
    } else {
      showToast('success', 'تم حفظ الاستمارة بنجاح 📝', `تم حفظ تقييم الطالب ${currentStudent.name} في الأرشيف.`);
    }

    onClose();
  };

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-cairo">
      <div className="relative w-full max-w-5xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh] text-right">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-2xl border border-white/20">
              <FileText className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">استمارة متابعة وتصنيف مستوى الطالب (كافة المواد الدراسية)</h3>
                <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 font-bold text-[10px] rounded-full border border-emerald-400/40">
                  دولة ليبيا 2025 - 2026 م
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                مكتب الخدمة الاجتماعية والإرشاد التربوي • قائمة المواد كاملة مع التصنيف والملاحظات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              type="button"
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
              title="طباعة الاستمارة الرسمية (PDF)"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs">
          
          {/* Official Libyan Header Banner (Printable) */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-right space-y-0.5">
              <p className="text-[10px] text-slate-500 font-bold">دولة ليبيا • وزارة التربية والتعليم</p>
              <p className="text-xs font-black text-slate-800">مراقبة التربية والتعليم | قسم الخدمة الاجتماعية والإرشاد التربوي</p>
              <p className="text-[11px] text-emerald-700 font-bold">استمارة متابعة وتصنيف المستوى العلمي والسلوكي للطالب</p>
            </div>
            <img src={logoImg} alt="شعار المدرسة" className="h-10 w-auto object-contain" />
            <div className="text-left text-[10px] text-slate-500 space-y-0.5">
              <p>العام: <strong className="text-slate-800">{academicYear}</strong></p>
              <p>الفصل: <strong className="text-slate-800">{semester}</strong></p>
              <p>المرشد: <strong className="text-emerald-700">{counselorName}</strong></p>
            </div>
          </div>

          {/* Section 1: Basic Student Info & General Level */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-slate-700 block">اختيار الطالب:</label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold text-xs"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">الرقم الوطني (12 خانة):</label>
                <input
                  type="text"
                  readOnly
                  value={currentStudent.nationalNumber || currentStudent.nationalId}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-100 font-mono font-bold text-slate-600 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">ولي الأمر والهاتف:</label>
                <input
                  type="text"
                  readOnly
                  value={`${currentStudent.parentName || 'ولي الأمر'} (${currentStudent.parentPhone || '0922465676'})`}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-100 font-bold text-slate-600 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">التقييم العام للمستوى:</label>
                <select
                  value={overallAcademicLevel}
                  onChange={e => setOverallAcademicLevel(e.target.value as AcademicLevel)}
                  className="w-full p-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 font-black text-xs"
                >
                  <option value="ممتاز">ممتاز ⭐</option>
                  <option value="جيد جداً">جيد جداً ✨</option>
                  <option value="مقبول">مقبول 👍</option>
                  <option value="مقبول أحياناً">مقبول أحياناً ⚖️</option>
                  <option value="ضعيف">ضعيف ⚠️</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Complete List of School Subjects (نظام قائمة كاملة باينة للمواد مع التقييم نظام ليست) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-800 flex items-center gap-2 text-xs">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>قائمة تقييم المواد الدراسية كاملة (نظام القوائم المباشرة لكل مادة):</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-bold">
                جميع المواد مقررة من وزارة التربية والتعليم - ليبيا
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-xs text-right divide-y divide-slate-100">
                <thead className="bg-slate-100 text-slate-800 font-extrabold text-[11px]">
                  <tr>
                    <th className="p-2.5 w-36">المادة الدراسية</th>
                    <th className="p-2.5 w-32">المعلم</th>
                    <th className="p-2.5 w-32">المستوى العلمي</th>
                    <th className="p-2.5 w-24">الواجبات</th>
                    <th className="p-2.5 w-24">المشاركة</th>
                    <th className="p-2.5 w-28">السلوك</th>
                    <th className="p-2.5">آراء وملاحظات المعلم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjectEvaluations.map((sub, idx) => (
                    <tr key={sub.subjectName} className="hover:bg-slate-50/80 transition">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50/50">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{sub.subjectName}</span>
                        </div>
                      </td>
                      
                      <td className="p-2">
                        <input
                          type="text"
                          value={sub.teacherName}
                          onChange={e => handleSubjectFieldChange(idx, 'teacherName', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold"
                          placeholder="اسم المعلم"
                        />
                      </td>

                      <td className="p-2">
                        <select
                          value={sub.academicLevel}
                          onChange={e => handleSubjectFieldChange(idx, 'academicLevel', e.target.value as AcademicLevel)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-emerald-800"
                        >
                          <option value="ممتاز">ممتاز ⭐</option>
                          <option value="جيد جداً">جيد جداً ✨</option>
                          <option value="مقبول">مقبول 👍</option>
                          <option value="مقبول أحياناً">مقبول أحياناً ⚖️</option>
                          <option value="ضعيف">ضعيف ⚠️</option>
                        </select>
                      </td>

                      <td className="p-2">
                        <select
                          value={sub.homeworkPerformance}
                          onChange={e => handleSubjectFieldChange(idx, 'homeworkPerformance', e.target.value as HomeworkPerformance)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-blue-800"
                        >
                          <option value="نشط">نشط 🟢</option>
                          <option value="متوسط">متوسط 🟡</option>
                          <option value="ضعيف">ضعيف 🔴</option>
                        </select>
                      </td>

                      <td className="p-2">
                        <select
                          value={sub.classroomParticipation}
                          onChange={e => handleSubjectFieldChange(idx, 'classroomParticipation', e.target.value as ClassroomParticipation)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-teal-800"
                        >
                          <option value="نشط">نشط 🟢</option>
                          <option value="متوسط">متوسط 🟡</option>
                          <option value="ضعيف">ضعيف 🔴</option>
                        </select>
                      </td>

                      <td className="p-2">
                        <select
                          value={sub.classroomBehavior}
                          onChange={e => handleSubjectFieldChange(idx, 'classroomBehavior', e.target.value as ClassroomBehavior)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-purple-800"
                        >
                          <option value="منضبط">منضبط 🟢</option>
                          <option value="يحتاج توجيه">يحتاج توجيه 🟡</option>
                          <option value="مخالف">مخالف 🔴</option>
                        </select>
                      </td>

                      <td className="p-2">
                        <input
                          type="text"
                          value={sub.teacherNotes}
                          onChange={e => handleSubjectFieldChange(idx, 'teacherNotes', e.target.value)}
                          placeholder="رأي المعلم وملاحظته الصفية..."
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Recommendations (مربعات الاختيار) */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5">
            <h4 className="font-black text-slate-800 flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>التوصيات العامة لمعالجة الضعف أو تعزيز التميز:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                onClick={() => setNeedsHomeworkFollowUp(!needsHomeworkFollowUp)}
                className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                  needsHomeworkFollowUp ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={needsHomeworkFollowUp}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 rounded text-amber-600"
                />
                <span className="text-[11px]">يحتاج إلى متابعة في الواجبات المنزلية</span>
              </label>

              <label
                onClick={() => setNeedsRemedialSupport(!needsRemedialSupport)}
                className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                  needsRemedialSupport ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={needsRemedialSupport}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 rounded text-blue-600"
                />
                <span className="text-[11px]">يحتاج إلى دعم التعليم الإضافي وحصص التقوية</span>
              </label>

              <label
                onClick={() => setNeedsBehavioralGuidance(!needsBehavioralGuidance)}
                className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                  needsBehavioralGuidance ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={needsBehavioralGuidance}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 rounded text-purple-600"
                />
                <span className="text-[11px]">يحتاج إلى توجيه سلوكي وإرشاد فردي</span>
              </label>

              <label
                onClick={() => setEncourageGoodLevel(!encourageGoodLevel)}
                className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                  encourageGoodLevel ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={encourageGoodLevel}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 rounded text-emerald-600"
                />
                <span className="text-[11px]">يشجع على الاستمرار في مستواه الجيد والمتميز</span>
              </label>
            </div>

            <div className="space-y-1 pt-1">
              <label className="font-bold text-slate-700 text-[11px]">ملاحظة إضافية مخصصة إن وجدت:</label>
              <input
                type="text"
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                placeholder="اكتب أي ملاحظة أو توجيه خاص لولي الأمر..."
                className="w-full p-2 rounded-xl border border-slate-200 bg-white text-[11px]"
              />
            </div>
          </div>

          {/* Section 4: Signatures & Parent Notification */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
              <div className="p-2 bg-white rounded-xl border">
                <span className="text-slate-400 block">توقيع المعلمين</span>
                <span className="font-bold text-slate-800">معتمد في المنظومة</span>
              </div>
              <div className="p-2 bg-white rounded-xl border">
                <span className="text-slate-400 block">المرشد التربوي</span>
                <span className="font-bold text-emerald-700">{counselorName}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border">
                <span className="text-slate-400 block">مدير المدرسة</span>
                <span className="font-bold text-purple-700">{principalSignature}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border">
                <span className="text-slate-400 block">تاريخ الإعداد</span>
                <span className="font-mono font-bold text-slate-800">{preparedDate}</span>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyParent}
                onChange={e => setNotifyParent(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600"
              />
              <span className="font-bold text-slate-800 text-[11px]">
                إرسال إشعار فوري لولي الأمر لتوثيق استلام تقرير ومستوى الطالب
              </span>
            </label>
          </div>

          {/* Action Footer */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md flex items-center gap-1.5 text-xs active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ واعتماد استمارة المتابعة</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة وتصدير (PDF)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
