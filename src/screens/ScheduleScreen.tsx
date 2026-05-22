import { motion } from "framer-motion";
import { CalendarX, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useEvent } from "../EventContext";
import { useLayout } from "../components/EventLayout";
import { DayTabs } from "../components/DayTabs";
import { FilterSheet } from "../components/FilterSheet";
import { SlotCard } from "../components/SlotCard";
import { ScrollToTop } from "../components/ScrollToTop";
import { TopBar } from "../components/TopBar";
import { EmptyState } from "../components/EmptyState";
import { useNow } from "../hooks/useNow";
import { recents } from "../lib/favorites";
import { dayKey } from "../lib/time";
import { staggerContainer, listItem } from "../lib/animations";

export function ScheduleScreen() {
  const { slug, data } = useEvent();
  const { scrollRef } = useLayout();
  const now = useNow();
  const offset = data.offsetMinutes;
  const title = recents.nameFor(slug) ?? slug;

  const todayKey = dayKey(now, offset);
  const initialDay = useMemo(() => {
    const match = data.days.find((d) => d.key === todayKey);
    return match?.key ?? data.days[0]?.key ?? "";
  }, [data.days, todayKey]);

  const [activeDay, setActiveDay] = useState(initialDay);
  const [filterOpen, setFilterOpen] = useState(false);
  const [cats, setCats] = useState<Set<number>>(new Set());
  const [rooms, setRooms] = useState<Set<number>>(new Set());

  const toggle = (set: Set<number>, id: number) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  };

  const day = data.days.find((d) => d.key === activeDay);
  const filterCount = cats.size + rooms.size;

  const slots = useMemo(() => {
    if (!day) return [];
    return day.slots.filter((rs) => {
      if (cats.size && (rs.ak?.category == null || !cats.has(rs.ak.category)))
        return false;
      if (rooms.size && (rs.slot.room == null || !rooms.has(rs.slot.room)))
        return false;
      return true;
    });
  }, [day, cats, rooms]);

  return (
    <>
      <TopBar
        title="Schedule"
        subtitle={title}
        back="/"
        right={
          <button
            onClick={() => setFilterOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-soft active:bg-bg-card"
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {filterCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-bg">
                {filterCount}
              </span>
            )}
          </button>
        }
      />

      <div className="border-b border-line/70 bg-bg-soft/40 px-4">
        <DayTabs
          days={data.days}
          activeKey={activeDay}
          onSelect={setActiveDay}
          offsetMinutes={offset}
        />
      </div>

      <main className="space-y-3 px-4 py-4">
        {data.days.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No schedule yet"
            hint="Sessions haven't been scheduled for this event."
          />
        ) : slots.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="Nothing matches"
            hint={filterCount ? "Try clearing some filters." : "No sessions this day."}
          />
        ) : (
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            key={activeDay}
          >
            {slots.map((rs) => (
              <motion.div key={rs.slot.id} variants={listItem}>
                <SlotCard
                  slug={slug}
                  rs={rs}
                  offsetMinutes={offset}
                  now={now}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        categories={data.bundle.categories}
        rooms={data.bundle.rooms}
        selectedCategories={cats}
        selectedRooms={rooms}
        onToggleCategory={(id) => setCats((s) => toggle(s, id))}
        onToggleRoom={(id) => setRooms((s) => toggle(s, id))}
        onClear={() => {
          setCats(new Set());
          setRooms(new Set());
        }}
      />
      <ScrollToTop scrollContainerRef={scrollRef} />
    </>
  );
}
