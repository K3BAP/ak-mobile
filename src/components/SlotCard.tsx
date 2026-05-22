import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { ResolvedSlot } from "../lib/types";
import { accent } from "../lib/color";
import { durationLabel, formatTime, parseDurationHours } from "../lib/time";
import { CategoryPill } from "./CategoryPill";

export function SlotCard({
  slug,
  rs,
  offsetMinutes,
  now,
  showRoom = true,
}: {
  slug: string;
  rs: ResolvedSlot;
  offsetMinutes: number;
  now?: Date;
  showRoom?: boolean;
}) {
  const live = now ? rs.start <= now && now < rs.end : false;
  const title = rs.ak?.name ?? "Reserved";
  const color = accent(rs.category?.color);
  const inner = (
    <>
      <div className="flex w-14 shrink-0 flex-col items-end pt-0.5 text-right">
        <span className="text-[15px] font-semibold tabular-nums leading-none">
          {formatTime(rs.start, offsetMinutes)}
        </span>
        <span className="mt-1 text-[11px] tabular-nums text-ink-faint">
          {durationLabel(parseDurationHours(rs.slot.duration))}
        </span>
      </div>

      <span
        className="mt-0.5 w-1 shrink-0 self-stretch rounded-full"
        style={{ backgroundColor: color }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 text-[15px] font-semibold leading-snug line-clamp-2">
            {title}
          </h3>
          {live && (
            <span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-400" />
              Live
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {rs.category && (
            <CategoryPill name={rs.category.name} color={rs.category.color} />
          )}
          {showRoom && rs.room && (
            <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
              <MapPin className="h-3.5 w-3.5" />
              {rs.room.name}
            </span>
          )}
        </div>
      </div>
    </>
  );

  const className = `flex items-start gap-3 rounded-2xl border bg-bg-card p-3 shadow-soft transition-colors active:bg-bg-elevated ${
    live ? "border-emerald-500/40" : "border-line"
  }`;

  if (rs.ak) {
    return (
      <Link to={`/${slug}/ak/${rs.ak.id}`} className={className}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}
