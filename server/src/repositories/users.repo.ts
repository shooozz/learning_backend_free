import { db } from '../db.js'

// Слой репозитория: единственное место, где живёт SQL для таблицы users.
// Роуты работают с функциями и типами, не зная о деталях хранения, —
// при переезде на Postgres поменяется только этот файл.

export interface UserRecord {
  id: number
  email: string
  password_hash: string
  created_at: string
}

// Подготовленные (prepared) выражения: SQL парсится один раз, а параметры
// подставляются драйвером. Подстановка через `?` — это и есть защита
// от SQL-инъекций: значение никогда не интерпретируется как код.
const insertUser = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
const selectByEmail = db.prepare('SELECT * FROM users WHERE email = ?')
const selectById = db.prepare('SELECT * FROM users WHERE id = ?')

export function createUser(email: string, passwordHash: string): number {
  const result = insertUser.run(email, passwordHash)
  return Number(result.lastInsertRowid)
}

export function findUserByEmail(email: string): UserRecord | undefined {
  return selectByEmail.get(email) as UserRecord | undefined
}

export function findUserById(id: number): UserRecord | undefined {
  return selectById.get(id) as UserRecord | undefined
}
