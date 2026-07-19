import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getProgress, saveProgress } from '../repositories/progress.repo.js'
import { progressSchema } from '../schemas.js'

export const progressRouter = Router()

// Все маршруты прогресса доступны только авторизованным:
// requireAuth кладёт req.userId, и каждый видит только свои данные.
progressRouter.use(requireAuth)

// GET /api/progress — весь прогресс текущего пользователя
progressRouter.get('/', (req, res) => {
  res.json(getProgress(req.userId!))
})

// PUT /api/progress — полная замена прогресса.
// PUT (а не PATCH) сознательно: клиент — источник истины, он присылает
// полный снимок. Это делает запрос идемпотентным: повтор того же запроса
// (например, при ретрае после обрыва сети) не ломает данные.
progressRouter.put('/', (req, res) => {
  const payload = progressSchema.parse(req.body)
  saveProgress(req.userId!, payload)
  res.json({ ok: true })
})
