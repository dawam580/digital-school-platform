const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  platform: process.platform,
  version: '2.0.0-windows',
  
  // Window management
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // Native Windows Print
  printNative: (options) => ipcRenderer.invoke('print-native', options || {}),

  // Native Windows File System Dialogs
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options || {}),
  openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options || {}),
  openPath: (targetPath) => ipcRenderer.invoke('open-path', targetPath),

  // OS Notifications
  showNotification: (options) => ipcRenderer.invoke('show-native-notification', options || {}),

  // System Diagnostics
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // Licensing (بصمة الجهاز الحقيقية + ختم التجربة + التوقيع على جهاز المورّد فقط)
  getMachineId: () => ipcRenderer.sendSync('license-machine-id'),
  isVendorMachine: () => ipcRenderer.sendSync('license-is-vendor'),
  getTrialStart: (rendererStart) => ipcRenderer.sendSync('license-trial-start', rendererStart || 0),
  canSignLicense: () => ipcRenderer.invoke('license-can-sign'),
  signLicense: (params) => ipcRenderer.invoke('license-sign', params || {}),
  getIssuedLicenses: () => ipcRenderer.invoke('license-ledger'),

  // الحفظ الدائم على القرص + النسخ الاحتياطية
  loadPersistedStore: () => ipcRenderer.sendSync('store-load'),
  persistStore: (changes) => ipcRenderer.invoke('store-persist', changes || {}),
  persistStoreSync: (changes) => ipcRenderer.sendSync('store-persist-sync', changes || {}),
  vaultSave: (schoolId, json) => ipcRenderer.invoke('vault-save', schoolId, json),
  vaultLoad: (schoolId) => ipcRenderer.sendSync('vault-load', schoolId),
  vaultDelete: (schoolId) => ipcRenderer.invoke('vault-delete', schoolId),
  listBackups: () => ipcRenderer.invoke('backups-list'),
  openBackupsFolder: () => ipcRenderer.invoke('backups-open-folder'),
});
