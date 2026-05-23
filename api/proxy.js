// Reverse proxy to the AKPlanning backend.
//
// Why a function instead of a plain vercel.json external rewrite: the upstream
// (https://ak.kif.rocks) sends no CORS headers, so the browser can't call it
// directly. A direct external rewrite proved unreliable on Vercel for this host,
// so we proxy here where we control the request fully. The browser calls
// /ak/<path> (see src/lib/api.ts); vercel.json forwards that to /api/proxy?path=<path>.

const UPSTREAM = "https://ak.kif.rocks";

export default async function handler(req, res) {
  const raw = req.query.path;
  let path = Array.isArray(raw) ? raw.join("/") : raw || "";
  // Defensive: undo any encoding of the captured path segments.
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep as-is if it isn't encoded */
  }
  path = path.replace(/^\/+/, "");

  const target = `${UPSTREAM}/${path}`;

  try {
    const upstream = await fetch(target, {
      method: "GET",
      headers: { Accept: req.headers["accept"] || "*/*" },
      redirect: "follow",
    });

    const body = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status);
    res.setHeader(
      "content-type",
      upstream.headers.get("content-type") || "application/octet-stream",
    );
    // Short fresh window, then serve stale instantly while revalidating in the
    // background so reloads stay fast well past the 60s mark.
    res.setHeader(
      "cache-control",
      "public, max-age=60, stale-while-revalidate=86400",
    );
    res.send(body);
  } catch (err) {
    res.status(502).json({ error: "Upstream request failed", detail: String(err) });
  }
}
