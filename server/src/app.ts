import { existsSync } from 'node:fs'
import path from 'node:path'
import cookieParser from 'cookie-parser'
import express from 'express'
import { config } from './config.js'
import { HttpError } from './lib/http-error.js'
import { errorHandler } from './middleware/error-handler.js'
import { rateLimit } from './middleware/rate-limit.js'
import { authRouter } from './routes/auth.routes.js'
import { progressRouter } from './routes/progress.routes.js'

/**
 * Сборка приложения вынесена из index.ts, чтобы app можно было создать
 * без запуска сервера — например, в интеграционных тестах (supertest).
 */
export function createApp(): express.Express {
  const app = express()

  // Body с лимитом: JSON больше 256 КБ здесь легитимно не бывает
  app.use(express.json({ limit: '256kb' }))
  app.use(cookieParser())

  // Health-check: точка для мониторинга и проверки "жив ли сервер"
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // Rate-limiter только на авторизацию — именно её пытаются перебирать
  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }), authRouter)
  app.use('/api/progress', progressRouter)

  // Неизвестный /api-маршрут — явный 404 в том же JSON-формате
  app.use('/api', () => {
    throw new HttpError(404, 'Маршрут не найден')
  })

  // В production этот же сервер раздаёт собранный фронтенд (dist/):
  // один процесс — и API, и статика. В dev это делает vite на :3000.
  const indexHtml = path.join(config.frontendDist, 'index.html')
  if (config.isProduction && existsSync(indexHtml)) {
    app.use(express.static(config.frontendDist))
    // SPA-fallback: любой не-API путь отдаёт index.html,
    // а дальше маршрутизацией занимается react-router
    app.use((_req, res) => {
      res.sendFile(indexHtml)
    })
  }

  // Обработчик ошибок регистрируется последним — Express передаёт ему
  // всё, что "выпало" из предыдущих middleware и роутов
  app.use(errorHandler)

  return app
}
