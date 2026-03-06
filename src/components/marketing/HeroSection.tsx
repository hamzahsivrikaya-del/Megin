'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useCountUp } from '@/lib/hooks/useCountUp'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface HeroSectionProps {
  t: MarketingTranslations
  locale?: 'en' | 'tr'
}

/* -- Counter Strip -- */
function CounterStrip({ locale }: { locale: 'en' | 'tr' }) {
  const trainers = useCountUp(1000, { duration: 2000, suffix: '+' })
  const rating = useCountUp(4.9, { duration: 2000, decimals: 1 })
  const retention = useCountUp(98, { duration: 2000, suffix: '%' })

  const labels =
    locale === 'tr'
      ? ['Antrenör', 'Puan', 'Tutma Oranı']
      : ['Trainers', 'Rating', 'Retention']

  const items = [
    { ref: trainers.ref, value: trainers.value, label: labels[0] },
    { ref: rating.ref, value: rating.value, label: labels[1] },
    { ref: retention.ref, value: retention.value, label: labels[2] },
  ]

  return (
    <div className="mt-14 flex items-center justify-center gap-6 sm:gap-12 animate-fade-up delay-400">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-6 sm:gap-12">
          {i > 0 && (
            <div className="h-10 sm:h-12 w-px bg-gradient-to-b from-transparent via-[#E5E7EB] to-transparent" aria-hidden="true" />
          )}
          <div className="text-center">
            <span
              ref={item.ref}
              className="block font-display text-3xl sm:text-5xl font-bold text-[#0A0A0A] leading-none tracking-tight"
            >
              {item.value}
            </span>
            <span className="block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-[#9CA3AF] mt-2">
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* -- Dashboard Mockup: Desktop Admin + Phone Member -- */
function DashboardMockup({ locale }: { locale: 'en' | 'tr' }) {
  const isTr = locale === 'tr'

  /* ── Admin panel data ── */
  const statCards = [
    { label: isTr ? 'Aktif Üyeler' : 'Active Members', value: '12', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: isTr ? 'Bu Hafta Ders' : 'This Week', value: '18', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: isTr ? 'Bugün' : 'Today', value: '4', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ]
  const todaySchedule = [
    { name: 'Ali K.', time: '09:00' },
    { name: 'Selin M.', time: '11:30' },
    { name: 'Burak T.', time: '14:00' },
    { name: 'Zeynep A.', time: '16:30' },
  ]
  const alerts = [
    { name: 'Burak T.', badge: isTr ? 'Son 2 Ders' : 'Last 2', variant: 'warning' as const },
    { name: 'Deniz Y.', badge: isTr ? 'Paket Bitti' : 'Expired', variant: 'danger' as const },
  ]
  const sidebarItems = [
    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Dashboard', active: true },
    { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: isTr ? 'Takvim' : 'Calendar', active: false },
    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: isTr ? 'Üyeler' : 'Members', active: false },
    { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: isTr ? 'Ölçümler' : 'Metrics', active: false },
  ]

  /* ── PT Mobile phone data ── */
  const mobileSchedule = [
    { name: 'Ali K.', time: '09:00', done: true },
    { name: 'Selin M.', time: '11:30', done: true },
    { name: 'Burak T.', time: '14:00', done: false },
    { name: 'Zeynep A.', time: '16:30', done: false },
  ]
  const quickActions = [
    { label: isTr ? 'Ders Ekle' : 'Add Lesson', icon: 'M12 6v12m6-6H6' },
    { label: isTr ? 'Ölçüm' : 'Measure', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: isTr ? 'Bildirim' : 'Notify', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { label: isTr ? 'Üyeler' : 'Members', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  ]
  const completedLessons = mobileSchedule.filter(s => s.done).length

  /* ── Helper: avatar initials ── */
  const initials = (name: string) => name.split(' ').map(n => n[0]).join('')

  return (
    <div className="mt-16 sm:mt-20 max-w-6xl mx-auto animate-fade-up delay-500">
      <div className="flex items-center justify-center gap-3 sm:gap-5">

        {/* ═══════ DESKTOP: Admin Panel (laptop frame) ═══════ */}
        <div className="relative flex-1 max-w-[680px] animate-float-mockup">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#DC2626]/[0.05] via-transparent to-[#F97316]/[0.05] rounded-3xl blur-2xl pointer-events-none" />

          <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-2xl shadow-black/8">
            {/* Browser bar */}
            <div className="h-7 sm:h-8 bg-gradient-to-r from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex items-center px-3 sm:px-4 gap-1.5">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#EF4444]/60" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#F59E0B]/60" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#22C55E]/60" />
              <span className="ml-2 text-[8px] sm:text-[10px] text-white/30 font-mono">megin.io/admin</span>
            </div>

            <div className="flex bg-[#FAFAFA]">
              {/* Sidebar */}
              <div className="hidden sm:flex flex-col w-32 bg-white border-r border-[#E5E7EB] py-3 px-2 shrink-0">
                <div className="flex items-center gap-1.5 px-2 mb-4">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#DC2626] to-[#F97316] flex items-center justify-center">
                    <span className="text-[7px] font-black text-white">M</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#0A0A0A]">Megin</span>
                </div>
                <div className="space-y-0.5">
                  {sidebarItems.map(item => (
                    <div key={item.label} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[9px] font-medium ${item.active ? 'bg-[#DC2626]/8 text-[#DC2626]' : 'text-[#6B7280]'}`}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-3 sm:p-4 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="text-xs sm:text-sm font-bold text-[#0A0A0A]">Dashboard</h2>
                  <div className="flex items-center gap-1.5">
                    <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white rounded-md text-[8px] font-semibold">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg>
                      {isTr ? 'Ders Ekle' : 'Add Lesson'}
                    </div>
                    <div className="w-5 h-5 rounded-md bg-white border border-[#E5E7EB] flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                  {statCards.map(s => (
                    <div key={s.label} className="bg-white rounded-lg border border-[#E5E7EB] p-2">
                      <p className="text-[7px] sm:text-[8px] font-semibold text-[#9CA3AF] uppercase tracking-wider">{s.label}</p>
                      <p className="text-sm sm:text-lg font-bold text-[#0A0A0A] mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Schedule + Alerts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {/* Schedule */}
                  <div className="bg-white rounded-lg border border-[#E5E7EB] p-2 sm:p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[8px] sm:text-[9px] font-semibold text-[#0A0A0A]">{isTr ? 'Bugünün Programı' : "Today's Schedule"}</p>
                      <span className="text-[7px] text-[#DC2626] font-medium">{isTr ? 'Takvim →' : 'View →'}</span>
                    </div>
                    <div className="space-y-0.5">
                      {todaySchedule.map(s => (
                        <div key={s.name} className="flex items-center justify-between py-1 px-1.5 rounded-md bg-[#FAFAFA]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#0A0A0A] to-[#374151] flex items-center justify-center">
                              <span className="text-[6px] font-bold text-white">{initials(s.name)}</span>
                            </div>
                            <span className="text-[8px] sm:text-[9px] font-medium text-[#0A0A0A]">{s.name}</span>
                          </div>
                          <span className="text-[8px] sm:text-[9px] font-semibold text-[#DC2626]">{s.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alerts */}
                  <div className="bg-white rounded-lg border border-[#E5E7EB] p-2 sm:p-2.5">
                    <p className="text-[8px] sm:text-[9px] font-semibold text-[#0A0A0A] mb-1.5">{isTr ? 'Paket Uyarıları' : 'Alerts'}</p>
                    <div className="space-y-1">
                      {alerts.map(a => (
                        <div key={a.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#0A0A0A] to-[#374151] flex items-center justify-center">
                              <span className="text-[6px] font-bold text-white">{initials(a.name)}</span>
                            </div>
                            <span className="text-[8px] sm:text-[9px] font-medium text-[#0A0A0A]">{a.name}</span>
                          </div>
                          <span className={`text-[7px] font-semibold px-1.5 py-0.5 rounded-full ${a.variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>{a.badge}</span>
                        </div>
                      ))}
                    </div>
                    {/* Nutrition donut */}
                    <div className="mt-2 pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
                      <div>
                        <p className="text-[7px] font-semibold text-[#9CA3AF] uppercase">{isTr ? 'Beslenme Uyumu' : 'Nutrition'}</p>
                        <p className="text-[11px] font-bold text-[#0A0A0A]">87%</p>
                      </div>
                      <div className="w-7 h-7 relative">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#F3F4F6" strokeWidth="3.5" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#22C55E" strokeWidth="3.5" strokeDasharray="76.5 11.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ PHONE: PT Mobile Admin ═══════ */}
        <div className="hidden sm:block relative w-[180px] shrink-0">
          <div className="absolute -inset-3 bg-gradient-to-b from-[#DC2626]/[0.06] to-[#F97316]/[0.06] rounded-[2.5rem] blur-xl pointer-events-none" />

          {/* Phone frame */}
          <div className="relative bg-[#0A0A0A] rounded-[1.8rem] p-[5px] shadow-2xl shadow-black/15">
            {/* Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#0A0A0A] rounded-full z-10" />

            {/* Screen */}
            <div className="bg-white rounded-[1.4rem] overflow-hidden">
              {/* Status bar */}
              <div className="flex items-center justify-between px-4 pt-2 pb-0.5">
                <span className="text-[7px] font-semibold text-[#0A0A0A]">09:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-1.5 border border-[#0A0A0A] rounded-[1.5px] relative">
                    <div className="absolute inset-[1px] right-[2px] bg-[#0A0A0A] rounded-[0.5px]" />
                  </div>
                </div>
              </div>

              {/* App content */}
              <div className="px-2.5 pb-2 pt-1 space-y-1.5">
                {/* Mini header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#DC2626] to-[#F97316] flex items-center justify-center">
                      <span className="text-[6px] font-black text-white">M</span>
                    </div>
                    <span className="text-[9px] font-bold text-[#0A0A0A]">Dashboard</span>
                  </div>
                  <div className="relative">
                    <svg className="w-3.5 h-3.5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#DC2626] rounded-full border border-white" />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-1">
                  {statCards.map(s => (
                    <div key={s.label} className="bg-[#FAFAFA] rounded-lg border border-[#E5E7EB] p-1.5 text-center">
                      <p className="text-xs font-bold text-[#0A0A0A]">{s.value}</p>
                      <p className="text-[6px] text-[#9CA3AF] font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Today's schedule */}
                <div className="bg-[#FAFAFA] rounded-xl p-2 border border-[#E5E7EB]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[8px] font-semibold text-[#0A0A0A]">{isTr ? 'Bugün' : 'Today'}</p>
                    <span className="text-[7px] font-bold text-[#DC2626]">{completedLessons}/{mobileSchedule.length}</span>
                  </div>
                  <div className="space-y-0.5">
                    {mobileSchedule.map(s => (
                      <div key={s.name} className={`flex items-center justify-between py-1 px-1.5 rounded-md ${s.done ? 'bg-emerald-50/60' : 'bg-white'}`}>
                        <div className="flex items-center gap-1">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${s.done ? 'bg-emerald-500' : 'bg-gradient-to-br from-[#0A0A0A] to-[#374151]'}`}>
                            {s.done ? (
                              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <span className="text-[5px] font-bold text-white">{initials(s.name)}</span>
                            )}
                          </div>
                          <span className={`text-[8px] font-medium ${s.done ? 'text-[#9CA3AF] line-through' : 'text-[#0A0A0A]'}`}>{s.name}</span>
                        </div>
                        <span className={`text-[7px] font-semibold ${s.done ? 'text-[#9CA3AF]' : 'text-[#DC2626]'}`}>{s.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-4 gap-1">
                  {quickActions.map(a => (
                    <div key={a.label} className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-1.5 flex flex-col items-center gap-0.5">
                      <div className="w-5 h-5 rounded-full bg-[#DC2626]/8 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
                        </svg>
                      </div>
                      <span className="text-[6px] font-medium text-[#6B7280]">{a.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom nav */}
              <div className="flex items-center justify-around py-1.5 border-t border-[#E5E7EB] bg-white">
                {[
                  { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: true },
                  { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', active: false },
                  { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', active: false },
                  { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', active: false },
                ].map((nav, i) => (
                  <svg key={i} className={`w-3.5 h-3.5 ${nav.active ? 'text-[#DC2626]' : 'text-[#D1D5DB]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={nav.icon} />
                  </svg>
                ))}
              </div>

              {/* Home indicator */}
              <div className="flex justify-center pb-1">
                <div className="w-10 h-1 bg-[#0A0A0A]/20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -- Main Hero -- */
export default function HeroSection({ t, locale = 'en' }: HeroSectionProps) {
  const secondaryCta = locale === 'tr' ? 'Nasıl Çalışır?' : 'See How It Works'

  return (
    <section className="mkt-section pt-32 sm:pt-40 pb-20 sm:pb-28 bg-white relative overflow-hidden">
      {/* Background: subtle radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(220,38,38,0.06),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(249,115,22,0.04),transparent)] pointer-events-none" />

      <div className="mkt-container text-center relative">
        {/* Trust badge */}
        <div className="animate-fade-up mb-8">
          <span className="mkt-trust-badge">
            <span className="mkt-trust-badge-icon">
              <svg viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            {locale === 'tr' ? '5 danışana kadar tamamen ücretsiz' : 'Free forever for up to 5 clients'}
          </span>
        </div>

        {/* Main heading */}
        <h1 className="mkt-heading-xl text-[clamp(2.8rem,8vw,6rem)] leading-[0.9] animate-fade-up delay-100">
          <span className="text-[#0A0A0A] block">{t.hero.title1}</span>
          <span className="text-gradient block mt-1 sm:mt-2">{t.hero.title2}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-[#6B7280] max-w-2xl mx-auto mt-8 sm:mt-10 leading-relaxed animate-fade-up delay-200">
          {t.hero.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
          <Link href="/signup" className="mkt-cta-gradient mkt-cta-glow">
            {t.hero.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/features" className="mkt-cta-ghost rounded-xl">
            {secondaryCta}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Counter Strip */}
        <CounterStrip locale={locale} />

        {/* Dashboard Mockup */}
        <DashboardMockup locale={locale} />
      </div>
    </section>
  )
}
