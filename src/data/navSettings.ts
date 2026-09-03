import { supabase } from '@/lib/supabase'
import { NAV_ITEMS, type NavItem } from '@/lib/nav'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface NavOverride {
  visible: boolean
  sort: number | null
  label: string | null
}
export type NavConfig = Record<string, NavOverride>

export interface NavEntry {
  to: string
  label: string
  visible: boolean
  sort: number
}

export async function fetchNavConfig(): Promise<NavConfig> {
  const { data, error } = await supabase.from('nav_settings').select('route,visible,sort,label')
  if (error) throw error
  const map: NavConfig = {}
  for (const r of data ?? []) {
    map[(r as any).route] = {
      visible: (r as any).visible !== false,
      sort: (r as any).sort ?? null,
      label: (r as any).label ?? null,
    }
  }
  return map
}

/** Mescla os itens padrão com os ajustes do admin, já ordenado. */
export function mergeNav(config: NavConfig): NavEntry[] {
  return NAV_ITEMS.map((item: NavItem, i) => {
    const o = config[item.to]
    return {
      to: item.to,
      label: (o?.label && o.label.trim()) || item.label,
      visible: o?.visible !== false,
      sort: o?.sort ?? i,
    }
  }).sort((a, b) => a.sort - b.sort)
}

export async function saveNavItem(
  route: string,
  patch: Partial<{ visible: boolean; sort: number; label: string | null }>,
): Promise<void> {
  const { error } = await supabase
    .from('nav_settings')
    .upsert({ route, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'route' })
  if (error) throw error
}

/** Grava a nova ordem (sort = índice) de uma lista de rotas. */
export async function saveNavOrder(routes: string[]): Promise<void> {
  const rows = routes.map((route, i) => ({ route, sort: i, updated_at: new Date().toISOString() }))
  const { error } = await supabase.from('nav_settings').upsert(rows, { onConflict: 'route' })
  if (error) throw error
}

/** Grava ordem, visibilidade e rótulo de todas as abas de uma vez. */
export async function saveNavConfig(entries: NavEntry[]): Promise<void> {
  const rows = entries.map((e, i) => ({
    route: e.to,
    sort: i,
    visible: e.visible,
    label: e.label?.trim() || null,
    updated_at: new Date().toISOString(),
  }))
  const { error } = await supabase.from('nav_settings').upsert(rows, { onConflict: 'route' })
  if (error) throw error
}
