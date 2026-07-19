import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock } from 'lucide-react'
import { useProgress } from '@/context/progress-store'
import { courseDuration } from '@/data/courses'
import { formatDuration, lessonWord } from '@/lib/format'
import type { Course } from '@/types/course'
import { courseIcons, fallbackCourseIcon } from './course-icons'

export default function CourseCard({ course }: { course: Course }) {
  const { getCourseProgress } = useProgress()
  const progress = getCourseProgress(course.slug)
  const Icon = courseIcons[course.slug] ?? fallbackCourseIcon
  const duration = courseDuration(course)

  const cta =
    progress.completed === 0 ? 'Начать' : progress.percent === 100 ? 'Повторить' : 'Продолжить'

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-300 hover:border-brand/40"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-line bg-base/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-brand backdrop-blur-sm">
          Модуль {course.order}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand">
            <Icon size={20} />
          </div>
          <span className="rounded-full border border-line px-3 py-1 text-xs text-fg-muted">
            {course.level}
          </span>
        </div>

        <h3 className="font-display mt-4 text-xl font-medium text-fg">{course.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted">{course.description}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-fg-muted">
          <span className="flex items-center gap-1.5">
            <BookOpen size={13} />
            {lessonWord(course.lessons.length)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} />
            {formatDuration(duration)}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-fg-muted">Прогресс</span>
            <span className="font-semibold text-brand">{progress.percent}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand-strong transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm font-medium text-brand">
          {cta}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
