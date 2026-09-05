# نظام التصميم والهوية البصرية | Digital School Platform Design System (DSP-DS)

> **المعايير المعتمدة**: [21st.dev](https://21st.dev/) • [DESIGN.md](https://design.md/) • [Refero Styles](https://refero.design/) • [Motion.dev](https://motion.dev/) • [SupaHero](https://supahero.io/)

هذا المستند هو المرجع المعماري والتصميمي الشامل لمنظومة المدرسة الرقمية (ليبيا)، ويلتزم به مهندسو ومصممو الواجهات (Senior Frontend Architects & UI/UX Designers) عند بناء، تدشين، أو ترقية أي صفحة أو مكوّن تفاعلي.

---

## 1. فلسفة التصميم (Design Philosophy & Core Principles)

1. **الوقار المؤسسي والوضوح العالي (Institutional Elegance & High Clarity)**:
   - واجهات تحاكي أفضل المعايير العالمية مع مراعاة الطبيعة المؤسسية لوزارة التربية والتعليم والمدارس الليبية.
   - البعد التام عن القوالب الجاهزة الرديئة أو تصاميم "البوتستراب" القديمة.
   - واجهات مريحة للمدراء والمعلمين من كبار السن عبر تباين ألوان صريح وأزرار لمسية رحبة (`min-h-[44px]`).

2. **عزل الصلاحيات وحفظ الخصوصية (Role-Driven Modular Workspaces)**:
   - لكل دور لونه المميز (Color Accent) وهوامشه الخاصة لكي يعلم المستخدم فوراً في أي بوابة يتواجد.
   - أسطح زجاجية خفيفة (`glassy surfaces`) مع حواف ناعمة شبه شفافة تعطي عمقاً بصرياً فائق الحداثة.

3. **حركة سلسة بلا انقطاع (Buttery 60fps Motion)**:
   - استبعاد التحولات الفجائية والقفزات غير المريحة.
   - الاعتماد على منحنيات حركة فيزيائية (Physics-based Spring Easing) واقتصار التحريك على `transform` و `opacity`.

---

## 2. مصفوفة الرموز التصميمية (Design Tokens System)

### أ. لوحة الألوان الأساسية ودلالات الأدوار (Color Tokens & Role Accents)

| الرمز التصميمي | القيمة اللونية (Light / Dark) | الاستخدام المعتمد | المعيار الإرشادي |
| :--- | :--- | :--- | :--- |
| **`neutral-base`** | `#ffffff` / `#090d16` | خلفية التطبيق العامة وأسطح الحاويات الأساسية | تباين WCAG AA |
| **`neutral-surface`**| `#f8fafc` / `#0f172a` | البطاقات والحاويات الداخلية الثانوية | نعومة بصرية |
| **`neutral-border`** | `rgba(226, 232, 240, 0.8)` / `rgba(30, 41, 59, 0.8)` | الحواف الرقيقة الفاصلة للمكونات | سمك 1px ناعم |
| **`accent-admin`** | `#7e22ce` (Purple 700) / `#a855f7` | بوابة مدير المدرسة والإشراف العام | هيبة إدارية |
| **`accent-exams`** | `#d97706` (Amber 600) / `#f59e0b` | بوابة منسق الامتحانات ورئيس الكنترول | شيت الكنترول (1120) |
| **`accent-teacher`**| `#059669` (Emerald 600) / `#10b981` | بوابة المعلم (الرصد السريع والحضور) | إنجاز وحيوية |
| **`accent-counselor`**| `#e11d48` (Rose 600) / `#fb7185` | بوابة الأخصائي الاجتماعي والحالات | إنساني واجتماعي |
| **`accent-super`** | `#1d4ed8` (Blue 700) / `#3b82f6` | بوابة مراقبة التعليم والمدير العام | مركزي قيادي |
| **`accent-parent`** | `#0d9488` (Teal 600) / `#14b8a6` | بوابة أولياء الأمور والطلاب | أمان ومتابعة |

### ب. السطح الزجاجي الخفيف (Glassmorphism Surface Layer)
```css
/* الأسطح الزجاجية المعتمدة للحاويات والنوافذ المنبثقة والقوائم العلوية */
.surface-glass {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.dark .surface-glass {
  background-color: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(51, 65, 85, 0.6);
}
```

### ج. السلم الطباعي العربي (Typographic Hierarchy)
- **عائلة الخط المعتمدة**: خط **Cairo** للعناوين والواجهات، مع **Tajawal** للنصوص الطويلة، وخط **Monospace** للأرقام الوطنية الليبية وأرقام القيد.

| المستوى | الفئة في Tailwind | الحجم / ارتفاع السطر | الوزن | مثال الاستخدام |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `text-3xl sm:text-4xl` | 36px - 44px / 1.2 | `font-black` (900) | ترويسة البوابات واللوحات الرئيسية |
| **Heading 1** | `text-2xl sm:text-3xl` | 24px - 30px / 1.25 | `font-extrabold` (800)| عناوين الأقسام الكبرى والإحصائيات |
| **Heading 2** | `text-xl sm:text-2xl` | 20px - 24px / 1.3 | `font-bold` (700) | عناوين الجداول ونوافذ الحوار |
| **Heading 3** | `text-base sm:text-lg` | 16px - 18px / 1.4 | `font-bold` (700) | عناوين بطاقات المهام والخطوات |
| **Body Large** | `text-base` | 16px / 1.6 | `font-medium` (500) | نصوص إرشادية ورسائل للمدراء |
| **Body Default**| `text-sm` | 14px / 1.55 | `font-semibold` (600)| بيانات الجداول وحقول الإدخال |
| **Caption/Tag** | `text-xs` | 12px / 1.5 | `font-bold` (700) | الشارات، التقديرات، وأرقام الفصول |
| **Mono Code** | `font-mono text-xs sm:text-sm` | 12px - 14px / 1.4 | `font-bold` (700) | الرقم الوطني (12 خانة)، رمز المعلم |

### د. شبكة التباعد ومقياس 4px/8px الموحد (Spacing Scale)
- لا تُستخدم قيم عشوائية أبداً؛ جميع الهوامش والمسافات تتبع مضاعفات 4px و 8px:
  - `p-1` (4px)، `p-2` (8px)، `p-3` (12px)، `p-4` (16px)، `p-5` (20px)، `p-6` (24px)، `p-8` (32px)، `p-10` (40px).
- **انحناء الحواف (Border Radii)**:
  - حقول الإدخال والأزرار الصغيرة: `rounded-xl` (12px).
  - الأزرار الرئيسية والبطاقات: `rounded-2xl` (16px).
  - الحاويات الكبرى والنوافذ المنبثقة: `rounded-3xl` (24px).

---

## 3. منحنيات الحركة وتجربة 60fps (Motion.dev Physics & Interaction Curves)

### أ. توقيتات ومنحنيات الحركة المعتمدة
- **Snappy Spring (للانتقالات الفورية والنوافذ والقوائم)**:
  ```css
  cubic-bezier(0.16, 1, 0.3, 1) /* 300ms إلى 400ms */
  ```
- **Soft Elastic (للشارات والتأكيدات والاحتفالات)**:
  ```css
  cubic-bezier(0.34, 1.56, 0.64, 1) /* 450ms */
  ```

### ب. الميكرو-تفاعلات واللمسية (Delighters & Micro-Interactions)
1. **استجابة الضغط الفوري للأزرار (Tactile Feedback)**:
   - كل زر تفاعلي يجب أن يتضمن: `transition-all duration-200 active:scale-[0.97]`.
2. **صعود البطاقات عند التحويم (Hover Elevation)**:
   - `hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200`.
3. **التعزيز الصوتي والاحتفالي**:
   - تشغيل صوت النقر الهادئ `sound.playTap()` عند التنقل.
   - تشغيل صوت النجاح `sound.playSuccess()` عند حفظ الدرجات أو تسجيل الحضور.
   - إطلاق شلال الزينة `triggerConfetti()` مع نغمة `sound.playFanfare()` عند اعتماد شيت الكنترول أو التفوق.

---

## 4. معمارية المكونات (Component Scaffolding & Composition Standards)

### أ. الأزرار الهرمية (Button Hierarchy)
1. **الزر الأساسي المشع (Primary Glow Button)**:
   - لون البوابة + ظل خفيف ناعم + نص عريض + تفاعل ضغط.
   - مثال: `bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl shadow-md active:scale-95`.
2. **الزر الزجاجي الثانوي (Secondary Glass Button)**:
   - سطح شفاف زجاجي مع حافة رقيقة: `bg-white/80 dark:bg-slate-800/80 border border-slate-200 hover:bg-slate-100 text-slate-800`.
3. **زر الحذف والخطر المسبوق بالتأكيد (Destructive Action)**:
   - خلفية وردية خفيفة مع نص نبيذي عريض وتأكيد قبل التنفيذ.

### ب. الجداول عالية الكثافة وعزل التصادم (High-Density Resilient Tables)
- كل جدول بيانات (شيت الكنترول، كشف 873 طالباً، سجل المعلمين) يجب أن يُغلّف داخل حاوية:
  ```tsx
  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-right text-xs min-w-[850px] whitespace-nowrap">
        {/* Table Content */}
      </table>
    </div>
  </div>
  ```
- **القاعدة الذهبية**: منع التفاف النصوص (`whitespace-nowrap`) وتثبيت عرض أدنى للجدول (`min-w-[850px]` أو أكثر) لمنع تداخل الأعمدة نهائياً عند تصغير الشاشات.

### ج. النوافذ المنبثقة وحل مشكلة قص الشاشة (Resilient Modal Overlays)
- **ممنوع نهائياً** استخدام `items-center` في غلاف النافذة المنبثقة إذا كان محتواها يمكن أن يتجاوز ارتفاع الشاشة.
- **القالب الإلزامي للنوافذ**:
  ```tsx
  <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/80 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start font-cairo">
    <div className="relative w-full max-w-3xl my-6 sm:my-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in fade-in">
      {/* Modal Header (Always visible) */}
      {/* Modal Scrollable Body */}
      {/* Modal Pinned Actions Footer */}
    </div>
  </div>
  ```

---

## 5. مصفوفة التحقق وضمان الجودة (UI/UX Acceptance Checklist)

قبل اعتماد أي مكوّن جديد في المشروع:
- [ ] هل يحترم المكون شبكة التباعد الموحدة (مضاعفات 4px/8px)؟
- [ ] هل تم تطبيق خاصية `active:scale-95` أو `active:scale-[0.98]` لرد الفعل اللمسي؟
- [ ] هل نصوص الأعمدة محمية من التصادم والتداخل (`whitespace-nowrap`)؟
- [ ] هل الألوان متوافقة مع معايير التباين وسهلة القراءة لكبار السن؟
- [ ] هل تم فحص المكون على الهاتف (375px)، التابلت (768px)، والشاشات الكبيرة (1440px)؟
- [ ] هل التحريكات تدور بمعدل 60fps دون التسبب في إعادة رسم تخطيط الصفحة (Layout Shifts / CLS = 0)؟
