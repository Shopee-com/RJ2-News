import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  linkLabel?: string
  linkTo?: string
  className?: string
}

export default function SectionHeader({ title, linkLabel, linkTo, className = '' }: SectionHeaderProps) {
  return (
    <div className={`mb-3 flex items-center justify-between gap-3 ${className}`}>
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink">{title}</h2>
      {linkLabel && linkTo && (
        <Link to={linkTo} className="link-arrow">
          {linkLabel}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}
