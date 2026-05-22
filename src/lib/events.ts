import { fetchDashboardHTML } from "./api";
import type { EventInfo } from "./types";

// The dashboard has no JSON endpoint, so we parse its HTML. Each event renders as:
//   <h2><a href="/<slug>/">Name</a></h2>
//   <h4 class="text-muted"> <b>Location ·</b> When </h4>
export async function discoverEvents(signal?: AbortSignal): Promise<EventInfo[]> {
  const html = await fetchDashboardHTML(signal);
  const doc = new DOMParser().parseFromString(html, "text/html");

  const events: EventInfo[] = [];
  const seen = new Set<string>();

  doc.querySelectorAll("h2 > a[href]").forEach((a) => {
    const href = a.getAttribute("href") ?? "";
    const m = href.match(/^\/([^/]+)\/$/);
    if (!m) return;
    const slug = m[1];
    if (seen.has(slug)) return;
    seen.add(slug);

    const name = (a.textContent ?? slug).trim();

    // The descriptive <h4> is the next element sibling of the <h2>.
    const h4 = a.closest("h2")?.nextElementSibling;
    let location = "";
    let when = "";
    if (h4 && h4.tagName === "H4") {
      const bold = h4.querySelector("b")?.textContent ?? "";
      location = bold.replace(/[·•]\s*$/, "").trim();
      const full = (h4.textContent ?? "").replace(/\s+/g, " ").trim();
      when = full.replace(bold, "").replace(/^[·•\s]+/, "").trim();
    }

    events.push({ slug, name, location, when });
  });

  return events;
}
