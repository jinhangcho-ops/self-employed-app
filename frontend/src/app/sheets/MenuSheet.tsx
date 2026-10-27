import { useState } from 'react'
import { toast } from '@/shared/toast'
import { useApp } from '../context'
import { uid, won } from '../lib/format'
import { WARN_RATE, chMargin, menuCost } from '../lib/margin'
import { store, useAppState } from '../store'
import type { Menu } from '../types'
import ArmButton from '../ui/ArmButton'
import Icon from '../ui/Icon'
import PhotoField from '../ui/PhotoField'
import Sheet from '../ui/Sheet'

interface Draft extends Omit<Menu, 'price' | 'items'> {
  price: number | string
  items: { ing: string; qty: number | string }[]
}

export default function MenuSheet({ id }: { id?: string }) {
  const S = useAppState()
  const { close } = useApp()
  const orig = S.menus.find((x) => x.id === id)
  const [d, setD] = useState<Draft>(() =>
    orig ? structuredClone(orig) : { id: uid(), name: '', price: '', items: [{ ing: S.ings[0]?.id || '', qty: '' }] },
  )
  const patch = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }))
  const setItem = (i: number, p: Partial<Draft['items'][number]>) =>
    setD((x) => ({ ...x, items: x.items.map((it, j) => (j === i ? { ...it, ...p } : it)) }))

  const asMenu = (): Menu => ({
    ...d,
    price: +d.price || 0,
    items: d.items.map((i) => ({ ing: i.ing, qty: +i.qty || 0 })),
  })
  const m = asMenu()
  const c = menuCost(m, S.ings)
  const rate = m.price ? (c / m.price) * 100 : 0
  const unitOf = (ing: string) => S.ings.find((g) => g.id === ing)?.unit || ''

  const save = () => {
    if (!d.name.trim() || !(m.price > 0)) return toast('메뉴 이름과 판매가를 입력하세요.')
    const menu = { ...m, items: m.items.filter((i) => i.ing && i.qty > 0) }
    store.update((s) => {
      const k = s.menus.findIndex((x) => x.id === menu.id)
      if (k < 0) s.menus.push(menu)
      else s.menus[k] = menu
      s.sample = false
    })
    close()
    const r = menuCost(menu, S.ings) / menu.price
    toast(r >= WARN_RATE ? `저장했어요. 원가율 ${Math.round(r * 100)}%로 높아요.` : '저장했어요.')
  }
  const del = () => {
    store.update((s) => {
      s.menus = s.menus.filter((x) => x.id !== d.id)
    })
    close()
    toast('메뉴를 삭제했어요.')
  }

  return (
    <Sheet
      title={orig ? '메뉴 수정' : '메뉴 추가'}
      onClose={close}
      foot={
        <>
          {orig && (
            <ArmButton className="btn danger" confirm="한 번 더 누르면 삭제" onConfirm={del}>
              삭제
            </ArmButton>
          )}
          <button className="btn primary" onClick={save} style={{ flex: 1 }}>
            저장
          </button>
        </>
      }
    >
      <PhotoField kind="menu" value={d} onChange={(img) => patch({ img })} />
      <label className="field">
        <span>메뉴 이름</span>
        <input
          autoComplete="off"
          name="m-name"
          className="inp"
          value={d.name}
          placeholder="예: 김치찌개…"
          onChange={(e) => patch({ name: e.target.value })}
        />
      </label>
      <label className="field">
        <span>판매가 (원)</span>
        <input
          autoComplete="off"
          name="m-price"
          className="inp num"
          type="number"
          min="0"
          step="100"
          value={d.price || ''}
          placeholder="예: 9000…"
          onChange={(e) => patch({ price: e.target.value })}
        />
      </label>
      <div className="field">
        <span>레시피 · 1인분에 들어가는 양</span>
        {d.items.map((it, i) => (
          <div className="recipe" key={i}>
            <select
              autoComplete="off"
              name={'r-ing-' + i}
              className="inp"
              value={it.ing}
              aria-label="식자재"
              onChange={(e) => setItem(i, { ing: e.target.value })}
            >
              {S.ings.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <input
              autoComplete="off"
              name={'r-qty-' + i}
              className="inp num"
              type="number"
              min="0"
              step="any"
              value={it.qty || ''}
              placeholder="양…"
              aria-label="양"
              onChange={(e) => setItem(i, { qty: e.target.value })}
            />
            <div className="row" style={{ flexWrap: 'nowrap', gap: 0 }}>
              <span className="u num">{unitOf(it.ing)}</span>
              <button
                className="x"
                onClick={() => patch({ items: d.items.filter((_, j) => j !== i) })}
                aria-label="재료 삭제"
              >
                <Icon name="x" />
              </button>
            </div>
          </div>
        ))}
        <button
          className="link"
          style={{ alignSelf: 'flex-start', marginTop: 8 }}
          onClick={() => patch({ items: [...d.items, { ing: S.ings[0].id, qty: '' }] })}
        >
          재료 추가
        </button>
      </div>
      <div className="summary num">
        <div className="line">
          <span>원가</span>
          <b>{won(c)}</b>
        </div>
        <div className="line">
          <span>원가율</span>
          <b style={rate >= 40 ? { color: 'var(--hwp-color-brand-text)' } : undefined}>
            {rate.toFixed(1)}%{rate >= 40 ? ' · 높음' : ''}
          </b>
        </div>
        {S.channels.map((ch) => (
          <div className="line" key={ch.id}>
            <span>{ch.name} 1개 팔면</span>
            <b>{won(chMargin(m, ch, S.ings))}</b>
          </div>
        ))}
      </div>
    </Sheet>
  )
}
