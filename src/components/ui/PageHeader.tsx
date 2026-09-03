import type { ReactNode } from 'react'
import Breadcrumb, { type Crumb } from './Breadcrumb'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  crumbs?: Crumb[]
  actions?: ReactNode
}

export default function PageHeader({ eyebrow, title, subtitle, crumbs, actions }: PageHeaderProps) {
  return (
    <div className="border-b border-line bg-white">
      <div className="portal-container py-6 sm:py-8">
        {crumbs && <Breadcrumb crumbs={crumbs} className="mb-3" />}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {eyebrow && (
              <span className="label-chip mb-1 block text-orange">{eyebrow}</span>
            )}
            <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-sm text-ink-secondary sm:text-base">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  )
}
