import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Абсолютный base обязателен для SPA с BrowserRouter: с относительным './'
  // при заходе сразу на /courses/python-basics браузер искал бы ассеты
  // по пути /courses/assets/... и получал бы index.html вместо JS
  base: '/',
  // inspectAttr — dev-инспектор: добавляет каждому элементу атрибут
  // code-path="файл:строка". В production-сборке ему не место —
  // это лишние сотни строк в бандле и утечка структуры исходников
  plugins: [...(command === 'serve' ? [inspectAttr()] : []), react()],
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
    // Все запросы к /api уходят на backend (server/): фронт и API живут
    // на одном origin, поэтому не нужны ни CORS, ни настройки cookie
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
