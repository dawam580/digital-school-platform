# E2E Test Infra: Digital School Platform (منصة المدرسة الرقمية)

## Test Philosophy
- **Opaque-Box & Requirement-Driven**: Tests are derived directly from `ORIGINAL_REQUEST.md` (R1 to R4) and user-facing specifications without coupling to internal implementation quirks.
- **Methodology**: Systematic 4-Tier hierarchy (Category-Partition, Boundary Value Analysis, Pairwise Combinatorial Interaction, Real-World Workload Simulation).
- **Zero Mock Traps**: Tests execute against real state, real local database persistence serialization/deserialization, and actual component workflows.

---

## Feature Inventory & Test Coverage Mapping

| # | Feature ID | Feature Name | Tier 1 (Min 5) | Tier 2 (Min 5) | Tier 3 (Pairwise) | Tier 4 (Real-World) |
|---|------------|--------------|:--------------:|:--------------:|:-----------------:|:-------------------:|
| 1 | F01 | Build & Type Safety | 5 | 5 | ✓ | ✓ |
| 2 | F02 | Arabic RTL & Styling | 5 | 5 | ✓ | ✓ |
| 3 | F03 | Dev Server & Runtime | 5 | 5 | ✓ | ✓ |
| 4 | F04 | Multi-Role Authentication | 5 | 5 | ✓ | ✓ |
| 5 | F05 | Parent Onboarding & OTP | 5 | 5 | ✓ | ✓ |
| 6 | F06 | Student Linking & Codes | 5 | 5 | ✓ | ✓ |
| 7 | F07 | Attendance Marking & Audio | 5 | 5 | ✓ | ✓ |
| 8 | F08 | Batch Attendance & CSV Export | 5 | 5 | ✓ | ✓ |
| 9 | F09 | Gamified Behavior Points | 5 | 5 | ✓ | ✓ |
| 10 | F10 | Competencies Radar Chart | 5 | 5 | ✓ | ✓ |
| 11 | F11 | Golden Certificate Modal | 5 | 5 | ✓ | ✓ |
| 12 | F12 | Avatar Customization | 5 | 5 | ✓ | ✓ |
| 13 | F13 | Interactive Daily Report | 5 | 5 | ✓ | ✓ |
| 14 | F14 | Notification Center | 5 | 5 | ✓ | ✓ |
| 15 | F15 | Global Command Palette | 5 | 5 | ✓ | ✓ |
| 16 | F16 | Persistent Database & Seeding | 5 | 5 | ✓ | ✓ |
| 17 | F17 | State Durability across Reloads | 5 | 5 | ✓ | ✓ |
| 18 | F18 | Database Factory Reset | 5 | 5 | ✓ | ✓ |

---

## Test Architecture
- **Test Harness**: Automated Node / TypeScript test runner (`tests/run-e2e-tests.ts` or `vitest`) with custom assertion engine.
- **Execution Target**: Executed via standard command `npm test` or `node --loader ts-node/esm tests/run-e2e-tests.ts`.
- **Pass/Fail Semantics**: All test suites must execute with exit code 0, 0 unhandled exceptions, and 100% assertions passing.

---

## Test Tier Definitions

### Tier 1: Feature Coverage (≥5 per feature)
- Happy-path verification of every isolated feature:
  - Role switching (Parent, Teacher, Admin) and view rendering.
  - OTP 4-digit code entry and successful onboarding redirection.
  - Student linking with valid codes (`SCH-2026-R1`, `SCH-2026-S2`).
  - Attendance marking across all 4 statuses (`present`, `late`, `unexcused`, `excused`).
  - Awarding positive behavior points (+5, +4, +3, +2) and total recalculation.
  - SVG Radar spider chart coordinate calculations.
  - Golden certificate rendering (name, GPA, school seal).
  - Daily report timeline and star rating rendering.
  - Notification unread counter badge and category filters.
  - `Ctrl + K` command palette opening and search filtering.

### Tier 2: Boundary & Corner Cases (≥5 per feature)
- Extreme and edge-case inputs:
  - Incomplete or non-numeric OTP inputs (e.g. 3 digits, letters, special characters).
  - Invalid student link codes (non-existent, expired, empty string, lowercase variations).
  - Rapid sequential attendance clicks and audio engine re-entrance.
  - Negative behavior points taking student score below zero (verifying floor at 0).
  - Missing student evaluations, empty notes, zero-length arrays.
  - Corrupted localStorage JSON payload recovery (re-seeding fallback).
  - Ultra-long student names or Arabic text in certificate modal.
  - Notification mark-all-read when unread count is already 0.

### Tier 3: Cross-Feature Combinations (Pairwise Interaction)
- Complex multi-feature workflows:
  - Teacher marks student as `unexcused` absent → Notification automatically created in parent notification center → Parent logs in and views unread badge.
  - Teacher awards +5 behavior points → Score updates in Student Dossier → Certificate modal shows updated GPA/achievements → Notification dispatched.
  - Parent completes 4-box OTP registration → Automatically redirected to Student Linking → Enters `SCH-2026-R1` → Linked student appears in parent dashboard.
  - Custom avatar uploaded via Base64 → Reflected in Student Profile, Attendance Tracker list, and persistent in `localStorage`.
  - Database reset triggered → All custom modifications purged, seed records restored, notifications re-initialized.

### Tier 4: Real-World Application Scenarios (≥5 Realistic Scenarios)
1. **Scenario 1 (Morning Roll Call & Parent Alert)**: Morning teacher logs in, opens Class 1-A, marks 2 students present, 1 late, 1 unexcused, 1 excused with medical note. Exports CSV report. Parent receives instant push notification for the unexcused absence.
2. **Scenario 2 (New Parent Complete Journey)**: Parent registers with phone number and OTP `1234`, links 2 children with codes `SCH-2026-R1` and `SCH-2026-S2`, switches between children dossiers, reviews daily reports, and submits medical note.
3. **Scenario 3 (Student Excellence & Honor Certificate)**: Teacher reviews student with 98% attendance and 45 behavior points, awards +5 points for science fair excellence, triggers confetti, opens Golden Certificate, validates print layout.
4. **Scenario 4 (Global Navigation & Command Shortcuts)**: Admin opens platform, presses `Ctrl + K`, searches for student by national ID, navigates directly to dossier, edits avatar, verifies update across all views.
5. **Scenario 5 (Full Offline Durability & Reload Cycle)**: User performs 10 distinct actions across all modules, page is completely reloaded (simulated storage read/write cycle), state is verified to be 100% identical.

---

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥ 90 test cases (18 features × 5)
- **Tier 2 (Boundary & Corner)**: ≥ 90 test cases (18 features × 5)
- **Tier 3 (Cross-Feature Combinations)**: ≥ 18 pairwise integration workflows
- **Tier 4 (Real-World Scenarios)**: ≥ 5 comprehensive end-to-end scenarios
- **Total Minimum Target**: ≥ 203 automated test cases
