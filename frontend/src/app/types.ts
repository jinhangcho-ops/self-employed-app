/** 앱 전체 데이터 모양. ERD가 나오면 Supabase 테이블과 1:1로 맞춘다. */

export type Unit = 'g' | 'ml' | '개' | '장' | '모' | '봉' | '팩' | '단'
export type BizKey = 'hansik' | 'cafe' | 'bunsik'
export type Provider = 'kakao' | 'google' | 'email'

export interface Ingredient {
  id: string
  name: string
  unit: Unit
  /** 산 가격(원) */
  buyPrice: number
  /** 산 양(unit 기준) */
  buyQty: number
  img?: string
}

export interface RecipeItem {
  ing: string
  qty: number
}

export interface Menu {
  id: string
  name: string
  price: number
  items: RecipeItem[]
  img?: string
}

export interface Channel {
  id: string
  name: string
  /** 수수료 % */
  fee: number
  /** 개당 추가 비용(원) */
  fixed: number
}

/** sales[날짜][메뉴 id][채널 id] = 판매 개수 */
export type DaySales = Record<string, Record<string, number>>
export type Sales = Record<string, DaySales>

export interface Settings {
  store: string
  open: string
  close: string
  notify: boolean
  lastNotified: string
  /** FastAPI 서버 주소 (영수증 OCR) */
  ocrApi: string
}

export interface ReceiptRecord {
  id: string
  date: string
  store: string
  total: number
  count: number
  fields: number
  edited: number
  source: ReceiptSource
  savedAt: string
}
export type ReceiptSource = 'server' | 'device' | 'text'

export interface User {
  provider: Provider
  email: string
  name: string
  since?: string
}

export interface AppState {
  v: 1
  /** 예시 데이터로 보는 중인지 */
  sample: boolean
  tpl: BizKey
  settings: Settings
  receipts: ReceiptRecord[]
  channels: Channel[]
  ings: Ingredient[]
  menus: Menu[]
  sales: Sales
  user?: User | null
  onboarded?: boolean
  ocrGuideSeen?: boolean
}

export type View = 'cal' | 'menus' | 'ings' | 'settings' | 'auth' | 'onboard'
export type Metric = 'profit' | 'rev'
