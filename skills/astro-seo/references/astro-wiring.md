# Astro wiring

## Content collections → llms.txt + sitemap

Point the generators at the collection dir, not `src/pages`, so drafts and components are excluded:

```bash
node scripts/llms-txt.mjs --dir src/content/blog --site https://example.com --out public/llms.txt
node scripts/sitemap.mjs  --dir src/content/blog --site https://example.com --out public/sitemap.xml
```

Titles/descriptions come from frontmatter (`title:`, `description:`). Pages without frontmatter fall back to slug + stripped excerpt — add frontmatter instead of accepting fallbacks.

## Layout schema

One JSON-LD block per page, rendered with `set:html` in the base layout:

```astro
---
import { localBusiness, service, faqPage, toScript } from "../seo/json-ld.mjs";
const org = toScript(localBusiness({
  name: "Example Co.",
  url: Astro.site,
  address: { street: "123 Main St", zip: "78701", city: "Austin", country: "US" },
}));
const pageSchema = Astro.props.service
  ? toScript(service(Astro.props.service))
  : Astro.props.faq
    ? toScript(faqPage(Astro.props.faq))
    : null;
---
<Fragment set:html={org} />
{pageSchema && <Fragment set:html={pageSchema} />}
```

Recipes:

- Homepage: `localBusiness` with address, geo, hours, sameAs.
- Service/location page: `service` with provider, areaServed, explicit `currency` + `note`.
- Q&A content: `faqPage` mirroring the visible questions verbatim — never mark up invisible text.
- Blog post: keep `localBusiness` only; article schema is out of scope for these helpers.

## Build hook

```json
{ "scripts": {
  "seo": "node ./seo/llms-txt.mjs --dir src/content --site https://example.com --out public/llms.txt && node ./seo/sitemap.mjs --dir src/content --site https://example.com --out public/sitemap.xml",
  "build": "npm run seo && astro build"
} }
```

Copy the five scripts into the Astro project's `./seo/` (or run via `npx -y github:RelayStack/astro-seo-toolkit <cmd>`).

## Dynamic routes

`[slug].astro` pages: canonical URL from `Astro.url`, one H1, question-shaped H2s, first paragraph answering the page's core question in 40–60 words. If `trailingSlash` is set, generated URLs must match it or sitemap and canonicals disagree.

## Cloudflare deploy

- Pages: build command `npm run build`, output `dist`. Functions/Workers patterns in this repo's `examples/` stay minimal and secret-free.
- After each deploy with changed URLs: publish the IndexNow key file once (`https://HOST/KEY.txt`), then `node scripts/indexnow.mjs --host HOST --key KEY --url <changed...>`.
- Submit `sitemap.xml` in Search Console + Bing Webmaster Tools on first launch.
