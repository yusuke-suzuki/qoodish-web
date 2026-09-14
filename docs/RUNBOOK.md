# Runbook

How a change reaches production, how to know it arrived, and how to get back
to the previous version when it should not have.

## How a deploy happens

Production is deployed by the Cloudflare Workers Builds git integration, not by
a GitHub Actions workflow. Every push to `master` builds the worker and shifts
traffic to it. The `dev` environment deploys the same way from its own branch.

The checks in `.github/workflows/dev.yaml` (lint, types, unit tests) and
`.github/workflows/e2e.yaml` (a smoke test against a built worker) run on pull
requests only. Nothing consults them before a deploy, so a commit pushed
straight to `master` reaches production unchecked.

### Gate the branch

The gate lives in the repository settings, not in code. Under **Settings →
Branches**, protect `master` with:

- **Require a pull request before merging**, so nothing lands by a direct push.
- **Require status checks to pass before merging**, naming the `lint` job of the
  Dev workflow and the `smoke` job of the E2E workflow.
- **Require branches to be up to date before merging**, so the checks ran
  against what will actually be deployed.

With that in place the deploy still fires on every push to `master`, but the
only way to push to `master` is a pull request whose checks passed.

## How to know a deploy arrived

`GET https://qoodish.com/api/health` answers with the deployed commit:

```json
{ "status": "ok", "checks": { "api": "ok" }, "sha": "<commit>", "appEnv": "production", "time": "..." }
```

`.github/workflows/post-deploy.yaml` polls this after every push to `master`
until the SHA matches, then runs the smoke test against production. A failed
run opens a GitHub issue labelled `incident` on this repository, so a failure
that happens overnight is waiting in the issue list rather than in a workflow
log nobody opens.

## How to roll back

Rolling back reverts traffic to a previous deployment of the worker. It takes
about a minute and does not need a build.

1. Open the Cloudflare dashboard → **Workers & Pages** → `prod-qoodish-web`.
2. Open the **Deployments** tab. Each row is one deployment, newest first, with
   the commit it was built from.
3. Find the last deployment that was known good and choose **Rollback to this
   deployment** from its row menu. Confirm.
4. Confirm the rollback landed:

   ```bash
   curl -s https://qoodish.com/api/health | jq .sha
   ```

   The SHA must be the commit of the deployment you chose.

5. Fix forward on `master` through a pull request. The next push to `master`
   deploys again and supersedes the rollback, so do not push until the fix is
   ready.

Bindings and Durable Object migrations are versioned with each deployment, so a
rollback restores the bindings that deployment was built with. A migration that
added a class (see `migrations` in `wrangler.jsonc`) cannot be undone by a
rollback; the class stays and is simply unused.

The `dev` worker is `dev-qoodish-web` and rolls back the same way.

## The synthetic checks

`synthetics/` is a separate worker that opens production in a real browser
every thirty minutes. A failed run raises an exception the telemetry export
carries to Grafana Cloud; alerting on it, and on the absence of successful
runs, is configured there.
