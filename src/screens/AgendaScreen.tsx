import { motion } from "framer-motion";
import { Star, TriangleAlert } from "lucide-react";
import { useMemo } from "react";
import { useEvent } from "../EventContext";
import { useLayout } from "../components/EventLayout";
import { AKCard } from "../components/AKCard";
import { SlotCard } from "../components/SlotCard";
import { ScrollToTop } from "../components/ScrollToTop";
import { TopBar } from "../components/TopBar";
import { EmptyState } from "../components/EmptyState";
import { useNow } from "../hooks/useNow";
import { useFavorites } from "../FavoritesContext";
import { recents } from "../lib/favorites";
import { dayLabelParts, overlaps, rangeLabel } from "../lib/time";
import type { Owner, ResolvedSlot } from "../lib/types";
import { listItem, fadeUp } from "../lib/animations";

export function AgendaScreen() {
  const { slug, data } = useEvent();
  const { scrollRef } = useLayout();
  const now = useNow();
  const offset = data.offsetMinutes;
  const title = recents.nameFor(slug) ?? slug;
  const { ids: favSet, refresh } = useFavorites(slug);

  const { scheduled, unscheduled, conflictIds } = useMemo(() => {
    const favAks = [...favSet].map((id) => data.akById.get(id)).filter(Boolean);

    const scheduled: ResolvedSlot[] = [];
    for (const rs of data.resolvedSlots) {
      if (rs.slot.ak != null && favSet.has(rs.slot.ak)) scheduled.push(rs);
    }
    scheduled.sort((a, b) => a.start.getTime() - b.start.getTime());

    const conflictIds = new Set<number>();
    for (let i = 0; i < scheduled.length; i++) {
      for (let j = i + 1; j < scheduled.length; j++) {
        if (
          overlaps(
            scheduled[i].start,
            scheduled[i].end,
            scheduled[j].start,
            scheduled[j].end,
          )
        ) {
          conflictIds.add(scheduled[i].slot.id);
          conflictIds.add(scheduled[j].slot.id);
        }
      }
    }

    const scheduledAkIds = new Set(scheduled.map((rs) => rs.slot.ak));
    const unscheduled = favAks.filter((ak) => !scheduledAkIds.has(ak!.id));

    return { scheduled, unscheduled, conflictIds };
  }, [favSet, data]);

  const days = useMemo(() => {
    const map = new Map<string, ResolvedSlot[]>();
    for (const rs of scheduled) {
      const p = dayLabelParts(rs.start, offset);
      const key = `${p.month} ${p.day}|${p.weekday}`;
      const list = map.get(key) ?? [];
      list.push(rs);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [scheduled, offset]);

  const empty = scheduled.length === 0 && unscheduled.length === 0;

  return (
    <>
      <TopBar title="My agenda" subtitle={title} back="/" />
      <main className="space-y-5 px-4 py-4">
        {empty ? (
          <EmptyState
            icon={Star}
            title="Your agenda is empty"
            hint="Tap the star on any AK to add it here."
          />
        ) : (
          <>
            {conflictIds.size > 0 && (
              <motion.div
                className="flex items-start gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200"
                variants={fadeUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <p>
                  Some starred sessions overlap. Conflicting times are flagged below.
                </p>
              </motion.div>
            )}

            <div className="space-y-5">
              {days.map(([key, slots]) => {
                const [date, weekday] = key.split("|");
                return (
                  <motion.section key={key} variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                      {weekday}, {date}
                    </h2>
                    <div className="space-y-3">
                      {slots.map((rs, index) => {
                        const conflict = conflictIds.has(rs.slot.id);
                        return (
                          <motion.div key={rs.slot.id} variants={listItem} custom={index} initial="initial" whileInView="animate" viewport={{ once: true }}>
                            {conflict && (
                              <p className="mb-1 flex items-center gap-1 pl-1 text-xs font-medium text-amber-300">
                                <TriangleAlert className="h-3.5 w-3.5" />
                                Overlaps {rangeLabel(rs.start, rs.end, offset)}
                              </p>
                            )}
                            <div
                              className={
                                conflict
                                  ? "rounded-2xl ring-2 ring-amber-500/40"
                                  : undefined
                              }
                            >
                              <SlotCard
                                slug={slug}
                                rs={rs}
                                offsetMinutes={offset}
                                now={now}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.section>
                );
              })}

              {unscheduled.length > 0 && (
                <motion.section variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    Not yet scheduled
                  </h2>
                  <div className="space-y-3">
                    {unscheduled.map((ak, index) => (
                      <motion.div key={ak!.id} variants={listItem} custom={index} initial="initial" whileInView="animate" viewport={{ once: true }}>
                        <AKCard
                          slug={slug}
                          ak={ak!}
                          category={
                            ak!.category != null
                              ? data.categoryById.get(ak!.category) ?? null
                              : null
                          }
                          owners={ak!.owners
                            .map((id) => data.ownerById.get(id))
                            .filter((o): o is Owner => Boolean(o))}
                          onToggleFavorite={refresh}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>
          </>
        )}
      </main>
      <ScrollToTop scrollContainerRef={scrollRef} />
    </>
  );
}
