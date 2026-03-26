# Hosted HTML Report Viewer (feature idea)

**Issue title:** `feat: hosted viewer for HTML report artifacts (zero-install, browser-only)`

Issue https://github.com/vitest-dev/vitest/issues/9971

Inspired by https://trace.playwright.dev/

## Problem

After `vitest --merge-reports --reporter=html` in CI, the HTML report is uploaded as a GitHub Actions artifact zip. Viewing it requires: download zip, unzip, run local static server. Friction.

## Idea

Host a static viewer page (e.g. `vitest.dev/report`) that lets users:
1. Drag-and-drop the artifact zip onto the page
2. Client-side JS unzips it and renders the report in-browser — no server needed

## Key difference from Playwright's trace viewer

Vitest's HTML report artifact is already a complete static site (SPA + data bundled together).
Playwright's case is different — trace.playwright.dev is a viewer SPA, and the artifact is raw
trace data. The viewer interprets the data format.

For Vitest, the artifact zip already contains everything needed to render — so the "viewer"
is really just an unpacker. The approach could be as simple as a service worker that serves
files from the unzipped blob, then loads the existing `index.html` from the artifact.

However, the practical concern is the same as Playwright's: **version compatibility**.
The deployed viewer/unpacker on `vitest.dev/report` would be from the latest release,
but the artifact's SPA + data format could be from any older Vitest version. Options:
- Use the SPA from inside the artifact itself (safest — no compat issues, viewer is just a shell)
- Pin a stable data format for the JSON payload and keep the hosted SPA backward-compatible

Using the artifact's own SPA is probably the right call — the viewer page is then truly
just a "zip unpacker + static file server in the browser" and version doesn't matter.

## Why it's feasible

- The HTML reporter is already a Vite-built SPA ([packages/ui](../../packages/ui))
- Report data is self-contained (SPA + JSON in `html/` directory)
- Client-side unzip is straightforward (`fflate`, `DecompressionStream`, etc.)
- Service worker approach (like Playwright) can serve files from the zip as if it were a real server,
  meaning the existing SPA works unmodified

## Possible enhancements

- **URL param**: `vitest.dev/report?url=<artifact-url>` for zero-click from CI comments
  (limited to public repos / unauthenticated URLs though)
- **GitHub App / Action**: post a PR comment with a direct viewer link after merge-reports
- **Offline**: could also work as `vitest --preview-report` CLI command using Vite's preview server

## Prior art

- https://trace.playwright.dev/ — drag-and-drop trace zip viewer
- Playwright uses service worker + zip.js to serve files from the zip as if it were a real server
- Key similarity: both face version compat between deployed viewer and artifact format

## Insight: this is not Vitest-specific

The "SW-based zip viewer" is a fully generic concept — serve any static site from a zip
via service worker. Could be a standalone tool (e.g. `zipview.dev`) that works for any
static site artifact: Vitest HTML reports, Storybook builds, Vitepress sites, etc.

Vitest could either:
1. Build a generic zip viewer and host it on `vitest.dev/report` with branding
2. Use/create a standalone tool and just document it in the merge-reports guide
3. Both — a generic library with a Vitest-branded instance

The SW implementation is trivial (~100 lines): register SW, intercept fetch,
look up path in zip entries, return blob as Response. No data format knowledge needed.

## Existing implementations (fact-checked)

