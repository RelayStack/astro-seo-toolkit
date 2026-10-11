# Changelog

All notable changes, newest first. Versions follow semver.

## Unreleased

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
