import { defineConfig } from "astro/config";
import astroSeo from "astro-seo-toolkit/integration";

export default defineConfig({
  site: "https://example.com",
  trailingSlash: "always",
  integrations: [
    // Regenerates llms.txt, llms-full.txt, sitemap.xml and robots.txt on every build.
    astroSeo({
      contentDir: "src/content",
      llmsFull: true,
    }),
  ],
});
