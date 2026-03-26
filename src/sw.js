const CACHE_NAME = "zipview-v1";
const PREFIX = "/zipview/site/";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith(PREFIX)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const match = await cache.match(event.request);
      if (match) return match;

      // Try index.html for directory requests
      if (url.pathname.endsWith("/")) {
        const indexReq = new Request(url.origin + url.pathname + "index.html");
        const indexMatch = await cache.match(indexReq);
        if (indexMatch) return indexMatch;
      }

      // Generate directory listing if path is a directory prefix
      const dirPath = url.pathname.endsWith("/") ? url.pathname : url.pathname + "/";
      const relDir = dirPath.substring(PREFIX.length);
      const keys = await cache.keys();
      const entries = new Set();
      for (const req of keys) {
        const reqPath = new URL(req.url).pathname;
        if (!reqPath.startsWith(dirPath)) continue;
        const rest = reqPath.substring(dirPath.length);
        const slash = rest.indexOf("/");
        if (slash === -1) {
          entries.add(rest); // file
        } else {
          entries.add(rest.substring(0, slash) + "/"); // subdirectory
        }
      }

      if (entries.size > 0) {
        const sorted = [...entries].sort((a, b) => {
          // directories first
          const aDir = a.endsWith("/");
          const bDir = b.endsWith("/");
          if (aDir !== bDir) return aDir ? -1 : 1;
          return a.localeCompare(b);
        });
        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Index of ${relDir || "/"}</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
  h1 { font-size: 1.2rem; color: #333; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
  ul { list-style: none; padding: 0; }
  li { padding: 0.3rem 0; }
  a { color: #646cff; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .dir { font-weight: 600; }
</style></head><body>
<h1>Index of /${relDir}</h1>
<ul>
${relDir ? '<li><a href="../">..</a></li>' : ""}
${sorted.map((e) => `<li><a class="${e.endsWith("/") ? "dir" : ""}" href="${encodeURIComponent(e.replace(/\/$/, ""))}${e.endsWith("/") ? "/" : ""}">${e}</a></li>`).join("\n")}
</ul></body></html>`;
        return new Response(html, {
          status: 200,
          headers: { "Content-Type": "text/html" },
        });
      }

      return new Response("Not found in zip", { status: 404 });
    }),
  );
});
