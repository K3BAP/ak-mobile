import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { ResolvedSlot } from "../lib/types";
import { accent } from "../lib/color";
import { durationLabel, formatTime, parseDurationHours } from "../lib/time";

interface Props {
  slug: string;
  rs: ResolvedSlot;
  offsetMinutes: number;
  now?: Date;
  style: React.CSSProperties;
}

export function TimelineSlot({ slug, rs, offsetMinutes, now, style }: Props) {
  const live = now ? rs.start <= now && now < rs.end : false;
  const title = rs.ak?.name ?? "Reserved";
  const color = accent(rs.category?.color);

  const inner = (
    <div className="flex h-full flex-col overflow-hidden p-2">
      {/* Time header */}
      <div className="mb-1 flex items-center justify-between gap-1">
        <span className="text-[10px] font-medium tabular-nums text-ink-faint">
          {formatTime(rs.start, offsetMinutes)}
        </span>
        <span className="text-[9px] tabular-nums text-ink-faint/70">
          {durationLabel(parseDurationHours(rs.slot.duration))}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[13px] font-semibold leading-tight line-clamp-3">
        {title}
      </h3>

      {/* Room */}
      {rs.room && (
        <span className="mt-auto text-[10px] text-ink-faint truncate">
          {rs.room.name}
        </span>
      )}

      {/* Live badge */}
      {live && (
        <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-emerald-300">
          <span className="h-1 w-1 animate-pulse-dot rounded-full bg-emerald-400" />
          Live
        </span>
      )}
    </div>
  );

  const className =
    "absolute rounded-xl border bg-bg-card shadow-soft overflow-hidden transition-colors active:bg-bg-elevated " +
    (live ? "border-emerald-500/40" : "border-line");

  if (rs.ak) {
    return (
      <Link to={`/${slug}/ak/${rs.ak.id}`} className={className} style={style}>
        {inner}
        {/* Category accent bar */}
        <span
          className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
          style={{ backgroundColor: color }}
        />
      </Link>
    );
  }

  return (
    <motion.div className={className} style={style}>
      {inner}
      <span
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
}
