import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { KeyRound, CheckCircle2, UserPlus, HelpCircle, ArrowLeft, School, Sparkles } from 'lucide-react';
import { Student } from '../../types';
import { sound } from '../../utils/soundEffects';

export const LinkStudent: React.FC = () => {
  const { students, linkStudent, setSelectedStudent, setActiveTab } = useSchool();
  const [linkCode, setLinkCode] = useState('');
  const [linkedStudent, setLinkedStudent] = useState<Student | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLink = (e: React.FormEvent) => {
    e.preventDefault();
    const query = linkCode.trim();
    if (!query) return;

    setLoading(true);
    setErrorMessage('');
    
    setTimeout(() => {
      // Find matching student by link code, student number, or national ID
      const found = students.find(
        s => s.linkCode.toLowerCase() === query.toLowerCase() ||
             s.studentNumber.toLowerCase() === query.toLowerCase() ||
             s.nationalId === query
      );

      if (found) {
        setLinkedStudent(found);
        setSelectedStudent(found);
        sound.playSuccess();
      } else {
        setLinkedStudent(null);
        setErrorMessage('كود الربط غير صحيح، يرجى التأكد من الكود المسلم من إدارة المدرسة.');
        sound.playAlert();
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            إضافة طالب جديد
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            اربط ملف ابنك أو ابنتك بحسابك لمتابعة الحضور والتقارير اليومية
          </p>
        </div>
        <button
          onClick={() => setActiveTab('student-profile')}
          className="text-xs font-bold text-[#00288e] hover:underline flex items-center gap-1"
        >
          <span>تخطي للملف</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Main Linking Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6">
        
        <form onSubmit={handleLink} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">
              كود الربط
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="أدخل كود الربط (مثال: SCH-2026-R1)"
                value={linkCode}
                onChange={e => setLinkCode(e.target.value)}
                className="w-full px-4 py-3.5 pr-11 text-base font-mono rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all text-slate-800 placeholder:font-sans placeholder:text-slate-400 uppercase"
                required
              />
              <KeyRound className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            <p className="text-xs text-slate-400">
              💡 كود تجريبي سريع: <button type="button" onClick={() => setLinkCode('SCH-2026-R1')} className="font-bold text-[#00288e] hover:underline">SCH-2026-R1</button> (ريان العتيبي) أو <button type="button" onClick={() => setLinkCode('SCH-2026-S2')} className="font-bold text-[#00288e] hover:underline">SCH-2026-S2</button> (سارة القحطاني)
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#00288e] hover:bg-[#002072] text-white font-bold text-base rounded-2xl shadow-soft hover:shadow-soft-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5" />
            <span>{loading ? 'جاري التحقق والربط...' : 'ربط الطالب'}</span>
          </button>
        </form>

        {/* Success Card (Shows after successful linking) */}
        {linkedStudent ? (
          <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>تم ربط الطالب بنجاح!</span>
              </div>
              <span className="text-[11px] bg-emerald-200/80 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded-full">
                نشط ومربوط
              </span>
            </div>

            {/* Student Details Card */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <img
                src={linkedStudent.avatar}
                alt={linkedStudent.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-100"
              />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">{linkedStudent.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-lg">{linkedStudent.grade}</span>
                  <span>•</span>
                  <span className="bg-blue-50 text-[#00288e] font-bold px-2 py-0.5 rounded-lg">الشعبة: {linkedStudent.className}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">الرقم المدرسي: {linkedStudent.studentNumber}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('student-profile')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>الانتقال إلى ملف الطالب</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Elegant Empty State explaining how to get code */
          <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#00288e] flex items-center justify-center mx-auto">
              <School className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">كيف تحصل على كود الربط؟</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                يتم تسليم كود الربط الخاص بالطالب في بطاقة مطبوعة من إدارة المدرسة في بداية العام الدراسي، أو عبر رسالة SMS رسمية من المدرسة.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
