import { database } from '../db/client.ts';
import {
  rolePermissions,
  roles,
  staffMemberRoles,
  staffMembers
} from '../db/schema.ts';
import { at } from './world.ts';

export const ROLES = { administrator: 1, moderator: 2, reader: 3 } as const;

export const STAFF = {
  moderator: { id: 1, email: 'staff@example.com' },
  reader: { id: 2, email: 'reader@example.com' },
  revoked: { id: 3, email: 'revoked@example.com' },
  administrator: { id: 4, email: 'admin@example.com' },
  roleless: { id: 5, email: 'roleless@example.com' }
} as const;

export async function seedStaff(binding: D1Database): Promise<void> {
  const db = database(binding);
  const stamp = { createdAt: at(2), updatedAt: at(2) };

  await db.insert(roles).values([
    {
      id: ROLES.administrator,
      name: 'administrator',
      description: 'Manages the staff',
      ...stamp
    },
    { id: ROLES.moderator, name: 'moderator', description: null, ...stamp },
    { id: ROLES.reader, name: 'reader', description: null, ...stamp }
  ]);
  await db.insert(rolePermissions).values(
    (
      [
        [ROLES.administrator, 'read_reports'],
        [ROLES.administrator, 'manage_staff'],
        [ROLES.administrator, 'decide_reports'],
        [ROLES.moderator, 'read_reports'],
        [ROLES.moderator, 'decide_reports'],
        [ROLES.reader, 'read_reports']
      ] as const
    ).map(([roleId, permission]) => ({ roleId, permission, ...stamp }))
  );
  await db.insert(staffMembers).values([
    { ...STAFF.reader, ...stamp },
    { ...STAFF.revoked, revokedAt: at(3), ...stamp },
    { ...STAFF.administrator, ...stamp },
    { ...STAFF.roleless, ...stamp }
  ]);
  await db.insert(staffMemberRoles).values(
    (
      [
        [STAFF.moderator.id, ROLES.moderator],
        [STAFF.reader.id, ROLES.reader],
        [STAFF.revoked.id, ROLES.moderator],
        [STAFF.administrator.id, ROLES.administrator]
      ] as const
    ).map(([staffMemberId, roleId]) => ({ staffMemberId, roleId, ...stamp }))
  );
}
