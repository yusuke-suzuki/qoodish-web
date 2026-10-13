import type { Role } from '@qoodish/api-contract';
import { asc } from 'drizzle-orm';
import { Hono } from 'hono';
import { rolePermissions, roles } from '../../db/schema.ts';
import {
  requireStaffPermission,
  type StaffEnv
} from '../../middleware/require-staff-permission.ts';

const app = new Hono<StaffEnv>();

app.get('/', requireStaffPermission('manage_staff'), async (c) => {
  const db = c.get('db');
  const [rows, permissions] = await db.batch([
    db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description
      })
      .from(roles)
      .orderBy(asc(roles.name)),
    db
      .select({
        roleId: rolePermissions.roleId,
        permission: rolePermissions.permission
      })
      .from(rolePermissions)
      .orderBy(asc(rolePermissions.permission))
  ]);

  return c.json<Role[]>(
    rows.map((role) => ({
      ...role,
      permissions: permissions
        .filter((row) => row.roleId === role.id)
        .map((row) => row.permission)
    }))
  );
});

export default app;
