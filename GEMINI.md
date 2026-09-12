# Project Directives & Architecture Graph Rules (قواعد المشروع والشجرة البيانية)

## 1. Architecture Tree & Knowledge Graph (شجرة ورسم بياني المشروع)
- The single source of truth for the complete project structure and symbol graph is located in `graphify-out/`:
  - **Tree Viewer**: `graphify-out/GRAPH_TREE.html` (D3 collapsible interactive architecture tree)
  - **Knowledge Graph**: `graphify-out/graph.html` (2D/3D visual network)
  - **Graph Data**: `graphify-out/graph.json` (complete AST nodes, edges, and communities)
- **Rule for Reading/Inspecting**: Whenever asked to read, inspect, or query project structure, modules, files, or relationships, always consult `graphify-out/GRAPH_TREE.html` and `graphify-out/graph.json`.
- **Rule for Updating**: Whenever any code, component, or service is modified or added, always synchronize the graph and tree by running:
  ```powershell
  npm.cmd run graph:sync
  ```
  (or `node scripts/sync-architecture-graph.cjs`).

## 2. Libyan School Context & Data Integrity
- **School**: مدرسة الشهيد امحمد الباعور للتعليم الأساسي
- **Students**: 873 real Libyan student records across 33 classes (1/1 to 9/4).
- **Storage**: Offline-first via IndexedDB & LocalStorage (`src/services/storage/indexedDb.ts`). Never wipe or replace real student data with generic mock data.
- **Licensing**: Remote validation via Firebase Firestore (`madrasa-license-2026`), zero modification of local student data.
- **UI Standard**: Pure Arabic RTL, Tailwind CSS, Lucide icons, shadcn/ui components (`src/components/ui/`).
