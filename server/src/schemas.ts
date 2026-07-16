import { z } from 'zod'

// Валидация на границе системы: всё, что пришло по сети, — недоверенные данные.
// zod и проверяет форму данных, и выводит из схемы TypeScript-типы,
// так что "тип запроса" и "проверка запроса" не могут разъехаться.

export const credentialsSchema = z.object({
  email: z
    .email('Введите корректный email')
    .max(254, 'Слишком длинный email')
    .transform((value) => value.trim().toLowerCase()),
  password: z
    .string('Пароль обязателен')
    .min(8, 'Пароль должен быть не короче 8 символов')
    .max(128, 'Слишком длинный пароль'),
})

// Ограничения на размер массивов и строк — защита от злоумышленника,
// который решит сохранить "прогресс" на пару гигабайт.
const progressKey = z.string().min(1).max(300)

export const progressSchema = z.object({
  lessons: z.array(progressKey).max(2000),
  exercises: z.array(progressKey).max(10000),
})

export type Credentials = z.infer<typeof credentialsSchema>
export type ProgressPayload = z.infer<typeof progressSchema>
