import { useEffect, useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { mayViewInterface, ROLE_AR_LABEL } from '../services/security/roleAccess';
import { auditLogger } from '../services/audit/auditLogger';
import { UserRole } from '../types';

/**
 * requireRole(screenRole) — حارس الشاشة الإلزامي (يُستدعى في بداية كل شاشة رئيسية).
 * يتحقق synchronously أثناء أول render (بلا وميض بيانات)، فأي عدم تطابق بين
 * الواجهة المعروضة والهوية المسموح لها → شاشة رفض + تسجيل خروج فوري لصفحة الدخول.
 * يعمل كطبقة ثانية فوق حارس App: حتى لو عُبث بالحالة من الكونسول بعد الإقلاع،
 * الشاشة نفسها ترفض العرض. وضع معاينة المدير/السوبر مسموح عبر mayViewInterface.
 */
export function useRequireRole(screenRole: UserRole): boolean {
  const { currentRole, authenticatedRole, superUnlocked, currentUserPhone, logout } = useSchool();

  const [allowed] = useState<boolean>(
    () => currentRole === screenRole && mayViewInterface(authenticatedRole, superUnlocked, screenRole)
  );

  useEffect(() => {
    if (!allowed) {
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
