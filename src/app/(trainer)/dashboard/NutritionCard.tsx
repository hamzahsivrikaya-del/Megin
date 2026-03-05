'use client'

import { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'

interface MealItem {
  name: string
  completed: boolean
  photoUrl: string | null
}

export interface NutritionSummary {
  clientId: string
  fullName: string
  meals: MealItem[]
  completedCount: number
  totalCount: number
}

export default function NutritionCard({ data, enteredCount }: {
  data: NutritionSummary[]
  enteredCount: number
}) {
  const [expanded, setExpanded] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [photoModal, setPhotoModal] = useState<string | null>(null)

  return (
    <Card className="border-primary/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-1"
      >
        <h3 className="text-lg font-semibold text-text-primary">Bugünkü Beslenme</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary font-medium">
            {enteredCount}/{data.length} girdi
          </span>
          <svg
            className={`w-4 h-4 text-text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && <div className="space-y-1 mt-3">
        {data.map((client) => {
          const pct = client.totalCount > 0 ? (client.completedCount / client.totalCount) * 100 : 0
          const isOpen = openId === client.clientId
          const barColor = pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : pct > 0 ? 'bg-red-500' : 'bg-border'

          return (
            <div key={client.clientId}>
              <button
                onClick={() => setOpenId(isOpen ? null : client.clientId)}
                className="w-full flex items-center gap-3 py-2 px-2 -mx-1 rounded-lg hover:bg-surface-hover active:bg-surface-hover transition-colors"
              >
                <Link
                  href={`/dashboard/clients/${client.clientId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-medium text-text-primary truncate min-w-0 hover:text-primary transition-colors"
                >
                  {client.fullName}
                </Link>
                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden min-w-[60px]">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-text-secondary font-medium whitespace-nowrap">
                  {client.completedCount}/{client.totalCount}
                </span>
                <svg
                  className={`w-4 h-4 text-text-secondary transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="ml-3 mb-2 space-y-1">
                  {client.meals.map((meal, i) => (
                    <div key={i} className="flex items-center gap-2 py-1 px-2 text-sm">
                      <span className={meal.completed ? 'text-emerald-500' : 'text-red-400'}>
                        {meal.completed ? '\u2705' : '\u274C'}
                      </span>
                      <span className="text-text-primary flex-1">{meal.name}</span>
                      {meal.photoUrl && (
                        <button
                          onClick={() => setPhotoModal(meal.photoUrl)}
                          className="flex-shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={meal.photoUrl}
                            alt={meal.name}
                            className="w-8 h-8 rounded object-cover border border-border hover:border-primary transition-colors"
                          />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>}

      {photoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPhotoModal(null)}
        >
          <div className="relative max-w-lg max-h-[80vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoModal}
              alt="Beslenme fotoğrafı"
              className="rounded-xl max-h-[80vh] w-auto object-contain"
            />
            <button
              onClick={() => setPhotoModal(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-surface rounded-full flex items-center justify-center shadow-lg text-text-secondary hover:text-text-primary"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
