'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { generateMeasurementPDF } from '@/lib/pdf/measurement-report'
import type { Measurement } from '@/lib/types'

interface DownloadPDFButtonProps {
  clientName: string
  trainerName?: string
  measurements: Measurement[]
}

export default function DownloadPDFButton({
  clientName,
  trainerName,
  measurements,
}: DownloadPDFButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      await generateMeasurementPDF({ clientName, trainerName, measurements })
    } catch (err) {
      console.error('PDF oluşturma hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      loading={loading}
    >
      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      PDF İndir
    </Button>
  )
}
