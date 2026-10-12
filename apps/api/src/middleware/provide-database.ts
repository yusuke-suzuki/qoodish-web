import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../app.ts';
import { database } from '../db/client.ts';

export const provideDatabase = createMiddleware<AppEnv>(async (c, next) => {
  c.set('db', database(c.env.DB));
  await next();
});
