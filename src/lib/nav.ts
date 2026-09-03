export interface NavItem {
  label: string
  to: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Início', to: '/' },
  { label: 'POP', to: '/pop' },
  { label: 'Dados', to: '/dados' },
  { label: 'SPX Reverser', to: '/reverser' },
  { label: 'Jornada Reversa', to: '/jornada' },
  { label: 'Novidades', to: '/novidades' },
  { label: 'Quiz', to: '/quiz' },
  { label: 'Time', to: '/time' },
  { label: 'Vagas', to: '/vagas' },
]

export const QUICK_LINKS_NAV: NavItem[] = [
  { label: 'Procedimentos', to: '/pop' },
  { label: 'Dashboards', to: '/dados' },
  { label: 'Forms', to: '/reverser' },
  { label: 'Contatos', to: '/time' },
]
