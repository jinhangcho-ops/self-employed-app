/** 원가·마진 계산 (순수 함수 — 화면 없이 테스트할 수 있게 상태를 인자로 받는다) */
import type { AppState, Channel, Ingredient, Menu } from '../types'

export const unitPrice = (g?: Pick<Ingredient, 'buyPrice' | 'buyQty'> | null) =>
  g && g.buyQty > 0 ? g.buyPrice / g.buyQty : 0

/** 메뉴 1개 원가 = 레시피 재료별 (단위당 가격 × 양) 합 */
export const menuCost = (m: Pick<Menu, 'items'>, ings: Ingredient[]) =>
  m.items.reduce((s, it) => s + unitPrice(ings.find((g) => g.id === it.ing)) * (+it.qty || 0), 0)

/** 채널에서 1개 팔 때 남는 돈 = 판매가 − 원가 − 수수료% − 개당 추가비용 */
export const chMargin = (m: Pick<Menu, 'items' | 'price'>, ch: Pick<Channel, 'fee' | 'fixed'>, ings: Ingredient[]) =>
  m.price - menuCost(m, ings) - (m.price * ch.fee) / 100 - (+ch.fixed || 0)

export const costRate = (m: Pick<Menu, 'items' | 'price'>, ings: Ingredient[]) =>
  m.price ? menuCost(m, ings) / m.price : 0

export const WARN_RATE = 0.4

export interface DayStats {
  rev: number
  cost: number
  fee: number
  profit: number
  cnt: number
  /** 메뉴별 판매 개수·이익 (이익 큰 순) */
  per: { m: Menu; n: number; p: number }[]
}

export function dayStats(S: Pick<AppState, 'sales' | 'menus' | 'channels' | 'ings'>, date: string): DayStats {
  const day = S.sales[date] || {}
  let rev = 0,
    cost = 0,
    fee = 0,
    cnt = 0
  const per: DayStats['per'] = []
  for (const mid in day) {
    const m = S.menus.find((x) => x.id === mid)
    if (!m) continue
    const c = menuCost(m, S.ings)
    let n2 = 0,
      p2 = 0
    for (const cid in day[mid]) {
      const n = +day[mid][cid] || 0
      if (!n) continue
      const ch = S.channels.find((x) => x.id === cid) || { fee: 0, fixed: 0 }
      rev += m.price * n
      cost += c * n
      const f = ((m.price * ch.fee) / 100 + (+ch.fixed || 0)) * n
      fee += f
      n2 += n
      p2 += (m.price - c) * n - f
    }
    cnt += n2
    if (n2) per.push({ m, n: n2, p: p2 })
  }
  per.sort((a, b) => b.p - a.p)
  return { rev, cost, fee, profit: rev - cost - fee, cnt, per }
}

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** 지금 영업 중인지와 남은 시간 문구 (자정 넘기는 영업도 처리) */
export function bizStatus(open = '11:00', close = '21:30', now = new Date()) {
  const hm = now.getHours() * 60 + now.getMinutes()
  const om = toMin(open),
    cm = toMin(close)
  const isOpen = cm > om ? hm >= om && hm < cm : hm >= om || hm < cm
  const fmtLeft = (v: number) =>
    v >= 60 ? `${Math.floor(v / 60)}시간${v % 60 ? ' ' + (v % 60) + '분' : ''}` : `${v}분`
  if (isOpen) return { cls: 'on', label: '영업 중', sub: `마감까지 ${fmtLeft((cm - hm + 1440) % 1440)}` } as const
  const toOpen = (om - hm + 1440) % 1440
  return hm < om && cm > om
    ? ({ cls: 'off', label: '영업 전', sub: `${fmtLeft(toOpen)} 뒤 문 열어요` } as const)
    : ({ cls: 'off', label: '영업 끝', sub: '오늘 판매를 정리해 보세요' } as const)
}
