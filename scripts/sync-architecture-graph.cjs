const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const graphifyOut = path.join(rootDir, 'graphify-out');

function findPython() {
  const pyCandidates = [
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python312', 'python.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python311', 'python.exe'),
    'python.exe',
    'python3'
  ];

  for (const cand of pyCandidates) {
    if (!cand) continue;
    try {
      if (fs.existsSync(cand)) {
        const testOut = execSync(`"${cand}" -c "import graphify; print('OK')"`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
        if (testOut.includes('OK')) return cand;
      }
    } catch {
      // try next
    }
  }

  // fallback to system command
  try {
    const testSys = execSync(`python -c "import graphify; print('OK')"`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    if (testSys.includes('OK')) return 'python';
  } catch {}

  return null;
}

const pythonExe = findPython();
if (!pythonExe) {
  console.error('[sync-graph] ERROR: Python with graphify package not found.');
  process.exit(1);
}

console.log(`[sync-graph] Using Python: ${pythonExe}`);
console.log('[sync-graph] Step 1: Extracting AST graph (--code-only --force)...');
execSync(`"${pythonExe}" -m graphify extract . --code-only --force`, { cwd: rootDir, stdio: 'inherit' });

console.log('[sync-graph] Step 2: Regenerating collapsible architecture tree (GRAPH_TREE.html)...');
execSync(`"${pythonExe}" -m graphify tree --graph graphify-out/graph.json --output graphify-out/GRAPH_TREE.html --root . --label "Madrasa Architecture Tree"`, { cwd: rootDir, stdio: 'inherit' });

console.log('[sync-graph] Step 3: Exporting interactive 2D/3D knowledge graph (graph.html)...');
execSync(`"${pythonExe}" -m graphify export html --graph graphify-out/graph.json`, { cwd: rootDir, stdio: 'inherit' });

console.log('[sync-graph] SUCCESS: Architecture tree & knowledge graph are 100% up to date!');
