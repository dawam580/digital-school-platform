import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Code2,
  BookOpen,
  FileText,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { SchoolAiCopilotService, CopilotMessage } from '../../services/ai/schoolAiCopilotService';
import { AiConfigService } from '../../services/ai/aiConfig';
import { sound } from '../../utils/soundEffects';

interface AiSchoolCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPT_PRESETS = [
  { label: '🛠️ إضافة فصول ومواد', prompt: 'كيف أضيف فصلاً دراسياً جديداً أو مادة دراسية جديدة لمعلم في المنظومة؟' },
  { label: '📝 صياغة تعميم للغياب', prompt: 'صغ لي تعميماً مدرسياً رسمياً موجهاً لأولياء الأمور بخصوص أهمية الحضور الصباحي ولائحة الغياب.' },
  { label: '📊 تحليل نسب الدرجات', prompt: 'ما هو نظام توزيع درجات أعمال السنة والامتحان النهائي المعتمد في وزارة التربية والتعليم الليبية؟' },
  { label: '💻 مقترحات تطوير برمجية', prompt: 'اقترح لي 3 تحسينات برمجية احترافية يمكن إضافتها لتطوير كود المنظومة.' }
];

export const AiSchoolCopilotModal: React.FC<AiSchoolCopilotModalProps> = ({
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content: `مرحباً بك! أنا **المساعد الذكي لبناء وإدارة منصة المدرسة**، مدعوم بنموذج **Claude Opus 4.8** وخوادم المعالجة السحابية الهجينة.
يمكنني مساعدتك في:
- بناء وتعديل كود ومكونات المنظومة البرمجية.
- صياغة الخطابات والتعاميم الإدارية المعتمدة.
- الاستفسار عن كشوفات الدرجات، اللوائح الامتحانية الليبية، وحساب المعدلات.
- تنظيم وتوزيع جداول المعلمين وفصولهم دون تضارب.

اختر من الأسئلة السريعة أدناه أو اكتب استفسارك مباشرة!`,
      timestamp: 'الآن',
      modelUsed: 'Claude Opus 4.8 (SeekAI)'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    sound.playTap();
    setInputPrompt('');

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const result = await SchoolAiCopilotService.ask(text, messages);

      const assistantMsg: CopilotMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: result.model
      };

      setMessages(prev => [...prev, assistantMsg]);
      sound.playSuccess();
    } catch (err: any) {
      const errorMsg: CopilotMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: ${err.message || 'يرجى المحاولة لاحقاً'}`,
        timestamp: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'نظام الاستجابة التلقائي'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    sound.playTap();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl font-cairo text-right animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col h-[88vh] max-h-[820px]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xl shadow-md border border-white/20 shrink-0">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black leading-tight flex items-center gap-1.5">
                  <span>المساعد الذكي لبناء وإدارة المنظومة</span>
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                </h3>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-purple-300" />
                  <span>Claude Opus 4.8 • SeekAI Active</span>
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">
                مستشارك البرمجي والإداري المباشر لدعم وتطوير منصة المدرسة الرقمية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { onClose(); sound.playTap(); }}
            className="p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompt Chips */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none text-xs">
          <span className="text-[11px] text-slate-400 font-bold shrink-0">مقترحات:</span>
          {QUICK_PROMPT_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p.prompt)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 shrink-0 transition active:scale-95 shadow-xs disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-right">
          {messages.map((m) => {
            const isUser = m.role === 'user';

            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Box */}
                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* Model tag & timestamp */}
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1.5 pb-1 border-b border-black/5 dark:border-white/5">
                    <span className="font-bold">{isUser ? 'أنت' : 'Claude Opus 4.8'}</span>
                    <div className="flex items-center gap-2">
                      {m.modelUsed && (
                        <span className="font-mono bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                          {m.modelUsed}
                        </span>
                      )}
                      <span>{m.timestamp}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="whitespace-pre-wrap font-sans">
                    {m.content}
                  </div>

                  {/* Copy Button */}
                  {!isUser && (
                    <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(m.id, m.content)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-purple-600 dark:hover:text-purple-300 transition"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">تم النسخ ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ الإجابة</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-xs animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl rounded-tl-none p-4 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                <span>جاري استشارة Claude Opus 4.8 والمعالجة السحابية...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="اسأل المساعد الذكي عن أي تعديل، فكرة، كود، أو مساعدة في بناء المنظومة..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <span>إرسال</span>
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
