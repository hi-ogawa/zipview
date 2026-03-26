# zipview

> [!NOTE]
> experiment for https://github.com/vitest-dev/vitest/issues/9971

View any static site from a zip file — entirely in the browser, no server needed.

A service worker intercepts fetch requests and serves files from the unzipped content via Cache API. The viewer is generic — it doesn't know or care what's inside the zip. Works with Vitest HTML reports, Storybook builds, Vitepress sites, or any static site.

## Usage

```bash
npx serve .
```

Then drag-and-drop a zip file onto the page. If the zip contains an `index.html`, it loads automatically. Otherwise, a directory listing is shown.

## How it works

1. `index.html` — drop zone UI, unzips with [fflate](https://github.com/101arrowz/fflate) (CDN), stores files in Cache API, registers service worker, loads content in iframe
2. `sw.js` — intercepts fetch under `/zipview/site/`, serves from Cache API, generates directory listings when no index.html is found

That's it. Two files, no build step, no dependencies to install.

## Motivation

CI produces static site artifacts (e.g. Vitest HTML reports via `--reporter=html`). On GitHub Actions, viewing them requires: download zip -> unzip -> run local static server -> open browser.

GitLab CI can [preview HTML artifacts directly in the browser](https://docs.gitlab.com/ee/ci/jobs/job_artifacts.html) (powered by GitLab Pages). GitHub Actions does not.

Inspired by [Playwright's trace viewer](https://trace.playwright.dev/) which uses the same service worker + zip pattern, but for Playwright-specific trace data rather than generic static sites.

## Prior art

- [trace.playwright.dev](https://trace.playwright.dev/) — SW + `@zip.js/zip.js`, URL-based loading of trace zips
- [client-side-zip-server](https://github.com/gkjohnson/client-side-zip-server) — generic SW-based zip serving

## Follow-up ideas

- File picker button (not just drag-and-drop) — mobile/accessibility
- Persist last zip in IndexedDB so refresh doesn't lose state
- `?url=` param for public URLs (GitHub artifact download requires auth, but pre-signed Azure blob URLs and S3 buckets work)
- Multi-zip / tabbed view — drop multiple zips, or auto-detect multiple dirs in one zip
- Publish as `npx zipview`
- Self-bootstrapping: embed SW in the static site output itself so the zip is directly openable
