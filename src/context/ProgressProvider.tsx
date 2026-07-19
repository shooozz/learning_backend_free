import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { courses } from '@/data/courses'
import { api } from '@/lib/api'
import { useAuth } from './auth-store'
import { ProgressContext } from './progress-store'
import type { ProgressContextValue, ProgressSummary } from './progress-store'

const STORAGE_KEY = 'roadmap-hero:progress:v1'
// До объединения с уроками чек-лист лендинга жил в отдельном ключе —
// при загрузке подхватываем его данные, чтобы отметки не пропали
const LEGACY_TASKS_KEY = 'roadmap-hero:landing-tasks:v1'
// Пауза между последним изменением и отправкой на сервер: серия быстрых
// кликов уходит одним запросом, а не десятью (debounce)
const SAVE_DEBOUNCE_MS = 800

interface ProgressState {
  lessons: Set<string>
  exercises: Set<string>
  tasks: Set<string>
}

interface ProgressPayload {
  lessons: string[]
  exercises: string[]
  tasks?: string[]
}

const EMPTY_STATE = (): ProgressState => ({ lessons: new Set(), exercises: new Set(), tasks: new Set() })

const toSet = (value: unknown) =>
  new Set(Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : [])

function loadInitialState(): ProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw
      ? (JSON.parse(raw) as { lessons?: unknown; exercises?: unknown; tasks?: unknown })
      : {}
    const tasks = toSet(parsed.tasks)

    // Миграция со старого отдельного ключа чек-листа (если он ещё есть)
    const legacyRaw = window.localStorage.getItem(LEGACY_TASKS_KEY)
    if (legacyRaw) {
      for (const id of toSet(JSON.parse(legacyRaw) as unknown)) tasks.add(id)
    }

    return { lessons: toSet(parsed.lessons), exercises: toSet(parsed.exercises), tasks }
  } catch {
    return EMPTY_STATE()
  }
}

const toPayload = (state: ProgressState): Required<ProgressPayload> => ({
  lessons: [...state.lessons],
  exercises: [...state.exercises],
  tasks: [...state.tasks],
})

const lessonKey = (courseSlug: string, lessonSlug: string) => `${courseSlug}/${lessonSlug}`
const exerciseKey = (courseSlug: string, lessonSlug: string, exerciseId: string) =>
  `${courseSlug}/${lessonSlug}/${exerciseId}`

