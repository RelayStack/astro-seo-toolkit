export function buildPayload({ host, key, urls }) {
  return {
    endpoint: "https://api.indexnow.org/indexnow",
    body: { host, key, urlList: urls },
  };
}

export async function submit({ host, key, urls, fetchImpl = fetch }) {
  const { endpoint, body } = buildPayload({ host, key, urls });
  const res = await fetchImpl(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status };
}

function args(argv) {
  const out = { urls: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--url") out.urls.push(argv[++i]);
    else if (a.startsWith("--")) {
      const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      out[a.slice(2)] = v;
    } else {
      out.urls.push(a);
    }
  }
  return out;
}

const isCli = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());

if (isCli) {
  const a = args(process.argv.slice(2));
  if (!a.host || !a.key || a.urls.length === 0) {
    console.error("Usage: node indexnow.mjs --host example.com --key KEY --url https://example.com/a [--url ..]");
    process.exit(1);
  }
  const result = await submit({ host: a.host, key: a.key, urls: a.urls });
  console.log(JSON.stringify(result));
  if (!result.ok) process.exit(1);
}
