import type { EventDay } from "../hooks/useEventData";
import { dayLabelParts } from "../lib/time";

export function DayTabs({
  days,
  activeKey,
  onSelect,
  offsetMinutes,
}: {
  days: EventDay[];
  activeKey: string;
  onSelect: (key: string) => void;
  offsetMinutes: number;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
      {days.map((day) => {
        const parts = dayLabelParts(day.date, offsetMinutes);
        const active = day.key === activeKey;
        return (
          <button
            key={day.key}
            onClick={() => onSelect(day.key)}
            className={`flex min-w-[3.5rem] shrink-0 flex-col items-center rounded-2xl border px-3 py-2 transition-colors ${
              active
                ? "border-accent bg-accent/15 text-accent"
                : "border-line bg-bg-card text-ink-soft active:bg-bg-elevated"
            }`}
          >
            <span className="text-[11px] font-medium uppercase tracking-wide">
              {parts.weekday}
            </span>
            <span className="text-lg font-bold leading-tight tabular-nums">
              {parts.day}
            </span>
            <span className="text-[10px] text-ink-faint">{parts.month}</span>
          </button>
        );
      })}
    </div>
  );
}
