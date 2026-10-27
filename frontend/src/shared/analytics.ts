import { ENV } from './config'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

/** GA4: 진짜 측정 ID(VITE_GA4_ID)가 있을 때만 스크립트를 불러온다 */
export function initAnalytics() {
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
  const id = ENV.ga4
  if (!id || /X{4,}/.test(id)) return
  const s = document.createElement('script')
  s.async = true
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id
  document.head.appendChild(s)
  window.gtag('js', new Date())
  window.gtag('config', id)
}

export const track = (name: string, params: Record<string, unknown> = {}) => {
  try {
    window.gtag?.('event', name, params)
  } catch {
    /* 분석 실패는 무시 */
  }
}
