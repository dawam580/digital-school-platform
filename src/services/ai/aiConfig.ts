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
  status: 'active' | 'inactive' | 'testing';
  provider: string;
  lastConnectedAt?: string;
}

const DEFAULT_AI_CREDENTIALS: AiCredentials = {
  keyId: 'egtr7lqivu6mombnu3m1omunh9',
  keySecret: '9ce6ea4d-dd43-416b-9706-6054d4c98cd6',
  rawToken: 'ZWd0cjdscWl2dTZtb21ibnUzbTFvbXVuaDk:OWNlNmVhNGQtZGQ0My00MTZiLTk3MDYtNjA1NGQ0Yzk4Y2Q2',
  openAiApiKey: 'sk-OvgVwHOJ3ihfyxn3ZTe5LS82v0SyW0ebmvbizFlXH7GeEhfy',
  status: 'active',
  provider: 'OpenAI & Cloud Document Intelligence (Libyan Schools Edition)',
  lastConnectedAt: new Date().toISOString()
};

export class AiConfigService {
  private static STORAGE_KEY = 'madrasa_ai_credentials_v1';

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

    if (creds.rawToken && creds.rawToken.trim().startsWith('sk-')) {
      updated.openAiApiKey = creds.rawToken.trim();
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
