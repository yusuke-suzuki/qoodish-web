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

## Error monitoring

Server errors are logged as JSON lines from `src/instrumentation.ts`, and client errors are posted to `/api/errors` and logged the same way, so both are searchable in Workers Logs. `tail/` is a Tail Worker that receives those events from the production worker and posts anything with an exception or an error-level log to the same `ALERT_WEBHOOK_URL` secret, at most once every five minutes per instance.

The production worker names `qoodish-web-tail` in `tail_consumers`, so the tail worker has to be deployed before any change that adds or renames it:

```bash
$ cd tail
$ pnpm wrangler secret put ALERT_WEBHOOK_URL
$ pnpm cf:deploy
```
