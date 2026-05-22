import type { AK, AKSlot, Category, Owner, Room, Track } from "./types";

// The upstream AKPlanning API sends no CORS headers, so the browser can't call it
// directly. We reach it through a proxy, but the proxy differs by environment:
//   - dev:  Vite's server proxy maps /ak/* -> https://ak.kif.rocks/* (vite.config.ts)
//   - prod: the serverless function api/proxy.js, called as /api/proxy?path=<path>
// (We call the function directly rather than via a vercel.json rewrite, because
// rewrites turned out to be ignored on this Vercel project — the function works.)
//
// `relPath` is the upstream path WITHOUT a leading slash, e.g. "kif540/api/ak/".
function proxyUrl(relPath: string): string {
  if (import.meta.env.DEV) return `/ak/${relPath}`;
  return `/api/proxy?path=${encodeURIComponent(relPath)}`;
}

async function getJSON<T>(relPath: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(proxyUrl(relPath), {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${relPath}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  aks: (slug: string, signal?: AbortSignal) =>
    getJSON<AK[]>(`${slug}/api/ak/`, signal),
  slots: (slug: string, signal?: AbortSignal) =>
    getJSON<AKSlot[]>(`${slug}/api/akslot/`, signal),
  rooms: (slug: string, signal?: AbortSignal) =>
    getJSON<Room[]>(`${slug}/api/room/`, signal),
  categories: (slug: string, signal?: AbortSignal) =>
    getJSON<Category[]>(`${slug}/api/akcategory/`, signal),
  owners: (slug: string, signal?: AbortSignal) =>
    getJSON<Owner[]>(`${slug}/api/akowner/`, signal),
  tracks: (slug: string, signal?: AbortSignal) =>
    getJSON<Track[]>(`${slug}/api/aktrack/`, signal),
};

// The dashboard root page lists all events; fetch its HTML so events.ts can parse it.
export async function fetchDashboardHTML(signal?: AbortSignal): Promise<string> {
  const res = await fetch(proxyUrl(""), { signal });
  if (!res.ok) throw new Error(`Dashboard request failed (${res.status})`);
  return res.text();
}
