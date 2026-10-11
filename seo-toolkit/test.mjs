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

test("localBusiness schema keeps Swiss defaults", () => {
  const s = localBusiness({ name: "N", url: "https://example.com", address: { city: "Basel", zip: "4000" } });
  assert.equal(s["@type"], "LocalBusiness");
  assert.equal(s.address.addressCountry, "CH");
});

test("service offer uses ab CHF note", () => {
  const s = service({ name: "S", url: "https://example.com/s", price: { from: "120" } });
  assert.equal(s.offers.priceCurrency, "CHF");
  assert.equal(s.offers.description, "ab CHF 120");
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
