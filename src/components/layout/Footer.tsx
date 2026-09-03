import { Link } from 'react-router-dom'
import { NAV_ITEMS } from '@/lib/nav'
import { formatDateShort } from '@/lib/format'

export default function Footer() {
  return (
    <footer className="mt-10 bg-dark text-on-dark-secondary">
      <div className="portal-container grid gap-8 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold">
            <span className="text-orange">SPX</span> <span className="text-white">REVERSA</span>
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-on-dark-secondary">
            Shopee · SPX Reversa
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Jornal Reversa é uma iniciativa da área de Reversa. Informação que transforma,
            resultados que conectam.
          </p>
        </div>

        <div className="md:justify-self-center">
          <p className="mb-3 text-label font-bold uppercase tracking-wide text-white">Navegação</p>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:justify-self-end md:text-right">
          <p className="mb-3 text-label font-bold uppercase tracking-wide text-white">Contato</p>
          <a href="mailto:reversa.comunicacao@shopee.com" className="text-sm hover:text-white">
            reversa.comunicacao@shopee.com
          </a>
          <p className="mt-4 text-xs text-on-dark-secondary">
            Publicado em {formatDateShort(new Date().toISOString())}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="portal-container flex flex-col items-center justify-between gap-2 py-4 text-xs text-on-dark-secondary sm:flex-row">
          <p>© {new Date().getFullYear()} SPX Reversa. Todos os direitos reservados.</p>
          <p>Informação que transforma. Resultados que conectam.</p>
        </div>
      </div>
    </footer>
  )
}
