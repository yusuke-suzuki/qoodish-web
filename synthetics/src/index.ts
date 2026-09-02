import type { BrowserWorker } from '@cloudflare/playwright';
import { runChecks } from './checks.ts';

export interface Env {
  BROWSER: BrowserWorker;
  TARGET_ORIGIN: string;
}

export default {
  async scheduled(_controller: ScheduledController, env: Env) {
    const results = await runChecks(env);

    for (const result of results) {
      console.log(
        `${result.ok ? 'ok' : 'failed'}: ${result.name}${
          result.error ? ` — ${result.error}` : ''
        }`
      );
    }

    const failures = results.filter((result) => !result.ok);

    // The dashboard is the only reader for now: a failed run shows up in the
    // cron trigger history and in observability, so throwing is the alert.
    if (failures.length > 0) {
      throw new Error(
        `checks failed: ${failures.map((failure) => failure.name).join(', ')}`
      );
    }
  }
} satisfies ExportedHandler<Env>;
