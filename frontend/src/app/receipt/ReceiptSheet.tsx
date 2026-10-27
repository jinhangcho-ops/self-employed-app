import { useState, type ReactNode } from 'react'
import { track } from '@/shared/analytics'
import { ENV } from '@/shared/config'
import { toast } from '@/shared/toast'
import { useApp } from '../context'
import { UNITS } from '../data/templates'
import { fmtUnit, todayKey, uid, won } from '../lib/format'
import { unitPrice } from '../lib/margin'
import {
  SAMPLE_RECEIPT,
  matchIng,
  parseReceipt,
  rcPlan,
  shrink,
  toRcItems,
  type ParsedReceipt,
  type RcItem,
  type RcPlan,
} from '../lib/receipt'
import { store, useAppState } from '../store'
import type { ReceiptSource, Unit } from '../types'
import Icon from '../ui/Icon'
import Sheet from '../ui/Sheet'

type Step = 'pick' | 'text' | 'loading' | 'confirm' | 'review'

interface Rc {
  step: Step
  err?: string
  text?: string
  msg?: string
  img?: string
  imagePath?: string
  source?: ReceiptSource
  raw?: string
  date?: string
  store?: string
  total?: number
  items?: RcItem[]
  plan?: RcPlan
}

const TITLE: Record<Step, string> = {
  pick: '영수증 인식',
  text: '영수증 인식',
  loading: '영수증 인식',
  confirm: '인식 결과 수정',
  review: '저장 전 확인',
}

