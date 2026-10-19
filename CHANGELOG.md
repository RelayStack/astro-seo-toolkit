# Changelog

All notable changes, newest first. Versions follow semver.

## 0.5.1 — 2026-10-19

Docs and packaging only; no behavioural change.

- README links are absolute. Thirteen were relative, which resolves against
  npmjs.com on the package page and 404s — so every link in the README was broken
  on the one surface a package searcher actually lands on. Verified that every
  target exists.
- npm keywords widened to the queries people type: `llms-txt-generator`,
  `sitemap-generator`, `schema-markup`, `local-seo`,
  `generative-engine-optimization`, `agent-skill`, `zero-dependency`.
- Verified: 33 tests pass, `npm pack` ships 35 files with no build artefacts.

## Unreleased

## 0.5.0 — 2026-10-16

- **Fixed: every `npx` bin was a silent no-op.** The CLI guard compared `import.meta.url` to the basename of `process.argv[1]`, but npm runs bins through a `node_modules/.bin/*` symlink, so `argv[1]` was the link (`astro-seo-llms`) and never matched the real file (`llms-txt.mjs`). `npx astro-seo-llms`, `npm run` build hooks and the `github:RelayStack/...` form all exited `0` and wrote nothing. Now resolved with `realpathSync` + `pathToFileURL`, covered by a regression test that executes a bin through a symlink.
- New: `astro-seo-toolkit/integration` — a real Astro integration that writes `llms.txt`, `llms-full.txt`, `sitemap.xml` and `robots.txt` during `astro build`. Exposes `generate()`, `writeFiles()` and `normalizeOptions()` for build scripts.
- New bins: `astro-seo-toolkit` (everything at once) and `astro-seo-check` (validator).
- New: `scripts/sync-skill.mjs` generates the skill's vendored script copies; `npm run check:skill` fails CI if they drift.
- Usage hints now print the `npx astro-seo-*` invocation instead of `node <file>.mjs`.
- Docs: README rewritten — who it's for, Astro integration, comparison table, tighter install paths; social card redesigned and exported to `docs/social-preview.png`.
- Packaging: `engines`, `publishConfig`, optional `astro` peer dependency, expanded keywords, `.gitignore`.
- Tests: 33 (was 27).

## 0.4.0 — 2026-10-11

- `llms-full.mjs`: spec-companion generator with full bodies inlined + `--limit` guard
- Robustness: CRLF line endings, hidden dirs and `node_modules` skipped by collectors
- npm-ready: `files` allowlist, `exports` map, `astro-seo-*` bins (name verified free)
- Social card source (`docs/social-card.svg`, export 1280×640 PNG for upload)

## 0.3.0 — 2026-10-11

- `check.mjs` dist validator (llms.txt/sitemap/robots + agreement check), wired into the skill audit
- Minimal Astro integration example (`examples/astro/`)
- Repo professionalism: CI matrix, CONTRIBUTING, issue/PR templates, SECURITY.md, CHANGELOG
- Q&A discussions seeded (Astro wiring, llms.txt honesty)

## 0.2.0 — 2026-10-11

- Installable `astro-seo` agent skill (`skills/astro-seo/`: SKILL.md, scripts, Astro/audit/GEO references)
- `npx` bins: `astro-seo-llms`, `astro-seo-sitemap`, `astro-seo-robots`, `astro-seo-indexnow`
- Internationalized: explicit country/currency, neutral examples, general GEO checklist

## 0.1.0 — 2026-10-11

- `llms-txt.mjs`, `json-ld.mjs` (LocalBusiness/Service/FAQPage), `indexnow.mjs`, `sitemap.mjs`, `robots.mjs`
- `notes/geo-checklist.md`, Cloudflare Worker hello example
- Tested with `node --test`, zero dependencies
