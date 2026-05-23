import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { EventContext } from "../EventContext";
import { useEventData } from "../hooks/useEventData";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useAkReminders } from "../hooks/useAkReminders";
import { useFavorites } from "../FavoritesContext";
import { recents } from "../lib/favorites";
import { pageTransition } from "../lib/animations";
import { BottomNav } from "./BottomNav";
import { CardListSkeleton } from "./Skeleton";
import { TopBar } from "./TopBar";
import { PullToRefresh } from "./PullToRefresh";
import { OfflineBanner } from "./OfflineBanner";

interface LayoutContextValue {
  scrollRef: React.RefObject<HTMLDivElement>;
}

const LayoutContext = createContext<LayoutContextValue>({
  scrollRef: { current: null } as React.RefObject<HTMLDivElement>,
});

export function useLayout() {
  return useContext(LayoutContext);
}

export function EventLayout() {
  const { slug = "" } = useParams();
  const { data, loading, error, reload } = useEventData(slug);
  const online = useOnlineStatus();
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ids: favIds } = useFavorites(slug);

  useAkReminders({ slug, data, favIds });

  useEffect(() => {
    if (data) recents.push({ slug, name: slug });
  }, [data, slug]);

  const handleRefresh = async () => {
    reload();
    setLastUpdated(new Date());
  };

  if (loading || !data) {
    return (
      <div className="h-dvh">
        <OfflineBanner online={online} lastUpdated={lastUpdated} />
        <TopBar title={slug} back="/" />
        <main className="px-4 py-4">
          {error ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <AlertTriangle className="mb-3 h-8 w-8 text-amber-400" />
              <p className="font-medium">Couldn&apos;t load this event</p>
              <p className="mt-1 text-sm text-ink-faint">
                Check the event code and your connection.
              </p>
              <button
                onClick={reload}
                className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-bg"
              >
                Retry
              </button>
            </div>
          ) : (
            <CardListSkeleton />
          )}
        </main>
      </div>
    );
  }

  return (
    <EventContext.Provider value={{ slug, data }}>
      <LayoutContext.Provider value={{ scrollRef }}>
        <OfflineBanner online={online} lastUpdated={lastUpdated} />
        <motion.div
          className="mx-auto flex h-dvh max-w-screen-sm flex-col pb-[calc(3.6rem+env(safe-area-inset-bottom))]"
          {...pageTransition}
        >
          <PullToRefresh onRefresh={handleRefresh} scrollRef={scrollRef}>
            <Outlet />
          </PullToRefresh>
        </motion.div>
        <BottomNav slug={slug} />
      </LayoutContext.Provider>
    </EventContext.Provider>
  );
}
