## 2026-09-04T01:04:00Z
Implement all code modifications and repairs for Requirements R1, R2, and R3:

1. R1: Direct Admin Landing & Universal Role Switcher
   - In `src/context/SchoolContext.tsx`: Ensure direct root URL access (`/`) unconditionally defaults `currentRole` to `'admin'`, `activeTab` to `'dashboard'`, and `isAuthenticated` to `true`.
   - In `src/components/layout/Navbar.tsx`:
     * Include all 4 roles in the role switcher dropdown (Admin, Teacher, Parent, Counselor) with Arabic labels and icons.
     * Make the role switcher accessible regardless of the active role.
     * When `currentRole !== 'admin'`, render an active button: `"🏛️ العودة للوحة الإدارة"` that immediately returns to Admin Dashboard.
   - In `src/pages/teacher/TeacherQuickDashboard.tsx` and `src/pages/parent/ParentDashboard.tsx`:
     * Add a top banner indicating administrative supervision mode with a quick button to return to Admin Dashboard.
   - In `src/App.tsx`:
     * Verify root navigation renders `AdminDashboard`.

2. R2: Al-Baour 873 Real Students Dataset & Zero Fake Mothers' Names
   - Ensure `LIBYAN_BAOUR_STUDENTS` (873 authentic students, 7-digit IDs, real birthdates, 33 pages/28 classes) in `src/data/libyanBaourSchoolDataset.ts` is the default active dataset.
   - PURGE ALL FAKE/HALLUCINATED MOTHERS' NAMES:
     * In `src/services/importers/pdfStudentParser.ts` (lines 260, 324, 328-334, 447): Replace all fake mother names with `'—'`.
     * In `src/services/ai/smartDataEngine.ts` line 137: Replace fallback `'فاطمة محمد'` with `'—'`.
     * In `src/components/admin/PdfStudentImporterModal.tsx` line 180: Replace fallback `'عائشة الفيتوري'` with `'—'`.
     * In `src/components/admin/ExcelStudentImporterModal.tsx` lines 219-222: Replace sample mother names with `'—'`.
     * In `src/utils/excelHelper.ts` line 28: Output `s.motherName || '—'` instead of `'غير مسجل'`.
   - Add Manual Student Editing:
     * In `src/context/SchoolContext.tsx`: Add and export `updateStudent(id: string, updates: Partial<Student>)` that updates both state and `localStorage`.
     * In `src/pages/dashboard/AdminDashboard.tsx`: Add an Edit Student button (`Pencil` icon) in the student table and a clean modal dialog to allow editing mother's name (`motherName`) and other fields manually.
   - In `src/components/admin/PdfStudentImporterModal.tsx`: Ensure `autoDistributeSections` defaults to false to preserve authentic class names (`1/1 مساء`, etc.).

3. R3: Libyan School Governance Workflow & Clean Reset/Wipe
   - In `src/pages/dashboard/AdminDashboard.tsx`:
     * Structure the view into 4 official Libyan School Governance offices:
       1. 🏛️ **مكتب مدير المدرسة**: ملف المدرسة، الخطة التشغيلية، اعتماد الكنترول، أزرار التصفير النظيف وإعادة ضبط كشف الباعور، ومراقبة المعلم.
       2. 👥 **شؤون الطلاب والتسجيل**: كشف الـ 873 طالباً، الفصول الـ 33، سجلات الحضور اليومي، أزرار استيراد وتصدير Excel و PDF.
       3. 📑 **لجنة الامتحانات والجداول (الكنترول)**: شيت الكنترول 1120 درجة، الجداول المدرسية الذكية AI، بطاقات إخطار الدرجات.
       4. 👨🏫 **الشؤون الإدارية والمالية**: كادر المعلمين، منظومة الشاطئ وملاك الحصص، زر تصدير كشف المعلمين Excel/PDF.
     * Clean up duplicate elements:
       - Remove duplicate "استيراد إكسل" buttons from header.
       - Remove duplicate `<ExcelStudentImporterModal>` and `<QrPdfReaderModal>` calls.
   - Clean Wipe / Reset Functionality:
     * In `src/services/db.ts`:
       - Update `SEED_STUDENTS` and `SEED_CLASSES` to use `LIBYAN_BAOUR_STUDENTS` and Al-Baour classes, so `resetAllData` never reverts to old dummy data.
       - In `getStudents()`: Handle explicit empty array `[]` in `localStorage` so an intentional wipe persists across reloads.
     * In `src/components/layout/Sidebar.tsx`: Add safe optional chaining `selectedStudent?.name || 'الطالب'` at line 55 to prevent any crash when student list is empty.
     * In `src/pages/dashboard/AdminDashboard.tsx`: Provide two distinct buttons:
       - "🔄 إعادة ضبط كشف مدرسة الباعور (873 طالباً)": restores `LIBYAN_BAOUR_STUDENTS`.
       - "🗑️ تصفير وحذف نظيف للبدء من جديد": cleanly wipes students state and storage with confirmation.

4. Verification & Testing:
   - Run `npm run build` (or `npx tsc` / `vite build`) to confirm exit code 0 and 0 TypeScript errors.
   - Run `node tests/run-all.js` to ensure all 243 automated tests pass with 0 regressions.
   - Document all changes, commands run, and verification outputs in `c:\Users\HP\Downloads\مدرسة\.agents\worker_upgrade_m1\handoff.md`. Send a summary message when done.
