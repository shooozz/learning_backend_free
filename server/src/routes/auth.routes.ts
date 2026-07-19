import { Router } from 'express'
import type { Response } from 'express'
import { config } from '../config.js'
import { HttpError } from '../lib/http-error.js'
import { signAuthToken } from '../lib/jwt.js'
import { DUMMY_PASSWORD_HASH_PROMISE, hashPassword, verifyPassword } from '../lib/password.js'
import { AUTH_COOKIE, requireAuth } from '../middleware/auth.js'
import { createUser, findUserByEmail, findUserById } from '../repositories/users.repo.js'
import { credentialsSchema } from '../schemas.js'

export const authRouter = Router()

function setAuthCookie(res: Response, userId: number): void {
  res.cookie(AUTH_COOKIE, signAuthToken(userId), {
    httpOnly: true, // недоступна из document.cookie — XSS не украдёт токен
    sameSite: 'lax', // браузер не отправит cookie с POST-запросом с чужого сайта (CSRF)
    secure: config.isProduction, // в production — только по HTTPS
    maxAge: config.tokenTtlSeconds * 1000,
    path: '/',
  })
}

// POST /api/auth/register — создать аккаунт и сразу войти
authRouter.post('/register', async (req, res) => {
  const { email, password } = credentialsSchema.parse(req.body)

  if (findUserByEmail(email)) {
    throw new HttpError(409, 'Пользователь с таким email уже зарегистрирован')
  }

  const userId = createUser(email, await hashPassword(password))
  setAuthCookie(res, userId)
  res.status(201).json({ user: { id: userId, email } })
})

// POST /api/auth/login — вход по email и паролю
authRouter.post('/login', async (req, res) => {
  const { email, password } = credentialsSchema.parse(req.body)
  const user = findUserByEmail(email)

  // Тонкость: если пользователя нет, всё равно проверяем пароль против
  // хеша-пустышки. Иначе ответ "email не найден" приходил бы заметно
  // быстрее, чем "пароль не подошёл", и по времени ответа можно было бы
  // узнать, кто у нас зарегистрирован (user enumeration).
  const passwordOk = await verifyPassword(password, user?.password_hash ?? (await DUMMY_PASSWORD_HASH_PROMISE))

  if (!user || !passwordOk) {
    // Единое сообщение — по той же причине: не раскрываем, что именно неверно
    throw new HttpError(401, 'Неверный email или пароль')
  }

  setAuthCookie(res, user.id)
  res.json({ user: { id: user.id, email: user.email } })
})

// POST /api/auth/logout — выход (сервер просто стирает cookie)
authRouter.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { path: '/' })
  res.json({ ok: true })
})

// GET /api/auth/me — "кто я?": фронтенд вызывает при загрузке страницы,
// чтобы восстановить сессию из cookie
authRouter.get('/me', requireAuth, (req, res) => {
  const user = findUserById(req.userId!)
  if (!user) {
    // Токен валиден, но пользователь удалён из базы
    res.clearCookie(AUTH_COOKIE, { path: '/' })
    throw new HttpError(401, 'Требуется авторизация')
  }
  res.json({ user: { id: user.id, email: user.email } })
})
