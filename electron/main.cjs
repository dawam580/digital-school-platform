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
    title: 'منظومة مدرسة الشهيد امحمد الباعور الرقمية | النظام الإداري والتعليمي المتكامل',
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
            const docsDir = path.join(app.getPath('documents'), 'منظومة مدرسة الباعور');
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
        { type: 'separator' },
        { label: 'أدوات المطور (DevTools)', role: 'toggleDevTools', accelerator: 'CmdOrCtrl+Shift+I' },
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
              title: 'منظومة مدرسة الشهيد امحمد الباعور الرقمية',
              message: 'منظومة الإدارة المدرسية والامتحانات الشاملة (Windows Edition)',
              detail: 'الإصدار: 2.0.0 (Native Desktop)\nالمدرسة: الشهيد امحمد الباعور للتعليم الأساسي\nقاعدة البيانات: 873 طالباً و 33 فصلاً معتمدة وفق لائحة الامتحانات الليبية.\n\nتطبيق مكتبي مخصص لنظام ويندوز مع تكامل الطباعة وحفظ الملفات محلياً.',
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
  if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL('http://localhost:3000');
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

  const defaultDir = path.join(app.getPath('documents'), 'منظومة مدرسة الباعور');
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
    const resolvedPath = targetPath || path.join(app.getPath('documents'), 'منظومة مدرسة الباعور');
    if (!fs.existsSync(resolvedPath)) {
      fs.mkdirSync(resolvedPath, { recursive: true });
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
      title: title || 'منظومة مدرسة الشهيد امحمد الباعور',
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
