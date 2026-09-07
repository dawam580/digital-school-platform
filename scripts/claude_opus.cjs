const https = require('https');

const API_KEY = process.env.ANTHROPIC_API_KEY || 'sk-OvgVwHOJ3ihfyxn3ZTe5LS82v0SyW0ebmvbizFlXH7GeEhfy';
const BASE_URL = process.env.ANTHROPIC_BASE_URL || 'https://seekai.cc';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

/**
 * Helper to wait with exponential backoff
 */
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * Send a prompt to Claude Opus 4.8 via SeekAI with retry handling
 * @param {string} userPrompt 
 * @param {string} systemPrompt 
 * @param {number} maxRetries 
 * @returns {Promise<string>}
 */
async function askClaudeOpus(userPrompt, systemPrompt = 'أنت مساعد ذكاء اصطناعي خبير (Claude Opus 4.8) متخصص في البرمجة والتفكير المنطقي والهندسة البرمجية لمشروع منصة المدرسة الرقمية.', maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await new Promise((resolve, reject) => {
        const payload = JSON.stringify({
          model: MODEL,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt }
          ]
        });

        const url = new URL('/v1/messages', BASE_URL);

        const options = {
          hostname: url.hostname,
          port: 443,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Length': Buffer.byteLength(payload)
          }
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.content && parsed.content[0] && parsed.content[0].text) {
                resolve(parsed.content[0].text);
              } else if (parsed.error) {
                const isRateLimit = parsed.error.message && (
                  parsed.error.message.includes('limit') ||
                  parsed.error.message.includes('Too many') ||
                  parsed.error.message.includes('Concurrency')
                );
                reject({ isRateLimit, error: parsed.error });
              } else {
                resolve(data);
              }
            } catch (err) {
              resolve(data);
            }
          });
        });

        req.on('error', (err) => reject({ isRateLimit: false, error: err }));
        req.write(payload);
        req.end();
      });

      return response;
    } catch (err) {
      if (err.isRateLimit && attempt < maxRetries) {
        const delay = attempt * 2000;
        console.log(`⏳ [Claude Opus 4.8] قيد الانتظار للضغط على الخادم (${attempt}/${maxRetries})، إعادة المحاولة خلال ${delay / 1000} ثوان...`);
        await sleep(delay);
      } else {
        throw new Error(err.error?.message || JSON.stringify(err));
      }
    }
  }
}

/**
 * Fallback to NVIDIA NIM DeepSeek-V4 Cloud if SeekAI Claude Opus channel is in maintenance
 */
async function askNvidiaDeepSeek(userPrompt, systemPrompt) {
  const NVIDIA_KEY = process.env.NVIDIA_API_KEY || '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';
  const NVIDIA_MODEL = 'deepseek-ai/deepseek-v4-pro-0813';
  const url = 'https://integrate.api.nvidia.com/v1/chat/completions';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_KEY}`
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 600
      })
    });
    clearTimeout(timeoutId);
    const json = await res.json();
    if (json.choices && json.choices[0] && json.choices[0].message) {
      return {
        text: json.choices[0].message.content,
        model: 'NVIDIA NIM DeepSeek-V4 Pro (Cloud Failover)'
      };
    }
    throw new Error(JSON.stringify(json));
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// CLI usage
if (require.main === module) {
  const query = process.argv.slice(2).join(' ') || 'مرحبا! اشرح لي بإيجاز دورك كمساعد في منصة المدرسة.';
  console.log(`\n🧠 [المساعد الذكي] جاري التفكير ومعالجة الطلب عبر Claude Opus 4.8 / Hybrid AI: "${query}"...\n`);
  
  askClaudeOpus(query)
    .then((response) => {
      console.log('--- رد المساعد الذكي (Claude Opus 4.8) ---');
      console.log(response);
      console.log('-----------------------------------------\n');
    })
    .catch(async (err) => {
      console.log(`⚠️ تعذر الاتصال بـ SeekAI (${err.message})، جاري التبديل التلقائي إلى السحابة الهجينة NVIDIA NIM DeepSeek-V4...`);
      try {
        const fallbackRes = await askNvidiaDeepSeek(query, 'أنت مساعد ذكاء اصطناعي خبير لمنظومة المدرسة الرقمية.');
        console.log(`\n--- رد السحابة الذكية (${fallbackRes.model}) ---`);
        console.log(fallbackRes.text);
        console.log('---------------------------------------------------\n');
      } catch (fbErr) {
        console.error('❌ خطأ في الاتصال:', fbErr.message);
      }
    });
}

module.exports = { askClaudeOpus, askNvidiaDeepSeek };
