import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context'
import { store } from '../store'
import Icon from '../ui/Icon'

const GUIDE = [
  {
    img: '/img/guide1.webp',
    t: '영수증을 네모 안에 맞춰 찍어요',
    d: '마트·시장 영수증 그대로 괜찮아요. 구겨졌으면 살짝 펴 주세요.',
  },
  {
    img: '/img/guide2.webp',
    t: '읽어 온 품목을 확인해요',
    d: '품목·양·금액이 자동으로 채워져요. 틀린 칸만 눌러서 고치면 돼요.',
  },
  {
    img: '/img/guide3.webp',
    t: '저장하면 단가가 바로 바뀌어요',
    d: '1g당 가격이 갱신되고, 원가가 바뀐 메뉴까지 한 번에 알려 드려요.',
  },
]

/** 영수증 사용법 3장 (처음 한 번 자동으로 보여 줌) */
export default function Guide({ thenReceipt }: { thenReceipt: boolean }) {
  const { open, close } = useApp()
  const [i, setI] = useState(0)
  const nextRef = useRef<HTMLButtonElement>(null)
  useEffect(() => nextRef.current?.focus(), [i])
  const g = GUIDE[i]
  const last = i === GUIDE.length - 1

  const done = (go: boolean) => {
    store.update((s) => {
      s.ocrGuideSeen = true
    })
    if (go && thenReceipt) open({ kind: 'receipt' })
    else close()
  }

  return (
    <div className="gmask" onClick={(e) => e.target === e.currentTarget && done(false)}>
      <div className="guide" role="dialog" aria-modal="true" aria-labelledby="g-t">
        <button className="x g-x" onClick={() => done(false)} aria-label="닫기">
          <Icon name="x" />
        </button>
        <p className="g-k">영수증으로 단가 넣기</p>
        <div className="g-shot">
          <span className="g-num num">{i + 1}</span>
          <img src={g.img} width={480} height={1038} alt={`${g.t} 화면 예시`} />
        </div>
        <h2 id="g-t" className="g-t">
          {g.t}
        </h2>
        <p className="g-d">{g.d}</p>
        <div className="g-dots" aria-label={`${i + 1} / ${GUIDE.length}단계`}>
          {GUIDE.map((_, k) => (
            <i key={k} className={k === i ? 'on' : ''} />
          ))}
        </div>
        <div className="g-btns">
          {i > 0 && (
            <button className="btn" onClick={() => setI(i - 1)}>
              이전
            </button>
          )}
          <button
            ref={nextRef}
            className="btn primary"
            style={{ flex: 1 }}
            onClick={() => (last ? done(true) : setI(i + 1))}
          >
            {last ? '영수증 찍으러 가기' : '다음'}
          </button>
        </div>
      </div>
    </div>
  )
}
