/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * مساعد رسائل الدعوة والروابط المنفصلة للأدوار (مدير • سوبر أدمن • معلم • ولي أمر)
 * Role Links & School Director Invitation Message Generator
 * ============================================================================
 */

import { UserRole } from '../types';

export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${window.location.pathname}`;
  }
  return 'https://dawam580.github.io/digital-school-platform/';
};

export const getRoleLink = (role: UserRole): string => {
  const base = getBaseUrl().replace(/\/+$/, '');
  return `${base}?role=${role}`;
};

export interface InviteMessageOptions {
  directorName?: string;
  schoolName?: string;
  phone?: string;
  password?: string;
}

export const generateDirectorInviteMessage = (options?: InviteMessageOptions): string => {
  const director = options?.directorName || 'الأستاذ الفاضل مدير المدرسة';
  const school = options?.schoolName || 'مدرسة الشهيد امحمد الباعور للتعليم الأساسي';
  const phone = options?.phone || '0922465676';
  const pwd = options?.password || '123456';

  const adminLink = getRoleLink('admin');
  const superAdminLink = getRoleLink('superadmin');
  const teacherLink = getRoleLink('teacher');
  const parentLink = getRoleLink('parent');

  return `السلام عليكم ورحمة الله وبركاته،

تحية طيبة وبعد،
حضرة ${director} المحترم،
إدارة ${school}

يسرنا دعوتكم للاطلاع وتجربة «منصة المدرسة الرقمية» المحدثة والمعتمدة وفق لوائح وزارة التربية والتعليم والمركز الوطني للامتحانات بدولة ليبيا.

لقد تم إعداد المنظومة بروابط منفصلة ومخصصة بالكامل لكل فئة لتجربتها واختبارها بكل سهولة:

━━━━━━━━━━━━━━━━━━━━
🏛️ 1. رابط مدير المدرسة (لوحة التحكم الكاملة):
🔗 ${adminLink}
• رقم الهاتف للتجربة: ${phone}
• كلمة المرور: ${pwd}
(تتيح إدارة كشف الطلاب، الفصول، الحضور، اعتماد شيتات الكنترول، ونصاب حصص المعلمين).

━━━━━━━━━━━━━━━━━━━━
🌐 2. رابط المدير العام والسوبر أدمن (كافة المدارس):
🔗 ${superAdminLink}
(لوحة مراقبة التعليم: إضافة مدارس جديدة، متابعة إحصائيات المدارس، وتصدير التقارير المركزية).

━━━━━━━━━━━━━━━━━━━━
👨‍🏫 3. رابط بوابة المعلم (رصد الدرجات والجداول):
🔗 ${teacherLink}
• رمز المعلم للتجربة: LIB-MATH-01
(رصد درجات أعمال السنة والامتحانات، متابعة الحصص، وإرسال طلب الاعتماد للإدارة).

━━━━━━━━━━━━━━━━━━━━
👨‍👩‍👧 4. رابط بوابة ولي الأمر (معزول وآمن):
🔗 ${parentLink}
(متابعة الأبناء فقط، الحضور اليومي، البطاقة المدرسية، والتواصل مع المعلمين).
━━━━━━━━━━━━━━━━━━━━

✨ أبرز مزايا المنظومة:
✓ استيراد كشوفات الـ PDF والإكسل بالذكاء الاصطناعي مع حفظ أرقام القيد وتواريخ الميلاد بدقة 100%.
✓ بناء الجداول المدرسية بالذكاء الاصطناعي بدون أي تعارض في الحصص أو القاعات.
✓ نظام اعتماد إلكتروني رسمي للامتحانات وطباعة بطاقات الدرجات والشهادات A4.
✓ عزل أمني صارم يمنع وصول ولي الأمر أو الطالب لأي صلاحيات إدارية.

نتشرف بملاحظاتكم وتجربتكم القيمة لتطوير التعليم الرقمي المدرسي.
وتفضلوا بقبول فائق الاحترام والتقدير.`;
};

export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

export const getWhatsAppShareUrl = (text: string): string => {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
};
