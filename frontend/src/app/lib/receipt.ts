/** 영수증 글자 → 품목 목록, 그리고 저장 전 "무엇이 바뀌는지" 계산 */
import { UNITS } from '../data/templates'
import type { Ingredient, Menu, Unit } from '../types'
import { pad, uid } from './format'
import { unitPrice } from './margin'

export const SAMPLE_RECEIPT = `행복식자재마트
2026-10-20 07:42
양파 3kg 6,900
대파 1kg 3,200
돼지고기 앞다리 2kg 25,800
두부 2모 3,000
깐마늘 500g 5,500
합계 44,400
부가세 4,036
카드승인 44,400`

export interface ParsedItem {
  name: string
  qty: number
  unit: string
  amount: number
}
export interface ParsedReceipt {
  date: string
  store: string
  total: number
  items: ParsedItem[]
}

const SKIP =
  /합계|총액|총\s?금액|부가세|과세|면세|카드|승인|거스름|받은|현금|포인트|할인|사업자|대표|전화|tel|주소|영수증|단말기|일시|번호|매출/i

export function parseReceipt(text: string): ParsedReceipt {
  const lines = String(text)
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
  let date = '',
    store = '',
    total = 0
  const items: ParsedItem[] = []
  const dm = text.match(/(20\d{2})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})/)
  if (dm) date = `${dm[1]}-${pad(dm[2])}-${pad(dm[3])}`
  for (const l of lines) {
    const am = l.match(/(\d{1,3}(?:,\d{3})+|\d{3,})\s*원?\s*$/)
    if (/합계|총액|총\s?금액/.test(l) && am) {
      total = +am[1].replace(/,/g, '')
      continue
    }
    if (!store && !/\d{3,}/.test(l.replace(/,/g, '')) && l.length <= 24) {
      store = l
      continue
    }
    if (SKIP.test(l) || !am || am.index === undefined) continue
    const amount = +am[1].replace(/,/g, '')
    let rest = l.slice(0, am.index).trim(),
      mult = 1,
      qty = 1,
      unit = '개'
    const mx = rest.match(/[x×*]\s*(\d+)\s*$/i)
    if (mx && mx.index !== undefined) {
      mult = +mx[1]
      rest = rest.slice(0, mx.index).trim()
    }
    const qm = rest.match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|l|리터|개|ea|구|봉|팩|모|장|단)(?:\s+(\d{1,3}))?\s*$/i)
    if (qm && qm.index !== undefined) {
      qty = +qm[1]
      unit = qm[2].toLowerCase()
      if (qm[3]) mult *= +qm[3]
      rest = rest.slice(0, qm.index).trim()
    } else {
      const tl = rest.match(/(?:\d{1,3}(?:,\d{3})+|\d+)\s+(\d{1,3})$/)
      if (tl && tl.index !== undefined) {
        mult = +tl[1]
        rest = rest.slice(0, tl.index).trim()
      }
    }
    if (unit === 'kg') {
      qty *= 1000
      unit = 'g'
    }
    if (unit === 'l' || unit === '리터') {
      qty *= 1000
      unit = 'ml'
    }
    if (unit === 'ea' || unit === '구') unit = '개'
    qty = Math.round(qty * mult * 100) / 100
    const name = rest
      .replace(/^[\d\s.*#-]+/, '')
      .replace(/[^\p{L}\p{N}\s()·]/gu, '')
      .trim()
    if (name && amount > 0) items.push({ name, qty, unit, amount })
  }
  return { date, store, total, items }
}

const norm = (s: string) =>
  String(s)
    .replace(/\s|\(.*?\)/g, '')
    .toLowerCase()

/** 품목 이름과 비슷한 식자재 id, 없으면 'new' */
export function matchIng(name: string, ings: Ingredient[]): string {
  const n = norm(name)
  if (!n) return 'new'
  const g =
    ings.find((x) => norm(x.name) === n) || ings.find((x) => n.includes(norm(x.name)) || norm(x.name).includes(n))
  return g ? g.id : 'new'
}

