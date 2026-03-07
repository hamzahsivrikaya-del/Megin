'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SubscriptionPlan } from '@/lib/types'
import { PlanConfig } from '@/lib/plans'
import Card from '@/components/ui/Card'
import PaymentModal from '@/components/shared/PaymentModal'

interface Props {
  currentPlan: SubscriptionPlan
  plans: Record<SubscriptionPlan, PlanConfig>
}

const PLAN_ORDER: SubscriptionPlan[] = ['free', 'pro', 'elite']

const CHECK_ICON = (
  <svg className="w-4 h-4 mt-0.5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const LOCK_ICON = (
  <svg className="w-4 h-4 mt-0.5 text-text-tertiary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

// Her planın tüm özellikleri (alt planların özellikleri dahil)
const ALL_FEATURES: Record<SubscriptionPlan, string[]> = {
  free: [
    'Danışan ekleme + davet linki (3 limit)',
    'Temel antrenman programı',
    'Ders sayısı takibi',
    'Temel ölçüm (kilo, boy)',
    'PT Handle (public profil)',
  ],
  pro: [
    'Danışan ekleme (10 limit)',
    'Temel antrenman programı',
    'Ders sayısı takibi',
    'PT Handle (public profil)',
    'Ölçüm grafikleri + trend analizi',
    'Beslenme takibi (öğün + foto)',
    'Haftalık otomatik raporlar',
    'Push bildirimler',
    'Finans ekranı (gelir özeti)',
    'Rozet sistemi',
    'Hedef belirleme',
    'PDF rapor export',
  ],
  elite: [
    'Sınırsız danışan',
    'Temel antrenman programı',
    'Ders sayısı takibi',
    'PT Handle (public profil)',
    'Ölçüm grafikleri + trend analizi',
    'Beslenme takibi (öğün + foto)',
    'Haftalık otomatik raporlar',
    'Push bildirimler',
    'Finans ekranı (gelir özeti)',
    'Rozet sistemi',
    'Hedef belirleme',
    'PDF rapor export',
    'Takvim (ders planlama)',
    'İlerleme fotoğrafları + slider',
    'Blog sistemi',
    'Bağlı üye (veli-çocuk)',
    'Risk skoru',
    'Instagram paylaşım kartı',
    'Finans tahmini',
  ],
}

export default function UpgradeClient({ currentPlan, plans }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const searchParams = useSearchParams()
  const paymentStatus = searchParams.get('status')

  const currentIndex = PLAN_ORDER.indexOf(currentPlan)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Planını Yükselt</h1>
        <p className="text-text-secondary text-sm mt-1">
          Mevcut planın: <span className="font-semibold text-text-primary">{plans[currentPlan].name}</span>
        </p>
      </div>

      {/* Ödeme sonucu mesajı */}
      {paymentStatus === 'ok' && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-success font-medium">Ödemen başarıyla tamamlandı! Planın güncelleniyor.</p>
        </div>
      )}
      {paymentStatus === 'fail' && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-danger flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-danger font-medium">Ödeme başarısız oldu. Lütfen tekrar deneyin.</p>
        </div>
      )}

      {/* Plan kartları */}
      <div className="grid md:grid-cols-3 gap-4">
        {PLAN_ORDER.map((planKey, index) => {
          const plan = plans[planKey]
          const isCurrent = planKey === currentPlan
          const isUpgrade = index > currentIndex
          const isHighlighted = planKey === 'pro'

          return (
            <Card
              key={planKey}
              className={`relative flex flex-col ${isHighlighted ? 'ring-2 ring-primary shadow-lg' : ''} ${isCurrent ? 'bg-primary-50' : ''}`}
            >
              {isHighlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  En Popüler
                </div>
              )}

              {/* Plan başlık */}
              <div className="text-center mb-5 pt-1">
                <h3 className="font-display text-xl font-bold uppercase tracking-wide">{plan.name}</h3>
                <div className="mt-3">
                  {plan.price ? (
                    <div>
                      <span className="text-3xl font-bold">{plan.price}₺</span>
                      <span className="text-sm text-text-secondary">/ay</span>
                    </div>
                  ) : planKey === 'free' ? (
                    <span className="text-3xl font-bold">Ücretsiz</span>
                  ) : (
                    <span className="text-sm text-text-tertiary">Fiyat belirlenecek</span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  {plan.clientLimit === -1 ? 'Sınırsız danışan' : `Maks. ${plan.clientLimit} danışan`}
                </p>
              </div>

              {/* Özellikler */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {ALL_FEATURES[planKey].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    {CHECK_ICON}
                    <span className="text-text-primary">{feature}</span>
                  </li>
                ))}
                {/* Kilitli özellikler (sadece free ve pro'da göster) */}
                {planKey === 'free' && (
                  <>
                    <li className="flex items-start gap-2 text-sm opacity-50">
                      {LOCK_ICON}
                      <span>Ölçüm grafikleri</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm opacity-50">
                      {LOCK_ICON}
                      <span>Beslenme takibi</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm opacity-50">
                      {LOCK_ICON}
                      <span>+12 özellik daha</span>
                    </li>
                  </>
                )}
                {planKey === 'pro' && (
                  <>
                    <li className="flex items-start gap-2 text-sm opacity-50">
                      {LOCK_ICON}
                      <span>Takvim (ders planlama)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm opacity-50">
                      {LOCK_ICON}
                      <span>İlerleme fotoğrafları</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm opacity-50">
                      {LOCK_ICON}
                      <span>+5 özellik daha</span>
                    </li>
                  </>
                )}
              </ul>

              {/* CTA */}
              <div className="mt-auto">
                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold text-center">
                    Mevcut Planın
                  </div>
                ) : isUpgrade && plan.price ? (
                  <button
                    onClick={() => setSelectedPlan(planKey)}
                    className={`w-full py-2.5 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                      isHighlighted
                        ? 'bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white shadow-sm hover:shadow-lg hover:shadow-red-500/20'
                        : 'bg-text-primary text-white hover:bg-text-primary/90'
                    }`}
                  >
                    {plan.name}&apos;e Geç
                  </button>
                ) : isUpgrade ? (
                  <div className="w-full py-2.5 rounded-lg bg-border/50 text-text-tertiary text-sm font-medium text-center">
                    Yakında
                  </div>
                ) : null}
              </div>
            </Card>
          )
        })}
      </div>

      {/* PayTR iframe modal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  )
}
