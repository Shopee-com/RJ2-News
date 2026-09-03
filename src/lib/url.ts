/**
 * Retorna a URL apenas se for http(s) (ou âncora). Bloqueia esquemas
 * perigosos como javascript:, data:, etc. Fallback seguro para '#'.
 */
export function safeUrl(url: string | null | undefined): string {
  const u = (url ?? '').trim()
  if (!u || u === '#') return '#'
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith('/')) return u // caminho interno relativo
  return '#'
}
