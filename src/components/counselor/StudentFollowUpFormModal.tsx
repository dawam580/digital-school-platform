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
  Calendar
} from 'lucide-react';
import {
  StudentFollowUpForm,
  AcademicLevel,
  HomeworkPerformance,
  ClassroomParticipation,
  ClassroomBehavior
} from '../../types';
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

  // Evaluation criteria
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>(existingForm?.academicLevel || 'جيد جداً');
  const [homeworkPerformance, setHomeworkPerformance] = useState<HomeworkPerformance>(existingForm?.homeworkPerformance || 'نشط');
  const [classroomParticipation, setClassroomParticipation] = useState<ClassroomParticipation>(existingForm?.classroomParticipation || 'نشط');
  const [classroomBehavior, setClassroomBehavior] = useState<ClassroomBehavior>(existingForm?.classroomBehavior || 'منضبط');

  // Subject and Teacher
  const [subjectName, setSubjectName] = useState(existingForm?.subjectName || 'الرياضيات');
  const [teacherName, setTeacherName] = useState(existingForm?.teacherName || 'أ. طارق الفيتوري');
  const [teacherNotes, setTeacherNotes] = useState(
    existingForm?.teacherNotes || 'الطالب يظهر تجاوباً إيجابياً وملتزم بمتابعة الدروس بانتظام.'
  );

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
  const [teacherSignature, setTeacherSignature] = useState(existingForm?.teacherSignature || 'معتمد إلكترونياً');
  const [counselorSignature, setCounselorSignature] = useState(existingForm?.counselorSignature || 'أ. نجوى القماطي (المرشد التربوي)');
  const [principalSignature, setPrincipalSignature] = useState(existingForm?.principalSignature || 'إدارة المدرسة المعتمدة');
  const [notifyParent, setNotifyParent] = useState(true);

  if (!isOpen) return null;

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

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
      academicLevel,
      homeworkPerformance,
      classroomParticipation,
      classroomBehavior,
      subjectName,
      teacherName,
      teacherNotes,
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
      teacherSignature,
      parentReceivedDate: notifyParent ? new Date().toISOString().split('T')[0] : undefined,
      parentAcknowledged: false
    };

    onSaveForm(form);
    sound.playSuccess();
    triggerConfetti();

    if (notifyParent) {
      addNotification(
        `📄 استمارة متابعة مستوى الطالب: ${currentStudent.name}`,
        `أصدر المرشد التربوي استمارة متابعة وتصنيف للمستوى العلمي والسلوكي للطالب في مادة ${subjectName}.`,
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-cairo">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <FileText className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">استمارة متابعة وتصنيف مستوى الطالب (النموذج الوزاري المعتمد)</h3>
                <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 font-bold text-[10px] rounded-full border border-emerald-400/40">
                  دولة ليبيا 2025 - 2026 م
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                مكتب الخدمة الاجتماعية والإرشاد التربوي • تقييم المستوى العلمي، الواجبات، المشاركة، والسلوك
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              type="button"
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
              title="طباعة الاستمارة الرسمية"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Official Libyan Header Banner */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-right space-y-0.5">
              <p className="text-[11px] text-slate-500 font-bold">دولة ليبيا • وزارة التربية والتعليم</p>
              <p className="text-xs font-black text-slate-800">مراقبة التربية والتعليم | قسم الخدمة الاجتماعية والإرشاد التربوي</p>
              <p className="text-[11px] text-emerald-700 font-bold">استمارة متابعة المستوى العلمي والسلوكي للطالب</p>
            </div>
            <img src={logoImg} alt="شعار المدرسة" className="h-12 w-auto object-contain" />
            <div className="text-left text-[11px] text-slate-500 space-y-0.5">
              <p>العام: <strong className="text-slate-800">{academicYear}</strong></p>
              <p>الفصل: <strong className="text-slate-800">{semester}</strong></p>
              <p>المرشد: <strong className="text-emerald-700">{counselorName}</strong></p>
            </div>
          </div>

          {/* Section 1: Student Selection & Profile */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-black text-slate-800 flex items-center gap-2 text-xs">
              <User className="w-4 h-4 text-emerald-600" />
              <span>البيانات الأساسية للطالب:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">اختيار الطالب من المنظومة:</label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.className} - {s.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">الرقم الوطني الليبي (12 خانة):</label>
                <input
                  type="text"
                  readOnly
                  value={currentStudent.nationalNumber || currentStudent.nationalId}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono font-bold text-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">ولي الأمر ورقم الهاتف:</label>
                <input
                  type="text"
                  readOnly
                  value={`${currentStudent.parentName || 'ولي الأمر'} (${currentStudent.parentPhone || '0922465676'})`}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-bold text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Core Academic & Classroom Criteria */}
          <div className="space-y-4">
            <h4 className="font-black text-slate-800 flex items-center gap-2 text-xs">
              <Award className="w-4 h-4 text-amber-500" />
              <span>تقييم المحاور الأربعة الأساسية (نظام خيارات مبسط للأخصائي):</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 1. المستوى العلمي */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
                <label className="font-extrabold text-slate-800 block text-xs">
                  1. المستوى العلمي والتحصيل الأكاديمي:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {(['ممتاز', 'جيد جداً', 'مقبول', 'مقبول أحياناً', 'ضعيف'] as AcademicLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => { setAcademicLevel(lvl); sound.playTap(); }}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition text-center ${
                        academicLevel === lvl
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. حل الواجبات */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
                <label className="font-extrabold text-slate-800 block text-xs">
                  2. حل الواجبات والمهام المنزلية:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['نشط', 'متوسط', 'ضعيف'] as HomeworkPerformance[]).map(hp => (
                    <button
                      key={hp}
                      type="button"
                      onClick={() => { setHomeworkPerformance(hp); sound.playTap(); }}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition text-center ${
                        homeworkPerformance === hp
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {hp}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. المشاركة الصفية */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
                <label className="font-extrabold text-slate-800 block text-xs">
                  3. المشاركة الصفية والتفاعل:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['نشط', 'متوسط', 'ضعيف'] as ClassroomParticipation[]).map(cp => (
                    <button
                      key={cp}
                      type="button"
                      onClick={() => { setClassroomParticipation(cp); sound.playTap(); }}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition text-center ${
                        classroomParticipation === cp
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cp}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. السلوك داخل الفصل */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
                <label className="font-extrabold text-slate-800 block text-xs">
                  4. السلوك والانضباط داخل الفصل:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['منضبط', 'يحتاج توجيه', 'مخالف'] as ClassroomBehavior[]).map(cb => (
                    <button
                      key={cb}
                      type="button"
                      onClick={() => { setClassroomBehavior(cb); sound.playTap(); }}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition text-center ${
                        classroomBehavior === cb
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cb}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Subject, Teacher, & Teacher Opinion */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-black text-slate-800 flex items-center gap-2 text-xs">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>المادة الدراسية ورأي المعلم:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">المادة الدراسية:</label>
                <select
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  <option value="الرياضيات">الرياضيات</option>
                  <option value="اللغة العربية">اللغة العربية</option>
                  <option value="العلوم">العلوم</option>
                  <option value="الحاسوب">الحاسوب</option>
                  <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
                  <option value="التربية الإسلامية">التربية الإسلامية</option>
                  <option value="التاريخ والجغرافيا">التاريخ والجغرافيا</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم المعلم:</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={e => setTeacherName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">آراء وملاحظات المعلم في أداء الطالب:</label>
              <textarea
                rows={2}
                value={teacherNotes}
                onChange={e => setTeacherNotes(e.target.value)}
                placeholder="اكتب ملاحظات معلم المادة حول أداء الطالب وتفاعله في الحصة..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                required
              />
            </div>
          </div>

          {/* Section 4: General Recommendations */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-black text-slate-800 flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>التوصيات العامة لمعالجة الضعف أو تعزيز التميز:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                onClick={() => setNeedsHomeworkFollowUp(!needsHomeworkFollowUp)}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${
                  needsHomeworkFollowUp ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={needsHomeworkFollowUp}
                  onChange={() => {}}
                  className="w-4 h-4 rounded text-amber-600"
                />
                <span>يحتاج إلى متابعة في الواجبات المنزلية</span>
              </label>

              <label
                onClick={() => setNeedsRemedialSupport(!needsRemedialSupport)}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${
                  needsRemedialSupport ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={needsRemedialSupport}
                  onChange={() => {}}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span>يحتاج إلى دعم التعليم الإضافي وحصص التقوية</span>
              </label>

              <label
                onClick={() => setNeedsBehavioralGuidance(!needsBehavioralGuidance)}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${
                  needsBehavioralGuidance ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={needsBehavioralGuidance}
                  onChange={() => {}}
                  className="w-4 h-4 rounded text-purple-600"
                />
                <span>يحتاج إلى توجيه سلوكي وإرشاد فردي</span>
              </label>

              <label
                onClick={() => setEncourageGoodLevel(!encourageGoodLevel)}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${
                  encourageGoodLevel ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={encourageGoodLevel}
                  onChange={() => {}}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span>يشجع على الاستمرار في مستواه الجيد والمتميز</span>
              </label>
            </div>

            <div className="space-y-1 pt-1">
              <label className="font-bold text-slate-700">ملاحظة وتوجيه إضافي إن وجد:</label>
              <input
                type="text"
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                placeholder="أي ملاحظة أو توجيه خاص لولي الأمر أو إدارة المدرسة..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>

          {/* Section 5: Signatures & Parent Notification */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-black text-slate-800 text-xs">الاعتماد والتوقيعات الرسمية:</h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[11px]">
              <div className="p-2.5 bg-white rounded-xl border space-y-1">
                <span className="text-slate-400 block">توقيع المعلم</span>
                <span className="font-bold text-slate-800">{teacherName}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border space-y-1">
                <span className="text-slate-400 block">توقيع المرشد التربوي</span>
                <span className="font-bold text-emerald-700">{counselorName}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border space-y-1">
                <span className="text-slate-400 block">مدير المدرسة</span>
                <span className="font-bold text-purple-700">{principalSignature}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border space-y-1">
                <span className="text-slate-400 block">تاريخ الإعداد</span>
                <span className="font-mono font-bold text-slate-800">{preparedDate}</span>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyParent}
                onChange={e => setNotifyParent(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600"
              />
              <span className="font-bold text-slate-800 text-xs">
                إرسال إشعار مباشر لولي الأمر بهذه الاستمارة لتوثيق الاستلام والمتابعة
              </span>
            </label>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-2xl shadow-lg flex items-center gap-2 text-xs active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ واعتماد استمارة المتابعة</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة النموذج الرسمي (PDF)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-2xl text-xs"
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
