import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Measurement } from '@/lib/types'

interface ReportData {
  clientName: string
  trainerName?: string
  measurements: Measurement[]
}

const METRIC_COLUMNS = [
  { key: 'date', label: 'Tarih' },
  { key: 'weight', label: 'Kilo (kg)' },
  { key: 'height', label: 'Boy (cm)' },
  { key: 'chest', label: 'Gogus (cm)' },
  { key: 'waist', label: 'Bel (cm)' },
  { key: 'arm', label: 'Kol (cm)' },
  { key: 'leg', label: 'Bacak (cm)' },
  { key: 'body_fat_pct', label: 'Yag (%)' },
] as const

const SKINFOLD_COLUMNS = [
  { key: 'date', label: 'Tarih' },
  { key: 'sf_chest', label: 'Gogus (mm)' },
  { key: 'sf_abdomen', label: 'Karin (mm)' },
  { key: 'sf_thigh', label: 'Uyluk (mm)' },
] as const

// NotoSans fontu runtime'da yükle (Turkce karakter destegi)
let cachedFont: string | null = null

async function loadNotoSansFont(): Promise<string | null> {
  if (cachedFont) return cachedFont

  try {
    const response = await fetch(
      'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-400-normal.ttf'
    )
    if (!response.ok) return null

    const buffer = await response.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    cachedFont = btoa(binary)
    return cachedFont
  } catch {
    return null
  }
}

function formatReportDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`
}

export async function generateMeasurementPDF(data: ReportData) {
  const { clientName, trainerName, measurements } = data

  if (measurements.length === 0) return

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // Font yukle
  const fontBase64 = await loadNotoSansFont()
  if (fontBase64) {
    doc.addFileToVFS('NotoSans-Regular.ttf', fontBase64)
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal')
    doc.setFont('NotoSans')
  }

  const pageWidth = doc.internal.pageSize.getWidth()
  const primaryColor: [number, number, number] = [220, 38, 38] // #DC2626

  // Header bar
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 28, 'F')

  // Megin logo text
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont(fontBase64 ? 'NotoSans' : 'helvetica', 'normal')
  doc.text('MEGIN', 14, 18)

  // Rapor basligi
  doc.setFontSize(10)
  doc.text('Olcum Raporu', pageWidth - 14, 12, { align: 'right' })
  doc.setFontSize(8)
  doc.text(formatReportDate(new Date().toISOString()), pageWidth - 14, 18, { align: 'right' })

  // Danisan bilgileri
  doc.setTextColor(26, 26, 26) // text-primary
  doc.setFontSize(12)
  let yPos = 38
  doc.text(clientName, 14, yPos)
  if (trainerName) {
    doc.setFontSize(9)
    doc.setTextColor(87, 83, 78) // text-secondary
    doc.text(`Antrenor: ${trainerName}`, 14, yPos + 6)
    yPos += 6
  }

  yPos += 10

  // Ozet: ilk ve son olcum karsilastirmasi
  if (measurements.length > 1) {
    const latest = measurements[0]
    const oldest = measurements[measurements.length - 1]

    doc.setFontSize(10)
    doc.setTextColor(26, 26, 26)
    doc.text('Ilerleme Ozeti', 14, yPos)
    yPos += 2

    const summaryData: string[][] = []
    const summaryKeys = ['weight', 'chest', 'waist', 'arm', 'leg', 'body_fat_pct'] as const
    const summaryLabels: Record<string, string> = {
      weight: 'Kilo (kg)',
      chest: 'Gogus (cm)',
      waist: 'Bel (cm)',
      arm: 'Kol (cm)',
      leg: 'Bacak (cm)',
      body_fat_pct: 'Yag (%)',
    }

    for (const key of summaryKeys) {
      const first = oldest[key]
      const last = latest[key]
      if (first != null && last != null) {
        const diff = (Number(last) - Number(first)).toFixed(1)
        const sign = Number(diff) > 0 ? '+' : ''
        summaryData.push([summaryLabels[key], String(first), String(last), `${sign}${diff}`])
      }
    }

    if (summaryData.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Olcum', `Ilk (${formatReportDate(oldest.date)})`, `Son (${formatReportDate(latest.date)})`, 'Degisim']],
        body: summaryData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          font: fontBase64 ? 'NotoSans' : 'helvetica',
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          3: { halign: 'center' },
        },
        margin: { left: 14, right: 14 },
      })

      yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    }
  }

  // Vucut olculeri tablosu
  doc.setFontSize(10)
  doc.setTextColor(26, 26, 26)
  doc.text('Vucut Olculeri Gecmisi', 14, yPos)
  yPos += 2

  const bodyRows = measurements.map((m) =>
    METRIC_COLUMNS.map((col) => {
      if (col.key === 'date') return formatReportDate(m.date)
      const val = m[col.key as keyof Measurement]
      return val != null ? String(val) : '-'
    })
  )

  autoTable(doc, {
    startY: yPos,
    head: [METRIC_COLUMNS.map((c) => c.label)],
    body: bodyRows,
    theme: 'striped',
    styles: {
      fontSize: 7,
      cellPadding: 2.5,
      font: fontBase64 ? 'NotoSans' : 'helvetica',
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [254, 242, 242], // primary-50
    },
    margin: { left: 14, right: 14 },
  })

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  // Skinfold tablosu (varsa)
  const hasSkinfold = measurements.some(
    (m) => m.sf_chest != null || m.sf_abdomen != null || m.sf_thigh != null
  )

  if (hasSkinfold) {
    // Yeni sayfa gerekiyorsa
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(10)
    doc.setTextColor(26, 26, 26)
    doc.text('Skinfold Olculeri', 14, yPos)
    yPos += 2

    const sfRows = measurements
      .filter((m) => m.sf_chest != null || m.sf_abdomen != null || m.sf_thigh != null)
      .map((m) =>
        SKINFOLD_COLUMNS.map((col) => {
          if (col.key === 'date') return formatReportDate(m.date)
          const val = m[col.key as keyof Measurement]
          return val != null ? String(val) : '-'
        })
      )

    autoTable(doc, {
      startY: yPos,
      head: [SKINFOLD_COLUMNS.map((c) => c.label)],
      body: sfRows,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        font: fontBase64 ? 'NotoSans' : 'helvetica',
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [254, 242, 242],
      },
      margin: { left: 14, right: 14 },
    })
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const pageH = doc.internal.pageSize.getHeight()
    doc.setFontSize(7)
    doc.setTextColor(168, 162, 158) // text-tertiary
    doc.text('megin.app', 14, pageH - 8)
    doc.text(`Sayfa ${i}/${pageCount}`, pageWidth - 14, pageH - 8, { align: 'right' })
  }

  // PDF indir
  const fileName = `${clientName.replace(/\s+/g, '_')}_olcum_raporu_${formatReportDate(new Date().toISOString()).replace(/\./g, '-')}.pdf`
  doc.save(fileName)
}