export default function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<ProgressState>(loadInitialState)

  // "Последняя версия" состояния для колбэков, живущих дольше одного рендера
  const stateRef = useRef(state)
  // id пользователя, чей прогресс уже слит с серверным. Пока слияние
  // не произошло, ничего на сервер не пишем — иначе можно затереть
  // серверный прогресс локальным, ещё не объединённым
  const syncedUserIdRef = useRef<number | null>(null)
  // Кто был авторизован на прошлом рендере — чтобы отличить выход
  // из аккаунта от первоначальной загрузки страницы (там user тоже null)
  const prevUserIdRef = useRef<number | null>(null)

  // Синхронизация при входе: берём прогресс с сервера и объединяем
  // с локальным (объединение множеств — прогресс нигде не теряется:
  // ни сделанный на этом устройстве до входа, ни сделанный на другом).
  // Если запрос упал (сеть, рестарт сервера) — повторяем с интервалом,
  // иначе одна неудача молча отключила бы синхронизацию до конца сессии.
  useEffect(() => {
    if (!user) {
      syncedUserIdRef.current = null
      // Выход из аккаунта: очищаем локальный прогресс. Иначе на общем
      // компьютере прогресс вышедшего пользователя достался бы гостю,
      // а при следующем входе — слился бы в ЧУЖОЙ аккаунт на сервере.
      // Данные вышедшего не теряются: они уже синхронизированы в его аккаунт.
      if (prevUserIdRef.current !== null) {
        prevUserIdRef.current = null
        setState(EMPTY_STATE())
      }
      return
    }

    prevUserIdRef.current = user.id
    if (syncedUserIdRef.current === user.id) return

    let cancelled = false
    let retryTimer: number | undefined
    const sync = () => {
      api
        .get<ProgressPayload>('/progress')
        .then((remote) => {
          if (cancelled) return
          const local = stateRef.current
          setState({
            lessons: new Set([...local.lessons, ...remote.lessons]),
            exercises: new Set([...local.exercises, ...remote.exercises]),
            tasks: new Set([...local.tasks, ...(remote.tasks ?? [])]),
          })
          // Отправку объединённого прогресса сделает эффект сохранения ниже —
          // он сработает от setState. Флаг ставим до этого
          syncedUserIdRef.current = user.id
        })
        .catch(() => {
          if (!cancelled) retryTimer = window.setTimeout(sync, 10_000)
        })
    }
    sync()
    return () => {
      cancelled = true
      if (retryTimer !== undefined) window.clearTimeout(retryTimer)
    }
  }, [user])

  // Сохранение: в localStorage — всегда (кэш и режим гостя),
  // на сервер — с debounce и только после слияния
  useEffect(() => {
    stateRef.current = state
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toPayload(state)))
      // Данные чек-листа теперь живут в основном ключе — старый больше не нужен
      window.localStorage.removeItem(LEGACY_TASKS_KEY)
    } catch {
      // localStorage недоступен (например, приватный режим) — прогресс не сохранится
    }

    if (!user || syncedUserIdRef.current !== user.id) return
    const timer = setTimeout(() => {
      api.put('/progress', toPayload(state)).catch(() => {
        // Не сохранилось (сеть, истёкшая сессия) — не страшно:
        // локальная копия цела, при следующем входе всё сольётся
      })
    }, SAVE_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [state, user])

  const setLessonCompleted = useCallback((courseSlug: string, lessonSlug: string, done: boolean) => {
    setState((prev) => {
      const key = lessonKey(courseSlug, lessonSlug)
      if (prev.lessons.has(key) === done) return prev
      const lessons = new Set(prev.lessons)
      if (done) lessons.add(key)
      else lessons.delete(key)
      return { ...prev, lessons }
    })
  }, [])

  const setExerciseCompleted = useCallback(
    (courseSlug: string, lessonSlug: string, exerciseId: string, done: boolean) => {
      setState((prev) => {
        const key = exerciseKey(courseSlug, lessonSlug, exerciseId)
        if (prev.exercises.has(key) === done) return prev
        const exercises = new Set(prev.exercises)
        if (done) exercises.add(key)
        else exercises.delete(key)
        return { ...prev, exercises }
      })
    },
    [],
  )

  const setTaskCompleted = useCallback((taskId: string, done: boolean) => {
    setState((prev) => {
      if (prev.tasks.has(taskId) === done) return prev
      const tasks = new Set(prev.tasks)
      if (done) tasks.add(taskId)
      else tasks.delete(taskId)
      return { ...prev, tasks }
    })
  }, [])

  const value = useMemo<ProgressContextValue>(() => {
    const summary = (completed: number, total: number): ProgressSummary => ({
      completed,
      total,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    })

    const getCourseProgress = (courseSlug: string): ProgressSummary => {
      const course = courses.find((c) => c.slug === courseSlug)
      if (!course) return summary(0, 0)
      const done = course.lessons.filter((l) => state.lessons.has(lessonKey(courseSlug, l.slug))).length
      return summary(done, course.lessons.length)
    }

    const totalLessons = courses.reduce((acc, c) => acc + c.lessons.length, 0)
    const completedLessons = courses.reduce(
      (acc, c) => acc + c.lessons.filter((l) => state.lessons.has(lessonKey(c.slug, l.slug))).length,
      0,
    )

    return {
      isLessonCompleted: (courseSlug, lessonSlug) => state.lessons.has(lessonKey(courseSlug, lessonSlug)),
      setLessonCompleted,
      isExerciseCompleted: (courseSlug, lessonSlug, exerciseId) =>
        state.exercises.has(exerciseKey(courseSlug, lessonSlug, exerciseId)),
      setExerciseCompleted,
      isTaskCompleted: (taskId) => state.tasks.has(taskId),
      setTaskCompleted,
      getCourseProgress,
      overall: summary(completedLessons, totalLessons),
    }
  }, [state, setLessonCompleted, setExerciseCompleted, setTaskCompleted])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