/** 영수증 인식: 고르기 → (읽는 중) → 결과 수정 → 저장 전 확인 → 저장 */
export default function ReceiptSheet() {
  const S = useAppState()
  const { open, close } = useApp()
  const [rc, setRc] = useState<Rc>({ step: 'pick' })
  const apiBase = (S.settings.ocrApi || ENV.apiBase).trim().replace(/\/+$/, '')

  const fromParsed = (p: ParsedReceipt, source: ReceiptSource, raw: string, extra: Partial<Rc> = {}) => {
    const t = todayKey()
    setRc({
      ...extra,
      step: 'confirm',
      source,
      raw,
      date: p.date && p.date <= t ? p.date : t,
      store: p.store || '',
      total: +p.total || 0,
      items: toRcItems(p, S.ings),
    })
  }

  const run = async (file: File) => {
    setRc({ step: 'loading', msg: '사진을 준비하는 중이에요' })
    try {
      const { blob, url } = await shrink(file)
      if (apiBase) {
        setRc({ step: 'loading', img: url, msg: '서버에서 영수증을 읽는 중이에요' })
        const fd = new FormData()
        fd.append('file', blob, 'receipt.jpg')
        const r = await fetch(apiBase + '/api/receipts/ocr', { method: 'POST', body: fd })
        if (!r.ok) throw new Error(`서버가 ${r.status} 오류를 보냈어요. 설정의 OCR 서버 주소를 확인하세요.`)
        const j = await r.json()
        fromParsed(j, 'server', j.text, { img: url, imagePath: j.image_path || '' })
      } else {
        setRc({ step: 'loading', img: url, msg: '휴대폰에서 글자를 읽는 중이에요 (처음엔 30초쯤 걸려요)' })
        const { recognize } = await import('tesseract.js')
        const { data } = await recognize(blob, 'kor+eng', {
          logger: (m) => {
            if (m.status === 'recognizing text')
              setRc((x) => ({ ...x, msg: `글자 읽는 중 ${Math.round(m.progress * 100)}%` }))
          },
        })
        fromParsed(parseReceipt(data.text), 'device', data.text, { img: url })
      }
    } catch (err) {
      const m = (err as Error)?.message
      setRc({
        step: 'pick',
        err:
          (m && !/fetch|network/i.test(m) ? m : '인식 서버나 엔진에 연결하지 못했어요.') +
          ' 글자로 붙여넣거나 예시 영수증으로 확인 화면을 써 볼 수 있어요.',
      })
    }
  }

  const items = rc.items || []
  const setItem = (i: number, p: Partial<RcItem>) =>
    setRc((x) => ({ ...x, items: (x.items || []).map((it, j) => (j === i ? { ...it, ...p } : it)) }))

  const review = () => {
    const plan = rcPlan(items, S.ings, S.menus)
    if (!(plan.upd.length + plan.add.length)) return toast('반영할 품목이 없어요. 양과 금액을 확인하세요.')
    setRc({ ...rc, step: 'review', plan })
  }

  const save = () => {
    const P = rc.plan
    if (!P || !(P.upd.length + P.add.length)) return toast('반영할 품목이 없어요.')
    const keys = ['name', 'qty', 'unit', 'amount'] as const
    let fields = 0,
      edited = 0
    items.forEach((it) => {
      if (!it.o.name) return
      keys.forEach((k) => {
        fields++
        if (String(it[k]) !== String(it.o[k])) edited++
      })
    })
    const applied = P.upd.length + P.add.length
    const rec = {
      id: uid(),
      date: rc.date || todayKey(),
      store: rc.store || '',
      total: rc.total || [...P.upd.map((u) => u.it), ...P.add].reduce((a, i) => a + +i.amount, 0),
      count: applied,
      fields,
      edited,
      source: rc.source || 'text',
      savedAt: new Date().toISOString(),
    }
    store.update((s) => {
      s.ings = P.ings
      s.receipts = [rec, ...s.receipts].slice(0, 100)
      s.sample = false
    })
    if (apiBase) {
      const mis = new Set(P.mism.map((x) => x.it))
      fetch(apiBase + '/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchased_at: rec.date,
          vendor: rec.store,
          total: rec.total,
          ocr_source: rec.source,
          image_path: rc.imagePath || null,
          raw_text: rc.raw || null,
          fields_total: fields,
          fields_edited: edited,
          items: items.map((i) => {
            const act = P.skip.includes(i) || mis.has(i) ? 'skip' : P.add.includes(i) ? 'new' : 'update'
            return {
              name: i.name,
              qty: +i.qty,
              unit: i.unit,
              amount: +i.amount,
              action: act,
              ingredient_ref: act === 'update' ? i.match : null,
              ocr: i.o,
            }
          }),
        }),
      })
        .then((r) => {
          if (!r.ok) throw new Error()
        })
        .catch(() => toast('기기에는 저장했지만 서버 저장에 실패했어요.'))
    }
    track('receipt_save', { items: applied, edited })
    close()
    toast(
      `저장했어요. 식자재 ${applied}개 반영` + (P.menus.length ? `, 메뉴 ${P.menus.length}개 원가가 바뀌었어요.` : '.'),
    )
  }

  const foot =
    rc.step === 'confirm' ? (
      <>
        <button className="btn" onClick={() => setRc({ step: 'pick' })}>
          다시 찍기
        </button>
        <button className="btn primary" onClick={review} style={{ flex: 1 }}>
          다음
        </button>
      </>
    ) : rc.step === 'review' ? (
      <>
        <button className="btn" onClick={() => setRc({ ...rc, step: 'confirm' })}>
          수정하기
        </button>
        <button className="btn primary" onClick={save} style={{ flex: 1 }}>
          네, 저장할게요
        </button>
      </>
    ) : undefined

  return (
    <Sheet title={TITLE[rc.step]} onClose={close} foot={foot} center>
      {rc.step === 'pick' && (
        <>
          <label className="drop">
            <Icon name="cam" />
            <span>영수증 사진 찍기 · 앨범에서 고르기</span>
            <small>
              {apiBase ? '서버(Google Vision)로 인식' : '휴대폰 안에서 인식 · 설정에서 OCR 서버를 넣으면 더 정확해요'}
            </small>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => e.target.files?.[0] && run(e.target.files[0])}
            />
          </label>
          <div className="opts">
            <button className="opt" onClick={() => setRc({ step: 'text', text: '' })}>
              <span className="opt-i">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <rect x="4" y="4" width="16" height="16" rx="3" />
                  <path d="M8 9h8M12 9v7" />
                </svg>
              </span>
              <span className="opt-t">
                <b>글자로 붙여넣기</b>
                <small>복사해 둔 영수증 내용을 붙여 넣어요</small>
              </span>
              <Chev />
            </button>
            <button
              className="opt"
              onClick={() => {
                fromParsed(parseReceipt(SAMPLE_RECEIPT), 'text', SAMPLE_RECEIPT)
                toast('예시 영수증이에요. 확인 화면을 써 보세요.')
              }}
            >
              <span className="opt-i">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                >
                  <path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z" />
                  <path d="M9 8h6M9 12h6M9 16h3" />
                </svg>
              </span>
              <span className="opt-t">
                <b>예시 영수증으로 해보기</b>
                <small>찍기 전에 어떻게 되는지 미리 봐요</small>
              </span>
              <Chev />
            </button>
          </div>
          <button className="how" onClick={() => open({ kind: 'guide', thenReceipt: true })}>
            처음이라면 사용법 보기
          </button>
          {rc.err && (
            <div className="banner">
              <div>
                <b className="warn-t">인식하지 못했어요.</b>
                <br />
                {rc.err}
              </div>
            </div>
          )}
        </>
      )}

      {rc.step === 'text' && (
        <>
          <label className="field">
            <span>영수증 글자</span>
            <textarea
              autoFocus
              autoComplete="off"
              name="rc-ta"
              className="ta"
              placeholder="예: 양파 3kg 6,900…"
              value={rc.text || ''}
              onChange={(e) => setRc({ ...rc, text: e.target.value })}
            />
          </label>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => setRc({ step: 'pick' })}>
              취소
            </button>
            <button
              className="btn primary"
              style={{ flex: 1 }}
              onClick={() =>
                rc.text?.trim()
                  ? fromParsed(parseReceipt(rc.text), 'text', rc.text)
                  : toast('영수증 글자를 붙여넣으세요.')
              }
            >
              품목 읽기
            </button>
          </div>
        </>
      )}

      {rc.step === 'loading' && (
        <>
          {rc.img && <img className="prev" src={rc.img} alt="영수증 미리보기" />}
          <div style={{ padding: '28px 0', textAlign: 'center' }}>
            <div className="spin" />
            <p className="label">{rc.msg || '영수증을 읽는 중이에요'}</p>
          </div>
        </>
      )}

      {rc.step === 'confirm' && <Confirm rc={rc} setRc={setRc} items={items} setItem={setItem} />}

      {rc.step === 'review' && rc.plan && <Review rc={rc} plan={rc.plan} />}
    </Sheet>
  )
}

