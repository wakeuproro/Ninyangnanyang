import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '니냥내냥',
        short_name: '니냥내냥',
        description: '길에서 만난 고양이를 카드로 수집하는 도감 앱',
        theme_color: '#ffce39',
        background_color: '#111111',
        display: 'standalone',
        // 추후 public/icons 채우면 등록
        icons: [],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
