import { createMiddleware } from 'hono/factory';
import type { JWTVerifyGetKey } from 'jose';
import type { AppEnv } from '../app.ts';
import { ACCESS_JWT_HEADER, verifyAccessAssertion } from '../auth/access.ts';
import { ApiError } from '../errors.ts';

export function authenticateStaff(keys?: JWTVerifyGetKey) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const assertion = c.req.header(ACCESS_JWT_HEADER);
    const claims = assertion
      ? await verifyAccessAssertion(
          assertion,
          c.env.CF_ACCESS_TEAM_DOMAIN,
          c.env.CF_ACCESS_AUD,
          keys
        )
      : null;

    if (!claims) {
      throw new ApiError('Unauthorized');
    }

    c.set('accessClaims', claims);
    await next();
  });
}
