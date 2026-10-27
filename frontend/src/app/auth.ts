/**
 * 로그인·가입.
 * .env 에 VITE_SUPABASE_URL·VITE_SUPABASE_ANON_KEY 를 넣으면 실제 로그인,
 * 비어 있으면 체험 모드(이 기기 안에서만 흉내).
 * Supabase 대시보드 → Authentication → Providers 에서 Kakao·Google·Email 을 켜야 한다.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { ENV } from '@/shared/config'
import type { Provider, User } from './types'

export const AUTH_MOCK = !ENV.supabaseUrl
export const PROV: Record<Provider, string> = { kakao: '카카오', google: '구글', email: '이메일' }

export interface AuthResult {
  user?: User
  isNew?: boolean
  /** 이메일 인증 대기 */
  confirm?: boolean
}

let sb: SupabaseClient | null = null
export async function sbClient() {
  if (sb) return sb
  const { createClient } = await import('@supabase/supabase-js')
  sb = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey)
  return sb
}

const redirectTo = () => location.origin + location.pathname

async function sha(t: string) {
  try {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t))
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
  } catch {
    return 'x' + t.length
  }
}
type MockUsers = Record<string, { pw: string; marketing: boolean; at: number }>
const mockUsers = (): MockUsers => {
  try {
    return JSON.parse(localStorage.getItem('domain.mockUsers') || '{}')
  } catch {
    return {}
  }
}
const saveMockUsers = (u: MockUsers) => {
  try {
    localStorage.setItem('domain.mockUsers', JSON.stringify(u))
  } catch {
    /* 무시 */
  }
}
const emailUser = (email: string): User => ({ provider: 'email', email, name: email.split('@')[0] })

export const Auth = {
  /** 카카오·구글: 실제 모드면 해당 로그인 화면으로 이동하고 null 을 돌려준다 */
  async oauth(provider: 'kakao' | 'google', onboarded: boolean): Promise<AuthResult | null> {
    if (AUTH_MOCK) {
      return {
        user: {
          provider,
          email: provider === 'kakao' ? 'kakao_user@kakao.com' : 'owner@gmail.com',
          name: PROV[provider] + ' 사장님',
        },
        isNew: !onboarded,
      }
    }
    const c = await sbClient()
    const { error } = await c.auth.signInWithOAuth({ provider, options: { redirectTo: redirectTo() } })
    if (error) throw new Error(error.message)
    return null
  },

  async signUp(email: string, pw: string, marketing: boolean): Promise<AuthResult> {
    if (AUTH_MOCK) {
      const u = mockUsers()
      if (u[email]) throw new Error('이미 가입한 이메일이에요. 로그인해 주세요.')
      u[email] = { pw: await sha(pw), marketing, at: Date.now() }
      saveMockUsers(u)
      return { user: emailUser(email), isNew: true }
    }
    const c = await sbClient()
    const { data, error } = await c.auth.signUp({
      email,
      password: pw,
      options: { data: { marketing }, emailRedirectTo: redirectTo() },
    })
    if (error) throw new Error(error.message)
    return data.session ? { user: emailUser(email), isNew: true } : { confirm: true }
  },

  async signIn(email: string, pw: string): Promise<AuthResult> {
    if (AUTH_MOCK) {
      const u = mockUsers()[email]
      if (!u || u.pw !== (await sha(pw))) throw new Error('이메일 또는 비밀번호가 맞지 않아요.')
      return { user: emailUser(email), isNew: false }
    }
    const c = await sbClient()
    const { error } = await c.auth.signInWithPassword({ email, password: pw })
    if (error) throw new Error('이메일 또는 비밀번호가 맞지 않아요.')
    return { user: emailUser(email), isNew: false }
  },

  async reset(email: string) {
    if (AUTH_MOCK) return
    const c = await sbClient()
    const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: redirectTo() })
    if (error) throw new Error(error.message)
  },

  async signOut() {
    if (AUTH_MOCK) return
    const c = await sbClient()
    await c.auth.signOut()
  },
}

export const emailOk = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)
export const pwOk = (v: string) => v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v)

export const DOCS = {
  terms: `이용약관 (초안)\n\n1. domain은 외식업 사장님이 메뉴별 마진과 매출을 기록하고 확인하도록 돕는 서비스예요.\n2. 회원은 본인의 가게 정보만 입력해야 해요.\n3. 계산 결과는 참고용이며 세무·회계 신고 자료로 쓰면 안 돼요.\n4. 베타 기간에는 기능이 바뀌거나 중단될 수 있어요.\n\n※ 출시 전 법률 검토를 거쳐 확정본으로 바꿔야 해요.`,
  privacy: `개인정보 수집·이용 (초안)\n\n· 수집 항목: 이메일, 로그인 방식(카카오·구글·이메일), 가게 이름, 입력한 메뉴·식자재·판매 기록\n· 이용 목적: 회원 식별, 기록 저장·동기화, 정리 알림 발송, 문의 답변\n· 보관 기간: 회원 탈퇴 시 즉시 삭제 (법령상 보관 의무가 있으면 그 기간만큼)\n· 동의를 거부할 수 있지만, 거부하면 가입할 수 없어요.\n\n※ 출시 전 개인정보처리방침과 함께 확정해야 해요.`,
} as const
