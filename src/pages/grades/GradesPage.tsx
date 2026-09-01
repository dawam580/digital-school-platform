import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Award, BookOpen, CheckCircle, Download, Edit3, FileText, Printer, QrCode, Save, Sparkles, TrendingUp, X } from 'lucide-react';
import { SubjectGrade } from '../../types';

export const GradesPage: React.FC = () => {
  const { selectedStudent, currentRole, updateStudentGrade } = useSchool();
  const [selectedTerm, setSelectedTerm] = useState<'term1' | 'term2' | 'final'>('term1');
  const [isOfficialModalOpen, setIsOfficialModalOpen] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SubjectGrade>>({});

  const grades = selectedStudent.grades || [];
  const gpa = selectedStudent.academicAverage || 96.5;

  const handleStartEdit = (g: SubjectGrade) => {
    setEditingGradeId(g.id);
    setEditForm({
      period1: g.period1,
      period2: g.period2,
      quizzes: g.quizzes,
      homework: g.homework,
      participation: g.participation,
      finalExam: g.finalExam,
      appreciation: g.appreciation
    });
  };

  const handleSaveEdit = (gId: string) => {
    updateStudentGrade(selectedStudent.id, gId, editForm);
    setEditingGradeId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-amber-400/80 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full shadow">
                تفوق 🌟
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black">{selectedStudent.name}</h1>
                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold border border-white/10 text-blue-200">
                  {selectedStudent.className}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 flex items-center gap-2">
                <span>سجل الدرجات وكشوفات التقييم الأكاديمي المعتمدة</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-300 font-semibold">العام الدراسي 1447 / 1448 هـ</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOfficialModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-lg hover:shadow-amber-500/25 transition-all transform active:scale-95 text-sm"
            >
              <Award className="w-5 h-5 text-slate-950" />
              <span>كشف الدرجات الملكي الرسمي (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* GPA */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">المعدل التراكمي العام</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{gpa}%</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {gpa >= 95 ? 'ممتاز مرتفع (A+)' : gpa >= 90 ? 'ممتاز (A)' : 'جيد جداً (B+)'}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${gpa}%` }} />
          </div>
        </div>

        {/* Subjects Count */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">المواد المسجلة</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{grades.length}</span>
            <span className="text-xs font-bold text-slate-500">مواد دراسية</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">تم رصد وتدقيق كافة الفترات بنسبة 100%</p>
        </div>

        {/* Rank */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الترتيب الصفي</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">الأول 🥇</span>
            <span className="text-xs font-bold text-slate-500">على مستوى الصف</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-semibold">لوحة شرف الأوائل للعام 2026</p>
        </div>

        {/* Total Points */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">نقاط التميز والسلوك</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">+{selectedStudent.behaviorPointsTotal}</span>
            <span className="text-xs font-bold text-slate-500">نقطة مكافأة</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">سلوك إيجابي ومشاركة صفية نموذجية</p>
        </div>
      </div>

      {/* Grade Table & Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-blue-600 rounded-full" />
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">تفصيل درجات المواد الدراسية</h2>
              <p className="text-xs text-slate-400">تقسيم الدرجات حسب الفترات والاختبارات القصيرة والمشاريع</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setSelectedTerm('term1')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTerm === 'term1'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              الفصل الأول
            </button>
            <button
              onClick={() => setSelectedTerm('term2')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTerm === 'term2'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              الفصل الثاني
            </button>
            <button
              onClick={() => setSelectedTerm('final')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTerm === 'final'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              التقرير النهائي
            </button>
          </div>
        </div>

        {/* Table view */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">المادة الدراسية</th>
                <th className="py-4 px-4 text-center">الفترة 1 (20)</th>
                <th className="py-4 px-4 text-center">الفترة 2 (20)</th>
                <th className="py-4 px-4 text-center">اختبارات (10)</th>
                <th className="py-4 px-4 text-center">الواجبات (10)</th>
                <th className="py-4 px-4 text-center">المشاركة (10)</th>
                <th className="py-4 px-4 text-center">النهائي (30)</th>
                <th className="py-4 px-6 text-center font-black">المجموع (100)</th>
                <th className="py-4 px-4 text-center">التقدير</th>
                {currentRole !== 'parent' && <th className="py-4 px-4 text-center">تعديل</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {grades.map((g) => {
                const isEditing = editingGradeId === g.id;

                return (
                  <tr key={g.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{g.icon}</span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{g.subjectName}</p>
                          <p className="text-xs text-slate-400">{g.teacherName} • {g.code}</p>
                        </div>
                      </div>
                    </td>

                    {/* Period 1 */}
                    <td className="py-4 px-4 text-center font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          max={20}
                          min={0}
                          value={editForm.period1 ?? g.period1}
                          onChange={(e) => setEditForm({ ...editForm, period1: Number(e.target.value) })}
                          className="w-14 text-center bg-slate-100 dark:bg-slate-800 border rounded-lg p-1 text-xs"
                        />
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">{g.period1}</span>
                      )}
                    </td>

                    {/* Period 2 */}
                    <td className="py-4 px-4 text-center font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          max={20}
                          min={0}
                          value={editForm.period2 ?? g.period2}
                          onChange={(e) => setEditForm({ ...editForm, period2: Number(e.target.value) })}
                          className="w-14 text-center bg-slate-100 dark:bg-slate-800 border rounded-lg p-1 text-xs"
                        />
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">{g.period2}</span>
                      )}
                    </td>

                    {/* Quizzes */}
                    <td className="py-4 px-4 text-center font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          max={10}
                          min={0}
                          value={editForm.quizzes ?? g.quizzes}
                          onChange={(e) => setEditForm({ ...editForm, quizzes: Number(e.target.value) })}
                          className="w-14 text-center bg-slate-100 dark:bg-slate-800 border rounded-lg p-1 text-xs"
                        />
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">{g.quizzes}</span>
                      )}
                    </td>

                    {/* Homework */}
                    <td className="py-4 px-4 text-center font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          max={10}
                          min={0}
                          value={editForm.homework ?? g.homework}
                          onChange={(e) => setEditForm({ ...editForm, homework: Number(e.target.value) })}
                          className="w-14 text-center bg-slate-100 dark:bg-slate-800 border rounded-lg p-1 text-xs"
                        />
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">{g.homework}</span>
                      )}
                    </td>

                    {/* Participation */}
                    <td className="py-4 px-4 text-center font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          max={10}
                          min={0}
                          value={editForm.participation ?? g.participation}
                          onChange={(e) => setEditForm({ ...editForm, participation: Number(e.target.value) })}
                          className="w-14 text-center bg-slate-100 dark:bg-slate-800 border rounded-lg p-1 text-xs"
                        />
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">{g.participation}</span>
                      )}
                    </td>

                    {/* Final */}
                    <td className="py-4 px-4 text-center font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          max={30}
                          min={0}
                          value={editForm.finalExam ?? g.finalExam}
                          onChange={(e) => setEditForm({ ...editForm, finalExam: Number(e.target.value) })}
                          className="w-14 text-center bg-slate-100 dark:bg-slate-800 border rounded-lg p-1 text-xs"
                        />
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">{g.finalExam}</span>
                      )}
                    </td>

                    {/* Total */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center font-black text-base text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-xl">
                        {g.total} / 100
                      </span>
                    </td>

                    {/* Letter badge */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black ${
                        g.letter === 'A+' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                        g.letter === 'A' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}>
                        {g.letter}
                      </span>
                    </td>

                    {/* Teacher Action */}
                    {currentRole !== 'parent' && (
                      <td className="py-4 px-4 text-center">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(g.id)}
                            className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
                            title="حفظ"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(g)}
                            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                            title="تعديل الدرجة"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Royal Printable Official Report Modal */}
      {isOfficialModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative my-8 animate-scaleUp">
            {/* Header controls (hidden in print) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm">معاينة وطباعة كشف الدرجات الرسمي المعتمد</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الشهادة (Print PDF)</span>
                </button>
                <button
                  onClick={() => setIsOfficialModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Content */}
            <div className="p-8 md:p-12 space-y-8 bg-white" id="official-report-card">
              {/* Ministry & School Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6">
                <div className="text-right space-y-1 text-xs font-bold text-slate-800">
                  <p className="text-sm font-black">المملكة العربية السعودية</p>
                  <p>وزارة التعليم</p>
                  <p>الإدارة العامة للتعليم بمنطقة الرياض</p>
                  <p className="text-blue-900 font-extrabold">مدرسة المستقبل الرقمية النموذجية</p>
                </div>

                <div className="text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center text-3xl font-black shadow-md">
                    👑
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-2">كشف درجات معتمد</h3>
                  <span className="text-[10px] text-slate-500 font-bold">للفصل الدراسي الأول 1447هـ</span>
                </div>

                <div className="text-left space-y-1 text-xs font-bold text-slate-800">
                  <p>الرقم الإحصائي: <span className="font-mono text-slate-900">4471902</span></p>
                  <p>تاريخ الإصدار: <span className="font-mono text-slate-900">1447/03/10 هـ</span></p>
                  <p>رمز الاعتماد: <span className="font-mono text-blue-800">CERT-2026-SA</span></p>
                </div>
              </div>

              {/* Student Info Box */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">اسم الطالب:</span>
                  <span className="font-black text-sm text-slate-900">{selectedStudent.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">الهوية الوطنية:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedStudent.nationalId}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">الصف والشعبة:</span>
                  <span className="font-bold text-slate-900">{selectedStudent.grade} ({selectedStudent.className})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">الرقم الأكاديمي:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedStudent.studentNumber}</span>
                </div>
              </div>

              {/* Official Grades Table */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-white font-bold">
                    <tr>
                      <th className="py-3 px-4">المادة</th>
                      <th className="py-3 px-3 text-center">أعمال السنة (40)</th>
                      <th className="py-3 px-3 text-center">الأنشطة والواجبات (30)</th>
                      <th className="py-3 px-3 text-center">الاختبار النهائي (30)</th>
                      <th className="py-3 px-4 text-center font-black">الدرجة النهائية (100)</th>
                      <th className="py-3 px-3 text-center">التقدير</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {grades.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{g.subjectName}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{g.period1 + g.period2}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{g.quizzes + g.homework + g.participation}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{g.finalExam}</td>
                        <td className="py-2.5 px-4 text-center font-mono font-black text-slate-950">{g.total}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-blue-900">{g.letter}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary & Signatures */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-center">
                {/* Result Card */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl text-center space-y-1">
                  <span className="text-xs text-amber-300 font-bold">النتيجة العامة والمعدل</span>
                  <div className="text-2xl font-black text-amber-400">{gpa}%</div>
                  <div className="text-xs font-bold text-emerald-400">ناجح بتفوق وتميز (مرتبة الشرف الأولى)</div>
                </div>

                {/* Stamp & Verification QR */}
                <div className="flex flex-col items-center justify-center p-3 border border-dashed border-slate-300 rounded-2xl text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800">
                    <QrCode className="w-10 h-10 text-slate-900" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">امسح للتحقق من صحة الوثيقة الرقمية</span>
                </div>

                {/* Signatures */}
                <div className="text-center space-y-4 text-xs font-bold text-slate-800">
                  <div>
                    <p className="text-slate-500">المرشد الطلابي</p>
                    <p className="font-black mt-1">أ. عبدالمحسن الدوسري</p>
                  </div>
                  <div>
                    <p className="text-slate-500">مدير المدرسة</p>
                    <p className="font-black text-blue-950 mt-1">د. عبدالله بن سليمان الراجحي</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
