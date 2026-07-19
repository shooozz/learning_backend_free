import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ListChecks } from 'lucide-react'
import CodeTaskCard from '@/components/course/CodeTaskCard'
import QuizCard from '@/components/course/QuizCard'
import { useProgress } from '@/context/progress-store'
import { getCourse } from '@/data/courses'
import { getProblems } from '@/data/problems'
import { usePageTitle } from '@/hooks/use-page-title'
import type { ProblemDifficulty } from '@/types/course'

/**
 * Прогресс по задачам хранится теми же ключами, что и упражнения уроков:
 * courseSlug/<PROBLEMS_SLUG>/<problemId>. Слово 'problems' занято под это
 * «виртуальный урок» — реального урока с таким slug быть не должно.
 */
export const PROBLEMS_SLUG = 'problems'

type Filter = 'all' | ProblemDifficulty

const DIFFICULTY_META: Record<ProblemDifficulty, { label: string; single: string; badge: string }> = {
  easy: { label: 'Лёгкие', single: 'Лёгкая', badge: 'border-green-400/30 bg-green-400/10 text-green-400' },
  medium: { label: 'Средние', single: 'Средняя', badge: 'border-amber-400/30 bg-amber-400/10 text-amber-400' },
  hard: { label: 'Сложные', single: 'Сложная', badge: 'border-red-400/30 bg-red-400/10 text-red-400' },
}

export default function ProblemsPage() {
  const { courseSlug } = useParams()
  const course = getCourse(courseSlug)
  const problems = useMemo(() => (course ? getProblems(course.slug) : []), [course])
  const { isExerciseCompleted } = useProgress()
  const [filter, setFilter] = useState<Filter>('all')
  // «Скрыть решённые» прячет СНИМОК решённых на момент включения галочки,
  // а не живой статус: иначе правильный ответ мгновенно размонтировал бы
  // карточку, и пользователь не увидел бы ни «Верно», ни объяснения
  const [hiddenIds, setHiddenIds] = useState<Set<string> | null>(null)

  usePageTitle(course ? `Задачи: ${course.title} — Roadmap Hero` : 'Задачи — Roadmap Hero')

  if (!course) return <Navigate to="/courses" replace />

  const solvedCount = problems.filter((p) => isExerciseCompleted(course.slug, PROBLEMS_SLUG, p.id)).length
  const percent = problems.length === 0 ? 0 : Math.round((solvedCount / problems.length) * 100)

  // Нумерация задач — по позиции в полном списке, чтобы «Задача 37»
  // оставалась той же задачей при любом фильтре
  const numbered = problems.map((problem, index) => ({ problem, number: index + 1 }))
  const visible = numbered.filter(({ problem }) => {
    if (filter !== 'all' && problem.difficulty !== filter) return false
    if (hiddenIds?.has(problem.id)) return false
    return true
  })

  const toggleHideSolved = (checked: boolean) => {
    setHiddenIds(
      checked
        ? new Set(
            problems
              .filter((p) => isExerciseCompleted(course.slug, PROBLEMS_SLUG, p.id))
              .map((p) => p.id),
          )
        : null,
    )
  }

  const countBy = (d: ProblemDifficulty) => problems.filter((p) => p.difficulty === d).length

  const filterButton = (value: Filter, label: string, count: number) => (
    <button
      key={value}
      type="button"
      onClick={() => setFilter(value)}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        filter === value
          ? 'border-brand bg-brand/10 text-brand'
          : 'border-line text-fg-muted hover:border-line-2 hover:text-fg'
      }`}
    >
      {label} <span className="text-xs opacity-70">{count}</span>
    </button>
  )

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <Link
        to={`/courses/${course.slug}`}
        className="inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        <ArrowLeft size={15} />
        {course.title}
      </Link>

      <header className="mt-6 rounded-xl border border-line bg-surface p-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.05em] text-brand">
          <ListChecks size={14} />
          Сборник задач
        </div>
        <h1 className="font-display mt-3 text-3xl font-medium tracking-[-0.02em] text-fg">
          {course.title}: практика
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-fg-muted">
          {problems.length > 0
            ? `${problems.length} задач — от разминки до задач «со звёздочкой». Решайте по порядку или фильтруйте по сложности: прогресс сохраняется для каждой задачи.`
            : 'Сборник задач для этого модуля готовится.'}
        </p>

        {problems.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-fg-muted">
                Решено {solvedCount} из {problems.length}
              </span>
              <span className="font-semibold text-brand">{percent}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-brand-strong transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {problems.length > 0 && (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {filterButton('all', 'Все', problems.length)}
            {(['easy', 'medium', 'hard'] as const).map((d) =>
              filterButton(d, DIFFICULTY_META[d].label, countBy(d)),
            )}
            <label className="ml-auto flex cursor-pointer select-none items-center gap-2 text-sm text-fg-muted">
              <input
                type="checkbox"
                checked={hiddenIds !== null}
                onChange={(e) => toggleHideSolved(e.target.checked)}
                className="accent-brand"
              />
              Скрыть решённые
            </label>
          </div>

          <div className="mt-6 space-y-5">
            {visible.length === 0 && (
              <div className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-fg-muted">
                <CheckCircle2 size={18} className="mx-auto mb-2 text-green-400" />
                Здесь всё решено. Смените фильтр — или гордитесь собой.
              </div>
            )}
            {visible.map(({ problem, number }) => (
              <div key={problem.id}>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${DIFFICULTY_META[problem.difficulty].badge}`}
                  >
                    {DIFFICULTY_META[problem.difficulty].single}
                  </span>
                </div>
                {problem.type === 'quiz' ? (
                  <QuizCard
                    exercise={problem}
                    courseSlug={course.slug}
                    lessonSlug={PROBLEMS_SLUG}
                    number={number}
                  />
                ) : (
                  <CodeTaskCard
                    exercise={problem}
                    courseSlug={course.slug}
                    lessonSlug={PROBLEMS_SLUG}
                    number={number}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
