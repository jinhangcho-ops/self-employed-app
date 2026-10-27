import { useEffect, useState } from 'react'

const KEY = 'domain.motion'
const read = () => {
  try {
    return localStorage.getItem(KEY) === 'off'
  } catch {
    return false
  }
}

/** 자동 재생 모션을 멈추는 버튼 (html.paused 로 모든 애니메이션 정지) */
export default function MotionToggle() {
  const [off, setOff] = useState(read)
  useEffect(() => {
    document.documentElement.classList.toggle('paused', off)
    try {
      localStorage.setItem(KEY, off ? 'off' : 'on')
    } catch {
      /* 무시 */
    }
  }, [off])
  return (
    <button className="motion-btn" type="button" aria-pressed={off} onClick={() => setOff(!off)}>
      {off ? '움직임 다시 보기' : '움직임 멈추기'}
    </button>
  )
}
