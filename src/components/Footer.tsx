import { Link } from 'react-router-dom'
import { Github, Mail, MessageCircle } from 'lucide-react'

const footerLinks = [
  { label: 'Курсы', to: { pathname: '/courses' } },
  { label: 'Программа', to: { pathname: '/', hash: '#timeline' } },
  { label: 'Методы', to: { pathname: '/', hash: '#methods' } },
  { label: 'Задачи', to: { pathname: '/', hash: '#tasks' } },
]

export default function Footer() {
  return (
    <footer className="relative w-full py-16 border-t border-line bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <span className="font-display text-xl font-bold tracking-[0.1em] text-fg">
              ROADMAP HERO
            </span>
            <p className="mt-4 text-fg-muted text-sm leading-relaxed max-w-xs">
              Структурированный путь от новичка до Middle+ backend-разработчика 
              с научно обоснованными методами обучения
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-sm font-semibold text-fg uppercase tracking-wider mb-4">
              Разделы
            </h4>
            <ul className="space-y-3">
              {footerLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-fg-muted text-sm hover:text-brand transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold text-fg uppercase tracking-wider mb-4">
              Связаться
            </h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-surface border border-line flex items-center justify-center text-fg-muted hover:text-brand hover:border-brand/30 transition-all"
              >
                <Github size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-surface border border-line flex items-center justify-center text-fg-muted hover:text-brand hover:border-brand/30 transition-all"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-surface border border-line flex items-center justify-center text-fg-muted hover:text-brand hover:border-brand/30 transition-all"
              >
                <Mail size={18} />
              </a>
            </div>
            <p className="mt-4 text-fg-muted text-xs">
              © 2026 Roadmap Hero. Все права защищены.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
