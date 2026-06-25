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
      workbox: {
        // 누끼(@imgly) 모델 wasm은 거대(수십MB) → 프리캐시 제외, 런타임 로드
        globIgnores: ['**/*.wasm', '**/ort-*', '**/onnx*'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
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
