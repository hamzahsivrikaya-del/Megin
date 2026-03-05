export interface RiskFactors {
  lastLessonDaysAgo: number
  attendanceRate: number       // 0-1
  nutritionCompliance: number  // 0-1
  packageProgress: number      // 0-1 (used/total lessons)
  streakWeeks: number
}

export interface RiskResult {
  score: number        // 0-100
  level: 'low' | 'medium' | 'high' | 'critical'
  factors: string[]
}

export function calculateRiskScore(factors: RiskFactors): RiskResult {
  let score = 0
  const riskFactors: string[] = []

  // Son ders uzakligi (max 35)
  if (factors.lastLessonDaysAgo > 14) {
    score += 35
    riskFactors.push(`${factors.lastLessonDaysAgo} gundur ders yapilmadi`)
  } else if (factors.lastLessonDaysAgo > 7) {
    score += 20
    riskFactors.push(`${factors.lastLessonDaysAgo} gundur ders yapilmadi`)
  } else if (factors.lastLessonDaysAgo > 3) {
    score += 10
  }

  // Katilim orani (max 25)
  if (factors.attendanceRate < 0.3) {
    score += 25
    riskFactors.push('Katilim orani cok dusuk')
  } else if (factors.attendanceRate < 0.5) {
    score += 15
    riskFactors.push('Katilim orani dusuk')
  } else if (factors.attendanceRate < 0.7) {
    score += 8
  }

  // Beslenme uyumu (max 20)
  if (factors.nutritionCompliance < 0.3) {
    score += 20
    riskFactors.push('Beslenme uyumu cok dusuk')
  } else if (factors.nutritionCompliance < 0.5) {
    score += 12
  }

  // Paket ilerleme (max 10)
  if (factors.packageProgress > 0.9) {
    score += 10
    riskFactors.push('Paket bitmek uzere')
  } else if (factors.packageProgress > 0.75) {
    score += 5
  }

  // Seri bonus (negatif risk)
  if (factors.streakWeeks >= 4) score = Math.max(0, score - 10)
  else if (factors.streakWeeks >= 2) score = Math.max(0, score - 5)

  score = Math.min(100, Math.max(0, score))

  const level: RiskResult['level'] =
    score >= 70 ? 'critical' :
    score >= 45 ? 'high' :
    score >= 20 ? 'medium' : 'low'

  return { score, level, factors: riskFactors }
}
