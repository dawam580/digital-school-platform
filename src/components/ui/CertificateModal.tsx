import React from 'react';
import { Student } from '../../types';
import { Award, Printer, Download, Sparkles, X, ShieldCheck } from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import logoImg from '../../assets/logo.png';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, student }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  React.useEffect(() => {
    if (isOpen) {
      sound.playFanfare();
      triggerConfetti();
    }
  }, [isOpen]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 text-right space-y-6 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Golden Canvas Card */}
        <div id="printable-certificate" className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 border-4 border-amber-300/80 shadow-inner text-center space-y-6 relative">
          
          {/* Decorative Corner Borders */}
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-500 rounded-tr-lg" />
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-500 rounded-tl-lg" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-500 rounded-br-lg" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-500 rounded-bl-lg" />

          {/* School Header */}
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-4">
            <div className="text-right text-xs text-slate-600 font-bold">
              <p>المملكة العربية السعودية</p>
              <p>وزارة التعليم</p>
              <p>منصة المدرسة الرقمية</p>
            </div>
            <img src={logoImg} alt="شعار المدرسة" className="h-14 w-auto object-contain" />
            <div className="text-left text-xs text-slate-600 font-mono">
              <p>الرقم: 2026/09/CER</p>
              <p>التاريخ: 01-09-2026</p>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-100/70 px-4 py-1 rounded-full text-xs font-black">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>شهادة شكر وتقدير وتميز مدرسي</span>
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-cairo pt-2">
              يسر إدارة المدرسة تكريم الطالب
            </h2>
          </div>

          {/* Student Name */}
          <div className="py-2 border-y-2 border-dashed border-amber-300 my-2">
            <h3 className="text-3xl sm:text-4xl font-black text-[#00288e] font-tajawal">
              {student.name}
            </h3>
            <p className="text-sm font-bold text-slate-600 mt-1">
              المقيد بالصف: {student.grade} ({student.className})
            </p>
          </div>

          {/* Motivation Text */}
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-lg mx-auto font-medium">
            نظير تفوقه الدراسي المتميز بمعدل ({student.academicAverage}%) وانضباطه العالي والتزامه السلوكي النموذجي ومشاركته الفعالة في الأنشطة المدرسية للفصل الدراسي الحالي.
          </p>

          {/* Golden Seal & Signatures */}
          <div className="flex items-center justify-between pt-6 border-t border-amber-200/80 text-xs font-bold text-slate-700">
            <div className="text-center space-y-1">
              <p className="text-slate-500">رائد الفصل</p>
              <p className="font-extrabold text-slate-900">أ. أحمد الغامدي</p>
            </div>

            {/* Golden Seal Badge */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-1 shadow-md flex items-center justify-center text-white text-center">
              <div className="w-full h-full rounded-full border border-dashed border-white flex flex-col items-center justify-center p-0.5">
                <Award className="w-5 h-5 text-white" />
                <span className="text-[8px] font-black leading-none">ختم التميز</span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-slate-500">مدير المدرسة</p>
              <p className="font-extrabold text-slate-900">د. ناصر السعيد</p>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            إغلاق
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-[#00288e] hover:bg-[#002072] text-white shadow-soft flex items-center gap-2 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الشهادة الرسمية</span>
          </button>
        </div>

      </div>
    </div>
  );
};
