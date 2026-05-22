import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import type { ResolvedSlot } from "../lib/types";
import { formatTime, minutesBetween } from "../lib/time";
import { TimelineSlot } from "./TimelineSlot";

// ── constants ─────────────────────────────────────────────
const PX_PER_MIN = 1.5; // 1 hour = 90 px vertical
const SLOT_MIN_W = 160; // px
const SLOT_MIN_H = 60; // px
const GAP_X = 8; // px between columns
const TIME_COL_W = 48; // px

// ── overlap / column assignment ───────────────────────────
function assignColumns(slots: ResolvedSlot[]): Map<number, number> {
  const sorted = [...slots].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );
  const cols: ResolvedSlot[][] = [];
  const out = new Map<number, number>();

  for (const rs of sorted) {
    let placed = false;
    for (let c = 0; c < cols.length; c++) {
      const last = cols[c][cols[c].length - 1];
      if (last.end <= rs.start) {
        cols[c].push(rs);
        out.set(rs.slot.id, c);
        placed = true;
        break;
      }
    }
    if (!placed) {
      cols.push([rs]);
      out.set(rs.slot.id, cols.length - 1);
    }
  }
  return out;
}

function dayBounds(slots: ResolvedSlot[]) {
  if (slots.length === 0) return null;
  let min = slots[0].start;
  let max = slots[0].end;
  for (const s of slots) {
    if (s.start < min) min = s.start;
    if (s.end > max) max = s.end;
  }
  // floor to hour
  const start = new Date(min);
  start.setMinutes(0, 0, 0);
  // ceil to hour
  const end = new Date(max);
  end.setMinutes(0, 0, 0);
  if (end.getTime() < max.getTime()) end.setHours(end.getHours() + 1);
  return { start, end };
}

// ── component ─────────────────────────────────────────────
interface Props {
  slots: ResolvedSlot[];
  offsetMinutes: number;
  slug: string;
  now?: Date;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function TimelineView({ slots, offsetMinutes, slug, now, scrollContainerRef }: Props) {
  const nowRef = useRef<HTMLDivElement>(null);

  const { columns, dayStart, dayEnd, totalMin, numCols } = useMemo(() => {
    const colMap = assignColumns(slots);
    const bounds = dayBounds(slots);
    if (!bounds) {
      return {
        columns: new Map<number, number>(),
        dayStart: new Date(),
        dayEnd: new Date(),
        totalMin: 0,
        numCols: 0,
      };
    }
    const total = minutesBetween(bounds.start, bounds.end);
    const n =
      colMap.size > 0 ? Math.max(...Array.from(colMap.values())) + 1 : 0;
    return {
      columns: colMap,
      dayStart: bounds.start,
      dayEnd: bounds.end,
      totalMin: total,
      numCols: n,
    };
  }, [slots]);

  const totalH = totalMin * PX_PER_MIN;
  const contentW =
    numCols * SLOT_MIN_W + Math.max(0, numCols - 1) * GAP_X;

  // time markers every 30 min
  const markers = useMemo(() => {
    const out: Date[] = [];
    const cur = new Date(dayStart);
    while (cur < dayEnd) {
      out.push(new Date(cur));
      cur.setMinutes(cur.getMinutes() + 30);
    }
    return out;
  }, [dayStart, dayEnd]);

  // now line
  const nowVisible = now && now >= dayStart && now <= dayEnd;
  const nowTop = nowVisible
    ? minutesBetween(dayStart, now) * PX_PER_MIN
    : 0;

  // auto-scroll to now on first mount
  useEffect(() => {
    if (nowVisible && nowRef.current) {
      const container = scrollContainerRef?.current;
      if (container) {
        const nowRect = nowRef.current.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const targetTop =
          container.scrollTop +
          nowRect.top -
          containerRect.top -
          containerRect.height / 3;
        container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
      } else {
        nowRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [nowVisible, scrollContainerRef]);

  if (slots.length === 0) return null;

  return (
    <motion.div
      className="relative -mx-4 overflow-x-auto no-scrollbar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex min-w-max">
        {/* ── sticky time column ── */}
        <div
          className="sticky left-0 z-20 shrink-0 border-r border-line/30 bg-bg/95 backdrop-blur-sm"
          style={{ width: TIME_COL_W, height: totalH }}
        >
          {markers.map((m) => {
            const top = minutesBetween(dayStart, m) * PX_PER_MIN;
            const isHour = m.getMinutes() === 0;
            return (
              <div
                key={m.getTime()}
                className={`absolute right-1 tabular-nums ${
                  isHour
                    ? "text-[11px] font-semibold text-ink-soft"
                    : "text-[10px] text-ink-faint"
                }`}
                style={{ top: top - 6 }}
              >
                {formatTime(m, offsetMinutes)}
              </div>
            );
          })}
        </div>

        {/* ── timeline content ── */}
        <div
          className="relative"
          style={{ height: totalH, width: contentW }}
        >
          {/* grid lines */}
          {markers.map((m) => {
            const top = minutesBetween(dayStart, m) * PX_PER_MIN;
            const isHour = m.getMinutes() === 0;
            return (
              <div
                key={`grid-${m.getTime()}`}
                className={`absolute left-0 right-0 ${
                  isHour ? "border-t border-line/30" : "border-t border-dashed border-line/15"
                }`}
                style={{ top }}
              />
            );
          })}

          {/* now line */}
          {nowVisible && (
            <div
              ref={nowRef}
              className="absolute left-0 right-0 z-10"
              style={{ top: nowTop }}
            >
              <div className="border-t-2 border-accent" />
              <span className="absolute -top-4 left-0 rounded bg-accent px-1 py-0.5 text-[9px] font-bold text-bg shadow-glow">
                Now
              </span>
            </div>
          )}

          {/* slot blocks */}
          {slots.map((rs) => {
            const col = columns.get(rs.slot.id) ?? 0;
            const startMin = minutesBetween(dayStart, rs.start);
            const durMin = minutesBetween(rs.start, rs.end);
            const top = startMin * PX_PER_MIN;
            const height = Math.max(durMin * PX_PER_MIN, SLOT_MIN_H);
            const left = col * (SLOT_MIN_W + GAP_X);

            return (
              <TimelineSlot
                key={rs.slot.id}
                slug={slug}
                rs={rs}
                offsetMinutes={offsetMinutes}
                now={now}
                style={{
                  top,
                  height,
                  left,
                  width: SLOT_MIN_W,
                }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
