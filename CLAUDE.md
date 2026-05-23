# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A read-only, mobile-first PWA companion for [AKPlanning](https://ak.kif.rocks/) (the KIF
AK scheduling system). It consumes the existing public per-event JSON API and presents a
dark, phone-optimized UI. The app is intentionally read-only — submissions and preference
polls require session+CSRF auth that isn't available cross-origin.

## Commands

```bash
npm run dev      # Vite dev server at http://localhost:5173 (with /ak proxy + PWA dev mode)
npm run build    # tsc -b type-check, then production bundle into dist/
npm run preview  # serve the built dist/ locally
```

There is no test runner, linter, or formatter configured — `tsc -b` (via `npm run build`)
is the only correctness gate.

## API access & the CORS proxy (critical)

The upstream API (`https://ak.kif.rocks`) sends **no CORS headers**, so the browser can
never call it directly. All requests go through a same-origin proxy whose path differs by
environment — this split lives in `proxyUrl()` in [src/lib/api.ts](src/lib/api.ts):

- **Dev** — Vite server proxy maps `/ak/*` → upstream (see `server.proxy` in [vite.config.ts](vite.config.ts)).
- **Prod (Vercel)** — the serverless function [api/proxy.js](api/proxy.js), called **directly**
  as `/api/proxy?path=<path>`. Note: a `vercel.json` rewrite (`/ak/* → upstream`) is the
  obvious approach but was silently ignored on this Vercel project, returning `NOT_FOUND`.
  Calling the function directly is the verified-working path. Don't "simplify" this back to
  a rewrite. `vercel.json` only holds the SPA fallback.

The service worker caches both path shapes (`StaleWhileRevalidate`, see `workbox.runtimeCaching`
in [vite.config.ts](vite.config.ts)), and `navigateFallbackDenylist` keeps the SPA fallback
from hijacking `/ak/*`.

## Data layer

There is no global state library. The entire data layer is two hooks plus a module cache:

- **[useResource](src/hooks/useResource.ts)** — generic cached fetch. A module-level `Map`
  caches by key, so navigating between screens never refetches. `reload()` busts the entry;
  `seedCache()` lets prefetching warm it.
- **[useEventData](src/hooks/useEventData.ts)** — loads all six per-event endpoints in parallel
  (`loadBundle`), then `useMemo`-derives the joined view model: id→entity Maps, `resolvedSlots`
  (slots joined to AK/room/category, scheduled-only, sorted), `slotsByAk`, and `days`.
  `prefetchEvent(slug)` warms the cache before navigation (called on event-card hover/tap).
- The resolved `EventData` is published via **[EventContext](src/EventContext.tsx)** (`useEvent()`),
  set up by [EventLayout](src/components/EventLayout.tsx) once the bundle loads. All screens under
  `/:slug` read from `useEvent()` rather than fetching themselves.

The event list itself has **no JSON endpoint** — it's scraped from the dashboard HTML via
`DOMParser` in [src/lib/events.ts](src/lib/events.ts), so it's coupled to the upstream page markup.

## Timezone handling

Times always render in the **venue's** wall-clock time (Europe/Berlin), regardless of device
timezone. [src/lib/time.ts](src/lib/time.ts) derives a DST-aware offset from the IANA zone
(`venueOffsetMinutes`) and shifts instants by it before reading UTC fields. Never use a Date's
local getters for display — go through the helpers (`formatTime`, `dayKey`, `rangeLabel`, etc.).

## Routing & structure

- [App.tsx](src/App.tsx) — `/` is the event picker; everything else nests under `/:slug` inside
  `EventLayout` (now / schedule / browse / rooms / agenda / ak/:akId). Routes are wrapped in
  framer-motion `AnimatePresence` for page transitions.
- Before the routes, App gates on `useStandalone()`: non-installed users see [InstallScreen](src/screens/InstallScreen.tsx)
  unless they skip (stored in `sessionStorage`).
- `src/screens/` = route screens, `src/components/` = shared UI, `src/hooks/` = behavior hooks,
  `src/lib/` = pure logic (api, time, events, favorites, color, types).

## Theming

Themes are CSS custom properties on `[data-theme]` (9 themes in [src/index.css](src/index.css)).
Colors are stored as **space-separated RGB channels** so Tailwind `/<alpha-value>` opacity
modifiers work (e.g. `bg-bg/80`). Use the semantic Tailwind tokens — `bg`, `bg-soft`, `bg-card`,
`bg-elevated`, `line`, `ink`, `ink-soft`, `ink-faint`, `accent`, `accent-soft` (mapped in
[tailwind.config.js](tailwind.config.js)) — never hardcode hex. The theme list and swatches live
in [src/ThemeContext.tsx](src/ThemeContext.tsx); adding a theme means adding both a `THEMES` entry
and a `[data-theme="..."]` block in index.css.

## Client-only personal data

The personal agenda (starred AKs) and recent-events list are pure `localStorage`, in
[src/lib/favorites.ts](src/lib/favorites.ts) — never sent upstream.
