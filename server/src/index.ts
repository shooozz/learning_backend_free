import { createApp } from './app.js'
import { config } from './config.js'

// Точка входа: собрать приложение и начать слушать порт.
// Вся логика — в app.ts и глубже; здесь только запуск.
const app = createApp()

app.listen(config.port, () => {
  console.log(`[server] API запущен на http://localhost:${config.port}`)
  console.log(`[server] База данных: ${config.databasePath}`)
})
