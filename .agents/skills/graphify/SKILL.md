---
name: graphify
description: Turn any folder of files into a navigable knowledge graph and interactive architecture tree.
---

# Graphify Skill

Use this skill to extract an AST knowledge graph from code, generate the interactive architecture tree, and synchronize changes.

## Instructions

1. To run graph extraction and synchronize the architecture tree:
   ```powershell
   npm.cmd run graph:sync
   ```
2. The outputs are saved in `graphify-out/`:
   - Interactive Collapsible Tree: `graphify-out/GRAPH_TREE.html`
   - 2D/3D Network Visualizer: `graphify-out/graph.html`
   - Knowledge Graph AST Data: `graphify-out/graph.json`
