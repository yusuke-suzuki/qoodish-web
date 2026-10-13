import { eq } from 'drizzle-orm';
import { createMiddleware } from 'hono/factory';
import { roles } from '../db/schema.ts';
import { ApiError } from '../errors.ts';
import type { StaffEnv } from './require-staff-permission.ts';

export const requireRole = createMiddleware<
  StaffEnv & { Variables: { roleId: number } },
  string,
  { out: { json: { role_id: number | undefined } } }
>(async (c, next) => {
  const roleId = c.req.valid('json').role_id;
  const [role] =
    roleId === undefined
      ? []
      : await c
          .get('db')
          .select({ id: roles.id })
          .from(roles)
          .where(eq(roles.id, roleId));

  if (!role) {
    throw new ApiError('NotFound');
  }

  c.set('roleId', role.id);
  await next();
});
