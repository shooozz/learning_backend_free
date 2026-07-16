/**
 * Ошибка с HTTP-статусом. Роуты бросают её, а централизованный
 * error-handler превращает в JSON-ответ. Так логика "что пошло не так"
 * отделена от логики "как об этом сообщить клиенту".
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}
