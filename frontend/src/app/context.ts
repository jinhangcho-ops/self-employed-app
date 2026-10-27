import { createContext, useContext } from 'react'
import type { Metric, User, View } from './types'

/** 화면 위에 뜨는 창 */
export type Layer =
  | { kind: 'sales' }
  | { kind: 'menu'; id?: string }
  | { kind: 'ing'; id?: string }
  | { kind: 'gate' }
  | { kind: 'doc'; doc: 'terms' | 'privacy' }
  | { kind: 'guide'; thenReceipt: boolean }
  | { kind: 'receipt' }

export interface UiState {
  view: View
  /** 달력에 보이는 연·월 (월은 0부터) */
  y: number
  m: number
  /** 선택한 날짜 YYYY-MM-DD */
  sel: string
  metric: Metric
  /** 판매 입력 시트에서 고른 채널 */
  ch: string
  /** 화면 바뀔 때 살짝 나타나는 효과 */
  enter: boolean
}

export interface AuthUi {
  mode: 'main' | 'email'
  tab: 'signup' | 'login'
  /** 로그인 끝나면 돌아갈 화면 */
  from: View
}

export interface AppCtx {
  ui: UiState
  setUi: (p: Partial<UiState>) => void
  go: (v: View) => void
  layer: Layer | null
  open: (l: Layer) => void
  close: () => void
  /** 가입 안 했으면 가입 유도창을 먼저 띄우고, 끝나면 l 을 연다 */
  gate: (l: Layer) => void
  skipGate: () => void
  /** 영수증: 처음이면 사용법부터 */
  openReceipt: () => void
  auth: AuthUi
  openAuth: (mode?: AuthUi['mode'], tab?: AuthUi['tab']) => void
  setAuth: (p: Partial<AuthUi>) => void
  authBack: () => void
  signedIn: (user: User, isNew: boolean) => void
}

export const Ctx = createContext<AppCtx | null>(null)

export function useApp() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useApp 은 AppProvider 안에서 써야 해요')
  return c
}
