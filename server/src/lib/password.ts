import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

// Пароли НИКОГДА не хранятся в открытом виде — только результат медленной
// односторонней функции (KDF). scrypt встроен в Node и намеренно затратен
// по CPU и памяти, что делает перебор украденной базы дорогим.
const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>

const KEY_LENGTH = 64
// N — стоимость по CPU/памяти (степень двойки), r — размер блока, p — параллелизм.
// Значения — рекомендованный baseline; maxmem поднят, т.к. дефолтного лимита
// Node (32 МБ) впритык не хватает для N=16384, r=8.
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

/**
 * Возвращает строку вида `scrypt$N$r$p$salt$hash`.
 * Параметры хранятся вместе с хешем, чтобы в будущем их можно было усилить,
 * не ломая проверку старых паролей.
 */
export async function hashPassword(password: string): Promise<string> {
  // Соль — случайная добавка к каждому паролю. Из-за неё одинаковые пароли
  // дают разные хеши, а радужные таблицы становятся бесполезными.
  const salt = randomBytes(16)
  const hash = await scrypt(password, salt, KEY_LENGTH, PARAMS)
  return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('hex'), hash.toString('hex')].join('$')
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, saltHex, hashHex] = stored.split('$')
  if (scheme !== 'scrypt' || !n || !r || !p || !saltHex || !hashHex) return false

  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(hashHex, 'hex')
  const actual = await scrypt(password, salt, expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024,
  })

  // timingSafeEqual сравнивает буферы за одинаковое время независимо от того,
  // в каком байте расхождение, — обычный === мог бы утечь длиной совпадения.
  return timingSafeEqual(actual, expected)
}

// "Пустышка" для выравнивания времени ответа: см. routes/auth.routes.ts
export const DUMMY_PASSWORD_HASH_PROMISE = hashPassword(randomBytes(16).toString('hex'))
