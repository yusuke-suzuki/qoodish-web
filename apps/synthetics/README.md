# qoodish-web-synthetics

A Cloudflare Worker that checks production every 30 minutes with a real browser through Browser Rendering. Each run verifies `/api/health`, the top page, and a public map detail page on the `TARGET_ORIGIN` configured in `wrangler.jsonc`, and fails the scheduled invocation when any check does.

A failed run surfaces as an exception in the worker's logs, which the telemetry export sends to the destinations named in `wrangler.jsonc`. Alerting on it lives there, alongside an alert for the absence of successful runs.

## Deploy

Workers Builds deploys the worker from `master`, so a merge is the release. To deploy the checked-out revision from a machine that is logged in to Cloudflare:

```bash
pnpm cf:deploy
```
