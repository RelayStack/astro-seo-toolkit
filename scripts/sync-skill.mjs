#!/usr/bin/env node
/**
 * Copies the canonical helpers in `seo-toolkit/` into the self-contained agent
 * skill at `skills/astro-seo/scripts/`. The skill ships as a flat folder users
 * copy into ~/.claude/skills/ or a project's .opencode/skills/, so it cannot
 * import across directories — the duplication is intentional and generated.
 *
 *   node scripts/sync-skill.mjs          # update the vendored copies
 *   node scripts/sync-skill.mjs --check  # fail if they drifted (CI)
 */
import { readdir, readFile, writeFile, mkdir, chmod } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(root, "seo-toolkit");
const TARGET = join(root, "skills/astro-seo/scripts");
const SKIP = new Set(["test.mjs"]);

export async function syncSkill({ check = false } = {}) {
  const files = (await readdir(SOURCE)).filter((f) => f.endsWith(".mjs") && !SKIP.has(f)).sort();
  const drift = [];

  if (!check) await mkdir(TARGET, { recursive: true });
  const vendored = new Set(await readdir(TARGET).catch(() => []));

  for (const name of files) {
    const source = await readFile(join(SOURCE, name), "utf8");
    const current = vendored.has(name) ? await readFile(join(TARGET, name), "utf8") : null;
    if (check) {
      if (current !== source) drift.push(name);
      continue;
    }
    await writeFile(join(TARGET, name), source);
    await chmod(join(TARGET, name), 0o755);
  }

  if (check) {
    const stale = [...vendored].filter((f) => f.endsWith(".mjs") && !files.includes(f));
    return { files, drift: [...drift, ...stale] };
  }
  return { files, drift: [] };
}

const isCli = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());

if (isCli) {
  const check = process.argv.includes("--check");
  const { files, drift } = await syncSkill({ check });
  if (check && drift.length > 0) {
    console.error(`skill scripts out of sync: ${drift.join(", ")}\nRun: npm run sync:skill`);
    process.exit(1);
  }
  console.error(check ? `skill scripts in sync (${files.length} files).` : `synced ${files.length} scripts to skills/astro-seo/scripts/.`);
}
