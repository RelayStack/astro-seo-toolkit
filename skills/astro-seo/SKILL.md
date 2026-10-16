---
name: astro-seo
description: "Implement SEO on Astro static sites: generate llms.txt, sitemap.xml, robots.txt, add JSON-LD schema (LocalBusiness, Service, FAQPage), submit URLs via IndexNow, run the GEO/AI-search launch checklist. Triggers on: astro seo, llms.txt, json-ld, sitemap, indexnow, robots.txt, schema markup, structured data, geo, ai search, astro launch."
license: MIT
metadata:
  version: "0.5.0"
  category: seo
---

# Astro SEO

Zero-dependency Node scripts in `scripts/` plus Astro wiring guides in `references/`. Node 18+, no installs. Scripts run standalone (`node scripts/<name>.mjs`; usage errors list the flags) and as imports. `scripts/integration.mjs` writes every file in one pass.

## Commands

| User says | You do |
| --------- | ------ |
| implement | Full wiring into an Astro project (section below) |
| audit [path] | Run every check in `references/audit.md` against source or `dist/`, report pass/fail |
| schema [page] | Emit JSON-LD with `scripts/json-ld.mjs`; per-page recipes in `references/astro-wiring.md` |
| generate | Write llms.txt + sitemap.xml + robots.txt in one pass with `scripts/integration.mjs` |
| llms-txt | Generate `public/llms.txt` from the content dir, then validate it |
| llms-full | Inline full page bodies into `public/llms-full.txt` (companion for agents that need more than the index) |
| sitemap / robots | Generate `public/sitemap.xml` / `public/robots.txt` |
| submit [urls] | IndexNow the changed URLs after deploy |
| geo | Walk `references/geo.md` item by item, fix or file issues for each gap |

Default to implement when the request is vague ("seo this site", "launch checklist").

## Implement

1. Locate the content dir (`src/content/**`, else `src/pages/**`) and the canonical URL (`astro.config.mjs` → `site`). Ask for the URL if `site` is unset.
2. Best option when the project can take a dev dependency: add the integration to `astro.config.mjs` so the files regenerate on every build.
   `npm install -D astro-seo-toolkit`
   `import astroSeo from "astro-seo-toolkit/integration";` → `integrations: [astroSeo({ contentDir: <content> })]`
3. Otherwise generate into the project's `public/` with a single command:
   `node scripts/integration.mjs --dir <content> --site <url> --out <project>/public`
   (or one file at a time: `node scripts/llms-txt.mjs`, `scripts/sitemap.mjs`, `scripts/robots.mjs`)
4. Schema: one `toScript(...)` block per page type in the Astro layout via `set:html` (recipes in `references/astro-wiring.md`). Every public page gets exactly one valid JSON-LD block.
5. Build hook: prepend generation to the project's `build` script so the files never go stale.
6. Verify with the audit command. Fix failures, never hand-wave them.
7. Post-deploy: submit changed URLs with `scripts/indexnow.mjs` (needs the site's IndexNow key file in place).

## Ground rules

- `llms.txt` is not a Google lever (Google ignores it). It serves Claude/GPT/Perplexity agents. Say so when asked.
- AI citations require normal indexation first: sitemap submitted, URLs indexed. No index, no citations.
- `--disallow-ai` only on explicit owner opt-out; it also kills AI citations.
- `references/` load on demand: `astro-wiring.md` for implementation detail, `audit.md` for verification, `geo.md` for launch review.
