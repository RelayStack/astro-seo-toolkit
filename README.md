# RelayStack Lab — SEO Toolkit for Astro & Static Sites

[![MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE) [![Node](https://img.shields.io/badge/node-18%2B-brightgreen.svg)](seo-toolkit/package.json)

Dependency-free SEO helpers for Astro and static sites: `llms.txt` generator, JSON-LD schema builders, IndexNow submitter, sitemap and `robots.txt` generators. Zero installs — copy what you need. Built for AI-search visibility (ChatGPT, Perplexity, AI Overviews) as well as classic search (Google, Bing).

## What's inside

| Tool | File | What it does |
| ---- | ---- | ------------ |
| llms.txt | `seo-toolkit/llms-txt.mjs` | Generate `llms.txt` from a Markdown content directory |
| JSON-LD | `seo-toolkit/json-ld.mjs` | `LocalBusiness`, `Service`, `FAQPage` schema with `ab CHF` price notes |
| IndexNow | `seo-toolkit/indexnow.mjs` | Notify Bing/Yandex/Seznam about changed URLs |
| Sitemap | `seo-toolkit/sitemap.mjs` | Generate `sitemap.xml` from the same content directory |
| robots.txt | `seo-toolkit/robots.mjs` | Generate `robots.txt` with sitemap reference + AI-crawler rules |
| Checklist | `notes/geo-checklist.md` | 2026 AI-search (GEO) checklist for Swiss business sites |

`examples/` holds minimal runnable Cloudflare snippets. `notes/` holds short tooling notes.

## Quick start

```bash
cd seo-toolkit
npm test
node llms-txt.mjs --dir ../notes --site https://example.com --out ../public/llms.txt
node sitemap.mjs --dir ../notes --site https://example.com --out ../public/sitemap.xml
node robots.mjs --site https://example.com --sitemap /sitemap.xml --out ../public/robots.txt
node indexnow.mjs --host example.com --key YOUR_KEY --url https://example.com/neu
```

```js
import { service, toScript } from "./seo-toolkit/json-ld.mjs";

const html = toScript(service({
  name: "Ferienwohnung Reinigung",
  url: "https://example.com/reinigung",
  areaServed: "Basel",
  price: { from: "120" },
}));
```

## Who it's for

Small-business Astro sites in Switzerland: German de-CH copy in Sie-form, prices as "ab CHF", Cloudflare hosting (Pages/Workers), JSON-LD on every service page, `llms.txt` + IndexNow from day one.

## Conventions

- Prefer Cloudflare primitives (Workers, Pages, D1, KV, R2) where they fit.
- No dependencies in `seo-toolkit/` — Node 18+ stdlib only, tested with `node --test`.
- Questions and ideas: use [Discussions](../../discussions).

## License

MIT — see LICENSE.
