import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Brain, Calendar, Target, Zap, BookOpen, Layers } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface Method {
  icon: React.ReactNode
  title: string
  description: string
  details: string[]
}

const methods: Method[] = [
  {
    icon: <Brain size={28} />,
    title: 'Active Recall',
    description: 'Активное вспоминание вместо пассивного чтения',
    details: [
      'После изучения темы закрываем материал и записываем всё, что помним',
      'Используем флеш-карточки для повторения ключевых концепций',
      'Объясняем концепции своими словами вслух или на бумаге',
      'Проходим тесты после каждого модуля без подглядывания',
    ],
  },
  {
    icon: <Calendar size={28} />,
    title: 'Spaced Repetition',
    description: 'Повторение через увеличивающиеся интервалы',
    details: [
      'День 1: изучаем новую тему',
      'День 2: первое повторение',
      'День 4: второе повторение',
      'День 7: третье повторение',
      'День 14: финальное закрепление',
    ],
  },
  {
    icon: <Target size={28} />,
    title: 'Deliberate Practice',
    description: 'Целенаправленная практика на грани возможностей',
    details: [
      'Разбиваем сложные задачи на подзадачи',
      'Фокусируемся на слабых местах',
      'Получаем немедленную обратную связь',
      'Постоянно увеличиваем сложность',
    ],
  },
  {
    icon: <Zap size={28} />,
    title: 'Проектный подход',
    description: 'Обучение через создание реальных проектов',
    details: [
      'Каждый этап завершается практическим проектом',
      'Проекты включают реальные кейсы из индустрии',
      'Code review от менторов после каждого проекта',
      'Портфолио из 6 проектов к концу обучения',
    ],
  },
  {
    icon: <BookOpen size={28} />,
    title: 'Feynman Technique',
    description: 'Обучение через объяснение простыми словами',
    details: [
      'Выбираем концепцию для изучения',
      'Объясняем её простым языком, как ребёнку',
      'Выявляем пробелы в понимании',
      'Возвращаемся к источнику для уточнения',
    ],
  },
  {
    icon: <Layers size={28} />,
    title: 'Pomodoro Technique',
    description: 'Управление временем и концентрацией',
    details: [
      '25 минут фокусированной работы',
      '5 минут перерыва',
      'После 4 циклов — длинный перерыв 15-30 минут',
      'Трекинг продуктивности по дням',
    ],
  },
]

export default function MethodsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
          delay: index * 0.1,
        })
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="methods"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32"
      style={{ background: '#050505' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#1A5CFF] text-xs tracking-[0.05em] uppercase font-semibold">
            Методы обучения
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-white mt-4 tracking-[-0.02em]">
            Научно обоснованный подход
          </h2>
          <p className="mt-4 text-[#8A8A8A] text-base max-w-2xl mx-auto">
            Мы используем методы, подтверждённые исследованиями когнитивной психологии, 
            для максимальной эффективности обучения
          </p>
        </div>

        {/* Methods grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method, index) => (
            <div
              key={method.title}
              ref={(el) => {
                if (el) cardsRef.current[index] = el
              }}
              className="group relative bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6 hover:border-[#1A5CFF]/40 transition-all duration-500"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-[#1A5CFF]/10 border border-[#1A5CFF]/20 flex items-center justify-center text-[#1A5CFF] mb-5 group-hover:bg-[#1A5CFF]/20 transition-colors duration-300">
                {method.icon}
              </div>

              {/* Title */}
              <h3 className="font-display text-xl font-medium text-[#F1F1F1] mb-2">
                {method.title}
              </h3>

              {/* Description */}
              <p className="text-[#8A8A8A] text-sm leading-relaxed mb-4">
                {method.description}
              </p>

              {/* Details list */}
              <ul className="space-y-2">
                {method.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2 text-sm text-[#F1F1F1]/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A5CFF] mt-1.5 flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(26, 92, 255, 0.05) 0%, transparent 70%)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
