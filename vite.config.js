import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 音乐番茄钟 · Vite 配置（含 vitest）
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
  },
})
