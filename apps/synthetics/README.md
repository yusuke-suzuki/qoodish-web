# qoodish-web-synthetics

A Cloudflare Worker that checks production every 30 minutes with a real browser through Browser Rendering. Each run verifies `/api/health`, the top page, and a public map detail page on the `TARGET_ORIGIN` configured in `cloudflare.config.ts`, and fails the scheduled invocation when any check does.

A failed run surfaces as an exception in the worker's Workers Logs and as an issue in Workers Issues, whose automations send the alert. The absence of successful runs is alerted on by a Workers Observability alert.

## Develop

`pnpm dev` runs the worker locally. Request `/cdn-cgi/handler/scheduled` to fire the scheduled handler.

## Deploy

Workers Builds deploys the worker from `master`, so a merge is the release. To deploy the checked-out revision from a machine that is logged in to Cloudflare:

```bash
pnpm exec cf deploy
```
