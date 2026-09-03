import { useEffect, useState, useCallback } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  // fn é recriada a cada render; usamos deps explícitas para controlar o refetch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useCallback(fn, deps)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    memoized()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError((e as Error).message ?? 'Erro ao carregar.'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [memoized, tick])

  return { data, loading, error, reload: () => setTick((t) => t + 1) }
}
