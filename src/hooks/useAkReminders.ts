import { useEffect } from "react";
import { notifications, showSlotReminder } from "../lib/notifications";
import type { EventData } from "./useEventData";

const TICK_MS = 30000;

// Fires a local notification the user's chosen lead time before each starred, scheduled
// slot begins. Runs only while the app is open; a fired-marker keeps each slot to a
// single reminder. Enabled/permission/lead are read fresh each tick so changes made in
// Settings take effect on the next tick without a remount.
export function useAkReminders({
  slug,
  data,
  favIds,
}: {
  slug: string;
  data: EventData | null;
  favIds: Set<number>;
}): void {
  useEffect(() => {
    if (!data) return;

    const check = () => {
      if (!notifications.isEnabled() || Notification.permission !== "granted") return;
      const now = Date.now();
      const lead = notifications.leadMinutes() * 60000;
      for (const rs of data.resolvedSlots) {
        const akId = rs.slot.ak;
        if (akId == null || !favIds.has(akId)) continue;
        const start = rs.start.getTime();
        if (now >= start - lead && now < start && !notifications.hasFired(slug, rs.slot.id)) {
          notifications.markFired(slug, rs.slot.id);
          void showSlotReminder(rs, slug, data.offsetMinutes);
        }
      }
    };

    check();
    const id = setInterval(check, TICK_MS);
    return () => clearInterval(id);
  }, [slug, data, favIds]);
}
