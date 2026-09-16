# Qoodish

## Description

https://qoodish.com

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

## Running app

```bash
pnpm dev
```

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
```

## Deployment

Production deploys from `master` through the Cloudflare Workers Builds git
integration. How a deploy is verified and how to roll one back is written down
in [docs/RUNBOOK.md](docs/RUNBOOK.md).
