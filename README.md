# Qoodish

## Description

https://qoodish.com

## Installation

```bash
$ pnpm install
```

## Decrypt secrets

```bash
$ gcloud secrets versions access latest --secret=QOODISH_WEB_DOTENV --project=$PROJECT_ID --out-file=.env.local
```

## Running app

```bash
$ pnpm dev
```

## Preview on the Workers runtime

Copy `.dev.vars.example` to `.dev.vars`, then:

```bash
$ pnpm preview
```

## Deploy to Cloudflare Workers

Pushes to `master` deploy to production via the `Prod` workflow.

Prerequisites (one-time setup):

- Create the R2 bucket `qoodish-web-incremental-cache`
- Store a Cloudflare API token with `Workers Scripts: Edit` permission as the `QOODISH_WEB_CLOUDFLARE_API_TOKEN` secret in Secret Manager
- Include `NEXT_PUBLIC_SITE_URL=https://qoodish.com` in the `QOODISH_WEB_DOTENV` secret

Manual deploy from a local checkout:

```bash
$ pnpm run deploy
```
