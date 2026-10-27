export const pad = (n: number | string) => String(n).padStart(2, '0')

/** 'YYYY-MM-DD' (m은 0부터) */
export const ds = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

export const todayKey = (t = new Date()) => ds(t.getFullYear(), t.getMonth(), t.getDate())

export const won = (n: number) => Math.round(n).toLocaleString('ko-KR') + '원'

/** 달력 칸용 짧은 금액: +1.2만, -3,400 */
export const short = (n: number) => {
  const a = Math.abs(n)
  const s = n < 0 ? '-' : '+'
  if (a >= 10000) return s + (a / 10000).toFixed(a >= 100000 ? 0 : 1).replace(/\.0$/, '') + '만'
  return s + Math.round(a).toLocaleString('ko-KR')
}

/** 단위당 가격 표시: 10원 미만은 소수 둘째 자리까지 */
export const fmtUnit = (v: number) => (v < 10 ? v.toFixed(2).replace(/0$/, '') : Math.round(v).toLocaleString('ko-KR'))

export const uid = () => Math.random().toString(36).slice(2, 9)

export const dayLabel = (d: Date) =>
  new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(d)

export const parseKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}
