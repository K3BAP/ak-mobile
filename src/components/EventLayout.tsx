import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { EventContext } from "../EventContext";
import { useEventData } from "../hooks/useEventData";
import { recents } from "../lib/favorites";
import { pageTransition } from "../lib/animations";
import { BottomNav } from "./BottomNav";
import { CardListSkeleton } from "./Skeleton";
import { TopBar } from "./TopBar";

export function EventLayout() {
  const { slug = "" } = useParams();
  const { data, loading, error, reload } = useEventData(slug);

  useEffect(() => {
    if (data) recents.push({ slug, name: slug });
  }, [data, slug]);

  if (loading || !data) {
    return (
      <div className="min-h-dvh">
        <TopBar title={slug} back="/" />
        <main className="px-4 py-4">
          {error ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <AlertTriangle className="mb-3 h-8 w-8 text-amber-400" />
              <p className="font-medium">Couldn't load this event</p>
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
      <motion.div
        className="mx-auto min-h-dvh max-w-screen-sm pb-[calc(4.5rem+env(safe-area-inset-bottom))]"
        {...pageTransition}
      >
        <Outlet />
      </motion.div>
      <BottomNav slug={slug} />
    </EventContext.Provider>
  );
}
