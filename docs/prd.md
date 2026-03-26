## TODO

- [ ] chore: organize project structure
  - agent docs
- [ ] refactor: rework code
- [ ] chore: deploy app

## Backlog

- File picker button (not just drag-and-drop) — mobile/accessibility
- Persist last zip in IndexedDB so refresh doesn't lose state
- `?url=` param for public URLs (GitHub artifact download requires auth, but pre-signed Azure blob URLs and S3 buckets work)
- Multi-zip / tabbed view — drop multiple zips, or auto-detect multiple dirs in one zip
- Publish as `npx zipview`
- Self-bootstrapping: embed SW in the static site output itself so the zip is directly openable
