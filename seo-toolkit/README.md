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
const txt = renderLlmsTxt({ title: "Beispiel", description: "Index", pages });
```

## json-ld.mjs — schema builders

```js
import { localBusiness, service, faqPage, toScript } from "./json-ld.mjs";

toScript(localBusiness({
  name: "Beispiel GmbH",
  url: "https://example.com",
  phone: "+41 61 000 00 00",
  priceRange: "CHF 100–300",
  address: { street: "Musterstrasse 1", zip: "4000", city: "Basel" },
  geo: { lat: 47.5596, lng: 7.5886 },
  hours: [{ dayOfWeek: ["Monday", "Tuesday"], opens: "08:00", closes: "17:00" }],
  sameAs: ["https://www.instagram.com/beispiel"],
}));

toScript(service({
  name: "Ferienwohnung Reinigung",
  url: "https://example.com/reinigung",
  description: "Endreinigung mit Abnahmegarantie.",
  provider: { name: "Beispiel GmbH", url: "https://example.com" },
  areaServed: "Basel",
  price: { from: "120" },            // → CHF offer with "ab CHF 120" note
}));

toScript(faqPage([{ q: "Was kostet die Reinigung?", a: "Ab CHF 120, pauschal." }]));
```

`addressCountry` defaults to `CH`, currency to `CHF`. `toScript` wraps any object in a `<script type="application/ld+json">` tag.

## indexnow.mjs — instant indexing

```bash
node indexnow.mjs --host example.com --key YOUR_KEY --url https://example.com/neu --url https://example.com/angebot
```

| Flag | Required | What it does |
| ---- | -------- | ------------ |
| `--host` | yes | Host without protocol, e.g. `example.com` |
| `--key` | yes | IndexNow key (see below) |
| `--url` / positional | yes, ≥1 | Changed URLs to submit |

First publish your key as a text file at `https://YOUR_HOST/YOUR_KEY.txt`, then submit. One key per host, reuse it forever. Notifies Bing, Yandex, Seznam and Naver in one call.

```js
import { submit } from "./indexnow.mjs";
await submit({ host: "example.com", key: "KEY", urls: ["https://example.com/neu"] });
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
