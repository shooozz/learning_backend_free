import type { ReactNode } from 'react'

const INLINE_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`)/g

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE_PATTERN).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-[#F1F1F1]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={i}
          className="rounded border border-[#1F1F1F] bg-[#141414] px-1.5 py-0.5 font-mono text-[0.85em] text-[#9DB8FF]"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

/** Рендерит строку с инлайн-разметкой: **жирный** и `код` */
export default function RichText({ text }: { text: string }) {
  return <>{renderInline(text)}</>
}
