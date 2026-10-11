import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

export function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  const data = {};
  if (!match) return data;
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return data;
}

export function stripMarkdown(text) {
  return text
    .replace(/^---\n[\s\S]*?\n---/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`[\]()!|-]/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

export async function collectPages(dir, site) {
  const pages = [];
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
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
        description: fm.description || stripMarkdown(text).slice(0, 160),
        url: site.replace(/\/$/, "") + slug,
      });
    }
  }
  await walk(dir);
  return pages.sort((a, b) => a.url.localeCompare(b.url));
}

export function renderLlmsTxt({ title, description, pages }) {
  const lines = [`# ${title}`, "", `> ${description}`, ""];
  for (const p of pages) lines.push(`- [${p.title}](${p.url}): ${p.description}`);
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

const isCli = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());

if (isCli) {
  const a = args(process.argv.slice(2));
  if (!a.dir || !a.site) {
    console.error('Usage: node llms-txt.mjs --dir src/content/blog --site https://example.com [--title ..] [--description ..] [--out llms.txt]');
    process.exit(1);
  }
  const pages = await collectPages(a.dir, a.site);
  const text = renderLlmsTxt({
    title: a.title || a.site,
    description: a.description || `Content index for ${a.site}`,
    pages,
  });
  if (a.out) {
    await mkdir(dirname(a.out), { recursive: true });
    await writeFile(a.out, text);
  } else {
    process.stdout.write(text);
  }
  console.error(`${pages.length} pages indexed.`);
}
