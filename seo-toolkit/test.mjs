import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter, stripMarkdown, renderLlmsTxt } from "./llms-txt.mjs";
import { localBusiness, service, faqPage, toScript } from "./json-ld.mjs";
import { buildPayload } from "./indexnow.mjs";
import { renderSitemap } from "./sitemap.mjs";
import { renderRobots } from "./robots.mjs";
import { checkLlmsTxt, checkSitemap, checkRobots, checkJsonLd, checkAgreement } from "./check.mjs";

test("frontmatter parses title and description", () => {
  const fm = parseFrontmatter('---\ntitle: Hallo\ndescription: "Welt"\n---\n# Body');
  assert.equal(fm.title, "Hallo");
  assert.equal(fm.description, "Welt");
});

test("frontmatter missing returns empty object", () => {
  assert.deepEqual(parseFrontmatter("# No frontmatter"), {});
});

test("markdown strips to plain excerpt", () => {
  const out = stripMarkdown("# Titel\n\nEin **fetter** [Link](https://x.ch) hier.");
  assert.ok(!out.includes("#") && !out.includes("**"));
  assert.ok(out.includes("Titel"));
});

test("llms.txt renders link list", () => {
  const txt = renderLlmsTxt({
    title: "Demo",
    description: "Index",
    pages: [{ title: "A", description: "d", url: "https://example.com/a" }],
  });
  assert.ok(txt.startsWith("# Demo"));
  assert.ok(txt.includes("- [A](https://example.com/a): d"));
});

test("localBusiness passes explicit country through", () => {
  const s = localBusiness({ name: "N", url: "https://example.com", address: { city: "Austin", zip: "78701", country: "US" } });
  assert.equal(s["@type"], "LocalBusiness");
  assert.equal(s.address.addressCountry, "US");
});

test("localBusiness omits country when not given", () => {
  const s = localBusiness({ name: "N", url: "https://example.com", address: { city: "Austin" } });
  assert.ok(!("addressCountry" in s.address));
});

test("service offer uses explicit currency and note", () => {
  const s = service({ name: "S", url: "https://example.com/s", price: { from: "120", currency: "USD", note: "From $120" } });
  assert.equal(s.offers.priceCurrency, "USD");
  assert.equal(s.offers.description, "From $120");
});

test("service offer falls back to plain currency note", () => {
  const s = service({ name: "S", url: "https://example.com/s", price: { from: "120" } });
  assert.equal(s.offers.priceCurrency, "USD");
  assert.equal(s.offers.description, "USD 120");
});

test("faqPage wraps pairs", () => {
  const s = faqPage([{ q: "Q?", a: "A." }]);
  assert.equal(s.mainEntity[0]["@type"], "Question");
});

test("toScript emits ld+json tag", () => {
  assert.ok(toScript({ a: 1 }).includes('type="application/ld+json"'));
});

test("indexnow payload targets official endpoint", () => {
  const p = buildPayload({ host: "example.com", key: "k", urls: ["https://example.com/a"] });
  assert.equal(p.endpoint, "https://api.indexnow.org/indexnow");
  assert.deepEqual(p.body.urlList, ["https://example.com/a"]);
});

test("sitemap renders urlset", () => {
  const xml = renderSitemap([{ url: "https://example.com/a" }]);
  assert.ok(xml.includes("<urlset"));
  assert.ok(xml.includes("<loc>https://example.com/a</loc>"));
});

test("robots references sitemap and allows all by default", () => {
  const txt = renderRobots({ sitemap: "https://example.com/sitemap.xml" });
  assert.ok(txt.includes("Allow: /"));
  assert.ok(txt.includes("Sitemap: https://example.com/sitemap.xml"));
  assert.ok(!txt.includes("GPTBot"));
});

test("robots can disallow AI crawlers", () => {
  const txt = renderRobots({ sitemap: "https://example.com/sitemap.xml", disallowAI: true });
  assert.ok(txt.includes("User-agent: GPTBot"));
  assert.ok(txt.includes("Disallow: /"));
});

test("skill scripts stay in sync with seo-toolkit", async () => {
  const { readdir, readFile } = await import("node:fs/promises");
  const { join, dirname } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const lib = (await readdir(join(root, "seo-toolkit"))).filter((f) => f.endsWith(".mjs") && f !== "test.mjs");
  const vendored = await readdir(join(root, "skills/astro-seo/scripts"));
  assert.deepEqual([...lib].sort(), [...vendored].sort());
  for (const f of lib) {
    const [a, b] = await Promise.all([
      readFile(join(root, "seo-toolkit", f), "utf8"),
      readFile(join(root, "skills/astro-seo/scripts", f), "utf8"),
    ]);
    assert.equal(b, a, `${f} out of sync`);
  }
});

