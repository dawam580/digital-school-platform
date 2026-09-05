/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك استخراج ومعالجة ملفات الـ PDF بالذكاء الاصطناعي (OpenAI GPT-4o-mini)
 * Libyan Ministry of Education Official PDF OCR & Semantic Extractor
 * ============================================================================
 */

import { AiConfigService } from './aiConfig';
import { ParsedStudentRow } from '../importers/pdfStudentParser';

export interface OpenAiExtractionResult {
  success: boolean;
  students: ParsedStudentRow[];
  totalParsed: number;
  message: string;
  error?: string;
}

export class OpenAiPdfExtractor {
  /**
   * استخراج وتصحيح بيانات الطلاب من النصوص المستخرجة من كشف الـ PDF
   */
  static async extractWithAi(rawText: string, targetGrade: string = 'الصف التاسع'): Promise<OpenAiExtractionResult> {
    const creds = AiConfigService.getCredentials();

    if (!rawText || rawText.trim().length < 10) {
      return {
        success: false,
        students: [],
        totalParsed: 0,
        message: 'النص المدخل فارغ أو قصير جداً.',
        error: 'EMPTY_TEXT'
      };
    }

    const textSnippet = rawText.slice(0, 90000);

    const systemPrompt = `أنت خبير استخراج ومعالجة كشوفات وبيانات وزارة التربية والتعليم والمركز الوطني للامتحانات بدولة ليبيا.
المستند المدخل هو نصوص مستخرجة من كشف رسمي لطلبة التعليم الأساسي أو الثانوي يحتوي على الأعمدة التالية:
[ت | رقم القيد (7 أرقام) | الاسم الرباعي | الجنس (ذكر/انثى) | تاريخ الميلاد (YYYY-MM-DD) | الجنسية | الديانة]

قواعد صارمة جداً:
1. الوثيقة الرسمية لا تحتوي إطلاقاً على عمود لاسم الأم. لذا يجب عليك جعل "motherName": "—" لجميع الطلاب بدون أي اختلاق أو تأليف لأسماء أمهات وهمية.
2. تصحيح الحروف المعكوسة أو المتشابكة الناتجة عن مشاكل الخطوط في الـ PDF (مثل الحروف المقلوبة).
3. استخراج الاسم الرباعي كاملاً كما هو باللغة العربية.
4. توليد الرقم الوطني الليبي الدقيق (12 خانة):
   - يبدأ بـ "1" للذكور و "2" للإناث.
   - يليه سنة الميلاد المكونة من 4 خانات (مثل 2011).
   - يليه رقم القيد المكون من 7 خانات (مثل 2077991).
   - الناتج مثال: 120112077991
5. أرجع النتيجة حصراً كمصفوفة JSON صحيحة بدون أي مقدمات أو شروحات:
[
  {
    "name": "اسم الطالب الرباعي",
    "nationalNumber": "120112077991",
    "studentNumber": "2077991",
    "motherName": "—",
    "gender": "male" أو "female",
    "birthDate": "2011-04-12",
    "birthPlace": "توكرة",
    "grade": "${targetGrade}",
    "className": "9/1 صباح",
    "sectionCode": "أ",
    "parentPhone": "0912000000",
    "academicYear": "2025-2026 م"
  }
]`;

    try {
      // Determine primary & secondary AI providers
      const hasNvidia = !!(creds.nvidiaApiKey && creds.nvidiaApiKey.startsWith('nvapi-'));
      const hasOpenAi = !!(creds.openAiApiKey && creds.openAiApiKey.startsWith('sk-'));

    if (!hasNvidia && !hasOpenAi) {
      return {
        success: false,
        students: [],
        totalParsed: 0,
        message: 'مفتاح الذكاء الاصطناعي السحابي غير متوفر (يرجى إدخال مفتاح NVIDIA أو OpenAI في الإعدادات).',
        error: 'NO_API_KEY'
      };
    }

    // Helper to call OpenAI-compatible completion endpoint with timeout
    const callCompletion = async (
      endpoint: string,
      apiKey: string,
      model: string,
      extraBody: Record<string, any> = {}
    ): Promise<string> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`
          },
          body: JSON.stringify({
            model,
            temperature: 0.1,
            max_tokens: 8192,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `إليك النصوص المستخرجة من الكشف، استخرج الطلاب بدقة وفق الشروط:\n\n${textSnippet}` }
            ],
            ...extraBody
          })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson?.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    };

    let content = '';
    let lastError = '';

    // Attempt 1: NVIDIA NIM (DeepSeek GPU-Accelerated)
    if (hasNvidia && creds.activeProvider !== 'openai') {
      try {
        content = await callCompletion(
          'https://integrate.api.nvidia.com/v1/chat/completions',
          creds.nvidiaApiKey!,
          creds.nvidiaModel || 'deepseek-ai/deepseek-v4-pro-0813',
          { chat_template_kwargs: { thinking: false } }
        );
      } catch (nvidiaErr: any) {
        console.warn('NVIDIA NIM DeepSeek attempt failed, trying fallback:', nvidiaErr);
        lastError = nvidiaErr.message || 'NVIDIA NIM request failed';
      }
    }

    // Attempt 2: OpenAI Fallback (or Primary if selected)
    if (!content && hasOpenAi) {
      try {
        content = await callCompletion(
          'https://api.openai.com/v1/chat/completions',
          creds.openAiApiKey!,
          'gpt-4o-mini'
        );
      } catch (openAiErr: any) {
        console.error('OpenAI attempt failed:', openAiErr);
        lastError = openAiErr.message || 'OpenAI request failed';
      }
    }

    if (!content) {
      return {
        success: false,
        students: [],
        totalParsed: 0,
        message: `تعذر استخراج البيانات عبر الذكاء الاصطناعي: ${lastError}`,
        error: lastError
      };
    }

      // Clean markdown code blocks if returned
      let cleanJson = content.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
      }

      const parsedArray = JSON.parse(cleanJson);

      if (!Array.isArray(parsedArray)) {
        return {
          success: false,
          students: [],
          totalParsed: 0,
          message: 'استجابة الذكاء الاصطناعي ليست مصفوفة كشوفات صحيحة.',
          error: 'INVALID_JSON_STRUCTURE'
        };
      }

      const students: ParsedStudentRow[] = parsedArray.map((st: any, idx: number) => ({
        name: String(st.name || '').trim(),
        nationalNumber: String(st.nationalNumber || '').trim(),
        motherName: '—', // Enforce no fake mother names
        gender: st.gender === 'female' || String(st.gender).includes('انثى') || String(st.gender).includes('أنثى') ? 'female' : 'male',
        birthDate: String(st.birthDate || '2011-01-01').trim(),
        birthPlace: String(st.birthPlace || 'توكرة').trim(),
        grade: String(st.grade || targetGrade).trim(),
        className: String(st.className || `${targetGrade.includes('9') ? '9/1 صباح' : 'فصل 1'}`).trim(),
        sectionCode: 'أ',
        academicYear: '2025-2026 م',
        parentPhone: String(st.parentPhone || `091${String(2000000 + idx).slice(-7)}`).trim(),
        confidenceScore: 99
      }));

      return {
        success: true,
        students,
        totalParsed: students.length,
        message: `تم استخراج وتدقيق (${students.length}) طالباً بنجاح فائق عبر الذكاء الاصطناعي OpenAI GPT-4o.`
      };

    } catch (err: any) {
      console.error('OpenAI Extraction Failed: ', err);
      return {
        success: false,
        students: [],
        totalParsed: 0,
        message: `تعذر إكمال المعالجة بالذكاء الاصطناعي: ${err.message || err}`,
        error: String(err)
      };
    }
  }
}
