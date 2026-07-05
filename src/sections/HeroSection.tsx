import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// three.js весит ~0.5 МБ — грузим сцену отдельным чанком только на лендинге
const WebGLHero = lazy(() => import('../components/WebGLHero'))

const techTags = ['Python', 'Django', 'SQL', 'Docker', 'Redis', 'Celery', 'Kafka', 'Git']

export default function HeroSection() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const scrollToTimeline = () => {
    const el = document.getElementById('timeline')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden"
      style={{ background: '#050505' }}
    >
      <Suspense fallback={null}>
        <WebGLHero />
      </Suspense>

      {/* Text overlay */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto"
        style={{ marginTop: '-32px' }}
      >
        {/* Subtitle */}
        <div
          className={`transition-all duration-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '0.2s' }}
        >
          <span className="font-display text-sm tracking-[0.1em] uppercase text-[#1A5CFF] font-medium">
            Путь от новичка до Middle+
          </span>
        </div>

        {/* Main heading with line reveal */}
        <h1 className="font-display font-medium text-white mt-6 leading-none glow-pulse select-none">
          <span className="line-reveal">
            <span className="line-reveal-inner line-reveal-inner-delay-1 text-[42px] sm:text-[56px] lg:text-[80px] tracking-[-0.03em]">
              Структурированный
            </span>
          </span>
          <br />
          <span className="line-reveal">
            <span className="line-reveal-inner line-reveal-inner-delay-2 text-[42px] sm:text-[56px] lg:text-[80px] tracking-[-0.03em]">
              подход к изучению
            </span>
          </span>
          <br />
          <span className="line-reveal">
            <span className="line-reveal-inner line-reveal-inner-delay-3 text-[42px] sm:text-[56px] lg:text-[80px] tracking-[-0.03em]">
              backend-разработки
            </span>
          </span>
        </h1>

        {/* Description */}
        <p
          className={`mt-8 text-[#8A8A8A] text-base max-w-[500px] transition-all duration-600 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
          style={{ transitionDelay: '1.0s' }}
        >
          Наш roadmap построен на основе анализа вакансий, опыта менторов и лучших практик индустрии
        </p>

        {/* Bottom bar */}
        <div
          className={`mt-12 flex flex-col sm:flex-row items-center gap-4 transition-all duration-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
          style={{ transitionDelay: '1.2s' }}
        >
          <Link
            to="/courses"
            className="bg-[#1A5CFF] text-[#050505] font-medium px-8 py-3.5 rounded hover:bg-[#1145CC] transition-colors duration-300 text-sm"
          >
            Начать путь
          </Link>
          <button
            onClick={scrollToTimeline}
            className="border border-[#8A8A8A] text-[#F1F1F1] font-medium px-8 py-3.5 rounded hover:border-[#F1F1F1] transition-colors duration-300 text-sm"
          >
            Программа обучения
          </button>
        </div>

        {/* Tech tags */}
        <div
          className={`mt-8 flex gap-2 overflow-x-auto max-w-full pb-2 transition-all duration-500 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '1.4s' }}
        >
          {techTags.map((tag, i) => (
            <span
              key={tag}
              className="tag-item cursor-default"
              style={{
                animationDelay: `${1.4 + i * 0.05}s`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1)' : 'scale(0.8)',
                transition: `all 0.3s ease ${1.4 + i * 0.05}s`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
