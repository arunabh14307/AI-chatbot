import { defineConfig, loadEnv } from 'vite';
import chatHandler from './api/chat.js';

export default defineConfig(({ mode }) => {
  // Load environment variables from .env files in project root
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    server: {
      port: 5173
    },
    plugins: [
      {
        name: 'local-api-chat-middleware',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res) => {
            if (req.method === 'POST') {
              let rawBody = '';
              req.on('data', chunk => {
                rawBody += chunk;
              });

              req.on('end', async () => {
                try {
                  req.body = rawBody ? JSON.parse(rawBody) : {};
                } catch (e) {
                  req.body = {};
                }

                try {
                  await chatHandler(req, res);
                } catch (err) {
                  console.error('Local API Handler Error:', err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    error: 'Internal server error in local API handler.'
                  }));
                }
              });
            } else {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: 'Method Not Allowed'
              }));
            }
          });
        }
      }
    ]
  };
});
