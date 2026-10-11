# SEO Toolkit

Dependency-free SEO helpers for static sites (Astro-first, framework-agnostic). No installs, copy what you need. Node 18+.

## Contents

- `llms-txt.mjs` — generate `llms.txt` from a Markdown content directory
- `json-ld.mjs` — `LocalBusiness` / `Service` / `FAQPage` builders with `ab CHF` price notes
- `indexnow.mjs` — submit changed URLs to IndexNow (Bing, Yandex, Seznam)
- `test.mjs` — test suite, run with `npm test`

## Usage

```bash
node llms-txt.mjs --dir ../src/content/blog --site https://example.com --out ../public/llms.txt
node indexnow.mjs --host example.com --key YOUR_KEY --url https://example.com/neu
```

```js
import { service, toScript } from "./json-ld.mjs";

const html = toScript(service({
  name: "Ferienwohnung Reinigung",
  url: "https://example.com/reinigung",
  areaServed: "Basel",
  price: { from: "120" },
}));
```

## IndexNow key

Publish a text file with your key at `https://YOUR_HOST/YOUR_KEY.txt`, then submit. One key per host, reuse it for every submission.

## Test

```bash
npm test
```
