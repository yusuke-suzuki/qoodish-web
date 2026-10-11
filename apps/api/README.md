# qoodish-api

The Qoodish API: a Cloudflare Worker written with Hono that keeps its records in D1 through Drizzle ORM. It is served at `api-next.qoodish.com` (`api-next-dev.qoodish.com` for dev). The JSON shapes of its responses are declared in `packages/api-contract` and shared with `apps/web` and `apps/admin`.
## Request handling

Each route file under `src/routes` is a Hono app whose path mirrors the URL it serves (`src/routes/guest/v2/pins.ts` serves `/guest/v2/pins`), mounted in `src/app.ts` with `app.route()`. The queries and response shapes they share live in one module per resource at the top of `src` (`maps.ts`, `pins.ts`, `chapters.ts`, ...).

- Every request resolves its locale from `Accept-Language` through Hono's `languageDetector` (`en` or `ja`, default `en`), and error and validation messages come from `src/i18n`.
- Every route outside `/guest/*`, `/admin/*` and the health checks requires a `Bearer` Firebase ID token in `Authorization`, verified with `jose` against Google's published signing keys (`src/auth/firebase.ts`). A missing or invalid token answers a localized `401`.
- Every `/admin/*` route requires a Cloudflare Access assertion in `Cf-Access-Jwt-Assertion`, as the admin dashboard forwards it, verified against the team's published keys for the audience in `CF_ACCESS_AUD` (`src/auth/access.ts`).
- Errors are answered as `{ title, detail }`. They are thrown as `ApiError` (`src/errors.ts`), which carries the title; an `HTTPException` without one keeps its status (`413` from a body limit, for instance), and unexpected errors become a localized `500`.

## Who sees what

`/guest/*` serves what anyone may see. A map is public when it is published, not private and not removed by its latest moderation decision; a pin or chapter is public when it is published, not removed and on a public map.

Every other route acts for the user whose `uid` is the token's `sub`, loaded by the `authenticateUser` middleware (`src/middleware/authenticate-user.ts`), and answers `401` when there is none; under `/users` only `GET` requires the user. The user's active blocks in both directions and active mutes are loaded with the user. On top of that, `src/visibility.ts` defines what a signed-in user sees:

- a map is referenceable when it is published and not removed, is public, the user's own or coauthored by the user, and its author does not block the user;
- a pin or chapter is referenceable when it is published, not removed, on a referenceable map and its author does not block the user, and the user can also read their own chapters in any status but deleted;
- the feeds and recommendations leave out the authors who block the user, whom the user blocks and whom the user mutes, and so do the comments under a pin or chapter and the notifications;
- `/me` serves the user's own records whatever their visibility to others, except that own maps and pins removed by moderation are left out.

The responses add what concerns the user: `editable`, `liked`, `bookmarking`, `bookmarkable`, and the author's `blocking` and `muting`. `GET /pins/:id/likes` and `GET /pins/:id/comments/:id/likes` answer `204` with no body once the pin and comment are found.

Lists are ordered by `created_at` and then by id. Each list is read with one query for its rows and one D1 `batch` for everything its records need (authors, images, likes, comments), with id lists bound as a single JSON array (`inIds`) so that no query runs into D1's 100-parameter limit.

## Writes

A write that spans several rows runs as one D1 `batch`, which D1 applies atomically. Rows it inserts are referenced by the later statements of the batch through their natural keys (`users.uid`, `journals.user_id`) or as the newest row of their table, so no statement waits for an id from another.

- `POST /users` signs in the token's user. A new user is created with a revision, a private map named after them and a journal; an existing one only has their email and locale refreshed.
- Edits to a user's name and biography, and to a journal's title and description, append a revision and point the record at it. An edit that changes nothing appends nothing.
- Notification settings are never updated in place: each change appends a snapshot of every choice, and the newest snapshot is the user's settings.

Validation failures answer `422` with the localized messages joined in `detail`; a request body of the wrong shape answers `400`.

## Search

Search uses FTS5 tables with the `trigram` tokenizer and `remove_diacritics 1`, kept in sync by triggers (`migrations/0002_search_trigram.sql`). `maps_fts`, `pins_fts` and `users_fts` index the searchable columns of their tables in place. `chapters_fts` stores its own `title` and `body`, where `body` is the `text` values of the Lexical document in `content`, collected with `json_tree` whenever a chapter is inserted or its content changes.

`src/search.ts` splits the input on whitespace, drops `"`, and requires every term to occur as a substring of one of the indexed columns:

- terms of three or more characters are looked up through the index with an FTS5 phrase, ignoring case and diacritics;
- two-character terms, which a trigram index cannot look up, are matched with `LIKE` over the indexed columns, which ignores the case of ASCII letters only and does not ignore diacritics;
- one-character terms narrow the result with `LIKE`, and input made only of them finds nothing.

A search answers the 20 newest matches, newest first.

## Database

The schema lives in `src/db/schema.ts` and migrations in `migrations/`, generated with `pnpm db:generate`.

`journeys.encoded_path` is stored encrypted in Active Record Encryption's format: AES-256-GCM under a key derived with PBKDF2-HMAC-SHA256 (65,536 iterations) from the `ENCRYPTION_PRIMARY_KEY` and `ENCRYPTION_KEY_DERIVATION_SALT` secrets, with the payload deflated when the `c` header is set. `src/encryption.ts` decrypts it.

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
