import type { StaffMember } from '@qoodish/api-contract';
import { Hono } from 'hono';
import { z } from 'zod';
import { requireRole } from '../../middleware/require-role.ts';
import {
  requireStaffPermission,
  type StaffEnv
} from '../../middleware/require-staff-permission.ts';
import { present } from '../../routing.ts';
import {
  EMAIL_FORMAT,
  grantRole,
  normalizedEmail,
  revokeStaffMember,
  staffMemberList,
  unassignRole
} from '../../staff-members.ts';
import { id, jsonBody, optionalId, pathParams } from '../../validation.ts';

const roleInput = z.object({
  role_id: z.unknown().transform(optionalId).optional()
});

const grantInput = z.object({
  email: z
    .string({ error: 'staff_email_required' })
    .overwrite(normalizedEmail)
    .refine(present, { error: 'staff_email_required', abort: true })
    .refine((email) => EMAIL_FORMAT.test(email), {
      error: 'staff_email_invalid'
    })
});

const app = new Hono<StaffEnv>();

app.use(requireStaffPermission('manage_staff'));

app.get('/', async (c) =>
  c.json<StaffMember[]>(await staffMemberList(c.get('db')))
);

app.post(
  '/',
  jsonBody(roleInput),
  requireRole,
  jsonBody(grantInput),
  async (c) =>
    c.json<StaffMember>(
      await grantRole(c.get('db'), c.req.valid('json').email, c.get('roleId')),
      201
    )
);

app.delete(
  '/:staffMemberId/roles/:id',
  pathParams(z.object({ staffMemberId: id, id })),
  async (c) => {
    const params = c.req.valid('param');

    return c.json<StaffMember>(
      await unassignRole(
        c.get('db'),
        c.get('staffMember'),
        params.staffMemberId,
        params.id
      )
    );
  }
);

app.post(
  '/:staffMemberId/revocation',
  pathParams(z.object({ staffMemberId: id })),
  async (c) =>
    c.json<StaffMember>(
      await revokeStaffMember(
        c.get('db'),
        c.get('staffMember'),
        c.req.valid('param').staffMemberId
      ),
      201
    )
);

export default app;
