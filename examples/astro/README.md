# Astro integration example

Minimal wiring of the toolkit into an Astro project. Copy the pattern, not the files — run the generators via `npx` so you always get the latest release:

```bash
npx -y github:RelayStack/astro-seo-toolkit astro-seo-llms --dir src/content --site https://example.com --out public/llms.txt
npx -y github:RelayStack/astro-seo-toolkit astro-seo-sitemap --dir src/content --site https://example.com --out public/sitemap.xml
npx -y github:RelayStack/astro-seo-toolkit astro-seo-robots --site https://example.com --out public/robots.txt
```

See `package.json` (build hook), `astro.config.mjs` (`site` + trailing slash), `src/layouts/Base.astro` (JSON-LD via `set:html`), and `src/content/blog/first-post.md` (frontmatter the generators read).
