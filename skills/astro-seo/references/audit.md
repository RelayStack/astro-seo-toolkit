# Audit

Run against source or `dist/`. Report each line pass/fail with the evidence. Fix failures before launch. Shortcut: `node scripts/check.mjs --dir <public-dir> [--site <url>]` automates the file checks below.

## Files exist and agree

- [ ] `public/llms.txt`, `public/sitemap.xml`, `public/robots.txt` all generated from the same content dir — verify: every sitemap URL appears in `llms.txt` and vice versa.
- [ ] `robots.txt` references the absolute sitemap URL. Verify with `curl`.
- [ ] Regeneration is in the `build` script. Verify by reading `package.json`, not by trusting docs.

## llms.txt validity

- [ ] Exactly one H1, blockquote summary after it, links as `- [Name](url): description`.
- [ ] No stale URLs: spot-check 3 links with `curl -o /dev/null -w "%{http_code}"`.

## Schema validity

- [ ] Exactly one JSON-LD block per page type on every public page (org globally + one page block). Verify: `node -e` parse of each emitted block, or Rich Results Test on the deployed URL.
- [ ] FAQ markup mirrors visible text only. Prices carry explicit `priceCurrency`.
- [ ] No schema on 404/admin/thank-you pages.

## Indexation readiness

- [ ] Canonical absolute on every page, matching sitemap URLs including trailing slash.
- [ ] Sitemap submitted in Search Console + Bing WT (first launch). IndexNow key file live before promising submissions.

## Honest expectations to state in the report

- `llms.txt` does not move Google. It helps non-Google agents.
- IndexNow covers Bing/Yandex/Seznam/Naver, not Google.
- AI citations follow indexation with a lag of days to weeks; re-audit then.
