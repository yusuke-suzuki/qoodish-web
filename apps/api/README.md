# qoodish-api

The Qoodish API: a Cloudflare Worker written with Hono that keeps its records in D1 through Drizzle ORM. The JSON shapes of its responses are declared in `packages/api-contract` and shared with `apps/web` and `apps/admin`. The rules for changing it are in `CLAUDE.md`.

## Develop

```bash
pnpm db:migrate:local   # apply migrations to the local D1 that cf dev uses
pnpm dev                # run the dev worker locally
pnpm test
pnpm typecheck
```

Routes outside `/guest/*`, `/admin/*` and the health checks need a Firebase ID token of the dev project in `Authorization: Bearer <token>`. `/admin/*` needs a Cloudflare Access assertion in `Cf-Access-Jwt-Assertion` instead. `GET /me/journeys/:id` also needs the `ENCRYPTION_PRIMARY_KEY` and `ENCRYPTION_KEY_DERIVATION_SALT` secrets to decrypt the journey's path.
