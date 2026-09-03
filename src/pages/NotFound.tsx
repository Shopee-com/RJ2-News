import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="portal-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-7xl font-extrabold text-orange">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink">Página não encontrada</h1>
      <p className="mt-2 max-w-md text-sm text-ink-secondary">
        A página que você procura pode ter sido movida ou não existe mais no portal SPX Reversa.
      </p>
      <Link to="/" className="btn-primary mt-6">
        <Home size={16} /> Voltar para o início
      </Link>
    </div>
  )
}
