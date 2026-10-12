import { createApp } from './app.ts';
import type { Env } from './env.ts';
import { deliverMails } from './mail.ts';
import { deliverWebPush, type WebPushMessage } from './web-push.ts';

const app = createApp();

export default {
  fetch: app.fetch,
  async queue(batch, env) {
    if (batch.queue.endsWith('-web-push')) {
      return deliverWebPush(batch as MessageBatch<WebPushMessage>, env);
    }

    if (batch.queue.endsWith('-mail')) {
      return deliverMails(batch, env);
    }

    throw new Error(`No consumer for the queue ${batch.queue}`);
  }
} satisfies ExportedHandler<Env>;
