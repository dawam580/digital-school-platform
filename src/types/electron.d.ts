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
  getMachineId?: () => string;
  isVendorMachine?: () => boolean;
  getIssuedLicenses?: () => Promise<Array<{
    id?: string; token: string; schoolName: string; hwid: string;
    licenseType: 'lifetime' | 'annual' | 'trial_extended';
    issuedAt: string; expiresAt: string; adminPhone?: string;
  }>>;
  getTrialStart?: (rendererStart?: number) => number;
  canSignLicense?: () => Promise<boolean>;
  signLicense?: (params: {
    schoolName: string;
    hwid: string;
    licenseType: 'lifetime' | 'annual' | 'trial_extended';
    adminPhone?: string;
  }) => Promise<{ success: boolean; token?: string; error?: string }>;
  loadPersistedStore?: () => Record<string, string> | null;
  persistStore?: (changes: Record<string, string | null>) => Promise<boolean>;
  persistStoreSync?: (changes: Record<string, string | null>) => boolean;
  listBackups?: () => Promise<Array<{ name: string; path: string; size: number; mtime: number }>>;
  openBackupsFolder?: () => Promise<{ success?: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
