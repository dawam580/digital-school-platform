import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Student, TeacherAccount, NotificationItem, TeacherConversation, ParentSummon, SchoolProfile, ChatMessage } from '../../types';
import { buildParentView, parentLoginId, contactsForStudent, ParentInboxMessage } from '../../parent-sync/protocol';
import { ExamStorageService, ExamGradeRecord } from '../exams/examStorageService';
import { LibyanExamEngine } from '../exams/libyanExamEngine';
import { LicenseService } from '../licensing/licenseService';
import { isSignedLicenseFormat } from '../licensing/cryptoHelper';
import { SecurityEngine } from '../security/securityEngine';
import { getParentSyncConfig, publishParentViews, pullParentInbox, PublishResult, recordReceived, receivedFor } from './schoolSync';

export interface ParentSyncStatus {
  state: 'off' | 'syncing' | 'ok' | 'error';
  lastPublishAt?: string;
  lastPullAt?: string;
  published?: number;
  uploaded?: number;
  appliedMessages?: number;
  error?: string;
}

interface Deps {
  students: Student[];
  teachers: TeacherAccount[];
  notifications: NotificationItem[];
  conversations: TeacherConversation[];
  parentSummons: ParentSummon[];
  schoolProfile: SchoolProfile;
  setConversations: React.Dispatch<React.SetStateAction<TeacherConversation[]>>;
  saveConversations: (c: TeacherConversation[]) => void;
  setParentSummons: React.Dispatch<React.SetStateAction<ParentSummon[]>>;
  addNotification: (title: string, message: string, category: NotificationItem['category'], studentName?: string, studentId?: string, targetRole?: NotificationItem['targetRole']) => void;
}

const PUBLISH_DEBOUNCE_MS = 8_000;
const PUBLISH_INTERVAL_MS = 120_000;
const PULL_INTERVAL_MS = 45_000;

/** ترخيص موقّع ساري — شرط المزامنة (لا مزامنة في التجربة المجانية) */
function activeLicense(): string | null {
  const key = (LicenseService.getActiveLicenseKey() || '').trim();
  return isSignedLicenseFormat(key) && /^MADRASA-v3-/.test(key) ? key : null;
}

/**
 * يعمل داخل SchoolProvider على حاسوب المدرسة: يرفع ملخصات أولياء الأمور عند كل تغيير
 * (بعد تهدئة قصيرة) ودورياً، ويسحب رسائلهم ويطبقها (محادثة/تأكيد استدعاء/عذر للمراجعة).
 */
