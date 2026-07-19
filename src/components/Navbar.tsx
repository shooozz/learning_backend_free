import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, Menu, User, X } from 'lucide-react'
import { useAuth } from '@/context/auth-store'
import { useProgress } from '@/context/progress-store'
import ThemeToggle from './ThemeToggle'

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
  const { user, initializing, apiAvailable, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const solid = scrolled || pathname !== '/' || menuOpen
  const onCourses = pathname.startsWith('/courses')
  const ctaLabel = overall.completed > 0 ? 'Продолжить обучение' : 'Начать обучение'

  // Непрозрачный навбар красится токенами темы. Прозрачный бывает только
  // над тёмной WebGL-сценой лендинга, поэтому там текст всегда светлый —
  // независимо от выбранной темы (иначе в светлой теме он бы пропал).
  const overHero = !solid
  const linkTone = overHero ? 'text-[#8A8A8A] hover:text-[#F1F1F1]' : ''
  const logoTone = overHero ? 'text-[#F1F1F1]' : 'text-fg'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300 ${
        solid ? 'bg-base/80 backdrop-blur-md border-b border-line' : 'bg-transparent'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className={`font-display text-xl font-bold tracking-[0.1em] hover:text-brand transition-colors ${logoTone}`}
        >
          ROADMAP HERO
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {sectionLinks.map((link) => (
            <Link
              key={link.hash}
              to={{ pathname: '/', hash: link.hash }}
              className={`nav-link text-sm font-normal ${linkTone}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/courses"
            className={`nav-link text-sm font-normal ${linkTone} ${onCourses ? 'text-brand' : ''}`}
          >
            Курсы
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle className={overHero ? 'text-[#8A8A8A] hover:text-[#F1F1F1]' : ''} />
          {!initializing &&
            apiAvailable &&
            (user ? (
              <div className={`flex items-center gap-3 text-sm ${overHero ? 'text-[#8A8A8A]' : 'text-fg-muted'}`}>
                <span className="flex items-center gap-1.5 max-w-[180px] truncate" title={user.email}>
                  <User size={14} className="shrink-0 text-brand" />
                  {user.email}
                </span>
                <button
                  onClick={() => void logout()}
                  title="Выйти"
                  className={`transition-colors ${overHero ? 'hover:text-[#F1F1F1]' : 'hover:text-fg'}`}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className={`nav-link text-sm font-normal ${linkTone} ${pathname === '/auth' ? 'text-brand' : ''}`}
              >
                Войти
              </Link>
            ))}
          <Link
            to="/courses"
            className="text-sm border border-brand text-brand rounded px-5 py-2 hover:bg-brand hover:text-brand-contrast transition-all duration-300"
          >
            {ctaLabel}
          </Link>
        </div>

        {/* Mobile burger */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle className={overHero && !menuOpen ? 'text-[#8A8A8A] hover:text-[#F1F1F1]' : ''} />
          <button
            className={overHero && !menuOpen ? 'text-[#F1F1F1]' : 'text-fg'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-base/95 backdrop-blur-md border-b border-line md:hidden">
          <div className="flex flex-col p-6 gap-4">
            {sectionLinks.map((link) => (
              <Link
                key={link.hash}
                to={{ pathname: '/', hash: link.hash }}
                onClick={() => setMenuOpen(false)}
                className="text-left text-fg text-sm py-2"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/courses"
              onClick={() => setMenuOpen(false)}
              className="text-left text-fg text-sm py-2"
            >
              Курсы
            </Link>
            {!initializing &&
              apiAvailable &&
              (user ? (
                <button
                  onClick={() => {
                    void logout()
                    setMenuOpen(false)
                  }}
                  className="text-left text-fg-muted text-sm py-2"
                >
                  Выйти ({user.email})
                </button>
              ) : (
                <Link to="/auth" onClick={() => setMenuOpen(false)} className="text-left text-fg text-sm py-2">
                  Войти
                </Link>
              ))}
            <Link
              to="/courses"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-center border border-brand text-brand rounded px-5 py-2 hover:bg-brand hover:text-brand-contrast transition-all duration-300 w-full"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
