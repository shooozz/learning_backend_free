import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '@/lib/api'
import { AuthContext } from './auth-store'
import type { AuthContextValue, AuthUser } from './auth-store'

interface UserResponse {
  user: AuthUser
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [initializing, setInitializing] = useState(true)

  // При загрузке страницы восстанавливаем сессию: если в cookie лежит
  // валидный токен, сервер вернёт пользователя. 401 здесь — не ошибка,
  // а нормальный ответ "вы гость".
  useEffect(() => {
    let cancelled = false
    api
      .get<UserResponse>('/auth/me')
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
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
    () => ({ user, initializing, login, register, logout }),
    [user, initializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
