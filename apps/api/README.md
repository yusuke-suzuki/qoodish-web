# qoodish-api

A Cloudflare Worker that will replace the Rails API (`github.com/yusuke-suzuki/qoodish`) behind `api.qoodish.com`. It is written with Hono and keeps its records in D1 through Drizzle ORM. Until the cutover it is reachable at `api-next.qoodish.com` (`api-next-dev.qoodish.com` for dev) while Rails keeps serving `api.qoodish.com`.

The HTTP contract is the one the Rails API serves today: the same paths, the same JSON shapes, including the v2 cursor pages and the `guest/` variants, and the same `{ title, detail }` error body. The shapes are declared once in `packages/api-contract` and shared with `apps/web` and `apps/admin`.

## Request handling

- Every request resolves its locale from `Accept-Language` through Hono's `languageDetector` (`en` or `ja`, default `en`), and validation messages come from `src/i18n`.
- Every route outside `/guest/*`, `/admin/*` and the health checks requires a `Bearer` Firebase ID token in `Authorization`, enforced by Hono's `bearerAuth` and verified with `jose` against Google's published signing keys (`src/auth/firebase.ts`). A missing or invalid token answers the same localized `401` Rails gives, and the verified claims are available to the route as `c.get('idToken')`.
- Every `/admin/*` route requires a Cloudflare Access assertion in `Cf-Access-Jwt-Assertion`, as the admin dashboard forwards it, verified with `jose` against the team's published keys (`src/auth/access.ts`) for the audience in `CF_ACCESS_AUD`. The claims, including the staff `email` that later resolves the staff member, are available as `c.get('accessClaims')`.
- Errors are thrown as `ApiError` (`src/errors.ts`), a `HTTPException` that carries the Rails error title; the app-level handler renders it and any other `HTTPException` with a Rails title as `{ title, detail }`, keeps the status of an `HTTPException` without one (`413` from a body limit, for instance), and turns unexpected errors into a localized `500`.

## Database

The schema lives in `src/db/schema.ts` and migrations in `migrations/`, generated with `pnpm db:generate`.

Full-text search replaces MySQL's ngram indexes with FTS5 tables over the `*_search_documents` tables (`migrations/0001_fts.sql`). FTS5's `unicode61` tokenizer does not split CJK text, so the application writes `terms` already segmented the way MySQL's ngram parser did: the searchable columns of the record, lower-cased and broken into space-separated bigrams. A query is segmented the same way and matched as a phrase, which gives the same results as the `+"term"` boolean-mode query Rails builds. The write path and the query helper arrive with the first read endpoints; until then the tables are empty.

```bash
pnpm db:migrate:local   # apply migrations to the local D1 that cf dev uses
pnpm dev                # cf dev against the dev worker config
```

## Test

Tests run inside workerd through `@cloudflare/vitest-plugin` with a fresh local D1 that `src/test/setup.ts` migrates before each file.

```bash
pnpm test
pnpm typecheck
```

## Deploy

Workers Builds will deploy the worker from `master` once it is connected; until then, from a machine that is logged in to Cloudflare:

```bash
pnpm exec cf deploy               # api-next.qoodish.com
pnpm exec cf deploy --mode dev    # api-next-dev.qoodish.com
```

Apply migrations to the remote database before the deploy, the same order the Rails release follows:

```bash
pnpm db:migrate:dev    # dev-qoodish-api
pnpm db:migrate:prod   # prod-qoodish-api
```
