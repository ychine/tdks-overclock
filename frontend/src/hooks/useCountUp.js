import { useEffect, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Counts from 0 up to `target`. Jumps straight to the value when motion is reduced. */
export default function useCountUp(target, duration = 900) {
  const reduce = prefersReducedMotion()
  const [value, setValue] = useState(reduce ? target : 0)

  useEffect(() => {
    if (reduce) return undefined
    let frame
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      setValue(Math.round(target * (1 - Math.pow(1 - t, 4))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, reduce])

  return value
}