test("checkLlmsTxt passes a good file", () => {
  const r = checkLlmsTxt("# T\n\n> d\n\n- [A](https://example.com/a): x");
  assert.deepEqual(r.issues, []);
  assert.deepEqual(r.urls, ["https://example.com/a"]);
});

test("checkLlmsTxt flags missing H1 and relative URLs", () => {
  const r = checkLlmsTxt("No heading\n\n- [A](/a): x");
  assert.ok(r.issues.some((i) => i.includes("H1")));
  assert.ok(r.issues.some((i) => i.includes("non-absolute")));
});

test("checkSitemap extracts locs", () => {
  const r = checkSitemap('<?xml version="1.0"?><urlset><url><loc>https://example.com/a</loc></url></urlset>');
  assert.deepEqual(r.urls, ["https://example.com/a"]);
  assert.deepEqual(r.issues, []);
});

test("checkRobots requires an absolute sitemap line", () => {
  assert.deepEqual(checkRobots("User-agent: *\nAllow: /\n").issues, ["missing Sitemap line"]);
  assert.deepEqual(checkRobots("User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n", "https://example.com").issues, []);
});

test("checkAgreement spots sitemap/llms drift", () => {
  const r = checkAgreement(["https://example.com/a"], ["https://example.com/a", "https://example.com/b"]);
  assert.equal(r.issues.length, 1);
  assert.ok(r.issues[0].includes("https://example.com/b"));
});

test("checkJsonLd rejects invalid JSON and typeless schema", () => {
  assert.deepEqual(checkJsonLd("nope").issues, ["invalid JSON"]);
  assert.deepEqual(checkJsonLd('{"a":1}').issues, ["missing @context/@type"]);
  assert.deepEqual(checkJsonLd('{"@context":"https://schema.org","@type":"FAQPage"}').issues, []);
});

test("stripFrontmatter removes the block, keeps the body", async () => {
  const { stripFrontmatter } = await import("./llms-full.mjs");
  assert.equal(stripFrontmatter('---\ntitle: T\n---\n# Body text'), "# Body text\n");
});

test("renderLlmsFull inlines url + body per page", async () => {
  const { renderLlmsFull } = await import("./llms-full.mjs");
  const txt = renderLlmsFull({
    title: "Demo",
    description: "Full",
    pages: [{ title: "A", url: "https://example.com/a", body: "# A body\n" }],
  });
  assert.ok(txt.startsWith("# Demo"));
  assert.ok(txt.includes("## A"));
  assert.ok(txt.includes("https://example.com/a"));
  assert.ok(txt.includes("# A body"));
});

test("collectFull respects the limit", async () => {
  const { collectFull } = await import("./llms-full.mjs");
  const pages = await collectFull("../notes", "https://example.com", 1);
  assert.equal(pages.length, 1);
});

test("frontmatter parses CRLF files", () => {
  const fm = parseFrontmatter('---\r\ntitle: Hi\r\ndescription: There\r\n---\r\nBody');
  assert.equal(fm.title, "Hi");
  assert.equal(fm.description, "There");
});

test("stripMarkdown normalizes CRLF", () => {
  assert.ok(!stripMarkdown("# T\r\n\r\nSome **bold**").includes("\r"));
});

test("collectPages skips hidden dirs and node_modules", async () => {
  const { mkdtemp, mkdir, writeFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join: pjoin } = await import("node:path");
  const { collectPages } = await import("./llms-txt.mjs");
  const dir = await mkdtemp(pjoin(tmpdir(), "seo-"));
  await mkdir(pjoin(dir, ".hidden"), { recursive: true });
  await mkdir(pjoin(dir, "node_modules", "pkg"), { recursive: true });
  await writeFile(pjoin(dir, "a.md"), "# A");
  await writeFile(pjoin(dir, ".hidden", "h.md"), "# H");
  await writeFile(pjoin(dir, "node_modules", "pkg", "n.md"), "# N");
  const pages = await collectPages(dir, "https://example.com");
  await rm(dir, { recursive: true, force: true });
  assert.deepEqual(pages.map((p) => p.url), ["https://example.com/a"]);
});
