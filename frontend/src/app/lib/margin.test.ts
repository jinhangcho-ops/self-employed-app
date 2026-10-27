import { describe, expect, it } from 'vitest'
import { seed } from '../data/templates'
import { bizStatus, chMargin, dayStats, menuCost, unitPrice } from './margin'

const S = seed('hansik', false)
const kjj = S.menus.find((m) => m.id === 'kjj')!

describe('원가·마진 계산', () => {
  it('단위당 가격', () => {
    expect(unitPrice({ buyPrice: 13000, buyQty: 1000 })).toBe(13)
    expect(unitPrice({ buyPrice: 1000, buyQty: 0 })).toBe(0)
  })

  it('김치찌개 원가 = 김치 600 + 돼지고기 1300 + 두부 750 + 대파 60 + 쌀 520', () => {
    expect(menuCost(kjj, S.ings)).toBeCloseTo(3230)
  })

  it('홀 / 배달의민족 마진', () => {
    expect(chMargin(kjj, S.channels[0], S.ings)).toBeCloseTo(5770)
    // 9000 - 3230 - 702(7.8%) - 300
    expect(chMargin(kjj, S.channels[1], S.ings)).toBeCloseTo(4768)
  })

  it('하루 합계', () => {
    const st = { ...S, sales: { '2026-10-20': { kjj: { hall: 2, baemin: 1 } } } }
    const d = dayStats(st, '2026-10-20')
    expect(d.cnt).toBe(3)
    expect(d.rev).toBe(27000)
    expect(d.profit).toBeCloseTo(5770 * 2 + 4768)
  })

  it('영업 상태', () => {
    const at = (h: number, m: number) => new Date(2026, 9, 20, h, m)
    expect(bizStatus('11:00', '21:30', at(12, 0)).label).toBe('영업 중')
    expect(bizStatus('11:00', '21:30', at(9, 0)).label).toBe('영업 전')
    expect(bizStatus('11:00', '21:30', at(22, 0)).label).toBe('영업 끝')
    expect(bizStatus('18:00', '02:00', at(1, 0)).label).toBe('영업 중')
  })
})
