import { useApp } from '../context'
import { parseKey, won } from '../lib/format'
import { dayStats } from '../lib/margin'
import { store, useAppState } from '../store'
import Sheet from '../ui/Sheet'

/** 하루 판매 입력: 채널 고르고 메뉴마다 + / − */
export default function SalesSheet() {
  const S = useAppState()
  const { ui, setUi, close } = useApp()
  const d = parseKey(ui.sel)
  const day = S.sales[ui.sel] || {}
  const st = dayStats(S, ui.sel)

  const add = (id: string, n: number) =>
    store.update((s) => {
      const dd = (s.sales[ui.sel] ||= {})
      const mm = (dd[id] ||= {})
      mm[ui.ch] = Math.max(0, (mm[ui.ch] || 0) + n)
      s.sample = false
    })

  return (
    <Sheet
      title={`${d.getMonth() + 1}월 ${d.getDate()}일 판매 입력`}
      onClose={close}
      foot={
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="label">오늘 이익</div>
            <div
              className="num"
              style={{
                fontSize: 'var(--hwp-font-headline-5)',
                fontWeight: 700,
                color: st.profit < 0 ? 'var(--hwp-color-brand)' : 'var(--hwp-color-foreground)',
              }}
            >
              {won(st.profit)}
            </div>
          </div>
          <button className="btn primary" onClick={close}>
            입력 완료
          </button>
        </>
      }
    >
      <div
        className="row"
        style={{ position: 'sticky', top: 0, background: 'var(--hwp-color-bg-1)', paddingBlock: 8, zIndex: 1 }}
      >
        {S.channels.map((c) => (
          <button key={c.id} className="chip" onClick={() => setUi({ ch: c.id })} aria-pressed={ui.ch === c.id}>
            {c.name}
          </button>
        ))}
      </div>
      <ul className="list">
        {S.menus.map((mn) => {
          const n = day[mn.id]?.[ui.ch] || 0
          const tot = Object.values(day[mn.id] || {}).reduce((a, b) => a + (+b || 0), 0)
          return (
            <li key={mn.id} className="li">
              <div className="grow">
                <div className="t">{mn.name}</div>
                <div className="s num">
                  {won(mn.price)} · 전체 {tot}개
                </div>
              </div>
              <div className="step">
                <button onClick={() => add(mn.id, -1)} aria-label={`${mn.name} 빼기`}>
                  −
                </button>
                <output className="num">{n}</output>
                <button className="plus" onClick={() => add(mn.id, 1)} aria-label={`${mn.name} 더하기`}>
                  +
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