export function useParentAppSync(d: Deps) {
  const [status, setStatus] = useState<ParentSyncStatus>(() => ({ state: getParentSyncConfig().enabled ? 'ok' : 'off' }));
  const latest = useRef(d);
  latest.current = d;
  const lidMapRef = useRef<PublishResult['lidMap'] | null>(null);
  const busy = useRef(false);
  const syncNowRef = useRef<(o?: { publish?: boolean }) => Promise<void>>(async () => {});

  const applyMessages = useCallback((msgs: ParentInboxMessage[]) => {
    const { students, teachers, parentSummons } = latest.current;
    let applied = 0;
    for (const m of msgs) {
      const st = students.find(s => s.id === m.studentId);
      if (!st) continue;
      // إيصال استلام حتى لو رُفضت الرسالة (معلم لم يعد للفصل...) — كي لا يكرر الهاتف الإرسال
      recordReceived(st.id, [m.id]);
      if (m.type === 'chat') {
        const contact = contactsForStudent(st, teachers).find(c => c.teacherId === m.teacherId);
        const teacher = teachers.find(t => t.id === m.teacherId);
        if (!contact || !teacher) continue;
        const text = SecurityEngine.cleanText(m.text);
        if (!text) continue;
        const convId = `conv_${teacher.id}_${st.id}`;
        const at = new Date(m.sentAt);
        const msg: ChatMessage = {
          id: m.id,
          senderRole: 'parent',
          senderName: `ولي أمر ${st.name}`,
          text,
          timestamp: (isNaN(at.getTime()) ? new Date() : at).toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
          read: false,
        };
        latest.current.setConversations(prev => {
          const existing = prev.find(c => c.id === convId);
          if (existing?.messages.some(x => x.id === msg.id)) return prev;
          const next = existing
            ? prev.map(c => (c.id === convId ? { ...c, lastMessage: text, lastMessageTime: msg.timestamp, unreadCount: c.unreadCount + 1, messages: [...c.messages, msg] } : c))
            : [{
                id: convId, teacherId: teacher.id, teacherName: teacher.name, subject: teacher.subject, avatar: teacher.avatar,
                studentId: st.id, studentName: st.name, className: st.className,
                lastMessage: text, lastMessageTime: msg.timestamp, unreadCount: 1, messages: [msg],
              }, ...prev];
          latest.current.saveConversations(next);
          return next;
        });
        latest.current.addNotification(`💬 رسالة من ولي أمر ${st.name} (تطبيق الجوال)`, text.slice(0, 120), 'academic', st.name, st.id, 'teacher');
        applied += 1;
      } else if (m.type === 'summons-confirm') {
        const sm = parentSummons.find(x => x.id === m.summonsId && x.studentId === st.id);
        if (!sm || sm.parentConfirmedAt) continue;
        latest.current.setParentSummons(prev => prev.map(x => (x.id === sm.id ? { ...x, parentConfirmedAt: m.sentAt } : x)));
        latest.current.addNotification('✅ ولي الأمر أكد موعد الاستدعاء (تطبيق الجوال)', `${st.name} — يوم ${sm.requestedDate} ${sm.requestedTime}`, 'admin', st.name, st.id, 'counselor');
        applied += 1;
      } else if (m.type === 'excuse') {
        // العذر طلب يراجعه المدير/المعلم — لا يغيّر سجل الحضور تلقائياً
        latest.current.addNotification(
          `📝 عذر غياب مقدّم من ولي أمر ${st.name}`,
          `التاريخ: ${m.date} — السبب: ${SecurityEngine.cleanText(m.reason).slice(0, 300)}. (يُعتمد من سجل الحضور بعد المراجعة)`,
          'attendance', st.name, st.id, 'admin'
        );
        applied += 1;
      }
    }
    return applied;
  }, []);

  const buildEntries = useCallback(async () => {
    const { students, teachers, notifications, conversations, parentSummons, schoolProfile } = latest.current;
    const eligible = students.filter(s => s.parentAccessCode && parentLoginId(s));
    const classes = [...new Set(eligible.map(s => s.className).filter(Boolean))];
    const [subjects, records] = await Promise.all([ExamStorageService.getSubjects(), ExamStorageService.getAllGradeRecords()]);
    const locks = new Map(await Promise.all(classes.map(async c => [c, await ExamStorageService.getExamLock(c)] as const)));
    const recordsByStudent = new Map<string, Map<string, ExamGradeRecord>>();
    for (const r of records) {
      if (!recordsByStudent.has(r.studentId)) recordsByStudent.set(r.studentId, new Map());
      recordsByStudent.get(r.studentId)!.set(r.id, r);
    }
    const nameCount = new Map<string, number>();
    for (const s of students) nameCount.set(s.name, (nameCount.get(s.name) || 0) + 1);

    return eligible.map(s => {
      const lock = locks.get(s.className);
      const released = !!lock?.isReleasedToParents;
      const mine = recordsByStudent.get(s.id);
      const official = released && mine && mine.size > 0
        ? LibyanExamEngine.calculateStudentExamReport({ ...s, subjects: [] }, subjects, mine)
        : null;
      return {
        studentId: s.id,
        loginId: parentLoginId(s),
        code: s.parentAccessCode!,
        view: buildParentView({
          student: s,
          school: schoolProfile,
          teachers,
          notifications,
          conversations,
          summons: parentSummons,
          nameIsUnique: (nameCount.get(s.name) || 0) === 1,
          exam: { held: !!lock?.isLocked && !released, official },
          received: receivedFor(s.id),
        }),
      };
    });
  }, []);

  const syncNow = useCallback(async (opts: { publish?: boolean } = { publish: true }) => {
    const cfg = getParentSyncConfig();
    const license = activeLicense();
    if (!cfg.enabled || !cfg.url) { setStatus({ state: 'off' }); return; }
    if (!license) { setStatus(s => ({ ...s, state: 'error', error: 'المزامنة تتطلب مفتاح ترخيص مفعّل (غير متاحة في التجربة المجانية).' })); return; }
    if (busy.current) return;
    busy.current = true;
    setStatus(s => ({ ...s, state: 'syncing', error: undefined }));
    try {
      let published: number | undefined;
      let uploaded: number | undefined;
      let lastPublishAt: string | undefined;
      if (opts.publish || !lidMapRef.current) {
        const r = await publishParentViews(await buildEntries(), license, cfg.url);
        lidMapRef.current = r.lidMap;
        published = r.total;
        uploaded = r.uploaded;
        lastPublishAt = new Date().toISOString();
      }
      const inbox = await pullParentInbox(lidMapRef.current!, license, cfg.url);
      const appliedMessages = inbox.messages.length ? applyMessages(inbox.messages) : 0;
      await inbox.ack();
      setStatus(s => ({ ...s, state: 'ok', published: published ?? s.published, uploaded: uploaded ?? s.uploaded, lastPublishAt: lastPublishAt ?? s.lastPublishAt, lastPullAt: new Date().toISOString(), appliedMessages: (s.appliedMessages || 0) + appliedMessages, error: undefined }));
      // رسائل طُبّقت للتو: يُعاد الرفع فوراً ليرى ولي الأمر وصولها (بعد أن تستقر الحالة)
      if (appliedMessages > 0) setTimeout(() => { void syncNowRef.current({ publish: true }); }, 1500);
    } catch (e) {
      setStatus(s => ({ ...s, state: 'error', error: e instanceof Error ? e.message : 'خطأ غير معروف' }));
    } finally {
      busy.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyMessages, buildEntries]);
  syncNowRef.current = syncNow;

  // رفع بعد كل تغيير في البيانات التي يراها أولياء الأمور (مع تهدئة)
  useEffect(() => {
    if (!getParentSyncConfig().enabled) return;
    const t = setTimeout(() => { void syncNow({ publish: true }); }, PUBLISH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [d.students, d.teachers, d.notifications, d.conversations, d.parentSummons, d.schoolProfile, syncNow]);

  // دوري: رفع (يلتقط تغييرات الكنترول المخزنة خارج الحالة) وسحب الرسائل
  useEffect(() => {
    const pub = setInterval(() => { if (getParentSyncConfig().enabled) void syncNow({ publish: true }); }, PUBLISH_INTERVAL_MS);
    const pull = setInterval(() => { if (getParentSyncConfig().enabled) void syncNow({ publish: false }); }, PULL_INTERVAL_MS);
    return () => { clearInterval(pub); clearInterval(pull); };
  }, [syncNow]);

  return { parentSyncStatus: status, syncParentAppNow: () => syncNow({ publish: true }) };
}
