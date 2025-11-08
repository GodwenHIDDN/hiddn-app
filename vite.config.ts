import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'iOS >= 12', 'Safari >= 12'],
      modernPolyfills: true,
      renderLegacyChunks: true,
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
  ],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
    },
    allowedHosts: [
      // Allow Cloudflare quick tunnel subdomains
      'weddings-derek-zealand-acts.trycloudflare.com',
      '.trycloudflare.com',
      // Allow LocalTunnel host
      'hiddn-flyki.loca.lt',
      '.loca.lt',
    ],
  },
})
