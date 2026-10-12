import { env } from 'cloudflare:test';
import { and, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.ts';
import { bookmarkJournal, bookmarkMap } from '../bookmarks.ts';
import { database } from '../db/client.ts';
import {
  blocks,
  bookmarks,
  coauthorshipInvitations,
  coauthorships,
  journalBookmarks,
  mutes,
  unblocks,
  unmutes
} from '../db/schema.ts';
import { createSigner, firebaseClaims, type Signer } from '../test/jwt.ts';
import { at, ids, seedWorld } from '../test/world.ts';

const ALICE_JOURNAL = 1;

let signer: Signer;
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  signer = await createSigner();
  app = createApp({ firebaseKeys: signer.keys });
  await seedWorld(env.DB);
});

const db = () => database(env.DB);

async function send(method: string, path: string, uid: string) {
  const token = await signer.sign(
    firebaseClaims(env.GOOGLE_PROJECT_ID, { sub: uid })
  );
  const res = await app.request(
    path,
    { method, headers: { authorization: `Bearer ${token}` } },
    env
  );
  const text = await res.text();

  return { status: res.status, body: text ? JSON.parse(text) : null };
}

describe('POST/DELETE /maps/:mapId/bookmark', () => {
  it('bookmarks a public map of someone else, once', async () => {
    const removed = await send('DELETE', `/maps/${ids.cafe}/bookmark`, 'alice');
    const missing = await send('DELETE', `/maps/${ids.cafe}/bookmark`, 'alice');
    const added = await send('POST', `/maps/${ids.cafe}/bookmark`, 'alice');
    const duplicate = await send('POST', `/maps/${ids.cafe}/bookmark`, 'alice');

    expect(removed).toMatchObject({
      status: 200,
      body: { id: ids.cafe, bookmarking: false, bookmarkable: true }
    });
    expect(missing.status).toBe(404);
    expect(added).toMatchObject({
      status: 200,
      body: { id: ids.cafe, bookmarking: true }
    });
    expect(duplicate).toMatchObject({
      status: 422,
      body: { detail: 'The map is already bookmarked.' }
    });
  });

  it('answers 403 on a map the user edits and 404 on a private map', async () => {
    expect(
      (await send('POST', `/maps/${ids.ramen}/bookmark`, 'carol')).status
    ).toBe(403);
    expect(
      (await send('POST', `/maps/${ids.secret}/bookmark`, 'bob')).status
    ).toBe(404);
  });
});

describe('POST/DELETE /journals/:journalId/bookmark', () => {
  it('bookmarks the journal of someone else, once', async () => {
    const path = `/journals/${ALICE_JOURNAL}/bookmark`;
    const added = await send('POST', path, 'bob');
    const duplicate = await send('POST', path, 'bob');
    const removed = await send('DELETE', path, 'bob');
    const missing = await send('DELETE', path, 'bob');

    expect(added).toMatchObject({
      status: 200,
      body: { id: ALICE_JOURNAL, bookmarking: true }
    });
    expect(duplicate).toMatchObject({
      status: 422,
      body: { detail: 'The journal is already bookmarked.' }
    });
    expect(removed.body).toMatchObject({ bookmarking: false });
    expect(missing.status).toBe(404);
  });

  it('answers 403 on the own journal and 404 on an unknown one', async () => {
    expect(
      (await send('POST', `/journals/${ALICE_JOURNAL}/bookmark`, 'alice'))
        .status
    ).toBe(403);
    expect((await send('POST', '/journals/999/bookmark', 'bob')).status).toBe(
      404
    );
  });
});

