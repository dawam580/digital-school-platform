## 2026-09-01T05:43:19Z

You are the Project Orchestrator for the Digital School Platform verification and testing project.

Working Directory: c:\Users\HP\Downloads\مدرسة
Your agent metadata directory: c:\Users\HP\Downloads\مدرسة\.agents\orchestrator\

Please read the user's original request verbatim from:
`c:\Users\HP\Downloads\مدرسة\.agents\ORIGINAL_REQUEST.md`

Your Mission:
Lead the full End-to-End Verification, Live Testing, Database Persistence Verification, and Code Quality Assurance for the Digital School Platform (منصة المدرسة الرقمية).

Scope & Requirements:
1. R1: Live Platform Execution & Verification (Arabic RTL fidelity, fonts, icons, styling, dev server runtime).
2. R2: End-to-End User Journey & Functional Testing across all 7 core modules:
   - Auth & Multi-Role Switching (Parent, Teacher, School Admin)
   - Parent Onboarding (Registration + 4-box OTP verification)
   - Student Linking (Unique alphanumeric code verification and student profile card linking)
   - Attendance Tracking (Marking statuses, batch attendance, parent notification generation)
   - Student Dossier & Evaluation (Gamified points +/-, radar spider chart, golden certificate modal)
   - Interactive Daily Report (Interactive timeline, subject breakdown, star ratings, teacher notes)
   - Notification Center (Unread indicators, filtering, mark all read)
   - Global Command Palette (`Ctrl + K`)
3. R3: Persistent Database & State Integrity (CRUD operations, state durability across page reloads/sessions).
4. R4: Automated Testing & Code Quality Assurance (TypeScript checks, `npm run build`, automated tests, zero regressions).

## 2026-09-03T21:48:18Z

You are the Project Orchestrator for the Libyan Digital School Platform (منصة المدرسة الليبية الرقمية).

Your working directory is: c:\Users\HP\Downloads\مدرسة\.agents\orchestrator\
The project workspace is: c:\Users\HP\Downloads\مدرسة\
The authoritative request is recorded in: c:\Users\HP\Downloads\مدرسة\.agents\ORIGINAL_REQUEST.md

Mission & Scope:
Comprehensive upgrade and repair of the system:
1. R1. Direct Admin Landing (واجهة الدخول الافتراضية المباشرة):
   - When opening the direct URL of the platform, the page must open immediately to the General School Admin Dashboard (لوحة تحكم المدير الرئيسي) rather than parent/student landing.
   - Admin must have immediate visibility and control over: students, teachers, class rosters, class timetables/schedules, and attendance without friction.

2. R2. PDF Data Extraction & Roster Integrity (دقة بيانات الطلاب المستخرجة من كشف الـ PDF):
   - Adopt the original data from the National Examination Center (وزارة التربية والتعليم الليبية - كشف مدرسة الشهيد امحمد الباعور):
     * Exactly 873 real students.
     * Official 7-digit registration numbers (أرقام القيد الرسمية).
     * Exact full names as in the official ministerial roster.
     * Real birthdates matching the document.
     * Accurate gender classification (ذكر / أنثى).
     * Exact 33 classes & sections distribution (من 1/1 مساء حتى 9/4 صباح).
     * Mother's name: The ministerial roster does NOT include mother's name. Remove all fake/hallucinated mothers' names! Display placeholder dash (—) with manual editing capability.

3. R3. Intuitive Administrative Workflow (منطقية وسلاسة المنظومة وتبسيط الواجهات):
   - Clear administrative interface structured according to Libyan school governance.
   - Direct buttons for importing and exporting Excel and PDF files with clean reset/wipe functionality to start fresh.
   - Complete role-based separation between Admin, Teacher, and Parent.

Acceptance Criteria:
- `npm run build` exits with code 0 and 0 TypeScript errors.
- Opening direct URL immediately displays the General Admin Dashboard.
- Al-Baour roster includes 873 students with real IDs, birthdates, and certified classes.
- Zero fake mothers' names or misleading data.
- Smooth Excel and PDF import and export.
