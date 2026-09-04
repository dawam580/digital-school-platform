# Handoff Report: Specification Mining for Requirement R2 (Al-Baour Roster Data Integrity & PDF Extraction)

**Agent**: `spec_miner_al_baour`  
**Mission**: Survey and audit Requirement R2: PDF Data Extraction & Roster Integrity (دقة بيانات الطلاب المستخرجة من كشف الـ PDF)  
**Date**: 2026-09-04  
**Working Directory**: `c:\Users\HP\Downloads\مدرسة\.agents\spec_miner_al_baour\`  

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Roster Dataset | Al-Baour Official Dataset (`LIBYAN_BAOUR_STUDENTS`) | 873 authentic students from the Libyan Ministry of Education / National Examination Center roster for Shahid Emhemed Al-Baour School (30713 - Tokra) | Raw extracted PDF lines from 33 pages | Array of 873 `Student` entities with 7-digit registration numbers, birthdates, gender, and classes | Empty array if parsing fails | `src/data/libyanBaourSchoolDataset.ts`, `scratch/generate_baour_dataset.cjs` |
| 2 | Roster Dataset | School Profile & Metadata (`LIBYAN_BAOUR_SCHOOL_INFO`) | Official school metadata: name "مدرسة الشهيد امحمد الباعور للتعليم الأساسي", code "30713", municipality "توكرة", 873 students, 28 class list | Configuration object | Metadata constants | None | `src/data/libyanBaourSchoolDataset.ts:12-29` |
| 3 | Data Storage | Default Students Provider (`db.getStudents`) | Returns parsed Al-Baour 873 students when local storage is empty | `localStorage` key `'madrasa_db_students_v3'` | `Student[]` (873 students) | Falls back to `LIBYAN_BAOUR_STUDENTS` if empty or error | `src/services/db.ts:1100-1111` |
| 4 | Data Storage | Legacy Mock Reset Bug (`db.resetAllData` & `resetDatabase`) | Resetting system reinstates legacy 5 mock students (`SEED_STUDENTS`) and 12 mock classes (`SEED_CLASSES`) instead of Al-Baour 873 students and 28 classes | User triggers system reset in Admin Settings | `setStudents(SEED_STUDENTS)` (5 students) | Erases 873 real students and replaces them with 5 mock records | `src/context/SchoolContext.tsx:1059-1065`, `src/services/db.ts:514-704` |
| 5 | Data Storage | Backend Sync Store (`server_db.json`) | Dev server JSON database queried on `/api/state` and updated via `/api/action` | JSON payload from HTTP requests | Persisted JSON file | Still contains legacy 5 Saudi students (`ريان فهد العتيبي`) from initial prompt | `server_db.json:1-553`, `vite.config.ts:8-25` |
| 6 | PDF Extraction | Ministry Format Parser (Priority 1) | Regex parser for 7-column Libyan Exam Center document: `^(\d+)\s+(\d{6,8})\s+(.+?)\s+(ذكر\|انثى\|أنثى)\s+(\d{4}-\d{2}-\d{2})\s+(\S+)\s+(\S+)` | Text line from PDF | `ParsedStudentRow` with name, 7-digit regNum, gender, birthdate | Injects fake mother's name `'عائشة الفيتوري'` (female) or `'فاطمة الترهوني'` (male) | `src/services/importers/pdfStudentParser.ts:240-274` |
| 7 | PDF Extraction | General Spatial Text Parser (Priority 2) | Fallback parser for arbitrary Libyan student rosters using word slicing and 12-digit ID extraction | Spatial PDF lines | `ParsedStudentRow` with estimated grade and section | Injects fake mother's name `'فاطمة مفتاح'` or `'سليمة عمر'`, or corrupts student family name | `src/services/importers/pdfStudentParser.ts:310-375` |
| 8 | PDF Extraction | Text Paste Parser | Fallback mode in PDF importer modal allowing users to paste raw table text | Multiline string | `ParsedStudentRow[]` | Injects fake mothers' names or defaults | `src/components/admin/PdfStudentImporterModal.tsx:118-156` |
| 9 | PDF Importer UI | Direct Al-Baour Loader Button | One-click button in PDF importer to load all 873 Al-Baour students without re-uploading file | Button click ("استخراج كشف مدرسة الباعور بالذكاء الاصطناعي 🌟") | 873 rows loaded into preview table | Line 180 falls back to fake `'عائشة الفيتوري'` if motherName is falsy | `src/components/admin/PdfStudentImporterModal.tsx:173-205` |
| 10 | PDF Importer UI | Section Auto-Distribution Option (`autoDistributeSections`) | Checkbox in PDF importer that re-distributes students into sections 'أ', 'ب', 'ج', 'د' | Checkbox boolean (default true) | Replaces real Al-Baour class names (e.g. `1/1 مساء`) with generic `9/أ`, `9/ب` | Corrupts authentic Libyan class names if left checked | `src/components/admin/PdfStudentImporterModal.tsx:61, 84-96` |
| 11 | Excel Importer UI | Smart Excel/CSV Importer (`ExcelStudentImporterModal`) | Imports `.xlsx`, `.xls`, `.csv` student files with column matching (`الاسم`, `الرقم الوطني`, `رقم القيد`, `الفصل`, `الصف`, `اسم الأم`) | Binary Excel file | Appends or merges students into `students` state & `db` | Routes through `SmartDataEngine` which forces fake `'فاطمة محمد'` if motherName is empty; Modal mounted twice in AdminDashboard | `src/components/admin/ExcelStudentImporterModal.tsx:85-110, 219-223` |
| 12 | Smart Engine | Libyan Identity & Completion Engine (`SmartDataEngine`) | Cleans Arabic names, validates 12-digit Libyan ID, infers gender and birth year | Partial student object | Completed `Student` object | Line 137 hallucinates `motherName: raw.motherName || 'فاطمة محمد'` | `src/services/ai/smartDataEngine.ts:49-160` |
| 13 | Legacy Manager | Older Student Excel Manager (`StudentExcelManager`) | Older modal allowing CSV export, template download, and CSV upload | CSV file | Merges students and stores in localStorage | Inconsistent storage key `'madrasa_db_students_v2'`; sample template has Saudi names | `src/components/admin/StudentExcelManager.tsx:86`, `src/utils/excelHelper.ts:110-112` |
| 14 | Excel Helper | Libyan Student Excel Exporter (`exportLibyanStudentsToExcel`) | Generates UTF-8 BOM CSV with 11 standard columns for Libyan schools | Array of students | Browser CSV file download | Line 28 exports `'غير مسجل'` instead of required dash `'—'` | `src/utils/excelHelper.ts:6-47` |
| 15 | UI Presentation | Mother's Name Display in Admin Dashboard | Table column in Admin Dashboard students roster table | `st.motherName` | String in table cell | Line 827 displays hyphen `-` instead of em-dash `—`; NO edit button or modal to edit mother's name manually | `src/pages/dashboard/AdminDashboard.tsx:827, 846-853` |
| 16 | State Management | Missing Student Editing Action | `SchoolContext` lacks general student update method | N/A | Only `updateStudentAvatar` and `updateStudentGrade` exist | Cannot persist manually edited mother's name or student details | `src/context/SchoolContext.tsx:131-132, 833-855` |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Mother's Name on PDF Exam Center Import | Ministry row: `1 5864392 أحمد محمد عيسى عيسى ذكر 2019-04-13 ليبي مسلم` | `pdfStudentParser.ts:260` assigns fake `motherName: 'فاطمة الترهوني'` (or `'عائشة الفيتوري'` for females) instead of `'—'`. |
| 2 | Mother's Name on General PDF Parse | Student name with 5 words: `عبدالرحمن صلاح محمد بوشناف سالم` | `pdfStudentParser.ts:333` slices words 3-5 (`محمد بوشناف`) and sets it as `motherName`, mutilating the student's family name. |
| 3 | Mother's Name on Excel Import | Excel row with empty or missing `'اسم الأم'` column | `SmartDataEngine.ts:137` forces `motherName: 'فاطمة محمد'`. |
| 4 | Mother's Name on Preloaded Dataset in Modal | Student record with `motherName: ""` or `undefined` | `PdfStudentImporterModal.tsx:180` forces `motherName: 'عائشة الفيتوري'`. |
| 5 | Class Name on PDF Upload with Auto-Distribution | Student in `1/1 مساء` uploaded with `autoDistributeSections = true` | `PdfStudentImporterModal.tsx:94` overwrites className to `الصف التاسع الأساسي/أ` or `1/أ`. |
| 6 | System Reset Action | Admin clicks "إعادة ضبط النظام" / "التصفير والحذف النظيف" | `SchoolContext.tsx:1062` overwrites 873 real Al-Baour students with 5 old dummy students (`SEED_STUDENTS`) and 12 dummy classes (`SEED_CLASSES`). |
| 7 | Excel Manager Storage Key | Admin confirms CSV import in `StudentExcelManager` | Writes to `localStorage` key `'madrasa_db_students_v2'`, whereas `db.ts` reads from `'madrasa_db_students_v3'`, causing newly imported students to vanish on refresh. |
| 8 | Server Sync Endpoint | Dev server starts and serves `/api/state` | Returns 5 old Saudi students from `server_db.json`, contradicting the 873 Libyan students in frontend memory. |
| 9 | Multi-page Classes in PDF | Grade 5 Class 5/1 Morning (39 students) spanning PDF Pages 9 & 10 | Successfully grouped under single class `5/1 صباح` in `libyanBaourSchoolDataset.ts`, but total distinct classes is 28 while document page count is 33. |
| 10 | Excel Export of Missing Mother Name | Student with `motherName: ""` or undefined | `excelHelper.ts:28` outputs `"غير مسجل"` instead of official placeholder `"—"`. |

---

## 1. Observation

Direct code observations from workspace files:

### 1.1 Dataset Files & Student Count
- **`src/data/libyanBaourSchoolDataset.ts`**:
  - Line 17: `totalStudents: 873,`
  - Lines 18–28:
    ```ts
    classesList: [
      "1/1 مساء", "1/2 مساء",
      "2/1 مساء", "2/2 مساء",
      "3/1 مساء", "3/2 مساء",
      "4/1 مساء", "4/2 مساء",
      "5/1 صباح", "5/2 صباح", "5/3 صباح",
      "6/1 صباح", "6/2 صباح", "6/3 صباح", "6/4 صباح", "6/5 صباح",
      "7/1 صباح", "7/2 صباح", "7/3 صباح", "7/4 صباح",
      "8/1 صباح", "8/2 صباح", "8/3 صباح", "8/4 صباح",
      "9/1 صباح", "9/2 صباح", "9/3 صباح", "9/4 صباح"
    ]
    ```
  - Line 31 to 57650: `export const LIBYAN_BAOUR_STUDENTS: Student[] = [...]` contains exactly **873 student objects**.
  - Student 1 (line 33–42):
    ```ts
    "id": "std-baour-5864392",
    "name": "أحمد محمد عيسى عيسى",
    "nationalNumber": "120195864392",
    "studentNumber": "5864392",
    "linkCode": "SCH-2026-B1",
    "grade": "الصف الأول الأساسي",
    "className": "1/1 مساء",
    "motherName": "—",
    "birthDate": "2019-04-13",
    ```
  - Student 873 (line 57585–57594):
    ```ts
    "id": "std-baour-4104797",
    "name": "ياسمين صلاح يونس فضل الله",
    "nationalNumber": "220114104797",
    "studentNumber": "4104797",
    "linkCode": "SCH-2026-B873",
    "grade": "الصف التاسع الأساسي",
    "className": "9/4 صباح",
    "motherName": "—",
    "birthDate": "2011-03-27",
    ```
- **`scratch/generate_baour_dataset.cjs` & `scratch/generate_baour_dataset.js`**:
  - Total 1220 lines.
  - Contains `pagesData` with 33 page entries containing raw text from the National Examination Center document.
  - Lines 1144–1149:
    ```javascript
    studentNumber: regNum,
    linkCode: `SCH-2026-B${totalIndex}`,
    grade: p.grade,
    className: p.className,
    motherName: '—',
    birthDate: birthDate,
    ```
  - Line 1183: `Successfully parsed 873 real students from Al-Shaheed Emhemed Al-Baour School!`

### 1.2 Hallucinated Mothers' Names (اسم الأم)
Direct occurrences of fake/hallucinated mothers' names discovered across the codebase:
1. **`src/services/importers/pdfStudentParser.ts` Line 260**:
   ```ts
   motherName: isFemale ? 'عائشة الفيتوري' : 'فاطمة الترهوني',
   ```
2. **`src/services/importers/pdfStudentParser.ts` Line 324**:
   ```ts
   let motherName = gender === 'male' ? 'فاطمة مفتاح' : 'سليمة عمر';
   ```
3. **`src/services/importers/pdfStudentParser.ts` Lines 328–334**:
   ```ts
   if (arabicWords.length >= 6) {
     studentName = arabicWords.slice(0, 4).join(' ');
     motherName = arabicWords.slice(4, 7).join(' ');
   } else if (arabicWords.length >= 4) {
     studentName = arabicWords.slice(0, 4).join(' ');
     if (arabicWords.length === 5) {
       motherName = arabicWords.slice(3, 5).join(' ');
     }
   }
   ```
4. **`src/services/importers/pdfStudentParser.ts` Line 447**:
   ```ts
   const motherName = words.length >= 6 ? words.slice(4, 6).join(' ') : 'فاطمة محمد';
   ```
5. **`src/services/ai/smartDataEngine.ts` Line 137**:
   ```ts
   motherName: raw.motherName || 'فاطمة محمد',
   ```
6. **`src/components/admin/PdfStudentImporterModal.tsx` Line 180**:
   ```ts
   motherName: s.motherName || 'عائشة الفيتوري',
   ```
7. **`src/components/admin/ExcelStudentImporterModal.tsx` Lines 219–222**:
   ```ts
   { 'الاسم': 'محمد فتحي الشريف', ... 'اسم الأم': 'عائشة الفيتوري', ... },
   { 'الاسم': 'فاطمة علي السويحلي', ... 'اسم الأم': 'مريم الترهوني', ... },
   { 'الاسم': 'أحمد وليد المصراتي', ... 'اسم الأم': 'هدى الزوي', ... },
   { 'الاسم': 'سارة طارق الورفلي', ... 'اسم الأم': 'سعاد المقريف', ... }
   ```
8. **`src/utils/excelHelper.ts` Line 28**:
   ```ts
   `"${s.motherName || 'غير مسجل'}"`,
   ```

### 1.3 State & Storage Inconsistencies
- **`src/services/db.ts` Lines 514–689**:
  `export const SEED_STUDENTS: Student[] = [...]` defines 5 old dummy students (`معتز سالم الورفلي`, `آية مصطفى الترهوني`, `عبدالرحمن علي المقريف`, `سارة عمر الفيتوري`, `يوسف فتحي السويحلي`).
- **`src/services/db.ts` Lines 691–704**:
  `export const SEED_CLASSES: SchoolClass[] = [...]` defines 12 old classes (`7/أ`, `7/ب`, `8/أ`, etc.), completely disjoint from Al-Baour's 28 classes.
- **`src/context/SchoolContext.tsx` Lines 1059–1065**:
  ```ts
  const resetDatabase = () => {
    SecurityEngine.assertPermission(currentRole, 'RESET_SYSTEM');
    db.resetAllData();
    setStudents(SEED_STUDENTS);
    setSelectedStudent(SEED_STUDENTS[0]);
    setTeachers(SEED_TEACHERS);
    setClasses(SEED_CLASSES);
  ```
  Calling `resetDatabase` clobbers the 873 students and Al-Baour classes back to the 5 dummy students and 12 dummy classes.
- **`src/context/SchoolContext.tsx`**:
  No `updateStudent` method exists in `SchoolContextType` (only `updateStudentAvatar` and `updateStudentGrade`).
- **`src/components/admin/StudentExcelManager.tsx` Line 86**:
  ```ts
  localStorage.setItem('madrasa_db_students_v2', JSON.stringify(uniqueStudents));
  ```
  Writes to `_v2` key, but `src/services/db.ts` line 51 reads from `madrasa_db_students_v3`.
- **`server_db.json` Lines 1–553**:
  Contains 5 mock Saudi students (`ريان فهد العتيبي`, etc.), with 10-digit IDs and `055...` phones.

### 1.4 Importer Component Details
- **`src/components/admin/PdfStudentImporterModal.tsx` Lines 86–95**:
  `autoDistributeSections` assigns sections from `['أ', 'ب', 'ج', 'د']`, overriding authentic section codes (`1/1 مساء`, `5/1 صباح`).
- **`src/pages/dashboard/AdminDashboard.tsx`**:
  `ExcelStudentImporterModal` is rendered twice (line 1340 and line 1380).
  Table column for mother's name at line 827 displays `{st.motherName || '-'}`. Row actions at line 846 only have Delete (`Trash2`), with NO Edit button.

---

## 2. Logic Chain

1. **Roster Completeness**:
   - The user requested 873 real students from the National Examination Center document for "مدرسة الشهيد امحمد الباعور للتعليم الأساسي - توكرة" (Requirement R2).
   - In `scratch/generate_baour_dataset.cjs` and `src/data/libyanBaourSchoolDataset.ts`, the dataset was generated directly from the 33 pages of the official document.
   - The count is confirmed to be exactly 873 students, each with authentic 7-digit registration numbers (`studentNumber`), valid 12-digit national IDs (`nationalNumber`), verified birthdates matching elementary and preparatory age distributions, and binary gender (`male` / `female`).
   - Therefore, the dataset in `libyanBaourSchoolDataset.ts` is authentic, accurate, and meets the 873 student count requirement.

2. **33 Pages vs 28 Classes**:
   - The original PDF has 33 physical pages.
   - Several large classes span 2 consecutive pages in the PDF:
     - Class `5/1 صباح` (39 students) spans Pages 9 & 10.
     - Class `7/1 صباح` spans Pages 18 & 19.
     - Class `7/2 صباح` spans Pages 20 & 21.
     - Class `7/3 صباح` spans Pages 22 & 23.
     - Class `8/3 صباح` spans Pages 27 & 28.
   - Combining these multi-page classes yields exactly **28 unique classes** (`1/1 مساء` through `9/4 صباح`).
   - The user requirement phrase *"توزيع الفصول والشعب الدقيق (33 فصلاً من 1/1 مساء حتى 9/4 صباح)"* refers to the 33 page-class rosters of the PDF document.

3. **Mother's Name Hallucination Chain**:
   - The ministerial examination roster contains only 7 columns (`ت`, `رقم القيد`, `الاسم الرباعي`, `الجنس`, `تاريخ الميلاد`, `الجنسية`, `الديانة`). It has NO column for mother's name.
   - When generating `libyanBaourSchoolDataset.ts`, the author correctly set `motherName: '—'`.
   - However, during development of the dynamic parsers and helpers, several fake names were hallucinated:
     - `pdfStudentParser.ts` injects `'عائشة الفيتوري'`, `'فاطمة الترهوني'`, `'فاطمة مفتاح'`, `'سليمة عمر'`, and `'فاطمة محمد'`.
     - `smartDataEngine.ts` injects `'فاطمة محمد'`.
     - `PdfStudentImporterModal.tsx` falls back to `'عائشة الفيتوري'`.
     - `ExcelStudentImporterModal.tsx` sample template injects `'عائشة الفيتوري'`, `'مريم الترهوني'`, `'هدى الزوي'`, `'سعاد المقريف'`.
     - `excelHelper.ts` exports `'غير مسجل'` instead of `'—'`.
   - If any user imports a PDF or Excel file using these components, the system re-injects these hallucinated mothers' names, directly violating Requirement R2.

4. **UI & State Editing Inability**:
   - Requirement R2 specifies: *"اسم الأم: نظراً لأن كشوفات المركز الوطني للامتحانات لا تتضمن خانة لاسم الأم، يجب عدم اختلاق أسماء وهمية، بل عرض علامة (—) مع إمكانية التعديل اليدوي، لتفادي أي ارتباك."*
   - Currently, there is NO mechanism in the UI (Admin Dashboard student table) to edit a student's record or mother's name once imported.
   - `SchoolContext` has no `updateStudent` mutation.
   - Therefore, the requirement for "إمكانية التعديل اليدوي" (manual editing capability) is currently unfulfilled in both state and UI.

5. **Persistence & Reset Fragility**:
   - When an admin invokes "إعادة ضبط النظام" / "التصفير والحذف النظيف" (Requirement R3), `SchoolContext.tsx` re-seeds with `SEED_STUDENTS` (5 dummy students) and `SEED_CLASSES` (12 dummy classes).
   - This destroys the 873 Al-Baour students and resets to the outdated mock dataset.
   - Furthermore, `server_db.json` contains old Saudi mock data, and `StudentExcelManager.tsx` writes to `madrasa_db_students_v2` instead of `v3`.

---

## 3. Caveats

1. **Class Count Naming**: The user request says "33 فصلاً من 1/1 مساء حتى 9/4 صباح", but the official PDF document contains 33 pages corresponding to 28 distinct classes (since 5 classes span 2 pages each). The system must represent the 28 unique classes with their exact student enrollments totaling 873 students, while acknowledging the 33 pages of the physical ministerial PDF.
2. **Read-Only Constraint**: As a SPECIFICATION MINER, no code modifications have been made. All discoveries, line numbers, and required remediations are cataloged for the remediation agent.
3. **No Local PDF Binary**: The repository contains the extracted TypeScript datasets and parser scripts (`scratch/generate_baour_dataset.cjs`), but no raw `.pdf` binary file is committed in the repository (text was extracted from the user's uploaded ministerial PDF).

---

## 4. Conclusion

Requirement R2 is partially satisfied in the static dataset (`libyanBaourSchoolDataset.ts` contains all 873 authentic students with 7-digit registration numbers and `motherName: '—'`), but is **compromised across the dynamic importers, engine, and UI**:

1. **Fake Mother's Names Exist in 5 Core Files**:
   - `src/services/importers/pdfStudentParser.ts` (Lines 260, 324, 328–334, 447)
   - `src/services/ai/smartDataEngine.ts` (Line 137)
   - `src/components/admin/PdfStudentImporterModal.tsx` (Line 180)
   - `src/components/admin/ExcelStudentImporterModal.tsx` (Lines 219–222)
   - `src/utils/excelHelper.ts` (Line 28)
2. **Missing Manual Edit Capability**:
   - Neither `AdminDashboard.tsx` nor `SchoolContext.tsx` provides an interface or mutation to manually edit a student's `motherName` (or any details) to replace `—` with a real name when known.
3. **System Reset Destroys Roster**:
   - Resetting the database via `SchoolContext.tsx:1062` reverts the entire system to 5 mock students (`SEED_STUDENTS`) instead of `LIBYAN_BAOUR_STUDENTS`.
4. **Importer Discrepancies**:
   - `PdfStudentImporterModal.tsx` has `autoDistributeSections` that mangles Al-Baour's 28 classes into `9/أ`, `9/ب`.
   - `StudentExcelManager.tsx` writes to outdated `localStorage` key `madrasa_db_students_v2`.
   - `ExcelStudentImporterModal.tsx` is duplicated twice in `AdminDashboard.tsx`.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Student Count & Mother Name in Dataset**:
   - Inspect `src/data/libyanBaourSchoolDataset.ts`:
     - Line 17: `totalStudents: 873`
     - Line 31 to 57650: Exactly 873 student entities.
     - Search for `"motherName": "—"`: Exactly 873 occurrences.
     - Search for any female name in `motherName`: 0 occurrences.
2. **Verify Hallucinated Names in Importers**:
   - Inspect `src/services/importers/pdfStudentParser.ts`:
     - Line 260: Verify `'عائشة الفيتوري'` and `'فاطمة الترهوني'`.
     - Line 324: Verify `'فاطمة مفتاح'` and `'سليمة عمر'`.
     - Line 447: Verify `'فاطمة محمد'`.
   - Inspect `src/services/ai/smartDataEngine.ts`:
     - Line 137: Verify `raw.motherName || 'فاطمة محمد'`.
   - Inspect `src/components/admin/PdfStudentImporterModal.tsx`:
     - Line 180: Verify fallback `s.motherName || 'عائشة الفيتوري'`.
3. **Verify System Reset Regressions**:
   - Inspect `src/context/SchoolContext.tsx` line 1062:
     - `setStudents(SEED_STUDENTS);` — confirms reset reverts to 5 mock students.
   - Inspect `src/services/db.ts` line 514:
     - `export const SEED_STUDENTS: Student[] = [...]` — confirms only 5 dummy students.
4. **Verify Storage Key Inconsistency**:
   - Inspect `src/components/admin/StudentExcelManager.tsx` line 86:
     - Uses `'madrasa_db_students_v2'`.
   - Inspect `src/services/db.ts` line 51:
     - Uses `'madrasa_db_students_v3'`.
5. **Invalidation Conditions**:
   - If `libyanBaourSchoolDataset.ts` has fewer or more than 873 records.
   - If `pdfStudentParser.ts` does not contain the quoted hardcoded names.
