import { useTheme } from 'next-themes'
import { Moon, MoonStar, Sun } from 'lucide-react'

// Порядок циклического переключения: чёрная → тёмная → светлая
const THEME_ORDER = ['black', 'dark', 'light'] as const
type ThemeName = (typeof THEME_ORDER)[number]

const THEME_META: Record<ThemeName, { label: string; Icon: typeof Moon }> = {
  black: { label: 'Чёрная тема', Icon: Moon },
  dark: { label: 'Тёмная тема', Icon: MoonStar },
  light: { label: 'Светлая тема', Icon: Sun },
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  // Приложение — чистый SPA без SSR: next-themes читает сохранённую тему
  // из localStorage синхронно, поэтому классический mounted-хак не нужен
  const { theme, setTheme } = useTheme()

  const current: ThemeName = THEME_ORDER.includes(theme as ThemeName) ? (theme as ThemeName) : 'black'
  const next = THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length]
  const { label, Icon } = THEME_META[current]

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      title={`${label} — переключить`}
      aria-label={`${label} — переключить`}
      className={`text-fg-muted hover:text-fg transition-colors ${className}`}
    >
      <Icon size={18} />
    </button>
  )
}
