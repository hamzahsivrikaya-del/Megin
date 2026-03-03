'use client'

import dynamic from 'next/dynamic'

const calculatorComponents = {
  'calorie-calculator': dynamic(
    () => import('@/components/shared/MacroCalculator'),
    { ssr: false }
  ),
  'one-rep-max': dynamic(
    () => import('@/components/shared/OneRMCalculator'),
    { ssr: false }
  ),
  'bmi-calculator': dynamic(
    () => import('@/components/shared/BMICalculator'),
    { ssr: false }
  ),
  'water-intake': dynamic(
    () => import('@/components/shared/WaterCalculator'),
    { ssr: false }
  ),
  'ideal-weight': dynamic(
    () => import('@/components/shared/IdealWeightCalculator'),
    { ssr: false }
  ),
  'body-fat-skinfold': dynamic(
    () => import('@/components/shared/SkinfoldCalculator'),
    { ssr: false }
  ),
  'body-fat-navy': dynamic(
    () => import('@/components/shared/NavyBodyFatCalculator'),
    { ssr: false }
  ),
}

export type ToolSlug = keyof typeof calculatorComponents

interface ToolCalculatorWrapperProps {
  slug: ToolSlug
}

export default function ToolCalculatorWrapper({ slug }: ToolCalculatorWrapperProps) {
  const Calculator = calculatorComponents[slug]
  return <Calculator />
}
