import { createContext, useContext } from 'react'

export interface ProgressSummary {
  completed: number
  total: number
  percent: number
}

export interface ProgressContextValue {
  isLessonCompleted: (courseSlug: string, lessonSlug: string) => boolean
  setLessonCompleted: (courseSlug: string, lessonSlug: string, done: boolean) => void
  isExerciseCompleted: (courseSlug: string, lessonSlug: string, exerciseId: string) => boolean
  setExerciseCompleted: (courseSlug: string, lessonSlug: string, exerciseId: string, done: boolean) => void
  getCourseProgress: (courseSlug: string) => ProgressSummary
  overall: ProgressSummary
}

export const ProgressContext = createContext<ProgressContextValue | null>(null)

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) {
    throw new Error('useProgress должен использоваться внутри ProgressProvider')
  }
  return ctx
}
