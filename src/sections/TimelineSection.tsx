import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Stage {
  id: number
  title: string
  topics: string[]
  description: string
  image: string
  courseSlug: string
}

const stages: Stage[] = [
  {
    id: 1,
    title: 'Основы Python',
    description: 'Фундамент программирования на Python — от синтаксиса до объектно-ориентированного программирования',
    topics: ['Синтаксис и типы данных', 'Функции и модули', 'ООП и классы', 'Исключения', 'Работа с файлами', 'Итераторы и генераторы'],
    image: '/img-1.jpg',
    courseSlug: 'python-basics',
  },
  {
    id: 2,
    title: 'Базы данных',
    description: 'Проектирование БД, SQL-запросы, оптимизация и работа с ORM',
    topics: ['SQL и реляционные БД', 'PostgreSQL', 'Моделирование данных', 'Индексы и оптимизация', 'Миграции', 'ORM (Django ORM, SQLAlchemy)'],
    image: '/img-2.jpg',
    courseSlug: 'databases',
  },
  {
    id: 3,
    title: 'Веб-фреймворки',
    description: 'Создание веб-приложений с использованием современных Python-фреймворков',
    topics: ['HTTP и REST API', 'Django и DRF', 'FastAPI', 'Аутентификация и авторизация', 'Middleware', 'Тестирование API'],
    image: '/globe-sphere.svg',
    courseSlug: 'web-frameworks',
  },
  {
    id: 4,
    title: 'Инфраструктура',
    description: 'Деплой, контейнеризация, CI/CD и мониторинг приложений',
    topics: ['Docker и Docker Compose', 'CI/CD (GitHub Actions)', 'Nginx и Gunicorn', 'AWS / облака', 'Мониторинг (Prometheus, Grafana)', 'Логирование'],
    image: '/img-4.jpg',
    courseSlug: 'infrastructure',
  },
  {
    id: 5,
    title: 'Продвинутые темы',
    description: 'Масштабирование, очереди, кэширование и микросервисная архитектура',
    topics: ['Redis и кэширование', 'Celery и фоновые задачи', 'Kafka и очереди', 'WebSockets', 'Микросервисы', 'Оптимизация производительности'],
    image: '/img-5.jpg',
    courseSlug: 'advanced',
  },
  {
    id: 6,
    title: 'Карьера',
    description: 'Подготовка к собеседованиям, системный дизайн и развитие soft skills',
    topics: ['Резюме и портфолио', 'Технические собеседования', 'Системный дизайн', 'Soft skills', 'Код-ревью', 'Путь до Senior'],
    image: '/img-6.jpg',
    courseSlug: 'career',
  },
]

export default function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const progressRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // Animate each card with scroll perspective deck
      cardsRef.current.forEach((card, index) => {
        if (!card) return
        const side = index % 2 === 0 ? 'left' : 'right'

        gsap.from(card, {
          z: -400,
          rotateY: side === 'left' ? 45 : -45,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 40%',
            scrub: 1,
          },
        })
      })

      // Progress line
      if (progressRef.current && lineRef.current) {
        gsap.to(progressRef.current, {
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
          },
        })
      }
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="timeline"
      ref={sectionRef}
      className="relative w-full bg-base"
      style={{ paddingTop: '100px', paddingBottom: '200px' }}
    >
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <span className="text-brand text-xs tracking-[0.05em] uppercase font-semibold">
          Программа обучения
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-fg mt-4 tracking-[-0.02em]">
          6 этапов до backend-разработчика
        </h2>
        <p className="mt-4 text-fg-muted text-base max-w-lg mx-auto">
          Каждый этап включает теорию, практические задания и проектную работу
        </p>
      </div>

      {/* Timeline container */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Center line - desktop only */}
        <div
          ref={lineRef}
          className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-surface-2"
          style={{ transform: 'translateX(-50%)' }}
        >
          <div
            ref={progressRef}
            className="w-full bg-gradient-to-b from-brand to-brand-strong"
            style={{ height: '0%' }}
          />
        </div>

        {/* Progress indicator dot */}
        <div
          className="hidden lg:block fixed left-1/2 top-1/2 w-3 h-3 rounded-full bg-brand z-20 point-pulse"
          style={{
            // Свечение из токена темы: оттенок и интенсивность меняются вместе с темой
            boxShadow: '0 0 20px var(--glow)',
          }}
        />

        {/* Cards */}
        <div className="relative space-y-24 lg:space-y-32">
          {stages.map((stage, index) => {
            const isLeft = index % 2 === 0
            return (
              <div
                key={stage.id}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el
                }}
                className="timeline-card relative"
                style={{ perspective: '1200px' }}
              >
                <div
                  className={`timeline-card-inner flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                    isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Image */}
                  <div className="w-full lg:w-1/2">
                    <div className="card-image rounded-xl overflow-hidden" style={{ aspectRatio: '16/10' }}>
                      <img
                        src={stage.image}
                        alt={stage.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Text content */}
                  <div className={`w-full lg:w-1/2 ${isLeft ? 'lg:text-left' : 'lg:text-right'}`}>
                    <span className="text-brand text-xs tracking-[0.05em] uppercase font-semibold">
                      ЭТАП {stage.id}
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-medium text-fg mt-2">
                      {stage.title}
                    </h3>
                    <p className="mt-3 text-fg-muted text-[15px] leading-relaxed">
                      {stage.description}
                    </p>
                    <ul className={`mt-5 space-y-2 ${isLeft ? '' : 'lg:ml-auto'}`}>
                      {stage.topics.map((topic) => (
                        <li
                          key={topic}
                          className={`flex items-center gap-3 text-sm text-fg ${
                            isLeft ? '' : 'lg:flex-row-reverse'
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full bg-brand flex-shrink-0"
                          />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/courses/${stage.courseSlug}`}
                      className={`mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand transition-colors hover:text-brand-strong ${
                        isLeft ? '' : 'lg:flex-row-reverse'
                      }`}
                    >
                      Перейти к модулю
                      <ArrowRight size={15} className={isLeft ? '' : 'lg:rotate-180'} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-40 text-center">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-fg tracking-[-0.02em]">
          Готовы начать путь?
        </h2>
        <p className="mt-4 text-fg-muted text-base max-w-lg mx-auto">
          Все 6 модулей с уроками и практическими заданиями уже доступны — начните прямо сейчас
        </p>
        <Link
          to="/courses"
          className="mt-8 inline-block bg-brand text-brand-contrast font-medium px-10 py-4 rounded hover:bg-brand-strong transition-colors duration-300 text-base"
        >
          Начать обучение
        </Link>
      </div>
    </section>
  )
}
