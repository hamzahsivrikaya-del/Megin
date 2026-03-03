'use client'

import { useState, useTransition } from 'react'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { ClientGoal, GoalMetricType, Measurement } from '@/lib/types'

const METRIC_LABELS: Record<GoalMetricType, string> = {
  weight: 'Kilo',
  body_fat_pct: 'Yağ Oranı',
  chest: 'Göğüs',
  waist: 'Bel',
  arm: 'Kol',
  leg: 'Bacak',
}

const METRIC_UNITS: Record<GoalMetricType, string> = {
  weight: 'kg',
  body_fat_pct: '%',
  chest: 'cm',
  waist: 'cm',
  arm: 'cm',
  leg: 'cm',
}

// Düşük hedefler (kilo, yağ, bel): mevcut < hedef = ilerleme doğru yönde
// Yüksek hedefler (göğüs, kol, bacak): mevcut > hedef = ilerleme doğru yönde
const LOWER_IS_BETTER: GoalMetricType[] = ['weight', 'body_fat_pct', 'waist']

function isAchieved(metric: GoalMetricType, current: number, target: number): boolean {
  if (LOWER_IS_BETTER.includes(metric)) {
    return current <= target
  }
  return current >= target
}

function calcProgress(metric: GoalMetricType, current: number, target: number, initial?: number): number {
  // Başlangıç değeri yoksa %50'den başla (yönü göster)
  if (initial === undefined || initial === current) {
    return LOWER_IS_BETTER.includes(metric)
      ? current <= target ? 100 : 50
      : current >= target ? 100 : 50
  }

  if (LOWER_IS_BETTER.includes(metric)) {
    // Hedef: düşürmek, başlangıç: initial, hedef: target
    const totalChange = initial - target
    if (totalChange <= 0) return current <= target ? 100 : 0
    const done = initial - current
    return Math.min(100, Math.max(0, Math.round((done / totalChange) * 100)))
  } else {
    // Hedef: yükseltmek
    const totalChange = target - initial
    if (totalChange <= 0) return current >= target ? 100 : 0
    const done = current - initial
    return Math.min(100, Math.max(0, Math.round((done / totalChange) * 100)))
  }
}

interface Props {
  clientId: string
  initialGoals: ClientGoal[]
  latestMeasurement: Measurement | null
}

export default function GoalsManager({ clientId, initialGoals, latestMeasurement }: Props) {
  const [goals, setGoals] = useState<ClientGoal[]>(initialGoals)
  const [selectedMetric, setSelectedMetric] = useState<GoalMetricType>('weight')
  const [targetValue, setTargetValue] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const allMetrics = Object.keys(METRIC_LABELS) as GoalMetricType[]
  const existingMetrics = new Set(goals.map((g) => g.metric_type))

  const metricOptions = allMetrics.map((m) => ({
    value: m,
    label: METRIC_LABELS[m],
  }))

  function getCurrentValue(metric: GoalMetricType): number | null {
    if (!latestMeasurement) return null
    const val = latestMeasurement[metric]
    return typeof val === 'number' ? val : null
  }

  async function handleSave() {
    setError('')
    const val = parseFloat(targetValue)
    if (isNaN(val) || val <= 0) {
      setError('Geçerli bir hedef değeri girin')
      return
    }

    startTransition(async () => {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          metric_type: selectedMetric,
          target_value: val,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setGoals((prev) => {
          const filtered = prev.filter((g) => g.metric_type !== selectedMetric)
          return [...filtered, data.goal]
        })
        setTargetValue('')
      } else {
        const data = await res.json()
        setError(data.error || 'Bir hata oluştu')
      }
    })
  }

  async function handleDelete(metric: GoalMetricType) {
    startTransition(async () => {
      const res = await fetch('/api/goals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          metric_type: metric,
        }),
      })

      if (res.ok) {
        setGoals((prev) => prev.filter((g) => g.metric_type !== metric))
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Mevcut Hedefler */}
      {goals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aktif Hedefler</CardTitle>
          </CardHeader>
          <div className="space-y-5">
            {goals.map((goal) => {
              const current = getCurrentValue(goal.metric_type)
              const achieved = current !== null && isAchieved(goal.metric_type, current, goal.target_value)
              const progress = current !== null
                ? calcProgress(goal.metric_type, current, goal.target_value)
                : null
              const unit = METRIC_UNITS[goal.metric_type]
              const label = METRIC_LABELS[goal.metric_type]

              return (
                <div key={goal.metric_type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{label}</span>
                      {achieved && (
                        <Badge variant="success">Hedefe Ulaşıldı!</Badge>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(goal.metric_type)}
                      disabled={isPending}
                      className="text-xs text-danger hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      Sil
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>
                      Mevcut:{' '}
                      <span className="font-semibold text-text-primary">
                        {current !== null ? `${current} ${unit}` : 'Ölçüm yok'}
                      </span>
                    </span>
                    <span>
                      Hedef:{' '}
                      <span className="font-semibold text-text-primary">
                        {goal.target_value} {unit}
                      </span>
                    </span>
                  </div>

                  {progress !== null && (
                    <div className="space-y-1">
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            achieved ? 'bg-success' : 'bg-primary'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-text-secondary text-right">
                        %{progress} tamamlandı
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      ) : (
        <Card className="text-center py-8">
          <p className="text-text-secondary">Henüz hedef belirlenmemiş.</p>
          <p className="text-sm text-text-tertiary mt-1">Aşağıdan yeni bir hedef ekleyebilirsiniz.</p>
        </Card>
      )}

      {/* Hedef Ekle / Güncelle */}
      <Card>
        <CardHeader>
          <CardTitle>
            {existingMetrics.size > 0 ? 'Hedef Ekle / Güncelle' : 'Yeni Hedef Ekle'}
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Select
            label="Ölçüm Tipi"
            options={metricOptions}
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as GoalMetricType)}
          />

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label={`Hedef Değer (${METRIC_UNITS[selectedMetric]})`}
                type="number"
                step="0.1"
                min="0"
                placeholder={`Ör: ${selectedMetric === 'weight' ? '75' : selectedMetric === 'body_fat_pct' ? '15' : '40'}`}
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                error={error}
              />
            </div>
            <Button
              onClick={handleSave}
              loading={isPending}
              className="mb-[1px]"
            >
              {existingMetrics.has(selectedMetric) ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>

          {existingMetrics.has(selectedMetric) && (
            <p className="text-xs text-warning">
              Bu metrik için zaten bir hedef var. Kaydet&apos;e basarak güncelleyebilirsiniz.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
