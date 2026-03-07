'use client'

import { useEffect } from 'react'
import { initSilentErrorTracker } from '@/lib/silent-error-tracker'

let initialized = false

export default function SilentErrorTracker() {
  useEffect(() => {
    if (initialized) return
    initialized = true
    initSilentErrorTracker()
  }, [])

  return null
}
