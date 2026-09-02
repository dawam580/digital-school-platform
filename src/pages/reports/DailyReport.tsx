import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Archive,
  ArrowLeft,
  Printer,
  Sparkles,
  BookOpen,
  Star,
  ListTodo,
  Smile,
  Volume2,
  Check,
  ChevronLeft
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { sound } from '../../utils/soundEffects';

export const DailyReport: React.FC = () => {
  const { dailyReport, selectedStudent, setActiveTab } = useSchool();
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  const handlePlayVoiceNote = () => {
    sound.playSuccess();
    setPlayingAudio(true);
    setTimeout(() => setPlayingAudio(false), 3000);
  };

  const archiveReports = [
    { date: 'الإثنين، 31 أغسطس 2026', status: 'حاضر', checkIn: '07:12 ص', checkOut: '01:30 م', note: 'أداء متميز في حصة الإملاء والتعبير' },
    { date: 'الأحد، 30 أغسطس 2026', status: 'متأخر', checkIn: '07:45 ص', checkOut: '01:30 م', note: 'تم التنبيه على أهمية الحضور المبكر للطابور' },
    { date: 'الخميس، 27 أغسطس 2026', status: 'حاضر', checkIn: '07:10 ص', checkOut: '01:15 م', note: 'تسليم مشروع العلوم بنجاح' },
    { date: 'الأربعاء، 26 أغسطس 2026', status: 'حاضر', checkIn: '07:15 ص', checkOut: '01:30 م', note: 'حفظ متقن لقصيدة لغتي الجميلة' },
  ];

  return (
    <div className="space-y-6 text-right animate-in fade-in max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              التقرير اليومي التفاعلي
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full">
              محدث ولحظي ✅
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            ملخص الحصص، الواجبات المنزلية، التقييم السلوكي، والجدول الزمني ليوم {dailyReport.dayOfWeek} {dailyReport.date}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl shadow-card flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-[#00288e]" />
            <span>طباعة التقرير</span>
          </button>
          <button
            onClick={() => setActiveTab('student-profile')}
            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#00288e] font-bold text-xs rounded-2xl transition-colors flex items-center gap-1"
          >
            <span>ملف الطالب</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Student Overview Card */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white rounded-3xl p-6 shadow-card border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={selectedStudent.avatar}
            alt={selectedStudent.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-soft"
          />
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">{selectedStudent.name}</h2>
            <p className="text-xs text-slate-500 font-medium">{selectedStudent.grade} - {selectedStudent.className}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-white px-3.5 py-2 rounded-2xl border border-slate-100 shadow-sm text-center">
            <span className="text-slate-400 text-[10px] block">حالة الحضور</span>
            <Badge status={selectedStudent.status} size="sm" />
          </div>

          <div className="bg-white px-3.5 py-2 rounded-2xl border border-slate-100 shadow-sm text-center">
            <span className="text-slate-400 text-[10px] block">وقت الدخول</span>
            <span className="font-bold text-slate-800 font-mono block mt-0.5">{dailyReport.checkInTime}</span>
          </div>

          <div className="bg-white px-3.5 py-2 rounded-2xl border border-slate-100 shadow-sm text-center">
            <span className="text-slate-400 text-[10px] block">المزاج والتفاعل</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              <Smile className="w-3.5 h-3.5 text-amber-500" />
              <span>{dailyReport.overallMood}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Timeline of the School Day */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <Clock className="w-5 h-5 text-[#00288e]" />
            <span>الجدول الزمني التفاعلي للحصص والأنشطة (Timeline)</span>
          </div>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            تحديث لحظي
          </span>
        </div>

        <div className="relative pr-4 border-r-2 border-slate-200 space-y-6 pt-2">
          {dailyReport.timeline.map((item) => {
            const isDone = item.status === 'completed';
            const isCurrent = item.status === 'current';

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -right-[23px] top-1 w-4 h-4 rounded-full border-2 border-white transition-transform group-hover:scale-125 ${
                    isDone
                      ? 'bg-emerald-500 shadow-sm'
                      : isCurrent
                      ? 'bg-[#00288e] ring-4 ring-blue-100 animate-pulse'
                      : 'bg-slate-300'
                  }`}
                />

                <div className="bg-slate-50/70 hover:bg-slate-100/80 p-3.5 rounded-2xl border border-slate-100 transition-all space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black text-slate-800">{item.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-400">{item.time}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCurrent
                            ? 'bg-blue-100 text-[#00288e]'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isDone ? 'مكتمل' : isCurrent ? 'قيد التنفيذ الآن' : 'قادم'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                    {item.teacher && <span>المعلم: {item.teacher}</span>}
                    {item.room && <span>المكان: {item.room}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subjects Daily Breakdown */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#00288e]" />
          <span>تفاصيل الحصص والواجبات المدرسية</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dailyReport.subjectsSummary.map((sub, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 shadow-card border border-slate-100 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{sub.subject}</h4>
                  <p className="text-xs text-[#00288e] font-semibold mt-0.5">{sub.topic}</p>
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    sub.homeworkStatus === 'مكتمل'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : sub.homeworkStatus === 'لا يوجد'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  الواجب: {sub.homeworkStatus}
                </span>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>تفاعل الطالب:</span>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= sub.participation ? 'fill-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
              </div>

              {sub.teacherNote && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                  💬 <span className="font-medium">{sub.teacherNote}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Teacher Voice & Behavior Note Card */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <MessageSquare className="w-5 h-5 text-[#00288e]" />
            <span>رسالة وملاحظة رائد الفصل لولي الأمر</span>
          </div>

          {/* Voice note simulation button */}
          <button
            onClick={handlePlayVoiceNote}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              playingAudio
                ? 'bg-emerald-500 text-white animate-pulse'
                : 'bg-blue-50 text-[#00288e] hover:bg-blue-100'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{playingAudio ? 'جاري الاستماع للرسالة...' : 'استماع للتسجيل الصوتي (0:18)'}</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#f0f4ff] border border-blue-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p className="font-bold text-[#00288e] mb-1">أ. أحمد الغامدي (رائد الفصل):</p>
          <p>
            "{dailyReport.behaviorNotes}"
          </p>
        </div>
      </div>

      {/* Tomorrow Tasks & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Achievements Card */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-amber-100 space-y-3 bg-gradient-to-br from-amber-50/30 via-white to-white">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-100 text-amber-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>أوسمة وإنجازات اليوم</span>
          </div>
          <div className="space-y-2">
            {(dailyReport.achievements || [
              'المشاركة الفعالة في مسابقة الحساب الذهني 🌟',
              'إتمام كافة تمارين معمل الحاسوب بنجاح 💻'
            ]).map((ach, i) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-white p-3 rounded-2xl border border-amber-100 font-semibold text-slate-700 shadow-sm">
                <span className="text-amber-500 text-base">⭐</span>
                <span>{ach}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks for Tomorrow */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-blue-100 space-y-3 bg-gradient-to-br from-blue-50/30 via-white to-white">
          <div className="flex items-center gap-2 pb-2 border-b border-blue-100 text-[#00288e] font-bold text-sm">
            <ListTodo className="w-4 h-4 text-[#00288e]" />
            <span>المهام والواجبات المطلوبة للغد</span>
          </div>
          <div className="space-y-2">
            {(dailyReport.tasksForTomorrow || [
              'إحضار كراسة الرياضيات لحل تمارين الهندسة',
              'مراجعة درس وحدات الإدخال والإخراج في الحاسوب'
            ]).map((task, i) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-white p-3 rounded-2xl border border-blue-100 font-semibold text-slate-700 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{task}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Archive Button */}
      <div className="pt-2">
        <button
          onClick={() => { setShowArchiveModal(true); sound.playTap(); }}
          className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-[#00288e] text-slate-700 hover:text-[#00288e] font-bold text-sm rounded-2xl shadow-card transition-all flex items-center justify-center gap-2"
        >
          <Archive className="w-4 h-4" />
          <span>عرض أرشيف وسجلات التقارير السابقة</span>
        </button>
      </div>

      {/* Archive Modal */}
      <Modal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        title="أرشيف التقارير اليومية السابقة"
        maxWidth="lg"
      >
        <div className="space-y-4 text-right">
          <p className="text-xs text-slate-500">
            قائمة بالتقارير اليومية وسجلات الحضور للطالب ({selectedStudent.name}) مرتبة بالتاريخ:
          </p>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto space-y-2">
            {archiveReports.map((rep, idx) => (
              <div key={idx} className="pt-3 pb-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#00288e]" />
                    <span className="text-xs font-bold text-slate-900">{rep.date}</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    rep.status === 'حاضر' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rep.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pr-6">
                  <span>الدخول: {rep.checkIn}</span>
                  <span>•</span>
                  <span>الخروج: {rep.checkOut}</span>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 pr-6 mt-1">
                  💬 {rep.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Modal>

    </div>
  );
};
