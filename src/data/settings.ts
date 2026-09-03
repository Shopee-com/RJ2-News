import { supabase } from '@/lib/supabase'

export type Settings = Record<string, string>

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase.from('app_settings').select('key,value')
  if (error) throw error
  const map: Settings = {}
  for (const row of data ?? []) map[(row as any).key] = (row as any).value ?? '' // eslint-disable-line @typescript-eslint/no-explicit-any
  return map
}

export interface SettingRow {
  key: string
  value: string
  label: string | null
}

export async function fetchSettingRows(): Promise<SettingRow[]> {
  const { data, error } = await supabase.from('app_settings').select('*').order('key')
  if (error) throw error
  return (data ?? []) as SettingRow[]
}

export async function saveSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase.from('app_settings').update({ value }).eq('key', key)
  if (error) throw error
}
