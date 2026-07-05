import type { Course, Lesson } from '@/types/course'
import { pythonBasicsCourse } from './python-basics'
import { databasesCourse } from './databases'
import { webFrameworksCourse } from './web-frameworks'
import { infrastructureCourse } from './infrastructure'
import { advancedCourse } from './advanced'
import { careerCourse } from './career'

export const courses: Course[] = [
  pythonBasicsCourse,
  databasesCourse,
  webFrameworksCourse,
  infrastructureCourse,
  advancedCourse,
  careerCourse,
].sort((a, b) => a.order - b.order)

export function getCourse(slug: string | undefined): Course | undefined {
  return courses.find((c) => c.slug === slug)
}

export interface LessonRef {
  course: Course
  lesson: Lesson
  index: number
}

export function getLesson(courseSlug: string | undefined, lessonSlug: string | undefined): LessonRef | undefined {
  const course = getCourse(courseSlug)
  if (!course) return undefined
  const index = course.lessons.findIndex((l) => l.slug === lessonSlug)
  if (index === -1) return undefined
  return { course, lesson: course.lessons[index], index }
}

/** Суммарная длительность курса в минутах */
export function courseDuration(course: Course): number {
  return course.lessons.reduce((acc, l) => acc + l.duration, 0)
}

export function getNextCourse(course: Course): Course | undefined {
  const index = courses.findIndex((c) => c.slug === course.slug)
  return index >= 0 ? courses[index + 1] : undefined
}
