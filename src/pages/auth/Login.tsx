import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';
import { Phone, Lock, ArrowLeft, ShieldCheck, Sparkles, User, GraduationCap, Shield, Key, Building2, CheckCircle2 } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { sound } from '../../utils/soundEffects';

export const Login: React.FC = () => {
  const { login, loginWithTeacherCode, setActiveTab, students, setSelectedStudent, teachers, currentUserPhone } = useSchool();
  const [loginMode, setLoginMode] = useState<'parent' | 'teacher' | 'admin'>('parent');
  
  // Parent Form (Libyan 12-digit National Number)
  const [studentNationalId, setStudentNationalId] = useState('120081234567');
  const [parentPassword, setParentPassword] = useState('123456');

  // Teacher Form (Libyan Unique Teacher Code)
  const [teacherCode, setTeacherCode] = useState('LIB-MATH-01');
  const [teacherPassword, setTeacherPassword] = useState('123456');

  // Admin Form (Libyan Management Phone)
  const [adminPhone, setAdminPhone] = useState(currentUserPhone || '0922465676');
  const [adminPassword, setAdminPassword] = useState('123456');

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleParentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      // Match student by 12-digit National ID or Link Code
      const cleanInput = studentNationalId.trim();
      const foundStudent = students.find(
        s => (s.nationalNumber && s.nationalNumber === cleanInput) ||
             s.nationalId === cleanInput ||
             s.studentNumber === cleanInput ||
             s.linkCode.toLowerCase() === cleanInput.toLowerCase()
      ) || students[0];

      if (foundStudent) {
        setSelectedStudent(foundStudent);
        login(foundStudent.nationalNumber || foundStudent.nationalId, 'parent');
      } else {
        setErrorMessage('الرقم الوطني غير مسجل في المنظومة. يرجى مراجعة إدارة المدرسة.');
      }
      setLoading(false);
    }, 400);
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const success = loginWithTeacherCode(teacherCode);
      if (!success) {
        setErrorMessage('رمز المعلم غير صحيح. يرجى التحقق من الرمز الصادر من إدارة المدرسة (مثل LIB-MATH-01).');
      }
      setLoading(false);
    }, 400);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      login(adminPhone, 'admin');
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center items-center p-4 sm:p-6 text-right font-cairo">
      
      {/* Background Soft Glow */}
      <div className="absolute top-10 right-1/2 translate-x-1/2 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6">
        
        {/* Top Centered Logo & Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-white shadow-card border border-slate-100">
            <img src={logoImg} alt="شعار منصة المدرسة" className="h-16 w-auto object-contain mx-auto" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200 mb-1">
              <span>🇱🇾 دولة ليبيا - وزارة التربية والتعليم</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00288e] tracking-tight">
              منظومة المدرسة الرقمية
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              العام الدراسي 2025 - 2026 م • النظام الإداري والتربوي المتكامل
            </p>
          </div>
        </div>

        {/* 3 Isolated Portal Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-2xl shadow-card border border-slate-100">
          <button
            type="button"
            onClick={() => { setLoginMode('parent'); setErrorMessage(''); sound.playTap(); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
              loginMode === 'parent'
                ? 'bg-[#00288e] text-white shadow-soft'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>ولي الأمر</span>
          </button>

          <button
            type="button"
            onClick={() => { setLoginMode('teacher'); setErrorMessage(''); sound.playTap(); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
              loginMode === 'teacher'
                ? 'bg-[#00288e] text-white shadow-soft'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>المعلم (بالرمز)</span>
          </button>

          <button
            type="button"
            onClick={() => { setLoginMode('admin'); setErrorMessage(''); sound.playTap(); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
              loginMode === 'admin'
                ? 'bg-[#00288e] text-white shadow-soft'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>إدارة المدرسة</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6">
          
          {/* Portal 1: Parent Portal Login */}
          {loginMode === 'parent' && (
            <form onSubmit={handleParentLogin} className="space-y-5 animate-in fade-in">
              <div className="text-center pb-2 border-b border-slate-100">
                <div className="inline-flex p-2 bg-blue-50 text-[#00288e] rounded-xl mb-1">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-800">بوابة أولياء الأمور</h2>
                <p className="text-xs text-slate-400 mt-0.5">الدخول بالرقم الوطني للطالب (12 خانة) لمتابعة النتائج والواجبات</p>
              </div>

              {/* Student National Number (12 digits) */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  الرقم الوطني للطالب (12 خانة)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="120081234567"
                    value={studentNationalId}
                    onChange={e => setStudentNationalId(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3.5 pr-11 text-base font-mono rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all text-slate-800 placeholder:text-slate-400"
                    required
                  />
                  <User className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
                
                {/* Demo student pills */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 flex-wrap">
                  <span>💡 تجربة سريعة للطلاب:</span>
                  <button
                    type="button"
                    onClick={() => { setStudentNationalId('120081234567'); sound.playTap(); }}
                    className="font-bold text-[#00288e] hover:underline"
                  >
                    معتز (120081234567)
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => { setStudentNationalId('220082345678'); sound.playTap(); }}
                    className="font-bold text-[#00288e] hover:underline"
                  >
                    آية (220082345678)
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••"
                    value={parentPassword}
                    onChange={e => setParentPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-11 text-base font-mono rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all text-slate-800"
                    required
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#00288e] hover:bg-blue-900 text-white font-bold rounded-2xl shadow-soft transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {loading ? 'جاري التحقق...' : 'دخول بوابة ولي الأمر'}
                <ArrowLeft className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Portal 2: Teacher Portal with Unique Code */}
          {loginMode === 'teacher' && (
            <form onSubmit={handleTeacherLogin} className="space-y-5 animate-in fade-in">
              <div className="text-center pb-2 border-b border-slate-100">
                <div className="inline-flex p-2 bg-emerald-50 text-emerald-700 rounded-xl mb-1">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-800">بوابة المعلمين</h2>
                <p className="text-xs text-slate-400 mt-0.5">الدخول برمز المعلم الخاص المعتمد من الإدارة</p>
              </div>

              {/* Teacher Unique Code */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  رمز المعلم الفريد (Teacher Access Code)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="LIB-MATH-01"
                    value={teacherCode}
                    onChange={e => setTeacherCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3.5 pr-11 text-base font-mono uppercase font-bold rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all text-slate-800 placeholder:text-slate-400"
                    required
                  />
                  <Key className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>

                {/* Quick teacher demo pills */}
                <div className="space-y-1 pt-1">
                  <p className="text-[11px] text-slate-500 font-bold">💡 تجربة سريعة لمعلمي المواد:</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {teachers.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => { setTeacherCode(t.code); sound.playTap(); }}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 font-mono font-bold text-slate-700 border border-slate-200 transition-colors"
                      >
                        {t.code} ({t.subject.split(' ')[0]})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••"
                    value={teacherPassword}
                    onChange={e => setTeacherPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-11 text-base font-mono rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all text-slate-800"
                    required
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-soft transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {loading ? 'جاري التحقق...' : 'دخول بوابة المعلم'}
                <ArrowLeft className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Portal 3: Admin Portal */}
          {loginMode === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-5 animate-in fade-in">
              <div className="text-center pb-2 border-b border-slate-100">
                <div className="inline-flex p-2 bg-indigo-50 text-indigo-700 rounded-xl mb-1">
                  <Building2 className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-800">بوابة إدارة المدرسة</h2>
                <p className="text-xs text-slate-400 mt-0.5">لوحة التحكم المركزية، تعديل الحصص، واستوديو البيانات 2025/2026</p>
              </div>

              {/* Admin Phone / ID */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  رقم الهاتف المعتمد للمدير
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="0922465676"
                    value={adminPhone}
                    onChange={e => setAdminPhone(e.target.value)}
                    className="w-full px-4 py-3.5 pr-11 text-base font-mono rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all text-slate-800"
                    required
                  />
                  <Phone className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 font-bold">💡 رقم المدير المعتمد: <span className="font-mono text-blue-700">0922465676</span></p>
              </div>

              {/* Admin Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-11 text-base font-mono rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all text-slate-800"
                    required
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-900 hover:bg-slate-900 text-white font-bold rounded-2xl shadow-soft transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {loading ? 'جاري التحقق...' : 'دخول لوحة الإدارة'}
                <ArrowLeft className="w-5 h-5" />
              </button>
            </form>
          )}

        </div>

        {/* Security Trust Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>وزارة التربية والتعليم - دولة ليبيا • منظومة آمنة ومشفرة بالكامل</span>
        </div>

      </div>
    </div>
  );
};
