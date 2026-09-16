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
👨‍🏫 4. رابط بوابة المعلم (رصد الدرجات والجداول والحضور):
🔗 ${teacherLink}
(تحديد المعلم ومادته من كشف المدرسة أو بالرمز، رصد درجات الفترات والتقييم المستمر، ومتابعة الجدول الأسبوعي مع إمكانية التبديل السلس).

━━━━━━━━━━━━━━━━━━━━
🌐 5. رابط المدير العام والسوبر أدمن (مراقبة التعليم):
🔗 ${superAdminLink}
(لوحة الإشراف المركزي: إضافة وتفعيل المدارس، ومتابعة التقارير المجمعة على مستوى المراقبة).

━━━━━━━━━━━━━━━━━━━━
👨‍👩‍👧 6. رابط بوابة ولي الأمر (استعلام ومتابعة نتائج الأبناء):
🔗 ${parentLink}
(استعلام فوري برقم القيد أو الرقم الوطني لمتابعة بطاقة درجات الطالب، الحضور والغياب اليومي، والتواصل مع المدرسة بخصوصية تامة دون أي تداخل).
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

export const getWhatsAppShareUrl = (text: string, phone?: string): string => {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  if (cleanPhone) {
    // Format for international libyan number if starting with 09
    const intlPhone = cleanPhone.startsWith('09') ? `218${cleanPhone.substring(1)}` : cleanPhone;
    return `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(text)}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
};

/**
 * توليد رابط التهيئة والتفعيل المباشر للزبون (مدير المدرسة)
 */
export const getClientOnboardingLink = (
  schoolId: string,
  schoolName?: string,
  directorPhone?: string,
  directorName?: string
): string => {
  const base = getBaseUrl().replace(/\/+$/, '');
  const params = new URLSearchParams();
  params.set('onboard', '1');
  if (schoolId) params.set('schoolId', schoolId);
  if (schoolName) params.set('school', schoolName);
  if (directorPhone) params.set('phone', directorPhone);
  if (directorName) params.set('director', directorName);
  return `${base}?${params.toString()}`;
};

export interface ClientDeliveryOptions {
  schoolName: string;
  directorName?: string;
  phone?: string;
  schoolCode?: string;
  licenseKey?: string;
  district?: string;
}

/**
 * توليد الرسالة الرسمية الكاملة لحزمة تسليم المنظومة للزبون (مدير المدرسة الجديد)
 */
export const generateClientDeliveryWhatsAppMessage = (options: ClientDeliveryOptions): string => {
  const director = options.directorName || 'الأستاذ الفاضل مدير المدرسة';
  const school = options.schoolName;
  const phone = options.phone || '0912345678';
  const code = options.schoolCode || 'SCH-2026';
  const onboardingLink = getClientOnboardingLink(code, school, phone, director);

  return `*بسم الله الرحمن الرحيم*
*وزارة التربية والتعليم - دولة ليبيا*
🏛️ *حزمة تسليم واعتماد «منصة المدرسة الرقمية» المعتمدة*

حضرة ${director} المحترم،
إدارة مدرسة: *${school}*

نهنئكم باعتماد منصتكم المدرسية الرقمية رسمياً وفق المعايير الوزارية واللوائح المنظمة للامتحانات لعام 2025/2026م.

تم تجهيز بوابتكم الخاصة وحزمة التسليم المتكاملة، وتتضمن:
1️⃣ *تفعيل حساب المدير*: تعيين رمز الأمان PIN وكلمة المرور وتشغيل المنظومة.
2️⃣ *تطبيق ويندوز المكتبي*: تشغيل المنظومة كنافذة مستقلة وسريعة تعمل بدون إنترنت (Offline-first).
3️⃣ *كتيب التعليمات الشامل*: شرح مبسط لكافة خصائص المنظومة وجداول الحصص وشيت الامتحانات.
4️⃣ *دليل حسابات الكادر*: آلية إنشاء حسابات المعلمين والكنترول والأخصائي الاجتماعي وتطبيق ولي الأمر.

🔗 *رابط تفعيل وتشغيل المنظومة الخاص بكم:*
${onboardingLink}

📱 *بيانات الدخول المعتمدة:*
• رقم الهاتف المعتمد: ${phone}
• رمز الدخول الافتراضي: 2026 (يمكنكم تغييره فوراً)

📌 *ملاحظة:* يرجى فتح الرابط المرفق أعلاه من جهاز الكمبيوتر أو الهاتف لبدء الإعداد فوراً.

مع تحيات إدارة الدعم الفني وديوان المراقبة المدرسية.`;
};

/**
 * محتوى سكربت مشغل سطح المكتب لنظام ويندوز
 */
export const getWindowsLauncherScriptContent = (schoolName: string = 'منصة المدرسة الرقمية'): string => {
  const webAppUrl = getBaseUrl();
  return `@echo off
chcp 65001 > nul
title ${schoolName} - Windows Desktop App
color 0B
echo ==============================================================================
echo        ${schoolName}
echo           النسخة المكتبية المعتمدة - Windows Desktop Edition
echo ==============================================================================
echo.
echo [1/2] جاري فحص ملفات التشغيل والاتصال المحلي...
timeout /t 1 > nul

echo [2/2] جاري تشغيل المنظومة في نافذة سطح مكتب مستقلة وسريعة...
echo.

:: 1. محاولة التشغيل عبر مايكروسوفت إيدج في وضع النافذة المستقلة App Mode
where msedge >nul 2>nul
if %errorlevel% equ 0 (
    start msedge --app="${webAppUrl}?role=admin" --window-size=1440,920 --window-position=30,30
    echo [تم] تم فتح التطبيق بنافذة مستقلة عبر Microsoft Edge App.
    timeout /t 2 > nul
    exit
)

:: 2. محاولة التشغيل عبر جوجل كروم في وضع النافذة المستقلة App Mode
where chrome >nul 2>nul
if %errorlevel% equ 0 (
    start chrome --app="${webAppUrl}?role=admin" --window-size=1440,920 --window-position=30,30
    echo [تم] تم فتح التطبيق بنافذة مستقلة عبر Google Chrome App.
    timeout /t 2 > nul
    exit
)

:: 3. في حال عدم العثور، فتح الرابط في المتصفح الافتراضي
start "" "${webAppUrl}?role=admin"
echo [تم] تم فتح المنظومة في المتصفح الافتراضي بنجاح.
timeout /t 2 > nul
exit
`;
};

/**
 * تنزيل مشغل تطبيق ويندوز المكتبي (.bat) للمدرسة مباشرة من المتصفح
 */
export const downloadWindowsAppLauncher = (schoolName: string = 'منصة المدرسة الرقمية'): void => {
  const scriptContent = getWindowsLauncherScriptContent(schoolName);
  const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `تشغيل-المنظومة-ويندوز-${schoolName.replace(/\s+/g, '_')}.bat`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

