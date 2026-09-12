---
trigger: always_on
description: Consult and synchronize the architecture graph & tree at graphify-out/ for all codebase inquiries and updates.
---

# Architecture Tree & Knowledge Graph Rules (قاعدة الشجرة والرسم البياني للمشروع)

This project maintains a complete visual and relational architecture graph in `graphify-out/`.
The primary visual tree requested and approved by the user is `graphify-out/GRAPH_TREE.html` (along with `graph.html` and `graph.json`).

## Core Directives:

### 1. Read & Inspect (قراءة وفحص المشروع من الشجرة والرسم البياني)
- Whenever the user asks to inspect, read, review, or understand the architecture, module relationships, components, or files:
  - First consult `graphify-out/GRAPH_TREE.html` (interactive collapsible tree viewer) and `graphify-out/graph.json` (989+ nodes, 2885+ relationships, 54+ communities).
  - Use `graphify query "<question>"` or check the AST nodes in `graphify-out/graph.json` to trace imports, calls, dependencies, and hierarchy before deep-diving into individual source files.
  - Interactive 2D/3D visualization is available in `graphify-out/graph.html`.

### 2. Update & Synchronize (تحديث ومزامنة الشجرة والرسم البياني بعد أي تعديل)
- Whenever code files, components, services, or pages are added, modified, or deleted:
  - Immediately run `npm.cmd run graph:sync` (or `node scripts/sync-architecture-graph.cjs`).
  - This executes AST extraction (`graphify extract . --code-only --force`), regenerates `graphify-out/GRAPH_TREE.html`, and re-exports `graphify-out/graph.html` and `graphify-out/graph.json`.
  - Ensures zero drift between actual code and the architecture tree.

### 3. Quick Links & Artifacts
- **Interactive Collapsible Tree**: `graphify-out/GRAPH_TREE.html`
- **Interactive 2D/3D Knowledge Graph**: `graphify-out/graph.html`
- **GraphRAG Data**: `graphify-out/graph.json`
- **Sync Command**: `npm.cmd run graph:sync` (or `node scripts/sync-architecture-graph.cjs`)
