import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tone?: 'orange' | 'neutral' | 'success' | 'warn' | 'danger' | 'info' | 'dark'
  className?: string
}

const TONES: Record<NonNullable<BadgeProps['tone']>, string> = {
  orange: 'bg-orange-light text-orange',
  neutral: 'bg-bg-secondary text-ink-secondary',
  success: 'bg-green-50 text-success',
  warn: 'bg-amber-50 text-warn',
  danger: 'bg-red-50 text-danger',
  info: 'bg-blue-50 text-info',
  dark: 'bg-dark text-white',
}

export default function Badge({ children, tone = 'orange', className = '' }: BadgeProps) {
  return (
    <span
      className={`label-chip rounded px-2 py-0.5 ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
