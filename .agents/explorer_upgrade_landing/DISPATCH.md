## 2026-09-03T21:54:00Z

Received mission from orchestrator (parent agent: 19088749-1efd-4504-9c86-863a8dea03d6).
Mission: Survey Requirement R1: Direct Admin Landing (واجهة الدخول الافتراضية المباشرة).

Investigate:
1. How routing and initial page rendering works in `src/App.tsx`, `src/context/SchoolContext.tsx`, `src/pages/dashboard/AdminDashboard.tsx`, `src/components/layout/Navbar.tsx`, `src/components/layout/Sidebar.tsx`, `src/pages/auth/Login.tsx`.
2. When a user opens the direct platform URL (`/`), how does the app determine the active view and user role? Does it default to student/parent, login screen, or dashboard?
3. What exact code changes are needed so opening the direct URL immediately renders the General School Admin Dashboard (`AdminDashboard.tsx`) with instant visibility and control over students, teachers, class rosters, class timetables/schedules, and attendance without friction?
4. How does role switching back and forth (between Admin, Teacher, Parent) work, and how can we preserve role switching while ensuring the direct entry default is Admin?
5. Identify any potential regressions with existing automated tests in `tests/`.
