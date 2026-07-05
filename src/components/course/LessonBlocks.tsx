import { AlertTriangle, Info, Lightbulb } from 'lucide-react'
import type { ContentBlock } from '@/types/course'
import CodeBlock from './CodeBlock'
import RichText from './RichText'

const NOTE_STYLES = {
  info: {
    icon: Info,
    border: 'border-[#1A5CFF]/30',
    bg: 'bg-[#1A5CFF]/5',
    text: 'text-[#9DB8FF]',
    label: 'Заметка',
  },
  tip: {
    icon: Lightbulb,
    border: 'border-green-400/30',
    bg: 'bg-green-400/5',
    text: 'text-green-400',
    label: 'Совет',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-yellow-400/30',
    bg: 'bg-yellow-400/5',
    text: 'text-yellow-400',
    label: 'Внимание',
  },
} as const

export default function LessonBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2 key={index} className="font-display pt-4 text-2xl font-medium text-[#F1F1F1]">
                {block.text}
              </h2>
            )
          case 'text':
            return (
              <p key={index} className="text-[15px] leading-relaxed text-[#B8B8B8]">
                <RichText text={block.text} />
              </p>
            )
          case 'code':
            return (
              <CodeBlock
                key={index}
                code={block.code}
                language={block.language}
                filename={block.filename}
              />
            )
          case 'list': {
            const items = block.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[15px] leading-relaxed text-[#B8B8B8]"
              >
                {block.ordered ? (
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#1A5CFF]/10 text-[11px] font-semibold text-[#1A5CFF]">
                    {i + 1}
                  </span>
                ) : (
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#1A5CFF]" />
                )}
                <span>
                  <RichText text={item} />
                </span>
              </li>
            ))
            return block.ordered ? (
              <ol key={index} className="space-y-2.5">
                {items}
              </ol>
            ) : (
              <ul key={index} className="space-y-2.5">
                {items}
              </ul>
            )
          }
          case 'note': {
            const style = NOTE_STYLES[block.variant]
            const Icon = style.icon
            return (
              <div key={index} className={`rounded-lg border ${style.border} ${style.bg} p-4`}>
                <div
                  className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${style.text}`}
                >
                  <Icon size={14} />
                  {style.label}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#D6D6D6]">
                  <RichText text={block.text} />
                </p>
              </div>
            )
          }
          case 'table':
            return (
              <div key={index} className="overflow-x-auto rounded-lg border border-[#1A1A1A]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A]">
                      {block.headers.map((header) => (
                        <th key={header} className="px-4 py-3 font-medium text-[#F1F1F1]">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r} className="border-b border-[#1A1A1A] last:border-b-0">
                        {row.map((cell, c) => (
                          <td key={c} className="px-4 py-3 align-top text-[#B8B8B8]">
                            <RichText text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      })}
    </div>
  )
}
