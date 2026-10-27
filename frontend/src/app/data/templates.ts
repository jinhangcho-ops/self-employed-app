import type { AppState, BizKey, Channel, Unit } from '../types'
import { ds } from '../lib/format'

export const UNITS: Unit[] = ['g', 'ml', '개', '장', '모', '봉', '팩', '단']

export const CH_DEFAULT: Channel[] = [
  { id: 'hall', name: '홀', fee: 0, fixed: 0 },
  { id: 'baemin', name: '배달의민족', fee: 7.8, fixed: 300 },
  { id: 'coupang', name: '쿠팡이츠', fee: 7.8, fixed: 300 },
]

type IngRow = [id: string, name: string, unit: Unit, buyPrice: number, buyQty: number]
type MenuRow = [id: string, name: string, price: number, items: [ing: string, qty: number][]]
interface Template {
  label: string
  store: string
  ings: IngRow[]
  menus: MenuRow[]
}

/** 업종 템플릿 (예시 가격) */
export const TPL: Record<BizKey, Template> = {
  hansik: {
    label: '한식당',
    store: '예시 한식당',
    ings: [
      ['rice', '쌀', 'g', 52000, 20000],
      ['pork', '돼지고기 앞다리', 'g', 13000, 1000],
      ['kimchi', '김치', 'g', 30000, 10000],
      ['tofu', '두부', '모', 1500, 1],
      ['onion', '양파', 'g', 4500, 3000],
      ['scallion', '대파', 'g', 3000, 1000],
      ['chili', '고춧가루', 'g', 25000, 1000],
      ['egg', '계란', '개', 7500, 30],
      ['doenjang', '된장', 'g', 9000, 1000],
      ['zucchini', '애호박', '개', 1500, 1],
    ],
    menus: [
      [
        'kjj',
        '김치찌개',
        9000,
        [
          ['kimchi', 200],
          ['pork', 100],
          ['tofu', 0.5],
          ['scallion', 20],
          ['rice', 200],
        ],
      ],
      [
        'jeyuk',
        '제육볶음',
        11000,
        [
          ['pork', 200],
          ['onion', 100],
          ['chili', 15],
          ['scallion', 30],
          ['rice', 200],
        ],
      ],
      [
        'djj',
        '된장찌개',
        8000,
        [
          ['tofu', 1],
          ['doenjang', 40],
          ['zucchini', 0.5],
          ['onion', 50],
          ['scallion', 20],
          ['rice', 200],
        ],
      ],
      [
        'egg',
        '계란말이',
        7000,
        [
          ['egg', 4],
          ['scallion', 20],
          ['onion', 30],
        ],
      ],
    ],
  },
  cafe: {
    label: '카페',
    store: '예시 카페',
    ings: [
      ['bean', '원두', 'g', 28000, 1000],
      ['milk', '우유', 'ml', 2800, 1000],
      ['cup', '컵·뚜껑', '개', 120, 1],
      ['syrup', '바닐라 시럽', 'ml', 12000, 1000],
      ['ice', '얼음', 'g', 3000, 3000],
    ],
    menus: [
      [
        'ame',
        '아메리카노',
        4000,
        [
          ['bean', 20],
          ['cup', 1],
          ['ice', 150],
        ],
      ],
      [
        'latte',
        '카페라떼',
        4800,
        [
          ['bean', 20],
          ['milk', 200],
          ['cup', 1],
          ['ice', 150],
        ],
      ],
      [
        'vanilla',
        '바닐라라떼',
        5300,
        [
          ['bean', 20],
          ['milk', 200],
          ['syrup', 20],
          ['cup', 1],
          ['ice', 150],
        ],
      ],
    ],
  },
  bunsik: {
    label: '분식집',
    store: '예시 분식집',
    ings: [
      ['tteok', '떡', 'g', 5000, 1000],
      ['fishcake', '어묵', 'g', 8000, 1000],
      ['gochujang', '고추장', 'g', 10000, 1000],
      ['laver', '김', '장', 6000, 100],
      ['danmuji', '단무지', 'g', 4000, 1000],
      ['rice', '쌀', 'g', 52000, 20000],
      ['egg', '계란', '개', 7500, 30],
      ['scallion', '대파', 'g', 3000, 1000],
    ],
    menus: [
      [
        'tbk',
        '떡볶이',
        5000,
        [
          ['tteok', 300],
          ['fishcake', 100],
          ['gochujang', 50],
          ['scallion', 20],
        ],
      ],
      [
        'gimbap',
        '김밥',
        4000,
        [
          ['rice', 150],
          ['laver', 1],
          ['danmuji', 20],
          ['egg', 1],
        ],
      ],
      [
        'odeng',
        '어묵탕',
        3000,
        [
          ['fishcake', 150],
          ['scallion', 10],
        ],
      ],
    ],
  },
}

/** 같은 시드면 같은 숫자가 나오는 난수 (예시 판매 기록용) */
function mulberry(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 템플릿으로 새 상태 만들기. withSales면 지난 40일 예시 판매(일요일 휴무)도 채운다. */
export function seed(key: BizKey, withSales: boolean): AppState {
  const t = TPL[key]
  const st: AppState = {
    v: 1,
    sample: withSales,
    tpl: key,
    settings: { store: t.store, open: '11:00', close: '21:30', notify: false, lastNotified: '', ocrApi: '' },
    receipts: [],
    channels: structuredClone(CH_DEFAULT),
    ings: t.ings.map(([id, name, unit, buyPrice, buyQty]) => ({ id, name, unit, buyPrice, buyQty })),
    menus: t.menus.map(([id, name, price, items]) => ({
      id,
      name,
      price,
      items: items.map(([ing, qty]) => ({ ing, qty })),
    })),
    sales: {},
  }
  if (withSales) {
    const r = mulberry(20261020)
    const d0 = new Date()
    for (let back = 1; back <= 40; back++) {
      const d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() - back)
      if (d.getDay() === 0) continue
      const day: AppState['sales'][string] = {}
      st.menus.forEach((m, i) => {
        const base = [12, 9, 6, 5][i] || 5
        day[m.id] = {
          hall: Math.round(base * (0.6 + r() * 0.8)),
          baemin: Math.round(base * 0.4 * r()),
          coupang: Math.round(base * 0.25 * r()),
        }
      })
      st.sales[ds(d.getFullYear(), d.getMonth(), d.getDate())] = day
    }
  }
  return st
}
