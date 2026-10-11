#!/usr/bin/env node
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { parseFrontmatter } from "./llms-txt.mjs";

export function stripFrontmatter(text) {
  return text.replace(/^---\n[\s\S]*?\n---/, "").trim() + "\n";
}

export async function collectFull(dir, site, limit = 200) {
  const pages = [];
  async function walk(current) {
    if (pages.length >= limit) return;
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if (pages.length >= limit) break;
      if (entry.name.startsWith(".")) continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!entry.name.endsWith(".md")) continue;
      const text = await readFile(full, "utf8");
      const fm = parseFrontmatter(text);
      const slug = full.slice(dir.length).replace(/\.md$/, "").replace(/\/index$/, "") || "/";
      pages.push({
        title: fm.title || slug,
        url: site.replace(/\/$/, "") + slug,
        body: stripFrontmatter(text),
      });
    }
  }
  await walk(dir);
  return pages.sort((a, b) => a.url.localeCompare(b.url));
}

export function renderLlmsFull({ title, description, pages }) {
  const parts = [`# ${title}`, "", `> ${description}`, ""];
  for (const p of pages) parts.push(`## ${p.title}`, "", p.url, "", p.body, "");
  return parts.join("\n");
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
    console.error("Usage: node llms-full.mjs --dir src/content/blog --site https://example.com [--out public/llms-full.txt] [--limit 200]");
    process.exit(1);
  }
  const pages = await collectFull(a.dir, a.site, parseInt(a.limit || "200", 10));
  const text = renderLlmsFull({
    title: a.title || a.site,
    description: a.description || `Full content index for ${a.site}`,
    pages,
  });
  if (a.out) {
    await mkdir(dirname(a.out), { recursive: true });
    await writeFile(a.out, text);
  } else {
    process.stdout.write(text);
  }
  console.error(`${pages.length} pages inlined.`);
}
