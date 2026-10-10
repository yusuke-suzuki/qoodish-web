# qoodish-api

A Cloudflare Worker that will replace the Rails API (`github.com/yusuke-suzuki/qoodish`) behind `api.qoodish.com`. It is written with Hono and keeps its records in D1 through Drizzle ORM. Until the cutover it is reachable at `api-next.qoodish.com` (`api-next-dev.qoodish.com` for dev) while Rails keeps serving `api.qoodish.com`.

The HTTP contract is the one the Rails API serves today: the same paths, the same JSON shapes, including the v2 cursor pages and the `guest/` variants, and the same `{ title, detail }` error body. The shapes are declared once in `packages/api-contract` and shared with `apps/web` and `apps/admin`.

## Request handling

- Every request resolves its locale from the leading language of `Accept-Language` (`en` or `ja`, default `en`), the same rule Rails applies, and validation messages come from `src/i18n`.
- A `Bearer` Firebase ID token in `Authorization` is verified with `jose` against Google's published signing keys (`src/auth/firebase.ts`). An invalid token is logged and the request continues as a guest, so each route decides whether to answer `401`.
- Errors are thrown as `ApiError` (`src/errors.ts`) and rendered by the app-level handler; unexpected errors become a localized `500`.

## Database

The schema lives in `src/db/schema.ts` and migrations in `migrations/`, generated with `pnpm db:generate`. Full-text search replaces MySQL's ngram indexes with FTS5 tables over the `*_search_documents` tables (`migrations/0001_fts.sql`).

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
