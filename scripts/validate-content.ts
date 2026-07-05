/**
 * Проверка инвариантов учебного контента.
 * Запуск: node --experimental-strip-types scripts/validate-content.ts
 */
import { pythonBasicsCourse } from '../src/data/courses/python-basics.ts'
import { databasesCourse } from '../src/data/courses/databases.ts'
import { webFrameworksCourse } from '../src/data/courses/web-frameworks.ts'
import { infrastructureCourse } from '../src/data/courses/infrastructure.ts'
import { advancedCourse } from '../src/data/courses/advanced.ts'
import { careerCourse } from '../src/data/courses/career.ts'
import type { Course } from '../src/types/course.ts'

const courses: Course[] = [
  pythonBasicsCourse,
  databasesCourse,
  webFrameworksCourse,
  infrastructureCourse,
  advancedCourse,
  careerCourse,
]

const errors: string[] = []
let totalLessons = 0
let totalBlocks = 0
let totalQuizzes = 0
let totalCodeTasks = 0

const courseSlugs = new Set<string>()

for (const course of courses) {
  const где = `курс ${course.slug}`
  if (courseSlugs.has(course.slug)) errors.push(`${где}: дубликат slug курса`)
  courseSlugs.add(course.slug)

  if (course.lessons.length !== 6) {
    errors.push(`${где}: ${course.lessons.length} уроков вместо 6`)
  }

  const lessonSlugs = new Set<string>()
  for (const lesson of course.lessons) {
    totalLessons += 1
    const гдеУрок = `${где} > урок ${lesson.slug}`

    if (lessonSlugs.has(lesson.slug)) errors.push(`${гдеУрок}: дубликат slug урока`)
    lessonSlugs.add(lesson.slug)

    if (!lesson.title.trim()) errors.push(`${гдеУрок}: пустой title`)
    if (!lesson.description.trim()) errors.push(`${гдеУрок}: пустой description`)
    if (lesson.duration <= 0 || lesson.duration > 120) {
      errors.push(`${гдеУрок}: подозрительная длительность ${lesson.duration} мин`)
    }
    if (lesson.blocks.length < 8) {
      errors.push(`${гдеУрок}: слишком мало блоков (${lesson.blocks.length})`)
    }
    totalBlocks += lesson.blocks.length

    for (const [i, block] of lesson.blocks.entries()) {
      if (block.type === 'code' && !block.code.trim()) {
        errors.push(`${гдеУрок} > блок ${i}: пустой code`)
      }
      if (block.type === 'table') {
        for (const row of block.rows) {
          if (row.length !== block.headers.length) {
            errors.push(`${гдеУрок} > блок ${i}: строка таблицы не совпадает с заголовками`)
          }
        }
      }
      if (block.type === 'list' && block.items.length === 0) {
        errors.push(`${гдеУрок} > блок ${i}: пустой список`)
      }
    }

    if (lesson.exercises.length < 3 || lesson.exercises.length > 4) {
      errors.push(`${гдеУрок}: ${lesson.exercises.length} упражнений (ожидалось 3-4)`)
    }

    const exerciseIds = new Set<string>()
    let quizCount = 0
    let codeCount = 0
    for (const ex of lesson.exercises) {
      if (exerciseIds.has(ex.id)) errors.push(`${гдеУрок}: дубликат id упражнения ${ex.id}`)
      exerciseIds.add(ex.id)

      if (ex.type === 'quiz') {
        quizCount += 1
        totalQuizzes += 1
        if (ex.options.length < 2) errors.push(`${гдеУрок} > ${ex.id}: меньше 2 вариантов`)
        if (ex.correctIndex < 0 || ex.correctIndex >= ex.options.length) {
          errors.push(`${гдеУрок} > ${ex.id}: correctIndex ${ex.correctIndex} вне границ`)
        }
        if (!ex.explanation.trim()) errors.push(`${гдеУрок} > ${ex.id}: пустое объяснение`)
      } else {
        codeCount += 1
        totalCodeTasks += 1
        if (!ex.solution.trim()) errors.push(`${гдеУрок} > ${ex.id}: пустое решение`)
        if (ex.hints.length === 0) errors.push(`${гдеУрок} > ${ex.id}: нет подсказок`)
      }
    }
    if (quizCount < 2) errors.push(`${гдеУрок}: только ${quizCount} квизов (ожидалось >=2)`)
    if (codeCount < 1) errors.push(`${гдеУрок}: нет код-заданий`)
  }
}

console.log(`Курсов: ${courses.length}`)
console.log(`Уроков: ${totalLessons}`)
console.log(`Блоков контента: ${totalBlocks}`)
console.log(`Упражнений: ${totalQuizzes + totalCodeTasks} (квизов: ${totalQuizzes}, код-заданий: ${totalCodeTasks})`)

if (errors.length > 0) {
  console.error(`\nОШИБКИ (${errors.length}):`)
  for (const e of errors) console.error(' -', e)
  process.exit(1)
}
console.log('\nВсе инварианты контента соблюдены ✓')
