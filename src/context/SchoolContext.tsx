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
  SchoolProfile,
  FinancialTransaction,
  TuitionFeeRecord,
  StaffMember,
  StaffDocumentChecklist
} from '../types';
import {
  INITIAL_FINANCIAL_TRANSACTIONS,
  INITIAL_TUITION_RECORDS
} from '../data/mockFinanceData';
import {
  INITIAL_STAFF_MEMBERS,
  STAFF_ROLE_LABELS
} from '../data/mockStaffData';
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
  STORAGE_KEY_SCHOOL_PROFILE,
  STORAGE_KEY_SAVED_SCHOOLS
} from '../services/db';
import { WarningTriggerEngine, SEED_INFRACTIONS, SEED_AUTO_SUMMON_CARDS } from '../services/counselor/warningTriggerEngine';
import { sound } from '../utils/soundEffects';
import { triggerConfetti } from '../utils/confetti';
import { ToastContainer, ToastMessage, ToastType } from '../components/ui/Toast';
import { auditLogger } from '../services/audit/auditLogger';
import { SecurityEngine } from '../services/security/securityEngine';
import { autoBackupService } from '../services/storage/autoBackup';
import { ROLE_HOME, mayViewInterface } from '../services/security/roleAccess';
import { SuperAdminLockModal } from '../components/common/SuperAdminLockModal';
import { PinRotationModal } from '../components/common/PinRotationModal';
import { studentRepository } from '../services/repositories';
import { LIBYAN_BAOUR_STUDENTS } from '../data/libyanBaourSchoolDataset';
import { LicenseService } from '../services/licensing/licenseService';
import { LicenseVerificationResult, SchoolLicenseDoc } from '../services/licensing/licenseTypes';
import { LicenseActivationModal } from '../components/licensing/LicenseActivationModal';
import { SubscriptionExpiredOverlay } from '../components/licensing/SubscriptionExpiredOverlay';

interface SchoolContextType {
  // Auth & Roles
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  /** الهوية الحقيقية المسجلة (لا تتغير بالتصفح) — فصل الواجهات */
  authenticatedRole: UserRole;
  /** هل الواجهة المعروضة مختلفة عن الهوية؟ (وضع المعاينة/الانتحال المشروع) */
  isImpersonating: boolean;
  /** هل جلسة الماستر مفتوحة برمز السوبر؟ (تُفقد عند إعادة التحميل) */
  superUnlocked: boolean;
  /** معاينة واجهة دور آخر — مسموحة فقط حسب مصفوفة mayViewInterface */
  viewAs: (role: UserRole) => void;
  /** العودة من المعاينة إلى واجهة الهوية الحقيقية */
  stopImpersonating: () => void;
  /** فتح جلسة الماستر برمز السوبر (4 أرقام) */
  unlockSuperAdmin: (pin: string) => boolean;
  /** الدخول الكامل للسوبر بعد التحقق من الرمز مباشرة */
  enterSuperAdmin: () => void;
  /** الخروج من بوابة السوبر إلى مدير المدرسة (بعد إعادة التحميل) */
  exitSuperAdminGate: () => void;
  /** وضع المعاينة = قراءة فقط (الواجهة المعروضة غير الهوية) */
  isReadOnlyPreview: boolean;
  isAuthenticated: boolean;
  currentUserPhone: string;
  currentTeacher: TeacherAccount | null;
  teachers: TeacherAccount[];
  selectTeacher: (teacher: TeacherAccount) => void;
  login: (phoneOrId: string, role: UserRole) => void;
  loginWithTeacherCode: (code: string) => boolean;
  logout: () => void;

  // Parent Student Linkage & Discovery
  parentLinkedStudent: Student | null;
  setParentLinkedStudent: (student: Student | null) => void;
  previouslyLinkedStudents: Student[];
  unlinkParentStudent: (studentId: string) => void;

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
  /** استعادة لقطة تلقائية (index من listAutoBackups — و99 للقطة الأمان) */
  restoreAutoBackup: (index: number) => boolean;
  listAutoBackups: () => import('../services/storage/autoBackup').AutoBackupMeta[];
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

  // Free Trial System (21st.dev Experience)
  isTrialActive: boolean;
  trialDaysRemaining: number;
  showFreeTrialModal: boolean;
  setShowFreeTrialModal: (open: boolean) => void;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (open: boolean) => void;
  createTrialSchool: (trialData: {
    schoolName: string;
    city: string;
    studentCount: string;
    isInternational: boolean;
    phone: string;
    address: string;
    username: string;
    seedRichData: boolean;
  }) => boolean;
  extendTrialDays: (extraDays: number) => boolean;
  /** حصة التمديد المجاني المتبقية (0 = استُنفدت → التفعيل الرسمي) */
  trialFreeExtendsLeft: number;

  // School Financial Management
  financialTransactions: FinancialTransaction[];
  tuitionFees: TuitionFeeRecord[];
  addFinancialTransaction: (tx: Omit<FinancialTransaction, 'id' | 'date'>) => void;
  updateTuitionPayment: (feeId: string, paidAmountToAdd: number) => void;

  // 60fps & 21st.dev Interactive Guided Tour
  isTourOpen: boolean;
  setIsTourOpen: (open: boolean) => void;
  startTour: () => void;

  // Student Transfer & Documents
  transferStudentClass: (studentId: string, newClassName: string, reason?: string) => boolean;
  updateStudentDocuments: (studentId: string, docs: Partial<NonNullable<Student['documents']>>) => void;

  // Staff & Employees Management
  staffMembers: StaffMember[];
  addStaffMember: (staff: Omit<StaffMember, 'id'>) => void;
  updateStaffMember: (id: string, updatedFields: Partial<StaffMember>) => void;
  deleteStaffMember: (id: string) => void;
  updateStaffDocuments: (id: string, docs: Partial<StaffDocumentChecklist>) => void;

