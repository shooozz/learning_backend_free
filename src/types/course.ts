/** Языки, поддерживаемые подсветкой синтаксиса (см. src/lib/prism.ts) */
export type CodeLanguage =
  | 'python'
  | 'sql'
  | 'bash'
  | 'yaml'
  | 'docker'
  | 'json'
  | 'javascript'
  | 'http'
  | 'text'

/** Блок контента урока. Поля `text` и `items` поддерживают **жирный** и `моноширинный` инлайн-синтаксис. */
export type ContentBlock =
  | { type: 'heading'; text: string }
  | { type: 'text'; text: string }
  | { type: 'code'; language: CodeLanguage; code: string; filename?: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'note'; variant: 'info' | 'tip' | 'warning'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }

export interface QuizExercise {
  type: 'quiz'
  /** Уникален в пределах урока, например 'q1' */
  id: string
  question: string
  options: string[]
  /** Индекс правильного ответа в options (с нуля) */
  correctIndex: number
  /** Показывается после правильного ответа */
  explanation: string
}

export interface CodeExercise {
  type: 'code'
  /** Уникален в пределах урока, например 'c1' */
  id: string
  title: string
  description: string
  language: CodeLanguage
  /** Заготовка кода, с которой начинает студент */
  starterCode?: string
  /** Полное эталонное решение */
  solution: string
  /** Подсказки, открываются по одной */
  hints: string[]
}

export type Exercise = QuizExercise | CodeExercise

export interface Lesson {
  slug: string
  title: string
  description: string
  /** Оценка времени прохождения в минутах */
  duration: number
  blocks: ContentBlock[]
  exercises: Exercise[]
}

export interface Course {
  slug: string
  /** Порядковый номер модуля, с единицы */
  order: number
  title: string
  description: string
  level: 'Начальный' | 'Средний' | 'Продвинутый'
  image: string
  tags: string[]
  lessons: Lesson[]
}
