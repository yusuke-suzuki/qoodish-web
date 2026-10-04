# Qoodish

## Description

https://qoodish.com

The web app is a Next.js app deployed to Cloudflare Workers through
[OpenNext](https://opennext.js.org/cloudflare). The API it talks to is
[qoodish](https://github.com/yusuke-suzuki/qoodish). This repository also
holds two more workers and the Android app, each with its own README:

- [`admin`](admin/README.md): the moderation dashboard
- [`synthetics`](synthetics/README.md): scheduled checks against production
- [`android`](android/README.md): the Google Play app wrapping the web app

## Installation

```bash
pnpm install
```

## Environment variables

`.env.example` lists every variable the app reads. Copy it to `.env.local`
and fill in the values, or decrypt the shared set:

```bash
gcloud secrets versions access latest --secret=QOODISH_WEB_DOTENV --project=$PROJECT_ID --out-file=.env.local
```

`.env` files are ignored by git, so never commit one.

A deployed worker takes `APP_ENV` and `API_ENDPOINT` from the `vars` of
its environment in `wrangler.jsonc` instead.

## Running app

```bash
pnpm dev
```

To run the worker as it is deployed, build it for the dev environment and
serve it with the Workers runtime on http://localhost:8787:

```bash
pnpm cf:build:dev
pnpm preview
```

## Tests

```bash
pnpm lint        # Biome
pnpm typecheck   # TypeScript
pnpm test        # unit tests (node:test)
pnpm e2e         # Playwright smoke tests
```

`pnpm e2e` serves the worker with `pnpm preview` unless `E2E_BASE_URL`
points at a running app, so build it with `pnpm cf:build:dev` first. The
tests find content through the API at `E2E_API_URL`, which defaults to the
dev API. Pull requests run all of these in CI, and every push to `master`
runs the smoke tests against production once it serves that commit.

## Deployment

Cloudflare Workers Builds deploys the app, so merging to `master` releases
it to qoodish.com. To deploy the checked-out revision from a machine that
is logged in to Cloudflare:

```bash
pnpm cf:deploy        # qoodish.com
pnpm cf:deploy:dev    # the dev environment
```
