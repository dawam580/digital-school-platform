# تقرير المسح الشامل للبنية التحتية والواجهة الأمامية (Infrastructure & UI Survey Report)
**المشروع**: منصة المدرسة الرقمية (Digital School Platform)  
**التاريخ**: 2026-09-01  
**المستكشف**: Explorer 1 (Infra & UI)  
**حالة البناء**: ناجح (Exit Code 0, 0 TypeScript Errors)

---

## 1. ملخص البنية التقنية (Executive Summary)

تم بناء منصة المدرسة الرقمية كـ Single Page Application (SPA) حديثة وعالية الأداء بالاعتماد على حزمة التقنيات التالية:
- **إطار العمل الأساسي**: React 18.3.1 مع TypeScript 5.6.2.
- **مترجم وحازم التطبيق (Bundler/Dev Server)**: Vite 6.0.11 / Vite 6.4.3.
- **نظام التنسيق والتصميم**: Tailwind CSS 3.4.17 مع PostCSS 8.5.1 و Autoprefixer 10.4.20.
- **الطباعة والخطوط العربية (Typography)**: خطوط Google Fonts الرسمية (Cairo للأوزان 300-900، و Tajawal للأرقام والدرجات، و Be Vietnam Pro).
- **مكتبة الأيقونات**: Lucide React 0.475.0.
- **دعم الاتجاه واللغة العربية**: دعم كامل للأصل العربي (`dir="rtl"`, `lang="ar"`) على مستوى وثيقة HTML وجميع المكونات والشبكات.
- **إدارة الحالة وقاعدة البيانات المحلية**: React Context API (`SchoolContext`) مدعومة بطبقة تخزين محلية مستدامة (`localStorage`) عبر خدمة `db.ts` مع بيانات بذرية واقعية (Seed Data).
- **التفاعلية والمؤثرات**: محرك أصوات مدمج بـ Web Audio API (`soundEffects.ts`) ومحرك احتفالات بـ Canvas Confetti (`confetti.ts`).

---

## 2. حزمة التبعيات وإعدادات البناء (Dependencies & Build Configuration)

### 2.1 تحليل `package.json`

```json
{
  "name": "digital-school-platform",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.475.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.6.2",
    "vite": "^6.0.11"
  }
}
```

### 2.2 إعدادات TypeScript (`tsconfig.json`)

- **Target**: `ES2020`
- **Module**: `ESNext`
- **Module Resolution**: `bundler` (متوافق تماماً مع Vite)
- **JSX**: `react-jsx`
- **Strict Mode**: `true`
- **SkipLibCheck**: `true`
- **Include**: `["src"]`
- **نتيجة التدقيق البرمجي**: 0 أخطاء نوعية (0 TypeScript Errors).

### 2.3 إعدادات Vite (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    host: true
  }
});
```

- **المنفذ الافتراضي (Port)**: `3000`.
- **الاستضافة (Host)**: `true` (`0.0.0.0`) لدعم الوصول المحلي والشبكي.
- **أمر التشغيل**: `npm run dev` (أو `cmd.exe /c npm run dev` على بيئة Windows PowerShell المقيدة).

### 2.4 التحقق الفعلي من البناء (Build Verification)

تم تنفيذ اختبار البناء الفعلي بنجاح:
```
> tsc && vite build
✓ 1614 modules transformed.
dist/index.html                   1.09 kB │ gzip:  0.62 kB
dist/assets/logo-BdE6aVVJ.png    20.83 kB
dist/assets/index-DFK2W3cI.css   47.04 kB │ gzip:  7.92 kB
dist/assets/index-C-u1wK5u.js   318.65 kB │ gzip: 87.70 kB
✓ built in 5.36s
Exit Code: 0
```

---

## 3. نظام الواجهة والتصميم (UI & Design System)

### 3.1 إعدادات Tailwind CSS واللوحة اللونية (`tailwind.config.js`)

تم تخصيص لوحة ألوان وهوية المنصة المدرسية (`school` palette):
- **الأزرق الملكي الأساسي (Primary)**:
  - `primary`: `#004ac6` (والأزرق الداكن `#00288e` المستخدم كلون شعار وأزرار رئيسية)
  - `primary-light`: `#2563eb`
  - `primary-hover`: `#003ea8`
  - `primary-container`: `#dbe1ff`
- **الأخضر الزمردي للحضور والتميز (Secondary / Success)**:
  - `secondary`: `#006c49`
  - `secondary-light`: `#10b981`
  - `secondary-container`: `#6cf8bb`
- **الأصفر الذهبي والكهرماني للتنبيهات والأوسمة (Tertiary / Warning / Gold)**:
  - `tertiary`: `#784b00`
  - `tertiary-light`: `#f59e0b`
  - `tertiary-container`: `#ffeedd`
