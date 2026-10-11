import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
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

const isCli = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());

if (isCli) {
  const a = args(process.argv.slice(2));
  if (!a.dir || !a.site) {
    console.error("Usage: node sitemap.mjs --dir src/content/blog --site https://example.com [--out public/sitemap.xml]");
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
