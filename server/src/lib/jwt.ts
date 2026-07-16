import jwt from 'jsonwebtoken'
import { config } from '../config.js'

// JWT — подписанный (не зашифрованный!) токен. Сервер не хранит сессии:
// вся информация лежит в самом токене, а подпись гарантирует, что его
// не подделали. Расплата — токен нельзя отозвать до истечения срока.

export function signAuthToken(userId: number): string {
  return jwt.sign({}, config.jwtSecret, {
    subject: String(userId), // стандартное поле sub — "кому выдан токен"
    expiresIn: config.tokenTtlSeconds,
  })
}

/** Возвращает id пользователя или null, если токен невалиден/просрочен. */
export function verifyAuthToken(token: string): number | null {
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    if (typeof payload === 'string' || !payload.sub) return null
    const userId = Number(payload.sub)
    return Number.isInteger(userId) && userId > 0 ? userId : null
  } catch {
    // Просроченная/битая подпись — для нас одно и то же: пользователь не авторизован
    return null
  }
}
