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

// CLI usage
if (require.main === module) {
  const query = process.argv.slice(2).join(' ') || 'مرحبا! اشرح لي بإيجاز دورك كمساعد في منصة المدرسة.';
  console.log(`\n🧠 [Claude Opus 4.8] جاري التفكير ومعالجة الطلب: "${query}"...\n`);
  
  askClaudeOpus(query)
    .then((response) => {
      console.log('--- رد Claude Opus 4.8 ---');
      console.log(response);
      console.log('--------------------------\n');
    })
    .catch((err) => {
      console.error('❌ خطأ في الاتصال:', err.message);
    });
}

module.exports = { askClaudeOpus };
