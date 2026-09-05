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

## Synthetic monitoring

`synthetics/` is a separate Cloudflare Worker that checks production every 30 minutes with a real browser. Failures are posted to the webhook stored in the `ALERT_WEBHOOK_URL` secret (Slack incoming webhooks and Discord webhooks both work); without the secret they are only visible in the Cloudflare dashboard.

```bash
$ cd synthetics
$ pnpm wrangler secret put ALERT_WEBHOOK_URL
$ pnpm cf:deploy
```
