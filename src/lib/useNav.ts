import { useAsync } from './useAsync'
import { fetchNavConfig, mergeNav, type NavConfig, type NavEntry } from '@/data/navSettings'

export function useNavConfig(): NavConfig {
  const { data } = useAsync(fetchNavConfig, [])
  return data ?? {}
}

/** Todos os itens já ordenados e com rótulos aplicados (para o admin). */
export function useNavEntries(): NavEntry[] {
  return mergeNav(useNavConfig())
}

/** Itens do menu principal visíveis (Início nunca é escondido). */
export function useVisibleNav(): NavEntry[] {
  return mergeNav(useNavConfig()).filter((e) => e.to === '/' || e.visible)
}
