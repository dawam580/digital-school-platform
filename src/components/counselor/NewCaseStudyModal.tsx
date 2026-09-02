import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { X, Sparkles, AlertTriangle, ShieldCheck, HeartHandshake, User, Plus, Check } from 'lucide-react';
import { SocialCaseStudy } from '../../types';
import { LIBYAN_COMMON_PROBLEMS } from '../../services/counselor/libyanSchoolProblems';
import { sound } from '../../utils/soundEffects';

interface NewCaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCase: (newCase: SocialCaseStudy) => void;
  initialProblemId?: string;
}

export const NewCaseStudyModal: React.FC<NewCaseStudyModalProps> = ({
  isOpen,
  onClose,
  onSaveCase,
  initialProblemId
}) => {
  const { students } = useSchool();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<SocialCaseStudy['category']>('absence_dropout');
  const [priority, setPriority] = useState<SocialCaseStudy['priority']>('medium');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [actionPlanItems, setActionPlanItems] = useState<string[]>([
    'عقد جلسة استماع فردية مع الطالب في بيئة آمنة وهادئة.',
    'التواصل مع ولي الأمر وتنسيق خطة الدعم المشتركة.'
  ]);
  const [newItemText, setNewItemText] = useState('');
  const [parentEngagement, setParentEngagement] = useState<SocialCaseStudy['parentEngagement']>('cooperative');

  if (!isOpen) return null;

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handleApplyPreset = (probId: string) => {
    const prob = LIBYAN_COMMON_PROBLEMS.find(p => p.id === probId);
    if (prob) {
      setSelectedCategory(prob.category);
      setSymptoms(prob.symptoms.slice(0, 2).join(' '));
      setDiagnosis(prob.description);
      setActionPlanItems(prob.approvedInterventions);
      sound.playSuccess();
    }
  };

  const handleAddPlanItem = () => {
    if (newItemText.trim()) {
      setActionPlanItems([...actionPlanItems, newItemText.trim()]);
      setNewItemText('');
      sound.playTap();
    }
  };

  const handleRemovePlanItem = (index: number) => {
    setActionPlanItems(actionPlanItems.filter((_, i) => i !== index));
    sound.playTap();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const categoryMap: Record<SocialCaseStudy['category'], string> = {
      absence_dropout: 'الغياب المتكرر وخطر الانقطاع',
      behavior_bullying: 'التنمر والعنف والمشاحنات',
      academic_lag: 'التأخر الدراسي وصعوبات التعلم',
      family_socioeconomic: 'الظروف الأسرية والاقتصادية',
      psychological_crisis: 'الضغوط النفسية وقلق الامتحانات',
      special_needs: 'الدمج التربوي وصعوبات النطق'
    };

    const newCase: SocialCaseStudy = {
      id: `case-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentNationalNumber: selectedStudent.nationalNumber || selectedStudent.nationalId,
      grade: selectedStudent.grade,
      className: selectedStudent.className,
      category: selectedCategory,
      categoryLabel: categoryMap[selectedCategory],
      status: 'in_progress',
      priority,
      openDate: new Date().toISOString().split('T')[0],
      symptomsAndObservations: symptoms.trim() || 'ملاحظات سلوكية وتحصيلية أولية مسجلة من إدارة الفصل.',
      diagnosis: diagnosis.trim() || 'تحت التقييم الإرشادي الأولي.',
      actionPlan: actionPlanItems,
      parentEngagement,
      progressEvaluation: 'تم فتح الملف وبدء تنفيذ بنود الخطة الإرشادية.',
      sessionsCount: 0
    };

    onSaveCase(newCase);
    sound.playSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-cairo">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <HeartHandshake className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">فتح ملف دراسة حالة فردية سرية</h3>
              <p className="text-xs text-emerald-200">مكتب الخدمة الاجتماعية والنفسية • وزارة التربية والتعليم - ليبيا</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Preset Quick Loader */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-900 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>تحميل نموذج تدخّل مسبق من مكتبة المشكلات الليبية:</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {LIBYAN_COMMON_PROBLEMS.map(prob => (
                <button
                  key={prob.id}
                  type="button"
                  onClick={() => handleApplyPreset(prob.id)}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-700 text-[11px] font-bold border border-emerald-200 transition-colors shadow-sm"
                >
                  {prob.title.split(' ')[0]} {prob.title.split(' ')[1] || ''}
                </button>
              ))}
            </div>
          </div>

          {/* Student Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">اختر الطالب المعني بالحالة:</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.className}) - رقم وطني: {s.nationalNumber || s.nationalId}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">تصنيف المشكلة التربوية/السلوكية:</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="absence_dropout">الغياب المتكرر وخطر الانقطاع</option>
                <option value="behavior_bullying">التنمر والعنف والمشاحنات</option>
                <option value="academic_lag">التأخر الدراسي وصعوبات التعلم</option>
                <option value="family_socioeconomic">الظروف الأسرية والاقتصادية</option>
                <option value="psychological_crisis">الضغوط النفسية وقلق الامتحانات</option>
                <option value="special_needs">الدمج التربوي وصعوبات النطق</option>
              </select>
            </div>
          </div>

          {/* Priority and Parent Engagement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">درجة الأولوية والأهمية:</label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'urgent', label: 'عاجلة جداً', color: 'bg-red-100 text-red-800' },
                  { id: 'high', label: 'مرتفعة', color: 'bg-amber-100 text-amber-800' },
                  { id: 'medium', label: 'متوسطة', color: 'bg-blue-100 text-blue-800' },
                  { id: 'low', label: 'اعتيادية', color: 'bg-slate-100 text-slate-800' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setPriority(p.id as any); sound.playTap(); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      priority === p.id ? `${p.color} border-current ring-2 ring-emerald-400 font-black` : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">تجاوب وتعاون ولي الأمر:</label>
              <select
                value={parentEngagement}
                onChange={e => setParentEngagement(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:outline-none"
              >
                <option value="cooperative">متعاون وإيجابي جداً</option>
                <option value="partial">تجاوب جزئي / متقطع</option>
                <option value="unresponsive">غير متجاوب / بحاجة لاستدعاء رسمي</option>
              </select>
            </div>
          </div>

          {/* Symptoms and Observations */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">الأعراض والملاحظات المرصودة:</label>
            <textarea
              rows={2}
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="اكتب الملاحظات المرصودة من المعلمين أو إدارة المدرسة..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              required
            />
          </div>

          {/* Diagnosis & Assessment */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">التشخيص الإرشادي المبدئي:</label>
            <textarea
              rows={2}
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
              placeholder="التشخيص المبدئي لحالة الطالب من قبل الأخصائي الاجتماعي..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              required
            />
          </div>

          {/* Action Plan Items */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700">بنود الخطة العلاجية والتربوية المقترحة:</label>
            <div className="space-y-1.5">
              {actionPlanItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-800">{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePlanItem(idx)}
                    className="text-red-500 hover:text-red-700 text-xs px-2 py-0.5"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="إضافة بند جديد للخطة العلاجية..."
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPlanItem(); } }}
                className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-xs"
              />
              <button
                type="button"
                onClick={handleAddPlanItem}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ملف سري ومحمي وفق لوائح الخدمة الاجتماعية بوزارة التعليم</span>
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
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>حفظ وفتح ملف الحالة</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
