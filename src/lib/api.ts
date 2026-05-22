import type { AK, AKSlot, Category, Owner, Room, Track } from "./types";

// All requests go through the proxy prefix (see vite.config.ts). Override the
// base via VITE_API_BASE when serving behind a different reverse-proxy mount.
const BASE = import.meta.env.VITE_API_BASE ?? "/ak";

async function getJSON<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  aks: (slug: string, signal?: AbortSignal) =>
    getJSON<AK[]>(`/${slug}/api/ak/`, signal),
  slots: (slug: string, signal?: AbortSignal) =>
    getJSON<AKSlot[]>(`/${slug}/api/akslot/`, signal),
  rooms: (slug: string, signal?: AbortSignal) =>
    getJSON<Room[]>(`/${slug}/api/room/`, signal),
  categories: (slug: string, signal?: AbortSignal) =>
    getJSON<Category[]>(`/${slug}/api/akcategory/`, signal),
  owners: (slug: string, signal?: AbortSignal) =>
    getJSON<Owner[]>(`/${slug}/api/akowner/`, signal),
  tracks: (slug: string, signal?: AbortSignal) =>
    getJSON<Track[]>(`/${slug}/api/aktrack/`, signal),
};

// The dashboard root page lists all events; fetch its HTML so events.ts can parse it.
export async function fetchDashboardHTML(signal?: AbortSignal): Promise<string> {
  const res = await fetch(`${BASE}/`, { signal });
  if (!res.ok) throw new Error(`Dashboard request failed (${res.status})`);
  return res.text();
}

export { BASE as API_BASE };
