'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface UseCountUpOptions {
  duration?: number
  decimals?: number
  suffix?: string
}

export function useCountUp(
  target: number,
  options: UseCountUpOptions = {}
) {
  const { duration = 1500, decimals = 0, suffix = '' } = options
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(`0${suffix}`)
  const hasAnimated = useRef(false)

  const animate = useCallback(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const start = performance.now()

    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * target

      setValue(
        current.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) + suffix
      )

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [target, duration, decimals, suffix])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate()
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [animate])

  return { ref, value }
}
