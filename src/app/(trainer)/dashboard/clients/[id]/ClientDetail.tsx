'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import { formatDate, formatDateShort, getPackageStatusLabel, formatPrice } from '@/lib/utils'
import type {
  Client, Package, Measurement, Lesson,
  ClientMeal, MealLog, ProgressPhoto, ClientGoal,
  Gender, SubscriptionPlan,
} from '@/lib/types'
import { hasFeatureAccess } from '@/lib/plans'
import Image from 'next/image'
import MealPlanManager from './MealPlanManager'
import DownloadPDFButton from '@/components/shared/DownloadPDFButton'
import InstagramCard from '@/components/shared/InstagramCard'
import { calculateRiskScore } from '@/lib/risk-score'
import type { RiskResult } from '@/lib/risk-score'

type Tab = 'overview' | 'measurements' | 'packages' | 'lessons' | 'nutrition'

interface DependentInfo {
  id: string
  full_name: string
  avatar_url: string | null
  created_at: string
}

interface Props {
  client: Client
  trainerId: string
  packages: Package[]
  measurements: Measurement[]
  lessons: Lesson[]
  clientMeals: ClientMeal[]
  mealLogs: (MealLog & { client_meal?: ClientMeal | null })[]
  photos: ProgressPhoto[]
  goals: ClientGoal[]
  dependents: DependentInfo[]
  plan: SubscriptionPlan
  trainerName?: string
}

