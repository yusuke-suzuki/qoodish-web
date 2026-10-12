import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { inviteCoauthor } from './coauthorship-invitations.ts';
import { database } from './db/client.ts';
import { coauthorshipInvitations, maps } from './db/schema.ts';
import type { MapRow } from './maps.ts';
import { ids, seedWorld } from './test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
});

const db = () => database(env.DB);

describe('inviteCoauthor', () => {
  it('answers 404 and records nothing once the inviter can no longer edit the map', async () => {
    const [map] = await db().select().from(maps).where(eq(maps.id, ids.secret));
    const before = await db().select().from(coauthorshipInvitations);

    await expect(
      inviteCoauthor(
        db(),
        {
          id: ids.bob,
          blocking: new Set(),
          blockedBy: new Set(),
          muting: new Set()
        },
        { map: map as MapRow, inviteeId: ids.carol }
      )
    ).rejects.toMatchObject({ status: 404 });
    expect(await db().select().from(coauthorshipInvitations)).toEqual(before);
  });
});