- **[client-side-zip-server](https://github.com/gkjohnson/client-side-zip-server)** — generic SW that intercepts fetch and serves from zip. 12 stars. Real.
- **[zip-browser](https://github.com/mathiasvr/zip-browser)** — browse zip contents via SW. 1 star. Real.
- ~~artyom.dev/zipserver~~ — server-side Go, NOT client-side SW. Irrelevant.

Not widely productionized outside of Playwright's trace viewer. Fairly greenfield.

## Playwright trace viewer internals

Reference: `~/code/others/playwright/packages/trace-viewer/src/sw/`

- `main.ts` — service worker that intercepts all fetch events via `self.addEventListener('fetch', ...)`
- `traceLoaderBackends.ts` — `ZipTraceLoaderBackend` uses `@zip.js/zip.js` `HttpReader` to
  fetch the zip via HTTP and unzip entries client-side. NOT drag-and-drop — URL-based
  (`trace.playwright.dev/?trace=https://...url-to-trace.zip`)
- The SW responds to routes like `/contexts`, `/snapshot/*`, `/sha1/*` with data from the zip
- The main SPA makes normal `fetch()` calls — doesn't know data comes from a zip

---

## Draft feature request (for vitest-dev/vitest)

**Title:** `feat: hosted viewer for HTML report artifacts (zero-install, browser-only)`

**Clear and concise description of the problem:**

Vitest's `--reporter=html` produces a self-contained static site. In CI, this gets uploaded as an artifact zip. Viewing it requires: download zip -> unzip -> `npx serve html/` -> open browser. This applies to any CI workflow producing HTML reports — whether from `--merge-reports` or a regular run.

Note: GitLab CI can [preview HTML artifacts directly in the browser](https://docs.gitlab.com/ee/ci/jobs/job_artifacts.html) (powered by GitLab Pages). But GitHub Actions — the most common CI for Vitest users — does not support this, so the friction is real for most users.

**Suggested solution:**

Host a static viewer page (e.g. `vitest.dev/report`) that lets users open an HTML report artifact zip entirely in the browser — no server, no install.

Implementation: a service worker intercepts fetch requests and serves files from the unzipped artifact. Since the HTML report is already a self-contained static site (SPA + data), the viewer is just a thin "zip unpacker + virtual file server" shell. The actual rendering comes from the artifact's own `index.html`, so there are no version compatibility concerns between the hosted viewer and the report format.

Prior art:
- Playwright's trace viewer (`trace.playwright.dev`) uses this exact pattern — a service worker + `@zip.js/zip.js` to serve trace data from a zip URL
- [`client-side-zip-server`](https://github.com/gkjohnson/client-side-zip-server) — generic SW-based zip serving

The core SW implementation is small (~100 lines). UX would primarily be drag-and-drop. A `?url=` param is technically feasible — both GitHub API and the Azure blob storage redirect target set `Access-Control-Allow-Origin: *` — but the GitHub artifact download API requires authentication. The redirect target (a pre-signed Azure blob URL, expires in ~1 min) is publicly accessible, so `?url=` could work if a CI step posts a comment with that URL. Drag-and-drop is the simpler, more universal approach.

This concept might be actually generic to any zipped static site, not Vitest-specific. If implementation turns out to be fully agnostic, it could live as a standalone tool that Vitest simply documents/recommends.

## Prototype

Working MVP in `.dev-notes/dist/zipview/` — two files (`index.html` + `sw.js`).
Drop a zip, SW serves files from Cache API into an iframe. Directory listing when no index.html found.
Tested with the `vitest-merge-reports` artifact containing `test/core/html` and `test/cli/html`.

## Follow-up ideas

**UX polish**
- File picker button (not just drag-and-drop) — mobile/accessibility
- Persist last zip in IndexedDB so refresh doesn't lose state
- Header bar showing zip name / file count, "Back to drop" button to load a different zip

**URL-based loading**
- `?url=` param for public URLs (pre-signed Azure blob URLs from GitHub, S3 buckets, etc.)
- GitHub's signed artifact URLs expire in ~1 min, so impractical for PR comments without a proxy
- Works well for self-hosted artifacts or public buckets

**Multi-zip / tabbed view**
- Drop multiple zips -> tabs (e.g. test/core and test/cli side by side)
- Or: auto-detect multiple `html/` dirs in one artifact zip and show as tabs
- Currently works via directory listing but tabs would be nicer

**Standalone distribution**
- Publish as tiny npm package (`npx zipview`) — starts local server with the two files
- Host on `vitest.dev/report` (or a generic domain) for zero-install browser use
- Could be a single self-contained HTML file if SW is inlined as blob URL (scope rules may complicate)

**Self-bootstrapping HTML reporter** (most ambitious)
- Embed zipview's SW directly in Vitest's HTML reporter output
- The zip becomes self-bootstrapping: open zip, double-click index.html, it registers its own SW, reloads from cache
- No external viewer needed at all
