import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import AuthProvider from './context/AuthProvider'
import ProgressProvider from './context/ProgressProvider'

// Route-level code splitting: лендинг (gsap, three.js) и страницы курса не тянут друг друга
const Landing = lazy(() => import('./pages/Landing'))
const CoursesPage = lazy(() => import('./pages/CoursesPage'))
const CoursePage = lazy(() => import('./pages/CoursePage'))
const LessonPage = lazy(() => import('./pages/LessonPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))

export default function App() {
  return (
    // AuthProvider снаружи: ProgressProvider использует useAuth,
    // чтобы синхронизировать прогресс с сервером после входа
    <AuthProvider>
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
                <Route path="/auth" element={<AuthPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </ProgressProvider>
    </AuthProvider>
  )
}
