import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: process.env.VITE_BASE_URL ?? '/fire-control-web/',
    server: {
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
          xfwd: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Erro no Proxy do Vite:', err);
            });
          },
        },
        '/ds-api': {
          target: env.VITE_DS_PROXY_TARGET ?? 'http://localhost:8001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ds-api/, ''),
        },
      },
    },
  }
})
