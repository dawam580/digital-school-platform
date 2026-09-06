/**
 * Windows Native Bridge Service
 * Provides seamless abstraction between Electron Desktop capabilities and standard Web/PWA.
 */

export interface NativeExportOptions {
  fileName: string;
  blob?: Blob;
  base64?: string;
  text?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}

export interface NativeExportResult {
  success: boolean;
  canceled?: boolean;
  filePath?: string;
  native: boolean;
  error?: string;
}

export const isWindowsDesktop = (): boolean => {
  return typeof window !== 'undefined' && !!window.electronAPI?.isDesktop;
};

/**
 * Save exported file directly to Windows File System or download via browser
 */
export async function saveExportedFile(options: NativeExportOptions): Promise<NativeExportResult> {
  const { fileName, blob, base64, text, filters } = options;

  if (isWindowsDesktop() && window.electronAPI) {
    try {
      let resolvedBase64 = base64;

      if (!resolvedBase64 && blob) {
        resolvedBase64 = await blobToBase64(blob);
      }

      const res = await window.electronAPI.saveFileDialog({
        defaultFileName: fileName,
        filters,
        base64Data: resolvedBase64,
        textData: text,
      });

      if (res.canceled) {
        return { success: false, canceled: true, native: true };
      }

      if (res.success) {
        return { success: true, filePath: res.filePath, native: true };
      }

      return { success: false, error: res.error, native: true };
    } catch (err: any) {
      console.warn('Native save failed, falling back to browser download:', err);
    }
  }

  // Fallback: Web standard download
  try {
    let downloadBlob = blob;
    if (!downloadBlob && text) {
      downloadBlob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    } else if (!downloadBlob && base64) {
      downloadBlob = base64ToBlob(base64);
    }

    if (!downloadBlob) {
      return { success: false, error: 'No data to export', native: false };
    }

    const url = URL.createObjectURL(downloadBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, native: false };
  } catch (err: any) {
    return { success: false, error: err.message, native: false };
  }
}

/**
 * Native Print Dispatcher
 */
export async function executeNativePrint(silent = false): Promise<boolean> {
  if (isWindowsDesktop() && window.electronAPI) {
    try {
      const res = await window.electronAPI.printNative({ silent });
      return res.success;
    } catch (e) {
      console.warn('Native print error, falling back to window.print()', e);
    }
  }
  window.print();
  return true;
}

/**
 * Open School Documents directory in Windows File Explorer
 */
export async function openSchoolDocumentsFolder(): Promise<boolean> {
  if (isWindowsDesktop() && window.electronAPI) {
    const res = await window.electronAPI.openPath();
    return !!res.success;
  }
  return false;
}

/**
 * Send OS Native Notification
 */
export async function sendNativeNotification(title: string, body: string) {
  if (isWindowsDesktop() && window.electronAPI) {
    await window.electronAPI.showNotification({ title, body });
    return;
  }

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(title, { body, icon: './favicon.ico' });
  }
}

// Helpers
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string, contentType = 'application/octet-stream'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}
