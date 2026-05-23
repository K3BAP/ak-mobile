// Client-only reminders for starred AKs. Like favorites, this stays purely on the
// device — nothing is sent upstream. We fire a local notification a user-chosen lead
// time before a starred slot begins, while the PWA is open or recently backgrounded.

import { formatTime } from "./time";
import type { ResolvedSlot } from "./types";

export const LEAD_OPTIONS = [5, 10, 15, 30] as const;
export const DEFAULT_LEAD_MINUTES = 10;

const ENABLED_KEY = "akc:notify:enabled";
const LEAD_KEY = "akc:notify:lead";
const FIRED_PREFIX = "akc:notify:fired:";

function firedKey(slug: string): string {
  return `${FIRED_PREFIX}${slug}`;
}

function readFired(slug: string): Set<number> {
  try {
    const raw = localStorage.getItem(firedKey(slug));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

export function isSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "showNotification" in ServiceWorkerRegistration.prototype
  );
}

export const notifications = {
  isEnabled(): boolean {
    return localStorage.getItem(ENABLED_KEY) === "1";
  },
  setEnabled(value: boolean): void {
    if (value) localStorage.setItem(ENABLED_KEY, "1");
    else localStorage.removeItem(ENABLED_KEY);
  },
  leadMinutes(): number {
    const raw = Number(localStorage.getItem(LEAD_KEY));
    return (LEAD_OPTIONS as readonly number[]).includes(raw)
      ? raw
      : DEFAULT_LEAD_MINUTES;
  },
  setLeadMinutes(value: number): void {
    localStorage.setItem(LEAD_KEY, String(value));
  },
  hasFired(slug: string, slotId: number): boolean {
    return readFired(slug).has(slotId);
  },
  markFired(slug: string, slotId: number): void {
    const ids = readFired(slug);
    ids.add(slotId);
    localStorage.setItem(firedKey(slug), JSON.stringify([...ids]));
  },
};

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isSupported()) return "denied";
  return Notification.requestPermission();
}

export async function showSlotReminder(
  rs: ResolvedSlot,
  slug: string,
  offsetMinutes: number,
): Promise<void> {
  if (!rs.ak) return;
  const reg = await navigator.serviceWorker.ready;

  const title = rs.ak.short_name || rs.ak.name;
  const where = rs.room
    ? rs.room.location
      ? `${rs.room.name}, ${rs.room.location}`
      : rs.room.name
    : "Room TBA";
  const minsLeft = Math.max(1, Math.round((rs.start.getTime() - Date.now()) / 60000));
  const body = `Starts ${formatTime(rs.start, offsetMinutes)} (in ${minsLeft} min)\n${where}`;

  await reg.showNotification(title, {
    body,
    tag: `akc-reminder-${slug}-${rs.slot.id}`,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: `/${slug}/ak/${rs.ak.id}` },
  });
}
