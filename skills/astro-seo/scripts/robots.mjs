#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

export function renderRobots({ sitemap = "/sitemap.xml", disallowAI = false } = {}) {
  const lines = ["User-agent: *", "Allow: /", ""];
  if (disallowAI) {
    for (const bot of ["GPTBot", "CCBot", "anthropic-ai", "ClaudeBot", "PerplexityBot"]) {
      lines.push(`User-agent: ${bot}`, "Disallow: /", "");
    }
  }
  lines.push(`Sitemap: ${sitemap}`);
  return lines.join("\n") + "\n";
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
  if (!a.site) {
    console.error("Usage: npx astro-seo-robots --site https://example.com [--sitemap /sitemap.xml] [--disallow-ai] [--out public/robots.txt]");
    process.exit(1);
  }
  const sitemap = (a.sitemap || "/sitemap.xml").startsWith("http")
    ? a.sitemap
    : a.site.replace(/\/$/, "") + (a.sitemap || "/sitemap.xml");
  const text = renderRobots({ sitemap, disallowAI: a["disallow-ai"] === "true" });
  if (a.out) {
    await mkdir(dirname(a.out), { recursive: true });
    await writeFile(a.out, text);
  } else {
    process.stdout.write(text);
  }
}
