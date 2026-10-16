#!/usr/bin/env node
/**
 * Astro integration: generate llms.txt, llms-full.txt, sitemap.xml and
 * robots.txt into the build output, so they can never go stale.
 *
 *   // astro.config.mjs
 *   import astroSeo from "astro-seo-toolkit/integration";
 *
 *   export default defineConfig({
 *     site: "https://example.com",
 *     integrations: [astroSeo({ contentDir: "src/content" })],
 *   });
 *
 * Also runs as a CLI, so the same code covers non-Astro builds:
 *
 *   node integration.mjs --dir src/content --site https://example.com --out dist
 */
import { realpathSync } from "node:fs";
import { writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { collectFull, renderLlmsFull } from "./llms-full.mjs";
import { collectPages, renderLlmsTxt } from "./llms-txt.mjs";
import { renderRobots } from "./robots.mjs";
import { renderSitemap } from "./sitemap.mjs";

const DEFAULTS = {
  contentDir: "src/content",
  llms: true,
  llmsFull: false,
  sitemap: true,
  robots: true,
  disallowAI: false,
  changefreq: "weekly",
  llmsFullLimit: 200,
};

/** Accepts `dirs`, plus the `contentDir` (string or array) and `contentDirs` aliases. */
export function normalizeOptions(options = {}) {
  const raw = options.dirs ?? options.contentDirs ?? options.contentDir ?? DEFAULTS.contentDir;
  return { ...DEFAULTS, ...options, dirs: Array.isArray(raw) ? raw : [raw] };
}

/** Builds every requested file in memory. Returns `{ files, pages }`. */
export async function generate(options = {}) {
  const {
    dirs,
    site,
    title,
    description,
    llms,
    llmsFull,
    sitemap: wantSitemap,
    robots: wantRobots,
    disallowAI,
    changefreq,
    llmsFullLimit,
    cwd = process.cwd(),
  } = normalizeOptions(options);

  const base = String(site || "").replace(/\/$/, "");
  const files = {};

  const merge = (pages) => {
    const seen = new Map();
    for (const page of pages) if (!seen.has(page.url)) seen.set(page.url, page);
    return [...seen.values()].sort((a, b) => a.url.localeCompare(b.url));
  };

  const collected = [];
  for (const dir of dirs) collected.push(...(await collectPages(resolve(cwd, dir), base)));
  const pages = merge(collected);

  const meta = {
    title: title || base || "Content index",
    description: description || `Content index for ${base}`,
  };

  if (llms) files["llms.txt"] = renderLlmsTxt({ ...meta, pages });
  if (llmsFull) {
    const full = [];
    for (const dir of dirs) full.push(...(await collectFull(resolve(cwd, dir), base, llmsFullLimit)));
    files["llms-full.txt"] = renderLlmsFull({ ...meta, pages: merge(full) });
  }
  if (wantSitemap) files["sitemap.xml"] = renderSitemap(pages, { changefreq });
  if (wantRobots) files["robots.txt"] = renderRobots({ sitemap: `${base}/sitemap.xml`, disallowAI });

  return { files, pages };
}

/** Writes a `{ name: contents }` map into `outDir`. Returns the names written. */
export async function writeFiles(outDir, files) {
  await mkdir(outDir, { recursive: true });
  const written = [];
  for (const [name, content] of Object.entries(files)) {
    await writeFile(join(outDir, name), content);
    written.push(name);
  }
  return written;
}

export default function astroSeo(options = {}) {
  let site = options.site;

  const resolveSite = () => String(site || "").replace(/\/$/, "");

  return {
    name: "astro-seo-toolkit",
    hooks: {
      "astro:config:setup": ({ config, logger }) => {
        if (!site && config.site) site = config.site.toString();
        if (!resolveSite()) {
          logger.warn(
            "no `site` configured — llms.txt and sitemap.xml need absolute URLs. Set `site:` in astro.config.mjs or pass `site` to astroSeo().",
          );
        }
      },
      "astro:build:done": async ({ dir, logger }) => {
        const base = resolveSite();
        if (!base) {
          logger.error("skipping generation: no `site` configured.");
          return;
        }
        const { files, pages } = await generate({ ...options, site: base });
        const written = await writeFiles(fileURLToPath(dir), files);
        logger.info(`wrote ${written.join(", ")} (${pages.length} pages)`);
      },
    },
  };
}

function parseArgs(argv) {
  const out = { dir: [], llms: true, sitemap: true, robots: true, llmsFull: false, disallowAI: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dir") out.dir.push(argv[++i]);
    else if (arg === "--llms-full") out.llmsFull = true;
    else if (arg === "--disallow-ai") out.disallowAI = true;
    else if (arg === "--no-llms") out.llms = false;
    else if (arg === "--no-sitemap") out.sitemap = false;
    else if (arg === "--no-robots") out.robots = false;
    else if (arg.startsWith("--")) {
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      out[arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
    }
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
  const a = parseArgs(process.argv.slice(2));
  if (a.dir.length === 0 || !a.site) {
    console.error(
      "Usage: npx astro-seo-toolkit --dir src/content [--dir src/pages] --site https://example.com [--out dist] [--llms-full] [--no-robots] [--disallow-ai]",
    );
    process.exit(1);
  }
  const { files, pages } = await generate({ ...a, contentDirs: a.dir });
  const names = Object.keys(files);
  if (a.out) {
    await writeFiles(a.out, files);
    console.error(`${names.join(", ")} written to ${a.out} (${pages.length} pages).`);
  } else {
    for (const name of names) process.stdout.write(`<!-- ${name} -->\n${files[name]}`);
  }
}
