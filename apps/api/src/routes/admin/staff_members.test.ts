import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { database } from '../../db/client.ts';
import { staffMemberRoles, staffMembers } from '../../db/schema.ts';
import { sendAsStaff } from '../../test/client.ts';
import { ROLES, STAFF, seedStaff } from '../../test/staff.ts';
import { at, seedWorld } from '../../test/world.ts';

const db = () => database(env.DB);

const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;

const ROLE_NAMES = {
  administrator: { id: ROLES.administrator, name: 'administrator' },
  moderator: { id: ROLES.moderator, name: 'moderator' },
  reader: { id: ROLES.reader, name: 'reader' }
};

function asAdministrator(
  method: string,
  path: string,
  body?: unknown,
  language?: string
) {
  return sendAsStaff(method, path, STAFF.administrator.email, body, language);
}

async function stored(email: string) {
  const [member] = await db()
    .select()
    .from(staffMembers)
    .where(eq(staffMembers.email, email));

  return member;
}

async function counts() {
  return {
    members: await db().$count(staffMembers),
    assignments: await db().$count(staffMemberRoles)
  };
}

beforeAll(async () => {
  await seedWorld(env.DB);
  await seedStaff(env.DB);
});

describe('GET /admin/staff_members', () => {
  it('lists every staff member by email with the roles sorted by name', async () => {
    expect(await asAdministrator('GET', '/admin/staff_members')).toEqual({
      status: 200,
      body: [
        {
          id: STAFF.administrator.id,
          email: STAFF.administrator.email,
          revoked_at: null,
          roles: [ROLE_NAMES.administrator]
        },
        {
          id: STAFF.reader.id,
          email: STAFF.reader.email,
          revoked_at: null,
          roles: [ROLE_NAMES.reader]
        },
        {
          id: STAFF.revoked.id,
          email: STAFF.revoked.email,
          revoked_at: at(3),
          roles: [ROLE_NAMES.moderator]
        },
        {
          id: STAFF.roleless.id,
          email: STAFF.roleless.email,
          revoked_at: null,
          roles: []
        },
        {
          id: STAFF.moderator.id,
          email: STAFF.moderator.email,
          revoked_at: null,
          roles: [ROLE_NAMES.moderator]
        }
      ]
    });
  });

  it('forbids staff without the permission to manage staff', async () => {
    for (const email of [STAFF.moderator.email, STAFF.reader.email]) {
      expect(
        (await sendAsStaff('GET', '/admin/staff_members', email)).status
      ).toBe(403);
    }
    expect(
      (await sendAsStaff('GET', '/admin/staff_members', undefined)).status
    ).toBe(401);
  });
});

describe('POST /admin/staff_members', () => {
  it('registers a new email with the role', async () => {
    const { status, body } = await asAdministrator(
      'POST',
      '/admin/staff_members',
      { email: ' New@Example.com ', role_id: ROLES.moderator }
    );

    expect(status).toBe(201);
    expect(body).toEqual({
      id: expect.any(Number),
      email: 'new@example.com',
      revoked_at: null,
      roles: [ROLE_NAMES.moderator]
    });
    expect(
      (await sendAsStaff('GET', '/admin/reports', 'new@example.com')).status
    ).toBe(200);
  });

  it('grants a role already held without a second assignment', async () => {
    const before = await counts();
    const { status, body } = await asAdministrator(
      'POST',
      '/admin/staff_members',
      { email: 'new@example.com', role_id: String(ROLES.moderator) }
    );

    expect(status).toBe(201);
    expect(body.roles).toEqual([ROLE_NAMES.moderator]);
    expect(await counts()).toEqual(before);
  });

  it('adds a role to an existing member', async () => {
    const before = await stored(STAFF.reader.email);
    const { status, body } = await asAdministrator(
      'POST',
      '/admin/staff_members',
      { email: STAFF.reader.email, role_id: ROLES.moderator }
    );

    expect(status).toBe(201);
    expect(body).toEqual({
      id: STAFF.reader.id,
      email: STAFF.reader.email,
      revoked_at: null,
      roles: [ROLE_NAMES.moderator, ROLE_NAMES.reader]
    });
    expect((await stored(STAFF.reader.email))?.updatedAt).toBe(
      before?.updatedAt
    );
  });

  it('restores a revoked member with only the role granted', async () => {
    expect(
      (
        await asAdministrator(
          'POST',
          `/admin/staff_members/${STAFF.roleless.id}/revocation`
        )
      ).status
    ).toBe(201);

    const { status, body } = await asAdministrator(
      'POST',
      '/admin/staff_members',
      { email: STAFF.roleless.email, role_id: ROLES.reader }
    );

    expect(status).toBe(201);
    expect(body).toEqual({
      id: STAFF.roleless.id,
      email: STAFF.roleless.email,
      revoked_at: null,
      roles: [ROLE_NAMES.reader]
    });
    expect((await stored(STAFF.roleless.email))?.updatedAt).not.toBe(at(2));
  });

  it('answers 404 for an unknown role and writes nothing', async () => {
    const before = await counts();

    for (const payload of [
      { email: 'other@example.com', role_id: 0 },
      { email: 'other@example.com', role_id: 999 },
      { email: 'other@example.com' },
      { email: 'not an address', role_id: 999 }
    ]) {
      expect(
        (await asAdministrator('POST', '/admin/staff_members', payload)).status
      ).toBe(404);
    }
    expect(await counts()).toEqual(before);
  });

  it('answers 422 for a blank or malformed email', async () => {
    const before = await counts();
    const detailOf = async (email: unknown, language?: string) => {
      const { status, body } = await asAdministrator(
        'POST',
        '/admin/staff_members',
        { email, role_id: ROLES.reader },
        language
      );

      expect(status).toBe(422);
      return body.detail;
    };

    expect(await detailOf('nobody', 'ja')).toBe(
      'メールアドレスの形式が正しくありません。'
    );
    expect(await detailOf('not an address@example.com')).toBe(
      'Email is not a valid email address.'
    );
    expect(await detailOf('  ')).toBe('Email must be filled in.');
    expect(await detailOf(undefined, 'ja')).toBe(
      'メールアドレスを入力してください。'
    );
    expect(await counts()).toEqual(before);
  });

  it('forbids staff without the permission to manage staff', async () => {
    expect(
      (
        await sendAsStaff(
          'POST',
          '/admin/staff_members',
          STAFF.moderator.email,
          {
            email: 'intruder@example.com',
            role_id: ROLES.administrator
          }
        )
      ).status
    ).toBe(403);
    expect(await stored('intruder@example.com')).toBeUndefined();
  });
});

