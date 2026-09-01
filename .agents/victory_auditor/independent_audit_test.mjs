import { spawn } from 'child_process';
import http from 'http';

console.log('=== INDEPENDENT AUDIT: DEV SERVER SMOKE TEST ===');

const devProcess = spawn('cmd.exe', ['/c', 'npm', 'run', 'dev', '--', '--port', '3456'], {
  cwd: process.cwd(),
  stdio: 'pipe',
  shell: true
});

let outputLog = '';
devProcess.stdout.on('data', (data) => {
  outputLog += data.toString();
});
devProcess.stderr.on('data', (data) => {
  outputLog += data.toString();
});

function checkServer(attemptsLeft = 20) {
  return new Promise((resolve, reject) => {
    if (attemptsLeft <= 0) {
      return reject(new Error('Server did not respond in time. Log:\n' + outputLog));
    }
    
    const req = http.get('http://localhost:3456/', (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });

    req.on('error', () => {
      setTimeout(() => {
        checkServer(attemptsLeft - 1).then(resolve).catch(reject);
      }, 500);
    });
  });
}

try {
  const res = await checkServer();
  console.log(`[DevServer] HTTP GET / Status: ${res.statusCode}`);
  
  if (res.statusCode !== 200) {
    throw new Error(`Expected 200, got ${res.statusCode}`);
  }

  if (!res.body.includes('dir="rtl"')) {
    throw new Error('Missing dir="rtl" in index.html');
  }
  if (!res.body.includes('Cairo') || !res.body.includes('Tajawal')) {
    throw new Error('Missing Cairo or Tajawal fonts in index.html');
  }
  if (!res.body.includes('/src/main.tsx')) {
    throw new Error('Missing /src/main.tsx script tag');
  }

  console.log('✓ Dev server started cleanly, served index.html with 200 OK, verified RTL and Arabic fonts.');
} catch (err) {
  console.error('FAILED DevServer test:', err);
  process.exitCode = 1;
} finally {
  devProcess.kill();
  // Force kill child process tree on windows
  try {
    spawn('taskkill', ['/pid', devProcess.pid.toString(), '/f', '/t']);
  } catch {}
}
