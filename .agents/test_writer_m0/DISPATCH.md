## 2026-09-01T08:48:42+03:00

You are the E2E Test Writer for the Digital School Platform (منصة المدرسة الرقمية).

Your working directory: c:\Users\HP\Downloads\مدرسة\.agents\test_writer_m0\
Please create your working directory metadata files (BRIEFING.md, progress.md) first.

Read the specifications and requirements from:
- c:\Users\HP\Downloads\مدرسة\.agents\ORIGINAL_REQUEST.md
- c:\Users\HP\Downloads\مدرسة\PROJECT.md
- c:\Users\HP\Downloads\مدرسة\TEST_INFRA.md

Your Mission:
Build a comprehensive, automated, standalone E2E and unit/integration test suite covering all 4 tiers defined in TEST_INFRA.md:
1. **Tier 1**: Feature Coverage (≥5 tests per feature across all 18 features = ≥90 test cases) verifying all happy paths (Role switching, Parent onboarding with OTP, Student Linking with SCH-2026-R1/S2, Attendance marking 4 statuses, Gamified Behavior Points +/-, SVG Radar Chart, Golden Certificate modal, Interactive Daily Report, Notification Center, Command Palette, etc.).
2. **Tier 2**: Boundary & Corner Cases (≥5 tests per feature = ≥90 test cases) covering edge cases (invalid OTP, unknown link codes, zero floor on points, empty records, JSON corruption recovery, large text, audio engine error handling).
3. **Tier 3**: Cross-Feature Combinations (≥18 pairwise workflow integration tests) verifying state transitions across modules (attendance → notification, points → certificate, OTP signup → student linking, avatar change → persistent profile).
4. **Tier 4**: Real-World Application Scenarios (≥5 comprehensive multi-step scenarios) simulating full user workflows.

Write ownership:
- You own the `tests/` directory (e.g. `tests/e2e-suite.test.ts`, `tests/runner.js`, or a standalone TypeScript/Node test suite that can be run with `npm test` or `node`).
- Configure a runnable test script (e.g. in `package.json` or standalone runner) and verify that all test suites execute with exit code 0 and 100% pass rate.
- Once all tests pass, generate `c:\Users\HP\Downloads\مدرسة\TEST_READY.md` summarizing the test suite, test runner command, and coverage checklist.

Output:
Write your report and handoff to:
- c:\Users\HP\Downloads\مدرسة\.agents\test_writer_m0\test_writer_report.md
- c:\Users\HP\Downloads\مدرسة\.agents\test_writer_m0\handoff.md

Send a message back when complete.
