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

Prerequisites (one-time setup):

- Create the R2 bucket `qoodish-web-incremental-cache`
- Set the runtime secret: `pnpm exec wrangler secret put API_ENDPOINT`
- Provide build-time variables (`NEXT_PUBLIC_*`, including `NEXT_PUBLIC_SITE_URL=https://qoodish.com`) via `.env.local` or CI environment

```bash
$ pnpm run deploy
```
