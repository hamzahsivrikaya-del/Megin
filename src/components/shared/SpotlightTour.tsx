'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TourProgress } from '@/lib/types'

export interface SpotlightStep {
  target: string           // data-tour attribute value
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

interface SpotlightTourProps {
  steps: SpotlightStep[]
  tourProgress: TourProgress | null
  table: 'trainers' | 'clients'   // hangi tablo güncelleniyor
  onComplete?: () => void
}

export default function SpotlightTour({ steps, tourProgress, table, onComplete }: SpotlightTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [active, setActive] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({})
  const overlayRef = useRef<HTMLDivElement>(null)

  // Tour'u başlat: tour_progress null ise (ilk kez) veya dismissed değilse
  useEffect(() => {
    // Dismissed ise hiç gösterme
    if (tourProgress?.dismissed) return

    // Tüm adımlar tamamlanmış/atlanmışsa gösterme
    if (tourProgress) {
      const allDone = steps.every(
        s => tourProgress.completed.includes(s.target) || tourProgress.skipped.includes(s.target)
      )
      if (allDone) return

      // Kaldığı yerden devam
      const nextIncomplete = steps.findIndex(
        s => !tourProgress.completed.includes(s.target) && !tourProgress.skipped.includes(s.target)
      )
      if (nextIncomplete >= 0) {
        setCurrentStep(nextIncomplete)
        const timer = setTimeout(() => setActive(true), 800)
        return () => clearTimeout(timer)
      }
      return
    }

    // tourProgress === null → ilk kez, ama localStorage ile çift kontrol
    const storageKey = `tour_dismissed_${table}`
    if (localStorage.getItem(storageKey) === 'true') return

    const timer = setTimeout(() => setActive(true), 800)
    return () => clearTimeout(timer)
  }, [tourProgress, steps, table])

  // Hedef elemanı bul ve pozisyon hesapla
  const updateTargetPosition = useCallback(() => {
    if (!active || currentStep >= steps.length) return

    const step = steps[currentStep]
    const el = document.querySelector(`[data-tour="${step.target}"]`)
    if (!el) return

    const rect = el.getBoundingClientRect()
    setTargetRect(rect)

    // Popover pozisyonu
    const pos = step.position || 'bottom'
    const padding = 16
    const popoverWidth = 320

    let style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 10002,
      width: popoverWidth,
      maxWidth: 'calc(100vw - 32px)',
    }

    if (pos === 'bottom') {
      style.top = rect.bottom + padding
      style.left = Math.max(16, Math.min(rect.left + rect.width / 2 - popoverWidth / 2, window.innerWidth - popoverWidth - 16))
    } else if (pos === 'top') {
      style.bottom = window.innerHeight - rect.top + padding
      style.left = Math.max(16, Math.min(rect.left + rect.width / 2 - popoverWidth / 2, window.innerWidth - popoverWidth - 16))
    } else if (pos === 'right') {
      style.top = rect.top + rect.height / 2 - 60
      style.left = rect.right + padding
    } else if (pos === 'left') {
      style.top = rect.top + rect.height / 2 - 60
      style.right = window.innerWidth - rect.left + padding
    }

    setPopoverStyle(style)
  }, [active, currentStep, steps])

  useEffect(() => {
    updateTargetPosition()
    window.addEventListener('resize', updateTargetPosition)
    window.addEventListener('scroll', updateTargetPosition, true)
    return () => {
      window.removeEventListener('resize', updateTargetPosition)
      window.removeEventListener('scroll', updateTargetPosition, true)
    }
  }, [updateTargetPosition])

  async function saveTour(progress: TourProgress) {
    // localStorage'a da kaydet (DB save başarısız olursa fallback)
    if (progress.dismissed) {
      localStorage.setItem(`tour_dismissed_${table}`, 'true')
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from(table)
      .update({ tour_progress: progress })
      .eq('user_id', user.id)
  }

  function getProgress(): TourProgress {
    return tourProgress || { completed: [], skipped: [], dismissed: false }
  }

  function handleNext() {
    const progress = getProgress()
    const step = steps[currentStep]
    const isLast = currentStep >= steps.length - 1
    const updated: TourProgress = {
      ...progress,
      completed: [...progress.completed.filter(k => k !== step.target), step.target],
      skipped: progress.skipped,
      dismissed: isLast ? true : false,
    }

    saveTour(updated)
    if (isLast) {
      setActive(false)
      onComplete?.()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  function handleSkip() {
    const progress = getProgress()
    const step = steps[currentStep]
    const isLast = currentStep >= steps.length - 1
    const updated: TourProgress = {
      ...progress,
      completed: progress.completed,
      skipped: [...progress.skipped.filter(k => k !== step.target), step.target],
      dismissed: isLast ? true : false,
    }

    saveTour(updated)
    if (isLast) {
      setActive(false)
      onComplete?.()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  function handleDismiss() {
    const progress = getProgress()
    const updated: TourProgress = {
      ...progress,
      dismissed: true,
    }
    saveTour(updated)
    setActive(false)
    onComplete?.()
  }

  if (!active || currentStep >= steps.length || !targetRect) return null

  const step = steps[currentStep]
  const spotlightPadding = 8
  const spotlightRadius = 12

  return (
    <>
      {/* Overlay with spotlight hole */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[10000] transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0,0,0,0.6)',
          clipPath: `polygon(
            0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
            ${targetRect.left - spotlightPadding}px ${targetRect.top - spotlightPadding}px,
            ${targetRect.left - spotlightPadding}px ${targetRect.bottom + spotlightPadding}px,
            ${targetRect.right + spotlightPadding}px ${targetRect.bottom + spotlightPadding}px,
            ${targetRect.right + spotlightPadding}px ${targetRect.top - spotlightPadding}px,
            ${targetRect.left - spotlightPadding}px ${targetRect.top - spotlightPadding}px
          )`,
        }}
        onClick={handleDismiss}
      />

      {/* Spotlight border glow */}
      <div
        className="fixed z-[10001] pointer-events-none"
        style={{
          top: targetRect.top - spotlightPadding,
          left: targetRect.left - spotlightPadding,
          width: targetRect.width + spotlightPadding * 2,
          height: targetRect.height + spotlightPadding * 2,
          borderRadius: spotlightRadius,
          boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.5), 0 0 20px rgba(220, 38, 38, 0.2)',
          transition: 'all 0.3s ease',
        }}
      />

      {/* Popover */}
      <div
        style={popoverStyle}
        className="animate-[fadeIn_0.2s_ease-out]"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-3">
            {steps.map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i <= currentStep ? '#DC2626' : '#E5E5E5',
                }}
              />
            ))}
          </div>

          <h3 className="font-bold text-gray-900 text-base">{step.title}</h3>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{step.description}</p>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Turu Bitir
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1"
              >
                Atla
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                {currentStep >= steps.length - 1 ? 'Tamamla' : 'Sonraki'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