  // Cloud Licensing & Subscription
  licenseInfo: LicenseVerificationResult | null;
  isSubscriptionLocked: boolean;
  checkLicense: () => Promise<LicenseVerificationResult>;
  showActivationModal: boolean;
  setShowActivationModal: (open: boolean) => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const qRole = params.get('role');
        if (qRole && ['admin', 'exams_coordinator', 'teacher', 'parent', 'counselor', 'superadmin'].includes(qRole)) {
          return qRole as UserRole;
        }
      }
      const saved = localStorage.getItem('madrasa_active_role');
      if (saved && ['admin', 'exams_coordinator', 'teacher', 'parent', 'counselor', 'superadmin'].includes(saved)) {
        return saved as UserRole;
      }
    } catch {}
    return 'admin';
  });

  // الهوية الحقيقية: من سجّل الدخول فعلاً (تُحفظ بين الجلسات، ولا تتأثر بالتصفح)
  const [authenticatedRole, setAuthenticatedRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('madrasa_auth_role');
      if (saved && ['admin', 'exams_coordinator', 'teacher', 'parent', 'counselor', 'superadmin'].includes(saved)) {
        return saved as UserRole;
      }
    } catch {}
    return 'admin';
  });

  const setAuthenticatedRole = (role: UserRole) => {
    setAuthenticatedRoleState(role);
    try {
      localStorage.setItem('madrasa_auth_role', role);
    } catch {}
  };

  // جلسة الماستر: تُفتح برمز السوبر فقط، ولا تُحفظ (تنتهي بإعادة التحميل)
  const [superUnlocked, setSuperUnlocked] = useState(false);

  const denyRoleSwitch = (target: UserRole) => {
    sound.playAlert();
    showToast('error', '⛔ منطقة محظورة', `لا تملك صلاحية فتح واجهة (${target}). هذا الإجراء مسجل في سجل التدقيق.`);
    auditLogger.log({
      actorName: currentUserPhone,
      actorRole: authenticatedRole,
      action: 'ACCESS_DENIED_ROLE_SWITCH',
      entity: 'Security',
      details: `محاولة انتقال مرفوضة من (${authenticatedRole}) إلى (${target})`,
      severity: 'WARN'
    });
  };

  // بوابة الكتابة: المعاينة قراءة فقط — أي طفرة أثناء عرض واجهة غير الهوية تُمنع
  // (تمنع: رصد حضور/درجات باسم معلم آخر، إرسال رسائل منتحلة، تصفير من واجهة دخيلة)
  const requireLiveMode = (actionAr: string): boolean => {
    if (currentRole !== authenticatedRole) {
      sound.playAlert();
      showToast('warning', '👁 وضع المعاينة — قراءة فقط', `لا يمكن ${actionAr} أثناء معاينة واجهة أخرى. عُد إلى واجهتك للتنفيذ.`);
      auditLogger.log({
        actorName: currentUserPhone,
        actorRole: authenticatedRole,
        action: 'PREVIEW_WRITE_BLOCKED',
        entity: 'Security',
        details: `مُنع ${actionAr} في وضع المعاينة (العرض: ${currentRole})`,
        severity: 'WARN'
      });
      return false;
    }
    return true;
  };

  // إدارة المدارس (إنشاء/تبديل/استيراد حزم): هوية مدير أو سوبر (بجلسة ماستر) ومن واجهتها الحية فقط.
  // تُغلق إنشاء المدارس من البوابة العامة والمعاينة وحسابات الطاقم الأدنى.
  const requireSchoolManager = (actionAr: string): boolean => {
    const privileged =
      isAuthenticated &&
      (authenticatedRole === 'admin' ||
        (authenticatedRole === 'superadmin' && superUnlocked)) &&
      currentRole === authenticatedRole;
    if (!privileged) {
      sound.playAlert();
      showToast('error', '⛔ صلاحية إدارة المدارس', `لا يمكن ${actionAr} — خاص بمدير المدرسة (أو المدير العام) من واجهته.`);
      auditLogger.log({
        actorName: currentUserPhone,
        actorRole: authenticatedRole,
        action: 'ACCESS_DENIED_SCHOOL_MANAGE',
        entity: 'Security',
        details: `محاولة ${actionAr} مرفوضة (الهوية: ${authenticatedRole}، العرض: ${currentRole})`,
        severity: 'WARN'
      });
      return false;
    }
    return true;
  };

  const applyRole = (role: UserRole) => {
    setCurrentRoleState(role);
    try {
      localStorage.setItem('madrasa_active_role', role);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('role', role);
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}

    if (role === 'admin') {
      setActiveTab('dashboard');
    } else if (role === 'teacher') {
      setActiveTab('teacher-quick');
      if (!currentTeacher && teachers && teachers.length > 0) {
        try {
          const savedId = localStorage.getItem('madrasa_active_teacher_id');
          const found = savedId ? teachers.find(t => t.id === savedId) : null;
          setCurrentTeacher(found || teachers[0]);
        } catch {
          setCurrentTeacher(teachers[0]);
        }
      }
    } else if (role === 'exams_coordinator') {
      setActiveTab('exams-coordinator-dashboard');
    } else if (role === 'counselor') {
      setActiveTab('counselor-dashboard');
    } else if (role === 'superadmin') {
      setActiveTab('superadmin-dashboard');
    } else if (role === 'parent') {
      setActiveTab('parent-dashboard');
    }
  };

  // التبديل المحروس: أي انتقال بين الواجهات يمر من هنا (يغلق ثغرة ?role= والترقية الذاتية)
  const setCurrentRole = (role: UserRole) => {
    if (role === currentRole) {
      applyRole(role);
      return;
    }
    if (!isAuthenticated) {
      applyRole(role);
      return;
    }
    if (mayViewInterface(authenticatedRole, superUnlocked, role)) {
      if (role !== authenticatedRole) {
        auditLogger.log({
          actorName: currentUserPhone,
          actorRole: authenticatedRole,
          action: 'ROLE_VIEW_AS',
          entity: 'Security',
          details: `معاينة واجهة (${role}) من هوية (${authenticatedRole})`,
          severity: 'INFO'
        });
      }
      applyRole(role);
      return;
    }
    denyRoleSwitch(role);
  };

  // معاينة صريحة (زر "تصفح كـ" + مبدّل Navbar) — نفس الحراسة بتسمية أوضح
  const viewAs = (role: UserRole) => {
    setCurrentRole(role);
  };

  const stopImpersonating = () => {
    applyRole(authenticatedRole);
    sound.playTap();
    showToast('info', 'عودة للواجهة الرئيسية', 'تم الرجوع إلى واجهتك الأصلية.');
  };

  // فتح جلسة الماستر برمز السوبر (مع قفل تخمين 45 ثانية داخل المحرك)
  const unlockSuperAdmin = (pin: string): boolean => {
    const res = SecurityEngine.verifySuperAdminPin(pin);
    if (res.valid) {
      setSuperUnlocked(true);
      auditLogger.log({
        actorName: currentUserPhone,
        actorRole: authenticatedRole,
        action: 'SUPERADMIN_UNLOCK',
        entity: 'Security',
        details: 'تم فتح جلسة الماستر برمز السوبر بنجاح',
        severity: 'WARN'
      });
      return true;
    }
    auditLogger.log({
      actorName: currentUserPhone,
      actorRole: authenticatedRole,
      action: 'SUPERADMIN_UNLOCK_FAILED',
      entity: 'Security',
      details: res.message,
      severity: 'WARN'
    });
    return false;
  };

  // الدخول الكامل للسوبر (يُستدعى فقط بعد نجاح التحقق من الرمز في المودال/الفورم)
  const enterSuperAdmin = () => {
    setAuthenticatedRole('superadmin');
    setSuperUnlocked(true);
    setIsAuthenticated(true);
    markSession();
    applyRole('superadmin');
    sound.playSuccess();
    triggerConfetti();
    showToast('gold', 'مرحباً أيها المدير العام 🌐', 'تم الدخول لبوابة السوبر — يمكنك التصفح بين جميع الواجهات والأقسام.');
    auditLogger.log({
      actorName: currentUserPhone,
      actorRole: 'superadmin',
      action: 'SUPERADMIN_ENTER',
      entity: 'Security',
      details: 'دخول المدير العام بعد التحقق من رمز الماستر',
      severity: 'WARN'
    });
  };

  // الخروج من بوابة السوبر (تُعرض بعد إعادة التحميل عندما تكون الهوية سوبر والجلسة مقفلة)
  const exitSuperAdminGate = () => {
    setSuperUnlocked(false);
    setAuthenticatedRole('admin');
    setIsAuthenticated(true);
    markSession();
    applyRole('admin');
  };
  // نموذج الجلسة (بوابة عامة للغرباء / دخول مباشر لصاحب الجهاز):
  // الرابط العام على جهاز غريب = لا جلسة ولا إعداد سابق → شاشة الدخول (لا لوحة مدير مباشرة).
  // جهاز المدرسة (سبق الدخول أو الترخيص أو الإعداد) → استعادة الجلسة والدخول المباشر محفوظ.
  const SESSION_KEY = 'madrasa_session_active';

  const hasPriorSetup = (): boolean => {
    try {
      // جلسة قائمة (لم تُسجَّل خروجاً) أو أي بصمة استخدام حقيقي على هذا الجهاز.
      // ملاحظة: مفتاح الترخيص مستثنى عمداً لأنه يُزرع تلقائياً عند أول فحص.
      if (localStorage.getItem(SESSION_KEY) === '1') return true;
      if (localStorage.getItem('madrasa_auth_role')) return true;
      if (localStorage.getItem('madrasa_active_role')) return true;
      if (localStorage.getItem(STORAGE_KEY_SCHOOL_PROFILE)) return true;
      if (localStorage.getItem('madrasa_db_students_v3')) return true;
      if (localStorage.getItem(STORAGE_KEY_SAVED_SCHOOLS)) return true;
    } catch {}
    return false;
  };

  const markSession = () => {
    try {
      localStorage.setItem(SESSION_KEY, '1');
    } catch {}
  };

  const clearSession = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => hasPriorSetup());
  const [currentUserPhone, setCurrentUserPhoneState] = useState(() => {
    try {
      return localStorage.getItem('madrasa_admin_phone') || '0922465676';
    } catch {
      return '0922465676';
    }
  });
  const [currentTeacher, setCurrentTeacher] = useState<TeacherAccount | null>(() => {
    try {
      const allTeachers = db.getTeachers();
      const savedId = localStorage.getItem('madrasa_active_teacher_id');
      if (savedId) {
        const found = allTeachers.find(t => t.id === savedId);
        if (found) return found;
      }
      return allTeachers[0] || null;
    } catch {
      return null;
    }
  });

  const [parentLinkedStudentId, setParentLinkedStudentId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('madrasa_parent_child_id') || null;
    } catch {
      return null;
    }
  });

  const [parentLinkedIds, setParentLinkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('madrasa_parent_linked_ids');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [showOperationalPlanModal, setShowOperationalPlanModal] = useState(false);
  const [showAccountSettingsModal, setShowAccountSettingsModal] = useState(false);
  const [showSchoolManagerModal, setShowSchoolManagerModal] = useState(false);
  const [showPdfImporterModal, setShowPdfImporterModal] = useState(false);
  const [showCustomCodeModal, setShowCustomCodeModal] = useState(false);
  const [showFreeTrialModal, setShowFreeTrialModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  // مودال فتح السوبر على مستوى المزوّد (للمسارات التي لا تملك مودالها الخاص)
  const [showSuperUnlockModal, setShowSuperUnlockModal] = useState(false);
  // تدوير الرموز الافتراضية إجباري (مرة واحدة — يُذكَّر كل إقلاع حتى التغيير)
  const [showPinRotation, setShowPinRotation] = useState(false);
  const [pinRotationNeeds, setPinRotationNeeds] = useState({ super: false, director: false });
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Cloud Licensing & Subscription State
  const [licenseInfo, setLicenseInfo] = useState<LicenseVerificationResult | null>(null);
  const [showActivationModal, setShowActivationModal] = useState(false);

  // Periodic and on-demand check handler
  const checkLicense = useCallback(async () => {
    const res = await LicenseService.checkSubscription();
    setLicenseInfo(res);
    return res;
  }, []);

  useEffect(() => {
    try {
      const rawKey = localStorage.getItem('madrasa_active_license_key');
      if (!rawKey) {
        setShowActivationModal(true);
      }
    } catch {}

    checkLicense();

    // Recheck subscription every 1 hour if online
    const timer = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        checkLicense();
      }
    }, 3600000);

    return () => clearInterval(timer);
  }, [checkLicense]);

  // شفاء ذاتي عند الإقلاع: أي واجهة مخزنة/ممررة بالرابط أعلى من الهوية تُعاد لبيتها فوراً
  // (يغلق ثغرة ?role=superadmin والعبث بـ localStorage من الجذور)
  useEffect(() => {
    if (!mayViewInterface(authenticatedRole, superUnlocked, currentRole)) {
      applyRole(authenticatedRole);
    }
    // لقطة النسخ الاحتياطي التلقائي (صامتة، مرة كل ~20 ساعة، فتحتان دوّارتان)
    try {
      if (autoBackupService.isDue()) {
        autoBackupService.take({ schoolProfile, students, teachers, classes, notifications, conversations, schedule });
      }
    } catch {}
    // ختم الزمن الرتيب + فضح إرجاع الساعة
    try {
      const last = Number(localStorage.getItem(CLOCK_SKEW_KEY) || 0);
      localStorage.setItem(CLOCK_SKEW_KEY, String(Math.max(Date.now(), last)));
      if (clockTampered) {
        sound.playAlert();
        showToast('error', '⛔ اشتباه تلاعب بساعة الجهاز', 'ساعة الجهاز مرجعة للوراء — أوقفنا الفترة التجريبية مؤقتاً. صحح التاريخ والوقت ثم أعد الفتح.');
        auditLogger.log({
          actorName: currentUserPhone,
          actorRole: authenticatedRole,
          action: 'CLOCK_TAMPER_DETECTED',
          entity: 'Security',
          details: 'الإقلاع بطابع أقدم من آخر طابع مسجل — تجميد التجربة',
          severity: 'CRITICAL'
        });
      }
    } catch {}
    // تدوير الرموز الافتراضية: من يملك الإدارة/السوبر وتُركت رموزه مصنعية يُطالَب بالتغيير
    try {
      if (authenticatedRole === 'admin' || authenticatedRole === 'superadmin') {
        const needSuper = authenticatedRole === 'superadmin' && SecurityEngine.getSuperAdminPin() === '9988';
        const needDirector = SecurityEngine.getDirectorPin() === '2026';
        if (needSuper || needDirector) {
          setPinRotationNeeds({ super: needSuper, director: needDirector });
          setShowPinRotation(true);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTour = () => {
    setIsTourOpen(true);
    sound.playFanfare();
  };

  // Financial transactions & tuition fees
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('madrasa_finance_tx');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_FINANCIAL_TRANSACTIONS;
  });

  const [tuitionFees, setTuitionFees] = useState<TuitionFeeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('madrasa_tuition_fees');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TUITION_RECORDS;
  });
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
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const qRole = params.get('role');
        if (qRole === 'superadmin') return 'superadmin-dashboard';
        if (qRole === 'exams_coordinator') return 'exams-coordinator-dashboard';
        if (qRole === 'teacher') return 'teacher-quick';
        if (qRole === 'parent') return 'parent-dashboard';
        if (qRole === 'admin') return 'dashboard';
      }
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

  // Persistent Students (Libyan Official Al-Baour Roster 873 Students)
  // تهيئة بالقائمة الكاملة الخام: حالة الذاكرة مرجع الكتابة، والنطاق يُفرض عند العرض والجلب المباشر
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const data = db.getAllStudents();
      if (data && data.length > 5) return data;
      if (data && data.length > 0 && data[0]?.id !== 'std-1') return data;
      return LIBYAN_BAOUR_STUDENTS;
    } catch {
      return LIBYAN_BAOUR_STUDENTS;
    }
  });

  const [selectedStudent, setSelectedStudent] = useState<Student>(() => {
    try {
      const all = db.getAllStudents();
      const list = (all && all.length > 5) ? all : LIBYAN_BAOUR_STUDENTS;
      return list[0];
    } catch {
      return LIBYAN_BAOUR_STUDENTS[0];
    }
  });

  // Parent Linked Child State
  const parentLinkedStudent = React.useMemo(() => {
    if (!parentLinkedStudentId) return null;
    return students.find(s => s.id === parentLinkedStudentId || s.studentNumber === parentLinkedStudentId || s.nationalNumber === parentLinkedStudentId) || null;
  }, [parentLinkedStudentId, students]);

  const previouslyLinkedStudents = React.useMemo(() => {
    return students.filter(s => parentLinkedIds.includes(s.id));
  }, [parentLinkedIds, students]);

  const setParentLinkedStudent = useCallback((student: Student | null) => {
    if (student) {
      setParentLinkedStudentId(student.id);
      setSelectedStudent(student);
      setParentLinkedIds(prev => {
        const next = Array.from(new Set([student.id, ...prev]));
        try {
          localStorage.setItem('madrasa_parent_linked_ids', JSON.stringify(next));
        } catch {}
        return next;
      });
      try {
        localStorage.setItem('madrasa_parent_child_id', student.id);
      } catch {}
    } else {
      setParentLinkedStudentId(null);
      try {
        localStorage.removeItem('madrasa_parent_child_id');
      } catch {}
    }
  }, []);

  const unlinkParentStudent = useCallback((studentId: string) => {
    setParentLinkedIds(prev => {
      const next = prev.filter(id => id !== studentId);
      try {
        localStorage.setItem('madrasa_parent_linked_ids', JSON.stringify(next));
      } catch {}
      return next;
    });
    if (parentLinkedStudentId === studentId) {
      setParentLinkedStudentId(null);
      try {
        localStorage.removeItem('madrasa_parent_child_id');
      } catch {}
    }
  }, [parentLinkedStudentId]);

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

  const selectTeacher = useCallback((teacher: TeacherAccount) => {
    setCurrentTeacher(prev => {
      if (prev && prev.id !== teacher.id) {
        auditLogger.log({
          actorName: prev.name,
          actorRole: 'teacher',
          action: 'TEACHER_IDENTITY_SWITCH',
          entity: 'Auth',
          details: `تبديل هوية المعلم من (${prev.name}) إلى (${teacher.name})`,
          severity: 'WARN'
        });
      }
      return teacher;
    });
    try {
      localStorage.setItem('madrasa_active_teacher_id', teacher.id);
    } catch {}
    showToast('info', 'تم تحديد حساب المعلم 👨‍🏫', `أنت الآن في واجهة المعلم (${teacher.name}) - مادة ${teacher.subject}`);
  }, [showToast]);

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
    // بوابة السوبر لا تُفتح إلا برمز الماستر عبر unlockSuperAdmin/enterSuperAdmin
    if (role === 'superadmin' && !superUnlocked) {
      sound.playAlert();
      showToast('error', '🔒 يلزم رمز الماستر', 'دخول المدير العام محمي برمز السوبر (4 أرقام).');
      auditLogger.log({
        actorName: phoneOrId,
        actorRole: role,
        action: 'ACCESS_DENIED_SUPERADMIN_DIRECT',
        entity: 'Security',
        details: 'محاولة دخول سوبر مباشرة بدون رمز الماستر',
        severity: 'WARN'
      });
      return;
    }
    setCurrentUserPhoneState(phoneOrId);
    // تثبيت الهوية الحقيقية أولاً ثم فتح واجهتها مباشرة (تجاوز الحارس عمداً — هذه بوابة الدخول)
    setAuthenticatedRole(role);
    if (role !== 'superadmin') setSuperUnlocked(false);
    applyRole(role);
    setIsAuthenticated(true);
    markSession();
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
    } else if (role === 'superadmin') {
      setCurrentTeacher(null);
      setActiveTab('superadmin-dashboard');
    } else if (role === 'exams_coordinator') {
      setCurrentTeacher(null);
      setActiveTab('exams-coordinator-dashboard');
    } else {
      setCurrentTeacher(null);
      setActiveTab('dashboard');
    }
    sound.playSuccess();
    showToast('success', 'تسجيل الدخول', `مرحباً بك! تم الدخول بصفتك ${role === 'parent' ? 'ولي أمر' : role === 'teacher' ? 'معلم' : role === 'counselor' ? 'أخصائي اجتماعي' : role === 'exams_coordinator' ? 'منسق الامتحانات والتقويم (الكنترول)' : role === 'superadmin' ? 'المدير العام (سوبر أدمن)' : 'إدارة المدرسة'}`);
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
        setAuthenticatedRole('counselor');
        setSuperUnlocked(false);
        applyRole('counselor');
        setActiveTab('counselor-dashboard');
      } else {
        setAuthenticatedRole('teacher');
        setSuperUnlocked(false);
        applyRole('teacher');
        setActiveTab('teacher-quick');
      }
      setIsAuthenticated(true);
      markSession();
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
    showToast('error', 'رمز الدخول غير صحيح', 'تأكد من الرمز المسلم لك من إدارة المدرسة.');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSuperUnlocked(false);
    clearSession();
    setCurrentTeacher(null);
    setActiveTab('login');
    sound.playTap();
    showToast('info', 'تسجيل الخروج', 'تم تسجيل الخروج بنجاح.');
  };

  const updateAttendance = (studentId: string, status: AttendanceStatus, note?: string) => {
    SecurityEngine.assertPermission(currentRole, 'TAKE_ATTENDANCE');
    if (!requireLiveMode('تسجيل الحضور')) return;
    // سجل الحضور التراكمي: قيد اليوم يُستبدل عند إعادة الرصد (لا تكرار)، ويُحفظ بحد 120 قيداً.
    // النسبة تُحسب من السجل الفعلي (حاضر+متأخر = أيام مداومة) بدل الأرقام الثابتة المختلقة سابقاً.
    const todayISO = new Date().toISOString().split('T')[0];
    const cleanNote = note ? SecurityEngine.sanitizeString(note) : undefined;
    const calcRate = (history: { status: AttendanceStatus }[], fallback: number): number => {
      if (history.length === 0) return fallback;
      const attended = history.filter(r => r.status === 'present' || r.status === 'late').length;
      return Math.round((attended / history.length) * 1000) / 10;
    };
    const updated = students.map(s => {
      if (s.id === studentId) {
        const history = [
          { date: todayISO, status, ...(cleanNote ? { note: cleanNote } : {}) },
          ...((s.recentAttendance || []).filter(r => r.date !== todayISO))
        ].slice(0, 120);
        return {
          ...s,
          status,
          attendanceNote: cleanNote,
          recentAttendance: history,
          attendanceRate: calcRate(history, s.attendanceRate ?? 0),
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
    if (!requireLiveMode('التحضير الجماعي')) return;
    const todayISO = new Date().toISOString().split('T')[0];
    const updated = students.map(s => {
      if (!classId || s.className.includes(classId)) {
        const history = [
          { date: todayISO, status: 'present' as AttendanceStatus },
          ...((s.recentAttendance || []).filter(r => r.date !== todayISO))
        ].slice(0, 120);
        const attended = history.filter(r => r.status === 'present' || r.status === 'late').length;
        return {
          ...s,
          status: 'present' as AttendanceStatus,
          recentAttendance: history,
          attendanceRate: history.length > 0 ? Math.round((attended / history.length) * 1000) / 10 : 100,
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
    if (!requireLiveMode('ربط الطلاب')) return false;
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
    if (!requireLiveMode('منح النقاط السلوكية')) return;
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
    if (!requireLiveMode('تغيير الصور الشخصية')) return;
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
    if (!requireLiveMode('تعديل الدرجات')) return;
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
    // منع انتحال الهوية: لا إرسال باسم دور آخر أثناء المعاينة
    if (!requireLiveMode('إرسال الرسائل')) return;
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
    if (!requireLiveMode('تصفير قاعدة البيانات')) return;
    db.resetAllData();
    setStudents(LIBYAN_BAOUR_STUDENTS);
    setSelectedStudent(LIBYAN_BAOUR_STUDENTS[0]);
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
    // نزاهة التدقيق: التصفير لا يمحو أثره — يُمسح السجل ثم يُختم بقيد التصفير نفسه (شاهد)
    auditLogger.clearLogs();
    auditLogger.log({
      actorName: currentUserPhone,
      actorRole: authenticatedRole,
      action: 'SYSTEM_RESET',
      entity: 'Database',
      details: 'تصفير قاعدة البيانات واستعادة البذور — قيد شاهد بعد المسح',
      severity: 'CRITICAL'
    });
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
    if (!requireSchoolManager('إنشاء مدرسة جديدة')) return;
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
    if (!requireSchoolManager('التبديل بين المدارس')) return;
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
    if (!requireSchoolManager('استيراد حزمة مدرسة')) return false;
    try {
      const pkg = JSON.parse(jsonContent);
      if (!pkg.schoolProfile || !pkg.schoolProfile.name) {
        throw new Error('ملف الحزمة غير صالح أو لا يحتوي على بيانات مدرسة.');
      }
      // شبكة أمان: حفظ الحالة الحالية قبل الاستيراد (رجوع بنقرة من النسخ والترميم)
      autoBackupService.stashSafety({ schoolProfile, students, teachers, classes, notifications, conversations, schedule });
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
      auditLogger.log({
        actorName: currentUserPhone,
        actorRole: authenticatedRole,
        action: 'SCHOOL_PACKAGE_IMPORT',
        entity: 'Backup',
        details: `استيراد حزمة (${pkg.schoolProfile.name}) — الحالة السابقة محفوظة في لقطة الأمان`,
        severity: 'WARN'
      });
      return true;
    } catch (err: any) {
      showToast('error', 'خطأ في الاستيراد', err.message || 'فشل في قراءة ملف حزمة المدرسة.');
      return false;
    }
  };

  const listAutoBackups = () => autoBackupService.list();

  // استعادة لقطة تلقائية مع التحقق وشبكة الرجوع (لقطة الأمان تُحفظ أولاً)
  const restoreAutoBackup = (index: number): boolean => {
    if (!requireLiveMode('استعادة النسخ الاحتياطية')) return false;
    const snap = autoBackupService.get(index);
    if (!snap || !Array.isArray(snap.students) || snap.students.length === 0) {
      showToast('error', 'لقطة غير صالحة', 'تعذر قراءة هذه النسخة الاحتياطية.');
      return false;
    }
    try {
      autoBackupService.stashSafety({ schoolProfile, students, teachers, classes, notifications, conversations, schedule });
      const s = snap.students as Student[];
      const t = (snap.teachers as TeacherAccount[]) || [];
      const c = (snap.classes as SchoolClass[]) || [];
      const n = (snap.notifications as NotificationItem[]) || [];
      const cv = (snap.conversations as TeacherConversation[]) || [];
      const sc = (snap.schedule as DaySchedule[]) || [];
      setStudents(s); db.saveStudents(s, true);
      if (t.length > 0) { setTeachers(t); db.saveTeachers(t); }
      if (c.length > 0) { setClasses(c); db.saveClasses(c); }
      setNotifications(n); db.saveNotifications(n);
      setConversations(cv); db.saveConversations(cv);
      if (sc.length > 0) { setSchedule(sc); db.saveSchedule(sc); }
      if (snap.schoolProfile && (snap.schoolProfile as SchoolProfile).name) {
        setSchoolProfileState(snap.schoolProfile as SchoolProfile);
        saveSchoolProfile(snap.schoolProfile as SchoolProfile);
      }
      sound.playSuccess();
      showToast('gold', 'تمت الاستعادة بنجاح 💾', `استُعيدت لقطة بتاريخ ${new Date(snap.takenAt).toLocaleDateString('ar-LY')} — والحالة السابقة محفوظة في لقطة الأمان.`);
      auditLogger.log({
        actorName: currentUserPhone,
        actorRole: authenticatedRole,
        action: 'AUTOBACKUP_RESTORE',
        entity: 'Backup',
        details: `استعادة لقطة (${snap.takenAt}) بعدد ${s.length} طالباً`,
        severity: 'CRITICAL'
      });
      return true;
    } catch {
      showToast('error', 'فشلت الاستعادة', 'تعذر تطبيق النسخة — بياناتك الحالية لم تُمس.');
      return false;
    }
  };

  const updateTeacherCode = (teacherId: string, newCode: string): boolean => {
    if (!requireLiveMode('تغيير رموز الدخول')) return false;
    const clean = newCode.trim().toUpperCase();
    if (!clean || clean.length < 4) {
      showToast('error', 'خطأ في الرمز', 'يرجى إدخال رمز من 4 أحرف على الأقل.');
      return false;
    }
    // فرادة الرمز: التكرار يعني دخولاً لحساب زميل آخر (find الأول يفوز) — مرفوض
    const clash = teachers.find(t => t.id !== teacherId && t.code.trim().toUpperCase() === clean);
    if (clash) {
      sound.playAlert();
      showToast('error', '⛔ الرمز مستخدم مسبقاً', `الرمز (${clean}) مسجل باسم (${clash.name}). اختر رمزاً فريداً.`);
      auditLogger.log({
        actorName: currentUserPhone,
        actorRole: authenticatedRole,
        action: 'TEACHER_CODE_CLASH',
        entity: 'Auth',
        details: `محاولة تعيين رمز مكرر (${clean}) الموجود لدى (${clash.name})`,
        severity: 'WARN'
      });
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

  // كشف التلاعب بساعة الجهاز: الساعة للوراء = تجميد التجربة عمداً.
  // يُحفظ أعلى طابع زمني شوهد؛ أي إقلاع بطابع أقدم بفارق مريب = عبث.
  const CLOCK_SKEW_KEY = 'madrasa_last_seen_ts';
  const CLOCK_SKEW_TOLERANCE_MS = 5 * 60 * 1000;

  const detectClockTamper = (): boolean => {
    try {
      const last = Number(localStorage.getItem(CLOCK_SKEW_KEY) || 0);
      if (!last) return false;
      return Date.now() < last - CLOCK_SKEW_TOLERANCE_MS;
    } catch {
      return false;
    }
  };

  const [clockTampered] = useState<boolean>(() => detectClockTamper());

  // Free Trial Calculations
  const trialDaysRemaining = React.useMemo(() => {
    if (clockTampered) return 0; // ساعة مرجعة للوراء = التجربة موقوفة حتى تصحيح الساعة
    if (!schoolProfile.isTrial) return 0;
    const startDate = new Date(schoolProfile.trialStartDate || Date.now()).getTime();
    const durationDays = schoolProfile.trialDurationDays || 7;
    const msPassed = Date.now() - startDate;
    const daysPassed = msPassed / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(durationDays - daysPassed));
  }, [schoolProfile.isTrial, schoolProfile.trialStartDate, schoolProfile.trialDurationDays]);

  const isTrialActive = Boolean(schoolProfile.isTrial);

  // سياسة التجربة المجانية (صارمة — بلا تمديد مجاني متكرر):
  // trial_used يُكتب true مرة واحدة عند أول تفعيل لكل مدرسة/حساب (مربوط بهوية المدرسة+الهاتف)،
  // وأي ضغطة "تمديد مجاني" بعده مرفوضة تماماً مع دعوة للترقية. لا سقف يُعاد فتحه.
  const TRIAL_FREE_EXTEND_DAYS = 7;
  const TRIAL_MAX_FREE_EXTENDS = 0;
  const TRIAL_ABSOLUTE_MAX_DAYS = 30;
  const TRIAL_EXT_MIRROR_KEY = 'madrasa_trial_ext_v1';
  const TRIAL_USED_MIRROR_KEY = 'madrasa_trial_used_v1';

  const trialIdentityKey = (schoolId: string, phone: string): string =>
    `${(schoolId || '').trim().toLowerCase()}::${(phone || '').replace(/\D/g, '')}`;

  const readTrialUsedMirror = (): Record<string, { used: boolean; at: string }> => {
    try {
      const raw = localStorage.getItem(TRIAL_USED_MIRROR_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  };

  const writeTrialUsedMirror = (key: string) => {
    try {
      const map = readTrialUsedMirror();
      map[key] = { used: true, at: new Date().toISOString() };
      localStorage.setItem(TRIAL_USED_MIRROR_KEY, JSON.stringify(map));
    } catch {}
  };

  /** هل استُهلكت التجربة لهذه الهوية؟ (الملف + المرآة + سجل المدارس — طبقات ضد مسح المتصفح) */
  const isTrialUsed = (profile: SchoolProfile): boolean => {
    if (profile.trial_used === true) return true;
    try {
      const mirror = readTrialUsedMirror();
      if (mirror[trialIdentityKey(profile.id, profile.directorPhone)]?.used) return true;
      // طبقة السجل: مدرسة سابقة بنفس الهاتف والاسم استهلكت تجربتها
      const duplicates = savedSchools.filter(s =>
        s.id !== profile.id &&
        s.trial_used === true &&
        (s.directorPhone || '').replace(/\D/g, '') === (profile.directorPhone || '').replace(/\D/g, '') &&
        (s.directorPhone || '').replace(/\D/g, '').length >= 9 &&
        (s.name || '').trim() === (profile.name || '').trim()
      );
      if (duplicates.length > 0) return true;
    } catch {}
    return false;
  };

  const getTrialExtendsUsed = (profile: SchoolProfile): number => {
    let mirror = 0;
    try {
      const raw = localStorage.getItem(TRIAL_EXT_MIRROR_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        mirror = Number(parsed?.[profile.id]) || 0;
      }
    } catch {}
    return Math.max(Number(profile.trialFreeExtendsUsed) || 0, mirror);
  };

  const setTrialExtendsUsed = (profileId: string, used: number) => {
    try {
      const raw = localStorage.getItem(TRIAL_EXT_MIRROR_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[profileId] = used;
      localStorage.setItem(TRIAL_EXT_MIRROR_KEY, JSON.stringify(parsed));
    } catch {}
  };

  const trialFreeExtendsLeft = schoolProfile.isTrial && !isTrialUsed(schoolProfile)
    ? Math.max(0, TRIAL_MAX_FREE_EXTENDS - getTrialExtendsUsed(schoolProfile))
    : 0;

  const extendTrialDays = (extraDays: number): boolean => {
    if (!schoolProfile.isTrial) {
      showToast('info', 'المنظومة مفعلة رسمياً ✅', 'نسختك الرسمية سارية — لا حاجة لأي تمديد.');
      return true;
    }
    // القاعدة الصارمة: التجربة تُستهلك مرة واحدة — لا منح بعد أول تفعيل
    if (isTrialUsed(schoolProfile)) {
      sound.playAlert();
      showToast('warning', 'انتهت التجربة المجانية ⏳', 'سبق استخدام التجربة المجانية لهذه المدرسة — فعّل النسخة الرسمية للاستمرار.');
      auditLogger.log({
        actorName: currentUserPhone,
        actorRole: authenticatedRole,
        action: 'TRIAL_EXTEND_DENIED',
        entity: 'Licensing',
        details: 'رفض تمديد مجاني: trial_used=true (التجربة مستهلكة مسبقاً)',
        severity: 'WARN'
      });
      return false;
    }
    // مسار الهجرة فقط: ملف تجريبي قديم (قبل حقل trial_used) بلا ختم — يمنح مرة واحدة ثم يُختم نهائياً.
    // TRIAL_MAX_FREE_EXTENDS = 0 اليوم = المسار مغلق تماماً للجميع.
    const used = getTrialExtendsUsed(schoolProfile);
    if (used >= TRIAL_MAX_FREE_EXTENDS) {
      sound.playAlert();
      showToast('warning', 'انتهت التجربة المجانية ⏳', 'سبق استخدام التجربة المجانية لهذه المدرسة — فعّل النسخة الرسمية للاستمرار.');
      auditLogger.log({
        actorName: currentUserPhone,
        actorRole: authenticatedRole,
        action: 'TRIAL_EXTEND_DENIED',
        entity: 'Licensing',
        details: `رفض تمديد مجاني: الحصة مستنفدة (${used}/${TRIAL_MAX_FREE_EXTENDS})`,
        severity: 'WARN'
      });
      return false;
    }
    const grant = Math.min(Math.max(1, Math.floor(extraDays) || 0), TRIAL_FREE_EXTEND_DAYS);
    const nextUsed = used + 1;
    const updatedProfile: SchoolProfile = {
      ...schoolProfile,
      trialDurationDays: Math.min((schoolProfile.trialDurationDays || 7) + grant, TRIAL_ABSOLUTE_MAX_DAYS),
      trialFreeExtendsUsed: nextUsed,
      trial_used: true
    };
    setSchoolProfileState(updatedProfile);
    saveSchoolProfile(updatedProfile);
    setSavedSchoolsState(prev => prev.map(s => s.id === updatedProfile.id ? updatedProfile : s));
    setTrialExtendsUsed(updatedProfile.id, nextUsed);
    writeTrialUsedMirror(trialIdentityKey(updatedProfile.id, updatedProfile.directorPhone));
    sound.playFanfare();
    triggerConfetti();
    showToast('gold', 'تم تمديد التجربة المجانية ⏱️', `تمت إضافة ${grant} أيام لمرة أخيرة — خُتمت التجربة، والقادم التفعيل الرسمي.`);
    auditLogger.log({
      actorName: currentUserPhone,
      actorRole: authenticatedRole,
      action: 'TRIAL_EXTENDED',
      entity: 'Licensing',
      details: `تمديد هجرة أخير (+${grant} أيام) مع ختم trial_used=true`,
      severity: 'INFO'
    });
    return true;
  };

  // ختم الجهاز التجريبي: تجربة واحدة فقط لكل جهاز — يُكتب مرة واحدة ولا يُمسح بإنشاء ملفات جديدة.
  // نفس الهوية (مدرسة+هاتف) = استعادة بنفس التاريخ الأصلي (لا أيام جديدة).
  // هوية مختلفة = مرفوض (منع التسلسل بأسماء دوّارة) إلا بتجاوز المالك برمز الماستر.
  const DEVICE_TRIAL_KEY = 'madrasa_device_trial_v1';

  interface DeviceTrialSeal { firstTrialAt: string; schoolName: string; phone: string; count: number }

  const readDeviceSeal = (): DeviceTrialSeal | null => {
    try {
      const raw = localStorage.getItem(DEVICE_TRIAL_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (p && p.firstTrialAt) return p as DeviceTrialSeal;
    } catch {}
    return null;
  };

  const normName = (s: string): string => (s || '').trim().replace(/\s+/g, ' ');
  const normPhone = (s: string): string => (s || '').replace(/\D/g, '');

  const sameTrialIdentity = (aName: string, aPhone: string, bName: string, bPhone: string): boolean => {
    const np = normPhone(aPhone);
    const samePhone = np.length >= 9 && np === normPhone(bPhone);
    const sameName = normName(aName) !== '' && normName(aName) === normName(bName);
    return samePhone && sameName;
  };

  const createTrialSchool = (trialData: {
    schoolName: string;
    city: string;
    studentCount: string;
    isInternational: boolean;
    phone: string;
    address: string;
    username: string;
    seedRichData: boolean;
  }): boolean => {
    if (!requireLiveMode('إنشاء بيئة تجريبية')) return false;
    const cleanName = normName(trialData.schoolName) || 'مدرسة التجربة المجانية';
    const cleanPhone = normPhone(trialData.phone) || '';

    // بوابة الختم: هل سبق لهذا الجهاز تفعيل تجربة؟
    const seal = readDeviceSeal();
    let inheritedStart: string | null = null;
    if (seal) {
      const isSuperOverride = authenticatedRole === 'superadmin' && superUnlocked;
      if (sameTrialIdentity(cleanName, cleanPhone, seal.schoolName, seal.phone)) {
        // نفس الهوية (استعادة بعد مسح القائمة مثلاً): تُورَّث بداية التجربة الأصلية — صفر أيام جديدة
        inheritedStart = seal.firstTrialAt;
      } else if (!isSuperOverride) {
        sound.playAlert();
        showToast('warning', 'تجربة مستهلكة على هذا الجهاز ⏳', 'سُجلت تجربة مجانية سابقة على هذا الجهاز — فعّل النسخة الرسمية للاستمرار.');
        auditLogger.log({
          actorName: currentUserPhone,
          actorRole: authenticatedRole,
          action: 'TRIAL_CHAIN_DENIED',
          entity: 'Licensing',
          details: `رفض تجربة متسلسلة باسم (${cleanName}) — الختم السابق بتاريخ (${seal.firstTrialAt})`,
          severity: 'CRITICAL'
        });
        setShowUpgradeModal(true);
        return false;
      } else {
        auditLogger.log({
          actorName: currentUserPhone,
          actorRole: authenticatedRole,
          action: 'TRIAL_OVERRIDE_BY_OWNER',
          entity: 'Licensing',
          details: `تجاوز المالك: تجربة جديدة باسم (${cleanName}) رغم الختم السابق`,
          severity: 'WARN'
        });
      }
    }
    // لقطة أمان للحالة الحالية قبل التجهيز
    try {
      localStorage.setItem(`madrasa_school_data_${schoolProfile.id}`, JSON.stringify({
        students,
        classes,
        teachers,
        financialTransactions,
        tuitionFees
      }));
    } catch {}

    const newId = `school-trial-${Date.now()}`;
    const newTrialSchool: SchoolProfile = {
      id: newId,
      name: cleanName,
      code: `TRIAL-LIB-${Math.floor(100 + Math.random() * 900)}`,
      district: `مراقبة التربية والتعليم - ${trialData.city}`,
      directorName: trialData.username || 'مدير المدرسة',
      directorPhone: cleanPhone,
      academicYear: '2025 - 2026 م',
      isCustom: true,
      isTrial: true,
      // توريث البداية الأصلية عند الاستعادة بنفس الهوية — لا أيام جديدة أبداً
      trialStartDate: inheritedStart || new Date().toISOString(),
      trialDurationDays: 7,
      trialFreeExtendsUsed: 0,
      // ختم الاستهلاك لحظة أول تفعيل — لا تمديد مجاني بعده أبداً لهذه الهوية
      trial_used: true,
      city: trialData.city,
      studentCountEstimate: trialData.studentCount,
      isInternational: trialData.isInternational,
      address: trialData.address,
      adminUsername: trialData.username
    };

    setSchoolProfileState(newTrialSchool);
    saveSchoolProfile(newTrialSchool);
    // ترخيص تجريبي 7 أيام مرتبط بالمدرسة: يمنع ظهور بوابة التفعيل كل إقلاع،
    // وتنتهي صلاحيته تلقائياً ليدخل مسار التجديد الرسمي (حلقة مغلقة).
    // نفس الهوية = نفس الترخيص الأصلي (لا مفتاح جديد ولا أيام جديدة).
    try {
      const registry = LicenseService.getAdminRegisteredSchools();
      const prior = registry.find(s =>
        (s.school_name || '').trim() === cleanName &&
        (s.admin_phone || '').replace(/\D/g, '') === cleanPhone &&
        cleanPhone.length >= 9
      );
      const trialDoc: SchoolLicenseDoc = prior
        ? { ...prior, last_verified_at: new Date().toISOString() }
        : {
          license_key: LicenseService.generateLicenseKey(),
          school_name: cleanName,
          subscription_status: 'trial',
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: inheritedStart || new Date().toISOString(),
          admin_phone: cleanPhone,
          notes: 'تجربة ذاتية 7 أيام من داخل المنظومة',
          offline_grace_allowed_days: 7,
          last_verified_at: new Date().toISOString()
        };
      LicenseService.setActiveLicenseKey(trialDoc.license_key);
      LicenseService.setCachedLicense(trialDoc);
      const reg = registry.filter(s => s.license_key !== trialDoc.license_key);
      reg.unshift(trialDoc);
      LicenseService.saveAdminRegisteredSchools(reg);
      LicenseService.pushToFirestore(trialDoc).catch(() => {});
    } catch {}
    // ختم المرآة بالهوية الثابتة (المدرسة+الهاتف) — طبقة ضد مسح المتصفح
    writeTrialUsedMirror(trialIdentityKey(newTrialSchool.id, newTrialSchool.directorPhone));
    // ختم الجهاز (مرة واحدة): أول تفعيل يؤرخ بداية التجربة الوحيدة لهذا الجهاز
    try {
      const prev = readDeviceSeal();
      localStorage.setItem(DEVICE_TRIAL_KEY, JSON.stringify({
        firstTrialAt: prev?.firstTrialAt || newTrialSchool.trialStartDate,
        schoolName: cleanName,
        phone: cleanPhone,
        count: (prev?.count || 0) + 1,
      } as DeviceTrialSeal));
    } catch {}

    setSavedSchoolsState(prev => {
      const list = [...prev, newTrialSchool];
      try {
        localStorage.setItem(STORAGE_KEY_SAVED_SCHOOLS, JSON.stringify(list));
      } catch {}
      return list;
    });

    if (trialData.seedRichData) {
      const initialSeed = (LIBYAN_BAOUR_STUDENTS && LIBYAN_BAOUR_STUDENTS.length > 0)
        ? LIBYAN_BAOUR_STUDENTS
        : SEED_STUDENTS;
      setStudents(initialSeed);
      db.saveStudents(initialSeed);
      setFinancialTransactions(INITIAL_FINANCIAL_TRANSACTIONS);
      setTuitionFees(INITIAL_TUITION_RECORDS);
      try {
        localStorage.setItem('madrasa_finance_tx', JSON.stringify(INITIAL_FINANCIAL_TRANSACTIONS));
        localStorage.setItem('madrasa_tuition_fees', JSON.stringify(INITIAL_TUITION_RECORDS));
      } catch {}
    } else {
      setStudents([]);
      db.saveStudents([]);
      setFinancialTransactions([]);
      setTuitionFees([]);
      try {
        localStorage.setItem('madrasa_finance_tx', JSON.stringify([]));
        localStorage.setItem('madrasa_tuition_fees', JSON.stringify([]));
      } catch {}
    }

    // Set phone for admin login
    setCurrentUserPhoneState(cleanPhone || currentUserPhone);
    try {
      if (cleanPhone) localStorage.setItem('madrasa_admin_phone', cleanPhone);
    } catch {}

    // تهيئة بيئة تجريبية جديدة = هوية مدير جديدة (تجاوز الحارس عمداً)
    applyRole('admin');
    setAuthenticatedRole('admin');
    setSuperUnlocked(false);
    setIsAuthenticated(true);
    markSession();
    setActiveTab('dashboard');

    sound.playFanfare();
    triggerConfetti();
    showToast('gold', 'تم تجهيز بيئتك التجريبية بنجاح 🌟', `مرحباً بك في مدرسة ${cleanName}! لديك 7 أيام تجربة مجانية كاملة.`);
    auditLogger.log({
      actorName: cleanPhone,
      actorRole: 'admin',
      action: inheritedStart ? 'TRIAL_RECREATED_SAME_IDENTITY' : 'TRIAL_ACTIVATED',
      entity: 'Licensing',
      details: inheritedStart
        ? `إعادة إنشاء بنفس الهوية — موروثة من (${inheritedStart}) بلا أيام جديدة`
        : `تفعيل تجربة أولى باسم (${cleanName}) وختم الجهاز`,
      severity: 'WARN'
    });
    return true;
  };

  const addFinancialTransaction = (tx: Omit<FinancialTransaction, 'id' | 'date'>) => {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [newTx, ...financialTransactions];
    setFinancialTransactions(updated);
    try {
      localStorage.setItem('madrasa_finance_tx', JSON.stringify(updated));
    } catch {}
    sound.playSuccess();
    showToast('gold', 'تم تسجيل المعاملة المالية 💰', `تم قيد ${newTx.type === 'income' ? 'إيراد' : 'مصروف'} بقيمة ${newTx.amount} د.ل`);
  };

  const updateTuitionPayment = (feeId: string, paidAmountToAdd: number) => {
    const updated = tuitionFees.map(fee => {
      if (fee.id === feeId) {
        const newPaid = Math.min(fee.totalFee, fee.paidAmount + paidAmountToAdd);
        const newRemaining = Math.max(0, fee.totalFee - newPaid);
        return {
          ...fee,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: (newRemaining === 0 ? 'paid' : (newPaid > 0 ? 'partial' : 'unpaid')) as 'paid' | 'partial' | 'unpaid',
          lastPaymentDate: new Date().toISOString().split('T')[0]
        };
      }
      return fee;
    });
    setTuitionFees(updated);
    try {
      localStorage.setItem('madrasa_tuition_fees', JSON.stringify(updated));
    } catch {}
    sound.playSuccess();
    triggerConfetti();
    showToast('gold', 'تم تحديث سداد الرسوم 🧾', `تم قيد دفعة بمبلغ ${paidAmountToAdd} د.ل`);
  };

  // Staff Members Management
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem('madrasa_staff_members');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STAFF_MEMBERS;
  });

  const saveStaffToStorage = (updated: StaffMember[]) => {
    setStaffMembers(updated);
    try {
      localStorage.setItem('madrasa_staff_members', JSON.stringify(updated));
    } catch {}
  };

  const addStaffMember = (staff: Omit<StaffMember, 'id'>) => {
    const newMember: StaffMember = {
      ...staff,
      id: `staff-${Date.now()}`
    };
    const updated = [newMember, ...staffMembers];
    saveStaffToStorage(updated);
    sound.playSuccess();
    showToast('success', 'تمت إضافة الموظف/العامل بنجاح 👤', `${staff.firstName} ${staff.lastName} (${STAFF_ROLE_LABELS[staff.role] || staff.role})`);
  };

  const updateStaffMember = (id: string, updatedFields: Partial<StaffMember>) => {
    const updated = staffMembers.map(m => m.id === id ? { ...m, ...updatedFields } : m);
    saveStaffToStorage(updated);
    sound.playSuccess();
    showToast('success', 'تم تحديث بيانات الموظف ✏️', 'تم حفظ التعديلات بنجاح');
  };

  const deleteStaffMember = (id: string) => {
    const target = staffMembers.find(m => m.id === id);
    const updated = staffMembers.filter(m => m.id !== id);
    saveStaffToStorage(updated);
    sound.playAlert();
    showToast('info', 'تم حذف السجل 🗑️', `تم حذف ملف ${target ? target.firstName + ' ' + target.lastName : 'الموظف'}`);
  };

  const updateStaffDocuments = (id: string, docs: Partial<StaffDocumentChecklist>) => {
    const updated = staffMembers.map(m => {
      if (m.id === id) {
        return {
          ...m,
          documents: { ...m.documents, ...docs }
        };
      }
      return m;
    });
    saveStaffToStorage(updated);
    sound.playSuccess();
    showToast('success', 'تم تحديث مستندات الموظف 📁', 'تم تعديل حالة المستندات بنجاح');
  };

  // Student Class Transfer & Documents
  const transferStudentClass = (studentId: string, newClassName: string, reason?: string): boolean => {
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return false;
    const oldClass = targetStudent.className;
    if (oldClass === newClassName) {
      showToast('warning', 'تنبيه النقل ⚠️', 'الطالب مسجل بالفعل في هذا الفصل');
      return false;
    }

    const transferRecord = {
      fromClass: oldClass,
      toClass: newClassName,
      date: new Date().toISOString().split('T')[0],
      reason: reason || 'طلب نقل إداري'
    };

    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        const history = s.transferHistory ? [...s.transferHistory, transferRecord] : [transferRecord];
        return {
          ...s,
          className: newClassName,
          transferHistory: history
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    db.saveStudents(updatedStudents);

    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent({
        ...selectedStudent,
        className: newClassName,
        transferHistory: selectedStudent.transferHistory ? [...selectedStudent.transferHistory, transferRecord] : [transferRecord]
      });
    }

    sound.playSuccess();
    triggerConfetti();
    showToast('success', 'تم نقل الطالب بنجاح 🔄', `تم نقل ${targetStudent.name} من ${oldClass} إلى ${newClassName}`);
    return true;
  };

  const updateStudentDocuments = (studentId: string, docs: Partial<NonNullable<Student['documents']>>) => {
    const defaultDocs = {
      birthCert: false,
      healthRecord: false,
      photos: false,
      parentConsent: false,
      transferCert: false
    };

    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        const currentDocs = s.documents || defaultDocs;
        return {
          ...s,
          documents: { ...currentDocs, ...docs }
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    db.saveStudents(updatedStudents);

    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent({
        ...selectedStudent,
        documents: { ...(selectedStudent.documents || defaultDocs), ...docs }
      });
    }

    sound.playSuccess();
    showToast('success', 'تم تحديث مستندات الطالب 📁', 'تم حفظ حالة ملف الطالب والمستندات المسلمة');
  };

  return (
    <SchoolContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        authenticatedRole,
        isImpersonating: currentRole !== authenticatedRole,
        isReadOnlyPreview: currentRole !== authenticatedRole,
        superUnlocked,
        viewAs,
        stopImpersonating,
        unlockSuperAdmin,
        enterSuperAdmin,
        exitSuperAdminGate,
        isAuthenticated,
        currentUserPhone,
        setCurrentUserPhone: (phone: string) => setCurrentUserPhoneState(phone),
        currentTeacher,
        teachers,
        setTeachers,
        selectTeacher,
        login,
        loginWithTeacherCode,
        logout,
        parentLinkedStudent,
        setParentLinkedStudent,
        previouslyLinkedStudents,
        unlinkParentStudent,
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
        // Free trial & 21st.dev Experience
        isTrialActive,
        trialDaysRemaining,
        showFreeTrialModal,
        setShowFreeTrialModal,
        showUpgradeModal,
        setShowUpgradeModal,
        createTrialSchool,
        extendTrialDays,
        trialFreeExtendsLeft,
        restoreAutoBackup,
        listAutoBackups,
        // Finance Management
        financialTransactions,
        tuitionFees,
        addFinancialTransaction,
        updateTuitionPayment,
        // 60fps & 21st.dev Interactive Tour
        isTourOpen,
        setIsTourOpen,
        startTour,
        // Student Transfer & Documents
        transferStudentClass,
        updateStudentDocuments,
        // Staff & Employees Management
        staffMembers,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        updateStaffDocuments,
        // Cloud Licensing & Subscription
        licenseInfo,
        isSubscriptionLocked: licenseInfo ? !licenseInfo.isValid : false,
        checkLicense,
        showActivationModal,
        setShowActivationModal,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* First-time License Activation Modal */}
      <LicenseActivationModal
        isOpen={showActivationModal}
        onSuccess={(doc) => {
          setShowActivationModal(false);
          setLicenseInfo({
            isValid: true,
            status: doc.subscription_status,
            schoolName: doc.school_name,
            licenseKey: doc.license_key,
            daysRemaining: 14,
            isOfflineGrace: false,
            licenseDoc: doc
          });
        }}
      />

      {/* Subscription Expired / Locked Overlay */}
      {licenseInfo && !licenseInfo.isValid && (
        <SubscriptionExpiredOverlay
          result={licenseInfo}
          onRecheck={async () => {
            const res = await checkLicense();
            setLicenseInfo(res);
          }}
          onEnterNewLicense={() => setShowActivationModal(true)}
          onOpenSuperAdmin={() => {
            // انتهاء الاشتراك: فتح السوبر يستلزم رمز الماستر (لا قفز مباشر)
            setShowSuperUnlockModal(true);
          }}
        />
      )}

      {/* بوابة الماستر على مستوى المزوّد (انتهاء الاشتراك وغيره) */}
      <SuperAdminLockModal
        isOpen={showSuperUnlockModal}
        onClose={() => setShowSuperUnlockModal(false)}
        onSuccess={() => {
          setShowSuperUnlockModal(false);
          enterSuperAdmin();
        }}
      />

      {/* تدوير الرموز الافتراضية (أولوية قصوى — يظهر كل إقلاع حتى التغيير) */}
      <PinRotationModal
        isOpen={showPinRotation}
        onClose={() => setShowPinRotation(false)}
        needsSuper={pinRotationNeeds.super}
        needsDirector={pinRotationNeeds.director}
        onSaved={() => {
          setPinRotationNeeds({ super: false, director: false });
          showToast('gold', 'رموزك محمية الآن 🛡️', 'تم تغيير الرموز الافتراضية بنجاح — لا يعرفها سواك.');
          auditLogger.log({
            actorName: currentUserPhone,
            actorRole: authenticatedRole,
            action: 'SECURITY_PINS_ROTATED',
            entity: 'Security',
            details: 'تدوير الرموز الافتراضية (ماستر/مدير) عند أول تشغيل',
            severity: 'CRITICAL'
          });
        }}
      />
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
