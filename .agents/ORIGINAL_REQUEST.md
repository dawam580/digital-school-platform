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
