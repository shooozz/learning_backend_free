// Тонкий клиент для нашего API. Все запросы идут на относительный /api:
// в dev их проксирует vite (vite.config.ts), в production — сам сервер.
// Токен авторизации живёт в httpOnly-cookie, браузер шлёт её сам —
// в коде клиента никакой работы с токеном нет вообще.

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    // fetch бросает только на сетевом уровне (сервер не запущен, нет сети)
    throw new ApiError(0, 'Сервер недоступен. Убедитесь, что он запущен (npm run dev:server).')
  }

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    // Сервер всегда отвечает форматом { error: "..." } — показываем его текст
    const message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : `Ошибка запроса (${response.status})`
    throw new ApiError(response.status, message)
  }

  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path, 'GET'),
  post: <T>(path: string, body?: unknown) => request<T>(path, 'POST', body),
  put: <T>(path: string, body: unknown) => request<T>(path, 'PUT', body),
}
