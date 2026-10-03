import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { CheckCheck, MessageSquarePlus, Send, ShieldCheck, Users } from 'lucide-react';
import { Student, TeacherAccount, TeacherConversation } from '../../types';
import { isCounselorAccount } from '../../services/security/authEngine';

/** معرّف المحادثة الخاصة بين معلم وولي أمر طالب واحد */
export const conversationIdFor = (teacherId: string, studentId: string) => `conv_${teacherId}_${studentId}`;

interface Contact {
  id: string;
  title: string;
  subtitle: string;
  avatar?: string;
  conversation?: TeacherConversation;
  meta: Omit<TeacherConversation, 'id' | 'lastMessage' | 'lastMessageTime' | 'unreadCount' | 'messages'>;
}

/**
 * التواصل بين ولي الأمر والمعلم — محادثة خاصة لكل (معلم، طالب).
 * ولي الأمر يرى معلمي فصل ابنه فقط، والمعلم يرى محادثات طلابه فقط، والمدير يتابع الكل.
 * لا ردود آلية باسم المعلم: كل رسالة كتبها شخص حقيقي.
 */
export const ParentTeacherChat: React.FC = () => {
  const {
    conversations,
    sendChatMessage,
    authenticatedRole,
    currentTeacher,
    teachers,
    students,
    parentLinkedStudent,
    previouslyLinkedStudents,
    setActiveTab
  } = useSchool();

  const isParent = authenticatedRole === 'parent';
  const isStaffMember = authenticatedRole === 'teacher' || authenticatedRole === 'counselor';

  // ── ولي الأمر: الابن النشط ──
  const myChildren: Student[] = useMemo(() => {
    const list = [...previouslyLinkedStudents];
    if (parentLinkedStudent && !list.some(s => s.id === parentLinkedStudent.id)) list.unshift(parentLinkedStudent);
    return list;
  }, [parentLinkedStudent, previouslyLinkedStudents]);
  const [childId, setChildId] = useState<string>(() => parentLinkedStudent?.id || previouslyLinkedStudents[0]?.id || '');
  const child = myChildren.find(c => c.id === childId) || myChildren[0];

  const contacts: Contact[] = useMemo(() => {
    if (isParent) {
      if (!child) return [];
      const active = teachers.filter(t => !t.status || t.status === 'active');
      const ofClass = active.filter(t => !isCounselorAccount(t) && (t.assignedClasses || []).some(c => c === child.className));
      const subjectTeachers = ofClass.length ? ofClass : active.filter(t => !isCounselorAccount(t));
      const counselors = active.filter(t => isCounselorAccount(t));
      return [...subjectTeachers, ...counselors].map((t: TeacherAccount) => {
        const id = conversationIdFor(t.id, child.id);
        return {
          id,
          title: t.name,
          subtitle: isCounselorAccount(t) ? 'الأخصائي الاجتماعي' : t.subject,
          avatar: t.avatar,
          conversation: conversations.find(c => c.id === id),
          meta: {
            teacherId: t.id, teacherName: t.name, subject: t.subject, avatar: t.avatar,
            studentId: child.id, studentName: child.name, className: child.className
          }
        };
      });
    }
    // الكادر والمدير: المحادثات القائمة (السياق يحصرها للمعلم في محادثاته)
    return conversations
      .filter(c => c.studentId)
      .map(c => ({
        id: c.id,
        title: `ولي أمر ${c.studentName || 'طالب'}`,
        subtitle: isStaffMember ? `فصل ${c.className || '—'}` : `${c.teacherName} • فصل ${c.className || '—'}`,
        avatar: undefined,
        conversation: c,
        meta: {
          teacherId: c.teacherId, teacherName: c.teacherName, subject: c.subject, avatar: c.avatar,
          studentId: c.studentId, studentName: c.studentName, className: c.className
        }
      }));
  }, [isParent, child, teachers, conversations, isStaffMember]);

  // ── المعلم: بدء محادثة مع ولي أمر طالب من فصوله ──
  const myStudents = useMemo(() => {
    if (!isStaffMember || !currentTeacher) return [];
    const classes = new Set(currentTeacher.assignedClasses || []);
    const pool = isCounselorAccount(currentTeacher) || classes.size === 0 ? students : students.filter(s => classes.has(s.className));
    return [...pool].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [isStaffMember, currentTeacher, students]);
  const [startStudentId, setStartStudentId] = useState('');
  const [draftContact, setDraftContact] = useState<Contact | null>(null);

  const allContacts = draftContact && !contacts.some(c => c.id === draftContact.id) ? [draftContact, ...contacts] : contacts;
  const [activeId, setActiveId] = useState<string>('');
  const active = allContacts.find(c => c.id === activeId) || allContacts[0];

  const [inputText, setInputText] = useState('');
  const streamRef = useRef<HTMLDivElement>(null);
  const messages = active?.conversation?.messages || [];

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight });
  }, [messages.length, active?.id]);

  const startConversation = () => {
    if (!currentTeacher) return;
    const st = myStudents.find(s => s.id === startStudentId);
    if (!st) return;
    const id = conversationIdFor(currentTeacher.id, st.id);
    setDraftContact({
      id,
      title: `ولي أمر ${st.name}`,
      subtitle: `فصل ${st.className}`,
      conversation: conversations.find(c => c.id === id),
      meta: {
        teacherId: currentTeacher.id, teacherName: currentTeacher.name, subject: currentTeacher.subject,
        avatar: currentTeacher.avatar, studentId: st.id, studentName: st.name, className: st.className
      }
    });
    setActiveId(id);
    setStartStudentId('');
  };

  const send = (text: string) => {
    if (!active || !text.trim()) return;
    sendChatMessage(active.id, text, undefined, undefined, undefined, active.meta);
    setInputText('');
  };

  const quickReplies = isParent
    ? ['السلام عليكم، أرجو إفادتي بمستوى ابني في المادة', 'ابني غائب اليوم لظرف صحي، والعذر سيصل للإدارة', 'شكراً لجهودكم أستاذنا الفاضل 🌹']
    : ['تم الاطلاع، شكراً لتواصلكم', 'نرجو متابعة واجبات الطالب في البيت', 'مستوى الطالب جيد ومتحسن، بارك الله فيكم'];

  const isMine = (senderRole: string) =>
    isParent ? senderRole === 'parent' : senderRole !== 'parent';

  return (
    <div className="space-y-5 pb-12 font-cairo text-right" dir="rtl">
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-blue-950 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-teal-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center text-2xl border border-teal-500/30">💬</div>
          <div>
            <h1 className="text-lg sm:text-xl font-black">التواصل مع {isParent ? 'معلمي ابني' : 'أولياء الأمور'}</h1>
            <p className="text-xs text-slate-300 mt-0.5">محادثة خاصة لكل طالب — لا يطّلع عليها أولياء أمور آخرون</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>المدير يتابع المحادثات لضمان الاحترام</span>
          </div>
          {isParent && (
            <button
              type="button"
              onClick={() => setActiveTab('parent-dashboard')}
              className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-[11px] font-black"
            >
              → عودة لمتابعة ابني
            </button>
          )}
        </div>
      </div>

      {isParent && myChildren.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {myChildren.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setChildId(c.id); setActiveId(''); }}
              className={`px-4 py-2 rounded-2xl text-xs font-black border whitespace-nowrap transition ${
                child?.id === c.id ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              {c.name.split(' ').slice(0, 2).join(' ')} • {c.className}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        {/* القائمة */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-l border-slate-100 dark:border-slate-800 p-3 sm:p-4 space-y-3 bg-slate-50/60 dark:bg-slate-900/60">
          {isStaffMember && (
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-[11px] font-black text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquarePlus className="w-4 h-4 text-teal-600" /> مراسلة ولي أمر طالب
              </p>
              <div className="flex gap-2">
                <select
                  value={startStudentId}
                  onChange={e => setStartStudentId(e.target.value)}
                  aria-label="اختر الطالب"
                  className="flex-1 min-w-0 px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <option value="">اختر الطالب...</option>
                  {myStudents.map(s => <option key={s.id} value={s.id}>{s.name} — {s.className}</option>)}
                </select>
                <button
                  type="button"
                  onClick={startConversation}
                  disabled={!startStudentId}
                  className="px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-black disabled:opacity-40"
                >
                  فتح
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            <h2 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-600" />
              {isParent ? 'معلمو الفصل' : 'المحادثات'}
            </h2>
            <span className="text-[11px] font-bold text-slate-400">({allContacts.length})</span>
          </div>

          {allContacts.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 p-4 text-center leading-relaxed">
              {isParent ? 'لم تسجّل المدرسة معلمين بعد.' : 'لا توجد محادثات بعد. ستظهر هنا رسائل أولياء الأمور فور وصولها.'}
            </p>
          )}

          <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
            {allContacts.map(c => {
              const isActive = c.id === active?.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={`w-full text-right p-3 rounded-2xl transition flex items-center gap-3 ${
                    isActive ? 'bg-white dark:bg-slate-800 shadow border border-teal-200 dark:border-teal-800/60' : 'hover:bg-white/70 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  {c.avatar ? (
                    <img src={c.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center font-black shrink-0">
                      {c.title.replace('ولي أمر ', '').charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">{c.title}</h3>
                      <span className="text-[10px] text-slate-400 shrink-0">{c.conversation?.lastMessageTime || ''}</span>
                    </div>
                    <p className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold truncate">{c.subtitle}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{c.conversation?.lastMessage || 'ابدأ المحادثة'}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* المحادثة */}
        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-900 min-h-[420px]">
          {active ? (
            <>
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                <h3 className="font-black text-sm text-slate-900 dark:text-white">{active.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {active.subtitle}{active.meta.studentName ? ` • بخصوص: ${active.meta.studentName}` : ''}
                </p>
              </div>

              <div ref={streamRef} className="p-4 sm:p-6 space-y-3 flex-1 overflow-y-auto max-h-[420px]">
                {messages.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-10">لا رسائل بعد — اكتب رسالتك بالأسفل.</p>
                )}
                {messages.map(msg => {
                  const mine = isMine(msg.senderRole);
                  return (
                    <div key={msg.id} className={`flex ${mine ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] rounded-3xl px-4 py-2.5 space-y-1 shadow-sm ${
                        mine
                          ? 'bg-gradient-to-tr from-teal-600 to-blue-600 text-white rounded-br-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md border border-slate-200/70 dark:border-slate-700/70'
                      }`}>
                        {!mine && <p className="text-[10px] font-black opacity-70">{msg.senderName}</p>}
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                        <div className={`flex items-center gap-1 text-[10px] justify-end opacity-70 ${mine ? 'text-white' : 'text-slate-400'}`}>
                          <span>{msg.timestamp}</span>
                          {mine && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
                {quickReplies.map(qr => (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => send(qr)}
                    className="text-[11px] bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              <form
                onSubmit={e => { e.preventDefault(); send(inputText); }}
                className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  aria-label="نص الرسالة"
                  maxLength={1000}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  aria-label="إرسال"
                  className="bg-gradient-to-r from-teal-600 to-blue-600 disabled:opacity-40 text-white p-3 rounded-2xl shadow-md active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-10 text-center text-sm text-slate-400">
              اختر محادثة من القائمة
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentTeacherChat;
