import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useProgress } from '@/context/progress-store'

const sectionLinks = [
  { label: 'Программа', hash: '#timeline' },
  { label: 'Методы', hash: '#methods' },
  { label: 'Задачи', hash: '#tasks' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { overall } = useProgress()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const solid = scrolled || pathname !== '/' || menuOpen
  const onCourses = pathname.startsWith('/courses')
  const ctaLabel = overall.completed > 0 ? 'Продолжить обучение' : 'Начать обучение'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300 ${
        solid ? 'bg-[#050505]/80 backdrop-blur-md border-b border-[#1A1A1A]' : 'bg-transparent'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="font-display text-xl font-bold tracking-[0.1em] text-[#F1F1F1] hover:text-[#1A5CFF] transition-colors"
        >
          ROADMAP HERO
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {sectionLinks.map((link) => (
            <Link
              key={link.hash}
              to={{ pathname: '/', hash: link.hash }}
              className="nav-link text-sm font-normal"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/courses"
            className={`nav-link text-sm font-normal ${onCourses ? 'text-[#1A5CFF]' : ''}`}
          >
            Курсы
          </Link>
        </div>

        <Link
          to="/courses"
          className="hidden md:block text-sm border border-[#1A5CFF] text-[#1A5CFF] rounded px-5 py-2 hover:bg-[#1A5CFF] hover:text-[#050505] transition-all duration-300"
        >
          {ctaLabel}
        </Link>

        {/* Mobile burger */}
        <button className="md:hidden text-[#F1F1F1]" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#050505]/95 backdrop-blur-md border-b border-[#1A1A1A] md:hidden">
          <div className="flex flex-col p-6 gap-4">
            {sectionLinks.map((link) => (
              <Link
                key={link.hash}
                to={{ pathname: '/', hash: link.hash }}
                onClick={() => setMenuOpen(false)}
                className="text-left text-[#F1F1F1] text-sm py-2"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/courses"
              onClick={() => setMenuOpen(false)}
              className="text-left text-[#F1F1F1] text-sm py-2"
            >
              Курсы
            </Link>
            <Link
              to="/courses"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-center border border-[#1A5CFF] text-[#1A5CFF] rounded px-5 py-2 hover:bg-[#1A5CFF] hover:text-[#050505] transition-all duration-300 w-full"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
