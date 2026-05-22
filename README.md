# AK Companion

A clean, mobile-first read-only companion for [AKPlanning](https://ak.kif.rocks/)
(the KIF AK scheduling system). It consumes the existing public per-event JSON API
and presents a premium dark UI optimized for phones.

## Features

- **Events** — auto-discovered from the AKPlanning dashboard; recent events remembered on-device.
- **Now & Next** — live "happening now" and upcoming sessions, updating each minute.
- **Schedule** — day tabs with a chronological, touch-friendly list (replaces the desktop FullCalendar timeline); filter by category and room.
- **Browse** — instant search across name / owner / description, category filter pills.
- **AK detail** — description, goal, owners, scheduled times & rooms, external links.
- **Rooms** — per-room schedule, expandable.
- **My agenda** — star any AK (stored in `localStorage`), grouped by day, with overlap/conflict flagging.
- **Installable PWA** — add to your home screen for a full-screen, app-like experience (manifest + service worker via `vite-plugin-pwa`).

## Install on your phone

Serve the built app over **HTTPS** (a service worker requires a secure origin), then:

- **iOS / Safari** — Share → *Add to Home Screen*.
- **Android / Chrome** — the *Install app* prompt appears, or use the ⋮ menu → *Install app*.

The app then launches standalone (no browser chrome). Static assets are cached for offline
launch; live AK data still needs a connection.

## Stack

Vite + React + TypeScript + Tailwind CSS + React Router. No global state library; a
tiny cached-fetch hook (`useResource`) and a join hook (`useEventData`) are the whole
data layer.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle into dist/
```

## Important: API proxy / CORS

The upstream AKPlanning API (`https://ak.kif.rocks`) sends **no CORS headers**, so a
browser cannot call it directly from another origin. Requests are therefore made to a
relative `/ak/...` prefix:

- **Development** — `vite.config.ts` proxies `/ak` → `https://ak.kif.rocks`.
- **Production** — serve this app behind a reverse proxy that forwards `/ak/*` to the
  upstream (or host it on the same origin). Override the prefix with the `VITE_API_BASE`
  env var if you mount it elsewhere.

### Deploying on Vercel

`vercel.json` already wires this up — no env vars needed:

```json
{
  "rewrites": [
    { "source": "/ak/:path*", "destination": "https://ak.kif.rocks/:path*" },
    { "source": "/:path*", "destination": "/index.html" }
  ]
}
```

The first rewrite makes Vercel proxy `/ak/*` to the upstream **server-side**, so the
browser only ever talks to your own origin and CORS never applies. The second is the
SPA fallback for client-side routes (deep links like `/kif540/schedule`); static assets
in `dist/` are served by Vercel's filesystem before rewrites run, so they're untouched.

Project settings on Vercel: framework preset **Vite**, and set **Root Directory** to
`ak-companion` if this lives in a subfolder of the repo.

## Data notes

- The app is **read-only**. Submission and preference polls require session+CSRF auth
  that isn't available cross-origin, so they're intentionally out of scope; the personal
  agenda lives entirely on-device.
- There is no event-metadata endpoint, so the event list is parsed from the dashboard
  HTML (`src/lib/events.ts`) and the timezone/day range is derived from slot data.
- Times are always rendered in the **venue's** timezone (read from the slots' ISO
  offset) regardless of the device timezone.
