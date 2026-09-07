/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * المساعد الذكي ومهندس المنظومة السحابي (School AI Copilot & Architect)
 * مدعوم بنموذج Claude Opus 4.8 عبر SeekAI مع التبديل التلقائي لـ NVIDIA NIM DeepSeek
 * ============================================================================
 */

import { AiConfigService } from './aiConfig';

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

const SYSTEM_COPILOT_PROMPT = `أنت المساعد البرمجي والإداري الذكي لمنظومة المدرسة الرقمية الليبية (Digital School Platform).
أنت مدعوم بنموذج Claude Opus 4.8 الفائق ومحرك GPU السحابي المتطور.

مهامك واختصاصاتك:
1. المساعدة في بناء وتطوير وبرمجة كود المنظومة (React, TypeScript, Tailwind CSS, IndexedDB, Vite, Electron).
2. الإجابة على استفسارات إدارة المدرسة، المعلمين، الكنترول، والأخصائي الاجتماعي بدقة ووفق لوائح وزارة التربية والتعليم الليبية والمركز الوطني للامتحانات.
3. صياغة المراسلات الإدارية، الخطابات الرسمية لأولياء الأمور، وجداول الحصص.
4. تقديم اقتراحات وتعديلات برمجية جاهزة للنسخ والتطبيق مع توضيحات موجزة ومهنية.
5. الإجابة باللغة العربية الفصحى الأنيقة وبشكل منظم ومرتب مع استخدام التنسيق الجذاب (Markdown, النقاط, الكود).`;

export class SchoolAiCopilotService {
  /**
   * إرسال استفسار للمساعد الذكي مع المعالجة التلقائية للتبديل بين النماذج
   */
  static async ask(
    prompt: string,
    history: CopilotMessage[] = []
  ): Promise<{ response: string; model: string; provider: string }> {
    const creds = AiConfigService.getCredentials();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      throw new Error('يرجى كتابة نص الاستفسار أولاً.');
    }

    const messages = [
      { role: 'system', content: SYSTEM_COPILOT_PROMPT },
      ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: cleanPrompt }
    ];

    // Provider 1: SeekAI Claude Opus 4.8
    const seekKey = creds.seekAiApiKey || (creds.openAiApiKey?.startsWith('sk-') ? creds.openAiApiKey : '');
    if (seekKey && creds.activeProvider !== 'nvidia') {
      try {
        const res = await this.callSeekAi(seekKey, creds.seekAiModel || 'claude-opus-4-8', messages);
        if (res) {
          return {
            response: res,
            model: 'Claude Opus 4.8 (SeekAI)',
            provider: 'SeekAI AI Cloud'
          };
        }
      } catch (err: any) {
        console.warn('SeekAI Claude Opus attempt fallback:', err.message);
      }
    }

    // Provider 2: NVIDIA NIM DeepSeek V4 GPU Cloud
    const nvidiaKey = creds.nvidiaApiKey || (creds.rawToken?.startsWith('nvapi-') ? creds.rawToken : '');
    if (nvidiaKey) {
      try {
        const res = await this.callNvidiaNim(
          nvidiaKey,
          creds.nvidiaModel || 'deepseek-ai/deepseek-v4-pro-0813',
          messages
        );
        if (res) {
          return {
            response: res,
            model: 'DeepSeek-V4 Pro (NVIDIA NIM GPU Cloud)',
            provider: 'NVIDIA GPU Cloud'
          };
        }
      } catch (err: any) {
        console.warn('NVIDIA NIM attempt fallback:', err.message);
      }
    }

    // Provider 3: OpenAI Direct (if standard OpenAI key)
    if (creds.openAiApiKey && creds.openAiApiKey.startsWith('sk-proj-')) {
      try {
        const res = await this.callOpenAiDirect(creds.openAiApiKey, 'gpt-4o-mini', messages);
        if (res) {
          return {
            response: res,
            model: 'GPT-4o Mini',
            provider: 'OpenAI Cloud'
          };
        }
      } catch (err: any) {
        console.warn('OpenAI fallback error:', err.message);
      }
    }

    // Fallback: Intelligent Deterministic Local Assistant
    return {
      response: this.getLocalAssistantResponse(cleanPrompt),
      model: 'Libyan School Offline Intelligence',
      provider: 'Local Engine'
    };
  }

  /**
   * استدعاء SeekAI (Claude Opus 4.8)
   */
  private static async callSeekAi(apiKey: string, model: string, messages: Array<{ role: string; content: string }>): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 35000);

    try {
      const response = await fetch('https://seekai.cc/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.4,
          max_tokens: 3000
        })
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  }

  /**
   * استدعاء NVIDIA NIM DeepSeek
   */
  private static async callNvidiaNim(apiKey: string, model: string, messages: Array<{ role: string; content: string }>): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 40000);

    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          max_tokens: 4096,
          chat_template_kwargs: { thinking: false }
        })
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  }

  /**
   * استدعاء OpenAI Direct
   */
  private static async callOpenAiDirect(apiKey: string, model: string, messages: Array<{ role: string; content: string }>): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * ردود ذكية سريعة محلية عند انقطاع الإنترنت أو التبديل الطارئ
   */
  private static getLocalAssistantResponse(prompt: string): string {
    const p = prompt.toLowerCase();
    if (p.includes('غياب') || p.includes('حضور')) {
      return `### 📋 تقرير وتوجيهات الحضور والغياب:
- تنص لائحة تنظيم شؤون التعليم والامتحانات الليبية على إنذار ولي الأمر بعد غياب **3 أيام متتالية** أو **5 أيام متفرقة** دون عذر رسمي.
- يمكنك تسجيل الحضور لكل حصة (الأولى حتى الخامسة) بنقرة واحدة من **بوابة المعلم الميسرة**.
- يتم إشعار ولي الأمر فورياً عبر التنبيهات المدرسية عند رصد أي غياب غير مبرر.`;
    }
    if (p.includes('درجات') || p.includes('امتحان') || p.includes('كنترول')) {
      return `### 🎯 نظام رصد وتقييم الدرجات المعتمد:
- أعمال السنة (الفترة الأولى والثانية): **40 درجة**.
- الامتحان النهائي لنهاية الفصل/العام: **60 درجة**.
- المجموع الكلي: **100 درجة**، والدرجة الصغرى للنجاح هي **50 درجة**.
- يوفر شيت الكنترول إمكانية اعتماد وإقفال الرصد بكلمة مرور لمنع أي تعديل بعد انتهاء الامتحانات.`;
    }
    if (p.includes('معلم') || p.includes('فصل') || p.includes('9/أ') || p.includes('تاسع')) {
      return `### 👨‍🏫 هيكل الفصول والمعلمين:
- تم فصل معلمي الصفوف السابع والثامن والتاسع لضمان عدم وجود أي تضارب.
- الصف التاسع أ (\`9/1 صباح\`) يضم **27 طالباً مقيداً** بأرقام قيدهم وتواريخ ميلادهم الحقيقية.
- المعلم **أ. أدم المنصوري** (\`LIB-COMP-09\`) هو معلم مادة الحاسوب وتقنية المعلومات لطلبة الشهادة الإعدادية.`;
    }
    return `أهلاً بك! تم استلام استفسارك: "${prompt}".
المنظومة مهيأة بنموذج **Claude Opus 4.8** و **NVIDIA NIM DeepSeek** السحابي. يمكنك توجيه سؤالك حول كود المنظومة، شيت الدرجات، استخراج ملفات الـ PDF، أو إدارة حسابات المدرسة.`;
  }
}
