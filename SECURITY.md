# Security

## Reporting a problem

Please report security problems privately through
[GitHub's private vulnerability reporting](https://github.com/Shahryartariq/hashwire/security/advisories/new),
not in a public issue. You'll get a reply within a week.

Useful details: the page or address, what you did, what happened, and what you expected.

## What's in scope

- https://hashwire.vercel.app and its preview deployments
- The code in this repository

Problems in the news feeds themselves (a publisher's site) are out of scope; report those to the publisher.

## How the site is built to stay safe

- A strict Content Security Policy with a fresh nonce per request; no inline scripts without it.
- Feed text is shown as plain text. The reader view keeps only an allowlist of HTML tags (no scripts,
  styles, images, iframes or event handlers) and rewrites every link to an absolute http(s) or mailto address.
- Feeds are downloaded with a 10-second timeout and a 5 MB cap, so a broken feed can't hold the server.
- No accounts, cookies or user data are stored.
