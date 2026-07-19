import { useState } from 'react'
import { CheckCircle2, HelpCircle, RotateCcw } from 'lucide-react'
import { useProgress } from '@/context/progress-store'
import type { QuizExercise } from '@/types/course'
import RichText from './RichText'

const OPTION_LETTERS = ['А', 'Б', 'В', 'Г', 'Д', 'Е']

interface QuizCardProps {
  exercise: QuizExercise
  courseSlug: string
  lessonSlug: string
  number: number
}

export default function QuizCard({ exercise, courseSlug, lessonSlug, number }: QuizCardProps) {
  const { isExerciseCompleted, setExerciseCompleted } = useProgress()
  const solved = isExerciseCompleted(courseSlug, lessonSlug, exercise.id)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const wrong = submitted && !solved && selected !== null && selected !== exercise.correctIndex

  const submit = () => {
    if (selected === null) return
    setSubmitted(true)
    if (selected === exercise.correctIndex) {
      setExerciseCompleted(courseSlug, lessonSlug, exercise.id, true)
    }
  }

  const retry = () => {
    setSelected(null)
    setSubmitted(false)
  }

  const optionClasses = (index: number): string => {
    if (solved && index === exercise.correctIndex) {
      return 'border-green-400/40 bg-green-400/10 text-fg'
    }
    if (wrong && index === selected) {
      return 'border-red-400/40 bg-red-400/10 text-fg'
    }
    if (!solved && index === selected) {
      return 'border-brand bg-brand/10 text-fg'
    }
    return 'border-line text-fg-dim hover:border-line-2 hover:text-fg'
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.05em] text-brand">
          <HelpCircle size={14} />
          Вопрос {number}
        </div>
        {solved && (
          <span className="flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs font-medium text-green-400">
            <CheckCircle2 size={13} />
            Выполнено
          </span>
        )}
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-fg">
        <RichText text={exercise.question} />
      </p>

      <div className="mt-5 space-y-2.5">
        {exercise.options.map((option, index) => (
          <button
            key={index}
            type="button"
            disabled={solved}
            onClick={() => {
              setSelected(index)
              setSubmitted(false)
            }}
            className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm leading-relaxed transition-colors disabled:cursor-default ${optionClasses(index)}`}
          >
            <span className="mt-0.5 font-mono text-xs text-fg-muted">
              {OPTION_LETTERS[index] ?? index + 1}
            </span>
            <span>
              <RichText text={option} />
            </span>
          </button>
        ))}
      </div>

      {solved ? (
        <div className="mt-5 rounded-lg border border-green-400/30 bg-green-400/5 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-green-400">
            Верно
          </div>
          <p className="mt-2 text-sm leading-relaxed text-fg-soft">
            <RichText text={exercise.explanation} />
          </p>
        </div>
      ) : wrong ? (
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <span className="text-sm text-red-400">Неверно. Перечитайте урок и попробуйте снова.</span>
          <button
            type="button"
            onClick={retry}
            className="flex items-center gap-1.5 rounded border border-line px-4 py-2 text-sm text-fg transition-colors hover:border-line-2"
          >
            <RotateCcw size={14} />
            Попробовать ещё раз
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={submit}
          disabled={selected === null}
          className="mt-5 rounded bg-brand px-6 py-2.5 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          Проверить
        </button>
      )}
    </div>
  )
}
