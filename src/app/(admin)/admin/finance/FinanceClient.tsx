'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'

const RevenueChart = dynamic(() => import('./RevenueChart'), { ssr: false })

export interface MonthlyData {
  month: string  // "2026-03"
  revenue: number
  paid: number
  pending: number
  count: number
}

export interface ProjectionMember {
  id: string
  name: string
}

export interface ProjectionMonth {
  month: string
  renewals: number
  revenue: number
  members: ProjectionMember[]
}

export interface RiskReason {
  signal: string
  detail: string
}

export interface RiskMember {
  id: string
  name: string
  level: 'high' | 'medium'
  reasons: RiskReason[]
}

export interface FinanceClientProps {
  monthlyData: MonthlyData[]
  projectionData: ProjectionMonth[]
  riskyMembers: RiskMember[]
}

const MONTH_NAMES = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

export function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`
}

export default function FinanceClient({ monthlyData, projectionData, riskyMembers }: FinanceClientProps) {
  if (monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aylık Gelir</CardTitle>
        </CardHeader>
        <p className="text-sm text-text-secondary">Henüz paket verisi yok</p>
      </Card>
    )
  }

  // Chart data: reverse monthlyData (oldest first for chart) and map to chart format
  const chartData = [...monthlyData]
    .reverse()
    .map(d => ({
      month: d.month,
      label: formatMonth(d.month),
      revenue: d.revenue as number | null,
      projected: null as number | null,
    }))

  // Add projection data to chart
  const fullChartData = [...chartData]

  // Bridge: last real month also gets projected value (connection point)
  if (fullChartData.length > 0 && projectionData.length > 0) {
    fullChartData[fullChartData.length - 1].projected = fullChartData[fullChartData.length - 1].revenue
  }

  // Add projection months
  for (const proj of projectionData) {
    fullChartData.push({
      month: proj.month,
      label: formatMonth(proj.month),
      revenue: null,
      projected: proj.revenue > 0 ? proj.revenue : null,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gelir Trendi</CardTitle>
        </CardHeader>
        <RevenueChart data={fullChartData} />
      </Card>

      {/* Projeksiyon Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Yenileme Tahmini</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-secondary">
                <th className="pb-3 pr-4 font-medium">Ay</th>
                <th className="pb-3 pr-4 font-medium text-right">Yenileme</th>
                <th className="pb-3 pr-4 font-medium text-right">Beklenen Gelir</th>
                <th className="pb-3 font-medium">Üyeler</th>
              </tr>
            </thead>
            <tbody>
              {projectionData.map((row) => (
                <tr key={row.month} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium text-text-primary whitespace-nowrap">
                    {formatMonth(row.month)}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {row.renewals > 0 ? `${row.renewals} üye` : '\u2014'}
                  </td>
                  <td className="py-3 pr-4 text-right font-medium whitespace-nowrap">
                    {row.revenue > 0 ? `~${formatPrice(row.revenue)}` : '\u2014'}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {row.members.map(m => (
                        <Link
                          key={m.id}
                          href={`/admin/members/${m.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {m.name}
                        </Link>
                      ))}
                      {row.members.length === 0 && <span className="text-text-secondary">{'\u2014'}</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aylık Gelir</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-secondary">
                <th className="pb-3 pr-4 font-medium">Ay</th>
                <th className="pb-3 pr-4 font-medium text-right">Gelir</th>
                <th className="pb-3 pr-4 font-medium text-right">Ödenen</th>
                <th className="pb-3 pr-4 font-medium text-right">Bekleyen</th>
                <th className="pb-3 font-medium text-right">Paket</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row) => (
                <tr key={row.month} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium text-text-primary whitespace-nowrap">
                    {formatMonth(row.month)}
                  </td>
                  <td className="py-3 pr-4 text-right text-text-primary font-medium whitespace-nowrap">
                    {formatPrice(row.revenue)}
                  </td>
                  <td className="py-3 pr-4 text-right text-success font-medium whitespace-nowrap">
                    {formatPrice(row.paid)}
                  </td>
                  <td className="py-3 pr-4 text-right text-warning font-medium whitespace-nowrap">
                    {formatPrice(row.pending)}
                  </td>
                  <td className="py-3 text-right text-text-secondary">
                    {row.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Riskli Üyeler */}
      {riskyMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riskli Üyeler</CardTitle>
          </CardHeader>
          <ul className="space-y-1">
            {riskyMembers.map((member) => (
              <li key={member.id}>
                <Link
                  href={`/admin/members/${member.id}`}
                  className="flex items-start gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-surface-hover active:bg-surface-hover transition-colors"
                >
                  <span className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    member.level === 'high' ? 'bg-danger' : 'bg-warning'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-text-secondary mt-0.5">
                      {member.reasons.map(r => r.detail).join(' · ')}
                    </div>
                  </div>
                  <Badge variant={member.level === 'high' ? 'danger' : 'warning'}>
                    {member.reasons[0].signal}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
