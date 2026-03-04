'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import type { GoalMetricType, ClientGoal } from '@/lib/types'

const METRICS: { key: GoalMetricType; label: string; unit: string; color: string }[] = [
  { key: 'weight', label: 'Kilo', unit: 'kg', color: '#DC2626' },
  { key: 'body_fat_pct', label: 'Yağ %', unit: '%', color: '#F97316' },
  { key: 'chest', label: 'Göğüs', unit: 'cm', color: '#F59E0B' },
  { key: 'waist', label: 'Bel', unit: 'cm', color: '#22C55E' },
  { key: 'arm', label: 'Kol', unit: 'cm', color: '#3B82F6' },
  { key: 'leg', label: 'Bacak', unit: 'cm', color: '#8B5CF6' },
]

interface GoalSetterProps {
  clientId: string
  trainerId: string
  goals: ClientGoal[]
  currentValues: Record<string, number | null>
}

export default function GoalSetter({ clientId, trainerId, goals, currentValues }: GoalSetterProps) {
  const router = useRouter()
  const [selectedMetric, setSelectedMetric] = useState<GoalMetricType | null>(null)
  const [targetValue, setTargetValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const selectedGoal = selectedMetric ? goals.find(g => g.metric_type === selectedMetric) : null
  const selectedInfo = selectedMetric ? METRICS.find(m => m.key === selectedMetric) : null
  const currentVal = selectedMetric ? currentValues[selectedMetric] : null

  function openModal(metric: GoalMetricType) {
    const existingGoal = goals.find(g => g.metric_type === metric)
    setSelectedMetric(metric)
    setTargetValue(existingGoal ? String(existingGoal.target_value) : '')
  }

  function closeModal() {
    setSelectedMetric(null)
    setTargetValue('')
  }

  async function handleSave() {
    if (!selectedMetric || !targetValue) return
    setSaving(true)
    const supabase = createClient()

    await supabase
      .from('client_goals')
      .upsert(
        {
          trainer_id: trainerId,
          client_id: clientId,
          metric_type: selectedMetric,
          target_value: Number(targetValue),
          achieved_at: null,
        },
        { onConflict: 'client_id,metric_type' }
      )

    setSaving(false)
    closeModal()
    router.refresh()
  }

  async function handleDelete() {
    if (!selectedGoal) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('client_goals').delete().eq('id', selectedGoal.id)
    setDeleting(false)
    closeModal()
    router.refresh()
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {METRICS.map(({ key, label, unit, color }) => {
          const goal = goals.find(g => g.metric_type === key)
          const current = currentValues[key]
          const hasGoal = !!goal
          const achieved = hasGoal && current !== null && (
            ['weight', 'body_fat_pct', 'waist'].includes(key)
              ? current <= goal.target_value
              : current >= goal.target_value
          )

          return (
            <button
              key={key}
              onClick={() => openModal(key)}
              className="p-3 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-all text-left cursor-pointer"
              style={{
                borderColor: achieved ? 'rgba(34,197,94,0.3)' : hasGoal ? `${color}33` : undefined,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] font-medium text-text-secondary">{label}</span>
              </div>
              {current !== null ? (
                <div className="text-lg font-bold text-text-primary">
                  {current}<span className="text-xs text-text-secondary ml-0.5">{unit}</span>
                </div>
              ) : (
                <div className="text-xs text-text-tertiary">Ölçüm yok</div>
              )}
              {hasGoal ? (
                <div className="mt-1.5">
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: achieved ? '100%' : '50%',
                        backgroundColor: achieved ? '#22c55e' : color,
                      }}
                    />
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: achieved ? '#22c55e' : color }}>
                    {achieved ? 'Hedefe ulaştın!' : `Hedef: ${goal.target_value} ${unit}`}
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-primary mt-1.5 font-medium">
                  Hedef belirle
                </div>
              )}
            </button>
          )
        })}
      </div>

      <Modal
        open={selectedMetric !== null}
        onClose={closeModal}
        title={selectedInfo ? `${selectedInfo.label} Hedefi` : ''}
        size="sm"
      >
        {selectedInfo && (
          <div className="space-y-4">
            {currentVal !== null && (
              <div className="bg-background rounded-lg p-3">
                <span className="text-xs text-text-secondary">Mevcut</span>
                <div className="text-xl font-bold text-text-primary">
                  {currentVal} {selectedInfo.unit}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Hedef Değer ({selectedInfo.unit})
              </label>
              <input
                type="number"
                step="0.1"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder={currentVal ? String(Math.round(currentVal * 0.9 * 10) / 10) : ''}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-text-primary focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                loading={saving}
                disabled={!targetValue || Number(targetValue) <= 0}
                className="flex-1"
              >
                Kaydet
              </Button>
              {selectedGoal && (
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  loading={deleting}
                >
                  Sil
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
