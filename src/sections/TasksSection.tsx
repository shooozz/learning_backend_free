import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Code2, Database, Server, Container, Cpu, Briefcase } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface Task {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  completed: boolean
}

interface TaskCategory {
  stage: number
  title: string
  icon: React.ReactNode
  tasks: Task[]
}

const taskCategories: TaskCategory[] = [
  {
    stage: 1,
    title: 'Основы Python',
    icon: <Code2 size={20} />,
    tasks: [
      { id: 'py1', title: 'Калькулятор с ООП', description: 'Создайте класс Calculator с методами add, subtract, multiply, divide. Добавьте обработку исключений.', difficulty: 'easy', completed: false },
      { id: 'py2', title: 'Файловый менеджер', description: 'Напишите скрипт для работы с файлами: чтение, запись, копирование, переименование. Используйте pathlib.', difficulty: 'easy', completed: false },
      { id: 'py3', title: 'Генератор отчётов', description: 'Создайте генератор, который построчно читает большой CSV-файл и возвращает обработанные данные без загрузки в память.', difficulty: 'medium', completed: false },
      { id: 'py4', title: 'Декораторы логирования', description: 'Реализуйте декоратор, который логирует время выполнения функции и сохраняет в файл.', difficulty: 'medium', completed: false },
    ],
  },
  {
    stage: 2,
    title: 'Базы данных',
    icon: <Database size={20} />,
    tasks: [
      { id: 'db1', title: 'Спроектировать схему БД', description: 'Спроектируйте БД для интернет-магазина: пользователи, товары, заказы, отзывы. Нарисуйте ER-диаграмму.', difficulty: 'easy', completed: false },
      { id: 'db2', title: 'SQL-запросы', description: 'Напишите 10 сложных SQL-запросов: JOIN, GROUP BY, подзапросы, CTE, оконные функции.', difficulty: 'medium', completed: false },
      { id: 'db3', title: 'Миграции Alembic', description: 'Настройте Alembic для проекта. Создайте 3 миграции: создание таблиц, добавление индексов, изменение колонки.', difficulty: 'medium', completed: false },
      { id: 'db4', title: 'Оптимизация запросов', description: 'Проанализируйте медленные запросы через EXPLAIN. Добавьте индексы и оптимизируйте.', difficulty: 'hard', completed: false },
    ],
  },
  {
    stage: 3,
    title: 'Веб-фреймворки',
    icon: <Server size={20} />,
    tasks: [
      { id: 'web1', title: 'REST API на FastAPI', description: 'Создайте CRUD API для управления задачами с валидацией Pydantic и автодокументацией.', difficulty: 'easy', completed: false },
      { id: 'web2', title: 'Аутентификация JWT', description: 'Реализуйте регистрацию, логин, refresh токены и защищённые эндпоинты.', difficulty: 'medium', completed: false },
      { id: 'web3', title: 'Django + DRF проект', description: 'Создайте блог с API: посты, комментарии, теги, пагинация, фильтрация.', difficulty: 'medium', completed: false },
      { id: 'web4', title: 'WebSocket чат', description: 'Реализуйте real-time чат с WebSockets, историей сообщений и уведомлениями.', difficulty: 'hard', completed: false },
    ],
  },
  {
    stage: 4,
    title: 'Инфраструктура',
    icon: <Container size={20} />,
    tasks: [
      { id: 'inf1', title: 'Docker контейнеры', description: 'Создайте Dockerfile и docker-compose для Django-приложения с PostgreSQL и Redis.', difficulty: 'easy', completed: false },
      { id: 'inf2', title: 'CI/CD Pipeline', description: 'Настройте GitHub Actions: линтер, тесты, сборка образа, деплой на сервер.', difficulty: 'medium', completed: false },
      { id: 'inf3', title: 'Nginx + Gunicorn', description: 'Настройте production-деплой: Nginx как reverse proxy, Gunicorn как WSGI.', difficulty: 'medium', completed: false },
      { id: 'inf4', title: 'Мониторинг', description: 'Подключите Prometheus + Grafana для сбора метрик приложения.', difficulty: 'hard', completed: false },
    ],
  },
  {
    stage: 5,
    title: 'Продвинутые темы',
    icon: <Cpu size={20} />,
    tasks: [
      { id: 'adv1', title: 'Кэширование Redis', description: 'Интегрируйте Redis для кэширования API-ответов и сессий.', difficulty: 'easy', completed: false },
      { id: 'adv2', title: 'Celery фоновые задачи', description: 'Настройте Celery для отправки email, генерации отчётов, периодических задач.', difficulty: 'medium', completed: false },
      { id: 'adv3', title: 'Kafka очереди', description: 'Реализуйте event-driven архитектуру: producer, consumer, topics, обработка событий.', difficulty: 'hard', completed: false },
      { id: 'adv4', title: 'Микросервисы', description: 'Разбейте монолит на 3 микросервиса с API Gateway и межсервисным взаимодействием.', difficulty: 'hard', completed: false },
    ],
  },
  {
    stage: 6,
    title: 'Карьера',
    icon: <Briefcase size={20} />,
    tasks: [
      { id: 'car1', title: 'Резюме и портфолио', description: 'Составьте профессиональное резюме и оформите GitHub с описанием проектов.', difficulty: 'easy', completed: false },
      { id: 'car2', title: 'Системный дизайн', description: 'Спроектируйте URL shortener: требования, расчёт нагрузки, архитектура, БД.', difficulty: 'hard', completed: false },
      { id: 'car3', title: 'Мок-собеседование', description: 'Пройдите мок-собеседование: алгоритмы, Python, БД, архитектура, поведенческие вопросы.', difficulty: 'medium', completed: false },
      { id: 'car4', title: 'Code Review', description: 'Проведите code review чужого PR: найдите 10+ проблем и предложите улучшения.', difficulty: 'medium', completed: false },
    ],
  },
]

