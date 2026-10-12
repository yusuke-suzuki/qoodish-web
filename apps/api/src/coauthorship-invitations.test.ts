import { env } from 'cloudflare:test';
import { and, eq } from 'drizzle-orm';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { inviteCoauthor } from './coauthorship-invitations.ts';
import { database } from './db/client.ts';
import { coauthorshipInvitations, maps, notifications } from './db/schema.ts';
import type { MapRow } from './maps.ts';
import { ids, seedWorld } from './test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
});

const db = () => database(env.DB);

function viewerOf(id: number) {
  return {
    id,
    blocking: new Set<number>(),
    blockedBy: new Set<number>(),
    muting: new Set<number>()
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('inviteCoauthor', () => {
  it('enqueues a web push of the notification it records', async () => {
    const [map] = await db().select().from(maps).where(eq(maps.id, ids.ramen));
    const sendBatch = vi.spyOn(env.WEB_PUSH_QUEUE, 'sendBatch');

    await inviteCoauthor(db(), env.WEB_PUSH_QUEUE, viewerOf(ids.alice), {
      map: map as MapRow,
      inviteeId: ids.bob
    });

    const [notification] = await db()
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.key, 'coauthor_invited'),
          eq(notifications.notifiableId, ids.ramen),
          eq(notifications.recipientId, ids.bob)
        )
      );

    expect(sendBatch).toHaveBeenCalledExactlyOnceWith([
      { body: { notificationId: notification?.id } }
    ]);
  });

  it('answers 404 and records nothing once the inviter can no longer edit the map', async () => {
    const [map] = await db().select().from(maps).where(eq(maps.id, ids.secret));
    const before = await db().select().from(coauthorshipInvitations);
    const sendBatch = vi.spyOn(env.WEB_PUSH_QUEUE, 'sendBatch');

    await expect(
      inviteCoauthor(db(), env.WEB_PUSH_QUEUE, viewerOf(ids.bob), {
        map: map as MapRow,
        inviteeId: ids.carol
      })
    ).rejects.toMatchObject({ status: 404 });
    expect(await db().select().from(coauthorshipInvitations)).toEqual(before);
    expect(sendBatch).not.toHaveBeenCalled();
  });
});
