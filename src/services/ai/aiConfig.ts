/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * إعدادات مفاتيح وتكامل الذكاء الاصطناعي السحابي لقراءة المستندات والـ PDF
 * AI Cloud Intelligence & OCR Credentials Configuration
 * ============================================================================
 */

export interface AiCredentials {
  keyId: string;
  keySecret: string;
  rawToken: string;
  openAiApiKey?: string;
  nvidiaApiKey?: string;
  nvidiaModel?: string;
  nvidiaBaseUrl?: string;
  activeProvider: 'nvidia' | 'openai' | 'auto';
  status: 'active' | 'inactive' | 'testing';
  provider: string;
  lastConnectedAt?: string;
}

const DEFAULT_AI_CREDENTIALS: AiCredentials = {
  keyId: 'nvidia-nim-deepseek',
  keySecret: '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',
  rawToken: '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',
  openAiApiKey: 'sk-OvgVwHOJ3ihfyxn3ZTe5LS82v0SyW0ebmvbizFlXH7GeEhfy',
  nvidiaApiKey: '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',
  nvidiaModel: 'deepseek-ai/deepseek-v4-pro-0813',
  nvidiaBaseUrl: 'https://integrate.api.nvidia.com/v1',
  activeProvider: 'nvidia',
  status: 'active',
  provider: 'NVIDIA NIM & DeepSeek AI GPU Cloud (Libyan Schools Edition)',
  lastConnectedAt: new Date().toISOString()
};

export class AiConfigService {
  private static STORAGE_KEY = 'madrasa_ai_credentials_v2';

  /**
   * جلب بيانات الاعتماد الحالية للذكاء الاصطناعي
   */
  static getCredentials(): AiCredentials {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_AI_CREDENTIALS;
  }

  /**
   * حفظ أو تحديث مفتاح الذكاء الاصطناعي
   */
  static saveCredentials(creds: Partial<AiCredentials>): AiCredentials {
    const current = this.getCredentials();
    const updated: AiCredentials = {
      ...current,
      ...creds,
      status: 'active',
      lastConnectedAt: new Date().toISOString()
    };

    if (creds.rawToken) {
      const token = creds.rawToken.trim();
      if (token.startsWith('nvapi-')) {
        updated.nvidiaApiKey = token;
        updated.activeProvider = 'nvidia';
        updated.provider = 'NVIDIA NIM & DeepSeek AI GPU Cloud';
      } else if (token.startsWith('sk-')) {
        updated.openAiApiKey = token;
        updated.activeProvider = 'openai';
        updated.provider = 'OpenAI Cloud Intelligence';
      }
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    return updated;
  }

  /**
   * فك تشفير وفحص مفتاح Base64 أو OpenAI
   */
  static parseToken(rawInput: string): { keyId: string; keySecret: string } | null {
    try {
      const trimmed = rawInput.trim();
      if (trimmed.startsWith('sk-')) {
        return { keyId: 'openai-gpt4o', keySecret: trimmed };
      }
      if (trimmed.includes(':')) {
        const parts = trimmed.split(':');
        let keyId = parts[0];
        let keySecret = parts[1];

        // If parts are base64 encoded
        try {
          if (keyId.length > 20 && !keyId.includes('-')) {
            const decoded1 = atob(keyId);
            if (decoded1 && decoded1.length > 5) keyId = decoded1;
          }
          if (keySecret.length > 20 && !keySecret.includes('-')) {
            const decoded2 = atob(keySecret);
            if (decoded2 && decoded2.length > 5) keySecret = decoded2;
          }
        } catch {}

        return { keyId, keySecret };
      }
    } catch {}
    return null;
  }

  /**
   * فحص حالة الاتصال
   */
  static isConnected(): boolean {
    const creds = this.getCredentials();
    return (!!creds.keyId || !!creds.openAiApiKey) && creds.status === 'active';
  }
}
