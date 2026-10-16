# Astro example

Minimal Astro project wired up with the integration. Copy the pattern, not the files.

```bash
npm install
npm run build   # astro build also writes llms.txt, llms-full.txt, sitemap.xml, robots.txt into dist/
```

See:

- `astro.config.mjs` — the integration, `site`, trailing-slash config
- `package.json` — Astro 7 + `astro-seo-toolkit` as a dev dependency
- `src/layouts/Base.astro` — JSON-LD via `set:html`
- `src/content/blog/first-post.md` — the frontmatter (`title:`, `description:`) the generators read

## Without the integration

If you'd rather not add a dependency, run the CLI before `astro build` instead — same output, one extra step:

```bash
npx astro-seo-toolkit --dir src/content --site https://example.com --out public
```

Neither approach needs a config file or a plugin API. The toolkit reads your Markdown directory and writes files; where they land is up to you (`--out`, or Astro's `dist/` via the integration).
