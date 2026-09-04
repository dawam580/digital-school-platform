import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, Sparkles, User, Hash, Calendar, Phone, Heart, Users } from 'lucide-react';
import { Student, AttendanceStatus } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { sound } from '../../utils/soundEffects';

interface StudentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
}

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  isOpen,
  onClose,
  studentToEdit
}) => {
  const { students, setStudents, schoolProfile, showToast } = useSchool();

  // Form states
  const [name, setName] = useState('');
  const [className, setClassName] = useState('1/1 مساء');
  const [nationalNumber, setNationalNumber] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [motherName, setMotherName] = useState('—');
  const [birthDate, setBirthDate] = useState('2015-05-10');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('present');

  // Available classes (from school or default Baour classes)
  const availableClasses = React.useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.className) set.add(s.className.trim());
    });
    if (set.size === 0) {
      ['1/1 مساء', '1/2 مساء', '2/1 مساء', '3/1 مساء', '4/1 مساء', '7/1 صباح', '8/1 صباح', '9/1 صباح'].forEach(c => set.add(c));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ar', { numeric: true }));
  }, [students]);

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setClassName(studentToEdit.className || availableClasses[0] || '1/1 مساء');
      setNationalNumber(studentToEdit.nationalNumber || studentToEdit.nationalId || '');
      setStudentNumber(studentToEdit.studentNumber || '');
      setMotherName(studentToEdit.motherName || '—');
      setBirthDate(studentToEdit.birthDate || '2015-05-10');
      setGender(studentToEdit.gender || 'male');
      setParentName(studentToEdit.parentName || '');
      setParentPhone(studentToEdit.parentPhone || '');
      setStatus(studentToEdit.status || 'present');
    } else {
      // Defaults for new student
      setName('');
      setClassName(availableClasses[0] || '1/1 مساء');
      setNationalNumber('');
      setStudentNumber(String(Math.floor(1000000 + Math.random() * 9000000))); // Random 7-digit registration number
      setMotherName('—');
      setBirthDate('2015-05-10');
      setGender('male');
      setParentName('');
      setParentPhone('09');
      setStatus('present');
    }
  }, [studentToEdit, availableClasses, isOpen]);

  if (!isOpen) return null;

  // Auto-generate Libyan National Number if empty
  const handleAutoGenerateNationalId = () => {
    const genderDigit = gender === 'male' ? '1' : '2';
    const birthYear = birthDate ? birthDate.split('-')[0] : '2015';
    const randomSuffix = String(Math.floor(1000000 + Math.random() * 9000000));
    const generated = `${genderDigit}${birthYear}${randomSuffix}`;
    setNationalNumber(generated);
    sound.playSuccess();
    showToast('info', 'تم توليد رقم وطني افتراضي', generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('error', 'بيانات ناقصة', 'يرجى إدخال اسم الطالب الرباعي كاملاً.');
      return;
    }

    const finalNationalNumber = nationalNumber.trim() || `${gender === 'male' ? '1' : '2'}${birthDate.split('-')[0]}${studentNumber}`;
    const cleanMother = motherName.trim() || '—';

    if (studentToEdit) {
      // Edit existing student
      const updated = students.map(s => {
        if (s.id === studentToEdit.id) {
          return {
            ...s,
            name: name.trim(),
            className,
            grade: className.split('/')[0] ? `الصف ${className.split('/')[0]}` : s.grade,
            nationalNumber: finalNationalNumber,
            nationalId: finalNationalNumber,
            studentNumber: studentNumber.trim(),
            motherName: cleanMother,
            birthDate,
            gender,
            parentName: parentName.trim() || `ولي أمر ${name.trim()}`,
            parentPhone: parentPhone.trim(),
            status
          };
        }
        return s;
      });

      setStudents(updated);
      sound.playSuccess();
      showToast('success', 'تم تعديل بيانات الطالب ✏️', `تم تحديث ملف الطالب (${name.trim()}) بنجاح.`);
    } else {
      // Create new student
      const newId = `st_${Date.now()}`;
      const newStudent: Student = {
        id: newId,
        name: name.trim(),
        className,
        grade: className.split('/')[0] ? `الصف ${className.split('/')[0]}` : 'الصف الأول',
        nationalNumber: finalNationalNumber,
        nationalId: finalNationalNumber,
        studentNumber: studentNumber.trim(),
        linkCode: `SCH-${finalNationalNumber.slice(-4)}`,
        avatar: gender === 'male'
          ? `https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80`
          : `https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80`,
        gender,
        parentName: parentName.trim() || `ولي أمر ${name.trim()}`,
        parentPhone: parentPhone.trim(),
        parentEmail: '',
        motherName: cleanMother,
        birthDate,
        birthPlace: schoolProfile.district || 'ليبيا',
        status,
        attendanceRate: 100,
        academicAverage: 88,
        courseworkScore: 36,
        examScore: 52,
        totalScore: 88,
        appreciation: 'جيد جداً',
        behaviorRating: 'ممتاز',
        behaviorPointsTotal: 10,
        behaviorPoints: [],
        competencies: [
          { name: 'القراءة والكتابة', score: 90, maxScore: 100 },
          { name: 'الرياضيات والعمليات الحسابية', score: 85, maxScore: 100 },
          { name: 'المشاركة الصفية', score: 95, maxScore: 100 },
          { name: 'الانضباط والغياب', score: 100, maxScore: 100 }
        ],
        subjects: [
          { name: 'اللغة العربية', code: 'ARB', score: 90, maxScore: 100, teacher: 'أ. فاطمة الترهوني', evaluation: 'ممتاز', courseworkScore: 36, examScore: 54, totalScore: 90 },
          { name: 'الرياضيات', code: 'MATH', score: 85, maxScore: 100, teacher: 'أ. طارق الفيتوري', evaluation: 'جيد جداً', courseworkScore: 34, examScore: 51, totalScore: 85 },
          { name: 'العلوم', code: 'SCI', score: 88, maxScore: 100, teacher: 'أ. هناء الورفلي', evaluation: 'جيد جداً', courseworkScore: 35, examScore: 53, totalScore: 88 },
          { name: 'اللغة الإنجليزية', code: 'ENG', score: 84, maxScore: 100, teacher: 'أ. عمر السنوسي', evaluation: 'جيد جداً', courseworkScore: 33, examScore: 51, totalScore: 84 },
          { name: 'التربية الإسلامية', code: 'ISL', score: 95, maxScore: 100, teacher: 'أ. عبد السلام الزوي', evaluation: 'ممتاز', courseworkScore: 38, examScore: 57, totalScore: 95 },
          { name: 'التاريخ', code: 'HIST', score: 80, maxScore: 100, teacher: 'أ. مروان القماطي', evaluation: 'جيد', courseworkScore: 32, examScore: 48, totalScore: 80 },
          { name: 'الجغرافيا', code: 'GEOG', score: 82, maxScore: 100, teacher: 'أ. نجاة الكيلاني', evaluation: 'جيد', courseworkScore: 32, examScore: 50, totalScore: 82 },
          { name: 'الحاسوب والتقنية', code: 'COMP', score: 92, maxScore: 100, teacher: 'أ. خديجة العريبي', evaluation: 'ممتاز', courseworkScore: 36, examScore: 56, totalScore: 92 }
        ]
      };

      const updated = [newStudent, ...students];
      setStudents(updated);
      sound.playFanfare();
      showToast('gold', 'تمت إضافة الطالب بنجاح! 🎓', `تم تسجيل الطالب (${name.trim()}) في فصل (${className}).`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-cairo text-right">
      <div className="relative w-full max-w-2xl my-4 sm:my-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] animate-in fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20 shrink-0">
              {studentToEdit ? '✏️' : '🎓'}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black leading-snug">
                {studentToEdit ? 'تعديل بيانات الطالب في المنظومة' : 'تسجيل وإضافة طالب جديد في المنظومة'}
              </h3>
              <p className="text-xs text-blue-200/80">
                مطابق لسجلات وزارة التربية والتعليم والمركز الوطني للامتحانات (ليبيا)
              </p>
            </div>
          </div>

          <button
            onClick={() => { onClose(); sound.playTap(); }}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Row 1: Student Full Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>اسم الطالب الرباعي الكامل: <strong className="text-rose-500">*</strong></span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: محمد عبدالسلام مفتاح الورفلي"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Row 2: Class & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                <span>الصف والشعبة: <strong className="text-rose-500">*</strong></span>
              </label>
              <select
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm text-purple-700 dark:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>فصل ({cls})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                الجنس:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setGender('male'); sound.playTap(); }}
                  className={`p-2.5 rounded-xl text-xs font-black transition border ${
                    gender === 'male'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ذكر 👦
                </button>
                <button
                  type="button"
                  onClick={() => { setGender('female'); sound.playTap(); }}
                  className={`p-2.5 rounded-xl text-xs font-black transition border ${
                    gender === 'female'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  أنثى 👧
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: National Number & Registration Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-emerald-600" />
                  <span>الرقم الوطني الليبي (12 رقماً):</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateNationalId}
                  className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>توليد آلي ⚡</span>
                </button>
              </div>
              <input
                type="text"
                value={nationalNumber}
                onChange={e => setNationalNumber(e.target.value)}
                placeholder="مثال: 120151234567"
                maxLength={12}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                رقم القيد الوزاري (7 أرقام):
              </label>
              <input
                type="text"
                value={studentNumber}
                onChange={e => setStudentNumber(e.target.value)}
                placeholder="مثال: 4567890"
                maxLength={7}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Mother Name & Birthdate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>اسم الأم (ضعه "—" إذا لم يتوفر بالكشف):</span>
              </label>
              <input
                type="text"
                value={motherName}
                onChange={e => setMotherName(e.target.value)}
                placeholder="—"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>تاريخ الميلاد:</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 5: Parent Contact & Initial Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-teal-600" />
                <span>رقم هاتف ولي الأمر (للتواصل والإشعارات):</span>
              </label>
              <input
                type="tel"
                value={parentPhone}
                onChange={e => setParentPhone(e.target.value)}
                placeholder="مثال: 0912345678"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                حالة الحضور المبدئية:
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as AttendanceStatus)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="present">حاضر 🟢</option>
                <option value="unexcused">غائب 🔴</option>
                <option value="late">متأخر 🟡</option>
                <option value="excused">إذن رسمي 🔵</option>
              </select>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => { onClose(); sound.playTap(); }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{studentToEdit ? 'حفظ التعديلات' : 'حفظ وتسجيل الطالب في الكشف'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
