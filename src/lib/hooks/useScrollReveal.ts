'use client'

import { useEffect, useRef } from 'react'

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    // Observe children with .mkt-reveal
    const elements = el.querySelectorAll('.mkt-reveal')
    elements.forEach((element) => observer.observe(element))

    // Also observe the ref element itself if it has the class
    if (el.classList.contains('mkt-reveal')) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return ref
}
