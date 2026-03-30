## TODO

- [x] chore: organize project structure
  - added CLAUDE.md, AGENTS.md, .gitignore (following yt-dlp-ext pattern)
- [x] chore: deploy app
  - https://developers.cloudflare.com/workers/static-assets/
- [ ] chore: add example zip from vitest html artifact
- [ ] refactor: rework code
  - deduplicate fflate import (script tag on line 6 is dead weight, only the ES module import is needed)
  - share constants (CACHE_NAME, PREFIX) between index.html and sw.js instead of duplicating
  - move MIME map to sw.js (it's serving the files, not the main thread)
  - add try/catch around unzipSync for corrupt/non-zip files
  - consider async unzip for large zips (fflate has async `unzip`)
  - SW scope may break under subpath hosting

## Backlog

- "Load another zip" button — currently the drop zone hides permanently after first load, no way to swap without refresh
- File picker button (not just drag-and-drop) — mobile/accessibility
- Persist last zip in IndexedDB so refresh doesn't lose state
- `?url=` param for public URLs (GitHub artifact download requires auth, but pre-signed Azure blob URLs and S3 buckets work)
- Multi-zip / tabbed view — drop multiple zips, or auto-detect multiple dirs in one zip
- Publish as `npx zipview`
- Self-bootstrapping: embed SW in the static site output itself so the zip is directly openable
