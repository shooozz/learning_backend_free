import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, ApiError } from '@/lib/api'
import { AuthContext } from './auth-store'
import type { AuthContextValue, AuthUser } from './auth-store'

interface UserResponse {
  user: AuthUser
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [apiAvailable, setApiAvailable] = useState(true)

  // При загрузке страницы восстанавливаем сессию: если в cookie лежит
  // валидный токен, сервер вернёт пользователя. 401 здесь — не ошибка,
  // а нормальный ответ "вы гость". Сетевая ошибка / не-JSON (status 0)
  // и 404 означают, что бэкенда в этой сборке нет вообще (например,
  // статический деплой на Vercel) — тогда прячем интерфейс входа.
  // Остальные статусы (429, 5xx) — ВРЕМЕННЫЕ сбои живого API: интерфейс
  // входа не прячем, иначе один неудачный запрос отключил бы аккаунты
  // до перезагрузки страницы.
  useEffect(() => {
    let cancelled = false
    api
      .get<UserResponse>('/auth/me')
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setUser(null)
        if (error instanceof ApiError && (error.status === 0 || error.status === 404)) {
          setApiAvailable(false)
        }
      })
      .finally(() => {
        if (!cancelled) setInitializing(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<UserResponse>('/auth/login', { email, password })
    setUser(data.user)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const data = await api.post<UserResponse>('/auth/register', { email, password })
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    // Даже если запрос упал (сервер недоступен), локально разлогиниваемся:
    // без валидной cookie следующая загрузка страницы всё равно даст гостя
    await api.post('/auth/logout').catch(() => {})
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, initializing, apiAvailable, login, register, logout }),
    [user, initializing, apiAvailable, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
