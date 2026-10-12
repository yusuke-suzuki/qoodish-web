import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../app.ts';
import { findUser } from '../users.ts';

export const requireUser = createMiddleware<
  AppEnv,
  string,
  { out: { param: { userId: number } } }
>(async (c, next) => {
  await findUser(c.get('db'), c.req.valid('param').userId);
  await next();
});
