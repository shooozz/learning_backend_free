import path from 'node:path'
import { fileURLToPath } from 'node:url'

// В Node 21.7+ переменные окружения можно загрузить из .env без пакета dotenv.
// Файл .env опционален: если его нет — работаем на значениях по умолчанию.
try {
  process.loadEnvFile()
} catch {
  // .env отсутствует — это нормально для первого запуска
}

const isProduction = process.env.NODE_ENV === 'production'

// Секрет для подписи JWT. В production обязан быть задан явно:
// токен, подписанный предсказуемым секретом, может подделать кто угодно.
function resolveJwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET
  if (fromEnv && fromEnv.length >= 32) return fromEnv
  if (isProduction) {
    throw new Error('JWT_SECRET (минимум 32 символа) обязателен в production — задайте его в .env')
  }
  console.warn('[config] JWT_SECRET не задан — использую dev-секрет. Не для production!')
  return 'dev-only-secret-change-me-in-production!'
}

const serverRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

export const config = {
  isProduction,
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: resolveJwtSecret(),
  // Срок жизни сессии: и для JWT, и для cookie, чтобы они истекали синхронно
  tokenTtlSeconds: 7 * 24 * 60 * 60, // 7 дней
  databasePath: process.env.DATABASE_PATH ?? path.join(serverRoot, 'data', 'app.db'),
  // Путь до production-сборки фронтенда (npm run build в корне проекта)
  frontendDist: path.join(serverRoot, '..', 'dist'),
} as const
