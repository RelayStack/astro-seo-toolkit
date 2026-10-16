# Astro SEO Toolkit

**Generate `llms.txt`, `llms-full.txt`, `sitemap.xml` and `robots.txt`, build JSON-LD schema, and ping IndexNow — from plain Node 18+ with zero dependencies.**

[![npm](https://img.shields.io/npm/v/astro-seo-toolkit.svg)](https://www.npmjs.com/package/astro-seo-toolkit)
[![downloads](https://img.shields.io/npm/dm/astro-seo-toolkit.svg)](https://www.npmjs.com/package/astro-seo-toolkit)
[![tests](https://img.shields.io/badge/tests-33%2F33-brightgreen.svg)](seo-toolkit/test.mjs)
[![CI](https://github.com/RelayStack/astro-seo-toolkit/actions/workflows/test.yml/badge.svg)](https://github.com/RelayStack/astro-seo-toolkit/actions)
[![node](https://img.shields.io/badge/node-18%2B-brightgreen.svg)](package.json)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

One command wires it into your build:

```console
$ npx astro-seo-toolkit --dir src/content --site https://example.com --out dist
llms.txt, llms-full.txt, sitemap.xml, robots.txt written to dist (12 pages).
```

Built for 2026 search. AI answers (ChatGPT, Perplexity, AI Overviews) cite sites that are **machine-readable and quotable**; classic search (Google, Bing) still runs on **sitemaps and schema**. This covers both halves, without adding a dependency to your lockfile.

> If this saves you an hour, a ⭐ helps the next person find it.

- [Quick start](#quick-start) · [Astro integration](#astro-integration) · [Tools](#tools) · [Comparison](#how-it-compares) · [AI agent skill](#use-with-your-ai-agent) · [FAQ](#faq)

## Who this is for

- **Astro sites** — drop-in integration, generates every file on `astro build`.
- **Any static site** — Eleventy, Hugo, Next.js static export, a bare Markdown folder. Anything with Markdown and a Node build step.
- **Local business sites** — `LocalBusiness`/`Service`/`FAQPage` schema, one page per service and location.
- **AI agents** — a self-contained `astro-seo` skill your agent can install and run on command.

You do **not** need this if you only want `<head>` meta tags — that's [`astro-seo`](https://www.npmjs.com/package/astro-seo). This toolkit generates the *files around* the page: the index for LLMs, the sitemap, the robots rules, the schema.

## Quick start

Nothing to install — every file in one command, straight from npm:

```bash
npx astro-seo-toolkit --dir src/content --site https://example.com --out public
```

No install and pinned to the repo instead of a release:

```bash
git clone --depth 1 https://github.com/RelayStack/astro-seo-toolkit
node astro-seo-toolkit/seo-toolkit/integration.mjs --dir src/content --site https://example.com --out public
```

Note: npm 12 blocks `github:` install specs by default (`allow-git=none`), so `npx github:RelayStack/astro-seo-toolkit` does **not** work out of the box — use the npm release or the clone above.

Prefer the individual tools? Install once, then the sub-commands are on your PATH:

```bash
npm install -D astro-seo-toolkit

npx astro-seo-llms      --dir src/content --site https://example.com --out public/llms.txt
npx astro-seo-llms-full --dir src/content --site https://example.com --out public/llms-full.txt
npx astro-seo-sitemap   --dir src/content --site https://example.com --out public/sitemap.xml
npx astro-seo-robots    --site https://example.com --out public/robots.txt
npx astro-seo-check     --dir public --site https://example.com
```

Validate what you generated before you deploy:

```console
$ npx astro-seo-check --dir public --site https://example.com
{
  "ok": true,
  "issues": []
}
```

## Astro integration

Install and add it to `astro.config.mjs`. Every file is regenerated on `astro build`, so your SEO output can never drift from your content.

```bash
npm install -D astro-seo-toolkit
```

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import astroSeo from "astro-seo-toolkit/integration";

export default defineConfig({
  site: "https://example.com",
  integrations: [
    astroSeo({
      contentDir: ["src/content/blog", "src/content/services"],
      llmsFull: true,
    }),
  ],
});
```

| Option | Default | What it does |
| ------ | ------- | ------------ |
| `contentDir` | `src/content` | Markdown dir, or an array of them (deduped by URL) |
| `site` | `config.site` | Base URL; falls back to Astro's `site` |
| `llms` | `true` | Write `llms.txt` |
| `llmsFull` | `false` | Write `llms-full.txt` (full bodies inlined) |
| `llmsFullLimit` | `200` | Max pages inlined into `llms-full.txt` |
| `sitemap` | `true` | Write `sitemap.xml` |
| `robots` | `true` | Write `robots.txt` |
| `disallowAI` | `false` | Block GPTBot/CCBot/ClaudeBot/PerplexityBot in `robots.txt` |
| `changefreq` | `weekly` | `<changefreq>` for every sitemap entry |

Both files are written into Astro's build output (`dist/`). If you also run [`@astrojs/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/), turn this one's off with `sitemap: false` — `@astrojs/sitemap` covers every route, this one covers your Markdown.

The integration is the same code as the CLI, so you can use it outside Astro too:

```js
import { generate } from "astro-seo-toolkit/integration";

const { files, pages } = await generate({ dirs: ["src/content"], site: "https://example.com" });
```

## Tools

| Tool | File | One-liner |
| ---- | ---- | --------- |
| **Integration** | [`seo-toolkit/integration.mjs`](seo-toolkit/integration.mjs) | Astro integration + `astro-seo-toolkit` CLI for all of the below |
| llms.txt | [`seo-toolkit/llms-txt.mjs`](seo-toolkit/llms-txt.mjs) | Content index for LLMs from your Markdown directory |
| llms-full.txt | [`seo-toolkit/llms-full.mjs`](seo-toolkit/llms-full.mjs) | Full page bodies inlined for agents that need more than the index |
| JSON-LD | [`seo-toolkit/json-ld.mjs`](seo-toolkit/json-ld.mjs) | `LocalBusiness`, `Service`, `FAQPage` schema in any locale |
| IndexNow | [`seo-toolkit/indexnow.mjs`](seo-toolkit/indexnow.mjs) | Instant indexing via Bing, Yandex, Seznam, Naver |
| Sitemap | [`seo-toolkit/sitemap.mjs`](seo-toolkit/sitemap.mjs) | `sitemap.xml` from the same content directory |
| robots.txt | [`seo-toolkit/robots.mjs`](seo-toolkit/robots.mjs) | Sitemap reference + optional AI-crawler rules |
| Validator | [`seo-toolkit/check.mjs`](seo-toolkit/check.mjs) | Verify generated files + sitemap/llms agreement before deploy |
| GEO checklist | [`notes/geo-checklist.md`](notes/geo-checklist.md) | 2026 AI-search checklist for local business sites |

Full flags and API per tool: [`seo-toolkit/README.md`](seo-toolkit/README.md).

## How it compares

| | This toolkit | `astro-seo` | `@astrojs/sitemap` | `llms-txt` generators |
| --- | --- | --- | --- | --- |
| `<head>` meta tags | — | ✅ | — | — |
| `llms.txt` + `llms-full.txt` | ✅ | — | — | ✅ |
| `sitemap.xml` from Markdown | ✅ | — | ✅ (routes) | — |
| `robots.txt` | ✅ | — | — | — |
| JSON-LD builders | ✅ | — | — | — |
| IndexNow submission | ✅ | — | — | — |
| Pre-deploy validator | ✅ | — | — | — |
| Agent skill | ✅ | — | — | — |
| Dependencies | **0** | 0 | several | varies |

Use them together: `astro-seo` for `<head>`, this for the files. They don't overlap.

## Wiring into Astro (manual)

Prefer the integration above. If you'd rather not add a dependency, run the generators on every build:

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

## Use with your AI agent

Install the `astro-seo` skill so your agent implements, audits and launches all of this on command:

```bash
npx skills add RelayStack/astro-seo-toolkit --skill astro-seo
```

If your harness doesn't use the registry, copy `skills/astro-seo/` to its skills dir (`~/.claude/skills/`, `~/.codex/skills/`, project's `.opencode/skills/`, …) — the folder is self-contained: `SKILL.md`, `scripts/`, `references/`.

Then prompt your agent: `implement astro seo`, `audit this page`, `schema for /pricing`.

## Locales

No locale is assumed. Pass `country` on addresses and `currency` on prices explicitly; currency falls back to `USD` only. One page per service and location, JSON-LD with the matching `addressCountry`, and the [`GEO checklist`](notes/geo-checklist.md) as a repeatable launch routine — in whatever language your customers read.

## Layout

```text
seo-toolkit/        dependency-free helpers + tests (Node 18+, no installs)
skills/astro-seo/   installable agent skill (self-contained: SKILL.md, scripts/, references/)
notes/              short checklists and tooling notes
examples/           minimal runnable Astro + Cloudflare Worker snippets
scripts/            repo maintenance (syncs the skill's vendored copies)
llms.txt            machine-readable index of this repo
package.json        bins: astro-seo-toolkit (every file at once) + astro-seo-{llms,llms-full,sitemap,robots,check,indexnow}
```

## FAQ

### Is this an Astro integration?

Yes — since 0.5.0. `astro-seo-toolkit/integration` runs inside `astro build` and writes the files for you. It is *also* just Node scripts, so the same code works with Eleventy, Hugo, Next.js static export, or a bare Markdown folder.

### Does llms.txt improve Google rankings?

No. Google ignores `llms.txt`; it serves Claude, GPT, Perplexity and other agents. For Google, prioritize sitemap submission, real indexation, one valid JSON-LD block per page, and quotable content.

### How is this different from `astro-seo`?

`astro-seo` is a meta-tags component for your `<head>`. This toolkit generates the files around it — `llms.txt`, `llms-full.txt`, `sitemap.xml`, `robots.txt` — plus JSON-LD builders, IndexNow submission, a dist validator, and an agent skill that wires it all up.

### Do I need dependencies?

No. Everything runs on Node 18+ with zero runtime dependencies. `astro` is an optional peer dependency, only used when you use the integration.

### Can my AI agent install and use this?

Yes. `npx skills add RelayStack/astro-seo-toolkit --skill astro-seo`, or copy `skills/astro-seo/` into any harness skills dir, or run everything via `npx astro-seo-toolkit` with no install.

## Contributing

Questions, ideas, bug reports: use [Discussions](../../discussions). PRs welcome — keep helpers dependency-free and tested.

```bash
npm test          # 33 tests
npm run check:skill   # skill scripts must match seo-toolkit/
```

The vendored copies in `skills/astro-seo/scripts/` are generated by `npm run sync:skill`; a test fails if they drift.

If the toolkit saved you time, a ⭐ is the cheapest way to say thanks.

## License

MIT — see [LICENSE](LICENSE). By [RelayStack](https://github.com/RelayStack).
