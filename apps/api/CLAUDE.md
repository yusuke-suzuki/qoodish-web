# Claude Code Context for apps/api

The Qoodish API: a Hono app on Cloudflare Workers that keeps its records in D1 through Drizzle ORM. `README.md` covers local development. This file holds the rules for changing it.

## 1. Structure

- Follow Hono's best practices. Each file under `src/routes` is a `new Hono()` exported by default, its path mirrors the URL it serves (`src/routes/guest/v2/pins.ts` serves `/guest/v2/pins`), and `src/app.ts` mounts it with `app.route()`. Write each handler inline after its path. Do not add controllers or a service layer.
- Write middleware with `createMiddleware` from `hono/factory` under `src/middleware`. Read the Drizzle client that `provideDatabase` creates for each request with `c.get('db')`. A route file that acts for the signed-in user applies `authenticateUser` and reads the user with `c.get('viewer')`.
- Queries and response shapes used by more than one route file go in one module per resource at the top of `src` (`maps.ts`, `pins.ts`, `chapters.ts`, ...). A query used by one route file stays in it.
- Response types are declared in `packages/api-contract` and shared with `apps/web` and `apps/admin`. Answer with `c.json<T>()` against the contract type.
- Throw errors as `ApiError` (`src/errors.ts`). Their messages are user-facing and come from `src/i18n`, so a new message needs both an English and a Japanese version.
- Validate request bodies and path params with the `jsonBody` and `pathParams` validators in `src/validation.ts`, which wrap `@hono/zod-validator`, and read them with `c.req.valid()`. Express every rule on the input's shape and content (type, presence, length) in the zod schema, with a message key from `src/i18n` as the issue's error so that it answers 422 with that message. Keep in code only the checks that need the database, such as a duplicate name or an image the user does not own.
- Compatibility with the previous API extends to the HTTP contract (paths, status codes, JSON shapes, messages) and stops there. Write the code behind it the way Hono, Drizzle and zod document, rather than reproducing how the previous implementation was structured.

## 2. Queries

- Do not query per record. Read a list with one query for its rows and one `db.batch` for everything its records need (authors, images, likes, comments), and bind id lists with `inIds` as a single JSON array: D1 allows 100 bound parameters per statement.
- Alias every computed select field (`sql`, `$count`, ...) with `.as()`. Drizzle can map an unaliased computed field on D1 to the wrong key.
- Build subqueries with the query builder rather than a hand-written `sql` string, which leaves column names unqualified and ambiguous once the outer query joins.

## 3. Data Model

- **Atomic writes:** D1 has no interactive transactions. Write a change that spans several rows as one `db.batch`, which D1 runs atomically.
- **External calls:** The rows in D1 and the resources at other services (Identity Platform, Cloudflare Images, ...) must never contradict each other, and no transaction can span them.
    - A change whose outcome the stored rows assert at another service (creating or deleting a resource that a row points to) runs as a Workflow (`WorkflowEntrypoint`) with one `step.do` per service, and the route only starts it. Workflows retry each step and persist its result, so a failure halfway is completed instead of left behind for the user to notice. Make every step idempotent, because a step that succeeded can run again, and order the steps so that the state between two of them is one the API already tolerates, as deleting the sign-in first keeps anyone from signing back into an account whose records are being deleted.
    - A call that only reports a stored fact (mail, Web Push, notifications) is sent to a Queue after the batch has succeeded. Sent before it, it cannot be taken back when the batch fails.
- **Integrity:** Back every integrity rule with a constraint in `src/db/schema.ts` (NOT NULL, unique index, foreign key), because a check in code alone races. Check in code as well only to answer a localized error.
- **Immutable data model:** Design tables as immutable by default, following https://scrapbox.io/kawasima/イミュータブルデータモデル. Record what happened as insert-only rows and derive current state from them (as `unblocks` and `unmutes` end a block or mute) instead of updating status or flag columns in place. Physical deletion required to remove personal data takes precedence.
- **Concurrency:** D1 serializes writes and has no row locks. Prefer a unique index, an insert-only design, or an update conditioned on a version column over reading a row and writing it back.
- **One write path:** Write a table only through the functions of its resource module, so that the rules each write must keep live in one place and reach every route that writes it.

## 4. Tests

- Cover every route change with a test. Tests run inside workerd through `@cloudflare/vitest-plugin` (`pnpm test`), each file against a fresh local D1 seeded by `src/test/world.ts`.
- Put each test file next to the source file it covers and name it after that file: a test of an endpoint goes beside the route file that serves it (`src/routes/guest/v2/pins.ts` → `src/routes/guest/v2/pins.test.ts`), and a test that calls a module directly goes beside that module (`src/votes.test.ts`). Send requests through `src/test/client.ts`.
- Insert fixture rows in chunks that stay under D1's 100 bound parameters per statement.

## 5. Migrations and Deployment

- The schema lives in `src/db/schema.ts`. Generate migrations with `pnpm db:generate`. For what Drizzle cannot express, such as FTS5 tables and triggers, generate an empty migration with `pnpm db:generate --custom` and write its SQL.
- Migrations contain schema changes only. Change existing data with a separate script, never inside a migration.
- A migration may be edited while its PR is open, but never after it has been merged: D1 records applied migrations by name and never reruns one, so add a new migration instead.
- The previous version keeps serving after a migration applies, so a migration must leave it working: add and backfill first, read the result in the same deploy or a later one, and never remove or rename what the running version still reads.
- Removing a column or a table takes two deploys. First remove every reference to it (schema, queries, routes, scripts, fixtures and tests) and deploy. Only after that deploy is live, drop it with a migration in a separate PR.

## 6. Compatibility

- `apps/web` and `apps/admin` deploy separately from the API, so an API change must keep their deployed versions working. Keep the API backward compatible, and when a change needs the workers deployed in a particular order, write that order in the PR description.
- Paths without a version prefix are v1, and their contracts are frozen: do not change the shape of a response or the meaning of a parameter there. To change an endpoint's contract, add the new contract under `/v2` (`src/routes/v2/`) next to the v1 endpoint. An endpoint whose contract does not change stays at v1 only. Once nothing calls a v1 endpoint that has a v2 successor, remove it in a PR of its own.
