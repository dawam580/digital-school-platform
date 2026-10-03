/**
 * بيانات تواصل المورّد (صاحب المنظومة) — مكان واحد يُعدَّل قبل البيع.
 * تظهر في شاشات التفعيل والتجديد والأسعار وزر واتساب المبيعات.
 */
export const VENDOR_PHONE = '0922465676';

/** الرقم بالصيغة الدولية لروابط واتساب (بدون + أو 00) */
export const VENDOR_WHATSAPP = `218${VENDOR_PHONE.replace(/^0/, '')}`;

export const vendorWhatsAppLink = (text: string) => `https://wa.me/${VENDOR_WHATSAPP}?text=${encodeURIComponent(text)}`;

/** سعر الاشتراك السنوي للمدرسة (دينار ليبي) — يظهر في الأسعار وشاشة التجديد */
export const ANNUAL_PRICE_LYD = 2000;
export const ANNUAL_PRICE_LABEL = ANNUAL_PRICE_LYD.toLocaleString('en-US');

/**
 * عنوان خادم تطبيق ولي الأمر الذي يشغّله المورّد (مثال: https://parents.example.ly).
 * يُضبط وقت البناء: VITE_PARENT_RELAY_URL=https://... npm run build
 * ويمكن للمدرسة تعديله من «تطبيق أولياء الأمور» في لوحة المدير.
 */
export const PARENT_RELAY_URL: string = (import.meta.env?.VITE_PARENT_RELAY_URL as string | undefined) || '';
