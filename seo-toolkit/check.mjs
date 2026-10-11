#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export function checkLlmsTxt(text) {
  const issues = [];
  if (!/^# .+/m.test(text)) issues.push("missing H1");
  const links = [...text.matchAll(/- \[([^\]]+)\]\(([^)]+)\)/g)];
  if (links.length === 0) issues.push("no links");
  const urls = [];
  for (const [, , url] of links) {
    if (!/^https?:\/\//.test(url)) issues.push(`non-absolute URL: ${url}`);
    else urls.push(url);
  }
  return { urls, issues };
}

export function checkSitemap(xml) {
  const issues = [];
  if (!xml.includes("<urlset")) issues.push("missing urlset");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (urls.length === 0) issues.push("no urls");
  return { urls, issues };
}

export function checkRobots(text, site) {
  const issues = [];
  const m = text.match(/^Sitemap:\s*(\S+)/m);
  if (!m) issues.push("missing Sitemap line");
  else if (!/^https?:\/\//.test(m[1])) issues.push("sitemap URL not absolute");
  else if (site && !m[1].startsWith(site.replace(/\/$/, ""))) issues.push("sitemap URL outside site");
  return { issues };
}

export function checkJsonLd(text) {
  const issues = [];
  try {
    const obj = JSON.parse(text);
    if (!obj["@context"] || !obj["@type"]) issues.push("missing @context/@type");
  } catch {
    issues.push("invalid JSON");
  }
  return { issues };
}

export function checkAgreement(llmsUrls, sitemapUrls) {
  const issues = [];
  const a = new Set(llmsUrls);
  const b = new Set(sitemapUrls);
  for (const u of b) if (!a.has(u)) issues.push(`in sitemap but not llms.txt: ${u}`);
  for (const u of a) if (!b.has(u)) issues.push(`in llms.txt but not sitemap: ${u}`);
  return { issues };
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
  if (!a.dir) {
    console.error("Usage: node check.mjs --dir public [--site https://example.com]");
    process.exit(1);
  }
  const issues = [];
  let llms = { urls: [] };
  let map = { urls: [] };
  for (const [file, fn] of [["llms.txt", checkLlmsTxt], ["sitemap.xml", checkSitemap], ["robots.txt", checkRobots]]) {
    try {
      const text = await readFile(join(a.dir, file), "utf8");
      const r = fn(text, a.site);
      if (file === "llms.txt") llms = r;
      if (file === "sitemap.xml") map = r;
      for (const i of r.issues) issues.push(`${file}: ${i}`);
    } catch {
      issues.push(`${file}: missing`);
    }
  }
  for (const i of checkAgreement(llms.urls, map.urls).issues) issues.push(i);
  console.log(JSON.stringify({ ok: issues.length === 0, issues }, null, 2));
  if (issues.length > 0) process.exit(1);
}
