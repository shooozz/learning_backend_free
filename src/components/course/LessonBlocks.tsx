import { AlertTriangle, Info, Lightbulb } from 'lucide-react'
import type { ContentBlock } from '@/types/course'
import CodeBlock from './CodeBlock'
import RichText from './RichText'

const NOTE_STYLES = {
  info: {
    icon: Info,
    border: 'border-brand/30',
    bg: 'bg-brand/5',
    text: 'text-brand',
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
              <h2 key={index} className="font-display pt-4 text-2xl font-medium text-fg">
                {block.text}
              </h2>
            )
          case 'text':
            return (
              <p key={index} className="text-[15px] leading-relaxed text-fg-dim">
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
                className="flex items-start gap-3 text-[15px] leading-relaxed text-fg-dim"
              >
                {block.ordered ? (
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-semibold text-brand">
                    {i + 1}
                  </span>
                ) : (
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" />
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
                <p className="mt-2 text-sm leading-relaxed text-fg-soft">
                  <RichText text={block.text} />
                </p>
              </div>
            )
          }
          case 'table':
            return (
              <div key={index} className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-surface">
                      {block.headers.map((header) => (
                        <th key={header} className="px-4 py-3 font-medium text-fg">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r} className="border-b border-line last:border-b-0">
                        {row.map((cell, c) => (
                          <td key={c} className="px-4 py-3 align-top text-fg-dim">
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
