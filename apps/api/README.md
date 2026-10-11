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

## Signed-in endpoints

The reads Rails serves to a signed-in user outside `/me` (`/users`, `/maps`, `/pins`, `/chapters`, `/journals` and `/v2`) are served from `src/viewer/`. `authenticateUser` resolves the verified token's `sub` to the user with that `uid`, loading the user's active blocks in both directions and active mutes in the same D1 `batch`, and answers `401` when no user has it, as Rails' `authenticate_user!` does. Under `/users` it runs for `GET` only, as in Rails, where `POST /users` signs up a token that has no user yet. The Rails scopes that depend on the viewer (`referenceable_by`, `related_to`, `readable_by`, `feed_for`, `not_blocking`, `not_blocked_by`, `not_muted_by`) are in `src/visibility.ts` under the same names, and the serializers add the viewer state Rails' partials write: `editable`, `liked`, `bookmarking`, `bookmarkable` and the author's `blocking` and `muting`.

`GET /pins/:id/likes` and `GET /pins/:id/comments/:id/likes` have no Rails view, so Rails answers `204` once the pin and comment are found, and so does the worker.

## Differences from Rails

Some behaviours deliberately differ from Rails:

- Search results, including `GET /users?q=`, are the 20 newest matches, newest first. Rails ranked matches by MySQL's relevance score before taking 20, which FTS5 cannot reproduce, so a term with more than 20 matches returns a different set, not only a different order. The comparison tool reports such searches as differences.
- A search term that spans punctuation, such as `華味（ファーウェイ）` or `マン's`, finds the records that contain it. MySQL's ngram index found nothing for such a term, even for the exact name of a record, so the comparison tool reports these searches as differences.
- Rows that share a `created_at` are ordered by id, where MySQL returned them in whatever order the chosen index produced. The comparison tool accounts for this.
- A user whose `name` is `NULL` is serialized with `""`, where Rails wrote `null`. `User` validates the presence of `name`, so only rows older than that validation could hold `NULL`, and the API contract types `name` as a string, which `apps/web` relies on.

## Database

The schema lives in `src/db/schema.ts` and migrations in `migrations/`, generated with `pnpm db:generate`.

Full-text search replaces MySQL's ngram FULLTEXT indexes with FTS5 tables that use the `trigram` tokenizer with `remove_diacritics 1`, kept in sync by triggers (`migrations/0002_search_trigram.sql`). `maps_fts`, `pins_fts` and `users_fts` index the searchable columns of their tables in place. `chapters_fts` stores its own `title` and `body`, where `body` is the `text` values of the Lexical document in `content`, collected with `json_tree` whenever a chapter is inserted or its content changes; it replaces MySQL's generated `content_text` column, which the Rails export leaves out.

`src/search.ts` splits the input the way Rails' `SearchQuery` does and requires every term to occur as a substring of one of the indexed columns, which is what MySQL's ngram phrase search matched:

- terms of three or more characters are looked up through the index with an FTS5 phrase, ignoring case and diacritics as MySQL's `utf8mb4_general_ci` does;
- two-character terms, which a trigram index cannot look up, are matched with `LIKE` over the indexed columns, which ignores the case of ASCII letters only and does not ignore diacritics;
- one-character terms narrow the result with `LIKE`, and input made only of them finds nothing, as in Rails.

```bash
pnpm db:migrate:local   # apply migrations to the local D1 that cf dev uses
pnpm dev                # cf dev against the dev worker config
```

## Importing the Rails data

`lib/tasks/export_for_d1.rb` in the Rails repository writes the MySQL database as SQLite statements for D1: every table in foreign-key order, references that point at a table loaded later (`current_revision_id`, `users.image_id`) set by `UPDATE`s once both sides are in, values too long for one D1 statement assembled in a scratch table, generated columns left out, and encrypted columns copied as Active Record Encryption ciphertext. It writes `part-NNNNN.sql` files of at most 32 MB and a `manifest.json` with the row count and maximum id of every table it wrote, and refuses a destination that already holds objects.

The export reads the tables one after another, so it needs a database nobody writes to while it runs, or a row created midway can reference one that was already read past and fail D1's foreign-key check. For a rehearsal, export from a clone of the production instance, which Cloud SQL copies at a single point in time; at the cutover, stop writes with the maintenance flag first.

1. Clone the instance and run the export on the `qoodish-runner` Job, which carries the database credentials, pointed at the clone's private IP address, into a new prefix of a Cloud Storage bucket its service account can write to. The Job's default task timeout of 10 minutes is too short for the whole database:

   ```bash
   gcloud sql instances clone INSTANCE d1-export-STAMP
   gcloud sql instances describe d1-export-STAMP --format='value(ipAddresses)'
   gcloud run jobs execute qoodish-runner --wait --task-timeout=6h \
     --update-env-vars=DB_HOST=CLONE_PRIVATE_IP \
     --args=bin/rails,runner,lib/tasks/export_for_d1.rb,gs://BUCKET/d1/STAMP \
     && gcloud sql instances delete d1-export-STAMP
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

With a Firebase ID token in `QOODISH_ID_TOKEN`, it also compares the signed-in reads as the user the token belongs to: the signed-in listings and feeds, the signed-in variant of every detail and nested list it crawled, `/users/:id/journal`, `/pins/:id/likes` and `/users?q=`. Both APIs accept the same token, since both verify it against the same Firebase project. On the web app the ID token is the value of the `__session` cookie, and it expires after an hour; read it without echoing it so it stays out of the shell history:

```bash
read -rs QOODISH_ID_TOKEN && export QOODISH_ID_TOKEN
pnpm compare --rails https://api-dev.qoodish.com --worker https://api-next-dev.qoodish.com
unset QOODISH_ID_TOKEN
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
