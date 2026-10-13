import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { sendAsStaff } from '../../test/client.ts';
import { ROLES, STAFF, seedStaff } from '../../test/staff.ts';
import { seedWorld } from '../../test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
  await seedStaff(env.DB);
});

describe('GET /admin/roles', () => {
  it('lists the roles by name with their permissions sorted', async () => {
    expect(
      await sendAsStaff('GET', '/admin/roles', STAFF.administrator.email)
    ).toEqual({
      status: 200,
      body: [
        {
          id: ROLES.administrator,
          name: 'administrator',
          description: 'Manages the staff',
          permissions: ['decide_reports', 'manage_staff', 'read_reports']
        },
        {
          id: ROLES.moderator,
          name: 'moderator',
          description: null,
          permissions: ['decide_reports', 'read_reports']
        },
        {
          id: ROLES.reader,
          name: 'reader',
          description: null,
          permissions: ['read_reports']
        }
      ]
    });
  });

  it('forbids staff without the permission to manage staff', async () => {
    expect(
      (await sendAsStaff('GET', '/admin/roles', STAFF.moderator.email)).status
    ).toBe(403);
    expect((await sendAsStaff('GET', '/admin/roles', undefined)).status).toBe(
      401
    );
  });
});
