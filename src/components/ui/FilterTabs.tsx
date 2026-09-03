interface FilterTabsProps {
  options: readonly string[]
  value: string
  onChange: (v: string) => void
  className?: string
}

export default function FilterTabs({ options, value, onChange, className = '' }: FilterTabsProps) {
  return (
    <div className={`no-scrollbar flex gap-2 overflow-x-auto ${className}`}>
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
              active
                ? 'border-orange bg-orange text-white'
                : 'border-line bg-white text-ink-secondary hover:border-orange hover:text-orange'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
