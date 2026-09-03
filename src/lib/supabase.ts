import { createClient } from '@supabase/supabase-js'

// A URL e a chave publicável (publishable) do Supabase são públicas por design:
// o acesso aos dados é protegido por RLS no banco. Podem ficar versionadas.
// Permite sobrescrever via variáveis de ambiente (Vercel) se necessário.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://pjhzbefheinbjcdywuma.supabase.co'
const supabaseKey =
  import.meta.env.VITE_SUPABASE_KEY ?? 'sb_publishable_GpV-nejTGC4ZB5AiYPEDtw__480tIp-'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
