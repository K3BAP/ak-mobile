import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, DoorOpen, Users2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useEvent } from "../EventContext";
import { useLayout } from "../components/EventLayout";
import { SlotCard } from "../components/SlotCard";
import { ScrollToTop } from "../components/ScrollToTop";
import { TopBar } from "../components/TopBar";
import { EmptyState } from "../components/EmptyState";
import { useNow } from "../hooks/useNow";
import { recents } from "../lib/favorites";
import { dayLabelParts } from "../lib/time";
import type { ResolvedSlot } from "../lib/types";
import { staggerContainer, listItem, springConfig } from "../lib/animations";

export function RoomsScreen() {
  const { slug, data } = useEvent();
  const { scrollRef } = useLayout();
  const now = useNow();
  const offset = data.offsetMinutes;
  const title = recents.nameFor(slug) ?? slug;
  const [openId, setOpenId] = useState<number | null>(null);

  const byRoom = useMemo(() => {
    const map = new Map<number, ResolvedSlot[]>();
    for (const rs of data.resolvedSlots) {
      if (rs.slot.room == null) continue;
      const list = map.get(rs.slot.room) ?? [];
      list.push(rs);
      map.set(rs.slot.room, list);
    }
    return map;
  }, [data.resolvedSlots]);

  const rooms = useMemo(
    () => [...data.bundle.rooms].sort((a, b) => a.name.localeCompare(b.name)),
    [data.bundle.rooms],
  );

  return (
    <>
      <TopBar title="Rooms" subtitle={title} back="/" />
      <main className="space-y-3 px-4 py-4">
        {rooms.length === 0 ? (
          <EmptyState icon={DoorOpen} title="No rooms listed" />
        ) : (
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {rooms.map((room) => {
              const slots = byRoom.get(room.id) ?? [];
              const open = openId === room.id;
              return (
                <motion.div
                  key={room.id}
                  variants={listItem}
                  className="overflow-hidden rounded-2xl border border-line bg-bg-card shadow-soft"
                >
                  <button
                    onClick={() => setOpenId(open ? null : room.id)}
                    className="flex w-full items-center gap-3 p-4 text-left active:bg-bg-elevated"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-semibold">{room.name}</h3>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-ink-faint">
                        {room.location && <span>{room.location}</span>}
                        {room.capacity > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Users2 className="h-3.5 w-3.5" />
                            {room.capacity}
                          </span>
                        )}
                        <span>{slots.length} sessions</span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={springConfig}
                    >
                      <ChevronDown className="h-5 w-5 shrink-0 text-ink-faint" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                          transition: { ...springConfig, opacity: { duration: 0.25 } },
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                          transition: { duration: 0.25, ease: "easeInOut" },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 border-t border-line bg-bg-soft/40 p-3">
                          {slots.length === 0 ? (
                            <p className="py-3 text-center text-sm text-ink-faint">
                              Nothing scheduled here.
                            </p>
                          ) : (
                            slots.map((rs, i) => {
                              const prev = slots[i - 1];
                              const newDay =
                                !prev ||
                                dayLabelParts(prev.start, offset).day !==
                                  dayLabelParts(rs.start, offset).day;
                              return (
                                <div key={rs.slot.id}>
                                  {newDay && (
                                    <p className="mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                                      {labelDay(rs.start, offset)}
                                    </p>
                                  )}
                                  <SlotCard
                                    slug={slug}
                                    rs={rs}
                                    offsetMinutes={offset}
                                    now={now}
                                    showRoom={false}
                                  />
                                </div>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
      <ScrollToTop scrollContainerRef={scrollRef} />
    </>
  );
}

function labelDay(date: Date, offset: number): string {
  const p = dayLabelParts(date, offset);
  return `${p.weekday}, ${p.month} ${p.day}`;
}
