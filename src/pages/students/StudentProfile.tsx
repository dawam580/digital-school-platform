import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  FileText,
  Sparkles,
  HeartPulse,
  Send,
  Plus,
  Camera,
  QrCode,
  Share2,
  Printer,
  ChevronLeft,
  TrendingUp,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { RadarChart } from '../../components/ui/RadarChart';
import { CertificateModal } from '../../components/ui/CertificateModal';
import { BehaviorPointsModal } from '../../components/ui/BehaviorPointsModal';
import { AvatarPickerModal } from '../../components/ui/AvatarPickerModal';
import { sound } from '../../utils/soundEffects';

export const StudentProfile: React.FC = () => {
  const { selectedStudent, updateAttendance, addNotification, setActiveTab, addBehaviorPoint, updateStudentAvatar, currentRole } = useSchool();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'competencies' | 'academic' | 'attendance' | 'points'>('overview');
  
  // Modals
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [excuseDate, setExcuseDate] = useState('2026-09-01');
  const [excuseReason, setExcuseReason] = useState('');
  const [excuseSubmitted, setExcuseSubmitted] = useState(false);

  const handleSubmitExcuse = (e: React.FormEvent) => {
    e.preventDefault();
    updateAttendance(selectedStudent.id, 'excused', excuseReason);
    addNotification(
      'تم استلام طلب العذر الطبي',
      `تم إرسال طلب عذر الغياب للطالب (${selectedStudent.name}) بتاريخ ${excuseDate} للإدارة المدرسية.`,
      'attendance',
      selectedStudent.name
    );
    setExcuseSubmitted(true);
    sound.playSuccess();
    setTimeout(() => {
      setExcuseSubmitted(false);
      setShowExcuseModal(false);
      setExcuseReason('');
    }, 1200);
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in max-w-5xl mx-auto pb-10">
      
      {/* 1. Student Hero Banner Card with Gradient & Glass Accents */}
      <div className="bg-gradient-to-r from-[#00288e] via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Avatar and Basic Details */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white/30 shadow-md group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 bg-white text-[#00288e] p-1.5 rounded-full shadow-sm">
                <Camera className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black">{selectedStudent.name}</h1>
                <Badge status={selectedStudent.status} size="sm" />
              </div>
              <p className="text-xs sm:text-sm text-blue-100 font-medium">
                {selectedStudent.grade} • شعبة ({selectedStudent.className.split('/')[1]?.trim() || 'أ'})
              </p>
              <div className="flex items-center gap-3 text-xs text-blue-200 font-mono pt-0.5">
                <span>رقم الطالب: {selectedStudent.studentNumber}</span>
                <span>•</span>
                <span>كود الربط: <span className="font-bold text-amber-300">{selectedStudent.linkCode}</span></span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Points, Certificate, QR Badge) */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            
            {/* Award Points Button (for Teachers/Admins) */}
            <button
              onClick={() => setShowPointsModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-soft flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-900" />
              <span>تقييم ومنح نقاط (+/-)</span>
            </button>

            {/* Certificate Button */}
            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs shadow-soft flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>شهادة التقدير</span>
            </button>

            {/* QR Badge Button */}
            <button
              onClick={() => setShowQrModal(true)}
              className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white shadow-soft transition-all"
              title="بطاقة الطالب ورمز QR"
            >
              <QrCode className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>

      {/* 2. Key Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-slate-400">نسبة الحضور والانضباط</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-tajawal">{selectedStudent.attendanceRate}%</p>
          <span className="text-[10px] text-emerald-600 font-bold block">↑ ممتاز (أعلى من المعدل)</span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-slate-400">المعدل الأكاديمي العام</span>
          <p className="text-2xl sm:text-3xl font-black text-[#00288e] font-tajawal">{selectedStudent.academicAverage}%</p>
          <span className="text-[10px] text-slate-400 font-medium block">تقدير ممتاز مرتفع</span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-slate-400">مجموع نقاط التميز</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-500 font-tajawal">+{selectedStudent.behaviorPointsTotal}</p>
          <span className="text-[10px] text-amber-600 font-bold block">سلوك رائع ومشارك</span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-slate-400">آخر تواجد مسجل</span>
          <p className="text-sm font-extrabold text-slate-800 pt-1 leading-tight">{selectedStudent.lastSeenTime || '07:15 ص'}</p>
          <span className="text-[10px] text-slate-400 font-medium block">البوابة الإلكترونية</span>
        </div>

      </div>

      {/* 3. Sub Tabs Navigation */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-slate-100 shadow-card overflow-x-auto">
        {[
          { id: 'overview', label: 'نظرة عامة والتقييم' },
          { id: 'competencies', label: 'مخطط الكفايات والمهارات' },
          { id: 'academic', label: 'الدرجات والمواد' },
          { id: 'attendance', label: 'سجل الحضور' },
          { id: 'points', label: `سجل النقاط والأوسمة (${selectedStudent.behaviorPoints.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveSubTab(tab.id as any); sound.playTap(); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeSubTab === tab.id
                ? 'bg-[#00288e] text-white shadow-soft'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Circular Gauge Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
              <h3 className="text-base font-bold text-slate-800">مؤشر التزام الحضور الشهري</h3>
              
              <div className="relative flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="64" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={402}
                    strokeDashoffset={402 - (402 * selectedStudent.attendanceRate) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900 font-tajawal">{selectedStudent.attendanceRate}%</span>
                  <span className="text-[11px] font-bold text-emerald-600">منتظم</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-600 pt-2">
                <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">21 يوم حاضر</span>
                <span className="text-amber-700 bg-amber-50 px-3 py-1 rounded-xl">1 يوم متأخر</span>
                <span className="text-blue-700 bg-blue-50 px-3 py-1 rounded-xl">1 يوم بعذر</span>
              </div>
            </div>

            {/* Quick Actions & Parent Excuses */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <HeartPulse className="w-5 h-5 text-red-500" />
                  <span>خدمات ولي الأمر والأعذار الطبية</span>
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  يمكنك تقديم طلب استئذان مسبق أو إرفاق إشعار عذر غياب طبي معتمد للإدارة المدرسية في أي وقت.
                </p>
              </div>

              <div className="space-y-2.5 pt-4">
                <button
                  onClick={() => setShowExcuseModal(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <HeartPulse className="w-4 h-4 text-amber-700" />
                  <span>تقديم طلب استئذان / عذر طبي للغياب</span>
                </button>

                <button
                  onClick={() => setActiveTab('daily-report')}
                  className="w-full py-3 px-4 rounded-2xl bg-[#00288e] hover:bg-[#002072] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>عرض التقرير اليومي الشامل للحصص والواجبات</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Competencies Radar Spider Chart */}
      {activeSubTab === 'competencies' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00288e]" />
                <span>مخطط الكفايات والمهارات الشخصية (Spider Radar Chart)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">تقييم المهارات الأكاديمية والشخصية والاجتماعية للطالب</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              تقييم شامل
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex justify-center p-4">
              <RadarChart competencies={selectedStudent.competencies} size={280} />
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 mb-2">تفصيل نتائج المهارات:</h4>
              {selectedStudent.competencies.map(c => (
                <div key={c.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{c.name}</span>
                    <span className="font-tajawal text-[#00288e]">{c.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00288e] rounded-full" style={{ width: `${c.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Academic Subjects */}
      {activeSubTab === 'academic' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedStudent.subjects.map(subj => (
              <div key={subj.name} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{subj.name}</h4>
                    <p className="text-xs text-slate-400">{subj.teacher}</p>
                  </div>
                  <div className="text-left">
                    <span className="text-2xl font-black text-[#00288e] font-tajawal">{subj.score}</span>
                    <span className="text-xs text-slate-400 font-bold"> / {subj.maxScore}</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(subj.score / subj.maxScore) * 100}%` }} />
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl leading-relaxed">
                  💡 <span className="font-medium">{subj.evaluation}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Attendance History */}
      {activeSubTab === 'attendance' && (
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4 animate-in fade-in">
          <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
            سجل الحضور الزمني المعتمد
          </h3>

          <div className="divide-y divide-slate-100">
            {(selectedStudent.recentAttendance || []).map((rec, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#00288e]" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{rec.date}</p>
                    {rec.note && <p className="text-xs text-slate-400">{rec.note}</p>}
                  </div>
                </div>
                <Badge status={rec.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Behavior Points & Badges */}
      {activeSubTab === 'points' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Behavior Points List */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">سجل النقاط والملاحظات التفاعلية</h3>
              <button
                onClick={() => setShowPointsModal(true)}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة نقطة جديدة</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {(selectedStudent.behaviorPoints || []).map(bp => (
                <div
                  key={bp.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
                    bp.category === 'positive'
                      ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950'
                      : 'bg-red-50/50 border-red-100 text-red-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{bp.icon}</span>
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">{bp.title}</p>
                      <p className="text-slate-500">{bp.teacher} • {bp.date}</p>
                    </div>
                  </div>
                  <span className={`text-base font-black font-tajawal ${
                    bp.points > 0 ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {bp.points > 0 ? `+${bp.points}` : bp.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges and Awards Showcase */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>الأوسمة والشهادات التكريمية</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(selectedStudent.badges || []).map(badge => (
                <div key={badge.id} className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 text-center space-y-1.5">
                  <span className="text-3xl block">{badge.icon}</span>
                  <h4 className="text-xs font-extrabold text-amber-900">{badge.title}</h4>
                  <p className="text-[10px] text-slate-500">{badge.description}</p>
                  <span className="text-[9px] text-slate-400 font-mono block">{badge.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Modals */}
      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        student={selectedStudent}
      />

      <BehaviorPointsModal
        isOpen={showPointsModal}
        onClose={() => setShowPointsModal(false)}
        student={selectedStudent}
        onAward={(point) => addBehaviorPoint(selectedStudent.id, point)}
      />

      <AvatarPickerModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={selectedStudent.avatar}
        onSaveAvatar={(newAvatar) => updateStudentAvatar(selectedStudent.id, newAvatar)}
      />

      {/* QR Code Modal */}
      <Modal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={`بطاقة الحضور الذكية للطالب (${selectedStudent.name})`}
      >
        <div className="text-center space-y-4 p-2">
          <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 inline-block">
            <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mx-auto flex flex-col items-center justify-center">
              <QrCode className="w-36 h-36 text-[#00288e]" />
              <span className="text-[10px] font-mono font-bold text-slate-500 mt-1">{selectedStudent.studentNumber}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            يُمسح هذا الرمز الذكي عند بوابات المدرسة أو الحافلات لرصد الحضور والانصراف آلياً وإشعار ولي الأمر فورياً.
          </p>
          <button
            onClick={() => { window.print(); sound.playTap(); }}
            className="w-full py-2.5 bg-[#00288e] text-white rounded-xl text-xs font-bold shadow-soft"
          >
            طباعة بطاقة الطالب المدرسية
          </button>
        </div>
      </Modal>

      {/* Excuse Modal */}
      <Modal
        isOpen={showExcuseModal}
        onClose={() => setShowExcuseModal(false)}
        title={`تقديم عذر غياب / استئذان للطالب (${selectedStudent.name})`}
      >
        <form onSubmit={handleSubmitExcuse} className="space-y-4 text-right">
          <Input
            label="تاريخ الغياب / الاستئذان"
            type="date"
            value={excuseDate}
            onChange={e => setExcuseDate(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              سبب العذر الطبي أو المبرر
            </label>
            <textarea
              rows={3}
              placeholder="اكتب تفاصيل العذر أو تقرير الزيارة الطبية..."
              value={excuseReason}
              onChange={e => setExcuseReason(e.target.value)}
              className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
              required
            />
          </div>

          {excuseSubmitted && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم إرسال العذر للإدارة المدرسية بنجاح!</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-[#00288e] hover:bg-[#002072] text-white font-bold text-xs rounded-2xl shadow-soft flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>إرسال العذر الطبي</span>
            </button>
            <button
              type="button"
              onClick={() => setShowExcuseModal(false)}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-2xl"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
