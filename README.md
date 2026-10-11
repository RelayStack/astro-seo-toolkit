# Astro SEO Toolkit — llms.txt, JSON-LD, IndexNow, Sitemaps

[![MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE) [![Node](https://img.shields.io/badge/node-18%2B-brightgreen.svg)](seo-toolkit/package.json) [![Tests](https://img.shields.io/badge/tests-14%2F14-brightgreen.svg)](seo-toolkit/test.mjs)

Zero-dependency SEO toolkit for Astro and static sites. Generate `llms.txt`, `sitemap.xml` and `robots.txt`, build JSON-LD schema, and push URL updates via IndexNow — with plain Node 18+, no installs. Built for 2026 search: AI answers (ChatGPT, Perplexity, AI Overviews) cite sites that are machine-readable and quotable, and classic search (Google, Bing) still runs on sitemaps and schema.

If this saves you an hour, leave a ⭐ — it keeps the project alive.

- [Tools](#tools) · [Quick start](#quick-start) · [Wiring into Astro](#wiring-into-astro) · [Locales](#locales) · [Layout](#layout) · [Contributing](#contributing)

## Tools

| Tool | File | One-liner |
| ---- | ---- | --------- |
| llms.txt | [`seo-toolkit/llms-txt.mjs`](seo-toolkit/llms-txt.mjs) | Content index for LLMs from your Markdown directory |
| JSON-LD | [`seo-toolkit/json-ld.mjs`](seo-toolkit/json-ld.mjs) | `LocalBusiness`, `Service`, `FAQPage` schema in any locale |
| IndexNow | [`seo-toolkit/indexnow.mjs`](seo-toolkit/indexnow.mjs) | Instant indexing via Bing, Yandex, Seznam, Naver |
| Sitemap | [`seo-toolkit/sitemap.mjs`](seo-toolkit/sitemap.mjs) | `sitemap.xml` from the same content directory |
| robots.txt | [`seo-toolkit/robots.mjs`](seo-toolkit/robots.mjs) | Sitemap reference + optional AI-crawler rules |
| GEO checklist | [`notes/geo-checklist.md`](notes/geo-checklist.md) | 2026 AI-search checklist for local business sites |

Full flags and API per tool: [`seo-toolkit/README.md`](seo-toolkit/README.md).

## Quick start

```bash
cd seo-toolkit
npm test                                    # 13/13 should pass
node llms-txt.mjs --dir ../notes --site https://example.com --out ../public/llms.txt
node sitemap.mjs  --dir ../notes --site https://example.com --out ../public/sitemap.xml
node robots.mjs   --site https://example.com --out ../public/robots.txt
node indexnow.mjs --host example.com --key YOUR_KEY --url https://example.com/new
```

JSON-LD in any page:

```js
import { service, toScript } from "./seo-toolkit/json-ld.mjs";

const html = toScript(service({
  name: "House Cleaning",
  url: "https://example.com/cleaning",
  areaServed: "Austin, TX",
  price: { from: "120", currency: "USD", note: "From $120, flat rate" },
}));
```

## Wiring into Astro

Run the generators on every build so `llms.txt` and the sitemap never go stale:

```json
{ "scripts": { "build": "node ./seo/llms-txt.mjs --dir src/content --site https://example.com --out public/llms.txt && astro build" } }
```

Render schema in your layout with `set:html`:

```astro
---
import { localBusiness, toScript } from "../seo/json-ld.mjs";
const schema = toScript(localBusiness({ name: "Example Co.", url: Astro.site }));
---
<Fragment set:html={schema} />
```

Works with any static setup, not just Astro: Eleventy, Hugo, Next.js static export — anything with a Markdown directory and a Node build step.

## Locales

No locale is assumed. Pass `country` on addresses and `currency` on prices explicitly; currency falls back to `USD` only. One page per service and location, JSON-LD with the matching `addressCountry`, and the [`GEO checklist`](notes/geo-checklist.md) as a repeatable launch routine — in whatever language your customers read.

## Layout

```text
seo-toolkit/   dependency-free helpers + tests (Node 18+, no installs)
notes/         short checklists and tooling notes
examples/      minimal runnable Cloudflare Worker snippet
llms.txt       machine-readable index of this repo
```

## Contributing

Questions, ideas, bug reports: use [Discussions](../../discussions). PRs welcome — keep helpers dependency-free and tested (`npm test`).

## License

MIT — see LICENSE. By RelayStack.
