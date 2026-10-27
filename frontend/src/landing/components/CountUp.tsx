import { useEffect, useState } from 'react'
import { reducedMotion, usePlaying } from './play'

/** 장면이 재생되면 0 → to 까지 숫자가 올라감 (소수 첫째 자리) */
export default function CountUp({
  to,
  delay = 1500,
  duration = 1300,
}: {
  to: number
  delay?: number
  duration?: number
}) {
  const play = usePlaying()
  const [v, setV] = useState(to)

  useEffect(() => {
    if (!play || reducedMotion()) return
    let raf = 0
    const t0 = performance.now() + delay
    const step = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - t0) / duration))
      setV(to * (1 - Math.pow(1 - k, 3)))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [play, to, delay, duration])

  return <>{v.toFixed(1)}</>
}
