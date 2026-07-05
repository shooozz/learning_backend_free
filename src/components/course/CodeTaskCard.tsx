import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, Circle, Code2, Lightbulb } from 'lucide-react'
import { useProgress } from '@/context/progress-store'
import type { CodeExercise } from '@/types/course'
import CodeBlock from './CodeBlock'
import RichText from './RichText'

interface CodeTaskCardProps {
  exercise: CodeExercise
  courseSlug: string
  lessonSlug: string
  number: number
}

export default function CodeTaskCard({
  exercise,
  courseSlug,
  lessonSlug,
  number,
}: CodeTaskCardProps) {
  const { isExerciseCompleted, setExerciseCompleted } = useProgress()
  const completed = isExerciseCompleted(courseSlug, lessonSlug, exercise.id)
  const [hintsShown, setHintsShown] = useState(0)
  const [solutionOpen, setSolutionOpen] = useState(false)

  return (
    <div className="rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.05em] text-[#1A5CFF]">
          <Code2 size={14} />
          Задание {number}
        </div>
        {completed && (
          <span className="flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs font-medium text-green-400">
            <CheckCircle2 size={13} />
            Выполнено
          </span>
        )}
      </div>

      <h3 className="font-display mt-3 text-lg font-medium text-[#F1F1F1]">{exercise.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#B8B8B8]">
        <RichText text={exercise.description} />
      </p>

      {exercise.starterCode && (
        <div className="mt-4">
          <CodeBlock code={exercise.starterCode} language={exercise.language} filename="Заготовка" />
        </div>
      )}

      {hintsShown > 0 && (
        <div className="mt-4 space-y-3">
          {exercise.hints.slice(0, hintsShown).map((hint, i) => (
            <div key={i} className="rounded-lg border border-green-400/30 bg-green-400/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-green-400">
                <Lightbulb size={13} />
                Подсказка {i + 1}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-[#D6D6D6]">
                <RichText text={hint} />
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {hintsShown < exercise.hints.length && (
          <button
            type="button"
            onClick={() => setHintsShown((n) => n + 1)}
            className="flex items-center gap-1.5 rounded border border-[#1A1A1A] px-4 py-2 text-sm text-[#B8B8B8] transition-colors hover:border-[#333333] hover:text-[#F1F1F1]"
          >
            <Lightbulb size={14} />
            Подсказка ({hintsShown + 1}/{exercise.hints.length})
          </button>
        )}
        <button
          type="button"
          onClick={() => setSolutionOpen((open) => !open)}
          className="flex items-center gap-1.5 rounded border border-[#1A1A1A] px-4 py-2 text-sm text-[#B8B8B8] transition-colors hover:border-[#333333] hover:text-[#F1F1F1]"
        >
          {solutionOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {solutionOpen ? 'Скрыть решение' : 'Показать решение'}
        </button>
      </div>

      {solutionOpen && (
        <div className="mt-4">
          <p className="mb-3 text-xs text-[#8A8A8A]">
            Сначала попробуйте решить самостоятельно — так материал закрепится намного лучше.
          </p>
          <CodeBlock code={exercise.solution} language={exercise.language} filename="Решение" />
        </div>
      )}

      <div className="mt-5 border-t border-[#1A1A1A] pt-5">
        <button
          type="button"
          onClick={() => setExerciseCompleted(courseSlug, lessonSlug, exercise.id, !completed)}
          className={`flex items-center gap-2 rounded px-5 py-2.5 text-sm font-medium transition-colors ${
            completed
              ? 'border border-green-400/40 bg-green-400/10 text-green-400 hover:bg-green-400/15'
              : 'bg-[#1A5CFF] text-[#050505] hover:bg-[#1145CC]'
          }`}
        >
          {completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          {completed ? 'Выполнено' : 'Отметить выполненным'}
        </button>
      </div>
    </div>
  )
}
