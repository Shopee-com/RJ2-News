import { Fragment } from 'react'
import { Package, PackageCheck, ListChecks, Cog, Flag } from 'lucide-react'
import { journey } from '@/data/journey'

const ICONS = [Package, PackageCheck, ListChecks, Cog, Flag]

interface JourneyTimelineProps {
  activeKey: string
  onSelect: (key: string) => void
  numbered?: boolean
}

export default function JourneyTimeline({ activeKey, onSelect, numbered = false }: JourneyTimelineProps) {
  return (
    <div className="no-scrollbar flex items-center overflow-x-auto pb-1">
      {journey.map((step, i) => {
        const Icon = ICONS[i] ?? Package
        const active = step.key === activeKey
        return (
          <Fragment key={step.id}>
            <button
              onClick={() => onSelect(step.key)}
              className="flex shrink-0 flex-col items-center gap-1.5 px-1 text-center"
              aria-current={active ? 'step' : undefined}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                  active
                    ? 'border-orange bg-orange text-white'
                    : 'border-line bg-white text-ink-muted hover:border-orange hover:text-orange'
                }`}
              >
                <Icon size={18} />
              </span>
              <span className={`text-[11px] font-semibold ${active ? 'text-orange' : 'text-ink-secondary'}`}>
                {numbered && <span className="mr-0.5">{String(step.order).padStart(2, '0')}</span>}
                {step.name}
              </span>
            </button>
            {i < journey.length - 1 && (
              <span className="mx-1 mt-[-18px] h-0.5 min-w-6 flex-1 rounded bg-line sm:min-w-10" />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
