import type { StaffMember } from '@qoodish/api-contract';
import { and, asc, eq, exists, isNull, type SQL, sql } from 'drizzle-orm';
import {
  currentTimestamp,
  type Database,
  generatedId,
  inIds,
  selected
} from './db/client.ts';
import {
  rolePermissions,
  roles,
  staffMemberRoles,
  staffMembers
} from './db/schema.ts';
import { ApiError } from './errors.ts';
import { first } from './routing.ts';

export type Permission = 'read_reports' | 'decide_reports' | 'manage_staff';

export type ActingStaffMember = { id: number; email: string };

export const EMAIL_FORMAT =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function normalizedEmail(email: string): string {
  return email
    .replace(/^[\0\t\n\v\f\r ]+|[\0\t\n\v\f\r ]+$/g, '')
    .toLowerCase();
}

export async function findPermittedStaffMember(
  db: Database,
  email: string,
  permission: Permission
): Promise<(ActingStaffMember & { permitted: boolean }) | undefined> {
  const [member] = await db
    .select({
      id: staffMembers.id,
      email: staffMembers.email,
      permitted: sql<number>`${exists(
        db
          .select({ id: rolePermissions.id })
          .from(staffMemberRoles)
          .innerJoin(
            rolePermissions,
            eq(rolePermissions.roleId, staffMemberRoles.roleId)
          )
          .where(
            and(
              eq(staffMemberRoles.staffMemberId, staffMembers.id),
              eq(rolePermissions.permission, permission)
            )
          )
      )}`.as('permitted')
    })
    .from(staffMembers)
    .where(
      and(
        eq(staffMembers.email, normalizedEmail(email)),
        isNull(staffMembers.revokedAt)
      )
    );

  return member && { ...member, permitted: member.permitted === 1 };
}

export async function staffMemberList(
  db: Database,
  condition?: SQL
): Promise<StaffMember[]> {
  const members = await db
    .select({
      id: staffMembers.id,
      email: staffMembers.email,
      revokedAt: staffMembers.revokedAt
    })
    .from(staffMembers)
    .where(condition)
    .orderBy(asc(staffMembers.email));
  const assignments = await db
    .select({
      staffMemberId: staffMemberRoles.staffMemberId,
      id: roles.id,
      name: roles.name
    })
    .from(staffMemberRoles)
    .innerJoin(roles, eq(roles.id, staffMemberRoles.roleId))
    .where(
      inIds(
        staffMemberRoles.staffMemberId,
        members.map((member) => member.id)
      )
    )
    .orderBy(asc(roles.name));

  return members.map((member) => ({
    id: member.id,
    email: member.email,
    revoked_at: member.revokedAt,
    roles: assignments
      .filter((assignment) => assignment.staffMemberId === member.id)
      .map(({ id, name }) => ({ id, name }))
  }));
}

export async function findStaffMember(
  db: Database,
  id: number
): Promise<StaffMember> {
  return first(await staffMemberList(db, eq(staffMembers.id, id)));
}

function refuseSelfChange(actor: ActingStaffMember, memberId: number): void {
  if (actor.id === memberId) {
    throw ApiError.invalid(['staff_self_change']);
  }
}

export async function grantRole(
  db: Database,
  email: string,
  roleId: number
): Promise<StaffMember> {
  const now = currentTimestamp();

  await db.batch([
    db
      .insert(staffMembers)
      .values({ email, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: staffMembers.email,
        set: {
          revokedAt: null,
          updatedAt: sql`CASE WHEN ${staffMembers.revokedAt} IS NULL THEN ${staffMembers.updatedAt} ELSE excluded.updated_at END`
        }
      }),
    db
      .insert(staffMemberRoles)
      .select(
        db
          .select({
            id: generatedId(),
            createdAt: selected(now, 'created_at'),
            roleId: selected(roleId, 'role_id'),
            staffMemberId: staffMembers.id,
            updatedAt: selected(now, 'updated_at')
          })
          .from(staffMembers)
          .where(eq(staffMembers.email, email))
      )
      .onConflictDoNothing()
  ]);

  return first(await staffMemberList(db, eq(staffMembers.email, email)));
}

export async function unassignRole(
  db: Database,
  actor: ActingStaffMember,
  memberId: number,
  roleId: number
): Promise<StaffMember> {
  const [[member], [role], [assignment]] = await db.batch([
    db
      .select({ id: staffMembers.id })
      .from(staffMembers)
      .where(eq(staffMembers.id, memberId)),
    db.select({ id: roles.id }).from(roles).where(eq(roles.id, roleId)),
    db
      .select({ id: staffMemberRoles.id })
      .from(staffMemberRoles)
      .where(
        and(
          eq(staffMemberRoles.staffMemberId, memberId),
          eq(staffMemberRoles.roleId, roleId)
        )
      )
  ]);

  if (!member || !role || !assignment) {
    throw new ApiError('NotFound');
  }

  refuseSelfChange(actor, memberId);

  await db
    .delete(staffMemberRoles)
    .where(eq(staffMemberRoles.id, assignment.id));

  return findStaffMember(db, memberId);
}

export async function revokeStaffMember(
  db: Database,
  actor: ActingStaffMember,
  memberId: number
): Promise<StaffMember> {
  await findStaffMember(db, memberId);
  refuseSelfChange(actor, memberId);

  const now = currentTimestamp();

  await db.batch([
    db.delete(staffMemberRoles).where(
      and(
        eq(staffMemberRoles.staffMemberId, memberId),
        exists(
          db
            .select({ id: staffMembers.id })
            .from(staffMembers)
            .where(
              and(eq(staffMembers.id, memberId), isNull(staffMembers.revokedAt))
            )
        )
      )
    ),
    db
      .update(staffMembers)
      .set({ revokedAt: now, updatedAt: now })
      .where(eq(staffMembers.id, memberId))
  ]);

  return findStaffMember(db, memberId);
}
