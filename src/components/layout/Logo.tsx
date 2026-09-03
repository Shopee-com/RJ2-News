import { Link } from 'react-router-dom'

export default function Logo({ withTagline = true }: { withTagline?: boolean }) {
  return (
    <Link to="/" className="group flex flex-col leading-none" aria-label="SPX Reversa — Início">
      <span className="text-lg font-extrabold tracking-tight">
        <span className="text-orange">SPX</span>{' '}
        <span className="text-white">REVERSA</span>
      </span>
      {withTagline && (
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-on-dark-secondary">
          Informação que transforma
        </span>
      )}
    </Link>
  )
}
