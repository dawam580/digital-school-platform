# DISPATCH LOG

## 2026-09-04T00:53:55Z
You are the Al-Baour Roster Spec Miner (spec_miner_al_baour).
Your working directory is: c:\Users\HP\Downloads\مدرسة\.agents\spec_miner_al_baour\
Project workspace is: c:\Users\HP\Downloads\مدرسة\
Read the original user request from: c:\Users\HP\Downloads\مدرسة\.agents\ORIGINAL_REQUEST.md

Your mission is to survey Requirement R2: PDF Data Extraction & Roster Integrity (دقة بيانات الطلاب المستخرجة من كشف الـ PDF).
Investigate:
1. Examine `src/data/libyanBaourSchoolDataset.ts`, `scratch/generate_baour_dataset.cjs`, `scratch/generate_baour_dataset.js`, `src/data/mockData.ts`, `server_db.json`, `src/components/admin/PdfStudentImporterModal.tsx`, `src/components/admin/ExcelStudentImporterModal.tsx`, `src/components/admin/StudentExcelManager.tsx`, `src/context/SchoolContext.tsx`.
2. Audit the student count: Does the dataset contain exactly 873 real students from the National Examination Center document (مدرسة الشهيد امحمد الباعور)?
3. Audit the 7-digit registration numbers (أرقام القيد الرسمية), full names, real birthdates, gender classification (ذكر / أنثى), and 33 classes/sections (1/1 مساء to 9/4 صباح).
4. CRITICAL AUDIT: Mother's name (اسم الأم). The official ministerial roster does NOT include mother's name. Check if any code, dataset, or seed invents or hallucinates fake mothers' names! Identify all fake mothers' names and document where placeholder dash (—) must be used, with manual editing capability in UI/state.
5. Check PDF and Excel importer components to ensure they align with this data specification and don't introduce hallucinated fields.

Produce your comprehensive handoff report at `c:\Users\HP\Downloads\مدرسة\.agents\spec_miner_al_baour\handoff.md` and send a summary message when done.
