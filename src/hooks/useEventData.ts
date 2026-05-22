import { useMemo } from "react";
import { api } from "../lib/api";
import type {
  AK,
  AKSlot,
  Category,
  Owner,
  ResolvedSlot,
  Room,
  Track,
} from "../lib/types";
import { dayKey, parseDurationHours, venueOffsetMinutes } from "../lib/time";
import { useResource } from "./useResource";

export interface EventBundle {
  aks: AK[];
  slots: AKSlot[];
  rooms: Room[];
  categories: Category[];
  owners: Owner[];
  tracks: Track[];
}

export interface EventDay {
  key: string;
  date: Date; // an instant within that venue-day, for labelling
  slots: ResolvedSlot[];
}

export interface EventData {
  bundle: EventBundle;
  offsetMinutes: number;
  akById: Map<number, AK>;
  roomById: Map<number, Room>;
  categoryById: Map<number, Category>;
  ownerById: Map<number, Owner>;
  resolvedSlots: ResolvedSlot[]; // scheduled slots only, sorted by start
  slotsByAk: Map<number, ResolvedSlot[]>;
  days: EventDay[];
}

async function loadBundle(slug: string, signal: AbortSignal): Promise<EventBundle> {
  const [aks, slots, rooms, categories, owners, tracks] = await Promise.all([
    api.aks(slug, signal),
    api.slots(slug, signal),
    api.rooms(slug, signal),
    api.categories(slug, signal),
    api.owners(slug, signal),
    api.tracks(slug, signal).catch(() => [] as Track[]),
  ]);
  return { aks, slots, rooms, categories, owners, tracks };
}

export function useEventData(slug: string | null) {
  const { data, loading, error, reload } = useResource(
    slug ? `event:${slug}` : null,
    (signal) => loadBundle(slug as string, signal),
  );

  const derived = useMemo<EventData | null>(() => {
    if (!data) return null;
    const { aks, slots, rooms, categories, owners } = data;

    const akById = new Map(aks.map((a) => [a.id, a]));
    const roomById = new Map(rooms.map((r) => [r.id, r]));
    const categoryById = new Map(categories.map((c) => [c.id, c]));
    const ownerById = new Map(owners.map((o) => [o.id, o]));

    const scheduled = slots.filter((s) => s.start);
    const offsetMinutes = scheduled.length
      ? venueOffsetMinutes(new Date(scheduled[0].start))
      : 0;

    const resolvedSlots: ResolvedSlot[] = scheduled
      .map((slot) => {
        const start = new Date(slot.start);
        const end = new Date(
          start.getTime() + parseDurationHours(slot.duration) * 3600000,
        );
        const ak = slot.ak != null ? akById.get(slot.ak) ?? null : null;
        return {
          slot,
          ak,
          room: slot.room != null ? roomById.get(slot.room) ?? null : null,
          category: ak?.category != null ? categoryById.get(ak.category) ?? null : null,
          start,
          end,
        };
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const slotsByAk = new Map<number, ResolvedSlot[]>();
    for (const rs of resolvedSlots) {
      if (rs.slot.ak == null) continue;
      const list = slotsByAk.get(rs.slot.ak) ?? [];
      list.push(rs);
      slotsByAk.set(rs.slot.ak, list);
    }

    const dayMap = new Map<string, EventDay>();
    for (const rs of resolvedSlots) {
      const key = dayKey(rs.start, offsetMinutes);
      let day = dayMap.get(key);
      if (!day) {
        day = { key, date: rs.start, slots: [] };
        dayMap.set(key, day);
      }
      day.slots.push(rs);
    }
    const days = [...dayMap.values()].sort((a, b) => a.key.localeCompare(b.key));

    return {
      bundle: data,
      offsetMinutes,
      akById,
      roomById,
      categoryById,
      ownerById,
      resolvedSlots,
      slotsByAk,
      days,
    };
  }, [data]);

  return { data: derived, loading, error, reload };
}
