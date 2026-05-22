// The API returns each slot's start as an absolute instant — sometimes with the
// venue offset ("...+02:00"), sometimes in UTC ("...Z"). Either way `new Date()`
// parses it to the correct instant. We always render the *venue* wall-clock time
// (regardless of the device timezone) by shifting the instant by the venue's
// offset and reading the UTC fields.
//
// KIF takes place in Central Europe, so the venue zone is Europe/Berlin. We derive
// the offset from the IANA zone (DST-aware) rather than trusting the ISO string,
// which is robust to the server emitting either UTC or a fixed offset.
export const VENUE_TZ = "Europe/Berlin";

// Offset (in minutes) of `timeZone` at the given instant, e.g. +120 for CEST.
export function venueOffsetMinutes(instant: Date, timeZone: string = VENUE_TZ): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p: Record<string, string> = {};
  for (const part of dtf.formatToParts(instant)) p[part.type] = part.value;
  const hour = p.hour === "24" ? 0 : Number(p.hour);
  const asUTC = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    hour,
    Number(p.minute),
    Number(p.second),
  );
  return Math.round((asUTC - instant.getTime()) / 60000);
}

export function parseDurationHours(duration: string): number {
  const h = parseFloat(duration);
  return Number.isFinite(h) ? h : 0;
}

// A Date whose UTC getters yield the venue wall-clock numbers for `instant`.
function venueWall(instant: Date, offsetMinutes: number): Date {
  return new Date(instant.getTime() + offsetMinutes * 60000);
}

export function formatTime(instant: Date, offsetMinutes: number): string {
  const w = venueWall(instant, offsetMinutes);
  const hh = String(w.getUTCHours()).padStart(2, "0");
  const mm = String(w.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// Stable per-day key (venue-local date) used for grouping & day tabs.
export function dayKey(instant: Date, offsetMinutes: number): string {
  const w = venueWall(instant, offsetMinutes);
  return `${w.getUTCFullYear()}-${String(w.getUTCMonth() + 1).padStart(2, "0")}-${String(
    w.getUTCDate(),
  ).padStart(2, "0")}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function dayLabelParts(instant: Date, offsetMinutes: number): {
  weekday: string;
  day: number;
  month: string;
} {
  const w = venueWall(instant, offsetMinutes);
  return {
    weekday: WEEKDAYS[w.getUTCDay()],
    day: w.getUTCDate(),
    month: MONTHS[w.getUTCMonth()],
  };
}

export function durationLabel(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export function rangeLabel(
  start: Date,
  end: Date,
  offsetMinutes: number,
): string {
  return `${formatTime(start, offsetMinutes)} – ${formatTime(end, offsetMinutes)}`;
}

// Human "in 25 min" / "5 min ago" relative to now.
export function relativeLabel(target: Date, now: Date): string {
  const diffMin = Math.round((target.getTime() - now.getTime()) / 60000);
  const abs = Math.abs(diffMin);
  const unit = abs >= 90 ? `${Math.round(abs / 60)} h` : `${abs} min`;
  if (diffMin > 0) return `in ${unit}`;
  if (diffMin < 0) return `${unit} ago`;
  return "now";
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function minutesBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 60000;
}
