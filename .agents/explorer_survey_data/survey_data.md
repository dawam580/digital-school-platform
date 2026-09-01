# تقرير المسح الشامل لطبقة البيانات والبنية التحتية للاختبار
# Comprehensive Survey Report: Data Layer & Test Infrastructure

**المستكشف**: Explorer 3 (Data Layer & Test Infrastructure)  
**المرحلة**: Stage 0 — Codebase Survey & Architectural Analysis  
**تاريخ الفحص**: 2026-09-01  
**حالة البناء**: `npm run build` ناجح بنسبة 100% (0 أخطاء TypeScript)  

---

## 1. الملخص التنفيذي (Executive Summary)

تم إجراء فحص وتحليل شامل ودقيق لطبقة إدارة وتخزين البيانات (Data Persistence Layer) والبنية التحتية للاختبارات البرمجية (Test Infrastructure) لمنصة المدرسة الرقمية.

### أهم النتائج:
1. **طبقة البيانات وإدارة الحالة**:
   - يعتمد النظام على **React Context API** (`SchoolContext.tsx`) كطبقة إدارة حالة مركزية، مدعومة بخدمة قاعدة بيانات محلية (`db.ts`) تغلف **`localStorage`** بآلية المزامنة الفورية (Synchronous LocalStorage Persistence).
   - يتم تخزين وتحميل 4 مجموعات بيانات أساسية عبر مفاتيح مهيأة بإصدارات (`*_v2`): الطلاب (`madrasa_db_students_v2`)، الفصول (`madrasa_db_classes_v2`)، الإشعارات (`madrasa_db_notifications_v2`)، والتقارير اليومية (`madrasa_db_reports_v2`).
   - ديمومة البيانات (State Durability) مدعومة بالكامل عبر إعادة تحميل الصفحة وجلسات المتصفح، مع وجود آلية بذر تلقائي (Auto Mock Seeding) عند أول تشغيل أو عند استدعاء `resetDatabase()`.

2. **عمليات CRUD والتفاعل البرمجي**:
   - عمليات قراءة وتحديث كاملة للطلاب، تسجيل الحضور الفردي والجماعي، احتساب وتحديث نقاط السلوك التنافسية (+/-)، توليد الإشعارات اللحظية، وتحديث الصور الرمزية (Avatars) بروابط أو بصيغة Base64.
   - تم اكتشاف عدم تطابق معماري موضعي في صفحة `NotificationCenter.tsx` حيث تستخدم مصفوفة حالة محلية بدلاً من استهلاك إشعارات `SchoolContext` العامة المحدثة من عمليات النظام.

3. **البنية التحتية للاختبارات (Test Infrastructure)**:
   - **الوضع الحالي**: لا توجد أي أطر اختبارات مؤتمتة مثبتة في المشروع (لا يوجد Vitest، Jest، Playwright، Cypress، أو Testing Library).
   - ملف `package.json` يخلو من سكربت `test`، ولا توجد ملفات اختبار (`*.test.ts`, `*.spec.tsx`) في شجرة الملفات البرمجية.
   - فحص جودة الكود وضمان النوع (Type Safety) يعتمد حالياً على `tsc` المدمج في `npm run build`، والذي يعمل بكفاءة عالية وبدون أي أخطاء تجميع (0 TypeScript compilation errors عبر 1614 وحدة).

---

## 2. بنية طبقة البيانات وإدارة الحالة (Data Layer Architecture)

### 2.1 المخطط الهيكلي لتدفق البيانات (Data Flow Diagram)

