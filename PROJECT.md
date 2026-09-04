# Project: Digital School Platform (منصة المدرسة الرقمية)

## Architecture
- **Framework & Runtime**: React 18 (TypeScript), Vite 6, Tailwind CSS 3, Lucide React icons.
- **Language & Directionality**: 100% Arabic RTL (`dir="rtl"`, Google Fonts `Cairo` & `Tajawal`).
- **State & Persistence**: React Context API (`SchoolContext.tsx`) + synchronous `localStorage` layer (`db.ts`) with 4 versioned keys (`madrasa_db_students_v2`, `madrasa_db_classes_v2`, `madrasa_db_notifications_v2`, `madrasa_db_reports_v2`) and deep-copy seed immutability.
- **Interactive Engines**: Web Audio API synthesizer (`soundEffects.ts`), Canvas Confetti generator (`confetti.ts`), pure SVG Radar Chart (`RadarChart.tsx`).
- **Module Hierarchy**:
  - `src/main.tsx` → `src/App.tsx` (Role & Auth Gateway, Command Palette Container)
  - `src/components/layout/` (`Layout.tsx`, `Navbar.tsx`, `Sidebar.tsx`)
  - `src/pages/auth/` (`Login.tsx`, `ParentSignUp.tsx`, `LinkStudent.tsx`)
  - `src/pages/dashboard/` (`AdminDashboard.tsx`)
  - `src/pages/attendance/` (`AttendanceTracker.tsx`)
  - `src/pages/students/` (`StudentProfile.tsx`)
  - `src/pages/reports/` (`DailyReport.tsx`)
  - `src/pages/notifications/` (`NotificationCenter.tsx`)
  - `src/components/ui/` (`CommandPalette.tsx`, `CertificateModal.tsx`, `BehaviorPointsModal.tsx`, `AvatarPickerModal.tsx`, `RadarChart.tsx`)

---

## Feature Inventory
Every feature from `ORIGINAL_REQUEST.md` is inventoried and verified.

