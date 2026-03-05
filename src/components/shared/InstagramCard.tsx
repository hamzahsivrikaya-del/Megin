'use client'

import { useRef, useCallback } from 'react'

interface Measurement {
  date: string
  weight: number | null
  chest: number | null
  waist: number | null
  arm: number | null
  leg: number | null
  body_fat_pct: number | null
}

interface Props {
  clientName: string
  measurements: Measurement[]
  trainerName?: string
}

export default function InstagramCard({ clientName, measurements, trainerName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || measurements.length < 2) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 1080
    const H = 1080
    canvas.width = W
    canvas.height = H

    // Dark gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#111827')
    bg.addColorStop(1, '#1f2937')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Subtle decorative circles
    ctx.globalAlpha = 0.06
    ctx.fillStyle = '#8b5cf6'
    ctx.beginPath()
    ctx.arc(W * 0.85, H * 0.15, 200, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(W * 0.15, H * 0.85, 160, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1

    // Title: ILERLEME RAPORU
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif'
    ctx.fillText('ILERLEME RAPORU', W / 2, 120)

    // Accent line under title
    const accentGrad = ctx.createLinearGradient(W / 2 - 120, 0, W / 2 + 120, 0)
    accentGrad.addColorStop(0, '#8b5cf6')
    accentGrad.addColorStop(1, '#ec4899')
    ctx.fillStyle = accentGrad
    ctx.fillRect(W / 2 - 120, 140, 240, 4)

    // Client name
    ctx.fillStyle = '#a78bfa'
    ctx.font = 'bold 40px system-ui, -apple-system, sans-serif'
    ctx.fillText(clientName.toUpperCase(), W / 2, 210)

    // Get first and last measurement (measurements are sorted desc, so last = oldest)
    const first = measurements[measurements.length - 1]
    const last = measurements[0]

    // Build metrics
    type Metric = {
      label: string
      before: number
      after: number
      unit: string
      invertColor: boolean // true = decrease is good
    }

    const metrics: Metric[] = []

    const addMetric = (
      label: string,
      beforeVal: number | null,
      afterVal: number | null,
      unit: string,
      invertColor: boolean
    ) => {
      if (beforeVal != null && afterVal != null) {
        metrics.push({ label, before: beforeVal, after: afterVal, unit, invertColor })
      }
    }

    addMetric('Kilo', first.weight, last.weight, 'kg', true)
    addMetric('Gogus', first.chest, last.chest, 'cm', false)
    addMetric('Bel', first.waist, last.waist, 'cm', true)
    addMetric('Kol', first.arm, last.arm, 'cm', false)
    addMetric('Bacak', first.leg, last.leg, 'cm', false)
    addMetric('Yag %', first.body_fat_pct, last.body_fat_pct, '%', true)

    if (metrics.length === 0) return

    // Draw metrics table
    const tableTop = 280
    const rowHeight = 90
    const tableWidth = 800
    const tableLeft = (W - tableWidth) / 2

    // Table header
    ctx.fillStyle = 'rgba(139, 92, 246, 0.15)'
    ctx.beginPath()
    ctx.roundRect(tableLeft, tableTop, tableWidth, 60, [12, 12, 0, 0])
    ctx.fill()

    ctx.fillStyle = '#9ca3af'
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('OLCUM', tableLeft + 30, tableTop + 40)
    ctx.textAlign = 'center'
    ctx.fillText('ONCE', tableLeft + tableWidth * 0.45, tableTop + 40)
    ctx.fillText('SONRA', tableLeft + tableWidth * 0.65, tableTop + 40)
    ctx.fillText('FARK', tableLeft + tableWidth * 0.87, tableTop + 40)

    // Table rows
    metrics.forEach((metric, i) => {
      const y = tableTop + 60 + i * rowHeight

      // Row background
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
        ctx.fillRect(tableLeft, y, tableWidth, rowHeight)
      }

      // Separator line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(tableLeft, y)
      ctx.lineTo(tableLeft + tableWidth, y)
      ctx.stroke()

      const centerY = y + rowHeight / 2 + 8

      // Label
      ctx.fillStyle = '#e5e7eb'
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(metric.label, tableLeft + 30, centerY)

      // Before
      ctx.fillStyle = '#9ca3af'
      ctx.font = '28px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${metric.before} ${metric.unit}`, tableLeft + tableWidth * 0.45, centerY)

      // After
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
      ctx.fillText(`${metric.after} ${metric.unit}`, tableLeft + tableWidth * 0.65, centerY)

      // Diff
      const diff = metric.after - metric.before
      const diffRounded = Math.round(diff * 10) / 10
      const diffSign = diff > 0 ? '+' : ''
      const isPositive = metric.invertColor ? diff < 0 : diff > 0
      const isNegative = metric.invertColor ? diff > 0 : diff < 0

      if (diff === 0) {
        ctx.fillStyle = '#9ca3af'
      } else if (isPositive) {
        ctx.fillStyle = '#34d399'
      } else if (isNegative) {
        ctx.fillStyle = '#f87171'
      }
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
      ctx.fillText(`${diffSign}${diffRounded}`, tableLeft + tableWidth * 0.87, centerY)
    })

    // Bottom rounded corners for table
    const tableBottom = tableTop + 60 + metrics.length * rowHeight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(tableLeft, tableBottom)
    ctx.lineTo(tableLeft + tableWidth, tableBottom)
    ctx.stroke()

    // Date range
    const formatSimpleDate = (dateStr: string) => {
      const d = new Date(dateStr)
      const months = ['Oca', 'Sub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Agu', 'Eyl', 'Eki', 'Kas', 'Ara']
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    }

    const dateY = Math.min(tableBottom + 60, H - 160)
    ctx.fillStyle = '#6b7280'
    ctx.font = '24px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(
      `${formatSimpleDate(first.date)}  →  ${formatSimpleDate(last.date)}`,
      W / 2,
      dateY
    )

    // Trainer name
    if (trainerName) {
      ctx.fillStyle = '#9ca3af'
      ctx.font = '22px system-ui, -apple-system, sans-serif'
      ctx.fillText(`PT: ${trainerName}`, W / 2, dateY + 40)
    }

    // MEGIN watermark
    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)'
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('MEGIN', W / 2, H - 40)

    // Download as PNG
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${clientName.replace(/\s+/g, '-').toLowerCase()}-ilerleme.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [clientName, measurements, trainerName])

  if (measurements.length < 2) return null

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={generate}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
        Instagram Karti Olustur
      </button>
    </>
  )
}
