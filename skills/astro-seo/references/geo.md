# GEO checklist 2026 — local business sites

What makes ChatGPT, Perplexity, Gemini and AI Overviews cite Astro pages. Work top to bottom; file an issue per gap.

## Crawlable & fresh

- [ ] `sitemap.xml` submitted in Search Console + Bing Webmaster Tools
- [ ] Changed URLs pushed via IndexNow on every deploy
- [ ] `robots.txt` allows AI crawlers unless the owner opts out

## Machine-readable

- [ ] `llms.txt` at site root, regenerated on every content change
- [ ] JSON-LD on every page: `LocalBusiness` globally, `Service` per offer, `FAQPage` where Q&A exists
- [ ] Prices as structured `Offer` with explicit `priceCurrency` and matching visible note
- [ ] One H1 per page, question-shaped H2s so answers are quotable

## Quotable content

- [ ] First paragraph answers the page's core question in 40–60 words
- [ ] Facts as plain statements with numbers, prices, durations — no superlatives
- [ ] Region + city named in copy (`areaServed`); business named consistently everywhere

## Trust signals LLMs reuse

- [ ] Reviews with schema (`aggregateRating`) where genuine
- [ ] Service area pages per location, interlinked, no doorway spam
- [ ] Contact page with phone, address, opening hours — also in JSON-LD

## Measure

- [ ] Search Console: impressions on question queries; Bing WT: IndexNow status
- [ ] Monthly: ask ChatGPT/Perplexity your top 3 money queries, note citations
- [ ] Track AI-referred sessions separately (UTM or referrer) from organic