const Chev = () => (
  <svg className="chev" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 6l6 6-6 6" />
  </svg>
)

function Confirm({
  rc,
  setRc,
  items,
  setItem,
}: {
  rc: Rc
  setRc: (r: Rc) => void
  items: RcItem[]
  setItem: (i: number, p: Partial<RcItem>) => void
}) {
  const S = useAppState()
  const sum = items.reduce((a, i) => a + (i.match === 'skip' ? 0 : +i.amount || 0), 0)
  const all = items.reduce((a, i) => a + (+i.amount || 0), 0)
  return (
    <>
      {rc.img && <img className="prev" src={rc.img} alt="영수증 미리보기" />}
      <div className="grid2">
        <label className="field">
          <span>구매일</span>
          <input
            autoComplete="off"
            name="rc-date"
            className="inp num"
            type="date"
            value={rc.date || ''}
            onChange={(e) => setRc({ ...rc, date: e.target.value })}
          />
        </label>
        <label className="field">
          <span>구매처</span>
          <input
            autoComplete="off"
            name="rc-store"
            className="inp"
            value={rc.store || ''}
            onChange={(e) => setRc({ ...rc, store: e.target.value })}
          />
        </label>
      </div>
      <p className="hint">읽어 온 내용을 확인하세요. 고친 칸은 회색으로 표시돼요.</p>
      {items.length ? (
        items.map((it, i) => {
          const g = it.match !== 'new' && it.match !== 'skip' ? S.ings.find((x) => x.id === it.match) : undefined
          const nu = it.qty > 0 ? it.amount / it.qty : 0
          const mis = g && g.unit !== it.unit
          const ed = (k: 'name' | 'qty' | 'unit' | 'amount') => (String(it[k]) !== String(it.o[k]) ? ' edited' : '')
          let info: ReactNode
          if (it.match === 'skip') info = '저장하지 않아요'
          else if (mis)
            info = (
              <span className="warn-t">
                단위가 달라요. {g.name}은(는) {g.unit} 기준이에요.
              </span>
            )
          else if (g) {
            const ou = unitPrice(g)
            const dp = ou ? Math.round(((nu - ou) / ou) * 100) : 0
            info = (
              <>
                1{it.unit}당 {fmtUnit(nu)}원 · 지금 {fmtUnit(ou)}원{' '}
                <b className={dp > 0 ? 'warn-t' : ''}>
                  {dp > 0 ? '+' : ''}
                  {dp}%
                </b>
              </>
            )
          } else info = `새 식자재로 추가 · 1${it.unit}당 ${fmtUnit(nu)}원`
          return (
            <div className="ocr" key={i}>
              <div className="r1">
                <input
                  autoComplete="off"
                  name={'rc-n-' + i}
                  className={'inp' + ed('name')}
                  value={it.name}
                  aria-label="품목"
                  onChange={(e) => setItem(i, { name: e.target.value })}
                  onBlur={(e) => {
                    if (it.match === 'new') {
                      const m = matchIng(e.target.value, S.ings)
                      if (m !== 'new') setItem(i, { match: m })
                    }
                  }}
                />
                <select
                  autoComplete="off"
                  name={'rc-m-' + i}
                  className="inp"
                  value={it.match}
                  aria-label="반영할 식자재"
                  onChange={(e) => setItem(i, { match: e.target.value })}
                >
                  <option value="new">새 식자재</option>
                  {S.ings.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}에 반영
                    </option>
                  ))}
                  <option value="skip">저장 안 함</option>
                </select>
                <button
                  className="x"
                  onClick={() => setRc({ ...rc, items: items.filter((_, j) => j !== i) })}
                  aria-label="품목 삭제"
                >
                  <Icon name="x" />
                </button>
              </div>
              <div className="r2">
                <input
                  autoComplete="off"
                  name={'rc-q-' + i}
                  className={'inp num' + ed('qty')}
                  type="number"
                  step="any"
                  min="0"
                  value={it.qty}
                  aria-label="양"
                  onChange={(e) => setItem(i, { qty: +e.target.value || 0 })}
                />
                <select
                  autoComplete="off"
                  name={'rc-u-' + i}
                  className={'inp' + ed('unit')}
                  value={it.unit}
                  aria-label="단위"
                  onChange={(e) => setItem(i, { unit: e.target.value as Unit })}
                >
                  {UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
                <input
                  autoComplete="off"
                  name={'rc-a-' + i}
                  className={'inp num' + ed('amount')}
                  type="number"
                  step="10"
                  min="0"
                  value={it.amount}
                  aria-label="금액(원)"
                  onChange={(e) => setItem(i, { amount: +e.target.value || 0 })}
                />
              </div>
              <div className="hint num" style={{ margin: 0 }}>
                {info}
              </div>
            </div>
          )
        })
      ) : (
        <div className="empty">읽어 온 품목이 없어요. 다시 찍거나 글자로 붙여넣어 보세요.</div>
      )}
      <button
        className="link"
        style={{ marginTop: 12 }}
        onClick={() =>
          setRc({
            ...rc,
            items: [
              ...items,
              { name: '', qty: 1, unit: '개', amount: 0, match: 'new', o: { name: '', qty: '', unit: '', amount: '' } },
            ],
          })
        }
      >
        품목 추가
      </button>
      <div className="summary num">
        <div className="line">
          <span>품목 합계</span>
          <b>{won(all)}</b>
        </div>
        {!!rc.total && (
          <div className="line">
            <span>영수증 합계</span>
            <b className={rc.total !== all ? 'warn-t' : ''}>
              {won(rc.total)}
              {rc.total === all ? ' · 일치' : ' · 차이 ' + won(rc.total - all)}
            </b>
          </div>
        )}
        <div className="line">
          <span>단가에 반영할 금액</span>
          <b>{won(sum)}</b>
        </div>
      </div>
    </>
  )
}

