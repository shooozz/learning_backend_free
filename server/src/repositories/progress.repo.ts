import { db } from '../db.js'
import type { ProgressPayload } from '../schemas.js'

// Прогресс хранится как JSON-массивы в TEXT-колонках. Для этой задачи
// нормализация (отдельная таблица completed_lessons и т.п.) не нужна:
// мы всегда читаем и пишем прогресс целиком, а поиска по отдельным
// урокам на сервере нет. Простое хранение = простой код.

const selectProgress = db.prepare('SELECT lessons, exercises, tasks, updated_at FROM progress WHERE user_id = ?')

// UPSERT: вставить строку, а при конфликте по первичному ключу — обновить.
const upsertProgress = db.prepare(`
  INSERT INTO progress (user_id, lessons, exercises, tasks, updated_at)
  VALUES (?, ?, ?, ?, datetime('now'))
  ON CONFLICT(user_id) DO UPDATE SET
    lessons    = excluded.lessons,
    exercises  = excluded.exercises,
    tasks      = excluded.tasks,
    updated_at = excluded.updated_at
`)

export interface StoredProgress {
  lessons: string[]
  exercises: string[]
  tasks: string[]
  updatedAt: string | null
}

function parseArray(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function getProgress(userId: number): StoredProgress {
  const row = selectProgress.get(userId) as
    | { lessons: string; exercises: string; tasks: string; updated_at: string }
    | undefined
  if (!row) return { lessons: [], exercises: [], tasks: [], updatedAt: null }

  return {
    lessons: parseArray(row.lessons),
    exercises: parseArray(row.exercises),
    tasks: parseArray(row.tasks),
    updatedAt: row.updated_at,
  }
}

export function saveProgress(userId: number, payload: ProgressPayload): void {
  // tasks в запросе опционален (старые клиенты): при его отсутствии
  // сохраняем уже записанный чек-лист, а не затираем его пустым
  const tasks = payload.tasks ?? getProgress(userId).tasks
  upsertProgress.run(
    userId,
    JSON.stringify(payload.lessons),
    JSON.stringify(payload.exercises),
    JSON.stringify(tasks),
  )
}
