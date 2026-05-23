import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// The upstream AKPlanning API sends no CORS headers, so the browser cannot call
// it cross-origin. In dev we proxy everything under /ak to the live server; in
// production this app must be served behind a reverse proxy that does the same.
const UPSTREAM = "https://ak.kif.rocks";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "icon-180.png"],
      manifest: {
        name: "AK Companion",
        short_name: "AK",
        description: "A clean, mobile view of the KIF AK schedule.",
        theme_color: "#0b0d10",
        background_color: "#0b0d10",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // SPA fallback, but never hijack the proxied API namespace.
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/ak\//],
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // Adds the notificationclick handler for starred-AK reminders.
        importScripts: ["sw-notifications.js"],
        // Serve event API responses from cache instantly, revalidate in the
        // background, and keep previously-viewed events available offline.
        // Matches both environments: /ak/* (dev proxy) and /api/proxy (prod).
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith("/ak/") ||
              url.pathname.startsWith("/api/proxy"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "ak-api",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
  server: {
    proxy: {
      "/ak": {
        target: UPSTREAM,
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/ak/, ""),
      },
    },
  },
});
