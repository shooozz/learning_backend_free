import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { config } from '../config.js'
import { HttpError } from '../lib/http-error.js'

/**
 * Централизованная обработка ошибок — последний middleware в цепочке.
 * В Express 5 отклонённые промисы из async-хендлеров попадают сюда
 * автоматически (в Express 4 понадобился бы try/catch + next(err)).
 *
 * Клиент всегда получает единый формат: { "error": "сообщение" }.
 *
 * Четвёртый параметр не используется, но обязан быть в сигнатуре:
 * именно по количеству аргументов (4) Express отличает обработчик
 * ошибок от обычного middleware.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // Ожидаемые ошибки бизнес-логики: статус и текст заданы там, где ошибка возникла
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message })
    return
  }

  // Невалидное тело запроса: показываем первую проблему человеческим языком
  if (err instanceof ZodError) {
    res.status(400).json({ error: err.issues[0]?.message ?? 'Некорректные данные' })
    return
  }

  // Всё остальное — баг. Детали пишем в лог, но НЕ отдаём клиенту:
  // стектрейс в ответе — подарок атакующему.
  console.error('[error]', err)
  res.status(500).json({
    error: config.isProduction ? 'Внутренняя ошибка сервера' : `Внутренняя ошибка: ${String(err)}`,
  })
}
