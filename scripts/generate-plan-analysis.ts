/**
 * Megin Paket Analiz PDF Olusturma Scripti
 * Calistirma: npx tsx scripts/generate-plan-analysis.ts
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { writeFileSync } from 'fs'

// Turkce karakter destegi icin helper
function tr(text: string): string {
  return text
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
}

function generatePDF() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  let y = 20

  function addTitle(text: string, size: number = 18) {
    doc.setFontSize(size)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39)
    doc.text(tr(text), margin, y)
    y += size * 0.5 + 2
  }

  function addSubtitle(text: string, size: number = 13) {
    doc.setFontSize(size)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(55, 65, 81)
    doc.text(tr(text), margin, y)
    y += size * 0.4 + 2
  }

  function addText(text: string, size: number = 10) {
    doc.setFontSize(size)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99)
    const lines = doc.splitTextToSize(tr(text), pageWidth - margin * 2)
    doc.text(lines, margin, y)
    y += lines.length * (size * 0.4) + 3
  }

  function addBullet(text: string, indent: number = 20) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99)
    doc.text('•', indent - 5, y)
    const lines = doc.splitTextToSize(tr(text), pageWidth - indent - margin)
    doc.text(lines, indent, y)
    y += lines.length * 4.5 + 1
  }

  function addLine() {
    doc.setDrawColor(229, 231, 235)
    doc.line(margin, y, pageWidth - margin, y)
    y += 5
  }

  function checkPage(needed: number = 30) {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage()
      y = 20
    }
  }

  // ========================================
  // KAPAK
  // ========================================
  y = 60
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('MEGIN', pageWidth / 2, y, { align: 'center' })
  y += 15

  doc.setFontSize(18)
  doc.setTextColor(100, 100, 100)
  doc.text(tr('Paket Ozellik Analiz Raporu'), pageWidth / 2, y, { align: 'center' })
  y += 12

  doc.setFontSize(12)
  doc.setTextColor(150, 150, 150)
  doc.text('2026-03-05', pageWidth / 2, y, { align: 'center' })
  y += 8
  doc.text(tr('Mevcut Durum + Yeni Oneriler'), pageWidth / 2, y, { align: 'center' })

  // ========================================
  // SAYFA 2: MEVCUT OZELLIK HARITASI
  // ========================================
  doc.addPage()
  y = 20

  addTitle('1. Mevcut Ozellik Haritasi')
  y += 3
  addText('Megin uygulamasindaki tum ozellikler ve mevcut enforce durumu.')
  y += 3

  // TRAINER OZELLIKLERI
  addSubtitle('1.1 Antrenor (Trainer) Ozellikleri')
  y += 2

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', tr('Ozellik'), tr('Sayfa/Konum'), 'Enforce?', tr('Aciklama')]],
    body: [
      ['1', tr('Danisan Yonetimi'), '/dashboard/clients', tr('KISMI'), tr('Sadece limit (3/10/sinirsiz) enforce ediliyor')],
      ['2', tr('Davet Linki + WhatsApp'), '/dashboard/clients', 'YOK', tr('Tum planlara acik')],
      ['3', 'Takvim', '/dashboard/takvim', 'YOK', tr('Plana dahil degil, herkese acik')],
      ['4', tr('Bugunun Dersleri'), '/dashboard/lessons/today', 'YOK', tr('Herkese acik')],
      ['5', tr('Manuel Ders Ekle'), '/dashboard/lessons/new', 'YOK', tr('Herkese acik')],
      ['6', tr('Paket Olustur'), '/dashboard/packages/new', 'YOK', tr('Herkese acik')],
      ['7', tr('Olcum Gir (12 alan)'), '/dashboard/measurements/new', 'YOK', tr('Herkese acik')],
      ['8', 'Antrenman Programi', '/dashboard/workouts', 'YOK', tr('fitness_tools key var ama enforce yok')],
      ['9', tr('Finans Ekrani'), '/dashboard/finance', 'YOK', tr('finance key var ama enforce yok')],
      ['10', 'Bildirimler', '/dashboard/notifications', 'YOK', tr('push_notifications key var ama enforce yok')],
      ['11', tr('Beslenme Plani'), 'ClientDetail/nutrition', 'YOK', tr('nutrition key var ama enforce yok')],
      ['12', tr('Ilerleme Fotolari'), 'ClientDetail/photos', 'YOK', tr('progress_photos key var ama enforce yok')],
      ['13', tr('Bagli Uyeler'), 'ClientDetail/overview', 'YOK', tr('dependents key var ama enforce yok')],
      ['14', 'PDF Rapor', tr('Olcum sayfasi'), 'YOK', tr('Herkese acik')],
      ['15', 'Upgrade Sayfasi', '/dashboard/upgrade', '-', 'PayTR entegrasyonu hazir'],
    ],
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontSize: 7 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 38 },
      3: { cellWidth: 18 },
      4: { cellWidth: 'auto' },
    },
  })

  y = (doc as any).lastAutoTable.finalY + 10
  checkPage(80)

  // CLIENT OZELLIKLERI
  addSubtitle('1.2 Danisan (Client) Ozellikleri')
  y += 2

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', tr('Ozellik'), tr('Sayfa/Konum'), 'Enforce?', tr('Aciklama')]],
    body: [
      ['1', tr('Anasayfa (Dashboard)'), '/app', 'YOK', tr('Tum bilgiler acik')],
      ['2', 'Antrenman Programi', '/app/program', 'YOK', tr('Haftalik program gorunumu')],
      ['3', tr('Ilerleme + Olcumler'), '/app/progress', 'YOK', tr('measurement_charts key var ama enforce yok')],
      ['4', 'Hedef Belirleme', '/app/progress (GoalSetter)', 'YOK', tr('Plana dahil degil')],
      ['5', 'Paketlerim', '/app/packages', 'YOK', tr('Herkese acik')],
      ['6', tr('Haftalik Ozet'), '/app/haftalik-ozet', 'YOK', tr('weekly_reports key var ama enforce yok')],
      ['7', 'Beslenme', '/app/beslenme', 'YOK', tr('nutrition key var ama enforce yok')],
      ['8', 'Rozetler (30+)', '/app/rozetler', 'YOK', tr('badges key var ama enforce yok')],
      ['9', 'Bildirimler', '/app/notifications', 'YOK', tr('Herkese acik')],
      ['10', 'Onboarding (4 adim)', '/app/onboarding', '-', tr('Tum yeni uyeler icin zorunlu')],
      ['11', 'Spotlight Tour', tr('Her iki taraf'), tr('KISMI'), tr('Tour adimlari kilitli ama sayfalar acik')],
    ],
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [55, 65, 81], textColor: 255, fontSize: 7 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 42 },
      3: { cellWidth: 18 },
      4: { cellWidth: 'auto' },
    },
  })

  y = (doc as any).lastAutoTable.finalY + 10
  checkPage(60)

  // SISTEM OZELLIKLERI
  addSubtitle('1.3 Sistem & Altyapi Ozellikleri')
  y += 2

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', tr('Ozellik'), tr('Aciklama')]],
    body: [
      ['1', 'PWA + Push Notifications', tr('Service worker, push subscribe/send API')],
      ['2', 'Cron Jobs (5 adet)', tr('Badge notify, package check, nutrition reminder, weekly report, trainer summary')],
      ['3', 'PayTR Odeme', tr('iFrame API, token/callback route, payment_orders tablosu')],
      ['4', 'Supabase Auth + RLS', tr('Row-level security, client/trainer ayrim')],
      ['5', tr('Davet Sistemi'), tr('Token bazli invite, WhatsApp paylasim')],
      ['6', 'PDF Export', tr('jsPDF + autoTable, Turkce font destegi')],
      ['7', tr('Egzersiz Autocomplete'), tr('search_exercises RPC, veritabani bazli oneri')],
      ['8', tr('Abonelik Yonetimi'), tr('free/pro/elite enum, subscription tablosu')],
    ],
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 45, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
  })

  y = (doc as any).lastAutoTable.finalY + 10

  // ========================================
  // SAYFA: MEVCUT PAKET DAGITIMI
  // ========================================
  doc.addPage()
  y = 20

  addTitle('2. Mevcut Paket Dagitimi (plans.ts)')
  y += 3
  addText('Asagidaki tablo plans.ts dosyasindaki mevcut konfigurasyonu gostermektedir. Ancak sadece danisan limiti enforce edilmektedir.')
  y += 5

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Ozellik', 'FREE (3)', 'PRO (10)', 'ELITE (Sinirsiz)']],
    body: [
      [tr('Danisan Ekleme + Davet'), 'ACIK', 'ACIK', 'ACIK'],
      ['Temel Antrenman Programi', 'ACIK', 'ACIK', 'ACIK'],
      [tr('Ders Sayisi Takibi'), 'ACIK', 'ACIK', 'ACIK'],
      [tr('Temel Olcum (kilo, boy)'), 'ACIK', 'ACIK', 'ACIK'],
      [tr('PT Handle (public profil)'), 'ACIK', 'ACIK', 'ACIK'],
      ['', '', '', ''],
      [tr('Olcum Grafikleri + Trend'), 'KAPALI', 'ACIK', 'ACIK'],
      [tr('Beslenme Takibi (ogun+foto)'), 'KAPALI', 'ACIK', 'ACIK'],
      [tr('Haftalik Otomatik Raporlar'), 'KAPALI', 'ACIK', 'ACIK'],
      ['Push Bildirimler', 'KAPALI', 'ACIK', 'ACIK'],
      [tr('Finans Ekrani'), 'KAPALI', 'ACIK', 'ACIK'],
      [tr('Fitness Araclari (7 arac)'), 'KAPALI', 'ACIK', 'ACIK'],
      ['', '', '', ''],
      [tr('Ilerleme Fotolari + Slider'), 'KAPALI', 'KAPALI', 'ACIK'],
      ['Rozet Sistemi (30+ rozet)', 'KAPALI', 'KAPALI', 'ACIK'],
      ['Blog', 'KAPALI', 'KAPALI', 'ACIK'],
      [tr('Bagli Uye (veli-cocuk)'), 'KAPALI', 'KAPALI', 'ACIK'],
      ['Risk Skoru', 'KAPALI', 'KAPALI', 'ACIK'],
      [tr('Instagram Paylasim Karti'), 'KAPALI', 'KAPALI', 'ACIK'],
      ['Finans Tahmini', 'KAPALI', 'KAPALI', 'ACIK'],
    ],
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontSize: 9 },
    bodyStyles: { textColor: [55, 65, 81] },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 40, halign: 'center' },
    },
    didParseCell: (data: any) => {
      if (data.section === 'body') {
        const val = data.cell.raw
        if (val === 'ACIK') {
          data.cell.styles.textColor = [22, 163, 74]
          data.cell.styles.fontStyle = 'bold'
        } else if (val === 'KAPALI') {
          data.cell.styles.textColor = [220, 38, 38]
          data.cell.styles.fontStyle = 'bold'
        }
      }
    },
  })

  y = (doc as any).lastAutoTable.finalY + 10
  checkPage(40)

  addSubtitle('2.1 Kritik Sorunlar')
  y += 2
  addBullet('Feature gating altyapisi (hasFeatureAccess) SADECE spotlight tour adimlarinda kullaniliyor')
  addBullet('Sidebar ve Navbar menuleri hicbir plan kontrolu yapmiyor - tum sayfalar acik')
  addBullet('API route\'lari plan kontrolu yapmiyor (badges, nutrition, finance vs.)')
  addBullet('Sadece danisan limiti (3/10/sinirsiz) gercekten enforce ediliyor')
  addBullet('"Blog" kaldirildi, "Risk Skoru", "Instagram Karti", "Finans Tahmini" henuz implement edilmedi')
  addBullet('"Fitness Araclari (7 arac)" tanimli ama uygulama icinde boyle bir sayfa/modul yok')

  // ========================================
  // SAYFA: PAKET DAGITIMINA DAHIL OLMAYAN OZELLIKLER
  // ========================================
  doc.addPage()
  y = 20

  addTitle('3. Paket Sistemine Dahil Olmayan Ozellikler')
  y += 3
  addText('Asagidaki ozellikler mevcut olmasina ragmen plans.ts\'de tanimlanmamis, hicbir pakete atanmamistir.')
  y += 5

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', tr('Ozellik'), tr('Eklendigi Tarih'), tr('Mevcut Durum'), tr('Oneri')]],
    body: [
      ['1', 'Takvim', 'Son eklenen', tr('Herkese acik, plana dahil degil'), tr('Free\'de sinirli, Pro\'da tam')],
      ['2', 'Onboarding (4 adim)', 'Mart 2026', tr('Tum yeni uyeler icin zorunlu'), tr('Tum planlarda acik kalmali')],
      ['3', 'Spotlight Tour', 'Mart 2026', tr('Kismi plan kontrolu'), tr('Tum planlarda acik kalmali')],
      ['4', 'PDF Rapor Export', 'Mart 2026', tr('Herkese acik'), tr('Pro ve ustu')],
      ['5', 'Hedef Belirleme (Goals)', 'Mart 2026', tr('Herkese acik'), tr('Pro ve ustu')],
      ['6', tr('Ogun Foto Yukleme'), 'Mart 2026', tr('Beslenme modulunun parcasi'), tr('Pro ve ustu (beslenme ile)')],
      ['7', tr('Foto Karsilastirma'), 'Mart 2026', tr('Herkese acik'), tr('Elite')],
      ['8', tr('Egzersiz Autocomplete'), 'Mart 2026', tr('Herkese acik'), tr('Tum planlarda acik kalmali')],
      ['9', 'Cron Jobs (5 adet)', 'Mart 2026', tr('Plan kontrolsuz calisiyor'), tr('Plan bazli filtreleme ekle')],
      ['10', tr('Ders Hatirlatma Bildirimi'), 'Mart 2026', tr('Calendar notify API'), tr('Pro ve ustu')],
    ],
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [234, 88, 12], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [255, 251, 235] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 25 },
      3: { cellWidth: 42 },
      4: { cellWidth: 'auto' },
    },
  })

  y = (doc as any).lastAutoTable.finalY + 15

  // ========================================
  // SAYFA: IMPLEMENT EDILMEMIS OZELLIKLER
  // ========================================
  checkPage(80)
  addTitle('4. Tanimli Ama Implement Edilmemis Ozellikler')
  y += 3
  addText('plans.ts\'de lockedFeatures olarak tanimli ama kod tabaninda karsiligi olmayan ozellikler:')
  y += 5

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Feature Key', tr('Planlanan Ozellik'), 'Durum', tr('Oneri')]],
    body: [
      ['blog', 'Blog Sistemi', tr('KALDIRILDI (koddan silindi)'), tr('plans.ts\'den de kaldir')],
      ['risk_score', 'Risk Skoru', tr('IMPLEMENT EDILMEDI'), tr('Elite ozellik olarak implement et veya kaldir')],
      ['instagram_card', tr('Instagram Paylasim Karti'), tr('IMPLEMENT EDILMEDI'), tr('Pro/Elite ozellik olarak implement et')],
      ['finance_forecast', 'Finans Tahmini', tr('IMPLEMENT EDILMEDI'), tr('Elite ozellik olarak implement et')],
      ['fitness_tools', tr('Fitness Araclari (7 arac)'), tr('TANIMLI AMA SAYFA YOK'), tr('Ne oldugunu netlestirilmeli')],
    ],
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [220, 38, 38], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [254, 242, 242] },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 40 },
      2: { cellWidth: 45 },
      3: { cellWidth: 'auto' },
    },
  })

  y = (doc as any).lastAutoTable.finalY + 15

  // ========================================
  // SAYFA: VERITABANI TABLOLARI
  // ========================================
  doc.addPage()
  y = 20

  addTitle('5. Veritabani Yapisi (15 Migration)')
  y += 3

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Tablo', tr('Aciklama'), tr('Iliskili Ozellik')]],
    body: [
      ['trainers', tr('Antrenor profili (username, bio, expertise, city)'), tr('Tum planlar')],
      ['clients', tr('Danisan bilgileri (invite, parent_id, onboarding)'), tr('Limit: 3/10/sinirsiz')],
      ['packages', tr('Ders paketleri (total, used, price, status)'), tr('Tum planlar')],
      ['lessons', tr('Ders kayitlari (date, time, duration, attended)'), tr('Tum planlar')],
      ['measurements', tr('Vucut olcumleri (12 alan: kilo-skinfold)'), tr('Temel: tum, grafik: Pro+')],
      ['workouts', tr('Antrenman programlari (public/client, haftalik)'), tr('Tum planlar')],
      ['workout_exercises', tr('Egzersiz detaylari (set, rep, weight, section)'), tr('Tum planlar')],
      ['client_meals', tr('Ogun planlari (isim, siralama)'), tr('Pro+')],
      ['meal_logs', tr('Ogun kayitlari (tarih, durum, foto)'), tr('Pro+')],
      ['progress_photos', tr('Ilerleme fotolari (front, side, back)'), 'Elite'],
      ['client_goals', tr('Hedef belirleme (metrik, hedef deger)'), tr('Plana atanmali')],
      ['client_badges', tr('Kazanilan rozetler (badge_id, earned_at)'), 'Pro+/Elite'],
      ['notifications', tr('Bildirimler (type, title, message, is_read)'), tr('Pro+')],
      ['weekly_reports', tr('Haftalik raporlar (hafta, icerik)'), tr('Pro+')],
      ['subscriptions', tr('Abonelik bilgisi (plan, status, expire)'), tr('Sistem')],
      ['payment_orders', tr('Odeme gecmisi (PayTR merchant_oid, amount)'), tr('Sistem')],
    ],
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 'auto' },
    },
  })

  y = (doc as any).lastAutoTable.finalY + 15

  // ========================================
  // SAYFA: API ROUTE HARITASI
  // ========================================
  checkPage(80)
  addSubtitle('5.1 API Route Haritasi')
  y += 2

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Method', 'Route', tr('Aciklama'), 'Plan Kontrol']],
    body: [
      ['POST', '/api/trainer/clients', tr('Danisan ekle'), tr('EVET (limit)')],
      ['GET', '/api/trainer/clients', tr('Danisan listesi'), 'HAYIR'],
      ['DELETE', '/api/trainer/clients/[id]', tr('Danisan sil'), 'HAYIR'],
      ['GET', '/api/badges', tr('Rozet durumu kontrol'), 'HAYIR'],
      ['GET', '/api/goals', 'Hedefler', 'HAYIR'],
      ['GET', '/api/progress-photos', tr('Ilerleme fotolari'), 'HAYIR'],
      ['POST', '/api/paytr/token', tr('Odeme token olustur'), '-'],
      ['POST', '/api/paytr/callback', tr('Odeme callback'), '-'],
      ['POST', '/api/invite/register', tr('Davet ile kayit'), '-'],
      ['POST', '/api/push/subscribe', 'Push subscribe', 'HAYIR'],
      ['POST', '/api/push/send', tr('Push bildirim gonder'), 'HAYIR'],
      ['POST', '/api/calendar-notify', tr('Ders hatirlatma'), 'HAYIR'],
      ['POST', '/api/cron/badge-notify', tr('Rozet bildirimi (cron)'), 'HAYIR'],
      ['POST', '/api/cron/check-packages', 'Paket kontrol (cron)', 'HAYIR'],
      ['POST', '/api/cron/nutrition-reminder', 'Beslenme hatirlatma (cron)', 'HAYIR'],
      ['POST', '/api/cron/weekly-report', 'Haftalik rapor (cron)', 'HAYIR'],
      ['POST', '/api/cron/trainer-nutrition-summary', tr('Antrenor beslenme ozeti'), 'HAYIR'],
    ],
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 7.5 },
    alternateRowStyles: { fillColor: [238, 242, 255] },
    columnStyles: {
      0: { cellWidth: 15, fontStyle: 'bold' },
      1: { cellWidth: 52 },
      2: { cellWidth: 55 },
      3: { cellWidth: 'auto', halign: 'center' },
    },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 3) {
        const val = data.cell.raw
        if (val === tr('EVET (limit)')) {
          data.cell.styles.textColor = [22, 163, 74]
          data.cell.styles.fontStyle = 'bold'
        } else if (val === 'HAYIR') {
          data.cell.styles.textColor = [220, 38, 38]
        }
      }
    },
  })

  y = (doc as any).lastAutoTable.finalY + 15

  // ========================================
  // SAYFA: PT IHTIYAC ANALIZI
  // ========================================
  doc.addPage()
  y = 20

  addTitle('6. Personal Trainer Ihtiyac Analizi')
  y += 3
  addText('Bir personal trainer icin en kritik ozellikler, oncelik sirasina gore:')
  y += 5

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Oncelik', tr('Ozellik'), tr('Neden Onemli'), tr('Mevcut Plan')]],
    body: [
      [tr('KRITIK'), tr('Danisan Yonetimi'), tr('PT\'nin ana isi - danisanlari takip etmek'), tr('Tum planlar (limitli)')],
      [tr('KRITIK'), 'Antrenman Programi', tr('Her PT program yazmali, cekirdek ozellik'), tr('Tum planlar')],
      [tr('KRITIK'), tr('Ders Takibi + Takvim'), tr('Gunluk is akisinin temeli, randevu yonetimi'), tr('Takvim plana dahil degil!')],
      [tr('KRITIK'), 'Paket Yonetimi', tr('Gelir modeli - ders paketi satisi'), tr('Tum planlar')],
      [tr('YUKSEK'), tr('Olcum + Ilerleme'), tr('Danisan motivasyonu ve profesyonellik gostergesi'), tr('Temel: tum, grafik: Pro+')],
      [tr('YUKSEK'), 'Beslenme Takibi', tr('Cogu PT beslenme tavsiyeleri de veriyor'), tr('Pro+')],
      [tr('YUKSEK'), 'Push Bildirimler', tr('Danisan ile iletisim, hatirlatmalar'), tr('Pro+ (enforce yok)')],
      [tr('YUKSEK'), tr('Finans Ekrani'), tr('Gelir takibi, odemeler, profesyonel isletme'), tr('Pro+ (enforce yok)')],
      ['ORTA', tr('Haftalik Raporlar'), tr('Danisan ilerleme ozeti, profesyonel dokunustur'), tr('Pro+ (enforce yok)')],
      ['ORTA', 'Rozet Sistemi', tr('Danisan motivasyonu, gamification'), tr('Elite (enforce yok)')],
      ['ORTA', tr('Ilerleme Fotolari'), tr('Before/after karti, danisan motivasyonu'), tr('Elite (enforce yok)')],
      ['ORTA', 'PDF Rapor', tr('Profesyonel rapor sunumu'), tr('Plana dahil degil')],
      [tr('DUSUK'), tr('Bagli Uyeler'), tr('Nis ozellik - aileler icin'), tr('Elite')],
      [tr('DUSUK'), tr('Instagram Karti'), tr('Marketing araci, sosyal medya paylasimi'), tr('Elite (implement yok)')],
      [tr('DUSUK'), 'Finans Tahmini', tr('Ileri analiz, buyuk isletmeler icin'), tr('Elite (implement yok)')],
    ],
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 65 },
      3: { cellWidth: 'auto' },
    },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 0) {
        const val = data.cell.raw
        if (val === tr('KRITIK')) data.cell.styles.textColor = [220, 38, 38]
        else if (val === tr('YUKSEK')) data.cell.styles.textColor = [234, 88, 12]
        else if (val === 'ORTA') data.cell.styles.textColor = [202, 138, 4]
        else if (val === tr('DUSUK')) data.cell.styles.textColor = [107, 114, 128]
      }
    },
  })

  y = (doc as any).lastAutoTable.finalY + 15

  // ========================================
  // SAYFA: ONERILEN YENI PAKET DAGITIMI
  // ========================================
  doc.addPage()
  y = 20

  addTitle('7. Onerilen Yeni Paket Dagitimi')
  y += 3
  addText('Asagida 3 farkli yaklasim sunulmaktadir. Her birinin avantaj ve dezavantajlari vardir.')
  y += 8

  // YAKLASIM A
  addSubtitle('Yaklasim A: "Dene ve Begen" (Onerilir)')
  y += 1
  addText('Free paketi gercekten kullanilabilir yap. PT uygulmayi sevsin, daha fazla danisan icin upgrade etsin.')
  y += 3

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Ozellik', 'FREE (3)', 'PRO (15)', 'ELITE (Sinirsiz)']],
    body: [
      // CORE
      [{ content: 'CORE OZELLIKLER', colSpan: 4, styles: { fillColor: [17, 24, 39], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 } }],
      [tr('Danisan Ekleme + Davet'), 'ACIK (3)', 'ACIK (15)', 'ACIK (Sinirsiz)'],
      ['Antrenman Programi', 'ACIK', 'ACIK', 'ACIK'],
      [tr('Ders Takibi (Manuel)'), 'ACIK', 'ACIK', 'ACIK'],
      ['Paket Yonetimi', 'ACIK', 'ACIK', 'ACIK'],
      [tr('Temel Olcum (kilo, boy)'), 'ACIK', 'ACIK', 'ACIK'],
      [tr('PT Handle (public profil)'), 'ACIK', 'ACIK', 'ACIK'],
      ['Onboarding + Tour', 'ACIK', 'ACIK', 'ACIK'],
      [tr('Egzersiz Autocomplete'), 'ACIK', 'ACIK', 'ACIK'],

      // TAKVIM & PLANLAMA
      [{ content: 'TAKVIM & PLANLAMA', colSpan: 4, styles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 } }],
      [tr('Takvim (goruntulemek)'), 'ACIK', 'ACIK', 'ACIK'],
      [tr('Takvimden Ders Ekle/Sil'), 'KAPALI', 'ACIK', 'ACIK'],
      [tr('Ders Hatirlatma Bildirimi'), 'KAPALI', 'ACIK', 'ACIK'],

      // OLCUM & ILERLEME
      [{ content: tr('OLCUM & ILERLEME'), colSpan: 4, styles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 } }],
      [tr('Detayli Olcum (12 alan)'), 'KAPALI', 'ACIK', 'ACIK'],
      [tr('Olcum Grafikleri + Trend'), 'KAPALI', 'ACIK', 'ACIK'],
      ['Hedef Belirleme (Goals)', 'KAPALI', 'ACIK', 'ACIK'],
      ['PDF Rapor Export', 'KAPALI', 'ACIK', 'ACIK'],
      [tr('Ilerleme Fotolari'), 'KAPALI', 'KAPALI', 'ACIK'],
      [tr('Foto Karsilastirma (Slider)'), 'KAPALI', 'KAPALI', 'ACIK'],

      // BESLENME
      [{ content: 'BESLENME', colSpan: 4, styles: { fillColor: [234, 88, 12], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 } }],
      [tr('Ogun Plani Olusturma'), 'KAPALI', 'ACIK', 'ACIK'],
      [tr('Ogun Takibi + Foto'), 'KAPALI', 'ACIK', 'ACIK'],
      ['Beslenme Hatirlatma (Cron)', 'KAPALI', 'ACIK', 'ACIK'],

      // ILETISIM & BILDIRIM
      [{ content: tr('ILETISIM & BILDIRIM'), colSpan: 4, styles: { fillColor: [202, 138, 4], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 } }],
      ['Push Bildirimler', 'KAPALI', 'ACIK', 'ACIK'],
      [tr('Haftalik Otomatik Raporlar'), 'KAPALI', 'ACIK', 'ACIK'],
      [tr('Antrenor Beslenme Ozeti'), 'KAPALI', 'ACIK', 'ACIK'],

      // FINANS
      [{ content: 'FINANS', colSpan: 4, styles: { fillColor: [107, 114, 128], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 } }],
      [tr('Finans Ekrani (Gelir Ozeti)'), 'KAPALI', 'ACIK', 'ACIK'],
      ['Finans Tahmini', 'KAPALI', 'KAPALI', 'ACIK'],

      // GAMIFICATION & SOSYAL
      [{ content: 'GAMIFICATION & SOSYAL', colSpan: 4, styles: { fillColor: [147, 51, 234], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 } }],
      ['Rozet Sistemi', 'KAPALI', 'ACIK', 'ACIK'],
      [tr('Instagram Paylasim Karti'), 'KAPALI', 'KAPALI', 'ACIK'],

      // OZEL
      [{ content: tr('OZEL OZELLIKLER'), colSpan: 4, styles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 } }],
      [tr('Bagli Uyeler (Aile)'), 'KAPALI', 'KAPALI', 'ACIK'],
      ['Risk Skoru', 'KAPALI', 'KAPALI', 'ACIK'],
    ],
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 'auto', halign: 'center' },
    },
    didParseCell: (data: any) => {
      if (data.section === 'body') {
        const val = data.cell.raw
        if (typeof val === 'string') {
          if (val === 'ACIK' || val.startsWith('ACIK')) {
            data.cell.styles.textColor = [22, 163, 74]
            data.cell.styles.fontStyle = 'bold'
          } else if (val === 'KAPALI') {
            data.cell.styles.textColor = [220, 38, 38]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      }
    },
  })

  y = (doc as any).lastAutoTable.finalY + 8
  checkPage(30)
  addText('Avantaj: PT uygulmayi denemek icin yeterli ozellik goruyor. 3 danisanla calisiyor, seviyor, "daha fazla danisan icin Pro\'ya geceyim" diyor.')
  addText('Dezavantaj: Free pakette cok ozellik varsa Pro\'ya gecme motivasyonu dusebilir.')

  // ========================================
  // YAKLASIM B
  // ========================================
  doc.addPage()
  y = 20

  addSubtitle('Yaklasim B: "Feature Gate Agresif"')
  y += 1
  addText('Free paketi sadece vitrin yap. PT hemen Pro\'ya gecmek zorunda hissetsin.')
  y += 3

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Ozellik', 'FREE (2)', 'PRO (10)', 'ELITE (Sinirsiz)']],
    body: [
      [tr('Danisan Ekleme'), 'ACIK (2)', 'ACIK (10)', 'ACIK (Sinirsiz)'],
      ['Antrenman Programi', 'ACIK', 'ACIK', 'ACIK'],
      [tr('Ders Takibi (Sadece Manuel)'), 'ACIK', 'ACIK', 'ACIK'],
      ['Paket Yonetimi', 'ACIK', 'ACIK', 'ACIK'],
      ['', '', '', ''],
      ['Takvim', 'KAPALI', 'ACIK', 'ACIK'],
      [tr('Tum Olcumler + Grafik'), 'KAPALI', 'ACIK', 'ACIK'],
      ['Beslenme Takibi', 'KAPALI', 'ACIK', 'ACIK'],
      ['Bildirimler', 'KAPALI', 'ACIK', 'ACIK'],
      [tr('Finans + Raporlar'), 'KAPALI', 'ACIK', 'ACIK'],
      ['Rozet + Goals', 'KAPALI', 'ACIK', 'ACIK'],
      ['PDF Export', 'KAPALI', 'ACIK', 'ACIK'],
      ['', '', '', ''],
      [tr('Ilerleme Fotolari + Slider'), 'KAPALI', 'KAPALI', 'ACIK'],
      [tr('Instagram Karti'), 'KAPALI', 'KAPALI', 'ACIK'],
      ['Finans Tahmini', 'KAPALI', 'KAPALI', 'ACIK'],
      [tr('Bagli Uyeler + Risk'), 'KAPALI', 'KAPALI', 'ACIK'],
    ],
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [220, 38, 38], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [254, 242, 242] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 'auto', halign: 'center' },
    },
    didParseCell: (data: any) => {
      if (data.section === 'body') {
        const val = data.cell.raw
        if (typeof val === 'string') {
          if (val === 'ACIK' || val.startsWith('ACIK')) {
            data.cell.styles.textColor = [22, 163, 74]
            data.cell.styles.fontStyle = 'bold'
          } else if (val === 'KAPALI') {
            data.cell.styles.textColor = [220, 38, 38]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      }
    },
  })

  y = (doc as any).lastAutoTable.finalY + 8
  addText('Avantaj: Pro\'ya gecis motivasyonu yuksek. Gelir daha hizli baslar.')
  addText('Dezavantaj: Free cok kisitli olursa PT uygulamayi denemeden birakabilir. "Bedavada hicbir sey yok" algisi.')

  y += 10

  // YAKLASIM C
  addSubtitle('Yaklasim C: "Hibrit - Sureli Trial"')
  y += 1
  addText('Ilk 14 gun tum Pro ozelliklerini ac (trial). Sonra Free\'ye dusur. PT zaten alistiginda Pro\'ya gecer.')
  y += 3

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['', 'FREE (Trial 14 gun)', 'FREE (Sonrasi)', 'PRO', 'ELITE']],
    body: [
      [tr('Tum Ozellikler'), 'ACIK (14 gun)', tr('Sinirli (3 danisan + core)'), 'ACIK (10)', 'ACIK (Sinirsiz)'],
    ],
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 38, halign: 'center' },
      2: { cellWidth: 42, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 'auto', halign: 'center' },
    },
  })

  y = (doc as any).lastAutoTable.finalY + 8
  addText('Avantaj: En yuksek donusum orani. PT tum ozellikleri deniyor, alistiktan sonra vazgecmek zor.')
  addText('Dezavantaj: Gelistirme eforu en yuksek (trial logic + expire + downgrade akisi gerekiyor).')

  // ========================================
  // SAYFA: SONUC VE AKSIYON PLANI
  // ========================================
  doc.addPage()
  y = 20

  addTitle('8. Sonuc ve Karar Bekleyen Noktalar')
  y += 5

  addSubtitle('8.1 Kesin Yapilmasi Gerekenler')
  y += 2
  addBullet('Feature gating enforce edilmeli - Sidebar, Navbar, API route ve sayfa seviyesinde plan kontrolu eklenmeli')
  addBullet('Takvim ozelligi paket sistemine dahil edilmeli')
  addBullet('Blog, fitness_tools gibi var olmayan feature key\'leri temizlenmeli')
  addBullet('Risk skoru, Instagram karti, finans tahmini ya implement edilmeli ya da plans.ts\'den kaldirilmali')
  addBullet('Cron job\'lar plan bazli filtreleme yapmali (free kullaniciya haftalik rapor gondermesin)')
  y += 3

  addSubtitle('8.2 Senin Kararin Gereken Noktalar')
  y += 2
  addBullet('Yaklasim secimi: A (Dene ve Begen), B (Agresif Gate), C (Trial)?')
  addBullet('Danisan limitleri: Free=3 mi 2 mi? Pro=10 mu 15 mi?')
  addBullet('Rozet sistemi: Pro mu Elite mu? (Danisan motivasyonu icin Pro\'da olmasi mantikli)')
  addBullet('Takvim: Free\'de sadece goruntuleme mi yoksa tamamen kapali mi?')
  addBullet('Finans: Free\'de basit ozet gosterilsin mi yoksa tamamen kapali mi?')
  addBullet('Fiyatlandirma: Pro ve Elite icin aylik TL fiyatlari ne olacak?')
  addBullet('Implement edilmemis ozellikler (risk_score, instagram_card, finance_forecast) yapilacak mi?')
  y += 5

  addSubtitle('8.3 Onerilen Oncelik Sirasi')
  y += 2
  addBullet('1. Paket dagitimina karar ver (bu PDF uzerinden)')
  addBullet('2. Feature gating altyapisini implement et (Sidebar + Navbar + sayfa + API)')
  addBullet('3. Takvim, PDF export, hedef belirleme gibi eksik ozellikleri paketlere ata')
  addBullet('4. Upgrade sayfasini guncelle (yeni ozellik listesi)')
  addBullet('5. Implement edilmemis ozellikleri yap veya kaldir')
  addBullet('6. PayTR fiyatlandirma ve credential entegrasyonu')

  // Footer on all pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(180, 180, 180)
    doc.text(`MEGIN - Paket Analiz Raporu | Sayfa ${i}/${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })
  }

  // Save
  const buffer = doc.output('arraybuffer')
  writeFileSync('/Users/hamzasivrikaya/Projects/Megin/docs/megin-paket-analiz-raporu.pdf', Buffer.from(buffer))
  console.log('PDF olusturuldu: docs/megin-paket-analiz-raporu.pdf')
}

generatePDF()
