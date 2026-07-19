import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    {/* Темы: класс темы вешается на <html>, токены — в index.css.
        По умолчанию «чёрная» (исходный вид платформы). */}
    <ThemeProvider attribute="class" themes={['black', 'dark', 'light']} defaultTheme="black" enableSystem={false}>
      <App />
    </ThemeProvider>
  </BrowserRouter>,
)