```
┌────────────────────────────────────────────────────────────────────────┐
│                          User Interface / Pages                        │
│  (AttendanceTracker, StudentProfile, LinkStudent, DailyReport, Navbar)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                        useSchool() │ Hook (Actions / State)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               SchoolContext.tsx (SchoolProvider Context)               │
│  - React States: students, selectedStudent, notifications, dailyReport │
│  - Dispatchers: updateAttendance, addBehaviorPoint, linkStudent, etc.  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                     db.save*()     │ Synchronous Read / Write
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        services/db.ts (Database API)                   │
│  - Methods: getStudents(), saveStudents(), getNotifications(), etc.    │
│  - Seeding: Fallback to SEED_STUDENTS, SEED_CLASSES, SEED_DAILY_REPORT │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Browser LocalStorage Engine (Persistent Storage)         │
│  - madrasa_db_students_v2                                              │
│  - madrasa_db_classes_v2                                               │
│  - madrasa_db_notifications_v2                                         │
│  - madrasa_db_reports_v2                                               │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 2.2 تفاصيل مفاتيح التخزين وهياكل البيانات (Storage Keys & Schemas)

الملف: `src/services/db.ts` (الأسطر 3–6):
```typescript
const STORAGE_KEY_STUDENTS = 'madrasa_db_students_v2';
const STORAGE_KEY_CLASSES = 'madrasa_db_classes_v2';
const STORAGE_KEY_NOTIFICATIONS = 'madrasa_db_notifications_v2';
const STORAGE_KEY_REPORTS = 'madrasa_db_reports_v2';
```

| مفتاح التخزين (Storage Key) | النوع البرمجي (TypeScript Interface) | الملف المصدري | الغرض ووصف البيانات |
|---|---|---|---|
| `madrasa_db_students_v2` | `Student[]` | `src/types/index.ts:31-78` | قائمة الطلاب، الهوية، الأرقام الأكاديمية، كود الربط، الصورة، نسب الحضور، المعدل الأكاديمي، نقاط السلوك، الكفايات، المواد والتقييمات، وسجل الحضور الزمني. |
| `madrasa_db_classes_v2` | `SchoolClass[]` | `src/types/index.ts:80-89` | بيانات الفصول المدرسية، الصفوف، أعداد الطلاب، الحاضرين، الغائبين، المتأخرين، والمشرف الإداري. |
| `madrasa_db_notifications_v2` | `NotificationItem[]` | `src/types/index.ts:91-101` | سجل التنبيهات المدرسية المباشرة (حضور، غياب، أكاديمي، عاجل) مع حالة القراءة والتوقيت. |
| `madrasa_db_reports_v2` | `DailyReportData` | `src/types/index.ts:103-124` | التقرير اليومي الشامل: الجدول الزمني للحصص (Timeline)، ملخص المواد، حالة الواجبات، تقييم النجوم، والرسالة الصوتية لرائد الفصل. |

---

### 2.3 آلية البذر التلقائي واسترجاع الحالة (Seeding & Hydration Mechanism)

في `src/context/SchoolContext.tsx` (الأسطر 58–64):
```typescript
// Persistent State Loaded from DB
const [students, setStudents] = useState<Student[]>(() => db.getStudents());
const [selectedStudent, setSelectedStudent] = useState<Student>(() => students[0] || db.getStudents()[0]);
const [classes, setClasses] = useState<SchoolClass[]>(() => db.getClasses());
const [notifications, setNotifications] = useState<NotificationItem[]>(() => db.getNotifications());
const [dailyReport, setDailyReport] = useState<DailyReportData>(() => db.getDailyReport());
```

وفي `src/services/db.ts` (الأسطر 362–427):
- عند قراءة أي كائن، يتم فحص `localStorage.getItem(KEY)`.
- في حال وجود بيانات صالحة، يتم إرجاعها بعد إجراء `JSON.parse()`.
- في حال عدم وجود بيانات (أول تشغيل للنظام) أو حدوث استثناء، يتم استدعاء دالة الحفظ المسبق بالبيانات الأولية (`SEED_STUDENTS`, `SEED_CLASSES`, `SEED_NOTIFICATIONS`, `SEED_DAILY_REPORT`) لتثبيتها في `localStorage` فورياً ثم إرجاعها.
- تتوفر دالة `db.resetAllData()` و `resetDatabase()` لإعادة ضبط النظام بالكامل للقيم الافتراضية.

---

## 3. تحليل عمليات CRUD وديمومة الكيانات (Entity CRUD Analysis)

### 3.1 كيان الطلاب (Students)
- **المعرفات والأكواد**:
  - معرف الطالب الداخلي: `id` (مثل `std-1`, `std-2`).
  - كود ربط ولي الأمر: `linkCode` (مثل `SCH-2026-R1`, `SCH-2026-S2`, `SCH-2026-O3`).
  - الرقم المدرسي: `studentNumber` (مثل `2024-0104`).
  - رقم الهوية الوطنية: `nationalId` (مثل `1098765432`).
- **عمليات القراءة (Read)**:
  - استرجاع مصفوفة الطلاب عبر `students`.
  - استرجاع الطالب النشط المختار عبر `selectedStudent`.
  - البحث الفوري والتصفية بالاسم أو الرقم في `AttendanceTracker.tsx:28-30` و `CommandPalette.tsx:30-35`.
- **عمليات الربط (Link/Create Session)**:
  - دالة `linkStudent(codeOrId)` في `SchoolContext.tsx:152-166`:
    تقارن المدخل بـ `linkCode` (تجاهل حالة الأحرف)، `studentNumber`، أو `nationalId`. عند المطابقة، تقوم بتحديث `selectedStudent` وتشغيل نغمة النجاح وإرجاع `true`.
- **عمليات التحديث (Update)**:
  - `updateStudentAvatar(studentId, avatarUrl)` في `SchoolContext.tsx:196-209`: تحدث الصورة في مصفوفة الطلاب والطالب المختار وتحفظ في `localStorage`.
  - `addBehaviorPoint(studentId, point)` في `SchoolContext.tsx:168-194`: تضيف نقطة التقييم للسجل وتعيد حساب المجموع الإجمالي بنطاق أدنى `Math.max(0, ...)` وتحفظ فورياً.
- **الحذف (Delete)**:
  - لا يتطلب النظام المدرسي حذف الطلاب أثناء التشغيل؛ يتم دعم إعادة التهيئة عبر `resetDatabase()`.

---

### 3.2 كيان الحضور والغياب (Attendance Records)
- **حالات الحضور المدعومة**:
  - `present` (حاضر 🟢)
  - `unexcused` (غائب بدون عذر 🔴)
  - `late` (متأخر 🟡)
  - `excused` (غياب بعذر طبي 🔵)
- **عملية الرصد الفردي**:
  - دالة `updateAttendance(studentId, status, note)` في `SchoolContext.tsx:104-131`:
    تستبدل أو تضيف سجل اليوم الحالي `YYYY-MM-DD` في مصفوفة `recentAttendance` وتحدث حالة الطالب الفورية، وتحفظ في `localStorage` مع تشغيل مؤثر صوتي تفاعلي.
- **عملية التحضير الجماعي (Batch Attendance)**:
  - دالة `markAllPresent()` في `SchoolContext.tsx:133-150`:
    تقوم بتحديث جميع الطلاب دفعة واحدة إلى حالة `present` وتحديث سجل اليوم وتوليد إشعار تلقائي في مركز التنبيهات وإطلاق احتفالية القصاصات الورقية (`triggerConfetti()`).
- **الأعذار الطبية (Medical Excuses)**:
  - نموذج `handleSubmitExcuse` في `StudentProfile.tsx:47-63`:
    يقوم بتحويل حالة الطالب إلى `excused` وتدوين نص العذر وتوليد إشعار فوري لولي الأمر والإدارة.
- **تصدير السجلات (CSV/Excel Export)**:
  - دالة `handleExportCsv` في `AttendanceTracker.tsx:55-65`:
    تنشئ ملف CSV بترميز UTF-8 يحوي اسم الطالب، رقمه، صفه، شعبته، حالته، وتاريخ اليوم.

---

### 3.3 كيان نقاط السلوك والتقييم (Behavior Points & Gamification)
- **الهيكل البرمجي**: `BehaviorPoint` (`id, category, title, points, icon, date, teacher`).
- **المعايير المعتمدة**:
  - **نقاط إيجابية (+)**: مشاركة صفية (+5 🌟)، إتقان الواجب (+4 📚)، العمل الجماعي (+3 🤝)، انضباط نموذجي (+3 ⭐)، إبداع فكرة (+5 💡)، نظافة الفصل (+2 🌿).
  - **مجالات تحسين (-)**: تأخر عن الحصة (-1 ⏰)، عدم إحضار الأدوات (-1 📖)، قلة تركيز (-1 💭)، تأخر تسليم الواجب (-2 📝).
- **التكامل والتأثيرات**:
  - استدعاء `addBehaviorPoint` يحدث `student.behaviorPointsTotal` فورياً.
  - تشغيل مؤثرات صوتية مناسبة (`playSuccess` أو `playAlert`) وإطلاق احتفال `triggerConfetti()`.
  - توليد إشعار أكاديمي تلقائي يظهر في شريط التنبيهات.

---

### 3.4 كيان الإشعارات (Notifications Engine)
- **الهيكل البرمجي**: `NotificationItem` (`id, title, message, date, time, category, read, targetRole, studentName`).
- **التصنيفات**: `attendance` (حضور وغياب)، `academic` (أكاديمي وتقارير)، `urgent` (عاجل)، `admin` (إداري).
- **العمليات**:
  - `addNotification()`: توليد معرف فريد بالوقت `notif-${Date.now()}` وإدراج التنبيه في قمة القائمة وحفظه.
  - `markNotificationAsRead(id)`: تعيين حالة القراءة `read: true`.
  - `markAllNotificationsAsRead()`: تعيين الكل كمقروء وتحديث العداد `unreadCount` في النافبار.
- **ملاحظة معمارية هامة**:
  - في صفحة `NotificationCenter.tsx:26-67`، تم رصد وجود مصفوفة حالة داخلية `notificationsList` منفصلة جزئياً عن `notifications` المركزية في `SchoolContext`. يوصى بربطها بالمصفوفة العامة المركزية لتوحيد الإشعارات الحية المولدة من عمليات الحضور والسلوك.

---

### 3.5 تخصيص الصورة الرمزية (Avatar Customizations)
- **الهيكل والخيارات**:
  - توفير 8 صور رمزية منتقاة بدقة للأولاد والبنات في `AvatarPickerModal.tsx:25-34`.
  - دعم رفع صورة مخصصة من جهاز المستخدم عبر عنصر `<input type="file">` وقراءتها كـ Data URL عبر `FileReader.readAsDataURL()`.
  - عند الحفظ، يتم استدعاء `updateStudentAvatar(studentId, avatarUrl)` التي تحفظ الصورة في `localStorage` وتحدث كافة مكونات الواجهة فورياً.

---

## 4. فحص البنية التحتية للاختبارات (Testing Infrastructure Survey)

### 4.1 الأدوات والمكتبات الحالية (Current Test Stack)
- **ملف `package.json`**:
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

- **الملاحظات الرئيسية**:
  1. لا يوجد أي مشغل اختبارات (No Test Runner مثل Vitest أو Jest).
  2. لا توجد مكتبات اختبار مكونات واجهة (No Testing Library مثل `@testing-library/react`).
  3. لا توجد أطر اختبارات End-to-End (No Playwright / Cypress).
  4. لا يوجد سكربت `npm test`.
  5. التغطية الحالية للاختبارات المؤتمتة (Automated Test Coverage): **0%**.

---

### 4.2 فحص التجميع والتحقق من الأنواع (Type Checking & Build Verification)

تم تنفيذ أمر البناء البرمجي:
```cmd
cmd.exe /c npm run build
```

**النتيجة**:
- مفسر TypeScript (`tsc`): اجتاز الفحص بنجاح تام بدون أي أخطاء (0 errors).
- حزمة Vite: قامت بتحويل 1614 وحدة برمجية بنجاح:
  - `dist/index.html` (1.09 kB)
  - `dist/assets/logo-BdE6aVVJ.png` (20.83 kB)
  - `dist/assets/index-DFK2W3cI.css` (47.04 kB │ gzip: 7.92 kB)
  - `dist/assets/index-C-u1wK5u.js` (318.65 kB │ gzip: 87.70 kB)
- زمن البناء: 5.33 ثوانٍ.
- رمز الخروج: `0` (Success).

---

### 4.3 خطة إنشاء البنية التحتية للاختبارات (Test Setup Blueprint)

لتحقيق متطلبات الجودة وضمان عدم حدوث انتكاسات برمجية (Zero Regressions) في المراحل القادمة، يوصى بتهيئة البنية التالية:

#### 1. الحزم المطلوبة (Required Packages):
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

#### 2. تعديل ملف `vite.config.ts` لإضافة بيئة الاختبار:
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  server: {
    port: 3000,
    open: false,
    host: true
  }
});
```

