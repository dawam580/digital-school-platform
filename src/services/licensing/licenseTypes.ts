/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * نماذج وبيانات طبقة التراخيص والاشتراكات السحابية (Licensing & Subscriptions)
 * ============================================================================
 */

export type SubscriptionStatus = 'trial' | 'active' | 'suspended' | 'expired' | 'grace_expired';

export interface SchoolLicenseDoc {
  license_key: string;              // المعرف الفريد للمدرسة (مثال: SCH-2026-LIC-XXXX)
  school_name: string;              // اسم المدرسة الرسمي
  subscription_status: SubscriptionStatus; // حالة الاشتراك
  trial_ends_at: string;            // تاريخ انتهاء الفترة التجريبية (ISO 8601)
  subscription_ends_at?: string;    // تاريخ انتهاء الاشتراك السنوي/الشهري (اختياري)
  created_at: string;               // تاريخ إنشاء الترخيص
  admin_phone?: string;             // رقم هاتف المدير المسؤول للتواصل
  notes?: string;                   // ملاحظات أو المدينة
  last_verified_at?: string;        // آخر توقيت تم فيه التحقق بنجاح
  offline_grace_allowed_days?: number; // عدد أيام السماح بدون إنترنت (افتراضياً 7 أيام)
}
export interface LicenseVerificationResult {
  isValid: boolean;                 // هل الترخيص يسمح بالعمل؟
  status: SubscriptionStatus;       // الحالة الفعلية
  schoolName: string;
  licenseKey: string;
  daysRemaining: number;            // الأيام المتبقية في التجربة أو الاشتراك
  isOfflineGrace: boolean;          // هل يعمل بالاعتماد على مهلة الـ 7 أيام بدون نت؟
  offlineDaysRemaining?: number;    // كم يوم متبقي في مهلة الـ 7 أيام
  errorMessage?: string;
  licenseDoc?: SchoolLicenseDoc;
}

/** طلب تجديد اشتراك ترسله المدرسة للمدير العام (حلقة التجديد المغلقة) */
export type RenewalStatus = 'pending' | 'approved' | 'rejected';

export interface RenewalRequest {
  id: string;                       // REQ-<timestamp>-<rand>
  license_key: string;
  school_name: string;
  admin_phone: string;
  message?: string;
  status: RenewalStatus;
  created_at: string;               // ISO
  resolved_at?: string;             // ISO
}
