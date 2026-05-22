import { CalendarRange, ChevronRight, Clock, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CardListSkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { useResource } from "../hooks/useResource";
import { discoverEvents } from "../lib/events";
import { recents } from "../lib/favorites";

export function EventsScreen() {
  const { data, loading, error } = useResource("events", (signal) =>
    discoverEvents(signal),
  );
  const [query, setQuery] = useState("");
  const recent = useMemo(() => recents.list(), []);

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q),
    );
  }, [data, query]);

  return (
    <div className="mx-auto min-h-dvh max-w-screen-sm">
      <header className="safe-top px-5 pb-2 pt-8">
        <p className="text-sm font-medium text-accent">AK Companion</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Choose an event</h1>
        <p className="mt-1 text-sm text-ink-faint">
          A clean, mobile view of the KIF AK schedule.
        </p>
      </header>

      <div className="sticky top-0 z-10 bg-bg/80 px-5 py-3 backdrop-blur-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events"
            className="w-full rounded-xl border border-line bg-bg-card py-2.5 pl-9 pr-3 text-[15px] placeholder:text-ink-faint focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
          />
        </div>
      </div>

      <main className="space-y-3 px-5 pb-16 pt-1">
        {recent.length > 0 && !query && (
          <section className="pb-1">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Recent
            </h2>
            <div className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <Link
                  key={r.slug}
                  to={`/${r.slug}/now`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-card px-3 py-1.5 text-sm font-medium text-ink-soft active:bg-bg-elevated"
                >
                  <Clock className="h-3.5 w-3.5 text-ink-faint" />
                  {r.slug}
                </Link>
              ))}
            </div>
          </section>
        )}

        {loading && <CardListSkeleton count={5} />}

        {error && (
          <EmptyState
            icon={CalendarRange}
            title="Couldn't load events"
            hint="The server may be unreachable. Pull to retry."
          />
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState icon={Search} title="No matching events" />
        )}

        {filtered.map((ev) => (
          <Link
            key={ev.slug}
            to={`/${ev.slug}/now`}
            onClick={() => recents.push({ slug: ev.slug, name: ev.name })}
            className="flex items-center gap-3 rounded-2xl border border-line bg-bg-card p-4 shadow-soft transition-colors active:bg-bg-elevated"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold leading-snug line-clamp-2">
                {ev.name}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint">
                {ev.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {ev.location}
                  </span>
                )}
                {ev.when && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarRange className="h-3.5 w-3.5" />
                    {ev.when}
                  </span>
                )}
                <span className="font-mono text-ink-faint/70">{ev.slug}</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-ink-faint" />
          </Link>
        ))}
      </main>
    </div>
  );
}
