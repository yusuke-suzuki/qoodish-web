import type { BrowserWorker } from '@cloudflare/playwright';
import { runChecks } from './checks.ts';
import { notify } from './slack.ts';

export interface Env {
  BROWSER: BrowserWorker;
  MONITOR_STATE: KVNamespace;
  TARGET_ORIGIN: string;
  SLACK_BOT_TOKEN: string;
  SLACK_CHANNEL_ID: string;
}

export default {
  async scheduled(_controller: ScheduledController, env: Env) {
    const results = await runChecks(env);
    const failures = results.filter((result) => !result.ok);
    const previous = (await env.MONITOR_STATE.get('status')) ?? 'ok';

    if (failures.length === 0) {
      // Only the transition is worth a message: a healthy run after a healthy
      // run is the expected steady state.
      if (previous === 'failing') {
        await notify(
          env,
          `:white_check_mark: ${env.TARGET_ORIGIN} recovered — every check passes again.`
        );
      }

      await env.MONITOR_STATE.put('status', 'ok');
      return;
    }

    // The same outage would otherwise alert again every half hour until it is
    // fixed, so only the first failing run speaks.
    if (previous !== 'failing') {
      const lines = failures.map(
        (failure) => `• ${failure.name}: ${failure.error ?? 'failed'}`
      );

      await notify(
        env,
        `:rotating_light: ${env.TARGET_ORIGIN} check failed\n${lines.join('\n')}`
      );
    }

    await env.MONITOR_STATE.put('status', 'failing');

    // Failing the run keeps the outage visible in Workers observability even
    // while the alert above stays deduplicated.
    throw new Error(
      `checks failed: ${failures.map((failure) => failure.name).join(', ')}`
    );
  }
} satisfies ExportedHandler<Env>;
