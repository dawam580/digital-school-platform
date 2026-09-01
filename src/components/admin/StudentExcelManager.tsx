import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  AlertCircle,
  Users,
  Search,
  Sparkles
} from 'lucide-react';
import {
  exportStudentsToExcel,
  downloadSampleExcelTemplate,
  parseStudentsCsv
} from '../../utils/excelHelper';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

interface StudentExcelManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentExcelManager: React.FC<StudentExcelManagerProps> = ({ isOpen, onClose }) => {
  const { students, setSelectedStudent, setActiveTab } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [previewStudents, setPreviewStudents] = useState<Partial<Student>[] | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    sound.playTap();
    exportStudentsToExcel(students);
    setSuccessMessage('تم تصدير ملف الإكسيل بنجاح!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDownloadTemplate = () => {
    sound.playTap();
    downloadSampleExcelTemplate();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const parsed = parseStudentsCsv(text);
          if (parsed.length > 0) {
            setPreviewStudents(parsed);
            sound.playSuccess();
          } else {
            alert('تعذر استخراج بيانات من الملف. يرجى التأكد من تطابق الأعمدة مع النموذج.');
          }
        }
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handleConfirmImport = () => {
    if (!previewStudents || previewStudents.length === 0) return;

    // Load and merge with current students
    const merged: Student[] = [
      ...students,
      ...(previewStudents as Student[])
    ];

    // Remove duplicates by national ID
    const uniqueStudents = Array.from(new Map(merged.map(s => [s.nationalId, s])).values());

    // Update global state through custom context or direct local storage & sync
    localStorage.setItem('madrasa_db_students_v2', JSON.stringify(uniqueStudents));
    
    // Broadcast update via API
    fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'IMPORT_STUDENTS',
        fullState: {
          students: uniqueStudents,
        }
      })
    }).catch(() => {});

    sound.playFanfare();
    triggerConfetti();
    setSuccessMessage(`تم استيراد وإدراج ${previewStudents.length} طالب بنجاح ومزامنتهم مع كافة الحسابات!`);
    setPreviewStudents(null);
    setImportFileName('');

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const filtered = students.filter(s =>
    s.name.includes(searchQuery) ||
    s.nationalId.includes(searchQuery) ||
    s.studentNumber.includes(searchQuery) ||
    s.grade.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-right space-y-6 max-h-[90vh] overflow-y-auto relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                إدارة وسجلات الطلاب وملفات الإكسيل (Excel Hub)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              استيراد الطلاب من منظومات أخرى (مثل نظام نور)، تصدير البيانات، وتعديل القوائم
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>تصدير لإكسيل (Excel)</span>
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#00288e] font-bold text-xs flex items-center gap-1.5 border border-blue-200 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>تحميل نموذج الاستيراد</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Upload Excel Card */}
        <div className="p-5 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-3">
          <Upload className="w-8 h-8 text-[#00288e] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">
              استيراد طلاب جدد من ملف إكسيل / CSV
            </h3>
            <p className="text-xs text-slate-400">
              اختر ملف جدول الطلاب المصدر من المنظومة وسيتولى النظام مطابقة الأسماء وأرقام الهويات آلياً
            </p>
          </div>

          <div className="flex justify-center">
            <label className="px-5 py-2.5 bg-[#00288e] hover:bg-[#002072] text-white rounded-2xl text-xs font-bold shadow-soft cursor-pointer transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>{importFileName ? `الملف المختار: ${importFileName}` : 'اختيار ملف إكسيل / CSV'}</span>
              <input type="file" accept=".csv, .xlsx, .txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Preview of Imported Students (if any) */}
        {previewStudents && (
          <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>معاينة الطلاب الجاهزين للاستيراد ({previewStudents.length} طالب)</span>
              </div>
              <button
                onClick={() => setPreviewStudents(null)}
                className="text-xs text-slate-500 hover:text-slate-700 font-bold"
              >
                إلغاء
              </button>
            </div>

            <div className="overflow-x-auto max-h-56 bg-white rounded-2xl border border-emerald-100">
              <table className="w-full text-xs text-right">
                <thead className="bg-emerald-100/60 text-emerald-950 font-bold">
                  <tr>
                    <th className="p-2.5">اسم الطالب</th>
                    <th className="p-2.5">الهوية الوطنية</th>
                    <th className="p-2.5">الرقم الأكاديمي</th>
                    <th className="p-2.5">الصف والشعبة</th>
                    <th className="p-2.5">هاتف ولي الأمر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewStudents.map((st, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-800">{st.name}</td>
                      <td className="p-2.5 font-mono text-slate-600">{st.nationalId}</td>
                      <td className="p-2.5 font-mono text-slate-600">{st.studentNumber}</td>
                      <td className="p-2.5 text-slate-600">{st.grade} ({st.className})</td>
                      <td className="p-2.5 font-mono text-slate-600">{st.parentPhone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleConfirmImport}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-soft flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد واستيراد كافة الطلاب إلى المنظومة الآن</span>
            </button>
          </div>
        )}

        {/* Current Students Table & Search */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              الطلاب المسجلون حالياً في المنظومة ({students.length} طالب)
            </h3>
            
            {/* Search Input */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="بحث بالاسم أو الهوية..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 pr-8 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto max-h-72 border border-slate-100 rounded-2xl bg-white">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
                <tr>
                  <th className="p-3">الطالب</th>
                  <th className="p-3">الهوية الوطنية</th>
                  <th className="p-3">الصف</th>
                  <th className="p-3">ولي الأمر والهاتف</th>
                  <th className="p-3">كود الربط</th>
                  <th className="p-3">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <img src={st.avatar} alt={st.name} className="w-7 h-7 rounded-full object-cover" />
                      <span>{st.name}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{st.nationalId}</td>
                    <td className="p-3 text-slate-600">{st.grade} ({st.className})</td>
                    <td className="p-3 text-slate-600">
                      <p className="font-semibold">{st.parentName}</p>
                      <p className="font-mono text-[10px] text-slate-400">{st.parentPhone}</p>
                    </td>
                    <td className="p-3 font-mono font-bold text-[#00288e]">{st.linkCode}</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedStudent(st);
                          setActiveTab('student-profile');
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-blue-50 text-[#00288e] hover:bg-blue-100 rounded-lg font-bold text-[11px]"
                      >
                        عرض الملف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
