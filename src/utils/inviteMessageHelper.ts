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
  const examsCoordinatorLink = getRoleLink('exams_coordinator');
  const counselorLink = getRoleLink('counselor');
  const superAdminLink = getRoleLink('superadmin');
  const teacherLink = getRoleLink('teacher');
  const parentLink = getRoleLink('parent');

  return `السلام عليكم ورحمة الله وبركاته،

تحية طيبة وبعد،
حضرة ${director} المحترم،
إدارة ${school}

يسرنا دعوتكم للاطلاع وتجربة «منصة المدرسة الرقمية» المحدثة والمعتمدة وفق لوائح وزارة التربية والتعليم والمركز الوطني للامتحانات بدولة ليبيا (اللائحة 1013 لسنة 2022م والقرار 560 لسنة 2024م).

لقد تم إعداد المنظومة بروابط منفصلة ومخصصة بالكامل لكل دور رسمي لتجربتها واختبارها بكل سهولة ودون أي تشتيت:

━━━━━━━━━━━━━━━━━━━━
🏛️ 1. رابط مدير المدرسة (لوحة التحكم العامة للمدير):
🔗 ${adminLink}
• رقم الهاتف للتجربة: ${phone}
• كلمة المرور: ${pwd}
(إدارة كشف الطلاب، الفصول، الحضور، الإشراف العام، واعتماد أعمال اللجان).

━━━━━━━━━━━━━━━━━━━━
📜 2. رابط منسق الامتحانات والتقويم ورئيس الكنترول (بوابة مستقلة):
🔗 ${examsCoordinatorLink}
(شيت درجات الكنترول المعتمد بمجموع 1120 درجة، توزيع أرقام الجلوس، رصد أعمال السنة والامتحانات التحريرية، قفل الشيت واعتماد النتائج، وطباعة بطاقات الدرجات الفردية والجماعية A4).

━━━━━━━━━━━━━━━━━━━━
🤝 3. رابط الأخصائي الاجتماعي والنفسي:
🔗 ${counselorLink}
(متابعة الحالات السلوكية، الغياب المتكرر، الدعم الاجتماعي، وإرسال الملاحظات التوجيهية لأولياء الأمور).

━━━━━━━━━━━━━━━━━━━━
👨‍🏫 4. رابط بوابة المعلم (رصد الدرجات والجداول):
🔗 ${teacherLink}
• رمز المعلم للتجربة: LIB-MATH-01
(رصد درجات الفترات والتقييم المستمر، تحضير الحصص، ومتابعة الجدول الأسبوعي).

━━━━━━━━━━━━━━━━━━━━
🌐 5. رابط المدير العام والسوبر أدمن (مراقبة التعليم):
🔗 ${superAdminLink}
(لوحة الإشراف المركزي: إضافة وتفعيل المدارس، ومتابعة التقارير المجمعة على مستوى المراقبة).

━━━━━━━━━━━━━━━━━━━━
👨‍👩‍👧 6. رابط بوابة ولي الأمر (معزول وآمن 100%):
🔗 ${parentLink}
(متابعة درجات وبطاقات الأبناء فقط، الحضور والغياب اليومي، والتواصل مع المدرسة دون صلاحيات إدارية).
━━━━━━━━━━━━━━━━━━━━

✨ أبرز مزايا المنظومة المطابقة للتعليم الليبي:
✓ استيراد كشوفات الـ PDF بالذكاء الاصطناعي (OpenAI) بدقة متناهية مع تصحيح الأسماء وحفظ أرقام القيد والأرقام الوطنية.
✓ بناء وتوزيع الجداول المدرسية آلياً (6 حصص يومياً بمعدل 45 دقيقة للحصة) بدون أي تعارض في الحصص.
✓ نظام كنترول متكامل مطابق للائحة المركز الوطني للامتحانات (1120 درجة للتعليم الأساسي).
✓ عزل أمني وصلاحيات صارمة لكل دور لمنع أي تشتيت أو تداخل في المسؤوليات.

نتشرف بملاحظاتكم وتجربتكم الكريمة لتطوير الإدارة المدرسية الرقمية.
وتفضلوا بقبول فائق التقدير والاحترام.`;
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
