import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource/jua'
import '@fontsource/gowun-dodum'
import './app.css'
import { initAnalytics } from '@/shared/analytics'
import App from './App'
import AppProvider from './AppProvider'

initAnalytics()
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)

// 시작 화면(로고): 처음 열 때만 1.4초 보여 주고 사라짐
const sp = document.getElementById('splash')
if (sp) {
  let seen = false
  try {
    seen = sessionStorage.getItem('domain.splash') === '1'
    sessionStorage.setItem('domain.splash', '1')
  } catch {
    /* 무시 */
  }
  const hide = () => {
    sp.classList.add('out')
    setTimeout(() => sp.remove(), 400)
  }
  if (seen) sp.remove()
  else {
    sp.addEventListener('click', hide)
    setTimeout(hide, 1400)
  }
}
