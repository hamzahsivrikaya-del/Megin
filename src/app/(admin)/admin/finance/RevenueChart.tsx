'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartDataPoint {
  month: string
  label: string
  revenue: number | null
  projected: number | null
}

interface RevenueChartProps {
  data: ChartDataPoint[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const formatTL = (value: number) =>
    value >= 1000 ? `${Math.round(value / 1000)}K` : `${value}`

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: '#57534E' }}
          axisLine={{ stroke: '#E5E5E5' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatTL}
          tick={{ fontSize: 12, fill: '#57534E' }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          formatter={(value) => [`${Number(value).toLocaleString('tr-TR')} TL`, '']}
          labelFormatter={(label) => String(label)}
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            fontSize: '13px',
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#DC2626"
          strokeWidth={2}
          dot={{ r: 4, fill: '#DC2626' }}
          name="Gelir"
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="projected"
          stroke="#DC2626"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={{ r: 4, fill: '#FFFFFF', stroke: '#DC2626', strokeWidth: 2 }}
          name="Tahmini"
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
