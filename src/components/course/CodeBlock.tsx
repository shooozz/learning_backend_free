import { useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import Prism from '@/lib/prism'
import type { CodeLanguage } from '@/types/course'

const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  python: 'Python',
  sql: 'SQL',
  bash: 'Bash',
  yaml: 'YAML',
  docker: 'Dockerfile',
  json: 'JSON',
  javascript: 'JavaScript',
  http: 'HTTP',
  text: 'Текст',
}

function escapeHtml(code: string): string {
  return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

interface CodeBlockProps {
  code: string
  language: CodeLanguage
  filename?: string
}

export default function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const html = useMemo(() => {
    const grammar = language === 'text' ? undefined : Prism.languages[language]
    return grammar ? Prism.highlight(code, grammar, language) : escapeHtml(code)
  }, [code, language])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // клипборд может быть недоступен — молча пропускаем
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#1A1A1A] bg-[#0A0A0A]">
      <div className="flex items-center justify-between border-b border-[#1A1A1A] px-4 py-2">
        <span className="font-mono text-xs text-[#8A8A8A]">
          {filename ?? LANGUAGE_LABELS[language]}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-[#8A8A8A] transition-colors hover:text-[#F1F1F1]"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? 'Скопировано' : 'Копировать'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code
          className={`language-${language} font-mono`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  )
}