export default function ClientDetail({
  client, trainerId, packages, measurements, lessons,
  clientMeals, mealLogs, photos, goals, dependents, plan, trainerName,
}: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  // Edit member
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: client.full_name,
    phone: client.phone || '',
    gender: (client.gender || '') as '' | Gender,
    is_active: client.is_active,
  })
  const [saving, setSaving] = useState(false)
  const [deletingClient, setDeletingClient] = useState(false)

  // Dependents
  const [showAddDependent, setShowAddDependent] = useState(false)
  const [depName, setDepName] = useState('')
  const [addingDep, setAddingDep] = useState(false)

  async function handleAddDependent() {
    if (depName.trim().length < 2) return
    setAddingDep(true)
    const supabase = createClient()
    const { error } = await supabase.rpc('add_dependent_member', {
      p_parent_id: client.id,
      p_trainer_id: trainerId,
      p_full_name: depName.trim(),
    })
    setAddingDep(false)
    if (!error) {
      setDepName('')
      setShowAddDependent(false)
      router.refresh()
    }
  }

  // Lessons
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null)

  // Packages
  const [deletingPackageId, setDeletingPackageId] = useState<string | null>(null)
  const [togglingPaymentId, setTogglingPaymentId] = useState<string | null>(null)

  // Photos
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0])
  const [photoFiles, setPhotoFiles] = useState<{ front?: File; side?: File; back?: File }>({})
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [deletingPhotoGroup, setDeletingPhotoGroup] = useState<string | null>(null)
  const [selectedPhotoDate, setSelectedPhotoDate] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareDates, setCompareDates] = useState<string[]>([])
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null)

  // Nutrition
  const [editingMealLog, setEditingMealLog] = useState<(MealLog & { client_meal?: ClientMeal | null }) | null>(null)
  const [mealLogForm, setMealLogForm] = useState({ status: '' as string, note: '' })
  const [savingMealLog, setSavingMealLog] = useState(false)
  const [deletingMealLogId, setDeletingMealLogId] = useState<string | null>(null)
  const [selectedNutritionDate, setSelectedNutritionDate] = useState<string | null>(null)

  const meals = clientMeals

  const ANGLE_LABELS: Record<string, string> = { front: 'Ön', side: 'Yan', back: 'Arka' }

  function toggleCompareDate(date: string) {
    setCompareDates((prev) => {
      if (prev.includes(date)) return prev.filter((d) => d !== date)
      if (prev.length >= 2) return [prev[1], date]
      return [...prev, date]
    })
    setSelectedPhotoDate(null)
  }

  const photoGroups = photos.reduce<Record<string, ProgressPhoto[]>>((acc, p) => {
    if (!acc[p.taken_at]) acc[p.taken_at] = []
    acc[p.taken_at].push(p)
    return acc
  }, {})

  const activePackage = packages.find((p) => p.status === 'active')
  const latestMeasurement = measurements[0]
  const groupedByDate = mealLogs.reduce<Record<string, (MealLog & { client_meal?: ClientMeal | null })[]>>((acc, log) => {
    if (!acc[log.date]) acc[log.date] = []
    acc[log.date].push(log)
    return acc
  }, {})
  const initials = client.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  // ── Risk Score ──
  const riskResult: RiskResult | null = useMemo(() => {
    if (!hasFeatureAccess(plan, 'risk_score')) return null

    const now = new Date()

    // lastLessonDaysAgo
    const sortedLessons = [...lessons].sort((a, b) => b.date.localeCompare(a.date))
    const lastLessonDaysAgo = sortedLessons.length > 0
      ? Math.floor((now.getTime() - new Date(sortedLessons[0].date).getTime()) / (1000 * 60 * 60 * 24))
      : 30

    // attendanceRate: lessons in last 28 days / expected (activePackage frequency * 4 weeks, fallback total)
    const fourWeeksAgo = new Date(now)
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    const recentLessons = lessons.filter((l) => new Date(l.date) >= fourWeeksAgo)
    const expectedLessons = activePackage ? Math.max(1, Math.round(activePackage.total_lessons / 4)) : 4
    const attendanceRate = Math.min(1, recentLessons.length / expectedLessons)

    // nutritionCompliance: compliant logs / total logs in last 30 days
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentMealLogs = mealLogs.filter((ml) => new Date(ml.date) >= thirtyDaysAgo)
    const nutritionCompliance = recentMealLogs.length > 0
      ? recentMealLogs.filter((ml) => ml.status === 'compliant').length / recentMealLogs.length
      : 1 // no data = neutral

    // packageProgress
    const packageProgress = activePackage
      ? activePackage.used_lessons / activePackage.total_lessons
      : 0

    return calculateRiskScore({
      lastLessonDaysAgo,
      attendanceRate,
      nutritionCompliance,
      packageProgress,
      streakWeeks: 0,
    })
  }, [lessons, mealLogs, activePackage, plan])

  // ── Handlers ──

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('clients')
      .update({
        full_name: editForm.full_name,
        phone: editForm.phone || null,
        gender: editForm.gender || null,
        is_active: editForm.is_active,
      })
      .eq('id', client.id)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  async function handleDeleteClient() {
    if (!confirm(`"${client.full_name}" adlı danışanı ve tüm kayıtlarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return
    setDeletingClient(true)
    try {
      const res = await fetch(`/api/trainer/clients/${client.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Silinemedi')
        setDeletingClient(false)
        return
      }
      router.push('/dashboard/clients')
    } catch {
      alert('Bağlantı hatası')
      setDeletingClient(false)
    }
  }

  async function handleDeletePackage(packageId: string) {
    if (!confirm('Bu paketi ve bağlı ders kayıtlarını silmek istediğinize emin misiniz?')) return
    setDeletingPackageId(packageId)
    const supabase = createClient()
    const { error } = await supabase.from('packages').delete().eq('id', packageId)
    if (error) alert('Silinemedi: ' + error.message)
    else router.refresh()
    setDeletingPackageId(null)
  }

  async function handleTogglePayment(packageId: string, currentStatus: string) {
    setTogglingPaymentId(packageId)
    const supabase = createClient()
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid'
    const { error } = await supabase.from('packages').update({ payment_status: newStatus }).eq('id', packageId)
    if (error) alert('Güncellenemedi: ' + error.message)
    else router.refresh()
    setTogglingPaymentId(null)
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm('Bu ders kaydını silmek istediğinize emin misiniz?')) return
    setDeletingLessonId(lessonId)
    const supabase = createClient()
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId)
    if (error) alert('Silinemedi: ' + error.message)
    else router.refresh()
    setDeletingLessonId(null)
  }

  async function handlePhotoUpload() {
    const files = Object.entries(photoFiles).filter(([, f]) => f) as [string, File][]
    if (files.length === 0) return

    setUploadingPhotos(true)
    const supabase = createClient()

    for (const [angle, file] of files) {
      const ext = file.name.split('.').pop()
      const path = `${client.id}/${photoDate}_${angle}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(path, file, { upsert: true })

      if (uploadError) continue

      const { data: { publicUrl } } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(path)

      await fetch('/api/progress-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: client.id,
          trainer_id: trainerId,
          photo_url: publicUrl,
          angle,
          taken_at: photoDate,
        }),
      })
    }

    setUploadingPhotos(false)
    setShowPhotoUpload(false)
    setPhotoFiles({})
    router.refresh()
  }

  async function handleDeletePhotoGroup(date: string) {
    setDeletingPhotoGroup(date)
    const group = photoGroups[date]
    for (const photo of group) {
      await fetch('/api/progress-photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photo.id }),
      })
    }
    setDeletingPhotoGroup(null)
    setSelectedPhotoDate(null)
    router.refresh()
  }

  async function handleMealLogUpdate() {
    if (!editingMealLog) return
    setSavingMealLog(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('meal_logs')
      .update({ status: mealLogForm.status, note: mealLogForm.note || null })
      .eq('id', editingMealLog.id)
    if (error) alert('Güncellenemedi: ' + error.message)
    else {
      setEditingMealLog(null)
      router.refresh()
    }
    setSavingMealLog(false)
  }

  async function handleMealLogDelete(logId: string) {
    if (!confirm('Bu beslenme kaydını silmek istediğinize emin misiniz?')) return
    setDeletingMealLogId(logId)
    const supabase = createClient()
    const { error } = await supabase.from('meal_logs').delete().eq('id', logId)
    if (error) alert('Silinemedi: ' + error.message)
    else router.refresh()
    setDeletingMealLogId(null)
  }

  const tabs: { key: Tab; label: string; count?: number; feature?: string }[] = [
    { key: 'overview', label: 'Genel Bakış' },
    { key: 'measurements', label: 'Ölçümler', count: measurements.length },
    { key: 'packages', label: 'Paketler', count: packages.length },
    { key: 'lessons', label: 'Dersler', count: lessons.length },
    { key: 'nutrition', label: 'Beslenme', count: mealLogs.length, feature: 'nutrition' },
  ]

  return (
    <div className="min-h-screen -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">

      {/* ── Hero + Tab bar ── */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Ust satir: Geri + Aksiyonlar */}
          <div className="flex items-center justify-between pt-4 sm:pt-6 pb-4 sm:pb-5">
            <button
              onClick={() => router.push('/dashboard/clients')}
              className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors text-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Danışanlar
            </button>
            <Button variant="secondary" onClick={() => setEditing(true)}>Düzenle</Button>
          </div>

          {/* Uye kimligi */}
          <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-5">
            <div className="relative shrink-0">
              {client.avatar_url ? (
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-border">
                  <Image src={client.avatar_url} alt={client.full_name} width={56} height={56} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/25">
                  <span className="text-base sm:text-lg font-bold text-primary -tracking-wide">{initials}</span>
                </div>
              )}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-surface ${client.is_active ? 'bg-success' : 'bg-text-secondary/40'}`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1">
                <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight truncate">{client.full_name}</h1>
                <Badge variant={client.is_active ? 'success' : 'default'}>
                  {client.is_active ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-xs sm:text-sm text-text-secondary">
                {client.email && <span className="truncate max-w-[180px] sm:max-w-none">{client.email}</span>}
                {client.phone && (
                  <>
                    <span className="text-border">&middot;</span>
                    <span>{client.phone}</span>
                  </>
                )}
                <span className="text-border">&middot;</span>
                <span>Kayıt: {formatDate(client.start_date)}</span>
              </div>
            </div>
          </div>

          {/* Ozet cubuk */}
          {(activePackage || latestMeasurement) && (
            <div className="grid grid-cols-1 sm:grid-cols-none sm:flex sm:flex-wrap gap-3 sm:gap-6 py-3 border-t border-border mb-0.5">
              {activePackage && (
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-1">Aktif Paket</p>
                    <div className="flex items-center gap-2">
                      <div className="w-20 sm:w-[100px] h-1 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(activePackage.used_lessons / activePackage.total_lessons) * 100}%` }}
                        />
                      </div>
                      <span className="text-[13px] font-semibold text-text-primary">
                        {activePackage.used_lessons}/{activePackage.total_lessons}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-1">Bitiş</p>
                    <p className="text-[13px] font-semibold text-text-primary">
                      {formatDate(activePackage.expire_date)}
                    </p>
                  </div>
                </div>
              )}
              {latestMeasurement && (
                <div>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-1">Son Ölçüm</p>
                  <div className="flex items-center gap-2.5 text-[13px] font-semibold">
                    {latestMeasurement.weight && (
                      <span className="text-text-primary">{latestMeasurement.weight} kg</span>
                    )}
                    {latestMeasurement.body_fat_pct && (
                      <span className="text-orange-500">{latestMeasurement.body_fat_pct}% yağ</span>
                    )}
                    <span className="text-[11px] text-text-secondary font-normal">
                      {formatDateShort(latestMeasurement.date)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab bar */}
          <div className="flex gap-0 -mb-px overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const locked = tab.feature && !hasFeatureAccess(plan, tab.feature)
              return (
                <button
                  key={tab.key}
                  onClick={() => !locked && setActiveTab(tab.key)}
                  className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    locked
                      ? 'border-transparent text-text-secondary/40 cursor-not-allowed'
                      : activeTab === tab.key
                        ? 'border-primary text-text-primary cursor-pointer'
                        : 'border-transparent text-text-secondary hover:text-text-primary cursor-pointer'
                  }`}
                  disabled={!!locked}
                >
                  {tab.label}
                  {locked && (
                    <svg className="w-3 h-3 ml-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                  {!locked && tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                        activeTab === tab.key
                          ? 'bg-primary/15 text-primary'
                          : 'bg-surface-hover text-text-secondary'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Tab icerikleri ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* GENEL BAKIS */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Kisisel Bilgiler */}
              <div className="rounded-xl border border-border p-5 bg-surface">
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-4">Kişisel Bilgiler</p>
                <div className="space-y-3">
                  {client.email && (
                    <div>
                      <p className="text-xs text-text-secondary mb-0.5">E-posta</p>
                      <p className="text-sm text-text-primary break-all">{client.email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">Telefon</p>
                    <p className="text-sm text-text-primary">{client.phone || '\u2014'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">Cinsiyet</p>
                    <p className="text-sm text-text-primary">
                      {client.gender === 'male' ? 'Erkek' : client.gender === 'female' ? 'Kadın' : '\u2014'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">Kayıt Tarihi</p>
                    <p className="text-sm text-text-primary">{formatDate(client.start_date)}</p>
                  </div>
                </div>
              </div>

              {/* Aktif Paket */}
              <div className="rounded-xl border border-border p-5 bg-surface">
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-4">Aktif Paket</p>
                {activePackage ? (
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold text-text-primary">
                          {activePackage.total_lessons - activePackage.used_lessons}
                        </p>
                        <p className="text-xs text-text-secondary">kalan ders</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-secondary">{activePackage.used_lessons}/{activePackage.total_lessons}</p>
                        <p className="text-xs text-text-secondary">kullanıldı</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(activePackage.used_lessons / activePackage.total_lessons) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-secondary">Bitiş: {formatDate(activePackage.expire_date)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">Aktif paket yok</p>
                )}
              </div>

              {/* Son Ölçüm */}
              <div className="rounded-xl border border-border p-5 bg-surface">
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-4">Son Ölçüm</p>
                {latestMeasurement ? (
                  <div>
                    <p className="text-xs text-text-secondary mb-3">{formatDate(latestMeasurement.date)}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {latestMeasurement.weight && (
                        <div className="bg-surface-hover rounded-lg p-2.5 border border-border">
                          <p className="text-lg font-bold text-text-primary">{latestMeasurement.weight}</p>
                          <p className="text-[10px] text-text-secondary">kg</p>
                        </div>
                      )}
                      {latestMeasurement.body_fat_pct && (
                        <div className="bg-surface-hover rounded-lg p-2.5 border border-border">
                          <p className="text-lg font-bold text-orange-500">{latestMeasurement.body_fat_pct}%</p>
                          <p className="text-[10px] text-text-secondary">yağ</p>
                        </div>
                      )}
                      {latestMeasurement.waist && (
                        <div className="bg-surface-hover rounded-lg p-2.5 border border-border">
                          <p className="text-lg font-bold text-text-primary">{latestMeasurement.waist}</p>
                          <p className="text-[10px] text-text-secondary">bel cm</p>
                        </div>
                      )}
                      {latestMeasurement.arm && (
                        <div className="bg-surface-hover rounded-lg p-2.5 border border-border">
                          <p className="text-lg font-bold text-text-primary">{latestMeasurement.arm}</p>
                          <p className="text-[10px] text-text-secondary">kol cm</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">Ölçüm yok</p>
                )}
              </div>
            </div>

            {/* Son Dersler ozet */}
            <div className="rounded-xl border border-border p-5 bg-surface">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] text-text-secondary uppercase tracking-widest">Son Dersler</p>
                {lessons.length > 5 && (
                  <button
                    onClick={() => setActiveTab('lessons')}
                    className="text-xs text-primary hover:text-primary-hover transition-colors cursor-pointer"
                  >
                    Tümünü gör &rarr;
                  </button>
                )}
              </div>
              {lessons.length > 0 ? (
                <div className="space-y-0">
                  {lessons.slice(0, 5).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0"
                    >
                      <span className="text-sm text-text-secondary">{formatDate(lesson.date)}</span>
                      {lesson.notes && (
                        <span className="text-sm text-text-secondary truncate max-w-[120px] sm:max-w-[200px]">{lesson.notes}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">Ders kaydı yok</p>
              )}
            </div>

            {/* Hedefler */}
            {goals.length > 0 && (
              <div className="rounded-xl border border-border p-5 bg-surface">
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-4">Hedefler</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {goals.map((goal) => {
                    const labelMap: Record<string, string> = {
                      weight: 'Kilo', body_fat_pct: 'Yağ %', chest: 'Göğüs',
                      waist: 'Bel', arm: 'Kol', leg: 'Bacak',
                    }
                    return (
                      <div key={goal.id} className="bg-surface-hover rounded-lg p-3 border border-border">
                        <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">{labelMap[goal.metric_type] || goal.metric_type}</p>
                        <p className="text-lg font-bold text-primary">{goal.target_value}</p>
                        {goal.achieved_at && (
                          <Badge variant="success" className="mt-1">Ulaşıldı</Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Risk Skoru */}
            {riskResult && (
              <div className="rounded-xl border border-border p-5 bg-surface">
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-4">Risk Skoru</p>
                <div className="flex items-center gap-4 mb-3">
                  <div className={`text-3xl font-bold ${
                    riskResult.level === 'critical' ? 'text-red-600' :
                    riskResult.level === 'high' ? 'text-orange-500' :
                    riskResult.level === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {riskResult.score}
                  </div>
                  <Badge variant={
                    riskResult.level === 'critical' ? 'danger' :
                    riskResult.level === 'high' ? 'warning' :
                    riskResult.level === 'medium' ? 'warning' : 'success'
                  }>
                    {riskResult.level === 'critical' ? 'Kritik' :
                     riskResult.level === 'high' ? 'Yuksek' :
                     riskResult.level === 'medium' ? 'Orta' : 'Dusuk'}
                  </Badge>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${
                      riskResult.level === 'critical' ? 'bg-red-600' :
                      riskResult.level === 'high' ? 'bg-orange-500' :
                      riskResult.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${riskResult.score}%` }}
                  />
                </div>
                {riskResult.factors.length > 0 && (
                  <ul className="space-y-1">
                    {riskResult.factors.map((f, i) => (
                      <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                        <span className="text-text-tertiary mt-0.5">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Bağlı Üyeler */}
            {hasFeatureAccess(plan, 'dependents') && <div className="rounded-xl border border-border p-5 bg-surface">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] text-text-secondary uppercase tracking-widest">Bağlı Üyeler</p>
                <button
                  onClick={() => setShowAddDependent(!showAddDependent)}
                  className="text-xs text-primary font-semibold cursor-pointer hover:underline"
                >
                  + Üye Ekle
                </button>
              </div>

              {showAddDependent && (
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Ad Soyad"
                    value={depName}
                    onChange={(e) => setDepName(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAddDependent} loading={addingDep} disabled={depName.trim().length < 2}>
                    Ekle
                  </Button>
                </div>
              )}

              {dependents.length > 0 ? (
                <div className="space-y-2">
                  {dependents.map((dep) => (
                    <a
                      key={dep.id}
                      href={`/dashboard/clients/${dep.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/20 hover:bg-primary/[0.02] transition-all"
                    >
                      {dep.avatar_url ? (
                        <img src={dep.avatar_url} alt={dep.full_name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {dep.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-text-primary">{dep.full_name}</span>
                      <svg className="w-4 h-4 text-text-tertiary ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
              ) : !showAddDependent && (
                <p className="text-sm text-text-tertiary">Bağlı üye yok</p>
              )}
            </div>}
          </div>
        )}

        {/* OLCUMLER */}
        {activeTab === 'measurements' && (
          <div className="space-y-6">
            {measurements.length > 0 && (
              <div className="flex justify-end gap-2">
                {hasFeatureAccess(plan, 'instagram_card') && measurements.length >= 2 && (
                  <InstagramCard
                    clientName={client.full_name}
                    measurements={measurements}
                    trainerName={trainerName}
                  />
                )}
                <DownloadPDFButton
                  clientName={client.full_name}
                  measurements={measurements}
                />
              </div>
            )}
            {measurements.length > 0 ? (
              <div className="space-y-4">
                {measurements.map((m) => {
                  const hasSkinfold = m.sf_chest || m.sf_abdomen || m.sf_thigh
                  const hasBody = m.weight || m.body_fat_pct || m.chest || m.waist || m.arm || m.leg
                  return (
                    <div key={m.id} className="rounded-xl border border-border bg-surface overflow-hidden">
                      {/* Tarih başlığı */}
                      <div className="px-4 pt-4 pb-2">
                        <p className="text-sm font-medium text-text-primary">{formatDate(m.date)}</p>
                      </div>

                      {/* Vücut ölçüleri */}
                      {hasBody && (
                        <div className="px-4 pb-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {m.weight && (
                              <div className="bg-surface-hover rounded-lg p-2.5 border border-border">
                                <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wide mb-1">Kilo</p>
                                <p className="text-lg font-bold text-text-primary">{m.weight} <span className="text-xs font-normal text-text-tertiary">kg</span></p>
                              </div>
                            )}
                            {m.body_fat_pct && (
                              <div className="bg-primary-50 rounded-lg p-2.5 border border-primary/15">
                                <p className="text-[10px] text-primary/70 font-medium uppercase tracking-wide mb-1">Yağ Oranı</p>
                                <p className="text-lg font-bold text-primary">{m.body_fat_pct}<span className="text-xs font-normal">%</span></p>
                              </div>
                            )}
                            {m.chest && (
                              <div className="bg-surface-hover rounded-lg p-2.5 border border-border">
                                <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wide mb-1">Göğüs</p>
                                <p className="text-lg font-bold text-text-primary">{m.chest} <span className="text-xs font-normal text-text-tertiary">cm</span></p>
                              </div>
                            )}
                            {m.waist && (
                              <div className="bg-surface-hover rounded-lg p-2.5 border border-border">
                                <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wide mb-1">Bel</p>
                                <p className="text-lg font-bold text-text-primary">{m.waist} <span className="text-xs font-normal text-text-tertiary">cm</span></p>
                              </div>
                            )}
                            {m.arm && (
                              <div className="bg-surface-hover rounded-lg p-2.5 border border-border">
                                <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wide mb-1">Kol</p>
                                <p className="text-lg font-bold text-text-primary">{m.arm} <span className="text-xs font-normal text-text-tertiary">cm</span></p>
                              </div>
                            )}
                            {m.leg && (
                              <div className="bg-surface-hover rounded-lg p-2.5 border border-border">
                                <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wide mb-1">Bacak</p>
                                <p className="text-lg font-bold text-text-primary">{m.leg} <span className="text-xs font-normal text-text-tertiary">cm</span></p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skinfold bölümü - Kırmızı ayrı zona */}
                      {hasSkinfold && (
                        <div className="mx-3 mb-3 rounded-lg bg-primary-50 border border-primary/15 p-3">
                          <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-2">Skinfold Kaliper</p>
                          <div className="grid grid-cols-3 gap-2">
                            {m.sf_chest && (
                              <div className="bg-white/70 rounded-md p-2 text-center">
                                <p className="text-base font-bold text-primary">{m.sf_chest}</p>
                                <p className="text-[10px] text-primary/60 font-medium">göğüs mm</p>
                              </div>
                            )}
                            {m.sf_abdomen && (
                              <div className="bg-white/70 rounded-md p-2 text-center">
                                <p className="text-base font-bold text-primary">{m.sf_abdomen}</p>
                                <p className="text-[10px] text-primary/60 font-medium">karın mm</p>
                              </div>
                            )}
                            {m.sf_thigh && (
                              <div className="bg-white/70 rounded-md p-2 text-center">
                                <p className="text-base font-bold text-primary">{m.sf_thigh}</p>
                                <p className="text-[10px] text-primary/60 font-medium">uyluk mm</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-border p-16 text-center bg-surface">
                <p className="text-text-secondary">Henüz ölçüm kaydı yok</p>
              </div>
            )}

            {/* İlerleme Fotoğrafları */}
            {hasFeatureAccess(plan, 'progress_photos') && <div className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">İlerleme Fotoğrafları</p>
                <div className="flex gap-2">
                  {Object.keys(photoGroups).length > 1 && (
                    <button
                      onClick={() => { setCompareMode(!compareMode); setCompareDates([]); setSelectedPhotoDate(null) }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        compareMode ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                    >
                      {compareMode ? 'Karşılaştırmadan Çık' : 'Karşılaştır'}
                    </button>
                  )}
                  <Button size="sm" onClick={() => setShowPhotoUpload(true)}>+ Fotoğraf Ekle</Button>
                </div>
              </div>

              {Object.keys(photoGroups).length > 0 ? (
                <div className="space-y-3">
                  {compareMode && (
                    <p className="text-xs text-primary font-medium">
                      {compareDates.length === 0 ? 'Karşılaştırmak için 2 tarih seçin' :
                       compareDates.length === 1 ? '1 tarih seçili, 1 tane daha seçin' :
                       'Karşılaştırma görüntüleniyor'}
                    </p>
                  )}

                  {/* Tarih grid */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(photoGroups)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([date, groupPhotos]) => {
                        const d = new Date(date)
                        const isSelected = compareMode ? compareDates.includes(date) : selectedPhotoDate === date
                        return (
                          <button
                            key={date}
                            onClick={() => compareMode ? toggleCompareDate(date) : setSelectedPhotoDate(selectedPhotoDate === date ? null : date)}
                            className={`flex flex-col items-center gap-0.5 py-1.5 px-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                              isSelected ? 'ring-2 ring-primary ring-offset-1 bg-primary/5' : 'hover:bg-surface-hover'
                            }`}
                          >
                            <span className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold ${
                              isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                            }`}>
                              {d.getDate()}
                            </span>
                            <span className="text-[10px] text-text-secondary">
                              {d.toLocaleDateString('tr-TR', { month: 'short' })}
                            </span>
                            <span className="text-[9px] text-text-secondary">{groupPhotos.length} foto</span>
                          </button>
                        )
                      })}
                  </div>

                  {/* Tek tarih detayi */}
                  {!compareMode && selectedPhotoDate && photoGroups[selectedPhotoDate] && (
                    <div className="rounded-lg border border-border p-3 bg-background animate-fade-in">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-text-primary">{formatDate(selectedPhotoDate)}</h3>
                        <button
                          onClick={() => handleDeletePhotoGroup(selectedPhotoDate)}
                          disabled={deletingPhotoGroup === selectedPhotoDate}
                          className="text-xs text-danger hover:text-red-700 cursor-pointer disabled:opacity-50"
                        >
                          {deletingPhotoGroup === selectedPhotoDate ? '...' : 'Sil'}
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {photoGroups[selectedPhotoDate].map((photo) => (
                          <button key={photo.id} onClick={() => setLightboxPhoto(photo.photo_url)} className="aspect-[3/4] rounded-lg overflow-hidden bg-surface-hover relative cursor-pointer">
                            <Image src={photo.photo_url} alt="" fill className="object-cover" sizes="(max-width: 768px) 33vw, 150px" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Karşılaştırma gorunumu */}
                  {compareMode && compareDates.length === 2 && (() => {
                    const [d1, d2] = [...compareDates].sort((a, b) => a.localeCompare(b))
                    return (
                      <div className="rounded-lg border border-border overflow-hidden bg-background animate-fade-in">
                        <div className="px-3 py-2 flex items-center justify-between border-b border-border">
                          <span className="text-xs font-semibold text-text-secondary">{formatDate(d1)}</span>
                          <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Karşılaştırma</span>
                          <span className="text-xs font-semibold text-text-secondary">{formatDate(d2)}</span>
                        </div>
                        {(['front', 'side', 'back'] as const).map((angle) => {
                          const p1 = photoGroups[d1]?.find((p) => p.angle === angle)
                          const p2 = photoGroups[d2]?.find((p) => p.angle === angle)
                          if (!p1 && !p2) return null
                          return (
                            <div key={angle} className="grid grid-cols-2 gap-[1px] bg-border">
                              <button onClick={() => p1 && setLightboxPhoto(p1.photo_url)} className="bg-surface relative aspect-[3/4] cursor-pointer">
                                {p1 ? <Image src={p1.photo_url} alt="" fill className="object-cover" sizes="50vw" /> : <div className="flex items-center justify-center h-full text-text-secondary text-xs">-</div>}
                              </button>
                              <button onClick={() => p2 && setLightboxPhoto(p2.photo_url)} className="bg-surface relative aspect-[3/4] cursor-pointer">
                                {p2 ? <Image src={p2.photo_url} alt="" fill className="object-cover" sizes="50vw" /> : <div className="flex items-center justify-center h-full text-text-secondary text-xs">-</div>}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <p className="text-sm text-text-secondary text-center py-6">Henüz ilerleme fotoğrafı yok</p>
              )}
            </div>}
          </div>
        )}

        {/* PAKETLER */}
        {activeTab === 'packages' && (
          <div className="space-y-3">
            {packages.length > 0 ? (
              packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-xl border p-5 bg-surface ${
                    pkg.status === 'active' ? 'border-primary/25' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-text-primary">{pkg.total_lessons} Ders Paketi</p>
                      <p className="text-xs text-text-secondary mt-0.5">{formatDate(pkg.start_date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={pkg.status === 'active' ? 'success' : pkg.status === 'expired' ? 'danger' : 'default'}
                      >
                        {getPackageStatusLabel(pkg.status)}
                      </Badge>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        disabled={deletingPackageId === pkg.id}
                        title="Paketi sil"
                        className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-all cursor-pointer disabled:opacity-40"
                      >
                        {deletingPackageId === pkg.id ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {pkg.price !== null && (
                    <div className="flex items-center justify-between mb-3 p-2.5 rounded-lg bg-background">
                      <span className="text-sm font-medium">{formatPrice(pkg.price)}</span>
                      <button
                        onClick={() => handleTogglePayment(pkg.id, pkg.payment_status)}
                        disabled={togglingPaymentId === pkg.id}
                        className="cursor-pointer disabled:opacity-50"
                      >
                        <Badge variant={pkg.payment_status === 'paid' ? 'success' : 'danger'}>
                          {togglingPaymentId === pkg.id ? '...' : pkg.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                        </Badge>
                      </button>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-text-secondary">
                      <span>{pkg.used_lessons} kullanıldı</span>
                      <span>{pkg.total_lessons - pkg.used_lessons} kalan</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pkg.status === 'active' ? 'bg-primary' : 'bg-text-secondary/40'}`}
                        style={{ width: `${(pkg.used_lessons / pkg.total_lessons) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-secondary">Bitiş: {formatDate(pkg.expire_date)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-border p-16 text-center bg-surface">
                <p className="text-text-secondary">Paket geçmişi yok</p>
              </div>
            )}
          </div>
        )}

        {/* DERSLER */}
        {activeTab === 'lessons' && (
          <div className="rounded-xl border border-border overflow-hidden bg-surface">
            {lessons.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-3 sm:px-5 py-3 text-[10px] text-text-secondary uppercase tracking-widest font-medium">
                      Tarih
                    </th>
                    <th className="text-left px-3 sm:px-5 py-3 text-[10px] text-text-secondary uppercase tracking-widest font-medium">
                      Not
                    </th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson, i) => (
                    <tr
                      key={lesson.id}
                      className={i < lessons.length - 1 ? 'border-b border-border/50' : ''}
                    >
                      <td className="px-3 sm:px-5 py-3 text-text-secondary whitespace-nowrap">{formatDate(lesson.date)}</td>
                      <td className="px-3 sm:px-5 py-3 text-text-secondary truncate max-w-[150px] sm:max-w-none">{lesson.notes || '\u2014'}</td>
                      <td className="px-2 py-3">
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          disabled={deletingLessonId === lesson.id}
                          title="Dersi sil"
                          className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-all cursor-pointer disabled:opacity-40"
                        >
                          {deletingLessonId === lesson.id ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center">
                <p className="text-text-secondary">Ders kaydı yok</p>
              </div>
            )}
          </div>
        )}

        {/* BESLENME */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4">
            <MealPlanManager
              clientId={client.id}
              trainerId={trainerId}
              initialMeals={clientMeals}
              initialNutritionNote={client.nutrition_note}
            />

            {/* Beslenme gecmisi */}
            {mealLogs.length > 0 ? (
              <>
                <div className="rounded-xl border border-border p-4 bg-surface">
                  <h4 className="text-sm font-medium text-text-secondary mb-3">Beslenme Geçmişi</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.entries(groupedByDate).map(([date]) => {
                      const dayLogs = groupedByDate[date]
                      const dayNormal = dayLogs.filter(l => !l.is_extra)
                      const dayHasExtra = dayLogs.some(l => l.is_extra)
                      const dayCompleted = dayNormal.length
                      const dayTotal = meals.length
                      const ratio = dayTotal > 0 ? dayCompleted / dayTotal : 0
                      const isSelected = selectedNutritionDate === date
                      const d = new Date(date + 'T00:00:00')
                      const gridColor = ratio >= 1 ? 'bg-success/20 text-success ring-1 ring-success/30'
                        : ratio >= 0.5 ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300/50'
                        : dayCompleted > 0 ? 'bg-red-100 text-red-600 ring-1 ring-red-300/50'
                        : 'bg-border text-text-secondary'

                      return (
                        <button
                          key={date}
                          onClick={() => setSelectedNutritionDate(isSelected ? null : date)}
                          className={`relative flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition-all cursor-pointer hover:bg-surface-hover ${
                            isSelected ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''
                          }`}
                        >
                          <span className="text-[11px] text-text-secondary font-medium">{d.toLocaleDateString('tr-TR', { weekday: 'short' }).slice(0, 3)}</span>
                          <span className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold ${gridColor}`}>
                            {d.getDate()}
                          </span>
                          <span className="text-[10px] text-text-secondary">{dayCompleted}/{dayTotal}</span>
                          {dayHasExtra && (
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 border border-white" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Secili gun detayi */}
                {selectedNutritionDate && groupedByDate[selectedNutritionDate] && (() => {
                  const dayLogs = groupedByDate[selectedNutritionDate]
                  const dayNormal = dayLogs.filter(l => !l.is_extra)
                  const dayExtra = dayLogs.filter(l => l.is_extra)
                  const dayCompleted = dayNormal.length
                  const dayTotal = meals.length
                  const dayPct = dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0
                  const progressColor = dayPct >= 100 ? 'var(--color-success)' : dayPct >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'

                  return (
                    <div className="rounded-xl border border-border p-4 bg-surface space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-text-secondary">
                          {new Date(selectedNutritionDate + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                        </h4>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          dayPct >= 80 ? 'bg-green-100 text-green-700' :
                          dayPct >= 50 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {dayCompleted}/{dayTotal} tamamlandı
                        </span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${dayPct}%`, backgroundColor: progressColor }} />
                      </div>
                      <div className="space-y-2">
                        {meals.map((meal) => {
                          const log = dayNormal.find(l => l.meal_id === meal.id)
                          return (
                            <div key={meal.id} className={`p-3 rounded-lg border ${
                              log ? 'bg-green-50 border-green-200' : 'bg-surface border-border'
                            }`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {log ? (
                                    <div className="w-5 h-5 rounded-md bg-success flex items-center justify-center flex-shrink-0">
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-md border-2 border-border flex-shrink-0" />
                                  )}
                                  <span className={`text-sm font-medium break-words ${log ? 'text-text-primary' : 'text-text-secondary'}`}>{meal.name}</span>
                                </div>
                                {log && (
                                  <div className="flex gap-0.5 flex-shrink-0">
                                    <button
                                      onClick={() => {
                                        setEditingMealLog(log as MealLog & { client_meal?: ClientMeal | null })
                                        setMealLogForm({ status: log.status, note: log.note || '' })
                                      }}
                                      className="p-1 rounded-md bg-white/80 text-text-secondary hover:text-primary hover:bg-white transition-all cursor-pointer"
                                      title="Düzenle"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleMealLogDelete(log.id)}
                                      disabled={deletingMealLogId === log.id}
                                      className="p-1 rounded-md bg-white/80 text-text-secondary hover:text-danger hover:bg-white transition-all cursor-pointer disabled:opacity-40"
                                      title="Sil"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                              {log?.note && (
                                <p className="text-sm text-text-secondary mt-1.5 ml-7 whitespace-pre-wrap">{log.note}</p>
                              )}
                              {log?.photo_url && (
                                <button onClick={() => setLightboxPhoto(log.photo_url!)} className="block mt-2 ml-7 cursor-pointer">
                                  <img src={log.photo_url} alt={meal.name} className="rounded-lg w-full max-h-64 object-cover hover:opacity-90 transition-opacity" />
                                </button>
                              )}
                            </div>
                          )
                        })}
                        {dayExtra.map((log) => (
                          <div key={log.id} className="p-3 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-start gap-2">
                                  <span className="text-sm font-medium break-words">{log.extra_name || 'Ekstra Öğün'}</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 bg-amber-100 text-amber-700">
                                    Ekstra
                                  </span>
                                </div>
                                {log.note && (
                                  <p className="text-sm text-text-secondary mt-1.5 whitespace-pre-wrap">{log.note}</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleMealLogDelete(log.id)}
                                disabled={deletingMealLogId === log.id}
                                className="p-1 rounded-md bg-white/80 text-text-secondary hover:text-danger hover:bg-white transition-all cursor-pointer disabled:opacity-40 flex-shrink-0"
                                title="Sil"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </>
            ) : (
              <div className="text-center py-12 text-text-secondary">
                <p className="text-lg">Henüz beslenme kaydı yok</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Fotoğraf Yükleme Modal ── */}
      <Modal open={showPhotoUpload} onClose={() => setShowPhotoUpload(false)} title="İlerleme Fotoğrafı Ekle">
        <div className="space-y-4">
          <Input
            label="Tarih"
            type="date"
            value={photoDate}
            onChange={(e) => setPhotoDate(e.target.value)}
          />
          {(['front', 'side', 'back'] as const).map((angle) => (
            <div key={angle}>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {ANGLE_LABELS[angle]} Fotoğraf
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 15 * 1024 * 1024) {
                      alert('Dosya boyutu en fazla 15MB olmalıdır')
                      return
                    }
                    setPhotoFiles((prev) => ({ ...prev, [angle]: file }))
                  }
                }}
                className="w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
              />
              {photoFiles[angle] && (
                <p className="text-xs text-primary mt-1">{photoFiles[angle]!.name}</p>
              )}
            </div>
          ))}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowPhotoUpload(false)}>İptal</Button>
            <Button
              loading={uploadingPhotos}
              onClick={handlePhotoUpload}
              disabled={!photoFiles.front && !photoFiles.side && !photoFiles.back}
            >
              Yükle
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Duzenleme Modal ── */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Danışan Düzenle">
        <div className="space-y-4">
          <Input
            label="Ad Soyad"
            value={editForm.full_name}
            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
          />
          <Input
            label="Telefon"
            type="tel"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          />
          <Select
            label="Cinsiyet"
            value={editForm.gender}
            onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as '' | Gender })}
            options={[
              { value: '', label: 'Seçiniz' },
              { value: 'male', label: 'Erkek' },
              { value: 'female', label: 'Kadın' },
            ]}
          />
          <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
            <div>
              <p className="text-sm font-medium text-text-primary">Danışan Durumu</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {editForm.is_active ? 'Danışan aktif' : 'Danışan pasif'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                editForm.is_active ? 'bg-green-500' : 'bg-border'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                editForm.is_active ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setEditing(false)}>İptal</Button>
            <Button loading={saving} onClick={handleSave}>Kaydet</Button>
          </div>
          <div className="pt-4 mt-4 border-t border-border">
            <button
              onClick={handleDeleteClient}
              disabled={deletingClient}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-danger bg-danger/5 hover:bg-danger/10 transition-colors cursor-pointer disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {deletingClient ? 'Siliniyor...' : 'Danışanı Sil'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Beslenme Kaydi Duzenleme Modal ── */}
      <Modal open={!!editingMealLog} onClose={() => setEditingMealLog(null)} title="Beslenme Kaydı Düzenle">
        {editingMealLog && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-secondary mb-1">Öğün</p>
              <p className="text-sm font-medium">{editingMealLog.client_meal?.name || 'Bilinmeyen'}</p>
            </div>
            <Select
              label="Durum"
              value={mealLogForm.status}
              onChange={(e) => setMealLogForm({ ...mealLogForm, status: e.target.value })}
              options={[
                { value: 'compliant', label: 'Uyumlu' },
                { value: 'non_compliant', label: 'Uyulmadı' },
              ]}
            />
            <Input
              label="Not"
              value={mealLogForm.note}
              onChange={(e) => setMealLogForm({ ...mealLogForm, note: e.target.value })}
              placeholder="İsteğe bağlı not"
            />
            {editingMealLog.photo_url && (
              <div>
                <p className="text-xs text-text-secondary mb-1">Fotoğraf</p>
                <img src={editingMealLog.photo_url} alt="" className="rounded-lg w-full h-40 object-cover" />
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setEditingMealLog(null)}>İptal</Button>
              <Button loading={savingMealLog} onClick={handleMealLogUpdate}>Kaydet</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center" onClick={() => setLightboxPhoto(null)}>
          <button onClick={() => setLightboxPhoto(null)} className="absolute top-4 right-4 text-white/80 hover:text-white z-10 cursor-pointer">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="relative w-full h-full max-w-lg max-h-[85vh] mx-4">
            <Image src={lightboxPhoto} alt="" fill className="object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </div>
  )
}