- **الأحمر للغياب والتنبيهات العاجلة (Error / Danger)**:
  - `error`: `#ba1a1a`
  - `error-light`: `#ef4444`
  - `error-container`: `#ffdad6`
- **الخلفيات والسطوح**:
  - `background`: `#f8f9ff`
  - `bg-soft`: `#f0f4ff`
  - `card`: `#ffffff`
  - `text-main`: `#0b1c30`
  - `text-muted`: `#434655`
  - `border-light`: `#e2e8f0`

### 3.2 الخطوط والطباعة العربية (Arabic Typography & Fonts)

تم تعريف وتضمين عائلات الخطوط في `index.html` و `tailwind.config.js`:
1. **Cairo (`font-cairo`)**: الخط الأساسي للنصوص والعناوين والأزرار.
2. **Tajawal (`font-tajawal`)**: الخط المخصص للأرقام والنسب المئوية والدرجات لضمان قراءة سريعة وأنيقة.
3. **Be Vietnam Pro**: خط داعم للنصوص الإنجليزية المدمجة.

### 3.3 وفاء الاتجاه اليميني واللغة (RTL Fidelity)

- وثيقة HTML الأساسية محددة بـ `<html lang="ar" dir="rtl">`.
- تنسيق شريط التمرير مخصص للاتجاه اليميني (`::-webkit-scrollbar`).
- كافة الجداول والقوائم والبطاقات مصممة بهوامش وتباعد متسق مع الاتجاه العربي (Right-to-Left)، مع استخدام الأيقونات المعكوسة منطقياً (مثل `ChevronLeft` للدخول و `ArrowLeft` للمتابعة).
- حقول إدخال OTP والأرقام مزودة بـ `dir="ltr"` عند الحاجة للحفاظ على تسلسل الأرقام الطبيعي.

---

## 4. هيكل المكونات والملفات (Component Architecture & Hierarchy)

### 4.1 الشجرة الكاملة للمشروع (`src/`)

```
src/
├── main.tsx                         # نقطة الدخول الرئيسية لـ React (ReactDOM.createRoot)
├── App.tsx                          # الموجه والموزع العام للصفحات وإدارة مسارات العرض
├── vite-env.d.ts                    # تصريحات الأنواع الخاصة بـ Vite
├── assets/
│   └── logo.png                     # شعار منصة المدرسة الرسمي
├── styles/
│   └── index.css                    # طبقات Tailwind وتنسيقات الـ Base والشريط والتأثيرات
├── types/
│   └── index.ts                     # تعريفات TypeScript الكاملة (Student, Class, Report, etc.)
├── services/
│   └── db.ts                        # طبقة قاعدة البيانات المحلية المستدامة (localStorage) والبيانات البذرية
├── data/
│   └── mockData.ts                  # تصدير البيانات الأولية المتوافقة
├── context/
│   └── SchoolContext.tsx            # مزود الحالة العامة (Auth, Role, Students, Notifs, Attendance, Sounds)
├── utils/
│   ├── soundEffects.ts              # محرك التوليد الصوتي Web Audio API (Tap, Chime, Fanfare, Alert)
│   └── confetti.ts                  # محرك إطلاق قصاصات الاحتفال على HTML5 Canvas
├── components/
│   ├── layout/
│   │   ├── Layout.tsx               # الحاوية العامة للشاشة (Navbar + Sidebar + Mobile Navigation)
│   │   ├── Navbar.tsx               # الشريط العلوي (شعار، بحث فوري Ctrl+K، تبديل الأدوار، تبديل الأبناء، إشعارات، صوتيات)
│   │   └── Sidebar.tsx              # القائمة الجانبية للحاسب المكتبي (6 عناصر رئيسية)
│   └── ui/
│       ├── Button.tsx               # زر متعدد الأنماط والأحجام
│       ├── Card.tsx                 # بطاقة محتوى بتأثيرات حواف وظلال
│       ├── Input.tsx                # حقل إدخال نصوص مدعم بالأيقونات وتسميات التحقق
│       ├── Badge.tsx                # شارات حالات الحضور والتنبيهات الملونة
│       ├── StatCard.tsx             # بطاقة إحصائيات مع مؤشر الاتجاه
│       ├── Modal.tsx                # نافذة حوارية منبثقة عامة مع دعم مفتاح ESC
│       ├── CommandPalette.tsx       # لوحة البحث الشامل التفاعلية (Ctrl + K)
│       ├── RadarChart.tsx           # المخطط العنكبوتي التفاعلي للكفايات (SVG Radar)
│       ├── CertificateModal.tsx     # نافذة شهادة التميز المدرسية الذهبية القابلة للطباعة
│       ├── BehaviorPointsModal.tsx  # نافذة منح نقاط التميز السلوكي (+/-) التفاعلية
│       └── AvatarPickerModal.tsx    # نافذة اختيار وتحديث الصورة الشخصية للطالب
└── pages/
    ├── auth/
    │   ├── Login.tsx                # صفحة تسجيل الدخول مع اختيار الدور (ولي أمر / معلم / إدارة)
    │   ├── ParentSignUp.tsx         # صفحة تسجيل ولي الأمر مع التحقق برمز OTP رباعي الصناديق
    │   └── LinkStudent.tsx          # صفحة ربط الطالب بالرمز الأكاديمي وعرض بطاقة الطالب
    ├── dashboard/
    │   └── AdminDashboard.tsx       # لوحة تحكم إدارة المدرسة (4 بطاقات إحصائية، رسم بياني 7 أيام، جدول الغياب)
    ├── attendance/
    │   └── AttendanceTracker.tsx    # سجل الحضور الصباحي التفاعلي (4 أزرار دائرية، تصدير CSV، تحضير جماعي)
    ├── students/
    │   └── StudentProfile.tsx       # الملف الشامل للطالب (رسم الكفايات، المواد، سجل الحضور، النقاط، عذر طبي)
    ├── reports/
    │   └── DailyReport.tsx          # التقرير اليومي التفاعلي (جدول زمني Timeline، تفاعل المواد، ملاحظة صوتية، مهام الغد)
    └── notifications/
        └── NotificationCenter.tsx   # مركز الإشعارات والتنبيهات (غياب، تأخر، خروج، تقرير، تحديد الكل كمقروء)
```

