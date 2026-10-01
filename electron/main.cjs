const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let mainWindow = null;

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function resolveIconPath() {
  const possiblePaths = [
    path.join(__dirname, '..', 'dist', 'favicon.ico'),
    path.join(__dirname, '..', 'public', 'favicon.ico'),
    path.join(__dirname, '..', 'dist', 'logo.png'),
    path.join(__dirname, '..', 'public', 'logo.png'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

function createWindow() {
  const iconPath = resolveIconPath();

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 700,
    title: 'منظومة المدرسة الرقمية للتعليم الأساسي | النظام الإداري والتعليمي المتكامل',
    icon: iconPath,
    backgroundColor: '#0b192c',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Arabic Application Menu
  const menuTemplate = [
    {
      label: 'ملف',
      submenu: [
        {
          label: 'طباعة الصفحة الحالية (Print)',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            if (mainWindow) mainWindow.webContents.print({ silent: false, printBackground: true });
          },
        },
        {
          label: 'فتح مجلد المستندات المدرسية',
          click: async () => {
            const docsDir = path.join(app.getPath('documents'), 'منظومة المدرسة الرقمية');
            if (!fs.existsSync(docsDir)) {
              fs.mkdirSync(docsDir, { recursive: true });
            }
            await shell.openPath(docsDir);
          },
        },
        { type: 'separator' },
        {
          label: 'إعادة تشغيل المنظومة (Reload)',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow && mainWindow.reload(),
        },
        {
          label: 'خروج من التطبيق',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'عرض',
      submenu: [
        { label: 'ملء الشاشة (Full Screen)', role: 'togglefullscreen', accelerator: 'F11' },
        { label: 'تكبير (Zoom In)', role: 'zoomIn', accelerator: 'CmdOrCtrl+Plus' },
        { label: 'تصغير (Zoom Out)', role: 'zoomOut', accelerator: 'CmdOrCtrl+-' },
        { label: 'الحجم الافتراضي (Reset Zoom)', role: 'resetZoom', accelerator: 'CmdOrCtrl+0' },
        // أدوات المطور متاحة في نسخة التطوير فقط — لا تظهر في النسخة المباعة
        ...(app.isPackaged ? [] : [
          { type: 'separator' },
          { label: 'أدوات المطور (DevTools)', role: 'toggleDevTools', accelerator: 'CmdOrCtrl+Shift+I' },
        ]),
      ],
    },
    {
      label: 'أدوات الويندوز',
      submenu: [
        {
          label: 'فتح سطح المكتب',
          click: async () => {
            await shell.openPath(app.getPath('desktop'));
          },
        },
        {
          label: 'فتح مجلد التنزيلات',
          click: async () => {
            await shell.openPath(app.getPath('downloads'));
          },
        },
      ],
    },
    {
      label: 'مساعدة',
      submenu: [
        {
          label: 'البوابة السحابية المباشرة (GitHub Pages)',
          click: async () => {
            await shell.openExternal('https://dawam580.github.io/digital-school-platform/');
          },
        },
        { type: 'separator' },
        {
          label: 'حول المنظومة المدرسية',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'منظومة المدرسة الرقمية الشاملة',
              message: 'منظومة الإدارة المدرسية والامتحانات الشاملة (Windows Edition)',
              detail: 'الإصدار: 2.0.0 (Native Desktop)\nنظام إدارة التعليم والامتحانات الشامل للمدارس الليبية.\nتطبيق مكتبي مخصص لنظام ويندوز مع تكامل الطباعة وحفظ الملفات محلياً.',
              buttons: ['حسناً'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Load production dist or local dev server
  const distPath = path.join(__dirname, '..', 'dist', 'index.html');
  // وضع المالك (--owner): يفتح بوابة المدير العام مباشرة — على جهاز المورّد فقط
  const ownerMode = process.argv.includes('--owner') && !!loadPrivateKey();
  if (ownerMode) mainWindow.setTitle('بوابة المالك — إدارة التراخيص والمدارس المشتركة');
  if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath, ownerMode ? { query: { role: 'superadmin' } } : undefined);
  } else if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    dialog.showErrorBox('خطأ في التثبيت', 'ملفات المنظومة غير مكتملة. يرجى إعادة التثبيت.');
    app.quit();
    return;
  }

  // حماية: لا تنقل داخل النافذة لمواقع خارجية، والروابط الخارجية تفتح في المتصفح
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowed = url.startsWith('file://') || (!app.isPackaged && url.startsWith('http://localhost:3000'));
    if (!allowed) {
      event.preventDefault();
      if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    }
  });
  if (app.isPackaged) {
    mainWindow.webContents.on('devtools-opened', () => mainWindow && mainWindow.webContents.closeDevTools());
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// -------------------------------------------------------------
// IPC Handlers: Native Windows Integration
// -------------------------------------------------------------

// Window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// Direct Native Printing
ipcMain.handle('print-native', async (event, options = {}) => {
  if (!mainWindow) return { success: false, error: 'No active window' };
  return new Promise((resolve) => {
    mainWindow.webContents.print(
      {
        silent: options.silent || false,
        printBackground: true,
        deviceName: options.deviceName || '',
        margins: { marginType: 'printableArea' },
      },
      (success, failureReason) => {
        resolve({ success, failureReason });
      }
    );
  });
});

// Export to Native File (Excel, PDF, Backup JSON)
ipcMain.handle('save-file-dialog', async (event, { defaultFileName, filters, base64Data, textData }) => {
  if (!mainWindow) return { success: false, error: 'No window' };

  const defaultDir = path.join(app.getPath('documents'), 'منظومة المدرسة الرقمية');
  if (!fs.existsSync(defaultDir)) {
    try {
      fs.mkdirSync(defaultDir, { recursive: true });
    } catch {}
  }

  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'حفظ الملف في نظام ويندوز',
    defaultPath: path.join(defaultDir, defaultFileName || 'تقرير-مدرسي.xlsx'),
    filters: filters || [
      { name: 'جداول إكسل (Excel)', extensions: ['xlsx', 'xls'] },
      { name: 'ملفات PDF', extensions: ['pdf'] },
      { name: 'ملفات البيانات (JSON)', extensions: ['json'] },
      { name: 'كافة الملفات', extensions: ['*'] },
    ],
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  try {
    if (base64Data) {
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);
    } else if (textData) {
      fs.writeFileSync(filePath, textData, 'utf8');
    }
    return { success: true, filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Open File Dialog
ipcMain.handle('open-file-dialog', async (event, { filters }) => {
  if (!mainWindow) return { canceled: true };

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'اختيار ملف للاستيراد',
    properties: ['openFile'],
    filters: filters || [
      { name: 'ملفات الكشوفات والبيانات', extensions: ['xlsx', 'xls', 'pdf', 'json'] },
      { name: 'كافة الملفات', extensions: ['*'] },
    ],
  });

  if (canceled || !filePaths.length) {
    return { canceled: true };
  }

  try {
    const filePath = filePaths[0];
    const fileBuffer = fs.readFileSync(filePath);
    return {
      success: true,
      filePath,
      fileName: path.basename(filePath),
      base64Data: fileBuffer.toString('base64'),
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Open Folder in Windows File Explorer
ipcMain.handle('open-path', async (event, targetPath) => {
  try {
    // يُسمح بفتح مجلدات المنظومة فقط — لا تشغيل ملفات تنفيذية أو مسارات عشوائية
    const docsRoot = path.join(app.getPath('documents'), 'منظومة المدرسة الرقمية');
    const allowedRoots = [docsRoot, path.join(app.getPath('userData'), 'backups')];
    const resolvedPath = path.resolve(targetPath || docsRoot);
    const insideAllowed = allowedRoots.some(root => resolvedPath === root || resolvedPath.startsWith(root + path.sep));
    if (!insideAllowed) {
      return { success: false, error: 'مسار غير مسموح.' };
    }
    if (!fs.existsSync(resolvedPath)) {
      fs.mkdirSync(resolvedPath, { recursive: true });
    }
    if (!fs.statSync(resolvedPath).isDirectory()) {
      shell.showItemInFolder(resolvedPath);
      return { success: true };
    }
    await shell.openPath(resolvedPath);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Show Native Windows Notification
ipcMain.handle('show-native-notification', (event, { title, body }) => {
  const { Notification } = require('electron');
  if (Notification.isSupported()) {
    const notif = new Notification({
      title: title || 'منظومة المدرسة الرقمية',
      body: body || '',
      icon: resolveIconPath(),
    });
    notif.show();
    return { success: true };
  }
  return { success: false, error: 'Notifications not supported' };
});

// Get System Info
ipcMain.handle('get-system-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    hostname: os.hostname(),
    osRelease: os.release(),
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome,
    documentsPath: app.getPath('documents'),
    desktopPath: app.getPath('desktop'),
  };
});


// -------------------------------------------------------------
// الترخيص: بصمة الجهاز + ختم الفترة التجريبية + التوقيع (لجهاز المورّد فقط)
// -------------------------------------------------------------
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { loadPrivateKey, signLicense, readLedger } = require('./vendorKey.cjs');

let cachedMachineId = null;
function getMachineId() {
  if (cachedMachineId) return cachedMachineId;
  let raw = '';
  try {
    if (process.platform === 'win32') {
      const out = execFileSync('reg', ['query', 'HKLM\\SOFTWARE\\Microsoft\\Cryptography', '/v', 'MachineGuid'], { encoding: 'utf8', windowsHide: true, timeout: 5000 });
      const m = out.match(/MachineGuid\s+REG_SZ\s+([0-9a-fA-F-]+)/);
      if (m) raw = m[1];
    }
  } catch {}
  if (!raw) raw = `${os.hostname()}|${os.cpus()[0] ? os.cpus()[0].model : ''}|${os.totalmem()}`;
  const h = crypto.createHash('sha256').update('madrasa-hwid-v3|' + raw.toLowerCase()).digest('hex').toUpperCase();
  cachedMachineId = `HWID-LY-${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}`;
  return cachedMachineId;
}

// ختم بداية التجربة في موضعين خارج بيانات المتصفح؛ يُعتمد الأقدم دائماً.
function trialSealPaths() {
  const list = [path.join(app.getPath('userData'), '.ts-seal')];
  if (process.env.LOCALAPPDATA) list.push(path.join(process.env.LOCALAPPDATA, '.madrasa-sys', 'ts'));
  return list;
}
function getTrialStart(rendererStart) {
  const seals = [];
  for (const p of trialSealPaths()) {
    try { const v = Number(fs.readFileSync(p, 'utf8').trim()); if (v > 0) seals.push(v); } catch {}
  }
  const r = Number(rendererStart) || 0;
  if (r > 0) seals.push(r);
  const start = seals.length ? Math.min(...seals) : Date.now();
  for (const p of trialSealPaths()) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, String(start)); } catch {}
  }
  return start;
}

ipcMain.on('license-machine-id', (event) => { event.returnValue = getMachineId(); });
ipcMain.on('license-trial-start', (event, rendererStart) => { event.returnValue = getTrialStart(rendererStart); });
ipcMain.handle('license-can-sign', () => !!loadPrivateKey());
ipcMain.on('license-is-vendor', (event) => { event.returnValue = !!loadPrivateKey(); });
ipcMain.handle('license-ledger', () => (loadPrivateKey() ? readLedger() : []));
ipcMain.handle('license-sign', (event, params) => {
  const key = loadPrivateKey();
  if (!key) return { success: false, error: 'هذا الجهاز ليس جهاز المورّد المعتمد — لا يوجد مفتاح توقيع.' };
  try {
    return { success: true, ...signLicense(key, params || {}) };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// -------------------------------------------------------------
// الحفظ الدائم على القرص + نسخ احتياطية يومية (حماية بيانات المدرسة)
// بيانات المتصفح وحدها قد تضيع؛ هنا نحفظ نسخة كاملة في ملف، ونسخة يومية
// في "المستندات\منظومة المدرسة الرقمية\النسخ الاحتياطية" (آخر 30 يوماً).
// -------------------------------------------------------------
const BACKUP_KEEP_DAYS = 30;
function storeFilePath() { return path.join(app.getPath('userData'), 'data', 'school-store.json'); }
function backupsDir() { return path.join(app.getPath('documents'), 'منظومة المدرسة الرقمية', 'النسخ الاحتياطية'); }

function writeFileAtomic(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, contents, 'utf8');
  fs.renameSync(tmp, file);
}

let persistedEntries = null;
function loadStore() {
  if (persistedEntries) return persistedEntries;
  for (const file of [storeFilePath(), storeFilePath() + '.prev']) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (parsed && parsed.entries && typeof parsed.entries === 'object') {
        persistedEntries = parsed.entries;
        return persistedEntries;
      }
    } catch {}
  }
  persistedEntries = {};
  return persistedEntries;
}

function rotateDailyBackup(json) {
  try {
    const dir = backupsDir();
    const today = new Date().toISOString().slice(0, 10);
    const file = path.join(dir, `نسخة-احتياطية-${today}.json`);
    writeFileAtomic(file, json);
    const old = fs.readdirSync(dir).filter(f => /^نسخة-احتياطية-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
    while (old.length > BACKUP_KEEP_DAYS) {
      try { fs.unlinkSync(path.join(dir, old.shift())); } catch {}
    }
  } catch {}
}

function persistEntries(changes) {
  const entries = { ...loadStore() };
  for (const [k, v] of Object.entries(changes || {})) {
    if (typeof k !== 'string' || !k.startsWith('madrasa_')) continue;
    if (v === null) delete entries[k];
    else entries[k] = String(v);
  }
  persistedEntries = entries;
  const json = JSON.stringify({ app: 'madrasa', version: 1, savedAt: new Date().toISOString(), entries });
  try { if (fs.existsSync(storeFilePath())) fs.copyFileSync(storeFilePath(), storeFilePath() + '.prev'); } catch {}
  writeFileAtomic(storeFilePath(), json);
  rotateDailyBackup(json);
}

ipcMain.on('store-load', (event) => { event.returnValue = loadStore(); });
ipcMain.on('store-persist-sync', (event, changes) => {
  try { persistEntries(changes); event.returnValue = true; } catch { event.returnValue = false; }
});
ipcMain.handle('store-persist', (event, changes) => {
  try { persistEntries(changes); return true; } catch { return false; }
});
ipcMain.handle('backups-list', () => {
  try {
    const dir = backupsDir();
    return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(name => {
      const st = fs.statSync(path.join(dir, name));
      return { name, path: path.join(dir, name), size: st.size, mtime: st.mtimeMs };
    }).sort((a, b) => b.mtime - a.mtime);
  } catch { return []; }
});
ipcMain.handle('backups-open-folder', async () => {
  try { fs.mkdirSync(backupsDir(), { recursive: true }); await shell.openPath(backupsDir()); return { success: true }; }
  catch (err) { return { success: false, error: err.message }; }
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
