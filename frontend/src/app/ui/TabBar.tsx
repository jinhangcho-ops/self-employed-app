import { useEffect, useRef, type CSSProperties } from 'react'
import { useApp } from '../context'
import type { View } from '../types'
import { buzz } from '../lib/buzz'
import Icon, { type IconName } from './Icon'

const TABS: [View, string, IconName][] = [
  ['cal', '달력', 'cal'],
  ['menus', '마진', 'menu'],
  ['ings', '식자재', 'box'],
  ['settings', '설정', 'gear'],
]

/** 아래 떠 있는 탭 바. 선택 표시(blob)가 물방울처럼 미끄러진다. */
export default function TabBar() {
  const { ui, go } = useApp()
  const idx = TABS.findIndex((t) => t[0] === ui.view)
  const blob = useRef<HTMLSpanElement>(null)
  const prev = useRef(idx)

  useEffect(() => {
    if (idx < 0 || prev.current === idx) return
    prev.current = idx
    const b = blob.current
    if (!b) return
    b.classList.remove('stretch')
    void b.offsetWidth
    b.classList.add('stretch')
  }, [idx])

  if (ui.view === 'auth' || ui.view === 'onboard') return null
  return (
    <nav className="nav" aria-label="메뉴">
      <div className="nav-in" style={{ '--i': Math.max(idx, 0) } as CSSProperties}>
        <span className="blob" ref={blob} aria-hidden="true" />
        {TABS.map(([k, label, icon], i) => (
          <button
            key={k}
            className="tab"
            aria-current={i === idx ? 'page' : undefined}
            onPointerDown={() => buzz(8)}
            onClick={() => go(k)}
          >
            <span className="ti">
              <Icon name={icon} />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
