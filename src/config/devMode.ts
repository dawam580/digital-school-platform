/**
 * DEV_MODE — بوابة أدوات العرض التجريبي (دخول فوري + بيانات معبأة + رموز معروضة).
 *
 * يعمل فقط في `vite dev`، ومستحيل تفعيله في الإنتاج:
 * سطر واحد قابل للطيّ الاستاتيكي — Vite يستبدل import.meta.env.DEV بالقيمة
 * الحرفية (true/false) أثناء البناء، فيحذف الـminifier فروع `false && ...`
 * وسلاسلها وأزرارها نهائياً من حزمة GitHub Pages (إثبات: غياب النصوص من dist).
 */
export const DEV_MODE: boolean = import.meta.env.DEV;
