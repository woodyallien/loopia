import { useId } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { chartData } from '../data/mock'

export function GrowthChart({ points, summary }: { points?: { name: string; value: number }[]; summary?: string }) {
  const gradient = useId().replace(/:/g, '')
  const data = points ?? chartData.map(row => ({ name: row.name, value: row.clientes }))
  const label = summary ?? data.map(point => `${point.name} ${point.value}`).join(', ')
  return (
    <div role="img" aria-label={label} className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A76519" stopOpacity={.35} />
              <stop offset="95%" stopColor="#A76519" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={.2} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ddd' }} />
          <Area type="monotone" dataKey="value" stroke="#A76519" strokeWidth={3} fill={`url(#${gradient})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