/** 확인 화면의 한 줄. o = OCR이 처음 읽은 값(수정률 계산용) */
export interface RcItem {
  name: string
  qty: number
  unit: Unit
  amount: number
  /** 식자재 id | 'new' | 'skip' */
  match: string
  o: { name: string; qty: number | string; unit: string; amount: number | string }
}

export const toRcItems = (p: ParsedReceipt, ings: Ingredient[]): RcItem[] =>
  p.items.map((it) => {
    const x = {
      name: it.name,
      qty: +it.qty || 0,
      unit: (UNITS as string[]).includes(it.unit) ? (it.unit as Unit) : '개',
      amount: +it.amount || 0,
    }
    return { ...x, match: matchIng(x.name, ings), o: { ...x } }
  })

const costWith = (m: Menu, list: Ingredient[]) =>
  m.items.reduce((s, x) => s + unitPrice(list.find((y) => y.id === x.ing)) * (+x.qty || 0), 0)

export interface RcPlan {
  upd: { it: RcItem; g: Ingredient; old: number; nu: number }[]
  add: RcItem[]
  skip: RcItem[]
  mism: { it: RcItem; g: Ingredient }[]
  menus: { m: Menu; b: number; a: number }[]
  /** 저장하면 바뀔 식자재 목록 */
  ings: Ingredient[]
}

export function rcPlan(items: RcItem[], ingsNow: Ingredient[], menus: Menu[]): RcPlan {
  const ings = ingsNow.map((g) => ({ ...g }))
  const P: RcPlan = { upd: [], add: [], skip: [], mism: [], menus: [], ings }
  for (const it of items) {
    if (it.match === 'skip' || !it.name.trim() || !(+it.qty > 0) || !(+it.amount > 0)) {
      P.skip.push(it)
      continue
    }
    const g = it.match === 'new' ? null : ings.find((x) => x.id === it.match)
    if (!g) {
      P.add.push(it)
      continue
    }
    if (g.unit !== it.unit) {
      P.mism.push({ it, g })
      continue
    }
    const old = unitPrice(g)
    g.buyPrice = +it.amount
    g.buyQty = +it.qty
    P.upd.push({ it, g, old, nu: unitPrice(g) })
  }
  P.add.forEach((it) =>
    ings.push({ id: uid(), name: it.name.trim(), unit: it.unit, buyPrice: +it.amount, buyQty: +it.qty }),
  )
  menus.forEach((m) => {
    const b = costWith(m, ingsNow),
      a = costWith(m, ings)
    if (Math.round(a) !== Math.round(b)) P.menus.push({ m, b, a })
  })
  return P
}

/** 업로드 전에 사진 줄이기 (긴 변 1600px) */
export function shrink(file: File): Promise<{ blob: Blob; url: string }> {
  return new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onerror = rej
    fr.onload = () => {
      const im = new Image()
      im.onerror = rej
      im.onload = () => {
        const k = Math.min(1, 1600 / Math.max(im.width, im.height))
        const c = document.createElement('canvas')
        c.width = im.width * k
        c.height = im.height * k
        c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height)
        c.toBlob(
          (b) => (b ? res({ blob: b, url: c.toDataURL('image/jpeg', 0.7) }) : rej(new Error('사진을 읽지 못했어요.'))),
          'image/jpeg',
          0.85,
        )
      }
      im.src = fr.result as string
    }
    fr.readAsDataURL(file)
  })
}

/** 메뉴·식자재 썸네일용 정사각 240px */
export function readPhoto(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onerror = rej
    fr.onload = () => {
      const im = new Image()
      im.onerror = rej
      im.onload = () => {
        const S2 = 240
        const c = document.createElement('canvas')
        c.width = c.height = S2
        const k = Math.max(S2 / im.width, S2 / im.height),
          w = im.width * k,
          h = im.height * k
        c.getContext('2d')!.drawImage(im, (S2 - w) / 2, (S2 - h) / 2, w, h)
        res(c.toDataURL('image/jpeg', 0.8))
      }
      im.src = fr.result as string
    }
    fr.readAsDataURL(file)
  })
}
