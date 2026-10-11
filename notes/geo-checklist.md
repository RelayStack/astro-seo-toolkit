# GEO checklist 2026 — Swiss business sites

Generative-engine optimization: what makes ChatGPT, Perplexity, Gemini and AI Overviews cite your pages. Pair with the `seo-toolkit/` generators.

## Crawlable & fresh

- [ ] `sitemap.xml` submitted in GSC + Bing Webmaster Tools (`sitemap.mjs`)
- [ ] Changed URLs pushed via IndexNow on every deploy (`indexnow.mjs`)
- [ ] `robots.txt` allows AI crawlers unless the client opts out (`robots.mjs --disallow-ai` only on request)

## Machine-readable

- [ ] `llms.txt` at site root, regenerated on every content change (`llms-txt.mjs`)
- [ ] JSON-LD on every page: `LocalBusiness` globally, `Service` per offer, `FAQPage` where Q&A exists (`json-ld.mjs`)
- [ ] Prices as structured `Offer` with `priceCurrency: CHF`, visible `ab CHF` note
- [ ] One H1 per page, question-shaped H2s (`Wie viel kostet …?`) so answers are quotable

## Quotable content

- [ ] First paragraph answers the page's core question in 40–60 words
- [ ] Facts as plain statements with numbers, prices, durations — no superlatives
- [ ] German de-CH, Sie-form; canton + city named in copy (`areaServed`)
- [ ] Author/business named consistently everywhere (NAP consistency)

## Trust signals LLMs reuse

- [ ] Reviews with schema (`aggregateRating`) where genuine
- [ ] Service area pages per location, interlinked, no doorway spam
- [ ] Contact page with phone, address, opening hours — also in JSON-LD

## Measure

- [ ] GSC: impressions on question queries; Bing WT: IndexNow status
- [ ] Monthly: ask ChatGPT/Perplexity your top 3 money queries, note citations
- [ ] Track AI-referred sessions separately (UTM or referrer) from organic
