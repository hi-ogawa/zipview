## TODO

- [x] chore: organize project structure
  - added CLAUDE.md, AGENTS.md, .gitignore (following yt-dlp-ext pattern)
- [x] chore: deploy app https://developers.cloudflare.com/workers/static-assets/
- [x] chore: link to github https://github.com/hi-ogawa/zipview
- [x] chore: add example zip from vitest html artifact
- [x] `?url=` param for public URLs (GitHub artifact download requires auth, but pre-signed Azure blob URLs and S3 buckets work)
- [x] File picker button (not just drag-and-drop) — mobile/accessibility
- [x] refactor: remove dead fflate script tag, use single ESM import
- [x] refactor: fix XSS in fetch error display (Preact escapes by default)
- [x] refactor: parallelize cache.put() with Promise.all
- [x] refactor: consider async unzip for large zips (fflate has async `unzip`)
- [x] refactor: add try/catch around unzipSync for corrupt/non-zip files
- [x] refactor: SW ready blocks event listeners — make non-blocking, show "registering…" status
- [ ] refactor: share constants (CACHE_NAME, PREFIX) between index.html and sw.js
- [ ] refactor: extract `<style>` block from index.html to style.css
- [ ] refactor: subpath hosting — PREFIX is hardcoded to `/zipview/site/`; real fix derives it dynamically from location.pathname (also affects sw.js scope and startsWith check)
- [x] setup e2e

## Backlog

- [ ] Persist last zip in IndexedDB so refresh doesn't lose state
- [ ] Provide CLI / API to package SPA into "index.html + sw.js" bundle
- [ ] Integrate as Vitest html reporter two files mode
