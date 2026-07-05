import { Briefcase, Code2, Container, Cpu, Database, Server } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const courseIcons: Record<string, LucideIcon> = {
  'python-basics': Code2,
  databases: Database,
  'web-frameworks': Server,
  infrastructure: Container,
  advanced: Cpu,
  career: Briefcase,
}

export const fallbackCourseIcon: LucideIcon = Code2
