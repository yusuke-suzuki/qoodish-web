import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../app.ts';
import { ApiError } from '../errors.ts';
import { present } from '../routing.ts';
import {
  type ActingStaffMember,
  findPermittedStaffMember,
  type Permission
} from '../staff-members.ts';

export type StaffEnv = {
  Bindings: AppEnv['Bindings'];
  Variables: AppEnv['Variables'] & { staffMember: ActingStaffMember };
};

export function requireStaffPermission(permission: Permission) {
  return createMiddleware<StaffEnv>(async (c, next) => {
    const { email } = c.get('accessClaims');

    if (!present(email)) {
      throw new ApiError('Unauthorized');
    }

    const member = await findPermittedStaffMember(
      c.get('db'),
      email,
      permission
    );

    if (!member?.permitted) {
      throw new ApiError('Forbidden');
    }

    c.set('staffMember', { id: member.id, email: member.email });
    await next();
  });
}
