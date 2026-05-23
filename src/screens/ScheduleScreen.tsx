import { motion } from "framer-motion";
import { CalendarX, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEvent } from "../EventContext";
import { useLayout } from "../components/EventLayout";
import { DayTabs } from "../components/DayTabs";
import { FilterSheet } from "../components/FilterSheet";
import { SlotCard } from "../components/SlotCard";
import { TimelineView } from "../components/TimelineView";
import { ScrollToTop } from "../components/ScrollToTop";
import { TopBar } from "../components/TopBar";
import { EmptyState } from "../components/EmptyState";
import { useNow } from "../hooks/useNow";
import { recents } from "../lib/favorites";
import { dayKey } from "../lib/time";
import { listItem } from "../lib/animations";

const VIEW_MODE_KEY = "akc:schedule-view-mode";

function getSavedViewMode(): "list" | "timeline" {
  try {
    const raw = localStorage.getItem(VIEW_MODE_KEY);
    if (raw === "timeline") return "timeline";
  } catch { /* localStorage unavailable */ }
  return "list";
}

function saveViewMode(mode: "list" | "timeline") {
  try {
    localStorage.setItem(VIEW_MODE_KEY, mode);
  } catch { /* localStorage unavailable */ }
}

type ViewMode = "list" | "timeline";

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
  const [viewMode, setViewMode] = useState<ViewMode>(() => getSavedViewMode());

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

  // index of the current/next slot in the list (first that hasn't ended yet)
  const nowSlotIndex = useMemo(() => {
    if (activeDay !== todayKey) return -1;
    return slots.findIndex((rs) => rs.end > now);
  }, [slots, activeDay, todayKey, now]);

  const nowSlotRef = useRef<HTMLDivElement>(null);

  // auto-scroll the list to the current/next slot on mount / day change
  useEffect(() => {
    if (viewMode !== "list" || nowSlotIndex < 0 || !nowSlotRef.current) return;
    const el = nowSlotRef.current;
    const container = scrollRef?.current;
    if (container) {
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const targetTop =
        container.scrollTop +
        elRect.top -
        containerRect.top -
        containerRect.height / 3;
      container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeDay, nowSlotIndex >= 0]);

  const ViewToggleIcon = viewMode === "list" ? LayoutGrid : List;
  const viewToggleLabel = viewMode === "list" ? "Timeline view" : "List view";

  return (
    <>
      <TopBar
        title="Schedule"
        subtitle={title}
        back="/"
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode((v) => {
                const next = v === "list" ? "timeline" : "list";
                saveViewMode(next);
                return next;
              })}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-soft active:bg-bg-card"
              aria-label={viewToggleLabel}
              title={viewToggleLabel}
            >
              <ViewToggleIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setFilterOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-soft active:bg-bg-card"
              aria-label="Filters"
              title="Filters"
            >
              <SlidersHorizontal className="h-5 w-5" />
              {filterCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-bg">
                  {filterCount}
                </span>
              )}
            </button>
          </div>
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

      <main className="px-4 py-4">
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
        ) : viewMode === "timeline" ? (
          <TimelineView
            slots={slots}
            offsetMinutes={offset}
            slug={slug}
            now={now}
            scrollContainerRef={scrollRef}
          />
        ) : (
          <div className="space-y-3" key={activeDay}>
            {slots.map((rs, index) => (
              <motion.div key={rs.slot.id} ref={index === nowSlotIndex ? nowSlotRef : undefined} variants={listItem} custom={index} initial="initial" whileInView="animate" viewport={{ once: true }}>
                <SlotCard
                  slug={slug}
                  rs={rs}
                  offsetMinutes={offset}
                  now={now}
                />
              </motion.div>
))}
           </div>
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
