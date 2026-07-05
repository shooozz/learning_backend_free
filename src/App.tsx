import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ProgressProvider from './context/ProgressProvider'

// Route-level code splitting: лендинг (gsap, three.js) и страницы курса не тянут друг друга
const Landing = lazy(() => import('./pages/Landing'))
const CoursesPage = lazy(() => import('./pages/CoursesPage'))
const CoursePage = lazy(() => import('./pages/CoursePage'))
const LessonPage = lazy(() => import('./pages/LessonPage'))

export default function App() {
  return (
    <ProgressProvider>
      <ScrollToTop />
      <div className="relative min-h-screen" style={{ background: '#050505' }}>
        <Navbar />
        <main>
          <Suspense fallback={<div className="min-h-screen" />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseSlug" element={<CoursePage />} />
              <Route path="/courses/:courseSlug/:lessonSlug" element={<LessonPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </ProgressProvider>
  )
}
