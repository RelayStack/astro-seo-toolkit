# Contributing

Questions and ideas go to [Discussions](https://github.com/RelayStack/astro-seo-toolkit/discussions) first — issues are for confirmed bugs and agreed features.

## Rules

- Zero dependencies in `seo-toolkit/` and `skills/astro-seo/scripts/`. Node 18+ stdlib only.
- Every helper works as CLI and import, with usage errors on bad flags and non-zero exit on failure.
- `skills/astro-seo/scripts/` must stay byte-identical to `seo-toolkit/` (enforced by test). Edit the `seo-toolkit/` copy, then copy over.
- No locale defaults: country/currency explicit, neutral examples (`example.com`, Acme Co.).
- No personal data in code, docs, or tests — brand-neutral examples only.

## Flow

1. Fork, branch from `main` (`feat/…`, `fix/…`, `docs/…`).
2. Add tests in `seo-toolkit/test.mjs` (`npm test`, must stay green).
3. Open a PR with what changed and how you verified it.
4. One concern per PR; docs updates ride with the feature they describe.

## Releases

Maintainers cut releases from `main` (`vX.Y.Z`, semver) with notes in CHANGELOG.md.
