import type { Problem } from '@/types/course'
import { problems as pythonBasics1 } from './python-basics-1'
import { problems as pythonBasics2 } from './python-basics-2'
import { problems as databases1 } from './databases-1'
import { problems as databases2 } from './databases-2'
import { problems as webFrameworks1 } from './web-frameworks-1'
import { problems as webFrameworks2 } from './web-frameworks-2'
import { problems as infrastructure1 } from './infrastructure-1'
import { problems as infrastructure2 } from './infrastructure-2'
import { problems as advanced1 } from './advanced-1'
import { problems as advanced2 } from './advanced-2'
import { problems as career1 } from './career-1'
import { problems as career2 } from './career-2'

/**
 * Сборники задач по модулям. Каждый модуль разбит на два файла
 * (часть 1: лёгкие → средние, часть 2: средние → сложные), здесь они
 * склеиваются в один список. Ключ — slug курса из src/data/courses.
 *
 * Прогресс по задачам хранится теми же ключами, что и упражнения уроков:
 * `<courseSlug>/problems/<problemId>` — поэтому id задач менять нельзя.
 */
export const problemSets: Record<string, Problem[]> = {
  'python-basics': [...pythonBasics1, ...pythonBasics2],
  databases: [...databases1, ...databases2],
  'web-frameworks': [...webFrameworks1, ...webFrameworks2],
  infrastructure: [...infrastructure1, ...infrastructure2],
  advanced: [...advanced1, ...advanced2],
  career: [...career1, ...career2],
}

export function getProblems(courseSlug: string): Problem[] {
  return problemSets[courseSlug] ?? []
}
