import { db } from '../db.js'
import type { ProgressPayload } from '../schemas.js'

// Прогресс хранится как JSON-массивы в TEXT-колонках. Для этой задачи
// нормализация (отдельная таблица completed_lessons и т.п.) не нужна:
// мы всегда читаем и пишем прогресс целиком, а поиска по отдельным
// урокам на сервере нет. Простое хранение = простой код.

const selectProgress = db.prepare('SELECT lessons, exercises, updated_at FROM progress WHERE user_id = ?')

// UPSERT: вставить строку, а при конфликте по первичному ключу — обновить.
const upsertProgress = db.prepare(`
  INSERT INTO progress (user_id, lessons, exercises, updated_at)
  VALUES (?, ?, ?, datetime('now'))
  ON CONFLICT(user_id) DO UPDATE SET
    lessons    = excluded.lessons,
    exercises  = excluded.exercises,
    updated_at = excluded.updated_at
`)

export interface StoredProgress extends ProgressPayload {
  updatedAt: string | null
}

export function getProgress(userId: number): StoredProgress {
  const row = selectProgress.get(userId) as
    | { lessons: string; exercises: string; updated_at: string }
    | undefined
  if (!row) return { lessons: [], exercises: [], updatedAt: null }

  const parseArray = (raw: string): string[] => {
    try {
      const value: unknown = JSON.parse(raw)
      return Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : []
    } catch {
      return []
    }
  }

  return {
    lessons: parseArray(row.lessons),
    exercises: parseArray(row.exercises),
    updatedAt: row.updated_at,
  }
}

export function saveProgress(userId: number, payload: ProgressPayload): void {
  upsertProgress.run(userId, JSON.stringify(payload.lessons), JSON.stringify(payload.exercises))
}
