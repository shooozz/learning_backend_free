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
const ProblemsPage = lazy(() => import('./pages/ProblemsPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))

export default function App() {
  return (
    // AuthProvider снаружи: ProgressProvider использует useAuth,
    // чтобы синхронизировать прогресс с сервером после входа
    <AuthProvider>
      <ProgressProvider>
        <ScrollToTop />
        <div className="relative min-h-screen bg-base">
          <Navbar />
          <main>
            <Suspense fallback={<div className="min-h-screen" />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:courseSlug" element={<CoursePage />} />
                {/* Важно: маршрут задач объявлен раньше динамического :lessonSlug,
                    иначе слово "problems" было бы поймано как slug урока */}
                <Route path="/courses/:courseSlug/problems" element={<ProblemsPage />} />
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
