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
});