#### 3. مجالات الاختبار المقترحة (Test Suites Scope):
1. **اختبارات وحدة طبقة البيانات (`src/services/db.test.ts`)**:
   - التحقق من بذر البيانات الافتراضية عند فراغ `localStorage`.
   - اختبار حفظ واسترجاع وتعديل الطلاب والفصول والتقارير.
   - اختبار مرونة معالجة الأخطاء عند فشل `JSON.parse`.
2. **اختبارات سياق العمليات (`src/context/SchoolContext.test.tsx`)**:
   - اختبار تسجيل الدخول وتبديل الأدوار (Parent / Teacher / Admin).
   - اختبار رصد الحضور الفردي والتحضير الجماعي وتأثيرها على الحالة وسجل التواريخ.
   - اختبار ربط الطالب بالأكواد (`SCH-2026-R1`, `SCH-2026-S2`).
   - اختبار إضافة نقاط التقييم الإيجابية والسلبية وحساب المجموع بدقة.
   - اختبار إنشاء وقراءة وتحديث الإشعارات المباشرة.
3. **اختبارات تكامل المكونات (Component Integration Tests)**:
   - `AttendanceTracker.test.tsx`: تفاعل أزرار الحضور الأربعة، العدادات الإحصائية، تصدير CSV.
   - `StudentProfile.test.tsx`: التنقل بين التبويبات الخمسة، رادار الكفايات، فتح نوافذ الشهادة والنقاط.
   - `ParentSignUp.test.tsx`: إدخال رقم الهاتف، والتحقق من مربعات OTP الأربعة.
   - `CommandPalette.test.tsx`: فتح النافذة بـ `Ctrl+K`، البحث السريع، والانتقال للملف.

