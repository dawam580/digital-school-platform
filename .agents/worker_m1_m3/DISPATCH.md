## 2026-09-01T05:48:42Z
You are Worker 1 for the Digital School Platform (منصة المدرسة الرقمية).

Your working directory: c:\Users\HP\Downloads\مدرسة\.agents\worker_m1_m3\
Please create your working directory metadata files (BRIEFING.md, progress.md) first.

Read the specifications and requirements from:
- c:\Users\HP\Downloads\مدرسة\.agents\ORIGINAL_REQUEST.md
- c:\Users\HP\Downloads\مدرسة\PROJECT.md
- c:\Users\HP\Downloads\مدرسة\.agents\explorer_survey_infra\survey_infra.md
- c:\Users\HP\Downloads\مدرسة\.agents\explorer_survey_modules\survey_modules.md
- c:\Users\HP\Downloads\مدرسة\.agents\explorer_survey_data\survey_data.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Mission (Milestones M1, M2, M3 Implementation & Verification):
1. **M1 (Live Platform & RTL)**: Verify `npm run build` and dev server execution. Ensure clean compilation, no missing dependencies, and 100% Arabic RTL layout.
2. **M2 (Core Modules & Synchronization)**: Check and refine components for complete synchronization with `useSchool()` context (especially `NotificationCenter.tsx` to ensure real-time notification consumption, marking read, and unread counts match Navbar). Verify all modals (CertificateModal, BehaviorPointsModal, AvatarPickerModal, CommandPalette).
3. **M3 (Data Persistence & Durability)**: Verify all 4 localStorage keys (`madrasa_db_*_v2`), seed hydration, CRUD operations (add behavior points, mark single/batch attendance, save avatars, reset database).
4. Run `npm run build` to guarantee 0 TypeScript compiler errors.

Write ownership:
- You exclusively own `src/` directory files.

Output:
Write your report and handoff to:
- c:\Users\HP\Downloads\مدرسة\.agents\worker_m1_m3\worker_report.md
- c:\Users\HP\Downloads\مدرسة\.agents\worker_m1_m3\handoff.md

Send a message back with build and test results when complete.
