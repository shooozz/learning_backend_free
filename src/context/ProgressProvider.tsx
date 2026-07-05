import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { courses } from '@/data/courses'
import { ProgressContext } from './progress-store'
import type { ProgressContextValue, ProgressSummary } from './progress-store'

const STORAGE_KEY = 'roadmap-hero:progress:v1'

interface ProgressState {
  lessons: Set<string>
  exercises: Set<string>
}

function loadInitialState(): ProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { lessons: new Set(), exercises: new Set() }
    const parsed = JSON.parse(raw) as { lessons?: unknown; exercises?: unknown }
    const toSet = (value: unknown) =>
      new Set(Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : [])
    return { lessons: toSet(parsed.lessons), exercises: toSet(parsed.exercises) }
  } catch {
    return { lessons: new Set(), exercises: new Set() }
  }
}

const lessonKey = (courseSlug: string, lessonSlug: string) => `${courseSlug}/${lessonSlug}`
const exerciseKey = (courseSlug: string, lessonSlug: string, exerciseId: string) =>
  `${courseSlug}/${lessonSlug}/${exerciseId}`

export default function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(loadInitialState)

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ lessons: [...state.lessons], exercises: [...state.exercises] }),
      )
    } catch {
      // localStorage недоступен (например, приватный режим) — прогресс не сохранится
    }
  }, [state])

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
      getCourseProgress,
      overall: summary(completedLessons, totalLessons),
    }
  }, [state, setLessonCompleted, setExerciseCompleted])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
