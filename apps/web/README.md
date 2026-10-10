# qoodish-web

The Next.js app behind https://qoodish.com, deployed to Cloudflare Workers
through [OpenNext](https://opennext.js.org/cloudflare). Setup, tests and
deployment are described in the [repository README](../../README.md).

## Maintenance mode

The `MAINTENANCE` KV namespace holds one key, `maintenance`. While it is
set, every page shows a maintenance notice to signed-in users and guests
alike, and every write the app would send to the API answers `503` without
reaching it. Reads keep working. The flag is read per environment, so the
dev worker and the production worker are toggled independently through
`--env`.

Turn it on by storing when the maintenance ends, as an ISO 8601 timestamp
with an offset:

```bash
pnpm exec wrangler kv key put --binding MAINTENANCE maintenance '{"until":"2026-10-20T15:00:00+09:00"}' --remote
```

The notice reads "under maintenance until <until>" in the viewer's
language. To replace it, add a `message` with the text for either or both
languages:

```bash
pnpm exec wrangler kv key put --binding MAINTENANCE maintenance '{"until":"2026-10-20T15:00:00+09:00","message":{"en":"Qoodish is moving to a new database until 15:00 JST.","ja":"15:00 までデータベースを移行しています。"}}' --remote
```

Turn it off by deleting the key:

```bash
pnpm exec wrangler kv key delete --binding MAINTENANCE maintenance --remote
```

Add `--env dev` to any of these to toggle the dev worker instead of
production. Each isolate rereads the flag every 30 seconds, so a change
takes up to that long to reach every visitor. A value the app cannot parse
is treated as no maintenance.
