import { createContext, useContext } from 'react'

export interface AuthUser {
  id: number
  email: string
}

export interface AuthContextValue {
  /** null — гость (не авторизован) */
  user: AuthUser | null
  /** true, пока при загрузке страницы идёт проверка сессии (GET /auth/me) */
  initializing: boolean
  /**
   * false — API-сервер недоступен (например, статический деплой на Vercel
   * без бэкенда). Интерфейс входа в этом случае скрывается, платформа
   * работает в гостевом режиме с localStorage.
   */
  apiAvailable: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  return ctx
}