function Review({ rc, plan: P }: { rc: Rc; plan: RcPlan }) {
  const n = P.upd.length + P.add.length
  const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : 0)
  return (
    <>
      <div className="rv-h">이대로 저장할까요?</div>
      <p className="label" style={{ margin: 0 }}>
        {rc.date} · {rc.store || '구매처 없음'} · 식자재 {n}개 반영
      </p>
      {P.upd.length > 0 && (
        <div className="rv-sec">
          <span className="label">단가가 바뀌는 식자재</span>
          <ul className="list">
            {P.upd.map((u) => {
              const d = pct(u.nu, u.old)
              return (
                <li className="li" key={u.g.id}>
                  <div className="grow">
                    <div className="t">{u.g.name}</div>
                    <div className="s num">
                      {fmtUnit(u.old)}원<span className="arrow">→</span>
                      {fmtUnit(u.nu)}원 / 1{u.g.unit}
                    </div>
                  </div>
                  <div className="r">
                    <span className={'pill num' + (d > 0 ? ' warn' : '')}>
                      {d > 0 ? '+' : ''}
                      {d}%
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
      {P.add.length > 0 && (
        <div className="rv-sec">
          <span className="label">새로 추가하는 식자재</span>
          <ul className="list">
            {P.add.map((it, k) => (
              <li className="li" key={k}>
                <div className="grow">
                  <div className="t">{it.name}</div>
                  <div className="s num">
                    {(+it.qty).toLocaleString('ko-KR')}
                    {it.unit} {won(it.amount)}
                  </div>
                </div>
                <div className="r num s">
                  1{it.unit}당 {fmtUnit(it.amount / it.qty)}원
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="rv-sec">
        <span className="label">원가가 바뀌는 메뉴</span>
        {P.menus.length ? (
          <>
            <ul className="list">
              {P.menus.map((x) => {
                const rb = (x.b / x.m.price) * 100,
                  ra = (x.a / x.m.price) * 100
                return (
                  <li className="li" key={x.m.id}>
                    <div className="grow">
                      <div className="t">{x.m.name}</div>
                      <div className="s num">
                        원가 {won(x.b)}
                        <span className="arrow">→</span>
                        {won(x.a)}
                      </div>
                    </div>
                    <div className="r num">
                      <div className={'t ' + (ra >= 40 ? 'warn-t' : '')}>{ra.toFixed(1)}%</div>
                      <div className="s">원가율 (전 {rb.toFixed(1)}%)</div>
                    </div>
                  </li>
                )
              })}
            </ul>
            {P.menus.some((x) => x.a / x.m.price >= 0.4 && x.b / x.m.price < 0.4) && (
              <p className="hint warn-t">원가율이 40%를 넘는 메뉴가 생겨요.</p>
            )}
          </>
        ) : (
          <p className="hint">바뀌는 메뉴가 없어요.</p>
        )}
      </div>
      {(P.skip.length > 0 || P.mism.length > 0) && (
        <div className="rv-sec">
          <span className="label">저장하지 않는 품목</span>
          <ul className="list">
            {P.skip.map((it, k) => (
              <li className="li" key={'s' + k}>
                <div className="grow">
                  <div className="t">{it.name || '이름 없음'}</div>
                  <div className="s">{it.match === 'skip' ? '저장 안 함으로 선택' : '양이나 금액이 비어 있어요'}</div>
                </div>
              </li>
            ))}
            {P.mism.map(({ it, g }, k) => (
              <li className="li" key={'m' + k}>
                <div className="grow">
                  <div className="t">{it.name}</div>
                  <div className="s warn-t">
                    단위가 달라요 (영수증 {it.unit} · {g.name} {g.unit})
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="hint" style={{ marginTop: 16 }}>
        틀린 곳이 있으면 ‘수정하기’를 눌러 고친 뒤 다시 확인하세요.
      </p>
    </>
  )
}
