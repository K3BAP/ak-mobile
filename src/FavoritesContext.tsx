import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { favorites as favStorage } from "./lib/favorites";

interface FavoritesState {
  ids: Set<number>;
  toggle: (akId: number) => boolean;
  has: (akId: number) => boolean;
  refresh: () => void;
}

const FavoritesContext = createContext<FavoritesState | null>(null);

const listeners = new Set<() => void>();

function notifyAll() {
  listeners.forEach((fn) => fn());
}

function emitFavoritesChange() {
  notifyAll();
}

export function useFavorites(slug: string): FavoritesState {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");

  const [ids, setIds] = useState(() => favStorage.list(slug));

  useEffect(() => {
    setIds(favStorage.list(slug));
    const handler = () => setIds(favStorage.list(slug));
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, [slug]);

  const toggle = useCallback(
    (akId: number) => {
      const result = favStorage.toggle(slug, akId);
      emitFavoritesChange();
      return result;
    },
    [slug],
  );

  const has = useCallback(
    (akId: number) => ids.has(akId),
    [ids],
  );

  const refresh = useCallback(() => {
    setIds(favStorage.list(slug));
  }, [slug]);

  return { ids, toggle, has, refresh };
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  return <FavoritesContext.Provider value={{ ids: new Set(), toggle: () => false, has: () => false, refresh: () => {} }}>{children}</FavoritesContext.Provider>;
}

export { emitFavoritesChange };
