import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { CheckCheck, Image, Mic, Paperclip, Send, Smile, Sparkles, User, Volume2 } from 'lucide-react';

export const ParentTeacherChat: React.FC = () => {
  const { conversations, sendChatMessage, currentRole, selectedStudent } = useSchool();
  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || 'conv-1');
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(activeConvId, inputText);
    setInputText('');
  };

  const handleSendVoiceNote = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      sendChatMessage(activeConvId, undefined, true, '0:14');
    }, 1500);
  };

  const handleSendQuickReply = (reply: string) => {
    sendChatMessage(activeConvId, reply);
  };

  const quickReplies = [
    'شكراً لحرصكم واهتمامكم الدائم بريان 🌟',
    'تم حل الواجب وتسليمه عبر المنصة بنجاح 📝',
    'نرجو تزويدنا بموعد الاختبار القصير القادم 📅',
    'جزاكم الله خيراً أستاذنا الفاضل على جهودكم 👏'
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-blue-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-teal-800/40">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center text-2xl shadow-md border border-teal-500/30">
              💬
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black">غرفة التواصل والمحادثة المباشرة</h1>
              <p className="text-xs text-slate-300 mt-0.5">
                تواصل فوري ومباشر بين أولياء الأمور وكادر المعلمين لكل مادة
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>المعلمون متواجدون الآن للرد</span>
          </div>
        </div>
      </div>

      {/* Main Chat Hub: Split Screen */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Right Pane: Teachers List */}
        <div className="lg:col-span-4 border-l border-slate-100 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="px-2 py-1 flex items-center justify-between">
            <h2 className="font-black text-sm text-slate-900 dark:text-white">معلمو المواد الدراسية</h2>
            <span className="text-[11px] font-bold text-slate-400">({conversations.length} معلمين)</span>
          </div>

          <div className="space-y-2">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConvId;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-right p-3.5 rounded-2xl transition-all flex items-center gap-3.5 ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 shadow-md border border-teal-200 dark:border-teal-800/50'
                      : 'hover:bg-white/60 dark:hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={conv.avatar}
                      alt={conv.teacherName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-sm"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {conv.teacherName}
                      </h3>
                      <span className="text-[10px] text-slate-400 shrink-0">{conv.lastMessageTime}</span>
                    </div>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold block">
                      {conv.subject}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Left Pane: Active Chat Room */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white dark:bg-slate-900">
          {/* Active Chat Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <img
                src={activeConv.avatar}
                alt={activeConv.teacherName}
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-teal-500/30"
              />
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{activeConv.teacherName}</span>
                  <span className="text-[10px] bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-md font-bold">
                    {activeConv.subject}
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>متصل الآن • الرد المعتاد خلال دقائق</span>
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-bold">
              الطالب: <span className="text-slate-700 dark:text-slate-200">{selectedStudent.name}</span>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[420px]">
            {activeConv.messages.map((msg) => {
              const isMe = (currentRole === 'parent' && msg.senderRole === 'parent') ||
                           (currentRole !== 'parent' && msg.senderRole === 'teacher');

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isMe ? 'justify-start flex-row-reverse' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[78%] rounded-3xl p-4 space-y-1 shadow-sm ${
                      isMe
                        ? 'bg-gradient-to-tr from-teal-600 to-blue-600 text-white rounded-br-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {/* Voice Note Simulation */}
                    {msg.isVoice ? (
                      <div className="flex items-center gap-3 py-1">
                        <button className={`w-8 h-8 rounded-full flex items-center justify-center ${isMe ? 'bg-white text-teal-600' : 'bg-teal-600 text-white'}`}>
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-3 bg-current rounded-full animate-pulse" />
                          <div className="w-1 h-5 bg-current rounded-full animate-pulse" />
                          <div className="w-1 h-2 bg-current rounded-full animate-pulse" />
                          <div className="w-1 h-6 bg-current rounded-full animate-pulse" />
                          <div className="w-1 h-4 bg-current rounded-full animate-pulse" />
                        </div>
                        <span className="text-xs font-mono font-bold opacity-80">{msg.voiceDuration || '0:14'}</span>
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                    )}

                    <div className={`flex items-center gap-1 text-[10px] justify-end opacity-70 ${isMe ? 'text-white' : 'text-slate-400'}`}>
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-teal-200" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Smart Quick Replies */}
          <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              ردود ذكية:
            </span>
            {quickReplies.map((qr, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuickReply(qr)}
                className="text-[11px] font-medium bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full transition shrink-0 whitespace-nowrap shadow-sm"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={handleSendVoiceNote}
              disabled={isRecording}
              className={`p-3 rounded-2xl border transition shadow-sm ${
                isRecording
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-teal-600'
              }`}
              title="تسجيل رسالة صوتية"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب رسالتك أو استفسارك هنا..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 disabled:opacity-40 text-white p-3 rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
