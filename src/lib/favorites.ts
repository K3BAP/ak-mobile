// On-device personal agenda. The upstream "preferences" feature needs a session
// + CSRF and is window-gated, so we keep favorites purely client-side.

const KEY_PREFIX = "akc:favorites:";
const RECENTS_KEY = "akc:recent-events";

function key(slug: string): string {
  return `${KEY_PREFIX}${slug}`;
}

function read(slug: string): Set<number> {
  try {
    const raw = localStorage.getItem(key(slug));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

function write(slug: string, ids: Set<number>): void {
  localStorage.setItem(key(slug), JSON.stringify([...ids]));
}

export const favorites = {
  list(slug: string): Set<number> {
    return read(slug);
  },
  has(slug: string, akId: number): boolean {
    return read(slug).has(akId);
  },
  toggle(slug: string, akId: number): boolean {
    const ids = read(slug);
    if (ids.has(akId)) ids.delete(akId);
    else ids.add(akId);
    write(slug, ids);
    return ids.has(akId);
  },
};

export interface RecentEvent {
  slug: string;
  name: string;
}

export const recents = {
  list(): RecentEvent[] {
    try {
      return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]") as RecentEvent[];
    } catch {
      return [];
    }
  },
  nameFor(slug: string): string | null {
    return recents.list().find((e) => e.slug === slug)?.name ?? null;
  },
  push(entry: RecentEvent): void {
    const existing = recents.list().find((e) => e.slug === entry.slug);
    // Don't downgrade a known event name back to the bare slug.
    const name =
      entry.name && entry.name !== entry.slug
        ? entry.name
        : existing?.name ?? entry.slug;
    const next = [
      { slug: entry.slug, name },
      ...recents.list().filter((e) => e.slug !== entry.slug),
    ].slice(0, 6);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  },
};
