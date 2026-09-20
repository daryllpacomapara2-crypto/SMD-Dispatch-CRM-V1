import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function autoSaveApiPlugin() {
  let lastSavedPayload: any = null;
  let lastSavedTimestamp: number | null = null;

  return {
    name: 'autosave-api-endpoint',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (url === '/api/autosave') {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = body ? JSON.parse(body) : {};
                lastSavedPayload = parsed;
                lastSavedTimestamp = Date.now();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  timestamp: lastSavedTimestamp,
                  message: 'All changes saved successfully'
                }));
              } catch (e: any) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid JSON', details: e.message }));
              }
            });
            return;
          }

          if (req.method === 'GET') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              status: 'online',
              lastSavedTimestamp,
              hasData: Boolean(lastSavedPayload),
              serverTime: Date.now()
            }));
            return;
          }
        }

        if (url === '/api/health') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok', time: Date.now() }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), autoSaveApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
