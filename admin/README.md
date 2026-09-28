# qoodish-web-admin

A Cloudflare Worker that serves the moderation dashboard on `admin.qoodish.com` (`admin-dev.qoodish.com` for dev). It lists pending reports, shows each report with its snapshot and decision history, and records decisions through the admin API of the Rails backend. Staff members holding the `manage_staff` permission also grant and remove roles and revoke access on the staff page.

The assets page renders the app icons (standard and maskable, in every size the web app and the manifest reference) and the share image for each language. Each file is drawn by [Browser Rendering](https://developers.cloudflare.com/browser-rendering/) through the `BROWSER` binding and served as a PNG, which a maintainer downloads and uploads to where the web app loads it from. A render is cached by Browser Rendering for a day, and a render whose fonts or photograph fail to load answers `502` instead of an incomplete image.

The pages are rendered on the server with Hono's JSX and use plain HTML forms, so the dashboard runs no client-side JavaScript. Every page is available in English and Japanese under `/en` and `/ja`; `/` redirects by the browser's language.

## Access

Cloudflare Access protects the whole host. The worker also verifies the `Cf-Access-Jwt-Assertion` header against the team's certs and answers `401` without a valid one, then forwards the same assertion to the API, which verifies it again and records the moderator's email.

Verification fails closed: until `CF_ACCESS_TEAM_DOMAIN` (the team domain Zero Trust shows, for example `<team>.cloudflareaccess.com`) and `CF_ACCESS_AUD` (the Access application's AUD tag) are set in `wrangler.jsonc`, every request answers `401`.

## Develop

`pnpm dev` runs the dev environment locally. Requests need an Access assertion that verifies against `CF_ACCESS_TEAM_DOMAIN`, so a local run needs that value, `CF_ACCESS_AUD` and `API_ENDPOINT` pointed at a server that can sign and accept such a token. The `BROWSER` binding reaches the account's Browser Rendering, so rendering assets counts against its usage even from a local run.

```bash
pnpm test
pnpm typecheck
```

## Deploy

Workers Builds deploys the worker from `master`, so a merge is the release. To deploy the checked-out revision from a machine that is logged in to Cloudflare:

```bash
pnpm cf:deploy        # admin.qoodish.com
pnpm cf:deploy:dev    # admin-dev.qoodish.com
```
