import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { useEvent } from "../EventContext";
import { AKCard } from "../components/AKCard";
import { SearchBar } from "../components/SearchBar";
import { TopBar } from "../components/TopBar";
import { EmptyState } from "../components/EmptyState";
import { recents } from "../lib/favorites";
import { readable, tint } from "../lib/color";
import { formatTime } from "../lib/time";
import { staggerContainer, listItem } from "../lib/animations";

export function BrowseScreen() {
  const { slug, data } = useEvent();
  const title = recents.nameFor(slug) ?? slug;
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<number | null>(null);

  const ownerNames = useMemo(() => {
    const map = new Map<number, string>();
    for (const ak of data.bundle.aks) {
      map.set(
        ak.id,
        ak.owners
          .map((id) => data.ownerById.get(id)?.name ?? "")
          .filter(Boolean)
          .join(", "),
      );
    }
    return map;
  }, [data]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.bundle.aks
      .filter((ak) => {
        if (activeCat != null && ak.category !== activeCat) return false;
        if (!q) return true;
        return (
          ak.name.toLowerCase().includes(q) ||
          ak.description.toLowerCase().includes(q) ||
          (ownerNames.get(ak.id) ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data.bundle.aks, query, activeCat, ownerNames]);

  return (
    <>
      <TopBar
        title="Browse AKs"
        subtitle={`${data.bundle.aks.length} sessions · ${title}`}
        back="/"
      />

      <div className="space-y-3 px-4 py-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search name, owner, description"
        />
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <Pill
            label="All"
            active={activeCat === null}
            onClick={() => setActiveCat(null)}
          />
          {data.bundle.categories.map((c) => (
            <Pill
              key={c.id}
              label={c.name}
              color={c.color}
              active={activeCat === c.id}
              onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
            />
          ))}
        </div>
      </div>

      <main className="space-y-3 px-4 pb-4">
        {results.length === 0 ? (
          <EmptyState icon={SearchX} title="No AKs found" hint="Try a different search." />
        ) : (
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            key={activeCat}
          >
            {results.map((ak) => {
              const sched = data.slotsByAk.get(ak.id)?.[0];
              return (
                <motion.div key={ak.id} variants={listItem}>
                  <AKCard
                    slug={slug}
                    ak={ak}
                    category={ak.category != null ? data.categoryById.get(ak.category) ?? null : null}
                    owners={ak.owners
                      .map((id) => data.ownerById.get(id))
                      .filter((o): o is NonNullable<typeof o> => Boolean(o))}
                    schedule={
                      sched
                        ? {
                            time: formatTime(sched.start, data.offsetMinutes),
                            room: sched.room?.name ?? "TBA",
                          }
                        : null
                    }
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </>
  );
}

function Pill({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium ${
        active ? "border-transparent" : "border-line text-ink-soft active:bg-bg-card"
      }`}
      style={active ? { backgroundColor: tint(color, 0.2), color: readable(color) } : undefined}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {label}
    </motion.button>
  );
}
