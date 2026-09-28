import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      devOptions: { enabled: true },
      manifest: {
        name: 'MotoMap47 Report',
        short_name: 'MotoMap47',
        description: 'Offline-capable fire incident reporting for Nairobi County',
        theme_color: '#c0392b',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        runtimeCaching: [
          { urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i, handler: 'NetworkOnly' },
          { urlPattern: /^https:\/\/(basemaps\.cartocdn\.com|tiles\.openfreemap\.org)\/.*/i, handler: 'CacheFirst', options: { cacheName: 'basemap-tiles' } }
        ]
      }
    })
  ]
});
