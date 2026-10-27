import { useState } from 'react'
import { track } from '@/shared/analytics'
import { toast } from '@/shared/toast'
import { useApp } from '../context'
import { seed } from '../data/templates'
import { store, useAppState } from '../store'
import type { BizKey } from '../types'
import Icon from '../ui/Icon'

type Biz = BizKey | 'etc' | ''
const BIZ: [Exclude<Biz, ''>, string][] = [
  ['hansik', '한식당'],
  ['cafe', '카페'],
  ['bunsik', '분식집'],
  ['etc', '그 외'],
]

/** 가입 직후 3단계: 업종 → 가게 이름 → 영업 시간 */
export default function Onboard() {
  const S = useAppState()
  const { go } = useApp()
  const [step, setStep] = useState(1)
  const [biz, setBiz] = useState<Biz>('')
  const [storeName, setStoreName] = useState(S.sample ? '' : S.settings.store)
  const [open, setOpen] = useState('11:00')
  const [close, setClose] = useState(S.settings.close || '21:30')
  const [notify, setNotify] = useState(true)

  const finish = (skipped: boolean) => {
    const cur = store.get()
    let next = structuredClone(cur)
    if (cur.sample && biz && biz !== 'etc') next = { ...seed(biz, false), user: cur.user }
    else if (cur.sample && biz === 'etc') next = { ...seed('hansik', false), menus: [], ings: [], user: cur.user }
    next.settings.ocrApi = cur.settings.ocrApi || ''
    if (storeName.trim()) next.settings.store = storeName.trim()
    next.settings.open = open
    next.settings.close = close
    if (!skipped && notify) {
      next.settings.notify = true
      try {
        if ('Notification' in window) Notification.requestPermission()
      } catch {
        /* 무시 */
      }
    }
    next.onboarded = true
    next.sample = false
    store.replace(next)
    track('onboard_done', { biz: biz || 'skip' })
    go(biz === 'etc' ? 'ings' : 'cal')
    toast(biz === 'etc' ? '식자재부터 등록해 볼까요? 오른쪽 위 + 를 누르세요.' : '준비 끝! 오늘 판매를 입력해 보세요.')
  }

  const nextStep = () => {
    if (step === 1 && !biz) return toast('업종을 골라 주세요.')
    if (step < 3) return setStep(step + 1)
    finish(false)
  }

  return (
    <>
      <header className="top">
        {step > 1 ? (
          <button className="iconbtn" onClick={() => setStep(step - 1)} aria-label="이전">
            <Icon name="l" />
          </button>
        ) : (
          <span style={{ width: 40 }} />
        )}
        <span className="label num">{step} / 3</span>
        <button className="link" onClick={() => finish(true)} style={{ paddingInline: 8 }}>
          건너뛰기
        </button>
      </header>
      <div className="ob">
        <div className="prog" aria-label={`${step}/3단계`}>
          {[1, 2, 3].map((i) => (
            <i key={i} className={i <= step ? 'on' : ''} />
          ))}
        </div>
        {step === 1 && (
          <>
            <h1>어떤 가게를 하시나요?</h1>
            <p className="sub">고르시면 비슷한 메뉴와 식자재를 미리 채워 드려요.</p>
            <div className="pick4">
              {BIZ.map(([k, l]) => (
                <button key={k} data-k={k} onClick={() => setBiz(k)} aria-pressed={biz === k}>
                  {l}
                </button>
              ))}
            </div>
            {!S.sample && (
              <p className="hint" style={{ marginTop: 12 }}>
                이미 입력한 메뉴와 식자재는 그대로 둘게요.
              </p>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <h1>가게 이름을 알려 주세요</h1>
            <p className="sub">달력 화면 위에 표시돼요.</p>
            <label className="field">
              <span>가게 이름</span>
              <input
                autoFocus
                autoComplete="off"
                name="ob-store"
                className="inp"
                id="ob-store"
                maxLength={20}
                value={storeName}
                placeholder="예: 월곡 김치찌개…"
                onChange={(e) => setStoreName(e.target.value)}
              />
            </label>
          </>
        )}
        {step === 3 && (
          <>
            <h1>영업 시간을 알려 주세요</h1>
            <p className="sub">닫는 시간에 오늘 판매 정리 알림을 보내 드려요.</p>
            <div className="grid2">
              <label className="field">
                <span>영업 시작 시각</span>
                <input
                  autoComplete="off"
                  name="ob-open"
                  className="inp num"
                  type="time"
                  value={open}
                  onChange={(e) => setOpen(e.target.value)}
                />
              </label>
              <label className="field">
                <span>영업 종료 시각</span>
                <input
                  autoComplete="off"
                  name="ob-close"
                  className="inp num"
                  type="time"
                  value={close}
                  onChange={(e) => setClose(e.target.value)}
                />
              </label>
            </div>
            <div className="row between" style={{ marginTop: 16 }}>
              <span style={{ color: 'var(--hwp-color-foreground)', fontWeight: 500 }}>정리 알림 받기</span>
              <button
                className="toggle"
                role="switch"
                aria-checked={notify}
                onClick={() => setNotify(!notify)}
                aria-label="정리 알림"
              />
            </div>
          </>
        )}
        <button className="btn primary block" style={{ marginTop: 28 }} onClick={nextStep}>
          {step < 3 ? '다음' : '시작하기'}
        </button>
      </div>
    </>
  )
}
