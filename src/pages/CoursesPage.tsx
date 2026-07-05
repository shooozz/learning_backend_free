import { GraduationCap } from 'lucide-react'
import CourseCard from '@/components/course/CourseCard'
import { useProgress } from '@/context/progress-store'
import { courses } from '@/data/courses'
import { usePageTitle } from '@/hooks/use-page-title'
import { lessonWord } from '@/lib/format'

export default function CoursesPage() {
  usePageTitle('Курсы — Roadmap Hero')
  const { overall } = useProgress()

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <header>
        <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#1A5CFF]">
          Обучающая платформа
        </span>
        <h1 className="font-display mt-4 text-3xl font-medium tracking-[-0.02em] text-white sm:text-4xl lg:text-5xl">
          Курс backend-разработки
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[#8A8A8A]">
          6 модулей — от основ Python до микросервисов и подготовки к собеседованиям. В каждом
          уроке теория, примеры кода и практические задания для закрепления.
        </p>
      </header>

      <div className="mt-10 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#1A5CFF]/20 bg-[#1A5CFF]/10 text-[#1A5CFF]">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="text-sm font-medium text-[#F1F1F1]">Общий прогресс</div>
              <div className="text-xs text-[#8A8A8A]">
                Пройдено {overall.completed} из {lessonWord(overall.total)}
              </div>
            </div>
          </div>
          <span className="font-display text-2xl font-medium text-[#1A5CFF]">
            {overall.percent}%
          </span>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#1A5CFF] to-[#1145CC] transition-all duration-700"
            style={{ width: `${overall.percent}%` }}
          />
        </div>
        {overall.completed === 0 && (
          <p className="mt-3 text-xs text-[#8A8A8A]">
            Начните с первого модуля — прогресс сохраняется автоматически в вашем браузере.
          </p>
        )}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </div>
  )
}
