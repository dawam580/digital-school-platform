## 2026-09-01T06:00:18Z
You are Worker 2 for Iteration 2 remediation of the Digital School Platform (منصة المدرسة الرقمية).

Your working directory: c:\Users\HP\Downloads\مدرسة\.agents\worker_remediation_i2\
Please create your working directory metadata files (BRIEFING.md, progress.md) first.

Read the specifications, original request, and audit failure evidence from:
- c:\Users\HP\Downloads\مدرسة\.agents\ORIGINAL_REQUEST.md
- c:\Users\HP\Downloads\مدرسة\PROJECT.md
- c:\Users\HP\Downloads\مدرسة\.agents\auditor_1\forensic_audit_report.md
- c:\Users\HP\Downloads\مدرسة\.agents\auditor_1\handoff.md
- c:\Users\HP\Downloads\مدرسة\.agents\reviewer_1\handoff.md
- c:\Users\HP\Downloads\مدرسة\.agents\reviewer_2\handoff.md
- c:\Users\HP\Downloads\مدرسة\.agents\challenger_2\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

FULL FORENSIC AUDIT EVIDENCE & DEFECTS TO REMEDIATE:
1. **Test F13.5 Failure (`tests/tier1-features.test.js:745`)**:
   - Error: `Expected string "إحضار مجسم أو رسم بياني لدورة الماء للعلوم" to contain "العلوم"`.
   - In Arabic, `لـ` + `العلوم` drops the Alef yielding `للعلوم`.
   - Fix in `tests/tier1-features.test.js` at line 745: Update the assertion to check `.toContain('للعلوم')` or `.toContain('دورة الماء')`.
2. **Deep Copy of Seeds in `src/services/db.ts`**:
   - In `getStudents()`, `getClasses()`, `getNotifications()`, and `getDailyReport()`, when falling back to default seed data, ensure deep copies are returned using `JSON.parse(JSON.stringify(SEED_*))` so mutations don't inadvertently mutate seed constant references in memory.
3. **CSV Quote Escaping in `src/pages/attendance/AttendanceTracker.tsx:58`**:
   - Ensure student names in CSV export escape internal double-quotes: `s.name.replace(/"/g, '""')`.
4. **OTP Submission Guard in `src/pages/auth/ParentSignUp.tsx:168`**:
   - Ensure the OTP confirmation button is disabled if any OTP digit is missing: `disabled={loading || confirmed || otp.some(d => !d)}`.

Your Mission:
1. Apply these exact fixes across `tests/tier1-features.test.js`, `src/services/db.ts`, `src/pages/attendance/AttendanceTracker.tsx`, and `src/pages/auth/ParentSignUp.tsx`.
2. Update `TEST_READY.md` if necessary to reflect the verified 203/203 passed test suite.
3. Execute `cmd /c "npm test"` and verify that ALL 203 tests pass (100%) with Exit Code 0.
4. Execute `cmd /c "npm run build"` and verify that TypeScript compilation passes with 0 errors and Exit Code 0.
5. Execute all challenger suites (`node tests/challenger-state-security.test.js` and `node tests/adversarial-stress.mjs`) to verify zero regressions.

Output:
Write your remediation report and 5-component handoff to:
- c:\Users\HP\Downloads\مدرسة\.agents\worker_remediation_i2\remediation_report.md
- c:\Users\HP\Downloads\مدرسة\.agents\worker_remediation_i2\handoff.md

Send a message back when complete.
