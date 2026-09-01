import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';
import { Phone, Lock, ArrowLeft, ShieldCheck, Sparkles, User, GraduationCap, Shield } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { sound } from '../../utils/soundEffects';

export const Login: React.FC = () => {
  const { login, setActiveTab, students, setSelectedStudent } = useSchool();
  const [loginMode, setLoginMode] = useState<'parent_national_id' | 'staff'>('parent_national_id');
  
  // Parent by Student National ID
  const [studentNationalId, setStudentNationalId] = useState('1098765432');
  const [defaultPassword, setDefaultPassword] = useState('123456');

  // Staff Login
  const [phone, setPhone] = useState('0551234567');
  const [password, setPassword] = useState('123456');
  const [staffRole, setStaffRole] = useState<'teacher' | 'admin'>('teacher');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleParentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      // Match student by National ID or Student Number
      const foundStudent = students.find(
        s => s.nationalId === studentNationalId.trim() ||
             s.studentNumber === studentNationalId.trim() ||
             s.linkCode.toLowerCase() === studentNationalId.trim().toLowerCase()
      ) || students[0];

      if (foundStudent) {
        setSelectedStudent(foundStudent);
        login(foundStudent.parentPhone || '0551234567', 'parent');
      } else {
        setErrorMessage('رقم الهوية الوطنية غير مسجل في النظام. يرجى مراجعة إدارة المدرسة.');
      }
      setLoading(false);
    }, 400);
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(phone, staffRole);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center items-center p-4 sm:p-6 text-right">
      
      {/* Background Soft Glow */}
      <div className="absolute top-10 right-1/2 translate-x-1/2 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6">
        
        {/* Top Centered Logo & Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-white shadow-card border border-slate-100">
            <img src={logoImg} alt="شعار منصة المدرسة" className="h-16 w-auto object-contain mx-auto" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00288e] tracking-tight">
              منصة المدرسة الرقمية
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              بوابة الدخول الموحدة لأولياء الأمور والإدارة المدرسية
            </p>
          </div>
        </div>

        {/* Login Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl shadow-card border border-slate-100">
          <button
            type="button"
            onClick={() => { setLoginMode('parent_national_id'); sound.playTap(); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              loginMode === 'parent_national_id'
                ? 'bg-[#00288e] text-white shadow-soft'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>دخول ولي الأمر برقم هوية الطالب</span>
          </button>

          <button
            type="button"
            onClick={() => { setLoginMode('staff'); sound.playTap(); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              loginMode === 'staff'
                ? 'bg-[#00288e] text-white shadow-soft'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>دخول المعلم والإدارة</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6">
          
          {loginMode === 'parent_national_id' ? (
            /* Mode 1: Parent Login by Student National ID */
            <form onSubmit={handleParentLogin} className="space-y-5 animate-in fade-in">
              <div className="text-center pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800">بوابة متابعة الطالب</h2>
                <p className="text-xs text-slate-400 mt-0.5">أدخل الرقم القومي / الهوية الوطنية للطالب المسجلة لدى المدرسة</p>
              </div>

              {/* Student National ID */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  الرقم الوطني / هوية الطالب
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="مثال: 1098765432"
                    value={studentNationalId}
                    onChange={e => setStudentNationalId(e.target.value)}
                    className="w-full px-4 py-3.5 pr-11 text-base font-mono rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all text-slate-800 placeholder:text-slate-400"
                    required
                  />
                  <User className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
                
                {/* Demo student pills */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 flex-wrap">
                  <span>💡 تجربة سريعة:</span>
                  <button
                    type="button"
                    onClick={() => { setStudentNationalId('1098765432'); sound.playTap(); }}
                    className="font-bold text-[#00288e] hover:underline"
                  >
                    ريان (1098765432)
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => { setStudentNationalId('1087654321'); sound.playTap(); }}
                    className="font-bold text-[#00288e] hover:underline"
                  >
                    سارة (1087654321)
                  </button>
                </div>
              </div>

              {/* Default Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-700">
                    كلمة المرور الافتراضية
                  </label>
                  <span className="text-[11px] text-slate-400">الافتراضية: 123456</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={defaultPassword}
                    onChange={e => setDefaultPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-11 text-base rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all text-slate-800 placeholder:text-slate-400"
                    required
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-200">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#00288e] hover:bg-[#002072] text-white font-bold text-base rounded-2xl shadow-soft hover:shadow-soft-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'جاري فتح سجل الطالب...' : 'الدخول إلى سجل الطالب'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Mode 2: Staff Login (Teacher / Admin) */
            <form onSubmit={handleStaffLogin} className="space-y-5 animate-in fade-in">
              <div className="text-center pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800">بوابة الكادر التعليمي والإدارة</h2>
                <p className="text-xs text-slate-400 mt-0.5">تسجيل الدخول لإدارة الفصول ورصد الحضور</p>
              </div>

              {/* Role Select */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-700">
                <button
                  type="button"
                  onClick={() => setStaffRole('teacher')}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    staffRole === 'teacher' ? 'bg-white text-[#00288e] shadow-sm' : ''
                  }`}
                >
                  معلم الفصل
                </button>
                <button
                  type="button"
                  onClick={() => setStaffRole('admin')}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    staffRole === 'admin' ? 'bg-white text-[#00288e] shadow-sm' : ''
                  }`}
                >
                  مدير المدرسة
                </button>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">رقم الهاتف المسجل</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 pr-11 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">كلمة المرور</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#00288e] hover:bg-[#002072] text-white font-bold text-sm rounded-2xl shadow-soft flex items-center justify-center gap-2"
              >
                <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Bottom Sign-Up Link */}
          <div className="text-center pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">ليس لديك حساب؟ </span>
            <button
              type="button"
              onClick={() => setActiveTab('parent-signup')}
              className="text-xs font-bold text-[#00288e] hover:underline"
            >
              إنشاء حساب ولي أمر جديد
            </button>
          </div>

        </div>

        {/* Trust Footer */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>منصة تعليمية آمنة ومعتمدة للمتابعة المدرسية المترابطة</span>
        </div>

      </div>
    </div>
  );
};
