import { describe, expect, it } from 'vitest'
import { seed } from '../data/templates'
import { SAMPLE_RECEIPT, parseReceipt, rcPlan, toRcItems } from './receipt'

describe('영수증 읽기', () => {
  const p = parseReceipt(SAMPLE_RECEIPT)
  it('날짜·가게·합계', () => {
    expect(p.date).toBe('2026-10-20')
    expect(p.store).toBe('행복식자재마트')
    expect(p.total).toBe(44400)
  })
  it('품목: kg → g 바꾸기', () => {
    expect(p.items).toHaveLength(5)
    expect(p.items[0]).toEqual({ name: '양파', qty: 3000, unit: 'g', amount: 6900 })
    expect(p.items[3]).toEqual({ name: '두부', qty: 2, unit: '모', amount: 3000 })
  })
  it('저장 계획: 기존 식자재 갱신 + 새 식자재 추가', () => {
    const S = seed('hansik', false)
    const P = rcPlan(toRcItems(p, S.ings), S.ings, S.menus)
    expect(P.upd.map((u) => u.g.name)).toEqual(['양파', '대파', '돼지고기 앞다리', '두부'])
    expect(P.add.map((a) => a.name)).toEqual(['깐마늘'])
    expect(P.menus.length).toBeGreaterThan(0)
  })
})
