import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  SubjectGrade,
  TeacherAccount,
  SocialCaseStudy,
  CounselingSession,
  ParentSummon,
  StudentInfraction,
  AutoSummonCard,
  StudentFollowUpForm,
  SchoolProfile
} from '../types';
import {
  db,
  SEED_STUDENTS,
  SEED_CLASSES,
  SEED_NOTIFICATIONS,
  SEED_DAILY_REPORT,
  SEED_CONVERSATIONS,
  SEED_SCHEDULE,
  SEED_TEACHERS,
  SEED_CASE_STUDIES,
  SEED_COUNSELING_SESSIONS,
  SEED_PARENT_SUMMONS,
  SEED_FOLLOWUP_FORMS,
  getSchoolProfile,
  saveSchoolProfile,
  DEFAULT_SCHOOL_PROFILE,
  STORAGE_KEY_SAVED_SCHOOLS
} from '../services/db';
import { WarningTriggerEngine, SEED_INFRACTIONS, SEED_AUTO_SUMMON_CARDS } from '../services/counselor/warningTriggerEngine';
import { sound } from '../utils/soundEffects';
import { triggerConfetti } from '../utils/confetti';
import { ToastContainer, ToastMessage, ToastType } from '../components/ui/Toast';
import { auditLogger } from '../services/audit/auditLogger';
import { SecurityEngine } from '../services/security/securityEngine';
import { studentRepository } from '../services/repositories';

interface SchoolContextType {
  // Auth & Roles
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  currentUserPhone: string;
  currentTeacher: TeacherAccount | null;
  teachers: TeacherAccount[];
  login: (phoneOrId: string, role: UserRole) => void;
  loginWithTeacherCode: (code: string) => boolean;
  logout: () => void;

  // Operational Plan PDF Modal
  showOperationalPlanModal: boolean;
  setShowOperationalPlanModal: (show: boolean) => void;

  // Account Settings Modal
  showAccountSettingsModal: boolean;
  setShowAccountSettingsModal: (show: boolean) => void;
  setCurrentUserPhone: (phone: string) => void;
  setTeachers: (teachers: TeacherAccount[]) => void;
  setStudents: (students: Student[]) => void;
  setSchedule: (schedule: DaySchedule[]) => void;

  // Social Counselor & Case Studies
  caseStudies: SocialCaseStudy[];
  setCaseStudies: React.Dispatch<React.SetStateAction<SocialCaseStudy[]>>;
  counselingSessions: CounselingSession[];
  setCounselingSessions: React.Dispatch<React.SetStateAction<CounselingSession[]>>;
  parentSummons: ParentSummon[];
  setParentSummons: React.Dispatch<React.SetStateAction<ParentSummon[]>>;

  // Student Follow-Up Forms & Evaluation
  followUpForms: StudentFollowUpForm[];
  setFollowUpForms: React.Dispatch<React.SetStateAction<StudentFollowUpForm[]>>;
  saveFollowUpForm: (form: StudentFollowUpForm) => void;

  // Automated Summon Cards & Infractions Engine
  infractions: StudentInfraction[];
  setInfractions: React.Dispatch<React.SetStateAction<StudentInfraction[]>>;
  autoSummonCards: AutoSummonCard[];
  setAutoSummonCards: React.Dispatch<React.SetStateAction<AutoSummonCard[]>>;
  recordInfractionAndCheck: (
    studentId: string,
    infractionData: Omit<StudentInfraction, 'id' | 'studentId' | 'studentName'>
  ) => void;

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

  // Toast System
  showToast: (type: ToastType, title: string, message: string, duration?: number) => void;

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

  // School Profile & Multi-School Isolation
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => void;
  createNewSchool: (name: string, district: string, directorName: string, directorPhone: string, startFresh: boolean) => void;
  switchSchool: (schoolId: string) => void;
  savedSchools: SchoolProfile[];
  exportSchoolPackage: () => void;
  importSchoolPackage: (jsonContent: string) => boolean;
  showSchoolManagerModal: boolean;
  setShowSchoolManagerModal: (open: boolean) => void;

  // Accessibility & Easy Mode for Elderly Teachers
  isLargeFontMode: boolean;
  toggleLargeFontMode: () => void;

