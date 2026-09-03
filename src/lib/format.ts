const MONTHS_PT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

/** 2026-05-26 -> "26 MAI 2026" */
export function formatDateLong(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_PT[d.getMonth()].toUpperCase()} ${d.getFullYear()}`
}

/** 2026-05-26 -> "26/05/2026" */
export function formatDateShort(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR')
}

/** 2026-05-26T16:45 -> "26/05/2026 16:45" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

export function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`
  return String(n)
}