describe('DELETE /admin/staff_members/:staff_member_id/roles/:id', () => {
  it('removes a role from another member', async () => {
    expect(
      await asAdministrator(
        'DELETE',
        `/admin/staff_members/${STAFF.reader.id}/roles/${ROLES.moderator}`
      )
    ).toEqual({
      status: 200,
      body: {
        id: STAFF.reader.id,
        email: STAFF.reader.email,
        revoked_at: null,
        roles: [ROLE_NAMES.reader]
      }
    });
    expect(
      (
        await sendAsStaff(
          'POST',
          '/admin/reports/1/decision',
          STAFF.reader.email,
          { outcome: 'kept', reason: 'x' }
        )
      ).status
    ).toBe(403);
  });

  it('answers 404 for an unknown member, an unknown role or a role not held', async () => {
    for (const path of [
      `/admin/staff_members/999/roles/${ROLES.reader}`,
      `/admin/staff_members/${STAFF.reader.id}/roles/999`,
      `/admin/staff_members/${STAFF.reader.id}/roles/${ROLES.administrator}`,
      `/admin/staff_members/${STAFF.administrator.id}/roles/${ROLES.reader}`,
      `/admin/staff_members/x/roles/${ROLES.reader}`
    ]) {
      expect((await asAdministrator('DELETE', path)).status, path).toBe(404);
    }
  });

  it('refuses to remove a role from the acting member', async () => {
    expect(
      await asAdministrator(
        'DELETE',
        `/admin/staff_members/${STAFF.administrator.id}/roles/${ROLES.administrator}`,
        undefined,
        'ja'
      )
    ).toEqual({
      status: 422,
      body: {
        title: 'UnprocessableContent',
        detail:
          '操作者が変更対象の担当者本人のため、ロールの削除や取り消しはできません。ほかの管理者に依頼してください。'
      }
    });
    expect((await asAdministrator('GET', '/admin/staff_members')).status).toBe(
      200
    );
  });
});

describe('POST /admin/staff_members/:staff_member_id/revocation', () => {
  it('revokes another member and removes its roles', async () => {
    const { status, body } = await asAdministrator(
      'POST',
      `/admin/staff_members/${STAFF.moderator.id}/revocation`
    );

    expect(status).toBe(201);
    expect(body).toEqual({
      id: STAFF.moderator.id,
      email: STAFF.moderator.email,
      revoked_at: expect.stringMatching(TIMESTAMP),
      roles: []
    });
    expect(
      await db()
        .select()
        .from(staffMemberRoles)
        .where(eq(staffMemberRoles.staffMemberId, STAFF.moderator.id))
    ).toEqual([]);
    expect(
      (await sendAsStaff('GET', '/admin/reports', STAFF.moderator.email)).status
    ).toBe(403);
  });

  it('revokes an already revoked member again without touching its roles', async () => {
    const { status, body } = await asAdministrator(
      'POST',
      `/admin/staff_members/${STAFF.revoked.id}/revocation`
    );

    expect(status).toBe(201);
    expect(body.revoked_at).not.toBe(at(3));
    expect(body.roles).toEqual([ROLE_NAMES.moderator]);
  });

  it('refuses to revoke the acting member', async () => {
    expect(
      await asAdministrator(
        'POST',
        `/admin/staff_members/${STAFF.administrator.id}/revocation`
      )
    ).toEqual({
      status: 422,
      body: {
        title: 'UnprocessableContent',
        detail:
          'Operator is the staff member being changed. Ask another administrator to remove your roles or revoke you.'
      }
    });
    expect((await stored(STAFF.administrator.email))?.revokedAt).toBeNull();
  });

  it('answers 404 for an unknown member', async () => {
    expect(
      (await asAdministrator('POST', '/admin/staff_members/999/revocation'))
        .status
    ).toBe(404);
  });
});
