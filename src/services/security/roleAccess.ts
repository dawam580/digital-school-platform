/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * مصفوفة فصل الواجهات والعرض الآمن (Interface Separation & View-Guard Matrix)
 * ----------------------------------------------------------------------------
 * القاعدة الذهبية: `currentRole` = الواجهة المعروضة، `authenticatedRole` = الهوية
 * الحقيقية. لا يُعرض أي تبويب إلا إذا سمحت هذه المصفوفة، ولا ينتقل أحد لواجهة
 * دور آخر إلا عبر القنوات المسموحة (انتحال المدير العام برمز الماستر، أو معاينة
 * مدير المدرسة لنطاقه). كل رفض يُسجَّل في سجل التدقيق عبر السياق.
 * ============================================================================
 */

import { UserRole } from '../../types';

export const ROLE_AR_LABEL: Record<UserRole, string> = {
  admin: 'مدير المدرسة',
  exams_coordinator: 'منسق الامتحانات (الكنترول)',
  teacher: 'المعلم',
  parent: 'ولي الأمر',
  counselor: 'الأخصائي الاجتماعي',
  superadmin: 'المدير العام (سوبر أدمن)',
};

/** الواجهة الرئيسية لكل دور */
export const ROLE_HOME: Record<UserRole, string> = {
  admin: 'dashboard',
  exams_coordinator: 'exams-coordinator-dashboard',
  teacher: 'teacher-quick',
  parent: 'parent-dashboard',
  counselor: 'counselor-dashboard',
  superadmin: 'superadmin-dashboard',
};

/** تبويبات عامة لا تحتاج هوية (بوابات الدخول والتعريف) */
const PUBLIC_TABS = ['landing', 'login', 'parent-signup', 'link-student', 'parent-mobile'];

/** التبويبات المسموح لكل واجهة عرضها */
const ROLE_ALLOWED_TABS: Record<UserRole, string[]> = {
  // مدير المدرسة: أقسام مؤسسته فقط (يصل لواجهات الطاقم عبر المعاينة لا عبر التبويبات)
  admin: [
    'dashboard', 'attendance', 'student-profile', 'grades', 'assignments',
    'chat', 'schedule', 'db-studio', 'daily-report', 'finance', 'staff',
    'notifications', 'link-student', 'parent-mobile',
  ],
  exams_coordinator: ['exams-coordinator-dashboard', 'notifications', 'chat'],
  teacher: ['teacher-quick', 'attendance', 'chat', 'notifications', 'student-profile', 'daily-report', 'link-student'],
  parent: ['parent-dashboard', 'parent-mobile', 'student-profile', 'daily-report', 'chat', 'link-student', 'parent-signup', 'notifications'],
  counselor: ['counselor-dashboard', 'chat', 'notifications', 'student-profile'],
  // السوبر: كل شيء — لكن فقط عندما تكون الجلسة مفتوحة برمز الماستر
  superadmin: ['*'],
};

/**
 * هل يحق لهذه الواجهة عرض هذا التبويب؟
 * @param superViewing true عندما يتصفح المدير العام (جلسة ماستر مفتوحة)
 */
export function canAccessTab(viewedRole: UserRole, tab: string, superViewing = false): boolean {
  if (!tab) return false;
  if (PUBLIC_TABS.includes(tab)) return true;
  if (viewedRole === 'superadmin') return superViewing;
  if (superViewing) return true; // المدير العام يرى كل تبويبات أي واجهة يعاينها
  const allowed = ROLE_ALLOWED_TABS[viewedRole] || [];
  if (allowed.includes('*')) return true;
  return allowed.includes(tab);
}

/**
 * هل يحق لهذه الهوية معاينة واجهة دور آخر؟ (الفصل بين الواجهات)
 * - المدير العام (جلسة ماستر مفتوحة): كل الواجهات والأقسام.
 * - مدير المدرسة: كل الواجهات ما عدا السوبر (نطاق مؤسسته).
 * - بقية الأدوار: واجهتهم فقط.
 */
export function mayViewInterface(
  authenticatedRole: UserRole,
  superUnlocked: boolean,
  targetRole: UserRole
): boolean {
  if (targetRole === authenticatedRole) return true;
  if (targetRole === 'superadmin') return authenticatedRole === 'superadmin' && superUnlocked;
  if (authenticatedRole === 'superadmin') return superUnlocked;
  if (authenticatedRole === 'admin') return true;
  return false;
}
