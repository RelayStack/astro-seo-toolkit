# Tool reference

All helpers live in `seo-toolkit/`, run on Node 18+ with zero dependencies. Every file works as a CLI and as an import. Exit code is non-zero on error; `--out FILE` writes, otherwise output goes to stdout.

## llms-txt.mjs — content index for LLMs

```bash
node llms-txt.mjs --dir src/content/blog --site https://example.com --out public/llms.txt
```

| Flag | Required | What it does |
| ---- | -------- | ------------ |
| `--dir` | yes | Markdown directory, scanned recursively |
| `--site` | yes | Base URL, e.g. `https://example.com` |
| `--title` | no | Heading, defaults to the site URL |
| `--description` | no | Blockquote under the heading |
| `--out` | no | Output file; prints to stdout if omitted |

Titles and descriptions come from Markdown frontmatter (`title:`, `description:`); pages without frontmatter fall back to the slug and a plain-text excerpt with markup stripped.

```js
import { collectPages, renderLlmsTxt } from "./llms-txt.mjs";
const pages = await collectPages("src/content/blog", "https://example.com");
const txt = renderLlmsTxt({ title: "Example", description: "Index", pages });
```

## json-ld.mjs — schema builders

```js
import { localBusiness, service, faqPage, toScript } from "./json-ld.mjs";

toScript(localBusiness({
  name: "Acme Cleaning Co.",
  url: "https://example.com",
  phone: "+1 512-555-0100",
  priceRange: "$100-$300",
  address: { street: "123 Main St", zip: "78701", city: "Austin", country: "US" },
  geo: { lat: 30.2672, lng: -97.7431 },
  hours: [{ dayOfWeek: ["Monday", "Tuesday"], opens: "08:00", closes: "17:00" }],
  sameAs: ["https://www.instagram.com/acmecleaning"],
}));

toScript(service({
  name: "House Cleaning",
  url: "https://example.com/cleaning",
  description: "Deep clean with satisfaction guarantee.",
  provider: { name: "Acme Cleaning Co.", url: "https://example.com" },
  areaServed: "Austin, TX",
  price: { from: "120", currency: "USD", note: "From $120, flat rate" },
}));

toScript(faqPage([{ q: "How much does cleaning cost?", a: "From $120, flat rate." }]));
```

No locale is assumed: pass `country` on addresses and `currency` on prices explicitly (currency falls back to `USD`, the offer note to `"USD 120"` style). `toScript` wraps any object in a `<script type="application/ld+json">` tag.

## indexnow.mjs — instant indexing

```bash
node indexnow.mjs --host example.com --key YOUR_KEY --url https://example.com/new --url https://example.com/offers
```

| Flag | Required | What it does |
| ---- | -------- | ------------ |
| `--host` | yes | Host without protocol, e.g. `example.com` |
| `--key` | yes | IndexNow key (see below) |
| `--url` / positional | yes, ≥1 | Changed URLs to submit |

First publish your key as a text file at `https://YOUR_HOST/YOUR_KEY.txt`, then submit. One key per host, reuse it forever. Notifies Bing, Yandex, Seznam and Naver in one call.

```js
import { submit } from "./indexnow.mjs";
await submit({ host: "example.com", key: "KEY", urls: ["https://example.com/new"] });
// → { ok: true, status: 200 }
```

## sitemap.mjs — sitemap.xml

```bash
node sitemap.mjs --dir src/content/blog --site https://example.com --out public/sitemap.xml
```

Same `--dir` / `--site` / `--out` flags as `llms-txt.mjs`. Emits a `<urlset>` with weekly `changefreq`. Shares the page collector, so sitemap and `llms.txt` never disagree.

## robots.mjs — robots.txt

```bash
node robots.mjs --site https://example.com --out public/robots.txt
node robots.mjs --site https://example.com --sitemap https://cdn.example.com/sitemap.xml
node robots.mjs --site https://example.com --disallow-ai
```

| Flag | What it does |
| ---- | ------------ |
| `--site` | Required. Base URL; the sitemap URL is derived from it |
| `--sitemap` | Full sitemap URL or path (default `/sitemap.xml`) |
| `--disallow-ai` | Adds `Disallow: /` blocks for GPTBot, CCBot, anthropic-ai, ClaudeBot, PerplexityBot. Use only when the site owner opts out — blocking AI crawlers also blocks AI citations |
| `--out` | Output file; prints to stdout if omitted |

## Test

```bash
npm test   # node --test, 12 tests, no framework
```
