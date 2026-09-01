import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { User, Phone, ShieldCheck, ArrowLeft, ArrowRight, MessageSquare, CheckCircle2 } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const ParentSignUp: React.FC = () => {
  const { login, setActiveTab } = useSchool();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
    }, 500);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length <= 1) {
      const next = [...otp];
      next[index] = val;
      setOtp(next);
      if (val && index < 3) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleConfirmOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setConfirmed(true);
      setTimeout(() => {
        login(phone, 'parent');
        setActiveTab('link-student');
      }, 1000);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center items-center p-4 sm:p-6 text-right">
      
      {/* Background Soft Glow */}
      <div className="absolute top-10 right-1/2 translate-x-1/2 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-white shadow-card border border-slate-100">
            <img src={logoImg} alt="شعار منصة المدرسة" className="h-16 w-auto object-contain mx-auto" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00288e] tracking-tight">
              إنشاء حساب ولي أمر
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              سجل حسابك لمتابعة الحضور والتقارير المدرسية لأبنائك
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6">
          
          {!otpSent ? (
            /* Step 1: Name and Phone Input */
            <form onSubmit={handleSendOtp} className="space-y-5 animate-in fade-in">
              <div className="text-center pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800">بيانات ولي الأمر</h2>
                <p className="text-xs text-slate-400 mt-0.5">أدخل اسمك ورقم هاتفك لاستلام رمز التحقق</p>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="مثال: فهد بن ناصر العتيبي"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 py-3 pr-11 text-base rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all text-slate-800 placeholder:text-slate-400"
                    required
                  />
                  <User className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="05XXXXXXXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 pr-11 text-base rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all text-slate-800 placeholder:text-slate-400"
                    required
                  />
                  <Phone className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Submit: Send OTP Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#00288e] hover:bg-[#002072] text-white font-bold text-base rounded-2xl shadow-soft hover:shadow-soft-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Step 2: OTP 4-digit code verification */
            <form onSubmit={handleConfirmOtp} className="space-y-6 text-center animate-in fade-in">
              <div className="p-3 bg-blue-50 text-[#00288e] rounded-2xl w-14 h-14 mx-auto flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-800">إدخال رمز التحقق (OTP)</h2>
                <p className="text-xs text-slate-500">
                  تم إرسال الرمز إلى الرقم <span className="font-mono font-bold text-slate-700">{phone}</span>
                </p>
              </div>

              {/* 4 Separate OTP Inputs */}
              <div className="flex justify-center gap-3 dir-ltr" dir="ltr">
                {[0, 1, 2, 3].map(i => (
                  <input
                    key={i}
                    id={`otp-input-${i}`}
                    type="text"
                    maxLength={1}
                    value={otp[i]}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    className="w-14 h-16 text-center text-2xl font-black text-[#00288e] rounded-2xl border-2 border-slate-200 focus:border-[#00288e] focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setOtp(['4', '8', '2', '1'])}
                className="text-xs text-[#00288e] font-bold hover:underline block mx-auto"
              >
                💡 إدخال الرمز التجريبي تلقائياً (4821)
              </button>

              {/* Confirm Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={loading || confirmed || otp.some(d => !d)}
                  className="w-full py-3.5 px-4 bg-[#00288e] hover:bg-[#002072] text-white font-bold text-base rounded-2xl shadow-soft hover:shadow-soft-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {confirmed ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      <span>تم التحقق بنجاح!</span>
                    </>
                  ) : (
                    <span>{loading ? 'جاري التأكيد...' : 'تأكيد'}</span>
                  )}
                </button>

                {/* Subtext required by user prompt */}
                <p className="text-xs text-slate-400 font-medium">
                  تم إرسال رمز التحقق عبر رسالة نصية (SMS) إلى هاتفك المحمول.
                </p>
              </div>

              {/* Edit phone button */}
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>تعديل رقم الهاتف</span>
              </button>
            </form>
          )}

          {/* Login Backlink */}
          <div className="text-center pt-3 border-t border-slate-100">
            <span className="text-sm text-slate-500">لديك حساب بالفعل؟ </span>
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="text-sm font-bold text-[#00288e] hover:underline"
            >
              تسجيل الدخول
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
