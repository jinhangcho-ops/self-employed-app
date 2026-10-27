import { useEffect, useRef, useState, type HTMLAttributes } from 'react'
import { PlayCtx } from './play'

interface Props extends HTMLAttributes<HTMLDivElement> {
  /** 반복 모션: 화면 밖으로 나가면 멈추고 다시 들어오면 재생 */
  loop?: boolean
}

/** 화면에 35% 이상 보이면 .play 를 붙여 모션을 시작하는 상자 */
export default function InView({ loop, className, children, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  // IntersectionObserver 가 없는 옛 브라우저는 처음부터 재생
  const [play, setPlay] = useState(() => !('IntersectionObserver' in window))

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPlay(true)
          if (!loop) io.disconnect()
        } else if (loop) setPlay(false)
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [loop])

  return (
    <div ref={ref} className={className + (play ? ' play' : '')} {...rest}>
      <PlayCtx.Provider value={play}>{children}</PlayCtx.Provider>
    </div>
  )
}
