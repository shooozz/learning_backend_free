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
    <footer className="relative w-full py-16 border-t border-[#1A1A1A]" style={{ background: '#050505' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <span className="font-display text-xl font-bold tracking-[0.1em] text-[#F1F1F1]">
              ROADMAP HERO
            </span>
            <p className="mt-4 text-[#8A8A8A] text-sm leading-relaxed max-w-xs">
              Структурированный путь от новичка до Middle+ backend-разработчика 
              с научно обоснованными методами обучения
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-sm font-semibold text-[#F1F1F1] uppercase tracking-wider mb-4">
              Разделы
            </h4>
            <ul className="space-y-3">
              {footerLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-[#8A8A8A] text-sm hover:text-[#1A5CFF] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold text-[#F1F1F1] uppercase tracking-wider mb-4">
              Связаться
            </h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] flex items-center justify-center text-[#8A8A8A] hover:text-[#1A5CFF] hover:border-[#1A5CFF]/30 transition-all"
              >
                <Github size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] flex items-center justify-center text-[#8A8A8A] hover:text-[#1A5CFF] hover:border-[#1A5CFF]/30 transition-all"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] flex items-center justify-center text-[#8A8A8A] hover:text-[#1A5CFF] hover:border-[#1A5CFF]/30 transition-all"
              >
                <Mail size={18} />
              </a>
            </div>
            <p className="mt-4 text-[#8A8A8A] text-xs">
              © 2026 Roadmap Hero. Все права защищены.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
