# Contributing

Questions and ideas go to [Discussions](https://github.com/RelayStack/astro-seo-toolkit/discussions) first — issues are for confirmed bugs and agreed features.

## Rules

- Zero dependencies in `seo-toolkit/` and `skills/astro-seo/scripts/`. Node 18+ stdlib only.
- Every helper works as CLI and import, with usage errors on bad flags and non-zero exit on failure.
- `skills/astro-seo/scripts/` is generated from `seo-toolkit/` by `npm run sync:skill` and must stay byte-identical. Edit the `seo-toolkit/` copy, then run `npm run sync:skill`. `npm test` and `npm run check:skill` both fail on drift.
- Bins are executed through a `node_modules/.bin/` symlink by npm. Detect "am I the CLI?" by comparing resolved paths (`pathToFileURL(realpathSync(process.argv[1]))`), never by matching the file name — a suffix check silently turns the CLI into a no-op under `npx`.
- No locale defaults: country/currency explicit, neutral examples (`example.com`, Acme Co.).
- No personal data in code, docs, or tests — brand-neutral examples only.

## Flow

1. Fork, branch from `main` (`feat/…`, `fix/…`, `docs/…`).
2. Add tests in `seo-toolkit/test.mjs` (`npm test`, must stay green). If you touched `seo-toolkit/`, run `npm run sync:skill` and commit the vendored copies.
3. Open a PR with what changed and how you verified it.
4. One concern per PR; docs updates ride with the feature they describe.

## Releases

Maintainers bump `package.json` + `CHANGELOG.md` on `main`, then push a `vX.Y.Z` tag. CI (`.github/workflows/release.yml`) checks the tag matches the version and publishes to npm with provenance.
