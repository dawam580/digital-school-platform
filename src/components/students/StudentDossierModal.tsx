import React from 'react';
import { Student } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { 
  Printer, 
  X, 
  FileCheck2, 
  FileWarning, 
  GraduationCap, 
  Award, 
  UserCheck, 
  Phone, 
  MapPin, 
  Calendar,
  Building2,
  ShieldCheck
} from 'lucide-react';

interface StudentDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

const DOCUMENT_ITEMS = [
  { key: 'birthCert' as const, label: 'شهادة ميلاد الطالب الرقمية أو الورقية' },
  { key: 'healthRecord' as const, label: 'الملف والشهادة الصحية المعتمدة' },
  { key: 'photos' as const, label: 'الصور الشخصية للطالب (خلفية بيضاء)' },
  { key: 'parentConsent' as const, label: 'إقرار وتعهد ولي الأمر للائحة المدرسية' },
  { key: 'transferCert' as const, label: 'شهادة النقل وإخلاء الطرف من المدرسة السابقة' },
];

export const StudentDossierModal: React.FC<StudentDossierModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const { schoolProfile } = useSchool();

  if (!isOpen) return null;

  const docs = student.documents || {
    birthCert: false,
    healthRecord: false,
    photos: false,
    parentConsent: false,
    transferCert: false
  };

  const completedDocsCount = Object.values(docs).filter(Boolean).length;
  const isDocsComplete = completedDocsCount === 5;

  const handlePrint = () => {
    window.print();
  };

  // Calculate student average from grades
  const totalGrades = student.grades && student.grades.length > 0
    ? Math.round(student.grades.reduce((acc, g) => acc + (g.total || 0), 0) / student.grades.length)
    : student.academicAverage || student.totalScore || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="p-4 bg-slate-800 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 font-tajawal">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">التقرير الشامل والملف المعتمد للطالب</span>
          </div>
          <div className="flex items-center gap-2 font-tajawal">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              طباعة التقرير (Print)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Content */}
        <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-1 font-tajawal text-slate-900 bg-white dark:bg-slate-900 dark:text-slate-100 print:p-0 print:bg-white print:text-black">
          {/* Header with National Insignia */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6">
            <div className="flex items-center justify-between text-center">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 print:text-black">دولة ليبيا</p>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 print:text-black">وزارة التربية والتعليم</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 print:text-black">مراقبة التربية والتعليم</p>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 print:text-black">{schoolProfile.name}</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center p-2 mb-1 bg-amber-50 dark:bg-slate-800 print:bg-transparent">
                  <GraduationCap className="w-10 h-10 text-emerald-700 dark:text-emerald-400 print:text-black" />
                </div>
                <h2 className="text-lg font-black tracking-wide">تقرير ملف الطالب الشامل</h2>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-black">
                  للعام الدراسي {schoolProfile.academicYear || '2025 - 2026 م'}
                </span>
              </div>

              <div className="text-left text-xs text-slate-600 dark:text-slate-400 print:text-black space-y-1">
                <p><span className="font-bold">رقم القيد:</span> {student.id}</p>
                <p><span className="font-bold">تاريخ الاستخراج:</span> {new Date().toLocaleDateString('ar-LY')}</p>
                <p><span className="font-bold">حالة الملف:</span> {isDocsComplete ? 'مكتمل ✅' : 'نواقص ⚠️'}</p>
              </div>
            </div>
          </div>

          {/* Student Personal Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 mb-6 print:border-slate-400 print:bg-slate-50">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">اسم الطالب الرباعي</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white print:text-black">{student.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">الصف / الفصل</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 print:text-black">{student.className}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">الرقم الوطني / القيد</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white print:text-black">{student.nationalId || student.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">هاتف ولي الأمر</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white print:text-black">{student.parentPhone || 'غير مسجل'}</span>
            </div>
          </div>

          {/* Academic & Attendance Summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold">المعدل العام</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 print:text-black">
                {totalGrades}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {totalGrades >= 85 ? 'ممتاز' : totalGrades >= 75 ? 'جيد جداً' : totalGrades >= 65 ? 'جيد' : 'مقبول'}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold">نسبة الحضور</span>
              <span className="text-xl font-black text-teal-600 dark:text-teal-400 print:text-black">
                {student.attendanceRate || 98}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                حالة الحضور: {student.status === 'present' ? 'حاضر اليوم' : student.status === 'late' ? 'متأخر' : 'غائب'}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold">نقاط السلوك والتميز</span>
              <span className="text-xl font-black text-amber-500 dark:text-amber-400 print:text-black">
                {student.behaviorPointsTotal || student.points || 0} نقطة
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                تقييم: {student.behaviorRating || 'سلوك منضبط'}
              </span>
            </div>
          </div>

          {/* Missing & Submitted Documents Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 print:text-black">
                {isDocsComplete ? (
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <FileWarning className="w-4 h-4 text-amber-600" />
                )}
                كشف المستندات والملفات المدرسية:
              </h4>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isDocsComplete
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
              }`}>
                {isDocsComplete ? 'الملف مكتمل (5 من 5)' : `ملفات ناقصة (${5 - completedDocsCount} متبقية)`}
              </span>
            </div>

            <table className="w-full border-collapse border border-slate-200 dark:border-slate-700 text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 print:bg-slate-100">
                  <th className="border border-slate-200 dark:border-slate-700 p-2 text-right">المستند المطلوب</th>
                  <th className="border border-slate-200 dark:border-slate-700 p-2 text-center w-28">الحالة</th>
                  <th className="border border-slate-200 dark:border-slate-700 p-2 text-right">الملاحظة</th>
                </tr>
              </thead>
              <tbody>
                {DOCUMENT_ITEMS.map((item) => {
                  const isSubmitted = docs[item.key];
                  return (
                    <tr key={item.key} className="border-b border-slate-200 dark:border-slate-700/60">
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-medium">
                        {item.label}
                      </td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isSubmitted
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200'
                        }`}>
                          {isSubmitted ? 'مُسلَّم ومُطابق ✓' : 'ناقص ومطلوب ✗'}
                        </span>
                      </td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-500 text-[11px]">
                        {isSubmitted ? 'تم التحقق من النسخة' : 'يرجى إحضار الأصل أو صورة طبق الأصل بأسرع وقت'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Transfer History (if any) */}
          {student.transferHistory && student.transferHistory.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 print:text-black">
                سجل الانتقالات والفصول:
              </h4>
              <div className="space-y-1">
                {student.transferHistory.map((th, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-700">
                    <span>نقل من <b>{th.fromClass}</b> إلى <b>{th.toClass}</b></span>
                    <span className="text-slate-500">{th.date} - السبب: {th.reason || 'إداري'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures & Seal Section */}
          <div className="border-t-2 border-slate-800 pt-6 mt-8">
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300 print:text-black mb-8">مسؤول شؤون الطلبة</p>
                <p className="text-slate-400">....................................</p>
              </div>

              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300 print:text-black mb-8">ختم المدرسة المعتمد</p>
                <div className="w-20 h-20 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-full mx-auto flex items-center justify-center text-[10px] text-slate-400">
                  مكان الختم
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300 print:text-black mb-8">مدير المدرسة</p>
                <p className="font-bold text-slate-800 dark:text-slate-100 print:text-black">
                  {schoolProfile.directorName || 'أ. المدير العام'}
                </p>
                <p className="text-slate-400 mt-1">....................................</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
