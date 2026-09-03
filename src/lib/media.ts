// Deterministic placeholder media so the UI is fully populated without a backend.
// Swap these helpers for real asset URLs / Supabase storage later.

export function photo(seed: string, w = 800, h = 500): string {
  return `https://picsum.photos/seed/spxr-${encodeURIComponent(seed)}/${w}/${h}`
}

export function avatar(seed: string, size = 160): string {
  return `https://i.pravatar.cc/${size}?u=spxr-${encodeURIComponent(seed)}`
}
