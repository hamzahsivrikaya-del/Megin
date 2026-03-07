interface MonthlyRevenue {
  month: string       // YYYY-MM
  total: number
  paid: number
  pending: number
}

export interface ForecastResult {
  nextMonth: number
  nextThreeMonths: number
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
  churnRisk: number
  avgRevenuePerClient: number
}

export function calculateForecast(
  monthlyData: MonthlyRevenue[],
  activeClientCount: number
): ForecastResult {
  if (monthlyData.length === 0) {
    return { nextMonth: 0, nextThreeMonths: 0, trend: 'stable', trendPercent: 0, churnRisk: 0, avgRevenuePerClient: 0 }
  }

  const recent = monthlyData.slice(0, 3)
  const avgRevenue = recent.reduce((sum, m) => sum + m.total, 0) / recent.length

  const older = monthlyData.slice(3, 6)
  const olderAvg = older.length > 0
    ? older.reduce((sum, m) => sum + m.total, 0) / older.length
    : avgRevenue

  const trendPercent = olderAvg > 0 ? ((avgRevenue - olderAvg) / olderAvg) * 100 : 0
  const trend: ForecastResult['trend'] = trendPercent > 5 ? 'up' : trendPercent < -5 ? 'down' : 'stable'

  const nextMonth = Math.round(avgRevenue * (1 + trendPercent / 100))
  const nextThreeMonths = Math.round(nextMonth * 3)

  const pendingRate = recent.reduce((sum, m) => sum + m.pending, 0) /
    Math.max(1, recent.reduce((sum, m) => sum + m.total, 0))

  return {
    nextMonth,
    nextThreeMonths,
    trend,
    trendPercent: Math.round(trendPercent),
    churnRisk: Math.round(pendingRate * 100),
    avgRevenuePerClient: activeClientCount > 0 ? Math.round(avgRevenue / activeClientCount) : 0,
  }
}
