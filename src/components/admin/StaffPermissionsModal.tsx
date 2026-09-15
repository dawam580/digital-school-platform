import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Shield, 
  X, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  UserCheck, 
  FileText, 
  Database, 
  Download, 
  Upload, 
  Save 
} from 'lucide-react';
import { TeacherAccount } from '../../types';
import { Permission } from '../../services/security/securityEngine';
import { sound } from '../../utils/soundEffects';

interface StaffPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherAccount | null;
  onSavePermissions: (teacherId: string, customPermissions: string[]) => void;
}

const AVAILABLE_PERMISSIONS: { key: Permission; label: string; description: string; category: 'grades' | 'attendance' | 'data' | 'system' }[] = [
  { key: 'VIEW_GRADES', label: 'الاطلاع على درجات المواد', description: 'السماح بالاطلاع على كشوف الدرجات للفصول والطلاب', category: 'grades' },
  { key: 'EDIT_GRADES', label: 'إدخال وتعديل درجات المواد', description: 'صلاحية رصد وتعديل أعمال السنة ودرجات الامتحانات', category: 'grades' },
  { key: 'APPROVE_GRADES', label: 'اعتماد شيت الدرجات', description: 'صلاحية تصديق واعتماد نتائج الكنترول النهائية', category: 'grades' },
  { key: 'TAKE_ATTENDANCE', label: 'رصد الحضور والغياب اليومي', description: 'تسجيل الحضور الصباحي والتأخير وتوثيق ملاحظات اليوم', category: 'attendance' },
  { key: 'VIEW_ATTENDANCE_REPORTS', label: 'عرض تقارير الحضور المجمعة', description: 'الاطلاع على نسب المواظبة الشهرية والفصلية للطلاب', category: 'attendance' },
  { key: 'ACCESS_EXCEL_HUB', label: 'الوصول إلى بوابة Excel المتقدمة', description: 'استيراد وتصدير كشوفات الدرجات والطلاب بصيغة إكسيل', category: 'data' },
  { key: 'EXPORT_DATA', label: 'تصدير بيانات وتقارير المدرسة', description: 'استخراج وتنزيل النسخ الاحتياطية وكشوفات PDF الرسمية', category: 'data' },
  { key: 'IMPORT_DATA', label: 'استيراد الكشوفات الرسمية', description: 'رفع ملفات الطلاب وشيتات الامتحانات للمنظومة', category: 'data' },
  { key: 'SEND_CHAT', label: 'مراسلة أولياء الأمور عبر المحادثة', description: 'إرسال ملاحظات وتنبيهات مباشرة لولي الأمر', category: 'system' },
  { key: 'VIEW_AUDIT_LOGS', label: 'الاطلاع على سجل التدقيق الأمني', description: 'متابعة سجل العمليات الإدارية الحساسة', category: 'system' }
];

export const StaffPermissionsModal: React.FC<StaffPermissionsModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onSavePermissions
}) => {
  if (!isOpen || !teacher) return null;

  // Initial custom permissions for this teacher
  const initialPerms: string[] = (teacher as any).customPermissions || [
    'VIEW_STUDENT_PROFILE',
    'VIEW_GRADES',
    'EDIT_GRADES',
    'TAKE_ATTENDANCE',
    'VIEW_ATTENDANCE_REPORTS',
    'SEND_CHAT'
  ];

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(initialPerms);
  const [isSaved, setIsSaved] = useState(false);

  const togglePermission = (key: string) => {
    setSelectedPermissions(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
    sound.playTap();
  };

  const handleSelectAll = () => {
    setSelectedPermissions(AVAILABLE_PERMISSIONS.map(p => p.key));
    sound.playTap();
  };

  const handleResetToDefault = () => {
    setSelectedPermissions([
      'VIEW_GRADES',
      'EDIT_GRADES',
      'TAKE_ATTENDANCE',
      'VIEW_ATTENDANCE_REPORTS',
      'SEND_CHAT'
    ]);
    sound.playTap();
  };

  const handleSave = () => {
    onSavePermissions(teacher.id, selectedPermissions);
    setIsSaved(true);
    sound.playSuccess();
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-white font-cairo flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">تخصيص صلاحيات المعلم (Granular RBAC)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  تحكم مدير المدرسة
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                منح أو حجب صلاحيات دقيقة للمعلم: <strong className="text-blue-600 dark:text-blue-400">{teacher.name}</strong> ({teacher.subject})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="text-slate-500 dark:text-slate-400 font-bold">
              الصلاحيات المفعلة: <strong className="text-blue-600 dark:text-blue-400 font-mono">{selectedPermissions.length}</strong> من {AVAILABLE_PERMISSIONS.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition"
              >
                تحديد الكل
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-200 transition"
              >
                الافتراضي
              </button>
            </div>
          </div>

          {/* Permissions Checklist Grid */}
          <div className="space-y-2.5">
            {AVAILABLE_PERMISSIONS.map(perm => {
              const isChecked = selectedPermissions.includes(perm.key);
              return (
                <div
                  key={perm.key}
                  onClick={() => togglePermission(perm.key)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-500/40 shadow-sm'
                      : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/60 dark:border-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight">
                        {perm.label}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {perm.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 shrink-0">
                    {perm.key}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>تُحفظ الصلاحيات في السحابة وتُوقّع أمنياً مع التوكن المشفر</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-500/20 transition active:scale-95 flex items-center gap-1.5"
            >
              {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'تم الحفظ بنجاح!' : 'حفظ الصلاحيات المخصصة'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
