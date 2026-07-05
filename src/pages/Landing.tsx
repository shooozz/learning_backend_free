import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import HeroSection from '@/sections/HeroSection'
import TimelineSection from '@/sections/TimelineSection'
import MethodsSection from '@/sections/MethodsSection'
import TasksSection from '@/sections/TasksSection'
import { usePageTitle } from '@/hooks/use-page-title'

export default function Landing() {
  usePageTitle('Roadmap Hero — путь backend-разработчика')
  const { hash } = useLocation()

  // Поддержка якорных переходов вида /#timeline из навбара и футера
  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
    return () => window.clearTimeout(timer)
  }, [hash])

  return (
    <>
      <HeroSection />
      <TimelineSection />
      <MethodsSection />
      <TasksSection />
    </>
  )
}
