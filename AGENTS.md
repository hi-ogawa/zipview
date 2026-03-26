# Agent Guide

## Quick Reference

| Command       | When               |
| ------------- | ------------------ |
| `npx serve .` | Start local server |

## Key Docs

| File          | Purpose                      |
| ------------- | ---------------------------- |
| `docs/prd.md` | Task list, features, roadmap |

## Architecture

Browser-only static site viewer from zip files. No build step, no server-side logic.

- **`index.html`** — drag-and-drop UI, unzips with [fflate](https://github.com/101arrowz/fflate) (CDN), stores files in Cache API, loads content in iframe
- **`sw.js`** — service worker, intercepts fetch under `/zipview/site/`, serves from cache, directory listing fallback

## Conventions

- No build step — vanilla HTML + JS, ES modules only
- Dependencies via CDN imports (no node_modules)

## Agent Rules

- **Never run long-running tasks** (dev servers, watch modes, etc.)
- User runs `npx serve .` manually in their terminal
- Confirm with user before committing

## Git Workflow

1. Commit logical changes separately
2. Confirm with user before committing
3. **Never rebase, never amend, never force push**
