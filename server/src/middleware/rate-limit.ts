import type { NextFunction, Request, Response } from 'express'
import { HttpError } from '../lib/http-error.js'

/**
 * Простейший rate-limiter (скользящее окно, состояние в памяти процесса).
 * Вешается на /api/auth, чтобы пароли нельзя было перебирать со скоростью
 * сети: после `max` запросов с одного IP за окно возвращаем 429.
 *
 * Ограничение подхода: состояние живёт в памяти одного процесса, поэтому
 * при нескольких инстансах сервера нужен общий стор (например, Redis).
 */
export function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  const hitsByIp = new Map<string, number[]>()

  // Периодически выбрасываем устаревшие записи, чтобы Map не рос вечно.
  // unref() — таймер не должен мешать процессу завершиться.
  setInterval(() => {
    const cutoff = Date.now() - windowMs
    for (const [ip, hits] of hitsByIp) {
      const recent = hits.filter((t) => t > cutoff)
      if (recent.length === 0) hitsByIp.delete(ip)
      else hitsByIp.set(ip, recent)
    }
  }, windowMs).unref()

  return (req: Request, _res: Response, next: NextFunction): void => {
    const ip = req.ip ?? 'unknown'
    const now = Date.now()
    const recent = (hitsByIp.get(ip) ?? []).filter((t) => t > now - windowMs)

    if (recent.length >= max) {
      throw new HttpError(429, 'Слишком много попыток. Подождите немного и попробуйте снова.')
    }

    recent.push(now)
    hitsByIp.set(ip, recent)
    next()
  }
}
