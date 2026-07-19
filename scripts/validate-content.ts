/**
 * Проверка инвариантов учебного контента (уроки + сборники задач).
 * Запуск: npm run validate (или node --experimental-strip-types scripts/validate-content.ts)
 */
import { pythonBasicsCourse } from '../src/data/courses/python-basics.ts'
import { databasesCourse } from '../src/data/courses/databases.ts'
import { webFrameworksCourse } from '../src/data/courses/web-frameworks.ts'
import { infrastructureCourse } from '../src/data/courses/infrastructure.ts'
import { advancedCourse } from '../src/data/courses/advanced.ts'
import { careerCourse } from '../src/data/courses/career.ts'
// Части сборников импортируются напрямую с расширением .ts: скрипт запускается
// голым Node (type stripping), который не умеет vite-овские импорты без расширения
import { problems as pythonBasics1 } from '../src/data/problems/python-basics-1.ts'
import { problems as pythonBasics2 } from '../src/data/problems/python-basics-2.ts'
import { problems as databases1 } from '../src/data/problems/databases-1.ts'
import { problems as databases2 } from '../src/data/problems/databases-2.ts'
import { problems as webFrameworks1 } from '../src/data/problems/web-frameworks-1.ts'
import { problems as webFrameworks2 } from '../src/data/problems/web-frameworks-2.ts'
import { problems as infrastructure1 } from '../src/data/problems/infrastructure-1.ts'
import { problems as infrastructure2 } from '../src/data/problems/infrastructure-2.ts'
import { problems as advanced1 } from '../src/data/problems/advanced-1.ts'
import { problems as advanced2 } from '../src/data/problems/advanced-2.ts'
import { problems as career1 } from '../src/data/problems/career-1.ts'
import { problems as career2 } from '../src/data/problems/career-2.ts'
import type { Course, Problem, ProblemDifficulty } from '../src/types/course.ts'

// Собираем те же наборы, что и src/data/problems/index.ts
const problemSets: Record<string, Problem[]> = {
  'python-basics': [...pythonBasics1, ...pythonBasics2],
  databases: [...databases1, ...databases2],
  'web-frameworks': [...webFrameworks1, ...webFrameworks2],
  infrastructure: [...infrastructure1, ...infrastructure2],
  advanced: [...advanced1, ...advanced2],
  career: [...career1, ...career2],
}

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

// ---------- Сборники задач ----------

const DIFFICULTY_RANK: Record<ProblemDifficulty, number> = { easy: 0, medium: 1, hard: 2 }
let totalProblems = 0

for (const course of courses) {
  const problems = problemSets[course.slug] ?? []
  const где = `сборник ${course.slug}`

  if (problems.length < 50 || problems.length > 100) {
    errors.push(`${где}: ${problems.length} задач (ожидалось 50–100)`)
  }
  totalProblems += problems.length

  const ids = new Set<string>()
  const indexCounts = new Map<number, number>()
  let quizTotal = 0
  let maxRank = 0

  for (const p of problems) {
    if (ids.has(p.id)) errors.push(`${где}: дубликат id задачи ${p.id}`)
    ids.add(p.id)

    if (!(p.difficulty in DIFFICULTY_RANK)) {
      errors.push(`${где} > ${p.id}: неизвестная сложность ${String(p.difficulty)}`)
      continue
    }
    // Сложность не должна убывать: сборник идёт от простых к сложным
    const rank = DIFFICULTY_RANK[p.difficulty]
    if (rank < maxRank) errors.push(`${где} > ${p.id}: сложность убывает (${p.difficulty} после более сложной)`)
    maxRank = Math.max(maxRank, rank)

    if (p.type === 'quiz') {
      quizTotal += 1
      if (p.options.length !== 4) errors.push(`${где} > ${p.id}: ${p.options.length} вариантов (нужно ровно 4)`)
      if (p.correctIndex < 0 || p.correctIndex >= p.options.length) {
        errors.push(`${где} > ${p.id}: correctIndex ${p.correctIndex} вне границ`)
      }
      if (!p.explanation.trim()) errors.push(`${где} > ${p.id}: пустое объяснение`)
      indexCounts.set(p.correctIndex, (indexCounts.get(p.correctIndex) ?? 0) + 1)
      if (new Set(p.options.map((o) => o.trim())).size !== p.options.length) {
        errors.push(`${где} > ${p.id}: одинаковые варианты ответа`)
      }
    } else {
      if (!p.solution.trim()) errors.push(`${где} > ${p.id}: пустое решение`)
      if (p.hints.length === 0) errors.push(`${где} > ${p.id}: нет подсказок`)
      if (!p.description.trim()) errors.push(`${где} > ${p.id}: пустое описание`)
    }
  }

  // Вырожденное распределение правильных ответов упрощает угадывание
  for (const [idx, count] of indexCounts) {
    if (quizTotal >= 10 && count / quizTotal > 0.55) {
      errors.push(`${где}: ${Math.round((count / quizTotal) * 100)}% квизов с correctIndex=${idx} — перемешайте варианты`)
    }
  }
}

console.log(`Курсов: ${courses.length}`)
console.log(`Уроков: ${totalLessons}`)
console.log(`Блоков контента: ${totalBlocks}`)
console.log(`Упражнений: ${totalQuizzes + totalCodeTasks} (квизов: ${totalQuizzes}, код-заданий: ${totalCodeTasks})`)
console.log(`Задач в сборниках: ${totalProblems}`)

if (errors.length > 0) {
  console.error(`\nОШИБКИ (${errors.length}):`)
  for (const e of errors) console.error(' -', e)
  process.exit(1)
}
console.log('\nВсе инварианты контента соблюдены ✓')