---

## 5. مصفوفة التحقق والمقارنة بالمتطلبات (Requirements Traceability Matrix)

| المتطلب من وثيقة `ORIGINAL_REQUEST.md` | الحالة الحالية في الكود | الموقع البرمجي | التقييم والتوصية |
|---|---|---|---|
| **R3. Persistent Database & State Integrity** | مطبق بالكامل عبر `localStorage` و `SchoolContext` | `src/services/db.ts:360-428`, `src/context/SchoolContext.tsx:58-64` | **متين ومكتمل**: يحتفظ بجميع التعديلات عبر إعادة التحميل. |
| **Attendance CRUD Persistence** | مطبق بالكامل | `src/context/SchoolContext.tsx:104-150` | **مكتمل**: يحفظ الحالة وسجل التاريخ الفوري. |
| **Behavior Points (+/-) Persistence** | مطبق بالكامل | `src/context/SchoolContext.tsx:168-194` | **مكتمل**: يحفظ النقاط والملاحظات والرموز التعبيرية. |
| **Avatar Customization Persistence** | مطبق بالكامل | `src/context/SchoolContext.tsx:196-209`, `src/components/ui/AvatarPickerModal.tsx` | **مكتمل**: يحفظ الصور الجاهزة والمرفوعة Base64. |
| **Parent OTP Registration Flow** | مطبق في الواجهة | `src/pages/auth/ParentSignUp.tsx` | **مكتمل**: 4 خانات OTP وتأكيد آلي. |
| **Student Code Linking Flow** | مطبق في الواجهة والسياق | `src/pages/auth/LinkStudent.tsx`, `src/context/SchoolContext.tsx:152-166` | **مكتمل**: يدعم `SCH-2026-R1` و `SCH-2026-S2` ويظهر البطاقة المربوطة. |
| **R4. Automated Testing & Code Quality Assurance** | البناء البرمجي `tsc` ناجح (0 errors)، تنقص أطر الاختبارات | `package.json`, `tsconfig.json` | **بحاجة لتهيئة**: إضافة `vitest` و `@testing-library/react` لضمان Zero Regressions. |

---

## 6. الخلاصة والتوصيات (Summary & Next Steps)

1. **سلامة طبقة البيانات**: تم التحقق بنجاح من أن منصة المدرسة تعتمد هيكل بيانات قوي ومتين يضمن استمرارية العمليات (CRUD) وديمومتها عبر المتصفحات.
2. **جاهزية البناء والتجميع**: المشروع يبني بنجاح تام (`code 0`) بدون أي أخطاء برمجية أو أخطاء TypeScript.
3. **أولويات المراحل القادمة**:
   - ربط صفحة `NotificationCenter.tsx` مباشرة مع سياق `notifications` في `SchoolContext`.
   - تثبيت حزم `vitest` و `@testing-library/react` وتشغيل اختبارات تكاملية مؤتمتة للمسارات السبعة الأساسية.
