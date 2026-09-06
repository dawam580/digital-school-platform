import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('--- Running Tier 5: Windows Native & Desktop Integration Tests ---');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// 1. Electron Main script verification
const mainCjsPath = path.join(projectRoot, 'electron', 'main.cjs');
assert(fs.existsSync(mainCjsPath), 'electron/main.cjs exists');
const mainContent = fs.readFileSync(mainCjsPath, 'utf8');
assert(mainContent.includes('requestSingleInstanceLock'), 'electron/main.cjs enforces single instance lock');
assert(mainContent.includes('save-file-dialog'), 'electron/main.cjs has save-file-dialog IPC handler');
assert(mainContent.includes('open-file-dialog'), 'electron/main.cjs has open-file-dialog IPC handler');
assert(mainContent.includes('print-native'), 'electron/main.cjs has print-native IPC handler');
assert(mainContent.includes('window-minimize'), 'electron/main.cjs has window minimize IPC handler');
assert(mainContent.includes('window-maximize'), 'electron/main.cjs has window maximize IPC handler');
assert(mainContent.includes('open-path'), 'electron/main.cjs has open-path IPC handler for Windows Explorer');

// 2. Electron Preload script verification
const preloadCjsPath = path.join(projectRoot, 'electron', 'preload.cjs');
assert(fs.existsSync(preloadCjsPath), 'electron/preload.cjs exists');
const preloadContent = fs.readFileSync(preloadCjsPath, 'utf8');
assert(preloadContent.includes('contextBridge.exposeInMainWorld'), 'preload exposes secure contextBridge');
assert(preloadContent.includes('electronAPI'), 'preload exposes electronAPI namespace');
assert(preloadContent.includes('printNative'), 'preload exposes printNative bridge');
assert(preloadContent.includes('saveFileDialog'), 'preload exposes saveFileDialog bridge');

// 3. Launcher Batch & Scripts
const batchPath = path.join(projectRoot, 'Run-School-Desktop.bat');
assert(fs.existsSync(batchPath), 'Run-School-Desktop.bat launcher exists');
const batchContent = fs.readFileSync(batchPath, 'utf8');
assert(batchContent.includes('chcp 65001'), 'Run-School-Desktop.bat uses UTF-8 code page');
assert(batchContent.includes('electron'), 'Run-School-Desktop.bat contains electron execution logic');

// 4. Windows Desktop Shortcuts verification
const desktopPath = path.join(process.env.USERPROFILE || 'C:\\Users\\HP', 'Desktop');
const arabicShortcut = path.join(desktopPath, 'مدرسة الشهيد امحمد الباعور.lnk');
const englishShortcut = path.join(desktopPath, 'School-Platform.lnk');
assert(fs.existsSync(arabicShortcut) || fs.existsSync(englishShortcut), 'Windows desktop shortcut created successfully on Desktop');

// 5. Types and components
assert(fs.existsSync(path.join(projectRoot, 'src', 'types', 'electron.d.ts')), 'src/types/electron.d.ts exists');
assert(fs.existsSync(path.join(projectRoot, 'src', 'services', 'native', 'windowsBridge.ts')), 'src/services/native/windowsBridge.ts exists');
assert(fs.existsSync(path.join(projectRoot, 'src', 'components', 'desktop', 'WindowsTitleBar.tsx')), 'src/components/desktop/WindowsTitleBar.tsx exists');
assert(fs.existsSync(path.join(projectRoot, 'src', 'components', 'mobile', 'MobileCompanionModal.tsx')), 'src/components/mobile/MobileCompanionModal.tsx exists');

// 6. Production Bundle dist verification
assert(fs.existsSync(path.join(projectRoot, 'dist', 'index.html')), 'dist/index.html is built and ready for offline packaging');

console.log(`\nTier 5 Summary: ${passed}/${total} assertions passed successfully.`);
if (passed === total) {
  console.log('✅ ALL WINDOWS NATIVE & DESKTOP INTEGRATION TESTS PASSED!\n');
}
