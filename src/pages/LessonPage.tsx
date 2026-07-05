import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock } from 'lucide-react'
import CodeTaskCard from '@/components/course/CodeTaskCard'
import LessonBlocks from '@/components/course/LessonBlocks'
import QuizCard from '@/components/course/QuizCard'
import { useProgress } from '@/context/progress-store'
import { getLesson } from '@/data/courses'
import { usePageTitle } from '@/hooks/use-page-title'

export default function LessonPage() {
  const { courseSlug, lessonSlug } = useParams()
  const ref = getLesson(courseSlug, lessonSlug)
  usePageTitle(ref ? `${ref.lesson.title} — ${ref.course.title}` : 'Урок — Roadmap Hero')
  const { isLessonCompleted, setLessonCompleted, isExerciseCompleted } = useProgress()

  if (!ref) {
    return <Navigate to={courseSlug ? `/courses/${courseSlug}` : '/courses'} replace />
  }

  const { course, lesson, index } = ref
  const completed = isLessonCompleted(course.slug, lesson.slug)
  const prevLesson = index > 0 ? course.lessons[index - 1] : undefined
  const nextLesson = index < course.lessons.length - 1 ? course.lessons[index + 1] : undefined
  const doneExercises = lesson.exercises.filter((e) =>
    isExerciseCompleted(course.slug, lesson.slug, e.id),
  ).length

  const exerciseCards = lesson.exercises.map((exercise, i) => {
    // Порядковый номер внутри своего типа: «Вопрос 2», «Задание 1»
    const number = lesson.exercises
      .slice(0, i + 1)
      .filter((e) => e.type === exercise.type).length
    return exercise.type === 'quiz' ? (
      <QuizCard
        key={exercise.id}
        exercise={exercise}
        courseSlug={course.slug}
        lessonSlug={lesson.slug}
        number={number}
      />
    ) : (
      <CodeTaskCard
        key={exercise.id}
        exercise={exercise}
        courseSlug={course.slug}
        lessonSlug={lesson.slug}
        number={number}
      />
    )
  })

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
        {/* Боковая навигация по модулю */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-5">
            <Link
              to={`/courses/${course.slug}`}
              className="flex items-center gap-2 text-sm text-[#8A8A8A] transition-colors hover:text-[#F1F1F1]"
            >
              <ArrowLeft size={14} />
              <span className="truncate">{course.title}</span>
            </Link>
            <div className="mt-4 space-y-1">
              {course.lessons.map((l, i) => {
                const active = l.slug === lesson.slug
                const done = isLessonCompleted(course.slug, l.slug)
                return (
                  <Link
                    key={l.slug}
                    to={`/courses/${course.slug}/${l.slug}`}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                      active
                        ? 'bg-[#1A5CFF]/10 text-[#F1F1F1]'
                        : 'text-[#8A8A8A] hover:bg-[#111111] hover:text-[#F1F1F1]'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 size={15} className="flex-shrink-0 text-[#1A5CFF]" />
                    ) : (
                      <span
                        className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${
                          active ? 'border-[#1A5CFF] text-[#1A5CFF]' : 'border-[#333333]'
                        }`}
                      >
                        {i + 1}
                      </span>
                    )}
                    <span className="truncate">{l.title}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Контент урока */}
        <article className="min-w-0">
          <Link
            to={`/courses/${course.slug}`}
            className="inline-flex items-center gap-2 text-sm text-[#8A8A8A] transition-colors hover:text-[#F1F1F1] lg:hidden"
          >
            <ArrowLeft size={14} />
            {course.title}
          </Link>

          <header className="mt-4 lg:mt-0">
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#8A8A8A]">
              <span className="font-semibold uppercase tracking-[0.05em] text-[#1A5CFF]">
                Урок {index + 1} из {course.lessons.length}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {lesson.duration} мин
              </span>
              {completed && (
                <span className="flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 font-medium text-green-400">
                  <CheckCircle2 size={13} />
                  Пройден
                </span>
              )}
            </div>
            <h1 className="font-display mt-4 text-3xl font-medium tracking-[-0.02em] text-white sm:text-4xl">
              {lesson.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[#8A8A8A]">{lesson.description}</p>
          </header>

          <div className="mt-10">
            <LessonBlocks blocks={lesson.blocks} />
          </div>

          {lesson.exercises.length > 0 && (
            <section className="mt-14">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-medium text-[#F1F1F1]">Практика</h2>
                <span className="text-sm text-[#8A8A8A]">
                  {doneExercises}/{lesson.exercises.length} выполнено
                </span>
              </div>
              <div className="mt-6 space-y-6">{exerciseCards}</div>
            </section>
          )}

          <div className="mt-14 border-t border-[#1A1A1A] pt-8">
            <button
              type="button"
              onClick={() => setLessonCompleted(course.slug, lesson.slug, !completed)}
              className={`flex items-center gap-2 rounded px-6 py-3 text-sm font-medium transition-colors ${
                completed
                  ? 'border border-green-400/40 bg-green-400/10 text-green-400 hover:bg-green-400/15'
                  : 'bg-[#1A5CFF] text-[#050505] hover:bg-[#1145CC]'
              }`}
            >
              {completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              {completed ? 'Урок пройден' : 'Отметить пройденным'}
            </button>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              {prevLesson ? (
                <Link
                  to={`/courses/${course.slug}/${prevLesson.slug}`}
                  className="group flex flex-1 items-center gap-3 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-4 transition-colors hover:border-[#1A5CFF]/40"
                >
                  <ArrowLeft
                    size={16}
                    className="flex-shrink-0 text-[#8A8A8A] transition-transform group-hover:-translate-x-0.5"
                  />
                  <div className="min-w-0">
                    <div className="text-xs text-[#8A8A8A]">Предыдущий урок</div>
                    <div className="truncate text-sm font-medium text-[#F1F1F1]">
                      {prevLesson.title}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="hidden flex-1 sm:block" />
              )}
              {nextLesson ? (
                <Link
                  to={`/courses/${course.slug}/${nextLesson.slug}`}
                  className="group flex flex-1 items-center justify-end gap-3 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-4 text-right transition-colors hover:border-[#1A5CFF]/40"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-[#8A8A8A]">Следующий урок</div>
                    <div className="truncate text-sm font-medium text-[#F1F1F1]">
                      {nextLesson.title}
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="flex-shrink-0 text-[#8A8A8A] transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              ) : (
                <Link
                  to={`/courses/${course.slug}`}
                  className="group flex flex-1 items-center justify-end gap-3 rounded-xl border border-[#1A5CFF]/40 bg-[#1A5CFF]/5 p-4 text-right transition-colors hover:bg-[#1A5CFF]/10"
                >
                  <div>
                    <div className="text-xs text-[#8A8A8A]">Это был последний урок</div>
                    <div className="text-sm font-medium text-[#1A5CFF]">Завершить модуль</div>
                  </div>
                  <ArrowRight size={16} className="flex-shrink-0 text-[#1A5CFF]" />
                </Link>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
