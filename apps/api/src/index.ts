import { createApp } from './app.ts';
import type { Env } from './env.ts';
import { deliverWebPush, type WebPushMessage } from './web-push.ts';

const app = createApp();

export default {
  fetch: app.fetch,
  queue: deliverWebPush
} satisfies ExportedHandler<Env, WebPushMessage>;
