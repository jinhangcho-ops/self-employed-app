import { useState } from 'react'
import { toast } from '@/shared/toast'
import { useApp } from '../context'
import { UNITS } from '../data/templates'
import { fmtUnit, uid } from '../lib/format'
import { menuCost, unitPrice } from '../lib/margin'
import { store, useAppState } from '../store'
import type { Ingredient, Unit } from '../types'
import ArmButton from '../ui/ArmButton'
import PhotoField from '../ui/PhotoField'
import Sheet from '../ui/Sheet'

interface Draft extends Omit<Ingredient, 'buyPrice' | 'buyQty'> {
  buyPrice: number | string
  buyQty: number | string
}

export default function IngSheet({ id }: { id?: string }) {
  const S = useAppState()
  const { close } = useApp()
  const orig = S.ings.find((x) => x.id === id)
  const [d, setD] = useState<Draft>(() =>
    orig ? { ...orig } : { id: uid(), name: '', unit: 'g', buyPrice: '', buyQty: '' },
  )
  const patch = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }))
  const g: Ingredient = { ...d, buyPrice: +d.buyPrice || 0, buyQty: +d.buyQty || 0 }
  const used = S.menus.filter((m) => m.items.some((i) => i.ing === d.id))

  const save = () => {
    if (!d.name.trim() || !(g.buyPrice > 0) || !(g.buyQty > 0)) return toast('이름, 산 가격, 산 양을 입력하세요.')
    const before = Object.fromEntries(S.menus.map((m) => [m.id, menuCost(m, S.ings)]))
    store.update((s) => {
      const k = s.ings.findIndex((x) => x.id === g.id)
      if (k < 0) s.ings.push(g)
      else s.ings[k] = g
      s.sample = false
    })
    close()
    const after = store.get()
    const hit = after.menus.filter((m) => Math.round(menuCost(m, after.ings)) !== Math.round(before[m.id]))
    if (orig && unitPrice(orig) !== unitPrice(g) && hit.length) {
      toast(
        '원가가 바뀐 메뉴: ' +
          hit
            .map((m) => {
              const diff = menuCost(m, after.ings) - before[m.id]
              return `${m.name} ${diff > 0 ? '+' : ''}${Math.round(diff)}원`
            })
            .join(', '),
      )
    } else toast('저장했어요.')
  }
  const del = () => {
    store.update((s) => {
      s.ings = s.ings.filter((x) => x.id !== d.id)
    })
    close()
    toast('식자재를 삭제했어요.')
  }

  return (
    <Sheet
      title={orig ? '식자재 수정' : '식자재 추가'}
      onClose={close}
      foot={
        <>
          {orig &&
            (used.length ? (
              <button className="btn danger" onClick={() => toast('메뉴 레시피에서 먼저 빼 주세요.')}>
                삭제
              </button>
            ) : (
              <ArmButton className="btn danger" confirm="한 번 더 누르면 삭제" onConfirm={del}>
                삭제
              </ArmButton>
            ))}
          <button className="btn primary" onClick={save} style={{ flex: 1 }}>
            저장
          </button>
        </>
      }
    >
      <PhotoField kind="ing" value={d} onChange={(img) => patch({ img })} />
      <label className="field">
        <span>이름</span>
        <input
          autoComplete="off"
          name="g-name"
          className="inp"
          value={d.name}
          placeholder="예: 돼지고기 앞다리…"
          onChange={(e) => patch({ name: e.target.value })}
        />
      </label>
      <div className="grid2">
        <label className="field">
          <span>산 가격 (원)</span>
          <input
            autoComplete="off"
            name="g-price"
            className="inp num"
            type="number"
            min="0"
            step="100"
            value={d.buyPrice || ''}
            placeholder="예: 13000…"
            onChange={(e) => patch({ buyPrice: e.target.value })}
          />
        </label>
        <label className="field">
          <span>산 양</span>
          <input
            autoComplete="off"
            name="g-qty"
            className="inp num"
            type="number"
            min="0"
            step="any"
            value={d.buyQty || ''}
            placeholder="예: 1000…"
            onChange={(e) => patch({ buyQty: e.target.value })}
          />
        </label>
      </div>
      <label className="field">
        <span>단위</span>
        <select
          autoComplete="off"
          name="g-unit"
          className="inp"
          value={d.unit}
          onChange={(e) => patch({ unit: e.target.value as Unit })}
        >
          {UNITS.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </label>
      <div className="summary num">
        <div className="line">
          <span>1{d.unit}당 가격</span>
          <b>{fmtUnit(unitPrice(g))}원</b>
        </div>
      </div>
      {used.length > 0 && (
        <div className="field">
          <span>이 재료를 쓰는 메뉴</span>
          <div className="margins">
            {used.map((m) => (
              <span key={m.id}>
                <b>{m.name}</b>
              </span>
            ))}
          </div>
        </div>
      )}
    </Sheet>
  )
}
