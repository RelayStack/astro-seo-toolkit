# Security policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.2.x   | yes       |
| < 0.2   | no        |

## Reporting

Report vulnerabilities privately via the repo's Security advisories tab. Include the helper, version, and a minimal repro. Expect a first response within 7 days.

## Scope notes

- Helpers are local file/string processors; only `indexnow.mjs` makes a network call, and only to the official `https://api.indexnow.org/indexnow` endpoint you invoke explicitly.
- Never paste API keys, site credentials, or private URLs into issues, discussions, or PRs.