const difficultyLabels = {
  easy: { text: 'Лёгкий', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  medium: { text: 'Средний', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  hard: { text: 'Сложный', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
}

const TASKS_STORAGE_KEY = 'roadmap-hero:landing-tasks:v1'

function loadCompletedTasks(): Set<string> {
  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

export default function TasksSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [expandedStage, setExpandedStage] = useState<number | null>(1)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(loadCompletedTasks)

  useEffect(() => {
    try {
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([...completedTasks]))
    } catch {
      // localStorage недоступен — чек-лист не сохранится между сессиями
    }
  }, [completedTasks])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from('.tasks-header', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.tasks-header',
          start: 'top 85%',
        },
      })

      gsap.from('.task-category', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.task-categories-list',
          start: 'top 85%',
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  const toggleStage = (stage: number) => {
    setExpandedStage(expandedStage === stage ? null : stage)
  }

  const totalTasks = taskCategories.reduce((acc, cat) => acc + cat.tasks.length, 0)
  const completedCount = completedTasks.size
  const progressPercent = Math.round((completedCount / totalTasks) * 100)

  return (
    <section
      id="tasks"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32"
      style={{ background: '#050505' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="tasks-header text-center mb-12">
          <span className="text-[#1A5CFF] text-xs tracking-[0.05em] uppercase font-semibold">
            Практические задания
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-white mt-4 tracking-[-0.02em]">
            Закрепляйте знания на практике
          </h2>
          <p className="mt-4 text-[#8A8A8A] text-base max-w-2xl mx-auto">
            Каждое задание спроектировано для применения полученных знаний в реальных сценариях
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-12 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#F1F1F1] text-sm font-medium">Общий прогресс</span>
            <span className="text-[#1A5CFF] text-sm font-semibold">{completedCount} / {totalTasks} ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1A5CFF] to-[#1145CC] rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Task categories */}
        <div className="task-categories-list space-y-4">
          {taskCategories.map((category) => {
            const isExpanded = expandedStage === category.stage
            const stageCompleted = category.tasks.filter((t) => completedTasks.has(t.id)).length
            const stageTotal = category.tasks.length

            return (
              <div
                key={category.stage}
                className="task-category bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl overflow-hidden hover:border-[#1A1A1A] transition-colors"
              >
                {/* Category header */}
                <button
                  onClick={() => toggleStage(category.stage)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#1A5CFF]/10 border border-[#1A5CFF]/20 flex items-center justify-center text-[#1A5CFF]">
                      {category.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-display text-lg font-medium text-[#F1F1F1]">
                          {category.title}
                        </h3>
                        <span className="text-xs text-[#8A8A8A]">
                          {stageCompleted}/{stageTotal}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-[#1A1A1A] rounded-full mt-2 overflow-hidden" style={{ width: '120px' }}>
                        <div
                          className="h-full bg-[#1A5CFF] rounded-full transition-all duration-500"
                          style={{ width: `${(stageCompleted / stageTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-[#8A8A8A]">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {/* Tasks list */}
                {isExpanded && (
                  <div className="border-t border-[#1A1A1A]">
                    {category.tasks.map((task) => {
                      const isCompleted = completedTasks.has(task.id)
                      const diff = difficultyLabels[task.difficulty]

                      return (
                        <div
                          key={task.id}
                          className={`p-5 border-b border-[#1A1A1A] last:border-b-0 transition-colors ${
                            isCompleted ? 'bg-[#1A5CFF]/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className="mt-0.5 flex-shrink-0 text-[#1A5CFF] hover:scale-110 transition-transform"
                            >
                              {isCompleted ? (
                                <CheckCircle2 size={22} />
                              ) : (
                                <Circle size={22} className="text-[#8A8A8A]" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h4 className={`font-medium text-sm ${isCompleted ? 'line-through text-[#8A8A8A]' : 'text-[#F1F1F1]'}`}>
                                  {task.title}
                                </h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${diff.color}`}>
                                  {diff.text}
                                </span>
                              </div>
                              <p className={`mt-1 text-sm leading-relaxed ${isCompleted ? 'text-[#8A8A8A]/60' : 'text-[#8A8A8A]'}`}>
                                {task.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
