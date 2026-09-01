import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Real-time Multi-Device Sync Server Plugin
function realtimeSyncPlugin(): Plugin {
  const dbFilePath = path.resolve(__dirname, 'server_db.json');
  const sseClients: Set<any> = new Set();

  const loadServerDb = () => {
    try {
      if (fs.existsSync(dbFilePath)) {
        return JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
      }
    } catch {}
    return null;
  };

  const saveServerDb = (data: any) => {
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch {}
  };

  return {
    name: 'realtime-school-sync',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 1. SSE Realtime Stream for all connected devices
        if (req.url === '/api/events') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          });

          res.write('data: {"type":"CONNECTED"}\n\n');
          sseClients.add(res);

          req.on('close', () => {
            sseClients.delete(res);
          });
          return;
        }

        // 2. Fetch full current server state
        if (req.url === '/api/state' && req.method === 'GET') {
          const state = loadServerDb();
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify(state || { empty: true }));
          return;
        }

        // 3. Post action / state update from any device and broadcast to all other devices
        if (req.url === '/api/action' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              
              if (payload.fullState) {
                saveServerDb(payload.fullState);
              }

              // Broadcast update to all connected phones & laptops
              const message = `data: ${JSON.stringify(payload)}\n\n`;
              sseClients.forEach(client => {
                try {
                  client.write(message);
                } catch {
                  sseClients.delete(client);
                }
              });

              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              });
              res.end(JSON.stringify({ success: true, clientsNotified: sseClients.size }));
            } catch (err: any) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), realtimeSyncPlugin()],
  server: {
    port: 3000,
    open: false,
    host: true,
    allowedHosts: true
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: true
  }
});
