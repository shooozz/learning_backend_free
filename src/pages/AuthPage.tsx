import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '@/context/auth-store'
import { usePageTitle } from '@/hooks/use-page-title'
import { ApiError } from '@/lib/api'

// Клиентская валидация дублирует серверную (server/src/schemas.ts) —
// и это правильно: клиентская даёт мгновенную подсказку пользователю,
// но защищает данные только серверная (запрос можно отправить и без браузера)
const formSchema = z.object({
  email: z.email('Введите корректный email'),
  password: z.string().min(8, 'Пароль должен быть не короче 8 символов'),
})

type FormValues = z.infer<typeof formSchema>
type Mode = 'login' | 'register'

const copy: Record<Mode, { title: string; submit: string; switchHint: string; switchAction: string }> = {
  login: {
    title: 'Вход',
    submit: 'Войти',
    switchHint: 'Ещё нет аккаунта?',
    switchAction: 'Зарегистрироваться',
  },
  register: {
    title: 'Регистрация',
    submit: 'Создать аккаунт',
    switchHint: 'Уже есть аккаунт?',
    switchAction: 'Войти',
  },
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [serverError, setServerError] = useState<string | null>(null)
  const { user, login, register: signUp, logout } = useAuth()
  const navigate = useNavigate()
  usePageTitle(`${copy[mode].title} — Roadmap Hero`)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      if (mode === 'login') await login(values.email, values.password)
      else await signUp(values.email, values.password)
      navigate('/courses')
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Что-то пошло не так. Попробуйте ещё раз.')
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setServerError(null)
  }

  const inputClass =
    'w-full rounded border border-[#1A1A1A] bg-[#0A0A0A] px-4 py-3 text-sm text-[#F1F1F1] ' +
    'placeholder:text-[#555] outline-none transition-colors focus:border-[#1A5CFF]'

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="w-full max-w-md">
        {user ? (
          // Уже авторизован — форма не нужна
          <div className="border border-[#1A1A1A] rounded-lg p-8 bg-[#0A0A0A]/60 text-center">
            <h1 className="font-display text-2xl font-bold text-[#F1F1F1] mb-2">Вы уже вошли</h1>
            <p className="text-sm text-[#888] mb-6">{user.email}</p>
            <div className="flex flex-col gap-3">
              <Link
                to="/courses"
                className="text-sm text-center border border-[#1A5CFF] bg-[#1A5CFF] text-[#050505] rounded px-5 py-3 hover:bg-transparent hover:text-[#1A5CFF] transition-all duration-300"
              >
                К курсам
              </Link>
              <button
                onClick={() => void logout()}
                className="text-sm border border-[#1A1A1A] text-[#888] rounded px-5 py-3 hover:border-[#F1F1F1] hover:text-[#F1F1F1] transition-all duration-300"
              >
                Выйти
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-[#1A1A1A] rounded-lg p-8 bg-[#0A0A0A]/60">
            <h1 className="font-display text-2xl font-bold text-[#F1F1F1] mb-1">{copy[mode].title}</h1>
            <p className="text-sm text-[#888] mb-8">
              Прогресс обучения будет привязан к аккаунту и доступен с любого устройства.
            </p>

            <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-4" noValidate>
              <div>
                <label htmlFor="email" className="block text-xs text-[#888] mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass}
                  {...register('email')}
                />
                {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-xs text-[#888] mb-1.5">
                  Пароль
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="Минимум 8 символов"
                  className={inputClass}
                  {...register('password')}
                />
                {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
              </div>

              {serverError && (
                <p className="text-xs text-red-400 border border-red-400/30 bg-red-400/5 rounded px-3 py-2">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 text-sm border border-[#1A5CFF] bg-[#1A5CFF] text-[#050505] rounded px-5 py-3 hover:bg-transparent hover:text-[#1A5CFF] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? 'Секунду…' : copy[mode].submit}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#888]">
              {copy[mode].switchHint}{' '}
              <button onClick={switchMode} className="text-[#1A5CFF] hover:underline">
                {copy[mode].switchAction}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
