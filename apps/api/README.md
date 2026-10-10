# qoodish-api

A Cloudflare Worker that will replace the Rails API (`github.com/yusuke-suzuki/qoodish`) behind `api.qoodish.com`. It is written with Hono and keeps its records in D1 through Drizzle ORM. Until the cutover it is reachable at `api-next.qoodish.com` (`api-next-dev.qoodish.com` for dev) while Rails keeps serving `api.qoodish.com`.

The HTTP contract is the one the Rails API serves today: the same paths, the same JSON shapes, including the v2 cursor pages and the `guest/` variants, and the same `{ title, detail }` error body. The shapes are declared once in `packages/api-contract` and shared with `apps/web` and `apps/admin`.

## Request handling

- Every request resolves its locale from `Accept-Language` through Hono's `languageDetector` (`en` or `ja`, default `en`), and validation messages come from `src/i18n`.
- Every route outside `/guest/*`, `/admin/*` and the health checks requires a `Bearer` Firebase ID token in `Authorization`, enforced by Hono's `bearerAuth` and verified with `jose` against Google's published signing keys (`src/auth/firebase.ts`). A missing or invalid token answers the same localized `401` Rails gives, and the verified claims are available to the route as `c.get('idToken')`.
- Every `/admin/*` route requires a Cloudflare Access assertion in `Cf-Access-Jwt-Assertion`, as the admin dashboard forwards it, verified with `jose` against the team's published keys (`src/auth/access.ts`) for the audience in `CF_ACCESS_AUD`. The claims, including the staff `email` that later resolves the staff member, are available as `c.get('accessClaims')`.
- Errors are thrown as `ApiError` (`src/errors.ts`), a `HTTPException` that carries the Rails error title; the app-level handler renders it and any other `HTTPException` with a Rails title as `{ title, detail }`, keeps the status of an `HTTPException` without one (`413` from a body limit, for instance), and turns unexpected errors into a localized `500`.

## Guest endpoints

Every `/guest/*` and `/guest/v2/*` read Rails serves is served here (`src/guest/`), with the visibility rules of the Rails scopes: a map is public when it is published, not private and not removed by its latest moderation decision; pins and chapters are public when they are published, not removed and on a public map. Each list is read with one query for its rows and one D1 `batch` for everything the serializer needs (authors, images, likes, comments), with id lists bound as a single JSON array (`inIds`) so that no query runs into D1's 100-parameter limit.

Two behaviours deliberately differ from Rails, and the comparison tool below accounts for both:

- Search results are ordered newest first. Rails ordered them by MySQL's relevance score first, which FTS5 cannot reproduce.
- Rows that share a `created_at` are ordered by id, where MySQL returned them in whatever order the chosen index produced.

## Database

The schema lives in `src/db/schema.ts` and migrations in `migrations/`, generated with `pnpm db:generate`.

Full-text search replaces MySQL's ngram FULLTEXT indexes with FTS5 tables that use the `trigram` tokenizer over the searchable columns themselves (`maps_fts`, `pins_fts`, `chapters_fts`, `users_fts`, kept in sync by triggers; `migrations/0002_search_trigram.sql`). `src/search.ts` splits the input the way Rails' `SearchQuery` does and requires every term to occur, case-insensitively, as a substring of one of the columns, which is what MySQL's ngram phrase search matched:

- terms of three or more characters are looked up through the index with an FTS5 phrase;
- two-character terms, which a trigram index cannot look up, are matched with `LIKE` over the columns;
- one-character terms narrow the result with `LIKE`, and input made only of them finds nothing, as in Rails.

`chapters.content_text` holds what MySQL's generated column of the same name holds: the `text` values of the Lexical document, as the JSON array `json_extract(content, '$**.text')` returns.

```bash
pnpm db:migrate:local   # apply migrations to the local D1 that cf dev uses
pnpm dev                # cf dev against the dev worker config
```

## Importing the Rails data

`lib/tasks/export_for_d1.rb` in the Rails repository writes the MySQL database as SQLite statements for D1: every table in foreign-key order, references that point at a table loaded later (`current_revision_id`, `users.image_id`) set by `UPDATE`s once both sides are in, values too long for one D1 statement assembled in a scratch table, and encrypted columns copied as Active Record Encryption ciphertext. It writes `part-NNNNN.sql` files of at most 32 MB and a `manifest.json` with the row count and maximum id of every table.

1. Run the export on the `qoodish-runner` Job, which carries the database credentials, into a Cloud Storage bucket its service account can write to:

   ```bash
   gcloud run jobs execute qoodish-runner --wait \
     --args=bin/rails,runner,lib/tasks/export_for_d1.rb,gs://BUCKET/d1/$(date +%Y%m%d%H%M)
   ```

2. Apply the migrations to an empty database and import the parts in order:

   ```bash
   pnpm db:migrate:dev
   gcloud storage cp 'gs://BUCKET/d1/STAMP/*' ./export/
   for part in ./export/part-*.sql; do
     pnpm --filter qoodish-web exec wrangler d1 execute dev-qoodish-api --remote --yes --file="$PWD/$part"
   done
   ```

3. Check the row counts and maximum ids against `manifest.json`, then compare the two APIs.

## Comparing with Rails

`scripts/compare.ts` crawls the guest listings of the Rails API, follows the ids it finds to every detail, nested list, cursor page and search the guest API offers, requests each path from both APIs and reports what differs:

```bash
pnpm compare --rails https://api-dev.qoodish.com --worker https://api-next-dev.qoodish.com
pnpm compare --rails ... --worker ... --paths recorded-paths.txt --verbose
```

Bodies are compared as parsed JSON. Searches and the `active` and `popular` rankings are compared as sets of records, `recommend` by status only, and everything else in order. `--paths` adds recorded `/guest/...` paths, one per line, and `--verbose` lists the paths that only differ in record or key order. The command exits non-zero when any path differs.

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
