import React from 'react';
import * as XLSX from 'xlsx';
import { useSchool } from '../../context/SchoolContext';
import { TeacherAccount } from '../../types';
import {
  Printer,
  FileSpreadsheet,
  X,
  Building2,
  CheckCircle2,
  Users,
  Award,
  Calendar
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface PrintableTeachersRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableTeachersRosterModal: React.FC<PrintableTeachersRosterModalProps> = ({
  isOpen,
  onClose
}) => {
  const { teachers, schoolProfile } = useSchool();

  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  const handleExportExcel = () => {
    sound.playSuccess();
    const rows = teachers.map((t, idx) => ({
      'ت': idx + 1,
      'الاسم الرباعي': t.name,
      'الرقم الوطني': t.nationalNumber || '119800000000',
      'رقم الملف (منظومة الشاطئ)': t.fileNumber || `WSH-${1000 + idx}`,
      'المادة التدريسية': t.subject,
      'المؤهل والتخصص': t.qualification || 'بكالوريوس تربوي',
      'الفصول المسندة': t.assignedClasses.join('، '),
      'النصاب القانوني': t.teachingQuota || 20,
      'الحصص الفعلية': t.assignedPeriodsCount || 18,
      'حالة النصاب': (t.assignedPeriodsCount || 18) >= (t.teachingQuota || 20) ? 'مستوفٍ للنصاب' : 'فارق بسيط',
      'الهاتف': t.phone
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'كشف_المعلمين_الشاطئ');
    XLSX.writeFile(wb, `كشف_معلمي_${schoolProfile.name.replace(/\s+/g, '_')}_منظومة_الشاطئ.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md font-cairo text-right animate-in fade-in overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full border border-slate-300 overflow-hidden my-auto print:m-0 print:border-none print:shadow-none">
        
        {/* Screen Controls Header (Hidden during Print) */}
        <div className="print:hidden flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="text-sm font-black">
                كشف حصر هيئة التدريس وتوزيع نصاب الحصص (معتمد - منظومة الشاطئ)
              </h3>
              <p className="text-[11px] text-slate-400">
                جاهز للتصدير كملف إكسل أو الطباعة بالحجم القياسي A4
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير إكسل (.xlsx)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الكشف A4</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Printable Sheet Area */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white">
          
          {/* Official Libyan Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="text-right">
                <p>دولة ليبيا</p>
                <p>وزارة التربية والتعليم</p>
                <p>{schoolProfile.district}</p>
              </div>
              <div className="w-16 h-16 rounded-full border-2 border-slate-900 flex items-center justify-center font-bold text-xs bg-slate-50">
                🇱🇾
              </div>
              <div className="text-left font-mono">
                <p>العام: {schoolProfile.academicYear}</p>
                <p>كشف رقم: WSH-{teachers.length}</p>
                <p>التاريخ: {new Date().toLocaleDateString('ar-LY')}</p>
              </div>
            </div>

            <div className="pt-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                كشف حصر الكادر التعليمي وتوزيع نصاب الحصص الأسبوعي
              </h1>
              <p className="text-xs font-bold text-slate-600">
                {schoolProfile.name} • نموذج منظومة الشاطئ لشؤون المعلمين
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border border-slate-900 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-900 text-center">
                  <th className="p-2 border-l border-slate-900 w-8">ت</th>
                  <th className="p-2 border-l border-slate-900 text-right">الاسم الرباعي</th>
                  <th className="p-2 border-l border-slate-900 font-mono">الرقم الوطني</th>
                  <th className="p-2 border-l border-slate-900 font-mono">رقم الملف</th>
                  <th className="p-2 border-l border-slate-900">المادة المقررة</th>
                  <th className="p-2 border-l border-slate-900">المؤهل والتخصص</th>
                  <th className="p-2 border-l border-slate-900">الفصول المسندة</th>
                  <th className="p-2 border-l border-slate-900 w-16">النصاب القانوني</th>
                  <th className="p-2 border-l border-slate-900 w-16">الحصص الفعلية</th>
                  <th className="p-2">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-medium">
                {teachers.map((tch, idx) => (
                  <tr key={tch.id} className="hover:bg-slate-50">
                    <td className="p-2 text-center border-l border-slate-300 font-mono font-bold">{idx + 1}</td>
                    <td className="p-2 border-l border-slate-300 font-black text-slate-900">{tch.name}</td>
                    <td className="p-2 border-l border-slate-300 font-mono text-center">{tch.nationalNumber || '119800000000'}</td>
                    <td className="p-2 border-l border-slate-300 font-mono text-center font-bold text-blue-900">{tch.fileNumber || `WSH-${1000 + idx}`}</td>
                    <td className="p-2 border-l border-slate-300 font-bold text-center">{tch.subject}</td>
                    <td className="p-2 border-l border-slate-300 text-slate-700">{tch.qualification || 'بكالوريوس علوم تربوية'}</td>
                    <td className="p-2 border-l border-slate-300 text-center font-bold">{tch.assignedClasses.join('، ')}</td>
                    <td className="p-2 border-l border-slate-300 font-mono font-black text-center">{tch.teachingQuota || 20}</td>
                    <td className="p-2 border-l border-slate-300 font-mono font-black text-center text-emerald-700">{tch.assignedPeriodsCount || 18}</td>
                    <td className="p-2 text-[11px] text-slate-600">{tch.notes || 'مستوفٍ للنصاب'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Official Endorsement & Signatures Footer */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs font-black text-slate-800">
            <div className="space-y-6">
              <p>مسؤول شؤون المعلمين</p>
              <p className="text-slate-400 font-normal">(التوقيع: .....................)</p>
            </div>
            <div className="space-y-6">
              <p>رئيس قسم الامتحانات والتقويم</p>
              <p className="text-slate-400 font-normal">(التوقيع: .....................)</p>
            </div>
            <div className="space-y-6">
              <p>مدير المؤسسة التعليمية</p>
              <p className="text-slate-900">{schoolProfile.directorName}</p>
              <p className="text-slate-400 font-normal">الختم الرسمي للمدرسة</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