### 4.2 تسلسل تدفق البيانات ومستويات العرض (Component Render Hierarchy)

```
[index.html]
   └── [src/main.tsx]
         └── [App]
               └── [SchoolProvider (SchoolContext)]
                     ├── If not authenticated: <Login />
                     ├── If activeTab === 'parent-signup': <ParentSignUp />
                     └── If authenticated:
                           ├── <Layout>
                           │     ├── <Navbar /> (Search trigger, Sound toggle, Student Switcher, Role Switcher, Notifs Menu, Logout)
                           │     ├── <Sidebar /> (Desktop 6 items: الرئيسية، الطلاب، الحضور، التقارير، الإعلانات، الإعدادات)
                           │     ├── Active Page Content:
                           │     │     ├── 'dashboard'       -> <AdminDashboard />
                           │     │     ├── 'attendance'      -> <AttendanceTracker />
                           │     │     ├── 'student-profile' -> <StudentProfile />
                           │     │     ├── 'daily-report'    -> <DailyReport />
                           │     │     ├── 'link-student'    -> <LinkStudent />
                           │     │     └── 'notifications'   -> <NotificationCenter />
                           │     └── <MobileBottomNav /> (Fixed bottom bar on mobile screens)
                           └── <CommandPalette /> (Spotlight search modal on Ctrl+K)
```

---

## 5. تكامل إدارة الحالة وقاعدة البيانات (`SchoolContext` & `db.ts`)

1. **الاستدامة (Durability)**:
   - كافة التعديلات على الطلاب (الاسم، الحضور، نقاط السلوك، الصورة الرمزية)، الفصول، الإشعارات، والتقارير تُحفظ تلقائياً في `localStorage`.
   - مفاتيح التخزين:
     - `madrasa_db_students_v2`
     - `madrasa_db_classes_v2`
     - `madrasa_db_notifications_v2`
     - `madrasa_db_reports_v2`
2. **الاستعادة وإعادة الضبط**:
   - دالة `resetDatabase()` توفر استعادة فورية لكافة السجلات البذرية.
3. **التزامن التلقائي للإشعارات (Event-Driven Notifications)**:
   - تسجيل غياب أو حضور أو تأخر يولد فوراً إشعاراً في مركز الإشعارات وقائمة النافبار.
   - إضافة نقاط سلوك جديدة تولد إشعاراً أكاديمياً فورياً للطالب.

---

## 6. المتطلبات البيئية وملاحظات التشغيل (Runtime & Env Notes)

1. **متغيرات البيئة (`.env`)**:
   - `ANTHROPIC_BASE_URL`
   - `ANTHROPIC_API_KEY`
   - `ANTHROPIC_MODEL`
2. **تشغيل بيئة التطوير المحلية**:
   - الأمر: `npm run dev` (أو `cmd.exe /c npm run dev`).
   - المنفذ: `http://localhost:3000`.
3. **أصول الرسوميات**:
   - الأيقونة و الشعار متوفران في `public/logo.png` و `src/assets/logo.png`.
   - الصور الرمزية للطلاب من شبكة Unsplash عالية الدقة مع إمكانية رفع وتعيين صور محلية فورية عبر FileReader DataURL.

---

## 7. الخلاصة والجاهزية للمراحل القادمة

- البنية التحتية البرمجية مستقرة تماماً وجاهزة لعمليات الاختبار الوظيفي الشامل واختبارات دورة العمل الكاملة (End-to-End Testing).
- تم التحقق من سلامة الأنواع وعدم وجود أي تعارضات برمجية.
