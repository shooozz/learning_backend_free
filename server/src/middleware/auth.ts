import type { NextFunction, Request, Response } from 'express'
import { HttpError } from '../lib/http-error.js'
import { verifyAuthToken } from '../lib/jwt.js'

export const AUTH_COOKIE = 'auth_token'

// Расширяем тип Request, чтобы TypeScript знал о req.userId,
// который добавляет эта middleware.
declare module 'express-serve-static-core' {
  interface Request {
    userId?: number
  }
}

/**
 * Пропускает запрос дальше только с валидным JWT из httpOnly-cookie.
 * Токен приходит в cookie, а не в заголовке Authorization, потому что
 * httpOnly-cookie недоступна из JavaScript — XSS не сможет её украсть.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = (req.cookies as Record<string, string | undefined>)[AUTH_COOKIE]
  const userId = token ? verifyAuthToken(token) : null
  if (!userId) {
    throw new HttpError(401, 'Требуется авторизация')
  }
  req.userId = userId
  next()
}
