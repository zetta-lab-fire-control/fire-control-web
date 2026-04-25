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
          secure: false, // Ignora erro de certificado auto-assinado (ESSENCIAL)
          xfwd: true,    // Adiciona headers X-Forwarded-For
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Erro no Proxy do Vite:', err);
            });
          },
        },
      },
    },
  }
})
