import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { track } from '@/shared/analytics'
import { toast } from '@/shared/toast'
import { AUTH_MOCK, PROV, sbClient } from './auth'
import { Ctx, type AppCtx, type AuthUi, type Layer, type UiState } from './context'
import { pad, todayKey } from './lib/format'
import { dayStats } from './lib/margin'
import { store } from './store'
import type { Provider, User, View } from './types'

const VIEWS: View[] = ['cal', 'menus', 'ings', 'settings']

function initialView(): View {
  const v = location.hash.slice(1)
  if ((VIEWS as string[]).includes(v)) return v as View
  if (v === 'login') return 'auth'
  return 'cal'
}

function readGateSkip() {
  try {
    return sessionStorage.getItem('domain.gateSkip') === '1'
  } catch {
    return false
  }
}

export default function AppProvider({ children }: { children: ReactNode }) {
  const [ui, setUiState] = useState<UiState>(() => {
    const t = new Date()
    return {
      view: initialView(),
      y: t.getFullYear(),
      m: t.getMonth(),
      sel: todayKey(),
      metric: 'profit',
      ch: 'hall',
      enter: false,
    }
  })
  const [layer, setLayer] = useState<Layer | null>(null)
  const [auth, setAuthState] = useState<AuthUi>({ mode: 'main', tab: 'signup', from: 'cal' })
  const pending = useRef<Layer | null>(null)
  const gateSkipped = useRef(readGateSkip())

  const setUi = useCallback((p: Partial<UiState>) => setUiState((u) => ({ ...u, ...p })), [])
  const go = useCallback((v: View) => {
    setUiState((u) => ({ ...u, view: v, enter: u.view !== v }))
    if (VIEWS.includes(v)) {
      track('tab_view', { tab: v })
      try {
        history.replaceState(null, '', '#' + v)
      } catch {
        /* 무시 */
      }
    }
    scrollTo(0, 0)
  }, [])

  const close = useCallback(() => setLayer(null), [])
  const runPending = useCallback(() => {
    const l = pending.current
    pending.current = null
    if (l) setTimeout(() => setLayer(l), 50)
  }, [])

  const gate = useCallback((l: Layer) => {
    if (store.get().user || gateSkipped.current) return setLayer(l)
    pending.current = l
    setLayer({ kind: 'gate' })
  }, [])

  const skipGate = useCallback(() => {
    gateSkipped.current = true
    try {
      sessionStorage.setItem('domain.gateSkip', '1')
    } catch {
      /* 무시 */
    }
    setLayer(null)
    runPending()
  }, [runPending])

  const openReceipt = useCallback(
    () => gate(store.get().ocrGuideSeen ? { kind: 'receipt' } : { kind: 'guide', thenReceipt: true }),
    [gate],
  )

  const setAuth = useCallback((p: Partial<AuthUi>) => setAuthState((a) => ({ ...a, ...p })), [])
  const openAuth = useCallback(
    (mode: AuthUi['mode'] = 'main', tab: AuthUi['tab'] = 'signup') => {
      setLayer(null)
      setAuthState((a) => ({ mode, tab, from: ui.view === 'auth' ? a.from : ui.view }))
      go('auth')
    },
    [go, ui.view],
  )

  const backTo = (from: View): View => (from === 'auth' || from === 'onboard' ? 'cal' : from)

  const authBack = useCallback(() => {
    if (auth.mode === 'email') return setAuth({ mode: 'main' })
    go(backTo(auth.from))
    if (!store.get().user) pending.current = null
  }, [auth, go, setAuth])

  const signedIn = useCallback(
    (user: User, isNew: boolean) => {
      store.update((s) => {
        s.user = { ...user, since: s.user?.since || new Date().toISOString() }
      })
      track('login', { method: user.provider })
      if (isNew && !store.get().onboarded) {
        go('onboard')
      } else {
        go(backTo(auth.from))
        toast(`${PROV[user.provider]} 계정으로 로그인했어요.`)
        runPending()
      }
    },
    [auth.from, go, runPending],
  )

  // 실제 로그인(Supabase): 카카오·구글에서 돌아오면 세션을 받아 로그인 처리
  const signedInRef = useRef(signedIn)
  useEffect(() => {
    signedInRef.current = signedIn
  }, [signedIn])
  useEffect(() => {
    if (AUTH_MOCK) return
    let off = () => {}
    sbClient()
      .then((c) => {
        const { data } = c.auth.onAuthStateChange((_ev, session) => {
          const u = session?.user
          const S = store.get()
          if (u && !S.user) {
            const pv = (u.app_metadata?.provider as Provider) || 'email'
            const name = u.user_metadata?.name || u.user_metadata?.full_name || (u.email || '').split('@')[0]
            signedInRef.current({ provider: pv, email: u.email || '', name }, !S.onboarded)
          }
        })
        off = () => data.subscription.unsubscribe()
      })
      .catch(() => {})
    return () => off()
  }, [])

  // 영업 종료 시각 정리 알림 (앱이 열려 있을 때 30초마다 확인)
  useEffect(() => {
    const check = async () => {
      const S = store.get()
      const s = S.settings
      if (!s.notify) return
      const n = new Date()
      const hm = pad(n.getHours()) + ':' + pad(n.getMinutes())
      const today = todayKey()
      if (hm < s.close || s.lastNotified === today) return
      const [h, mi] = s.close.split(':').map(Number)
      if (n.getHours() * 60 + n.getMinutes() - (h * 60 + mi) > 90) return
      store.update((d) => {
        d.settings.lastNotified = today
      })
      const body = dayStats(S, today).cnt
        ? '오늘 판매를 확인하고 마감하세요.'
        : '오늘 판매를 1분 만에 입력하고 이익을 확인하세요.'
      toast('영업 마감 시간이에요. ' + body)
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          const r = await navigator.serviceWorker?.getRegistration?.()
          if (r) r.showNotification('domain', { body, icon: '/icons/icon-192.png', tag: 'close' })
          else new Notification('domain', { body })
        }
      } catch {
        /* 무시 */
      }
    }
    check()
    const t = setInterval(check, 30000)
    return () => clearInterval(t)
  }, [])

  // Esc 로 창 닫기
  useEffect(() => {
    if (!layer) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (layer.kind === 'guide')
        store.update((s) => {
          s.ocrGuideSeen = true
        })
      setLayer(null)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [layer])

  const value = useMemo<AppCtx>(
    () => ({
      ui,
      setUi,
      go,
      layer,
      open: setLayer,
      close,
      gate,
      skipGate,
      openReceipt,
      auth,
      openAuth,
      setAuth,
      authBack,
      signedIn,
    }),
    [ui, setUi, go, layer, close, gate, skipGate, openReceipt, auth, openAuth, setAuth, authBack, signedIn],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
