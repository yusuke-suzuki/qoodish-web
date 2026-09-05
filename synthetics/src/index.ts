import type { BrowserWorker } from '@cloudflare/playwright';
import { runChecks } from './checks.ts';
import { notifyFailures } from './notify.ts';

export interface Env {
  BROWSER: BrowserWorker;
  TARGET_ORIGIN: string;
  ALERT_WEBHOOK_URL?: string;
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

    if (failures.length === 0) {
      return;
    }

    if (env.ALERT_WEBHOOK_URL) {
      try {
        await notifyFailures(
          env.ALERT_WEBHOOK_URL,
          env.TARGET_ORIGIN,
          failures
        );
      } catch (error) {
        console.error('alert webhook delivery failed:', error);
      }
    }

    throw new Error(
      `checks failed: ${failures.map((failure) => failure.name).join(', ')}`
    );
  }
} satisfies ExportedHandler<Env>;