  // Global Modals & Customization
  showPdfImporterModal: boolean;
  setShowPdfImporterModal: (open: boolean) => void;
  showCustomCodeModal: boolean;
  setShowCustomCodeModal: (open: boolean) => void;
  updateTeacherCode: (teacherId: string, newCode: string) => boolean;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('madrasa_active_role');
      if (saved && ['admin', 'teacher', 'parent', 'counselor'].includes(saved)) {
        return saved as UserRole;
      }
    } catch {}
    return 'admin';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentUserPhone, setCurrentUserPhoneState] = useState(() => {
    try {
      return localStorage.getItem('madrasa_admin_phone') || '0922465676';
    } catch {
      return '0922465676';
    }
  });
  const [currentTeacher, setCurrentTeacher] = useState<TeacherAccount | null>(null);
  const [showOperationalPlanModal, setShowOperationalPlanModal] = useState(false);
  const [showAccountSettingsModal, setShowAccountSettingsModal] = useState(false);
  const [showSchoolManagerModal, setShowSchoolManagerModal] = useState(false);
  const [showPdfImporterModal, setShowPdfImporterModal] = useState(false);
  const [showCustomCodeModal, setShowCustomCodeModal] = useState(false);
  const [isLargeFontMode, setIsLargeFontMode] = useState(() => {
    try {
      return localStorage.getItem('madrasa_large_font_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleLargeFontMode = () => {
    setIsLargeFontMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('madrasa_large_font_mode', String(next));
      } catch {}
      return next;
    });
  };

  const [schoolProfile, setSchoolProfileState] = useState<SchoolProfile>(() => {
    return getSchoolProfile();
  });

  const [savedSchools, setSavedSchoolsState] = useState<SchoolProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED_SCHOOLS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [getSchoolProfile()];
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('madrasa_active_tab');
      if (saved) return saved;
    } catch {}
    return 'dashboard';
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [isOnlineSynced, setIsOnlineSynced] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('madrasa_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Persistent Teachers
  const [teachers, setTeachers] = useState<TeacherAccount[]>(() => {
    try {
      const data = db.getTeachers();
      return (data && data.length > 0) ? data : SEED_TEACHERS;
    } catch {
      return SEED_TEACHERS;
    }
  });

  // Persistent Students
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

  // Social Counselor State
  const [caseStudies, setCaseStudiesState] = useState<SocialCaseStudy[]>(() => {
    try {
      const data = db.getCaseStudies();
      return (data && data.length > 0) ? data : SEED_CASE_STUDIES;
    } catch {
      return SEED_CASE_STUDIES;
    }
  });

  const [counselingSessions, setCounselingSessionsState] = useState<CounselingSession[]>(() => {
    try {
      const data = db.getCounselingSessions();
      return (data && data.length > 0) ? data : SEED_COUNSELING_SESSIONS;
    } catch {
      return SEED_COUNSELING_SESSIONS;
    }
  });

  const [parentSummons, setParentSummonsState] = useState<ParentSummon[]>(() => {
    try {
      const data = db.getParentSummons();
      return (data && data.length > 0) ? data : SEED_PARENT_SUMMONS;
    } catch {
      return SEED_PARENT_SUMMONS;
    }
  });

  // Automated Infractions and Summon Cards State
  const [infractions, setInfractionsState] = useState<StudentInfraction[]>(() => {
    try {
      const data = db.getInfractions();
      return (data && data.length > 0) ? data : SEED_INFRACTIONS;
    } catch {
      return SEED_INFRACTIONS;
    }
  });

  const [autoSummonCards, setAutoSummonCardsState] = useState<AutoSummonCard[]>(() => {
    try {
      const data = db.getAutoSummonCards();
      return (data && data.length > 0) ? data : SEED_AUTO_SUMMON_CARDS;
    } catch {
      return SEED_AUTO_SUMMON_CARDS;
    }
  });

  const [followUpForms, setFollowUpFormsState] = useState<StudentFollowUpForm[]>(() => {
    try {
      const data = db.getFollowUpForms();
      return (data && data.length > 0) ? data : SEED_FOLLOWUP_FORMS;
    } catch {
      return SEED_FOLLOWUP_FORMS;
    }
  });

  const setCaseStudies: React.Dispatch<React.SetStateAction<SocialCaseStudy[]>> = (casesOrUpdater) => {
    setCaseStudiesState(prev => {
      const next = typeof casesOrUpdater === 'function' ? casesOrUpdater(prev) : casesOrUpdater;
      db.saveCaseStudies(next);
      return next;
    });
  };

  const setCounselingSessions: React.Dispatch<React.SetStateAction<CounselingSession[]>> = (sessionsOrUpdater) => {
    setCounselingSessionsState(prev => {
      const next = typeof sessionsOrUpdater === 'function' ? sessionsOrUpdater(prev) : sessionsOrUpdater;
      db.saveCounselingSessions(next);
      return next;
    });
  };

  const setParentSummons: React.Dispatch<React.SetStateAction<ParentSummon[]>> = (summonsOrUpdater) => {
    setParentSummonsState(prev => {
      const next = typeof summonsOrUpdater === 'function' ? summonsOrUpdater(prev) : summonsOrUpdater;
      db.saveParentSummons(next);
      return next;
    });
  };

  const setFollowUpForms: React.Dispatch<React.SetStateAction<StudentFollowUpForm[]>> = (formsOrUpdater) => {
    setFollowUpFormsState(prev => {
      const next = typeof formsOrUpdater === 'function' ? formsOrUpdater(prev) : formsOrUpdater;
      db.saveFollowUpForms(next);
      return next;
    });
  };

  const saveFollowUpForm = (form: StudentFollowUpForm) => {
    setFollowUpFormsState(prev => {
      const existingIndex = prev.findIndex(f => f.id === form.id);
      let updated: StudentFollowUpForm[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = form;
      } else {
        updated = [form, ...prev];
      }
      db.saveFollowUpForms(updated);
      return updated;
    });
  };

  const setInfractions: React.Dispatch<React.SetStateAction<StudentInfraction[]>> = (infractionsOrUpdater) => {
    setInfractionsState(prev => {
      const next = typeof infractionsOrUpdater === 'function' ? infractionsOrUpdater(prev) : infractionsOrUpdater;
      db.saveInfractions(next);
      return next;
    });
  };

  const setAutoSummonCards: React.Dispatch<React.SetStateAction<AutoSummonCard[]>> = (cardsOrUpdater) => {
    setAutoSummonCardsState(prev => {
      const next = typeof cardsOrUpdater === 'function' ? cardsOrUpdater(prev) : cardsOrUpdater;
      db.saveAutoSummonCards(next);
      return next;
    });
  };

  const showToast = useCallback((type: ToastType, title: string, message: string, duration: number = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, type, title, message, duration };
    
    setToasts(prev => [...prev.slice(-3), newToast]); // Max 4 toasts

    if (type === 'success' || type === 'gold') sound.playSuccess();
    else if (type === 'error' || type === 'warning') sound.playAlert();
    else sound.playTap();

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const recordInfractionAndCheck = useCallback((
    studentId: string,
    infractionData: Omit<StudentInfraction, 'id' | 'studentId' | 'studentName'>
  ) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newInfraction: StudentInfraction = {
      id: `inf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: student.id,
      studentName: student.name,
      ...infractionData
    };

    setInfractionsState(prevInfractions => {
      const updatedInfractions = [newInfraction, ...prevInfractions];
      db.saveInfractions(updatedInfractions);

      setAutoSummonCardsState(prevCards => {
        const { triggeredCard, isNewCard, reason } = WarningTriggerEngine.evaluateAndTriggerSummon(
          student,
          newInfraction,
          prevInfractions,
          prevCards
        );

        if (isNewCard && triggeredCard) {
          const updatedCards = [triggeredCard, ...prevCards];
          db.saveAutoSummonCards(updatedCards);

          sound.playAlert();
          showToast('error', '⚠️ صدور بطاقة استدعاء تلقائية!', `بلغ الطالب ${student.name} ${reason}`);

          const newNotif: NotificationItem = {
            id: `notif-trigger-${Date.now()}`,
            title: `⚠️ استدعاء آلي عاجل: ${student.name}`,
            message: `بلغ الطالب الحد التراكمي للإنذارات (${reason}). تم إصدار بطاقة استدعاء وتوجيهها لمكتب الخدمة الاجتماعية.`,
            category: 'academic',
            date: 'الآن',
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            read: false,
            studentName: student.name
          };

          setNotifications(prevNotifs => {
            const up = [newNotif, ...prevNotifs];
            db.saveNotifications(up);
            return up;
          });

          auditLogger.log({
            actorName: 'نظام الاستدعاء التلقائي (Warning Trigger)',
            actorRole: 'admin',
            action: 'AUTO_SUMMON_TRIGGERED',
            entity: 'Student',
            details: `إصدار بطاقة استدعاء للطالب ${student.name} بسبب: ${reason}`,
            severity: 'CRITICAL'
          });

          return updatedCards;
        }

        return prevCards;
      });

      return updatedInfractions;
    });
  }, [students, showToast]);

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

  // Load from Repository layer on mount
  useEffect(() => {
    studentRepository.getAll().then(dbStudents => {
      if (dbStudents && dbStudents.length > 0) {
        setStudents(dbStudents);
      }
    });
  }, []);

  // Listen for BroadcastChannel Realtime Cross-tab Sync
  useEffect(() => {
    const unsubscribe = db.onSync((event: any) => {
      setIsOnlineSynced(true);
      if (event.students) {
        setStudents(event.students);
        setSelectedStudent(prev => event.students.find((s: Student) => s.id === prev.id) || event.students[0]);
      }
      if (event.notifications) setNotifications(event.notifications);
      if (event.dailyReport) setDailyReport(event.dailyReport);
      if (event.classes) setClasses(event.classes);
      if (event.conversations) setConversations(event.conversations);
      if (event.schedule) setSchedule(event.schedule);
    });

    return () => unsubscribe();
  }, []);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    sound.enabled = enabled;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const login = (phoneOrId: string, role: UserRole) => {
    setCurrentUserPhoneState(phoneOrId);
    setCurrentRole(role);
    setIsAuthenticated(true);
    if (role === 'parent') {
      setCurrentTeacher(null);
      setActiveTab('parent-dashboard');
    } else if (role === 'teacher') {
      const t = teachers.find(tch => tch.phone === phoneOrId) || teachers[0];
      setCurrentTeacher(t);
      setActiveTab('teacher-quick');
    } else if (role === 'counselor') {
      const t = teachers.find(tch => tch.code === 'LIB-SOC-01') || teachers[0];
      setCurrentTeacher(t);
      setActiveTab('counselor-dashboard');
    } else {
      setCurrentTeacher(null);
      setActiveTab('dashboard');
    }
    sound.playSuccess();
    showToast('success', 'تسجيل الدخول', `مرحباً بك! تم الدخول بصفتك ${role === 'parent' ? 'ولي أمر' : role === 'teacher' ? 'معلم' : role === 'counselor' ? 'أخصائي اجتماعي' : 'إدارة المدرسة'}`);
    auditLogger.log({
      actorName: phoneOrId,
      actorRole: role,
      action: 'USER_LOGIN',
      entity: 'Auth',
      details: `تسجيل دخول ناجح برقم/هوية ${phoneOrId}`,
      severity: 'INFO'
    });
  };

  const loginWithTeacherCode = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    const foundTeacher = teachers.find(t => t.code.trim().toUpperCase() === cleanCode);
    if (foundTeacher) {
      setCurrentTeacher(foundTeacher);
      setCurrentUserPhoneState(foundTeacher.phone);
      if (foundTeacher.code === 'LIB-SOC-01' || foundTeacher.subjectCode === 'COUNSEL') {
        setCurrentRole('counselor');
        setActiveTab('counselor-dashboard');
      } else {
        setCurrentRole('teacher');
        setActiveTab('teacher-quick');
      }
      setIsAuthenticated(true);
      sound.playSuccess();
      showToast('gold', `مرحباً ${foundTeacher.name}`, `تم الدخول بنجاح بصفتك ${foundTeacher.subject} (الرمز: ${foundTeacher.code})`);
      auditLogger.log({
        actorName: foundTeacher.name,
        actorRole: foundTeacher.code === 'LIB-SOC-01' ? 'counselor' : 'teacher',
        action: 'TEACHER_CODE_LOGIN',
        entity: 'Auth',
        details: `تسجيل دخول برمز المعلم الفريد: ${foundTeacher.code}`,
        severity: 'INFO'
      });
      return true;
    }
    sound.playAlert();
    showToast('error', 'رمز الدخول غير صحيح', 'تأكد من الرمز الصادر من الإدارة (مثال: LIB-MATH-01 أو LIB-SOC-01)');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentTeacher(null);
    setActiveTab('login');
    sound.playTap();
    showToast('info', 'تسجيل الخروج', 'تم تسجيل الخروج بنجاح.');
  };

  const updateAttendance = (studentId: string, status: AttendanceStatus, note?: string) => {
    SecurityEngine.assertPermission(currentRole, 'TAKE_ATTENDANCE');
    const updated = students.map(s => {
      if (s.id === studentId) {
        const totalDays = 20;
        let newPresent = 19;
        if (status === 'unexcused') newPresent = 17;
        else if (status === 'late') newPresent = 18;
        const newRate = Math.round((newPresent / totalDays) * 100);

        return {
          ...s,
          status,
          attendanceNote: note ? SecurityEngine.sanitizeString(note) : undefined,
          attendanceRate: newRate,
          lastAttendanceUpdate: 'اليوم'
        };
      }
      return s;
    });

    setStudents(updated);
    db.saveStudents(updated, true);
    studentRepository.saveAll(updated);

    const targetStudent = students.find(s => s.id === studentId);
    if (targetStudent) {
      addNotification(
        `تحديث الحضور: ${targetStudent.name}`,
        `تم تسجيل حالة الحضور: ${status === 'present' ? 'حاضر' : status === 'late' ? 'متأخر' : status === 'excused' ? 'غائب بعذر' : 'غائب بدون عذر'}`,
        'attendance',
        targetStudent.name
      );

      // Trigger automatic infraction check on unexcused absence or lateness
      if (status === 'unexcused') {
        recordInfractionAndCheck(studentId, {
          type: 'absence',
          typeLabel: 'غياب بدون عذر',
          title: note ? `غياب بدون عذر: ${note}` : 'غياب غير مبرر عن اليوم الدراسي',
          date: new Date().toISOString().split('T')[0],
          time: '08:00 ص',
          reportedBy: currentTeacher ? currentTeacher.name : 'إدارة الحضور',
          severity: 'alert',
          notes: note
        });
      } else if (status === 'late') {
        recordInfractionAndCheck(studentId, {
          type: 'lateness',
          typeLabel: 'تأخر صباحي',
          title: note ? `تأخر صباحي: ${note}` : 'تأخر عن طابور الصباح والحصة الأولى',
          date: new Date().toISOString().split('T')[0],
          time: '08:20 ص',
          reportedBy: currentTeacher ? currentTeacher.name : 'مشرف الطابور',
          severity: 'warning',
          notes: note
        });
      }
    }

    auditLogger.log({
      actorName: currentTeacher ? currentTeacher.name : currentRole === 'teacher' ? 'المعلم' : 'الإدارة',
      actorRole: currentRole,
      action: 'UPDATE_ATTENDANCE',
      entity: 'Student',
      details: `تسجيل حضور الطالب ${targetStudent?.name || studentId}: ${status}`,
      severity: 'INFO'
    });

    sound.playTap();
    showToast('success', 'رصد الحضور', `تم تسجيل حالة ${targetStudent?.name.split(' ')[0] || ''} بنجاح`);
  };

  const markAllPresent = (classId?: string) => {
    SecurityEngine.assertPermission(currentRole, 'TAKE_ATTENDANCE');
    const updated = students.map(s => {
      if (!classId || s.className.includes(classId)) {
        return {
          ...s,
          status: 'present' as AttendanceStatus,
          attendanceRate: 100,
          lastAttendanceUpdate: 'اليوم'
        };
      }
      return s;
    });

    setStudents(updated);
    db.saveStudents(updated, true);
    studentRepository.saveAll(updated);

    addNotification(
      'تحضير جماعي للفصل',
      'تم تسجيل جميع طلاب الفصل حاضرين لهذا اليوم بنجاح.',
      'attendance'
    );

    auditLogger.log({
      actorName: currentTeacher ? currentTeacher.name : currentRole,
      actorRole: currentRole,
      action: 'BATCH_ATTENDANCE',
      entity: 'Class',
      details: 'تم رصد الحضور الكامل لجميع الطلاب دفعة واحدة',
      severity: 'INFO'
    });

    sound.playSuccess();
    triggerConfetti();
    showToast('gold', 'تحضير مكتمل', 'تم تسجيل حضور جميع الطلاب بنجاح 🌟');
  };

  const linkStudent = (studentCodeOrId: string): boolean => {
    const cleanCode = SecurityEngine.cleanText(studentCodeOrId);
    const found = students.find(
      s => s.linkCode.toLowerCase() === cleanCode.toLowerCase() || s.nationalId === cleanCode
    );

    if (found) {
      setSelectedStudent(found);
      addNotification(
        'تم ربط الطالب بنجاح',
        `تم ربط ملف الطالب ${found.name} بحساب ولي الأمر بنجاح.`,
        'admin',
        found.name
      );

      auditLogger.log({
        actorName: currentUserPhone,
        actorRole: currentRole,
        action: 'LINK_STUDENT',
        entity: 'Student',
        details: `ربط ملف الطالب ${found.name} (${found.linkCode})`,
        severity: 'INFO'
      });

      sound.playSuccess();
      triggerConfetti();
      showToast('gold', 'تم ربط الطالب!', `أهلاً بك، تم فتح ملف ${found.name} بنجاح.`);
      return true;
    }
    sound.playAlert();
    showToast('error', 'رمز غير صحيح', 'لم يتم العثور على طالب بهذا الرمز أو الهوية.');
    return false;
  };

  const addBehaviorPoint = (studentId: string, point: BehaviorPoint) => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        const currentPoints = s.behaviorPointsTotal || 0;
        const newPoints = currentPoints + point.points;
        return {
          ...s,
          behaviorPointsTotal: newPoints,
          behaviorPoints: [point, ...(s.behaviorPoints || [])]
        };
      }
      return s;
    });

    setStudents(updated);
    db.saveStudents(updated, true);
    studentRepository.saveAll(updated);

    const st = students.find(s => s.id === studentId);
    if (point.points > 0) {
      sound.playSuccess();
      triggerConfetti();
      showToast('gold', 'وسام تميز!', `تم منح ${st?.name.split(' ')[0]} +${point.points} نقطة سلوكية 🌟`);
    } else {
      sound.playAlert();
      showToast('warning', 'ملاحظة سلوكية', `تم تسجيل ملاحظة سلوكية للطالب`);

      // Trigger automatic infraction check on misconduct / negative point
      recordInfractionAndCheck(studentId, {
        type: 'misconduct',
        typeLabel: 'مخالفة سلوكية',
        title: point.title || 'ملاحظة سلوكية تحتاج إلى تحسين',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        reportedBy: point.teacher || currentTeacher?.name || 'معلم الحصة',
        severity: 'warning'
      });
    }
  };

  const updateStudentAvatar = (studentId: string, avatarUrl: string) => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        return { ...s, avatar: avatarUrl };
      }
      return s;
    });

    setStudents(updated);
    db.saveStudents(updated, true);
    studentRepository.saveAll(updated);
    if (selectedStudent.id === studentId) {
      setSelectedStudent({ ...selectedStudent, avatar: avatarUrl });
    }
    sound.playSuccess();
    showToast('success', 'تحديث الصورة', 'تم تحديث الصورة الشخصية بنجاح.');
  };

  const updateStudentGrade = (studentId: string, gradeId: string, updatedFields: Partial<SubjectGrade>) => {
    SecurityEngine.assertPermission(currentRole, 'EDIT_GRADES');
    const updated = students.map(s => {
      if (s.id === studentId && s.grades) {
        const updatedGrades = s.grades.map(g => {
          if (g.id === gradeId) {
            const merged = { ...g, ...updatedFields };
            const newTotal = (merged.period1 || 0) + (merged.period2 || 0) + (merged.quizzes || 0) +
                             (merged.homework || 0) + (merged.participation || 0) + (merged.finalExam || 0);

            let letter: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' = 'A+';
            if (newTotal >= 95) letter = 'A+';
            else if (newTotal >= 90) letter = 'A';
            else if (newTotal >= 85) letter = 'B+';
            else if (newTotal >= 80) letter = 'B';
            else if (newTotal >= 75) letter = 'C+';
            else if (newTotal >= 70) letter = 'C';
            else letter = 'D';

            return { ...merged, total: newTotal, letter };
          }
          return g;
        });

        const sumTotals = updatedGrades.reduce((acc, curr) => acc + curr.total, 0);
        const newAvg = Math.round((sumTotals / updatedGrades.length) * 10) / 10;

        return {
          ...s,
          grades: updatedGrades,
          academicAverage: newAvg
        };
      }
      return s;
    });

    setStudents(updated);
    db.saveStudents(updated, true);
    studentRepository.saveAll(updated);
    sound.playSuccess();
    showToast('success', 'رصد الدرجات', 'تم حفظ الدرجة وتحديث المعدل التراكمي فورياً 📊');

    auditLogger.log({
      actorName: currentTeacher ? currentTeacher.name : currentRole === 'teacher' ? 'المعلم' : 'الإدارة',
      actorRole: currentRole,
      action: 'UPDATE_GRADE',
      entity: 'SubjectGrade',
      details: `تعديل درجات الطالب في كشف العلامات`,
      severity: 'INFO'
    });
  };

  const submitAssignment = (studentId: string, assignmentId: string, score: number, feedback?: string) => {
    const updated = students.map(s => {
      if (s.id === studentId && s.assignments) {
        const updatedAssignments = s.assignments.map(a => {
          if (a.id === assignmentId) {
            return {
              ...a,
              status: 'submitted' as const,
              score,
              feedback: feedback || 'تم الحل والتسليم بنجاح.'
            };
          }
          return a;
        });

        return {
          ...s,
          behaviorPointsTotal: (s.behaviorPointsTotal || 0) + 5,
          assignments: updatedAssignments
        };
      }
      return s;
    });

    setStudents(updated);
    db.saveStudents(updated, true);
    studentRepository.saveAll(updated);

    sound.playSuccess();
    triggerConfetti();
    showToast('gold', 'إنجاز رائع!', `حصلت على ${score} درجات وتمت إضافة +5 نقاط تميز 🌟`);

    auditLogger.log({
      actorName: 'الطالب',
      actorRole: currentRole,
      action: 'SUBMIT_ASSIGNMENT',
      entity: 'Assignment',
      details: `تسليم واجب برقم ${assignmentId} والحصول على ${score} درجة`,
      severity: 'INFO'
    });
  };

  const sendChatMessage = (
    conversationId: string,
    text?: string,
    isVoice?: boolean,
    voiceDuration?: string,
    imageUrl?: string
  ) => {
    const cleanText = text ? SecurityEngine.cleanText(text) : undefined;
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderRole: currentRole,
      senderName: currentTeacher ? currentTeacher.name : currentRole === 'parent' ? `ولي أمر الطالب (${selectedStudent.name.split(' ')[0]})` : 'المعلم',
      text: cleanText,
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
          lastMessage: cleanText || (isVoice ? '🎤 رسالة صوتية' : '📷 صورة مرفقة'),
          lastMessageTime: 'الآن',
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    setConversations(updatedConv);
    db.saveConversations(updatedConv);
    sound.playTap();

    if (currentRole === 'parent') {
      setTimeout(() => {
        const teacherReplies = [
          'أهلاً بك يا ولي الأمر، وصلت ملاحظتك وسيتم متابعة الطالب باهتمام مستمر 🌟',
          'شكراً لحرصك ومتابعتك الدائمة، معتز نموذج يحتذى به في الفصل 👏',
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
          db.saveConversations(autoUpdated);
          return autoUpdated;
        });

        sound.playSuccess();
        addNotification('رسالة جديدة من المعلم 💬', randomReply, 'admin', selectedStudent.name);
        showToast('info', 'رسالة جديدة من المعلم', randomReply);
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
      title: SecurityEngine.sanitizeString(title),
      message: SecurityEngine.sanitizeString(message),
      category,
      date: 'الآن',
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      studentName
    };

    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    db.saveNotifications(updated);
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    db.saveNotifications(updated);
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    db.saveNotifications(updated);
    sound.playTap();
    showToast('info', 'التنبيهات', 'تم تعليم كافة التنبيهات كمقروءة.');
  };

  const resetDatabase = () => {
    SecurityEngine.assertPermission(currentRole, 'RESET_SYSTEM');
    db.resetAllData();
    setStudents(SEED_STUDENTS);
    setSelectedStudent(SEED_STUDENTS[0]);
    setTeachers(SEED_TEACHERS);
    setClasses(SEED_CLASSES);
    setNotifications(SEED_NOTIFICATIONS);
    setDailyReport(SEED_DAILY_REPORT);
    setConversations(SEED_CONVERSATIONS);
    setSchedule(SEED_SCHEDULE);
    setCaseStudies(SEED_CASE_STUDIES);
    setCounselingSessions(SEED_COUNSELING_SESSIONS);
    setParentSummons(SEED_PARENT_SUMMONS);
    setFollowUpForms(SEED_FOLLOWUP_FORMS);
    setInfractions(SEED_INFRACTIONS);
    setAutoSummonCards(SEED_AUTO_SUMMON_CARDS);
    auditLogger.clearLogs();
    sound.playSuccess();
    showToast('success', 'إعادة الضبط', 'تمت استعادة البيانات الأولية للنظام بنجاح.');
  };

  const updateSchoolProfile = (partial: Partial<SchoolProfile>) => {
    setSchoolProfileState(prev => {
      const updated = { ...prev, ...partial };
      saveSchoolProfile(updated);
      setSavedSchoolsState(currentSchools => {
        const idx = currentSchools.findIndex(s => s.id === updated.id);
        let list = [...currentSchools];
        if (idx >= 0) {
          list[idx] = updated;
        } else {
          list.push(updated);
        }
        try {
          localStorage.setItem(STORAGE_KEY_SAVED_SCHOOLS, JSON.stringify(list));
        } catch {}
        return list;
      });
      return updated;
    });
    showToast('gold', 'تم تحديث بيانات المدرسة 🏫', 'تم حفظ وتحديث بيانات المدرسة بنجاح في المنظومة.');
  };

  const createNewSchool = (name: string, district: string, directorName: string, directorPhone: string, startFresh: boolean) => {
    // 1. Snapshot current school data
    try {
      localStorage.setItem(`madrasa_school_data_${schoolProfile.id}`, JSON.stringify({
        students,
        classes,
        teachers
      }));
    } catch {}

    const newId = `school-${Date.now()}`;
    const newSchool: SchoolProfile = {
      id: newId,
      name,
      code: `SCH-LIB-${Math.floor(100 + Math.random() * 900)}`,
      district: district || 'مراقبة التربية والتعليم',
      directorName: directorName || 'مدير المدرسة',
      directorPhone: directorPhone || '0922465676',
      academicYear: '2025 - 2026 م',
      isCustom: true
    };

    setSchoolProfileState(newSchool);
    saveSchoolProfile(newSchool);

    setSavedSchoolsState(prev => {
      const list = [...prev, newSchool];
      try {
        localStorage.setItem(STORAGE_KEY_SAVED_SCHOOLS, JSON.stringify(list));
      } catch {}
      return list;
    });

    if (startFresh) {
      setStudents([]);
      db.saveStudents([]);
    }

    sound.playFanfare();
    triggerConfetti();
    showToast('gold', 'تم تهيئة المدرسة الجديدة بنجاح 🌟', `تم ضبط المنظومة لمدرسة: ${name}. جاهزة لإدخال البيانات!`);
  };

  const switchSchool = (schoolId: string) => {
    const target = savedSchools.find(s => s.id === schoolId);
    if (!target) return;

    // Snapshot current
    try {
      localStorage.setItem(`madrasa_school_data_${schoolProfile.id}`, JSON.stringify({
        students,
        classes,
        teachers
      }));
    } catch {}

    // Restore target
    try {
      const savedData = localStorage.getItem(`madrasa_school_data_${target.id}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.students) {
          setStudents(parsed.students);
          db.saveStudents(parsed.students);
        }
      }
    } catch {}

    setSchoolProfileState(target);
    saveSchoolProfile(target);
    sound.playSuccess();
    showToast('info', 'تم التبديل للمدرسة 🏫', `أنت الآن في: ${target.name}`);
  };

  const exportSchoolPackage = () => {
    sound.playTap();
    const pkg = {
      schoolProfile,
      students,
      teachers,
      classes,
      exportedAt: new Date().toISOString(),
      platform: 'Digital School Platform Libya 360'
    };
    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `حزمة_${schoolProfile.name.replace(/\s+/g, '_')}_2026.madrasa.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('gold', 'تم تصدير نسخة المدرسة 📦', 'تم تنزيل ملف المنظومة بنجاح. يمكنك إرساله لصديقك لتجربته!');
  };

  const importSchoolPackage = (jsonContent: string): boolean => {
    try {
      const pkg = JSON.parse(jsonContent);
      if (!pkg.schoolProfile || !pkg.schoolProfile.name) {
        throw new Error('ملف الحزمة غير صالح أو لا يحتوي على بيانات مدرسة.');
      }
      setSchoolProfileState(pkg.schoolProfile);
      saveSchoolProfile(pkg.schoolProfile);
      if (Array.isArray(pkg.students)) {
        setStudents(pkg.students);
        db.saveStudents(pkg.students);
      }
      if (Array.isArray(pkg.teachers)) {
        setTeachers(pkg.teachers);
        db.saveTeachers(pkg.teachers);
      }
      setSavedSchoolsState(prev => {
        if (!prev.some(s => s.id === pkg.schoolProfile.id)) {
          const list = [...prev, pkg.schoolProfile];
          try {
            localStorage.setItem(STORAGE_KEY_SAVED_SCHOOLS, JSON.stringify(list));
          } catch {}
          return list;
        }
        return prev;
      });
      sound.playFanfare();
      triggerConfetti();
      showToast('gold', 'تم استيراد المدرسة بنجاح 🌟', `تم تحميل بيانات ${pkg.schoolProfile.name} بالكامل.`);
      return true;
    } catch (err: any) {
      showToast('error', 'خطأ في الاستيراد', err.message || 'فشل في قراءة ملف حزمة المدرسة.');
      return false;
    }
  };

  const updateTeacherCode = (teacherId: string, newCode: string): boolean => {
    const clean = newCode.trim();
    if (!clean) {
      showToast('error', 'خطأ في الرمز', 'يرجى إدخال رمز صحيح غير فارغ.');
      return false;
    }
    const updated = teachers.map(t => t.id === teacherId ? { ...t, code: clean } : t);
    setTeachers(updated);
    db.saveTeachers(updated);
    if (currentTeacher && currentTeacher.id === teacherId) {
      setCurrentTeacher({ ...currentTeacher, code: clean });
    }
    sound.playSuccess();
    triggerConfetti();
    showToast('gold', 'تم تخصيص الرمز بنجاح 🏷️', `أصبح رمز الدخول الخاص بك الآن: ${clean}`);
    return true;
  };

  return (
    <SchoolContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        isAuthenticated,
        currentUserPhone,
        setCurrentUserPhone: (phone: string) => setCurrentUserPhoneState(phone),
        currentTeacher,
        teachers,
        setTeachers,
        login,
        loginWithTeacherCode,
        logout,
        showOperationalPlanModal,
        setShowOperationalPlanModal,
        showAccountSettingsModal,
        setShowAccountSettingsModal,
        schoolProfile,
        updateSchoolProfile,
        createNewSchool,
        switchSchool,
        savedSchools,
        exportSchoolPackage,
        importSchoolPackage,
        showSchoolManagerModal,
        setShowSchoolManagerModal,
        showPdfImporterModal,
        setShowPdfImporterModal,
        showCustomCodeModal,
        setShowCustomCodeModal,
        updateTeacherCode,
        isLargeFontMode,
        toggleLargeFontMode,
        caseStudies,
        setCaseStudies,
        counselingSessions,
        setCounselingSessions,
        parentSummons,
        setParentSummons,
        followUpForms,
        setFollowUpForms,
        saveFollowUpForm,
        infractions,
        setInfractions,
        autoSummonCards,
        setAutoSummonCards,
        recordInfractionAndCheck,
        activeTab,
        setActiveTab,
        isDarkMode,
        toggleDarkMode,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        soundEnabled,
        setSoundEnabled,
        showToast,
        students,
        setStudents,
        selectedStudent,
        setSelectedStudent,
        classes,
        notifications,
        unreadCount,
        dailyReport,
        conversations,
        schedule,
        setSchedule,
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
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
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
