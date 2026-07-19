import tailwindcssAnimate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Семантические токены тем (см. src/index.css). Именно их используют
        // компоненты платформы: bg-base, bg-surface, border-line, text-fg,
        // text-fg-muted, text-brand и т.д. RGB-триплеты в переменных
        // позволяют модификаторы прозрачности: bg-brand/10, bg-surface/60.
        //
        // ВАЖНО: токен фона страницы объявлен ниже в backgroundColor, а не здесь.
        // Цвет с именем `base` в colors сгенерировал бы утилиту `.text-base { color }`,
        // которая перебивает одноимённую ШРИФТОВУЮ утилиту text-base (1rem)
        // и красит текст в цвет фона — текст становится невидимым.
        surface: {
          DEFAULT: "rgb(var(--t-surface) / <alpha-value>)",
          2: "rgb(var(--t-surface-2) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--t-line) / <alpha-value>)",
          2: "rgb(var(--t-line-2) / <alpha-value>)",
        },
        fg: {
          DEFAULT: "rgb(var(--t-fg) / <alpha-value>)",
          soft: "rgb(var(--t-fg-soft) / <alpha-value>)",
          dim: "rgb(var(--t-fg-dim) / <alpha-value>)",
          muted: "rgb(var(--t-fg-muted) / <alpha-value>)",
          faint: "rgb(var(--t-fg-faint) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "rgb(var(--t-brand) / <alpha-value>)",
          strong: "rgb(var(--t-brand-strong) / <alpha-value>)",
          contrast: "rgb(var(--t-brand-contrast) / <alpha-value>)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      // Фон страницы: только bg-base (см. комментарий в colors выше)
      backgroundColor: {
        base: "rgb(var(--t-bg) / <alpha-value>)",
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}