import { useEffect, useRef, useState } from 'react'
import InView from './InView'
import { motionPaused, reducedMotion, usePlaying } from './play'

const ROWS = [
  { name: '김치찌개', price: 5770, base: 6 },
  { name: '제육볶음', price: 7265, base: 4 },
  { name: '된장찌개', price: 4735, base: 3 },
]
/** 손가락이 누르는 순서 */
const ORDER = [0, 1, 0, 2, 1, 0]
const won = (n: number) => n.toLocaleString('ko-KR') + '원'

/** 3단계 장면: + 버튼을 톡톡 누르면 오늘 이익이 올라감 */
export default function TapScene() {
  return (
    <InView className="scene sc-tap" aria-hidden="true" loop>
      <Mini />
    </InView>
  )
}

function Mini() {
  const play = usePlaying()
  const [cnt, setCnt] = useState(ROWS.map((r) => r.base))
  const [k, setK] = useState(0)
  const [bump, setBump] = useState<number | null>(null)
  const plus = useRef<(HTMLSpanElement | null)[]>([])
  const finger = useRef<HTMLSpanElement>(null)
  const total = cnt.reduce((a, c, i) => a + c * ROWS[i].price, 0)

  useEffect(() => {
    if (!play || reducedMotion()) return
    const t = setInterval(() => {
      if (motionPaused()) return
      setK((x) => x + 1)
    }, 1100)
    return () => clearInterval(t)
  }, [play])

  // k 가 바뀔 때마다 손가락을 옮기고, 잠깐 뒤 숫자를 올림
  useEffect(() => {
    if (k === 0) return
    const row = ORDER[(k - 1) % ORDER.length]
    const pl = plus.current[row],
      f = finger.current
    if (pl && f) {
      f.style.left = pl.offsetLeft - 4 + 'px'
      f.style.top = pl.offsetTop - 4 + 'px'
      f.classList.remove('tap')
      void f.offsetWidth
      f.classList.add('tap')
    }
    const t1 = setTimeout(() => {
      setCnt((c) => (k % 18 === 0 ? ROWS.map((r) => r.base) : c.map((v, i) => (i === row ? v + 1 : v))))
      setBump(row)
    }, 180)
    const t2 = setTimeout(() => setBump(null), 400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [k])

  return (
    <>
      <div className="mini">
        {ROWS.map((r, i) => (
          <div className="mrow" key={r.name}>
            <span>{r.name}</span>
            <span className={'cnt num' + (bump === i ? ' bump' : '')}>{cnt[i]}</span>
            <span
              className="plus"
              ref={(el) => {
                plus.current[i] = el
              }}
            >
              +
            </span>
          </div>
        ))}
        <span className="finger" ref={finger} />
      </div>
      <img
        loading="lazy"
        decoding="async"
        className="pet-s"
        src="/img/mascot-happy.webp"
        width={161}
        height={205}
        alt=""
      />
      <span className={'say say-w tail-br total' + (k > 0 ? ' up' : '')} key={total}>
        <small>오늘 이익</small>
        <b className="num">{won(total)}</b>
      </span>
    </>
  )
}
