export interface ElectronAPI {
  isDesktop: boolean;
  platform: string;
  version: string;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  isMaximized: () => Promise<boolean>;
  printNative: (options?: { silent?: boolean; deviceName?: string }) => Promise<{ success: boolean; failureReason?: string }>;
  saveFileDialog: (options: {
    defaultFileName?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    base64Data?: string;
    textData?: string;
  }) => Promise<{ canceled?: boolean; success?: boolean; filePath?: string; error?: string }>;
  openFileDialog: (options?: {
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => Promise<{ canceled?: boolean; success?: boolean; filePath?: string; fileName?: string; base64Data?: string; error?: string }>;
  openPath: (targetPath?: string) => Promise<{ success?: boolean; error?: string }>;
  showNotification: (options: { title: string; body: string }) => Promise<{ success?: boolean; error?: string }>;
  getSystemInfo: () => Promise<{
    platform: string;
    arch: string;
    hostname: string;
    osRelease: string;
    electronVersion: string;
    nodeVersion: string;
    chromeVersion: string;
    documentsPath: string;
    desktopPath: string;
  }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
