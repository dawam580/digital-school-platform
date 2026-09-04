# Original User Request

## Initial Request — 2026-09-01T08:41:47+03:00

منصة المدرسة الرقمية: تشغيل النظام واختبار دورة العمل الكاملة (End-to-End Verification & Live Testing) لقاعدة البيانات، تسجيل ولي الأمر، ربط الطالب، تسجيل الحضور، التقييم والتقارير، وجودة الواجهة.

Working directory: c:\Users\HP\Downloads\مدرسة
Integrity mode: development

## Requirements

### R1. Live Platform Execution & Verification
The platform must run live locally via the development server without any startup or runtime errors. All assets, fonts, icons, and styling must render cleanly with 100% Arabic RTL fidelity.

### R2. End-to-End User Journey & Functional Testing
Thoroughly test and verify all 7 core modules and user flows:
1. **Authentication & Multi-Role Switching**: Parent, Teacher, and School Admin logins.
2. **Parent Onboarding**: Registration flow with 4-digit OTP code verification.
3. **Student Linking**: Unique alphanumeric code verification and student profile card linking.
4. **Attendance Tracking**: Real-time attendance marking (present, late, unexcused, excused), batch attendance, and automatic parent notification generation.
5. **Student Dossier & Evaluation**: Behavior points gamification (+/-), competencies radar spider chart, and golden certificate generation.
6. **Interactive Daily Report**: Interactive day timeline, subject breakdown, star ratings, and teacher notes.
7. **Notification Center**: Unread indicators, category filtering, and mark all as read.

### R3. Persistent Database & State Integrity
Ensure that all CRUD operations, student attendance updates, behavior points, and custom avatar selections are reliably persisted in the local database layer across page refreshes and browser sessions.

### R4. Automated Testing & Code Quality Assurance
Run TypeScript compilation checks, bundle production build verification, and automated component integration tests to guarantee zero regressions.

## Acceptance Criteria

### Execution & Build
- [ ] `npm run build` exits with code 0 and 0 TypeScript errors.
- [ ] Development server starts cleanly and serves pages without runtime exceptions.

### Functional Verification
- [ ] Parent Sign-up with 4-box OTP verification successfully registers and redirects to Student Linking.
- [ ] Student Linking with codes (e.g. `SCH-2026-R1`, `SCH-2026-S2`) displays the student profile card with green checkmark.
- [ ] Attendance marking instantly updates UI counters, plays audio feedback, and creates corresponding notifications.
- [ ] Behavior points (+/-) update student total score and trigger celebration animations.
- [ ] Printable Certificate modal renders student name, GPA, and school seal cleanly.
- [ ] Global Command Palette (`Ctrl + K`) instantly searches and filters students and actions.
- [ ] Database persistence verified by writing changes, re-reading state, and confirming data durability.

## Follow-up — 2026-09-03T21:48:18Z

ترقية وإصلاح شامل لمنظومة المدرسة الليبية الرقمية: تصحيح قراءة وتوزيع ملفات PDF بدقة 100%، إزالة البيانات الوهمية (كأسماء الأمهات غير الموجودة في كشف الامتحانات)، اعتماد كشف مدرسة الشهيد امحمد الباعور (873 طالباً حقيقياً)، وضبط الواجهة الرئيسية بحيث تفتح فوراً على "لوحة تحكم المدير العام" عند فتح الرابط المباشر.

Working directory: c:\Users\HP\Downloads\مدرسة
Integrity mode: development

## Requirements

### R1. واجهة الدخول الافتراضية المباشرة (Direct Admin Landing)
- عند فتح الرابط المباشر للمنظومة، يجب أن تفتح الصفحة فوراً على **لوحة تحكم المدير الرئيسي (Admin Dashboard)**، بدلاً من فتح واجهة ولي الأمر أو الطالب.
- تمكين المدير من الرؤية والتحكم الفوري في: الطلاب، المعلمين، كشوفات الفصول، جداول الحصص، والحضور والغياب دون أي تعقيد.

### R2. دقة بيانات الطلاب المستخرجة من كشف الـ PDF (Data Integrity & PDF Accuracy)
- اعتماد البيانات الأصلية الواردة في وثيقة المركز الوطني للامتحانات (وزارة التربية والتعليم الليبية - مدرسة الشهيد امحمد الباعور):
  - أرقام القيد الرسمية (7 أرقام).
  - الأسماء الكاملة كما وردت في الكشف الوزاري.
  - تواريخ الميلاد الحقيقية المطابقة للوثيقة.
  - تحديد الجنس بدقة (ذكر / أنثى).
  - توزيع الفصول والشعب الدقيق (33 فصلاً من 1/1 مساء حتى 9/4 صباح).
- **اسم الأم:** نظراً لأن كشوفات المركز الوطني للامتحانات لا تتضمن خانة لاسم الأم، يجب عدم اختلاق أسماء وهمية، بل عرض علامة (—) مع إمكانية التعديل اليدوي، لتفادي أي ارتباك.

### R3. منطقية وسلاسة المنظومة وتبسيط الواجهات (Intuitive Administrative Workflow)
- واجهة إدارة واضحة وسريعة الفهم وفق الهيكل الإداري للمدارس الليبية.
- أزرار مباشرة لاستيراد وتصدير ملفات Excel و PDF مع إمكانية التصفير والحذف النظيف للبدء من جديد.
- فصل كامل بين صلاحيات المدير، المعلم، وولي الأمر.

## Acceptance Criteria

### Execution & Build
- [ ] `npm run build` exits with code 0 and 0 TypeScript errors.
- [ ] فتح الرابط المباشر يعرض فوراً لوحة تحكم المدير الرئيسي للمدرسة.

### Data & Roster Accuracy
- [ ] كشف مدرسة الباعور يضم 873 طالباً بأرقام قيدهم وتواريخ ميلادهم الحقيقية وفصولهم المعتمدة.
- [ ] عدم وجود أي أسماء أمهات وهمية أو بيانات مضللة.
- [ ] إمكانية استيراد وتصدير الكشوفات بصيغة Excel و PDF بسلاسة تامة.