describe('POST/DELETE /users/:userId/block', () => {
  it('blocks a user once and drops what ties the two together', async () => {
    await send('POST', `/journals/${ALICE_JOURNAL}/bookmark`, 'bob');
    await db()
      .insert(coauthorships)
      .values({
        mapId: ids.cafe,
        userId: ids.alice,
        createdAt: at(30),
        updatedAt: at(30)
      });
    await db()
      .insert(coauthorshipInvitations)
      .values([
        {
          id: 1,
          mapId: ids.ramen,
          inviterId: ids.alice,
          inviteeId: ids.bob,
          createdAt: at(30),
          updatedAt: at(30)
        },
        {
          id: 2,
          mapId: ids.ramen,
          inviterId: ids.carol,
          inviteeId: ids.bob,
          createdAt: at(30),
          updatedAt: at(30)
        }
      ]);

    const blocked = await send('POST', `/users/${ids.bob}/block`, 'alice');
    const again = await send('POST', `/users/${ids.bob}/block`, 'alice');
    const remaining = await db().select().from(bookmarks);
    const invitations = await db()
      .select({ status: coauthorshipInvitations.status })
      .from(coauthorshipInvitations);

    expect(blocked).toMatchObject({
      status: 200,
      body: { id: ids.bob, blocking: true, blocked_by: false, muting: false }
    });
    expect(again.body.blocking).toBe(true);
    expect(
      await db()
        .select()
        .from(blocks)
        .where(
          and(eq(blocks.blockerId, ids.alice), eq(blocks.blockedId, ids.bob))
        )
    ).toHaveLength(1);
    expect(
      remaining.map(({ mapId, userId }) => ({ mapId, userId }))
    ).not.toContainEqual({ mapId: ids.ramen, userId: ids.bob });
    expect(
      remaining.map(({ mapId, userId }) => ({ mapId, userId }))
    ).not.toContainEqual({ mapId: ids.cafe, userId: ids.alice });
    expect(
      remaining.map(({ mapId, userId }) => ({ mapId, userId }))
    ).toContainEqual({ mapId: ids.cafe, userId: ids.carol });
    expect(await db().select().from(journalBookmarks)).toEqual([]);
    expect(
      await db()
        .select()
        .from(coauthorships)
        .where(eq(coauthorships.mapId, ids.cafe))
    ).toEqual([]);
    expect(invitations.map(({ status }) => status)).toEqual([2, 2]);
  });

  it('keeps the blocked user from bookmarking', async () => {
    const map = await send('POST', `/maps/${ids.ramen}/bookmark`, 'bob');
    const journal = await send(
      'POST',
      `/journals/${ALICE_JOURNAL}/bookmark`,
      'bob'
    );

    expect(map).toMatchObject({
      status: 422,
      body: {
        detail:
          'You cannot bookmark a map by an account you have blocked or that has blocked you.'
      }
    });
    expect(journal.body.detail).toBe(
      'You cannot bookmark the journal of an account you have blocked or that has blocked you.'
    );
  });

  it('keeps the blocker from bookmarking either', async () => {
    const map = await send('POST', `/maps/${ids.cafe}/bookmark`, 'alice');

    expect(map).toMatchObject({
      status: 422,
      body: {
        detail:
          'You cannot bookmark a map by an account you have blocked or that has blocked you.'
      }
    });
  });

  it('reads the block from the database rather than from the loaded viewer', async () => {
    await expect(bookmarkMap(db(), ids.bob, ids.ramen)).rejects.toMatchObject({
      status: 422,
      messageKeys: ['bookmark_blocked_interaction']
    });
    await expect(
      bookmarkJournal(db(), ids.bob, ALICE_JOURNAL)
    ).rejects.toMatchObject({
      status: 422,
      messageKeys: ['journal_bookmark_blocked_interaction']
    });
    expect(
      await db().select().from(bookmarks).where(eq(bookmarks.userId, ids.bob))
    ).toEqual([]);
    expect(await db().select().from(journalBookmarks)).toEqual([]);
  });

  it('lifts the block by recording an unblock', async () => {
    const lifted = await send('DELETE', `/users/${ids.bob}/block`, 'alice');
    const again = await send('DELETE', `/users/${ids.bob}/block`, 'alice');
    const never = await send('DELETE', `/users/${ids.carol}/block`, 'alice');

    expect(lifted).toMatchObject({ status: 200, body: { blocking: false } });
    expect(again.body.blocking).toBe(false);
    expect(never).toMatchObject({ status: 200, body: { blocking: false } });
    expect(await db().select().from(unblocks)).toHaveLength(1);
  });

  it('answers 422 on the user themselves and 404 on an unknown user', async () => {
    const self = await send('POST', `/users/${ids.alice}/block`, 'alice');

    expect(self).toMatchObject({
      status: 422,
      body: { detail: 'Account is your own and cannot be blocked.' }
    });
    expect((await send('POST', '/users/999/block', 'alice')).status).toBe(404);
  });
});

describe('POST/DELETE /users/:userId/mute', () => {
  it('mutes a user once and lifts the mute by recording an unmute', async () => {
    const muted = await send('POST', `/users/${ids.bob}/mute`, 'carol');

    await send('POST', `/users/${ids.bob}/mute`, 'carol');

    const lifted = await send('DELETE', `/users/${ids.bob}/mute`, 'carol');
    const self = await send('POST', `/users/${ids.carol}/mute`, 'carol');

    expect(muted).toMatchObject({ status: 200, body: { muting: true } });
    expect(await db().select().from(mutes)).toHaveLength(1);
    expect(lifted.body.muting).toBe(false);
    expect(await db().select().from(unmutes)).toHaveLength(1);
    expect(self).toMatchObject({
      status: 422,
      body: { detail: 'Account is your own and cannot be muted.' }
    });
    expect((await send('POST', '/users/999/mute', 'carol')).status).toBe(404);
  });
});
