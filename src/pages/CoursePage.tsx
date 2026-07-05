import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Play,
} from 'lucide-react'
import { courseIcons, fallbackCourseIcon } from '@/components/course/course-icons'
import { useProgress } from '@/context/progress-store'
import { courseDuration, getCourse, getNextCourse } from '@/data/courses'
import { usePageTitle } from '@/hooks/use-page-title'
import { formatDuration, lessonWord } from '@/lib/format'

export default function CoursePage() {
  const { courseSlug } = useParams()
  const course = getCourse(courseSlug)
  usePageTitle(course ? `${course.title} — Roadmap Hero` : 'Курс — Roadmap Hero')
  const { isLessonCompleted, getCourseProgress } = useProgress()

  if (!course) return <Navigate to="/courses" replace />

  const progress = getCourseProgress(course.slug)
  const firstIncomplete = course.lessons.find((l) => !isLessonCompleted(course.slug, l.slug))
  const continueLesson = firstIncomplete ?? course.lessons[0]
  const nextCourse = getNextCourse(course)
  const Icon = courseIcons[course.slug] ?? fallbackCourseIcon

  const ctaLabel =
    progress.completed === 0
      ? 'Начать модуль'
      : progress.percent === 100
        ? 'Повторить материал'
        : 'Продолжить обучение'

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 text-sm text-[#8A8A8A] transition-colors hover:text-[#F1F1F1]"
      >
        <ArrowLeft size={15} />
        Все модули
      </Link>

      <header className="mt-6 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#1A5CFF]/30 bg-[#1A5CFF]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-[#1A5CFF]">
            Модуль {course.order}
          </span>
          <span className="rounded-full border border-[#1A1A1A] px-3 py-1 text-xs text-[#8A8A8A]">
            {course.level}
          </span>
        </div>

        <div className="mt-5 flex items-start gap-4">
          <div className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-[#1A5CFF]/20 bg-[#1A5CFF]/10 text-[#1A5CFF] sm:flex">
            <Icon size={24} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-medium tracking-[-0.02em] text-white sm:text-4xl">
              {course.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#8A8A8A]">
              {course.description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-[#8A8A8A]">
          <span className="flex items-center gap-2">
            <BookOpen size={15} />
            {lessonWord(course.lessons.length)}
          </span>
          <span className="flex items-center gap-2">
            <Clock size={15} />
            {formatDuration(courseDuration(course))}
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8A8A8A]">
              Пройдено {progress.completed} из {progress.total}
            </span>
            <span className="font-semibold text-[#1A5CFF]">{progress.percent}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1A5CFF] to-[#1145CC] transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        {continueLesson && (
          <Link
            to={`/courses/${course.slug}/${continueLesson.slug}`}
            className="mt-7 inline-flex items-center gap-2 rounded bg-[#1A5CFF] px-7 py-3 text-sm font-medium text-[#050505] transition-colors hover:bg-[#1145CC]"
          >
            <Play size={15} />
            {ctaLabel}
          </Link>
        )}
      </header>

      <section className="mt-10">
        <h2 className="font-display text-xl font-medium text-[#F1F1F1]">Уроки модуля</h2>
        <div className="mt-5 space-y-3">
          {course.lessons.map((lesson, index) => {
            const done = isLessonCompleted(course.slug, lesson.slug)
            return (
              <Link
                key={lesson.slug}
                to={`/courses/${course.slug}/${lesson.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-5 transition-colors hover:border-[#1A5CFF]/40"
              >
                {done ? (
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-green-400/30 bg-green-400/10 text-green-400">
                    <CheckCircle2 size={17} />
                  </span>
                ) : (
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#1A1A1A] bg-[#0F0F0F] font-mono text-sm text-[#8A8A8A]">
                    {index + 1}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-[#F1F1F1]">{lesson.title}</h3>
                  <p className="mt-0.5 truncate text-sm text-[#8A8A8A]">{lesson.description}</p>
                </div>
                <span className="hidden flex-shrink-0 items-center gap-1.5 text-xs text-[#8A8A8A] sm:flex">
                  <Clock size={13} />
                  {lesson.duration} мин
                </span>
                <ChevronRight
                  size={17}
                  className="flex-shrink-0 text-[#8A8A8A] transition-transform group-hover:translate-x-0.5 group-hover:text-[#1A5CFF]"
                />
              </Link>
            )
          })}
        </div>
      </section>

      {nextCourse && (
        <Link
          to={`/courses/${nextCourse.slug}`}
          className="group mt-10 flex items-center justify-between rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-6 transition-colors hover:border-[#1A5CFF]/40"
        >
          <div>
            <div className="text-xs uppercase tracking-[0.05em] text-[#8A8A8A]">
              Следующий модуль
            </div>
            <div className="font-display mt-1 text-lg font-medium text-[#F1F1F1]">
              {nextCourse.order}. {nextCourse.title}
            </div>
          </div>
          <ArrowRight
            size={19}
            className="text-[#8A8A8A] transition-transform group-hover:translate-x-1 group-hover:text-[#1A5CFF]"
          />
        </Link>
      )}
    </div>
  )
}
