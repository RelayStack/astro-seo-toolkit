import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter, stripMarkdown, renderLlmsTxt } from "./llms-txt.mjs";
import { localBusiness, service, faqPage, toScript } from "./json-ld.mjs";
import { buildPayload } from "./indexnow.mjs";
import { renderSitemap } from "./sitemap.mjs";
import { renderRobots } from "./robots.mjs";

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
