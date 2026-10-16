#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { collectPages } from "./llms-txt.mjs";

export function renderSitemap(pages, { changefreq = "weekly" } = {}) {
  const urls = pages
    .map((p) => `  <url><loc>${p.url}</loc><changefreq>${changefreq}</changefreq></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) out[argv[i].slice(2)] = argv[i + 1] ?? "true";
    if (argv[i].startsWith("--") && argv[i + 1] && !argv[i + 1].startsWith("--")) i++;
  }
  return out;
}

const isCli = (() => {
  try {
    // npm runs bins through a node_modules/.bin symlink: process.argv[1] is the
    // link, import.meta.url is the real file. Compare resolved paths, not suffixes.
    return Boolean(process.argv[1]) && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
})();

if (isCli) {
  const a = args(process.argv.slice(2));
  if (!a.dir || !a.site) {
    console.error("Usage: npx astro-seo-sitemap --dir src/content/blog --site https://example.com [--out public/sitemap.xml]");
    process.exit(1);
  }
  const pages = await collectPages(a.dir, a.site);
  const xml = renderSitemap(pages);
  if (a.out) {
    await mkdir(dirname(a.out), { recursive: true });
    await writeFile(a.out, xml);
  } else {
    process.stdout.write(xml);
  }
  console.error(`${pages.length} urls indexed.`);
}
