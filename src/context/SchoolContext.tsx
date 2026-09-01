import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Student,
  SchoolClass,
  NotificationItem,
  DailyReportData,
  AttendanceStatus,
  BehaviorPoint,
  TeacherConversation,
  DaySchedule,
  SubjectGrade
} from '../types';
import { db, SEED_STUDENTS, SEED_CLASSES, SEED_NOTIFICATIONS, SEED_DAILY_REPORT, SEED_CONVERSATIONS, SEED_SCHEDULE } from '../services/db';
import { sound } from '../utils/soundEffects';
import { triggerConfetti } from '../utils/confetti';

interface SchoolContextType {
  // Auth & Roles
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  currentUserPhone: string;
  login: (phone: string, role: UserRole) => void;
  logout: () => void;

  // Active Screen
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Dark Mode Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Search Palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Sound Engine
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Live Data & Sync
  students: Student[];
  selectedStudent: Student;
  setSelectedStudent: (student: Student) => void;
  classes: SchoolClass[];
  notifications: NotificationItem[];
  unreadCount: number;
  dailyReport: DailyReportData;
  conversations: TeacherConversation[];
  schedule: DaySchedule[];
  isOnlineSynced: boolean;

  // Database Actions
  updateAttendance: (studentId: string, status: AttendanceStatus, note?: string) => void;
  markAllPresent: (classId?: string) => void;
  linkStudent: (studentCodeOrId: string) => boolean;
  addBehaviorPoint: (studentId: string, point: BehaviorPoint) => void;
  updateStudentAvatar: (studentId: string, avatarUrl: string) => void;
  updateStudentGrade: (studentId: string, gradeId: string, updatedFields: Partial<SubjectGrade>) => void;
  submitAssignment: (studentId: string, assignmentId: string, score: number, feedback?: string) => void;
  sendChatMessage: (conversationId: string, text?: string, isVoice?: boolean, voiceDuration?: string, imageUrl?: string) => void;
  addNotification: (title: string, message: string, category: NotificationItem['category'], studentName?: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetDatabase: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('parent');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentUserPhone, setCurrentUserPhone] = useState('0551234567');
  const [activeTab, setActiveTab] = useState<string>('student-profile');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [isOnlineSynced, setIsOnlineSynced] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('madrasa_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Persistent State Loaded safely from DB
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const data = db.getStudents();
      return (data && data.length > 0) ? data : SEED_STUDENTS;
    } catch {
      return SEED_STUDENTS;
    }
  });

  const [selectedStudent, setSelectedStudent] = useState<Student>(() => {
    try {
      const all = db.getStudents();
      return (all && all.length > 0) ? all[0] : SEED_STUDENTS[0];
    } catch {
      return SEED_STUDENTS[0];
    }
  });

  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    try {
      const data = db.getClasses();
      return (data && data.length > 0) ? data : SEED_CLASSES;
    } catch {
      return SEED_CLASSES;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const data = db.getNotifications();
      return (data && data.length > 0) ? data : SEED_NOTIFICATIONS;
    } catch {
      return SEED_NOTIFICATIONS;
    }
  });

  const [dailyReport, setDailyReport] = useState<DailyReportData>(() => {
    try {
      const data = db.getDailyReport();
      return (data && data.timeline) ? data : SEED_DAILY_REPORT;
    } catch {
      return SEED_DAILY_REPORT;
    }
  });

  const [conversations, setConversations] = useState<TeacherConversation[]>(() => {
    try {
      const data = db.getConversations();
      return (data && data.length > 0) ? data : SEED_CONVERSATIONS;
    } catch {
      return SEED_CONVERSATIONS;
    }
  });

  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    try {
      const data = db.getSchedule();
      return (data && data.length > 0) ? data : SEED_SCHEDULE;
    } catch {
      return SEED_SCHEDULE;
    }
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('madrasa_dark_mode', next.toString());
      } catch {}
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
    sound.playTap();
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const setSoundEnabled = (enabled: boolean) => {
    sound.enabled = enabled;
    setSoundEnabledState(enabled);
  };

  // Cross-Tab & Multi-Window Instant Synchronization (BroadcastChannel + Storage Event)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSyncPayload = (data: any) => {
      if (data?.fullState) {
        const { students: s, classes: c, notifications: n, dailyReport: r, conversations: conv, schedule: sch } = data.fullState;
        if (s && s.length > 0) {
          setStudents(s);
          db.saveStudents(s, false);
          setSelectedStudent(prev => s.find((st: Student) => st.id === prev.id) || s[0]);
        }
        if (c && c.length > 0) {
          setClasses(c);
          db.saveClasses(c, false);
        }
        if (n) {
          setNotifications(n);
          db.saveNotifications(n, false);
        }
        if (r) {
          setDailyReport(r);
          db.saveDailyReport(r, false);
        }
        if (conv) {
          setConversations(conv);
          db.saveConversations(conv, false);
        }
        if (sch) {
          setSchedule(sch);
          db.saveSchedule(sch, false);
        }

        if (data.type === 'ATTENDANCE_UPDATE') sound.playSuccess();
        else if (data.type === 'AWARD_POINT' || data.type === 'SUBMIT_ASSIGNMENT') {
          sound.playFanfare();
          triggerConfetti();
        } else if (data.type === 'NEW_CHAT_MESSAGE') {
          sound.playTap();
        }
      }
    };

    // 1. BroadcastChannel
    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('madrasa_school_sync_v3');
        channel.onmessage = (event) => {
          try {
            handleSyncPayload(event.data);
          } catch {}
        };
      } catch {}
    }

    // 2. Storage event listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'madrasa_last_sync_timestamp' || e.key === 'madrasa_db_students_v3') {
        const latestStudents = db.getStudents();
        setStudents(latestStudents);
        setSelectedStudent(prev => latestStudents.find(st => st.id === prev.id) || latestStudents[0]);
        setClasses(db.getClasses());
        setNotifications(db.getNotifications());
        setDailyReport(db.getDailyReport());
        setConversations(db.getConversations());
        setSchedule(db.getSchedule());
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      channel?.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Keyboard shortcut Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const login = (phone: string, role: UserRole) => {
    setCurrentUserPhone(phone);
    setCurrentRole(role);
    setIsAuthenticated(true);
    sound.playSuccess();
    if (role === 'parent') {
      setActiveTab('student-profile');
    } else if (role === 'teacher') {
      setActiveTab('attendance');
    } else {
      setActiveTab('dashboard');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveTab('login');
    sound.playTap();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const updateAttendance = (studentId: string, status: AttendanceStatus, note?: string) => {
    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        const today = new Date().toISOString().split('T')[0];
        const prevRecords = s.recentAttendance.filter(r => r.date !== today);
        return {
          ...s,
          status,
          recentAttendance: [{ date: today, status, note }, ...prevRecords]
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    db.saveStudents(updatedStudents, true);

    const updatedSelected = updatedStudents.find(s => s.id === selectedStudent.id);
    if (updatedSelected) {
      setSelectedStudent(updatedSelected);
    }

    if (status === 'present') sound.playTap();
    else if (status === 'unexcused') sound.playAlert();
    else sound.playTap();
  };

  const markAllPresent = () => {
    const today = new Date().toISOString().split('T')[0];
    const updatedStudents = students.map(s => ({
      ...s,
      status: 'present' as AttendanceStatus,
      recentAttendance: [{ date: today, status: 'present' as AttendanceStatus }, ...s.recentAttendance.filter(r => r.date !== today)]
    }));

    setStudents(updatedStudents);
    db.saveStudents(updatedStudents, true);
    sound.playSuccess();

    addNotification(
      'تحضير جماعي للفصل',
      'تم تسجيل حضور جميع طلاب الصف الخامس (شعبة أ) كحاضرين بنجاح.',
      'attendance'
    );
  };

  const linkStudent = (codeOrId: string): boolean => {
    const found = students.find(
      s => s.linkCode.toLowerCase() === codeOrId.trim().toLowerCase() ||
           s.studentNumber === codeOrId.trim() ||
           s.nationalId === codeOrId.trim()
    );

    if (found) {
      setSelectedStudent(found);
      sound.playSuccess();
      return true;
    }
    sound.playAlert();
    return false;
  };

  const addBehaviorPoint = (studentId: string, point: BehaviorPoint) => {
    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          behaviorPointsTotal: Math.max(0, s.behaviorPointsTotal + point.points),
          behaviorPoints: [point, ...s.behaviorPoints]
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    db.saveStudents(updatedStudents, true);

    const updatedSelected = updatedStudents.find(s => s.id === selectedStudent.id);
    if (updatedSelected) {
      setSelectedStudent(updatedSelected);
    }

    addNotification(
      `نقطة تقييم جديدة (${point.points > 0 ? '+' + point.points : point.points})`,
      `تم منح الطالب (${point.title}) بواسطة ${point.teacher}.`,
      'academic',
      selectedStudent.name
    );
  };

  const updateStudentAvatar = (studentId: string, avatarUrl: string) => {
    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        return { ...s, avatar: avatarUrl };
      }
      return s;
    });
    setStudents(updatedStudents);
    db.saveStudents(updatedStudents, true);

    if (selectedStudent.id === studentId) {
      setSelectedStudent({ ...selectedStudent, avatar: avatarUrl });
    }
  };

  const updateStudentGrade = (studentId: string, gradeId: string, updatedFields: Partial<SubjectGrade>) => {
    const updatedStudents = students.map(s => {
      if (s.id === studentId && s.grades) {
        const updatedGrades = s.grades.map(g => {
          if (g.id === gradeId) {
            const merged = { ...g, ...updatedFields };
            const total = merged.period1 + merged.period2 + merged.quizzes + merged.homework + merged.participation + merged.finalExam;
            let letter: SubjectGrade['letter'] = 'A+';
            if (total >= 95) letter = 'A+';
            else if (total >= 90) letter = 'A';
            else if (total >= 85) letter = 'B+';
            else if (total >= 80) letter = 'B';
            else if (total >= 75) letter = 'C+';
            else if (total >= 70) letter = 'C';
            else if (total >= 60) letter = 'D';
            else letter = 'F';

            return { ...merged, total, letter };
          }
          return g;
        });

        // Recalculate student overall GPA average
        const totalAvg = updatedGrades.reduce((acc, curr) => acc + curr.total, 0) / updatedGrades.length;

        return {
          ...s,
          grades: updatedGrades,
          academicAverage: Number(totalAvg.toFixed(1))
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    db.saveStudents(updatedStudents, true);

    const updatedSelected = updatedStudents.find(s => s.id === selectedStudent.id);
    if (updatedSelected) setSelectedStudent(updatedSelected);

    sound.playSuccess();
    addNotification('تحديث درجات الطالب', 'تم تحديث درجات الطالب ورصدها في السجل الأكاديمي بنجاح.', 'academic', selectedStudent.name);
  };

  const submitAssignment = (studentId: string, assignmentId: string, score: number, feedback?: string) => {
    const updatedStudents = students.map(s => {
      if (s.id === studentId && s.assignments) {
        const updatedAsg = s.assignments.map(a => {
          if (a.id === assignmentId) {
            return {
              ...a,
              status: 'submitted' as const,
              studentScore: score,
              teacherFeedback: feedback || 'تم تصحيح الواجب بنجاح.'
            };
          }
          return a;
        });

        // Award +5 behavior reward points for completing assignment
        const rewardPoint: BehaviorPoint = {
          id: `bp-asg-${Date.now()}`,
          category: 'positive',
          title: 'حل وتسليم الواجب الإلكتروني بنجاح',
          points: 5,
          icon: '📝',
          date: 'اليوم',
          teacher: 'النظام الأكاديمي'
        };

        return {
          ...s,
          assignments: updatedAsg,
          behaviorPointsTotal: s.behaviorPointsTotal + 5,
          behaviorPoints: [rewardPoint, ...s.behaviorPoints]
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    db.saveStudents(updatedStudents, true);

    const updatedSelected = updatedStudents.find(s => s.id === selectedStudent.id);
    if (updatedSelected) setSelectedStudent(updatedSelected);

    sound.playFanfare();
    triggerConfetti();

    addNotification('تسليم واجب إلكتروني 📝', `حصل الطالب على درجة (${score}/10) وتمت إضافة +5 نقاط تميز لسجله.`, 'academic', selectedStudent.name);
  };

  const sendChatMessage = (conversationId: string, text?: string, isVoice?: boolean, voiceDuration?: string, imageUrl?: string) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderRole: currentRole === 'parent' ? ('parent' as const) : ('teacher' as const),
      senderName: currentRole === 'parent' ? 'ولي الأمر' : 'المعلم',
      text,
      isVoice,
      voiceDuration,
      imageUrl,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      read: true
    };

    const updatedConv = conversations.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: text || (isVoice ? '🎤 رسالة صوتية' : '📷 صورة مرفقة'),
          lastMessageTime: 'الآن',
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    setConversations(updatedConv);
    db.saveConversations(updatedConv, true);
    sound.playTap();

    // If parent sent a message, simulate smart AI teacher auto-acknowledgement after 2.5s
    if (currentRole === 'parent') {
      setTimeout(() => {
        const teacherReplies = [
          'أهلاً بك يا أبا ريان، وصلت ملاحظتك وسيتم متابعة الطالب باهتمام مستمر 🌟',
          'شكراً لحرصك ومتابعتك الدائمة، ريان نموذج يحتذى به في الفصل 👏',
          'تم الاطلاع وسأوافيك بتقرير مفصل بعد الحصة القادمة بإذن الله.'
        ];
        const randomReply = teacherReplies[Math.floor(Math.random() * teacherReplies.length)];

        const teacherMsg = {
          id: `msg-rep-${Date.now()}`,
          senderRole: 'teacher' as const,
          senderName: 'المعلم',
          text: randomReply,
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          read: false
        };

        setConversations(prev => {
          const autoUpdated = prev.map(c => {
            if (c.id === conversationId) {
              return {
                ...c,
                lastMessage: randomReply,
                lastMessageTime: 'الآن',
                unreadCount: c.unreadCount + 1,
                messages: [...c.messages, teacherMsg]
              };
            }
            return c;
          });
          db.saveConversations(autoUpdated, true);
          return autoUpdated;
        });

        sound.playSuccess();
        addNotification('رسالة جديدة من المعلم 💬', randomReply, 'admin', selectedStudent.name);
      }, 2000);
    }
  };

  const addNotification = (
    title: string,
    message: string,
    category: NotificationItem['category'],
    studentName?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      category,
      date: 'الآن',
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      studentName
    };

    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    db.saveNotifications(updated, true);
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    db.saveNotifications(updated, true);
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    db.saveNotifications(updated, true);
    sound.playTap();
  };

  const resetDatabase = () => {
    db.resetAllData();
    setStudents(SEED_STUDENTS);
    setSelectedStudent(SEED_STUDENTS[0]);
    setClasses(SEED_CLASSES);
    setNotifications(SEED_NOTIFICATIONS);
    setDailyReport(SEED_DAILY_REPORT);
    setConversations(SEED_CONVERSATIONS);
    setSchedule(SEED_SCHEDULE);
    sound.playSuccess();
  };

  return (
    <SchoolContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        isAuthenticated,
        currentUserPhone,
        login,
        logout,
        activeTab,
        setActiveTab,
        isDarkMode,
        toggleDarkMode,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        soundEnabled,
        setSoundEnabled,
        students,
        selectedStudent,
        setSelectedStudent,
        classes,
        notifications,
        unreadCount,
        dailyReport,
        conversations,
        schedule,
        isOnlineSynced,
        updateAttendance,
        markAllPresent,
        linkStudent,
        addBehaviorPoint,
        updateStudentAvatar,
        updateStudentGrade,
        submitAssignment,
        sendChatMessage,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetDatabase,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = (): SchoolContextType => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