| # | Feature ID | Feature Name | Description | Milestone | Status |
|---|------------|--------------|-------------|-----------|--------|
| 1 | F01 | Build & Type Safety | `npm run build` exits 0 with 0 TypeScript compilation errors | M1 | VERIFIED |
| 2 | F02 | Arabic RTL & Styling | Native RTL rendering, Cairo/Tajawal fonts, responsive layout, scrollbars | M1 | VERIFIED |
| 3 | F03 | Dev Server & Runtime | Vite dev server starts cleanly and serves pages without runtime exceptions | M1 | VERIFIED |
| 4 | F04 | Multi-Role Authentication | Role switching between Parent, Teacher, and Admin with role-adapted views | M2 | VERIFIED |
| 5 | F05 | Parent Onboarding & OTP | Parent registration with 4-digit auto-advancing OTP verification | M2 | VERIFIED |
| 6 | F06 | Student Linking & Codes | Alphanumeric link code verification (`SCH-2026-R1`, `SCH-2026-S2`) & green check card | M2 | VERIFIED |
| 7 | F07 | Attendance Marking & Audio | Real-time marking (present, late, unexcused, excused), UI counters, Web Audio | M2 | VERIFIED |
| 8 | F08 | Batch Attendance & CSV Export | Mark all present at once, CSV attendance report generation & download | M2 | VERIFIED |
| 9 | F09 | Gamified Behavior Points | Positive (+5, +4, +3, +2) and needs work (-1, -2) points, confetti celebration | M2 | VERIFIED |
| 10 | F10 | Competencies Radar Chart | Pure SVG 5-axis spider radar chart displaying student mastery dimensions | M2 | VERIFIED |
| 11 | F11 | Golden Certificate Modal | Printable official certificate with student name, GPA, school seal, print trigger | M2 | VERIFIED |
| 12 | F12 | Avatar Customization | 8 presets selection or custom image upload with local persistence | M2 | VERIFIED |
| 13 | F13 | Interactive Daily Report | Day timeline, subject breakdown, star ratings, voice simulation, teacher notes | M2 | VERIFIED |
| 14 | F14 | Notification Center | Categorized alerts, unread counters, relative Arabic timestamps, mark all read | M2 | VERIFIED |
| 15 | F15 | Global Command Palette | `Ctrl + K` modal with instant search, student quick navigation, role shortcuts | M2 | VERIFIED |
| 16 | F16 | Persistent Database & Seeding | Versioned localStorage keys (`*_v2`), initial mock seeding on cold start | M3 | VERIFIED |
| 17 | F17 | State Durability across Reloads | CRUD mutations (attendance, points, notifications, avatars) persist after reload | M3 | VERIFIED |
| 18 | F18 | Database Factory Reset | `resetDatabase()` restores seed state safely across all 4 keys | M3 | VERIFIED |
| 19 | F19 | E2E Automated Test Suite | Comprehensive multi-tier test suite executing all user flows | M4 | VERIFIED |
| 20 | F20 | Adversarial Hardening & Forensics | Adversarial edge testing (Tier 5), forensic integrity verification, zero mock traps | M5 | VERIFIED |
| 21 | U01 | Direct Admin Landing | Direct URL (/) opens immediately to General Admin Dashboard | M_UP1 | PLANNED |
| 22 | U02 | Universal Role Switcher & Return Button | Omnipresent 4-role switcher + return to admin button when viewing non-admin role | M_UP1 | PLANNED |
| 23 | U03 | Al-Baour 873 Roster Integrity | Exact 873 real students, 7-digit IDs, real birthdates, 33 pages/28 classes | M_UP1 | PLANNED |
| 24 | U04 | Zero Fake Mothers' Names | Purge all fake mothers' names from parsers, engines, modals; use "—" | M_UP1 | PLANNED |
| 25 | U05 | Manual Student Editing | Add updateStudent in context and UI modal to edit mother name/student info | M_UP1 | PLANNED |
| 26 | U06 | Al-Baour Reset & Clean Wipe | resetDatabase restores 873 Baour students; clean wipe button clears students cleanly | M_UP1 | PLANNED |
| 27 | U07 | Libyan Governance 4-Office UI | AdminDashboard structured into 4 Libyan school offices | M_UP1 | PLANNED |
| 28 | U08 | Clean Excel/PDF Import & Export | De-duplicated direct buttons for Excel/PDF import and export across offices | M_UP1 | PLANNED |
| 29 | U09 | Storage Persistence & Crash Guards | Fix db.ts empty array reload bug and Sidebar selectedStudent crash guard | M_UP1 | PLANNED |
| 30 | U10 | Build & Test Regression Zero | TypeScript build exits 0 and test suite passes 100% | M_UP1 | PLANNED |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | E2E Test Suite Creation | Design and build comprehensive multi-tier automated test harness and tests | none | DONE |
| M1 | Live Platform Execution & RTL Verification (R1) | Dev server runtime, bundle build, TypeScript types, RTL typography, layout | none | DONE |
| M2 | Core Modules & User Journeys Verification (R2) | Verify all 7 core modules, interactive components, modals, audio, confetti | M1 | DONE |
| M3 | Database Persistence & Durability Verification (R3) | Verify all CRUD operations, state durability across reloads, localStorage sync | M1, M2 | DONE |
| M4 | E2E Automated Test Suite Execution (R4) | Execute 100% of E2E test suite (Tiers 1-4) with 0 failures | M0, M1, M2, M3 | DONE |
| M5 | Adversarial Coverage Hardening & Forensic Audit | Tier 5 white-box challenger tests, forensic auditor verification, final sign-off | M4 | DONE |
| M_UP1 | System Upgrade & Repair (R1, R2, R3) | Implement Direct Admin Landing, 873 Al-Baour roster integrity, mother name fix, and 4-office admin workflow | M5 | IN_PROGRESS |
| M_UP2 | Independent Code & Functional Review | 2 Reviewers independently verify R1, R2, R3 implementation, UI, RTL, and builds | M_UP1 | PLANNED |
| M_UP3 | Adversarial Challenge & Stress Verification | 2 Challengers adversarially test role routing, wipe/reload persistence, and PDF/Excel edge cases | M_UP1 | PLANNED |
| M_UP4 | Forensic Integrity Audit & Final Sign-Off | 1 Forensic Auditor verifies zero cheating, zero fake data, genuine logic | M_UP2, M_UP3 | PLANNED |

---

## Code Layout
```
c:\Users\HP\Downloads\مدرسة\
├── index.html                 # App entry, dir="rtl", Google Fonts
├── package.json               # Dependencies, "test": "node tests/run-all.js"
├── tsconfig.json              # TypeScript strict configuration
├── vite.config.ts             # Vite bundler config (port 3000)
├── tailwind.config.js         # Design tokens, colors, Cairo/Tajawal fonts
├── dist/                      # Production build output
├── tests/                     # 243 automated tests (E2E, security, adversarial)
├── src/                       # 100% verified application source
└── .agents/                   # Orchestrator & subagents metadata & reports
```
