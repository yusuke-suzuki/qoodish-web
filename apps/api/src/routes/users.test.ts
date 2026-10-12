import { env } from 'cloudflare:test';
import { and, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { database } from '../db/client.ts';
import {
  blocks,
  bookmarks,
  coauthorshipInvitations,
  coauthorships,
  journalBookmarks,
  journalRevisions,
  mapRevisions,
  mutes,
  unblocks,
  unmutes
} from '../db/schema.ts';
import { get, idsOf, send } from '../test/client.ts';
import { accountOf } from '../test/records.ts';
import { dave, seedDave, seedRelations } from '../test/relations.ts';
import { alice, notFound } from '../test/serialized.ts';
import { at, ids, seedWorld } from '../test/world.ts';

const ALICE_JOURNAL = 1;

beforeAll(async () => {
  await seedWorld(env.DB);
  await seedDave(env.DB);
});

const db = () => database(env.DB);

describe('POST /users', () => {
  it('creates the user with a revision, a private map and a journal', async () => {
    const { status, body } = await send(
      'POST',
      '/users',
      { sub: 'eve', name: 'Eve', email: 'eve@example.com' },
      undefined,
      'ja-JP'
    );
    const account = await accountOf('eve');

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: account?.user.id,
      uid: 'eve',
      name: 'Eve',
      biography: null,
      image: null,
      image_url: '',
      maps_count: 1,
      bookmarked_maps_count: 0,
      pins_count: 0,
      push_notification: {
        coauthor_invited: true,
        liked: true,
        comment: true,
        published: true
      }
    });
    expect(account?.user).toMatchObject({
      email: 'eve@example.com',
      locale: 'ja',
      currentRevisionId: account?.revisions[0]?.id
    });
    expect(account?.revisions).toMatchObject([
      { name: 'Eve', biography: null }
    ]);

    const [map] = account?.maps ?? [];
    const [mapRevision] = await db()
      .select()
      .from(mapRevisions)
      .where(eq(mapRevisions.mapId, map?.id ?? 0));

    expect(map).toMatchObject({
      name: "Eve's map",
      description: "Eve's map.",
      private: true,
      status: 'published',
      currentRevisionId: mapRevision?.id
    });
    expect(mapRevision).toMatchObject({
      name: "Eve's map",
      private: true,
      userId: account?.user.id
    });

    const [journal] = account?.journals ?? [];
    const [journalRevision] = await db()
      .select()
      .from(journalRevisions)
      .where(eq(journalRevisions.journalId, journal?.id ?? 0));

    expect(journal).toMatchObject({
      title: "Eve's journal",
      currentRevisionId: journalRevision?.id
    });
  });

  it('refreshes the email and locale of an existing user and nothing else', async () => {
    const before = await accountOf('eve');
    const { status, body } = await send('POST', '/users', {
      sub: 'eve',
      name: 'Renamed',
      email: 'eve@example.org'
    });
    const after = await accountOf('eve');

    expect(status).toBe(200);
    expect(body).toMatchObject({ id: before?.user.id, name: 'Eve' });
    expect(after?.user).toMatchObject({
      email: 'eve@example.org',
      locale: 'en'
    });
    expect(after?.revisions).toHaveLength(1);
    expect(after?.maps).toHaveLength(1);
  });

  it('truncates the default map name to fit a long display name', async () => {
    const name = 'Bartholomew Montgomery-Fitzgerald';
    const { status } = await send('POST', '/users', { sub: 'long', name });
    const account = await accountOf('long');

    expect(status).toBe(200);
    expect(account?.maps[0]?.name).toBe('Bartholomew Montgomery-Fitz...');
    expect(account?.journals[0]?.title).toBe(`${name}'s journal`);
  });

  it('answers 422 and creates nothing without a name', async () => {
    const { status, body } = await send('POST', '/users', {
      sub: 'nameless',
      name: undefined
    });

    expect(status).toBe(422);
    expect(body).toEqual({
      title: 'UnprocessableContent',
      detail: 'Name is required.'
    });
    expect(await accountOf('nameless')).toBeUndefined();
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

describe('users', () => {
  beforeAll(async () => {
    await seedRelations(env.DB);
  });

  it('serializes the profile with the viewer relation', async () => {
    expect(await get(`/users/${dave.id}`, 'alice')).toEqual({
      status: 200,
      body: {
        id: dave.id,
        uid: 'dave',
        name: 'Dave',
        biography: null,
        image: null,
        image_url: '',
        maps_count: 1,
        bookmarked_maps_count: 0,
        pins_count: 1,
        blocking: false,
        blocked_by: true,
        muting: false
      }
    });
    expect((await get(`/users/${ids.bob}`, 'alice')).body).toMatchObject({
      blocking: false,
      blocked_by: false,
      muting: true
    });
  });

  it('searches users except those who block the viewer', async () => {
    expect(await get('/users?q=Dave', 'bob')).toEqual({
      status: 200,
      body: [{ id: dave.id, name: 'Dave', image: null, image_url: '' }]
    });
    expect(await get('/users?q=Dave', 'alice')).toEqual({
      status: 200,
      body: []
    });
    expect(await get('/users', 'alice')).toEqual({ status: 200, body: [] });
  });

  it('lists the maps and chapters of a user the viewer may see', async () => {
    expect(await idsOf(`/users/${ids.alice}/maps`, 'bob')).toEqual([ids.ramen]);
    expect(await idsOf(`/users/${ids.alice}/maps`, 'alice')).toEqual([
      ids.secret,
      ids.ramen
    ]);
    expect(await idsOf(`/users/${dave.id}/chapters`, 'alice')).toEqual([]);
    expect(await idsOf(`/users/${dave.id}/chapters`, 'bob')).toEqual([
      dave.chapter
    ]);
    expect(await get('/users/999/maps', 'bob')).toEqual({
      status: 404,
      body: notFound
    });
  });

  it('serializes a journal unless its author blocks the viewer', async () => {
    expect(await get(`/users/${ids.alice}/journal`, 'bob')).toEqual({
      status: 200,
      body: {
        id: 1,
        title: "Alice's journal",
        description: null,
        author: alice,
        chapters_count: 2,
        editable: false,
        bookmarking: true,
        created_at: at(1),
        updated_at: at(1)
      }
    });
    expect((await get('/journals/1', 'alice')).body).toMatchObject({
      editable: true,
      bookmarking: false
    });
    expect((await get(`/journals/${dave.journal}`, 'alice')).status).toBe(404);
    expect((await get(`/users/${dave.id}/journal`, 'alice')).status).toBe(404);
  });
});
