import { useEffect, useState } from "react";

interface State<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Module-level cache so navigating between screens doesn't refetch.
const cache = new Map<string, unknown>();

export function useResource<T>(
  cacheKey: string | null,
  loader: (signal: AbortSignal) => Promise<T>,
): State<T> & { reload: () => void } {
  const [state, setState] = useState<State<T>>(() => ({
    data: cacheKey ? ((cache.get(cacheKey) as T) ?? null) : null,
    loading: cacheKey ? !cache.has(cacheKey) : false,
    error: null,
  }));
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!cacheKey) return;
    if (cache.has(cacheKey) && nonce === 0) {
      setState({ data: cache.get(cacheKey) as T, loading: false, error: null });
      return;
    }
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    loader(controller.signal)
      .then((data) => {
        cache.set(cacheKey, data);
        setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ data: null, loading: false, error: error as Error });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, nonce]);

  return {
    ...state,
    reload: () => {
      if (cacheKey) cache.delete(cacheKey);
      setNonce((n) => n + 1);
    },
  };
}
