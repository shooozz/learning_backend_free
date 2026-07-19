import { existsSync } from 'node:fs'
import path from 'node:path'
import cookieParser from 'cookie-parser'
import express from 'express'
import { config } from './config.js'
import { HttpError } from './lib/http-error.js'
import { errorHandler } from './middleware/error-handler.js'
import { authRouter } from './routes/auth.routes.js'
import { progressRouter } from './routes/progress.routes.js'

/**
 * Сборка приложения вынесена из index.ts, чтобы app можно было создать
 * без запуска сервера — например, в интеграционных тестах (supertest).
 */
export function createApp(): express.Express {
  const app = express()

  // За реверс-прокси (Render, Railway, nginx) реальный IP клиента приходит
  // в заголовке X-Forwarded-For; без trust proxy req.ip — это IP самого
  // прокси, и rate-limiter считал бы всех пользователей одним клиентом.
  // Включайте, только когда сервер действительно стоит за прокси
  if (process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1)
  }

  // Body с лимитом: JSON больше 256 КБ здесь легитимно не бывает
  app.use(express.json({ limit: '256kb' }))
  app.use(cookieParser())

  // Health-check: точка для мониторинга и проверки "жив ли сервер"
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // Rate-limiter навешивается ВНУТРИ authRouter и только на login/register —
  // именно их перебирают. GET /auth/me под лимит не попадает: фронтенд
  // вызывает его при каждой загрузке страницы, и общий лимит на весь
  // /api/auth легитимные пользователи исчерпывали бы обычными обновлениями
  app.use('/api/auth', authRouter)
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
