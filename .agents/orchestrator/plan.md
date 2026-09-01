# Orchestration Plan: Digital School Platform Verification & Testing

## Objective
Lead the full End-to-End Verification, Live Testing, Database Persistence Verification, and Code Quality Assurance for the Digital School Platform (منصة المدرسة الرقمية) per `ORIGINAL_REQUEST.md`.

## Execution Stages

### Stage 0: Codebase Survey & Requirement Mapping
- Spawn 3 Explorers / Spec Miners in parallel:
  - Explorer 1: Project structure, package.json, scripts, dev server setup, dependencies, build configuration, styling/fonts/icons/RTL.
  - Explorer 2: Core modules implementation (Auth, Parent Onboarding, Student Linking, Attendance, Dossier & Evaluation, Daily Report, Notifications, Command Palette).
  - Explorer 3: Persistence layer (localStorage/IndexedDB/SQLite/backend, state integrity across reloads), existing tests, test runner configuration.
- Synthesize survey findings into root `PROJECT.md` and `TEST_INFRA.md`.

### Stage 1: Dual Track Execution
- **Track A: E2E Test Suite Creation**
  - Design & implement comprehensive tests across Tier 1 (Feature Coverage), Tier 2 (Boundary & Corner Cases), Tier 3 (Cross-Feature Combinations), Tier 4 (Real-World Application Scenarios).
  - Produce `TEST_READY.md`.
- **Track B: Implementation & Verification**
  - Verify live execution & dev server runtime (R1).
  - Verify all 7 core modules & user journeys (R2).
  - Verify persistent database & state integrity (R3).
  - Verify TypeScript compilation, build, and automated test passes (R4).

### Stage 2: Adversarial Coverage Hardening (Tier 5)
- Challenger analysis of edge cases and gaps.
- Worker fixes and integration.
- Independent Reviewers and Forensic Auditor verification.

### Stage 3: Gate & Acceptance Verification
- Final verification of all acceptance criteria.
- Report delivery with comprehensive evidence.
