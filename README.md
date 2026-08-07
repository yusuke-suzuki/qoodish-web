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

Both environments live in one Cloudflare account as separate Workers:

| Environment | Worker | Deployed by |
| --- | --- | --- |
| dev | `dev-qoodish-web` | Pushing to `master` (`Dev` workflow) |
| production | `prod-qoodish-web` | Tagging a release via release-please (`Prod` workflow) |

Prerequisites (one-time setup, per environment):

- Create the R2 bucket (`prod-qoodish-web-incremental-cache` for production, `dev-qoodish-web-incremental-cache` for dev)
- Store a Cloudflare API token with `Workers Scripts: Edit` permission as the `QOODISH_WEB_CLOUDFLARE_API_TOKEN` secret in Secret Manager, in both the `qoodish` and `qoodish-dev` projects

Manual deploy from a local checkout:

```bash
$ pnpm run deploy      # production
$ pnpm run deploy:dev  # dev
```
