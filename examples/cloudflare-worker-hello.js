// Minimal Cloudflare Worker — hello with JSON + health check.
// Deploy: wrangler deploy / test: wrangler dev

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({ ok: true });
    }
    return Response.json({ hello: "world" });
  },
};
