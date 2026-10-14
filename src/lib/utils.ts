import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...values: ClassValue[]) => twMerge(clsx(values))
export const money = (value:number) => new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN', minimumFractionDigits:2, maximumFractionDigits:2 }).format(value).replace(/\s/g, ' ')
export function calculatePoints(amount:number, visits:number, manual=0) { const base=Math.max(0,Math.floor(amount)); const visit=25; const milestone=(visits+1)%5===0?100:0; return { base, visit, milestone, manual, total:base+visit+milestone+manual } }
export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
export const convertReferral = (qualified:boolean) => qualified ? { referrerPoints:150, referredPoints:50, status:'converted' } : { referrerPoints:0, referredPoints:0, status:'pending' }
