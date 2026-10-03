import { useEffect, useRef, useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { mayViewInterface, ROLE_AR_LABEL, ADMIN_SUPERVISED_ROLES } from '../services/security/roleAccess';
import { auditLogger } from '../services/audit/auditLogger';
import { UserRole } from '../types';

/**
 * requireRole(screenRole) — حارس الشاشة الإلزامي (يُستدعى في بداية كل شاشة رئيسية).
 * يتحقق synchronously أثناء أول render (بلا وميض بيانات)، فأي عدم تطابق بين
 * الواجهة المعروضة والهوية المسموح لها → شاشة رفض + تسجيل خروج فوري لصفحة الدخول.
 * يعمل كطبقة ثانية فوق حارس App: حتى لو عُبث بالحالة من الكونسول بعد الإقلاع،
 * الشاشة نفسها ترفض العرض. وضع معاينة المدير/السوبر مسموح عبر mayViewInterface.
 */
export function useRequireRole(screenRole: UserRole, options: { allowGuest?: boolean } = {}): boolean {
  const { currentRole, authenticatedRole, superUnlocked, currentUserPhone, logout, isAuthenticated } = useSchool();

  // allowGuest: شاشة بوابة عامة (تطبيق ولي الأمر) — من ليس بجلسة ولي أمر يرى نموذج الدخول فقط،
  // والشاشة نفسها تحجب أي بيانات خارج جلسة ولي الأمر.
  const [allowed] = useState<boolean>(
    () => (options.allowGuest && (!isAuthenticated || authenticatedRole !== 'parent')) ||
      (currentRole === screenRole && mayViewInterface(authenticatedRole, superUnlocked, screenRole)) ||
      // مدير المدرسة يفتح لوحات كادره من تبويباته (الأخصائي، المعلم السريع) دون تبديل الواجهة
      (currentRole === 'admin' && authenticatedRole === 'admin' && ADMIN_SUPERVISED_ROLES.includes(screenRole))
  );

  // يُطلق الرفض مرة واحدة فقط لكل mount — منع أي حلقة setState/تجميد للتبويب
  const fired = useRef(false);

  useEffect(() => {
    if (!allowed && !fired.current) {
      fired.current = true;
      auditLogger.log({
        actorName: currentUserPhone,
        actorRole: authenticatedRole,
        action: 'SCREEN_ACCESS_DENIED',
        entity: 'Security',
        details: `رفض عرض شاشة (${ROLE_AR_LABEL[screenRole]}) — العرض: (${currentRole}) والهوية: (${authenticatedRole})`,
        severity: 'WARN'
      });
      logout();
    }
  }, [allowed, authenticatedRole, currentRole, currentUserPhone, logout, screenRole]);

  return allowed;
}
