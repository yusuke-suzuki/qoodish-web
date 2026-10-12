import { env } from 'cloudflare:test';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { database } from '../db/client.ts';
import {
  chapters,
  coauthorships,
  devices,
  images,
  journalRevisions,
  journeyCheckinRevisionImages,
  journeyCheckinRevisions,
  journeyCheckins,
  journeys,
  milestones,
  notifications,
  pins,
  userPreferences
} from '../db/schema.ts';
import { decryptAttribute, encryptionSecrets } from '../encryption.ts';
import { get, idsOf, send } from '../test/client.ts';
import { checkinImage, seedMe } from '../test/me.ts';
import {
  accountOf,
  chapterRevisionsOf,
  checkinRevisionsOf,
  pinRevisionsOf
} from '../test/records.ts';
import { alice, bob, notFound, variants } from '../test/serialized.ts';
import {
  at,
  CHAPTER_CONTENT,
  IMAGE_BASE,
  ids,
  seedWorld
} from '../test/world.ts';
import { signIn } from '../users.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
  await seedMe(env.DB);
  await signIn(database(env.DB), {
    uid: 'eve',
    name: 'Eve',
    email: 'eve@example.com',
    locale: 'ja'
  });
});

const db = () => database(env.DB);

async function coauthorsOf(mapId: number) {
  const rows = await db()
    .select({ userId: coauthorships.userId })
    .from(coauthorships)
    .where(eq(coauthorships.mapId, mapId));

  return rows.map((row) => row.userId);
}

describe('GET /me/profile', () => {
  it('merges the latest web push choices over the defaults', async () => {
    expect(await get('/me/profile', 'alice')).toEqual({
      status: 200,
      body: {
        ...alice,
        uid: 'alice',
        biography: 'Ramen walker',
        maps_count: 2,
        bookmarked_maps_count: 1,
        pins_count: 3,
        push_notification: {
          coauthor_invited: true,
          liked: true,
          comment: false,
          published: true
        }
      }
    });
  });
});

describe('own posts', () => {
  it('lists the own published maps, chapters in any status and pins', async () => {
    expect(await idsOf('/me/maps', 'alice')).toEqual([ids.secret, ids.ramen]);
    expect(await idsOf('/me/chapters', 'alice')).toEqual([
      ids.secretStory,
      ids.draft,
      ids.noodleStory
    ]);
    expect(await idsOf('/v2/me/pins', 'alice')).toEqual([
      ids.secretPin,
      ids.shoyu
    ]);
  });

  it('serves an own chapter with its comments count', async () => {
    expect(
      (await get(`/me/chapters/${ids.draft}`, 'alice')).body
    ).toMatchObject({
      id: ids.draft,
      status: 'draft',
      editable: true,
      comments_count: 0
    });
    expect((await get(`/me/chapters/${ids.cafeStory}`, 'alice')).status).toBe(
      404
    );
  });

  it('serves the own journal', async () => {
    expect((await get('/me/journal', 'alice')).body).toMatchObject({
      id: 1,
      editable: true
    });
    expect((await get('/me/journal', 'carol')).status).toBe(404);
  });
});

describe('bookmarks', () => {
  it('lists the bookmarked public maps and journals', async () => {
    expect(await idsOf('/me/bookmarks/maps', 'bob')).toEqual([ids.ramen]);
    expect((await get('/me/bookmarks/maps', 'alice')).body).toMatchObject([
      { id: ids.cafe, bookmarking: true, bookmarkable: true }
    ]);
    expect(await idsOf('/me/bookmarks/journals', 'bob')).toEqual([1]);
    expect(await idsOf('/me/bookmarks/journals', 'alice')).toEqual([]);
  });
});

describe('GET /me/coauthorship_invitations', () => {
  it('lists the pending invitations', async () => {
    expect(await get('/me/coauthorship_invitations', 'bob')).toEqual({
      status: 200,
      body: [
        {
          id: 1,
          map: {
            id: ids.ramen,
            name: 'Tokyo Ramen',
            description: 'About Tokyo Ramen',
            image: variants('ramen'),
            image_url: `${IMAGE_BASE}/ramen/public`
          },
          inviter: alice,
          status: 'pending',
          created_at: at(3),
          updated_at: at(3)
        }
      ]
    });
  });
});

describe('journeys', () => {
  it('summarizes the own journeys', async () => {
    expect(await get('/me/journeys', 'alice')).toEqual({
      status: 200,
      body: [
        {
          id: 2,
          map_id: null,
          started_at: null,
          finished_at: null,
          milestones_count: 0,
          checkins_count: 0,
          chapter_id: null,
          map: null,
          created_at: at(7),
          updated_at: at(7)
        },
        {
          id: 1,
          map_id: ids.ramen,
          started_at: at(5),
          finished_at: at(6),
          milestones_count: 2,
          checkins_count: 2,
          chapter_id: ids.noodleStory,
          map: { id: ids.ramen, name: 'Tokyo Ramen', private: false },
          created_at: at(4),
          updated_at: at(6)
        }
      ]
    });
  });

  it('serves a journey with its decrypted path', async () => {
    expect(await get('/me/journeys/1', 'alice')).toEqual({
      status: 200,
      body: {
        id: 1,
        map_id: ids.ramen,
        started_at: at(5),
        finished_at: at(6),
        milestones: [
          {
            id: 2,
            pin_id: null,
            name: 'Gone Stall',
            latitude: 35.6,
            longitude: 139.6
          },
          {
            id: 1,
            pin_id: ids.shoyu,
            name: 'Shoyu Ramen',
            latitude: 35.7,
            longitude: 139.7
          }
        ],
        checkins: [3, 1].map((id) => ({
          id,
          pin_id: null,
          spot: { name: `Spot ${id}`, latitude: 35.5, longitude: 139.5 },
          note: `Note ${id}`,
          images: id === 3 ? [{ id: checkinImage, ...variants('spot') }] : [],
          checked_in_at: id === 3 ? at(5, 5) : at(5, 10)
        })),
        encoded_path: '_p~iF~ps|U',
        chapter_id: ids.noodleStory,
        map: { id: ids.ramen, name: 'Tokyo Ramen', private: false },
        created_at: at(4),
        updated_at: at(6)
      }
    });
    expect((await get('/me/journeys/1', 'bob')).status).toBe(404);
  });
});

describe('PUT /me/notifications/:id', () => {
  function read(method: string, id: number, uid: string) {
    return send(method, `/me/notifications/${id}`, uid);
  }

  async function unread(): Promise<number[]> {
    const rows = await database(env.DB)
      .select({ id: notifications.id })
      .from(notifications)
      .where(eq(notifications.read, false));

    return rows.map((row) => row.id).sort((a, b) => a - b);
  }

  async function stateOf(ids: number[]) {
    return database(env.DB)
      .select({
        id: notifications.id,
        read: notifications.read,
        updatedAt: notifications.updatedAt
      })
      .from(notifications)
      .where(inArray(notifications.id, ids))
      .orderBy(asc(notifications.id));
  }

  it('reads a notification with the earlier ones of its group, flagged or not', async () => {
    await database(env.DB)
      .update(notifications)
      .set({ read: null })
      .where(eq(notifications.id, 1));

    const { status, body } = await read('PUT', 3, 'alice');

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: 3,
      key: 'liked',
      click_action: `/pins/${ids.shoyu}`,
      notifiable: { id: ids.shoyu, type: 'pin' },
      notifier: bob,
      read: true,
      created_at: at(10, 3)
    });
    expect(body.updated_at > at(10, 3)).toBe(true);
    expect(await stateOf([1, 2, 3])).toEqual(
      [1, 2, 3].map((id) => ({ id, read: true, updatedAt: body.updated_at }))
    );
    expect(await unread()).toEqual([5, 6, 7, 8, 9, 10]);
  });

  it('reads a like on a comment, linking to the post it was left on', async () => {
    const { body } = await read('PUT', 5, 'alice');

    expect(body).toMatchObject({
      id: 5,
      click_action: `/pins/${ids.shoyu}`,
      notifiable: {
        id: ids.pinComment,
        type: 'comment',
        image_url: `${IMAGE_BASE}/shoyu/public`
      },
      read: true
    });
  });

  it('marks a notification read even when its flag was never set', async () => {
    await database(env.DB)
      .update(notifications)
      .set({ read: null })
      .where(eq(notifications.id, 6));

    expect((await read('PUT', 6, 'alice')).body).toMatchObject({
      id: 6,
      read: true
    });
  });

  it('leaves a notification that is already read as it was', async () => {
    const { body } = await read('PATCH', 4, 'alice');

    expect(body).toMatchObject({ id: 4, read: true, updated_at: at(10, 4) });
  });

  it('answers 404 for notifications the user is not shown', async () => {
    const before = await unread();
    const statuses = await Promise.all([
      read('PUT', 7, 'alice'),
      read('PUT', 8, 'alice'),
      read('PUT', 9, 'alice'),
      read('PUT', 10, 'bob')
    ]);

    expect(statuses.map(({ status }) => status)).toEqual([404, 404, 404, 404]);
    expect(await unread()).toEqual(before);
  });
});

describe('PUT /me/profile', () => {
  it('appends a revision only when the name or biography changes', async () => {
    const changed = await send(
      'PUT',
      '/me/profile',
      { sub: 'eve' },
      { name: 'Eve Online', biography: 'Wanderer' }
    );
    const unchanged = await send(
      'PATCH',
      '/me/profile',
      { sub: 'eve' },
      { name: 'Eve Online' }
    );
    const account = await accountOf('eve');

    expect(changed).toMatchObject({
      status: 200,
      body: { name: 'Eve Online', biography: 'Wanderer' }
    });
    expect(unchanged.status).toBe(200);
    expect(
      account?.revisions.map(({ name, biography }) => [name, biography])
    ).toEqual([
      ['Eve', null],
      ['Eve Online', 'Wanderer']
    ]);
    expect(account?.user.currentRevisionId).toBe(account?.revisions[1]?.id);
  });

  it('sets the avatar from the first image id and clears it with an empty list', async () => {
    const set = await send(
      'PUT',
      '/me/profile',
      { sub: 'alice' },
      { image_ids: [ids.aliceImage] }
    );
    const cleared = await send(
      'PUT',
      '/me/profile',
      { sub: 'alice' },
      { image_ids: [] }
    );

    expect(set.body.image_url).toMatch(/alice\/public$/);
    expect(cleared.body).toMatchObject({ image: null, image_url: '' });
    expect((await accountOf('alice'))?.revisions).toHaveLength(0);
  });

  it('refuses a blank name', async () => {
    const { status, body } = await send(
      'PUT',
      '/me/profile',
      { sub: 'bob' },
      { name: ' ' },
      'ja'
    );

    expect(status).toBe(422);
    expect(body.detail).toBe('名前を入力してください。');
  });

  it('refuses an image someone else uploaded', async () => {
    const { status, body } = await send(
      'PUT',
      '/me/profile',
      { sub: 'bob' },
      { image_ids: [ids.aliceImage] },
      'ja'
    );

    expect(status).toBe(422);
    expect(body.detail).toBe('ご自身でアップロードした画像ではありません。');
  });

  it('answers 400 for image ids that are not a list of plain ids', async () => {
    for (const imageIds of ['all', [0], [-1], [''], ['0x10']]) {
      const { status } = await send(
        'PUT',
        '/me/profile',
        { sub: 'bob' },
        { image_ids: imageIds }
      );

      expect(status).toBe(400);
    }
  });
});

describe('PUT /me/journal', () => {
  it('revises the journal and answers it', async () => {
    const { status, body } = await send(
      'PUT',
      '/me/journal',
      { sub: 'eve' },
      { title: 'Field notes', description: 'Places I walked' }
    );
    const [journal] = (await accountOf('eve'))?.journals ?? [];
    const revisions = await db()
      .select()
      .from(journalRevisions)
      .where(eq(journalRevisions.journalId, journal?.id ?? 0));

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: journal?.id,
      title: 'Field notes',
      description: 'Places I walked',
      editable: true
    });
    expect(revisions).toHaveLength(2);
    expect(journal?.currentRevisionId).toBe(revisions[1]?.id);
  });

  it('answers 422 for a blank or long title', async () => {
    const blank = await send(
      'PUT',
      '/me/journal',
      { sub: 'eve' },
      { title: '' }
    );
    const long = await send(
      'PUT',
      '/me/journal',
      { sub: 'eve' },
      { title: 'x'.repeat(51) }
    );

    expect(blank.body.detail).toBe('Journal title is required.');
    expect(long.body.detail).toBe('Journal title is too long. (Max: 50)');
  });

  it('answers only the required message for a long blank title', async () => {
    const { body } = await send(
      'PUT',
      '/me/journal',
      { sub: 'eve' },
      { title: ' '.repeat(51) }
    );

    expect(body.detail).toBe('Journal title is required.');
  });

  it('keeps carriage returns in the description', async () => {
    const { body } = await send(
      'PUT',
      '/me/journal',
      { sub: 'eve' },
      { description: 'First\r\nSecond' }
    );

    expect(body.description).toBe('First\r\nSecond');
  });
});

describe('PUT /me/preferences', () => {
  it('appends a snapshot that keeps the choices it was not sent', async () => {
    await send(
      'PUT',
      '/me/preferences',
      { sub: 'bob' },
      { web_push: { liked: false } }
    );
    const { status, body } = await send(
      'PUT',
      '/me/preferences',
      { sub: 'bob' },
      { web_push: { comment: false, retired: false } }
    );
    const rows = await db()
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, ids.bob));

    expect(status).toBe(200);
    expect(body).toEqual({
      web_push: {
        coauthor_invited: true,
        liked: false,
        comment: false,
        published: true
      }
    });
    expect(rows).toHaveLength(2);
  });

  it('appends nothing when the choices stay the same and ignores other keys', async () => {
    const before = await db()
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, ids.bob));
    const { status, body } = await send(
      'PUT',
      '/me/preferences',
      { sub: 'bob' },
      { web_push: { liked: false, constructor: true } }
    );
    const after = await db()
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, ids.bob));

    expect(status).toBe(200);
    expect(Object.keys(body.web_push)).toEqual([
      'coauthor_invited',
      'liked',
      'comment',
      'published'
    ]);
    expect(after).toHaveLength(before.length);
  });

  it('answers 422 for a choice that is not a boolean and 400 without choices', async () => {
    const invalid = await send(
      'PUT',
      '/me/preferences',
      { sub: 'bob' },
      { web_push: { liked: 'no' } }
    );
    const missing = await send('PUT', '/me/preferences', { sub: 'bob' }, {});

    expect(invalid.status).toBe(422);
    expect(missing.status).toBe(400);
  });

  it('ignores a choice it does not know', async () => {
    expect(
      (
        await send(
          'PUT',
          '/me/preferences',
          { sub: 'bob' },
          { web_push: { followed: true } }
        )
      ).status
    ).toBe(200);
  });
});

describe('/me/devices/:token', () => {
  it('registers a token once and forgets it', async () => {
    const tokens = async () =>
      (
        await db()
          .select({ token: devices.registrationToken })
          .from(devices)
          .where(eq(devices.userId, ids.bob))
      ).map(({ token }) => token);

    expect(
      (await send('PUT', '/me/devices/a%2Fb', { sub: 'bob' })).status
    ).toBe(204);
    expect(
      (await send('PUT', '/me/devices/a%2Fb', { sub: 'bob' })).status
    ).toBe(204);
    expect(await tokens()).toEqual(['a/b']);

    expect(
      (await send('DELETE', '/me/devices/a%2Fb', { sub: 'bob' })).status
    ).toBe(204);
    expect(
      (await send('DELETE', '/me/devices/a%2Fb', { sub: 'bob' })).status
    ).toBe(204);
    expect(await tokens()).toEqual([]);
  });

  it('answers 400 for a token that is too long', async () => {
    expect(
      (await send('PUT', `/me/devices/${'a'.repeat(4097)}`, { sub: 'bob' }))
        .status
    ).toBe(400);
  });
});

describe('PUT /me/pins/:id', () => {
  it('revises the pin, carrying the images and tags', async () => {
    const { status, body } = await send(
      'PUT',
      `/me/pins/${ids.shoyu}`,
      'alice',
      { name: 'Shoyu Ramen Deluxe' }
    );
    const revision = (await pinRevisionsOf(ids.shoyu)).at(-1);

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: ids.shoyu,
      name: 'Shoyu Ramen Deluxe',
      comment: 'Notes on Shoyu Ramen',
      editable: true
    });
    expect(revision).toMatchObject({
      userId: ids.alice,
      name: 'Shoyu Ramen Deluxe',
      imageIds: [ids.shoyuImage, ids.shoyuSecondImage],
      propertyOptionIds: [ids.salty, ids.sweet]
    });
  });

  it('appends nothing when the pin stays the same', async () => {
    const before = await pinRevisionsOf(ids.shoyu);

    await send('PATCH', `/me/pins/${ids.shoyu}`, 'alice', {
      name: 'Shoyu Ramen Deluxe',
      image_ids: [ids.shoyuSecondImage, ids.shoyuImage]
    });

    expect(await pinRevisionsOf(ids.shoyu)).toHaveLength(before.length);
  });

  it('replaces the tags that are sent', async () => {
    const { body } = await send('PATCH', `/me/pins/${ids.shoyu}`, 'alice', {
      property_option_ids: []
    });

    expect(body.property_option_ids).toEqual([]);
    expect((await pinRevisionsOf(ids.shoyu)).at(-1)).toMatchObject({
      imageIds: [ids.shoyuImage, ids.shoyuSecondImage],
      propertyOptionIds: []
    });
  });

  it('answers 422 for a retired tag or a cleared location, appending nothing', async () => {
    const before = await pinRevisionsOf(ids.shoyu);
    const retired = await send('PATCH', `/me/pins/${ids.shoyu}`, 'alice', {
      property_option_ids: [ids.sweet]
    });
    const cleared = await send('PATCH', `/me/pins/${ids.shoyu}`, 'alice', {
      latitude: null
    });

    expect(retired).toMatchObject({
      status: 422,
      body: { detail: 'Some of the tags chosen cannot be used on this pin.' }
    });
    expect(cleared).toMatchObject({
      status: 422,
      body: { detail: 'Please choose where the pin is.' }
    });
    expect(await pinRevisionsOf(ids.shoyu)).toHaveLength(before.length);
  });

  it('answers 422 for a location that is not a number, even beside another error', async () => {
    const rejected = await Promise.all(
      ['north', null, '', ' ', true, [35.6]].map(async (latitude) =>
        send('PATCH', `/me/pins/${ids.shoyu}`, 'alice', { latitude })
      )
    );
    const combined = await send('PATCH', `/me/pins/${ids.shoyu}`, 'alice', {
      name: '',
      latitude: 'north'
    });

    for (const response of rejected) {
      expect(response).toMatchObject({
        status: 422,
        body: { detail: 'Please choose where the pin is.' }
      });
    }
    expect(combined.status).toBe(422);
    expect(combined.body.detail).toContain('Please choose where the pin is.');
  });

  it('rounds the location to six decimals', async () => {
    const { body } = await send('PATCH', `/me/pins/${ids.shoyu}`, 'alice', {
      latitude: 35.6812362,
      longitude: '139.7671248'
    });

    expect(body).toMatchObject({
      latitude: 35.681236,
      longitude: 139.767125
    });
  });

  it('answers 404 on a pin of someone else', async () => {
    expect(
      (await send('PUT', `/me/pins/${ids.shoyu}`, 'carol', { name: 'Mine' }))
        .status
    ).toBe(404);
  });
});

describe('DELETE /me/pins/:id', () => {
  it('discards the pin as a revision, once', async () => {
    const path = `/me/pins/${ids.shoyu}`;

    expect((await send('DELETE', path, 'carol')).status).toBe(404);
    expect((await send('DELETE', path, 'alice')).status).toBe(204);
    expect((await send('DELETE', path, 'alice')).status).toBe(404);

    const [pin] = await db().select().from(pins).where(eq(pins.id, ids.shoyu));

    expect(pin?.status).toBe('deleted');
    expect((await pinRevisionsOf(ids.shoyu)).at(-1)).toMatchObject({
      status: 'deleted',
      userId: ids.alice,
      imageIds: [ids.shoyuImage, ids.shoyuSecondImage]
    });
  });
});

describe('POST /me/coauthorship_invitations/:id/accept and /decline', () => {
  it('makes the invitee a coauthor once accepted', async () => {
    const [pending] = (await send('GET', '/me/coauthorship_invitations', 'bob'))
      .body;
    const accepted = await send(
      'POST',
      `/me/coauthorship_invitations/${pending.id}/accept`,
      'bob'
    );
    const again = await send(
      'POST',
      `/me/coauthorship_invitations/${pending.id}/accept`,
      'bob'
    );

    expect(accepted).toMatchObject({
      status: 200,
      body: { id: pending.id, status: 'accepted' }
    });
    const declinedAfter = await send(
      'POST',
      `/me/coauthorship_invitations/${pending.id}/decline`,
      'bob'
    );

    expect(again.status).toBe(404);
    expect(declinedAfter.status).toBe(404);
    expect(
      (await send('GET', `/me/coauthorship_invitations`, 'bob')).body
    ).toEqual([]);
    expect(await coauthorsOf(ids.ramen)).toEqual(
      expect.arrayContaining([ids.bob, ids.carol])
    );
  });

  it('leaves the map as it was once declined', async () => {
    const invited = await send(
      'POST',
      `/maps/${ids.cafe}/coauthorship_invitations`,
      'bob',
      { user_id: ids.alice }
    );
    const declined = await send(
      'POST',
      `/me/coauthorship_invitations/${invited.body.id}/decline`,
      'alice'
    );
    const byOther = await send(
      'POST',
      `/me/coauthorship_invitations/${invited.body.id}/accept`,
      'carol'
    );

    expect(declined.body).toMatchObject({ status: 'declined' });
    expect(byOther.status).toBe(404);
    expect(await coauthorsOf(ids.cafe)).toEqual([]);
  });
});

describe('answering an unknown invitation', () => {
  it('answers 404 for an unknown invitation or answer', async () => {
    expect(
      (await send('POST', '/me/coauthorship_invitations/999/accept', 'carol'))
        .status
    ).toBe(404);
    expect(
      await send('POST', '/me/coauthorship_invitations/1/maybe', 'bob')
    ).toMatchObject({
      status: 404,
      body: {
        detail: "No route matches [POST] '/me/coauthorship_invitations/1/maybe'"
      }
    });
  });
});

describe('PUT /me/chapters/:id', () => {
  const path = `/me/chapters/${ids.noodleStory}`;
  const emptyDocument = { root: { type: 'root', version: 1, children: [] } };

  it('revises the chapter, carrying its image', async () => {
    const { status, body } = await send('PUT', path, 'alice', {
      title: 'Noodle Story Deluxe',
      content: emptyDocument
    });

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: ids.noodleStory,
      title: 'Noodle Story Deluxe',
      status: 'published',
      content: emptyDocument,
      image_url: `${IMAGE_BASE}/story/public`,
      journey_id: 1,
      editable: true
    });
    expect((await chapterRevisionsOf(ids.noodleStory)).at(-1)).toMatchObject({
      userId: ids.alice,
      title: 'Noodle Story Deluxe',
      status: 'published',
      content: JSON.stringify(emptyDocument),
      imageIds: [ids.chapterImage]
    });
  });

  it('appends nothing when the chapter stays the same', async () => {
    const before = await chapterRevisionsOf(ids.noodleStory);

    await send('PATCH', path, 'alice', {
      title: 'Noodle Story Deluxe',
      content: { root: { children: [], version: 1, type: 'root' } },
      image_ids: [ids.chapterImage]
    });
    await send('PATCH', path, 'alice', { content: 'Hello' });

    expect(await chapterRevisionsOf(ids.noodleStory)).toHaveLength(
      before.length
    );
  });

  it('replaces the image that is sent', async () => {
    const cleared = await send('PATCH', path, 'alice', { image_ids: [] });
    const replaced = await send('PATCH', path, 'alice', {
      image_ids: [String(ids.ramenImage)]
    });

    expect(cleared.body).toMatchObject({ image: null, image_url: '' });
    expect(replaced.body).toMatchObject({
      image: variants('ramen'),
      image_url: `${IMAGE_BASE}/ramen/public`
    });
    expect(
      (await chapterRevisionsOf(ids.noodleStory))
        .slice(-2)
        .map((revision) => revision.imageIds)
    ).toEqual([[], [ids.ramenImage]]);
  });

  it('keeps the image when the image ids are null', async () => {
    const { status, body } = await send('PATCH', path, 'alice', {
      title: 'Noodle Story Kept',
      image_ids: null
    });

    expect(status).toBe(200);
    expect(body).toMatchObject({
      title: 'Noodle Story Kept',
      image_url: `${IMAGE_BASE}/ramen/public`
    });
    expect((await chapterRevisionsOf(ids.noodleStory)).at(-1)).toMatchObject({
      title: 'Noodle Story Kept',
      imageIds: [ids.ramenImage]
    });
  });

  it('answers 422 for an unknown status, a blank title, an invalid document or images it cannot attach', async () => {
    const strangerImage = 7;

    await db()
      .insert(images)
      .values({
        id: strangerImage,
        userId: ids.bob,
        url: `${IMAGE_BASE}/stranger/public`,
        createdAt: at(1),
        updatedAt: at(1)
      });

    const before = await chapterRevisionsOf(ids.noodleStory);
    const responses = await Promise.all(
      [
        { status: 'archived', title: null },
        { content: { foo: 'bar' }, map_features: { type: 'Feature' } },
        { image_ids: [ids.ramenImage, ids.chapterImage] },
        { image_ids: [strangerImage] }
      ].map((changes) => send('PATCH', path, 'alice', changes))
    );

    expect(responses.map(({ status, body }) => [status, body.detail])).toEqual([
      [422, 'Status is not included in the list Chapter title is required.'],
      [
        422,
        'Chapter content is not a valid document. Chapter map features are not a valid GeoJSON FeatureCollection.'
      ],
      [422, 'Only one image can be attached to a chapter.'],
      [422, 'The image was not uploaded by you.']
    ]);
    expect(
      (await send('PATCH', path, 'alice', { image_ids: [999] })).status
    ).toBe(404);
    expect(await chapterRevisionsOf(ids.noodleStory)).toHaveLength(
      before.length
    );
  });

  it('publishes a draft and takes it back', async () => {
    const draftPath = `/me/chapters/${ids.draft}`;
    const published = await send('PUT', draftPath, 'alice', {
      status: 'published'
    });
    const withdrawn = await send('PUT', draftPath, 'alice', {
      status: 'draft'
    });

    expect(published.body.status).toBe('published');
    expect(withdrawn.body.status).toBe('draft');
    expect(
      (await chapterRevisionsOf(ids.draft)).map((revision) => revision.status)
    ).toEqual(['published', 'draft']);
  });

  it('discards a chapter sent with the deleted status and answers it', async () => {
    const secretPath = `/me/chapters/${ids.secretStory}`;

    await db()
      .update(chapters)
      .set({ journeyId: 2 })
      .where(eq(chapters.id, ids.secretStory));

    const { status, body } = await send('PUT', secretPath, 'alice', {
      status: 'deleted'
    });

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: ids.secretStory,
      status: 'deleted',
      journey_id: null
    });
    expect((await chapterRevisionsOf(ids.secretStory)).at(-1)).toMatchObject({
      status: 'deleted',
      userId: ids.alice
    });
    expect((await get(secretPath, 'alice')).status).toBe(404);
    expect(
      (await send('PUT', secretPath, 'alice', { status: 'draft' })).status
    ).toBe(404);
  });

  it('answers 404 on a chapter of someone else', async () => {
    expect(
      (
        await send('PUT', `/me/chapters/${ids.cafeStory}`, 'alice', {
          title: 'Mine'
        })
      ).status
    ).toBe(404);
  });
});

describe('DELETE /me/chapters/:id', () => {
  it('discards the chapter as a revision, once, and releases its journey', async () => {
    const path = `/me/chapters/${ids.noodleStory}`;

    expect((await send('DELETE', path, 'carol')).status).toBe(404);
    expect((await send('DELETE', path, 'alice')).status).toBe(204);
    expect((await send('DELETE', path, 'alice')).status).toBe(404);
    expect((await get(path, 'alice')).status).toBe(404);

    const [chapter] = await db()
      .select()
      .from(chapters)
      .where(eq(chapters.id, ids.noodleStory));

    expect(chapter).toMatchObject({ status: 'deleted', journeyId: null });
    expect((await chapterRevisionsOf(ids.noodleStory)).at(-1)).toMatchObject({
      status: 'deleted',
      userId: ids.alice,
      imageIds: [ids.ramenImage]
    });
    expect(
      await send('POST', `/maps/${ids.ramen}/chapters`, 'alice', {
        title: 'Noodle Story Again',
        content: CHAPTER_CONTENT,
        journey_id: 1
      })
    ).toMatchObject({ status: 200, body: { journey_id: 1 } });
  });
});

describe('journey writes', () => {
  const secrets = encryptionSecrets(env);
  const feedPin = (index: number) => ids.feedPins + index;
  const invalid = (detail: string) => ({
    status: 422,
    body: { title: 'UnprocessableContent', detail }
  });

  async function newJourney(uid: string, mapId: number): Promise<number> {
    const { status, body } = await send('POST', `/maps/${mapId}/journeys`, uid);

    expect(status).toBe(200);
    return body.id;
  }

  async function journeyRow(journeyId: number) {
    const [row] = await db()
      .select()
      .from(journeys)
      .where(eq(journeys.id, journeyId));

    return row;
  }

  async function checkinRow(checkinId: number) {
    const [row] = await db()
      .select()
      .from(journeyCheckins)
      .where(eq(journeyCheckins.id, checkinId));

    return row;
  }

  async function milestonesOf(journeyId: number) {
    return db()
      .select({ pinId: milestones.pinId, position: milestones.position })
      .from(milestones)
      .where(eq(milestones.journeyId, journeyId))
      .orderBy(asc(milestones.position));
  }

  let cafeJourney: number;
  let ramenJourney: number;
  let feedCheckin: number;
  let retroactiveCheckin: number;
  let bobImage: number;

  it('starts an unfinished journey of the own once', async () => {
    cafeJourney = await newJourney('alice', ids.cafe);
    const path = `/me/journeys/${cafeJourney}/start`;

    expect(await send('POST', path, 'bob')).toEqual({
      status: 404,
      body: notFound
    });

    const { status, body } = await send('POST', path, 'alice');

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: cafeJourney,
      map_id: ids.cafe,
      started_at: expect.any(String),
      finished_at: null,
      milestones: [],
      checkins: [],
      encoded_path: null
    });
    expect(body.updated_at).toBe(body.started_at);
    expect(await send('POST', path, 'alice')).toEqual({
      status: 409,
      body: { title: 'Conflict', detail: 'The journey has already started.' }
    });
    expect((await send('POST', '/me/journeys/1/start', 'alice')).status).toBe(
      404
    );
  });

  it('finishes a started journey, encrypting its path as Active Record Encryption does', async () => {
    ramenJourney = await newJourney('alice', ids.ramen);
    const finish = `/me/journeys/${ramenJourney}/finish`;
    const path = 'a~l~Fjk~uOwHJy@P';

    expect(await send('POST', finish, 'alice', { encoded_path: path })).toEqual(
      {
        status: 409,
        body: { title: 'Conflict', detail: 'The journey has not started yet.' }
      }
    );
    await send('POST', `/me/journeys/${ramenJourney}/start`, 'alice');

    const { status, body } = await send('POST', finish, 'alice', {
      encoded_path: path
    });
    const stored = (await journeyRow(ramenJourney))?.encodedPath ?? '';
    const message = JSON.parse(stored);

    expect(status).toBe(200);
    expect(body).toMatchObject({
      finished_at: expect.any(String),
      encoded_path: path
    });
    expect(Object.keys(message)).toEqual(['p', 'h']);
    expect(Object.keys(message.h)).toEqual(['iv', 'at']);
    expect(await decryptAttribute(stored, secrets)).toBe(path);
    expect(
      (await get(`/me/journeys/${ramenJourney}`, 'alice')).body.encoded_path
    ).toBe(path);
    expect((await send('POST', finish, 'alice')).status).toBe(404);
  });

  it('finishes without a path, and compresses a long one', async () => {
    const bobJourney = await newJourney('bob', ids.cafe);
    const finish = `/me/journeys/${bobJourney}/finish`;
    const path = '_p~iF~ps|U'.repeat(30);

    await send('POST', `/me/journeys/${bobJourney}/start`, 'bob');

    expect(
      await send('POST', finish, 'bob', { encoded_path: 'a'.repeat(1_000_001) })
    ).toEqual(invalid('The journey path is too large.'));
    expect(
      (await send('POST', finish, 'bob', { encoded_path: path })).body
        .encoded_path
    ).toBe(path);
    expect(
      JSON.parse((await journeyRow(bobJourney))?.encodedPath ?? '').h.c
    ).toBe(true);

    const finished = await send(
      'POST',
      `/me/journeys/${cafeJourney}/finish`,
      'alice'
    );

    expect(finished).toMatchObject({
      status: 200,
      body: { finished_at: expect.any(String), encoded_path: null }
    });
    expect((await journeyRow(cafeJourney))?.encodedPath).toBeNull();
  });

  it('adds milestones to an unfinished journey in order', async () => {
    cafeJourney = await newJourney('alice', ids.cafe);
    const add = (pinId: unknown, uid = 'alice', journeyId = cafeJourney) =>
      send('POST', `/me/journeys/${journeyId}/milestones`, uid, {
        pin_id: pinId
      });

    const first = await add(feedPin(0));

    expect(first).toEqual({
      status: 200,
      body: {
        id: expect.any(Number),
        pin_id: feedPin(0),
        name: 'Feed 0',
        latitude: 35.7,
        longitude: 139.7
      }
    });
    expect((await add(String(feedPin(1)))).status).toBe(200);
    expect(
      (
        await send(
          'DELETE',
          `/me/journeys/${cafeJourney}/milestones/${first.body.id}`,
          'alice'
        )
      ).status
    ).toBe(204);
    expect(
      (
        await send(
          'DELETE',
          `/me/journeys/${cafeJourney}/milestones/${first.body.id}`,
          'alice'
        )
      ).status
    ).toBe(404);
    expect((await add(feedPin(2))).status).toBe(200);
    expect(await milestonesOf(cafeJourney)).toEqual([
      { pinId: feedPin(1), position: 2 },
      { pinId: feedPin(2), position: 3 }
    ]);
    expect(
      (await get(`/me/journeys/${cafeJourney}`, 'alice')).body.milestones.map(
        (milestone: { pin_id: number }) => milestone.pin_id
      )
    ).toEqual([feedPin(1), feedPin(2)]);
  });

  it('rejects a milestone that is duplicated, off the map or out of reach', async () => {
    const add = (body: unknown, uid = 'alice', journeyId = cafeJourney) =>
      send('POST', `/me/journeys/${journeyId}/milestones`, uid, body);

    expect(await add({ pin_id: feedPin(1) })).toEqual(
      invalid('The pin is already added as a milestone.')
    );
    expect(await add({ pin_id: ids.secretPin })).toEqual(
      invalid('The pin does not belong to the map of the journey.')
    );
    expect((await add({ pin_id: ids.deletedPin })).status).toBe(404);
    expect((await add({})).status).toBe(404);
    expect((await add({ pin_id: feedPin(3) }, 'bob')).status).toBe(404);
    expect((await add({ pin_id: feedPin(3) }, 'alice', 1)).status).toBe(404);
    expect(
      (await send('DELETE', '/me/journeys/1/milestones/1', 'alice')).status
    ).toBe(404);
    expect(await milestonesOf(cafeJourney)).toHaveLength(2);
  });

  it('answers 422 to the loser of two concurrent milestones at one pin', async () => {
    const responses = await Promise.all(
      [0, 1].map(() =>
        send('POST', `/me/journeys/${cafeJourney}/milestones`, 'alice', {
          pin_id: feedPin(5)
        })
      )
    );
    const added = responses.find((response) => response.status === 200);

    expect(responses.map((response) => response.status).sort()).toEqual([
      200, 422
    ]);
    expect(responses.find((response) => response.status === 422)).toEqual(
      invalid('The pin is already added as a milestone.')
    );
    expect(
      (
        await send(
          'DELETE',
          `/me/journeys/${cafeJourney}/milestones/${added?.body.id}`,
          'alice'
        )
      ).status
    ).toBe(204);
  });

  it('records a checkin with its first revision and images', async () => {
    const checkIn = (body: unknown, uid = 'alice') =>
      send('POST', `/me/journeys/${cafeJourney}/checkins`, uid, body);

    expect(await checkIn({ pin_id: feedPin(0) })).toEqual(
      invalid('The journey has not started yet.')
    );
    await send('POST', `/me/journeys/${cafeJourney}/start`, 'alice');

    const { status, body } = await checkIn({
      pin_id: feedPin(0),
      note: 'First\r\nvisit',
      image_ids: [checkinImage, checkinImage]
    });

    feedCheckin = body.id;
    expect(status).toBe(200);
    expect(body).toEqual({
      id: expect.any(Number),
      pin_id: feedPin(0),
      spot: { name: 'Feed 0', latitude: 35.7, longitude: 139.7 },
      note: 'First\nvisit',
      images: [{ id: checkinImage, ...variants('spot') }],
      checked_in_at: expect.any(String)
    });

    const revisions = await checkinRevisionsOf(feedCheckin);

    expect(revisions).toMatchObject([
      {
        userId: ids.alice,
        note: 'First\nvisit',
        checkedInAt: body.checked_in_at,
        status: 'recorded',
        imageIds: [checkinImage]
      }
    ]);
    expect((await checkinRow(feedCheckin))?.currentRevisionId).toBe(
      revisions[0]?.id
    );
  });

  it('rejects a checkin that breaks a rule of the previous API', async () => {
    const checkIn = (body: unknown, uid = 'alice') =>
      send('POST', `/me/journeys/${cafeJourney}/checkins`, uid, body);
    const [inserted] = await db()
      .insert(images)
      .values({
        userId: ids.bob,
        url: `${IMAGE_BASE}/bob-spot/public`,
        createdAt: at(1),
        updatedAt: at(1)
      })
      .returning({ id: images.id });

    bobImage = inserted?.id ?? 0;

    expect(await checkIn({ pin_id: feedPin(0) })).toEqual(
      invalid('The journey has already checked in at this pin.')
    );
    expect(await checkIn({ pin_id: ids.secretPin })).toEqual(
      invalid('The pin does not belong to the map of the journey.')
    );
    expect(
      await checkIn({ pin_id: feedPin(1), image_ids: [1, 2, 3, 4, 5] })
    ).toEqual(invalid('The limit of images per checkin has been reached.'));
    expect(
      await checkIn({ pin_id: feedPin(1), image_ids: [bobImage] })
    ).toEqual(invalid('The image was not uploaded by you.'));
    expect(
      await checkIn({ pin_id: feedPin(1), note: 'a'.repeat(501) })
    ).toEqual(invalid('The note is too long. (Max: 500)'));
    expect(
      await checkIn({
        pin_id: feedPin(1),
        checked_in_at: '2026-01-01 00:00:00'
      })
    ).toEqual(invalid('The checkin time is outside the journey period.'));
    expect((await checkIn({ pin_id: feedPin(1) }, 'bob')).status).toBe(404);
    expect((await checkIn({})).status).toBe(404);
  });

  it('answers 422 to the loser of two concurrent checkins at one pin', async () => {
    const responses = await Promise.all(
      [0, 1].map(() =>
        send('POST', `/me/journeys/${cafeJourney}/checkins`, 'alice', {
          pin_id: feedPin(5)
        })
      )
    );
    const recorded = responses.find((response) => response.status === 200);

    expect(responses.map((response) => response.status).sort()).toEqual([
      200, 422
    ]);
    expect(responses.find((response) => response.status === 422)).toEqual(
      invalid('The journey has already checked in at this pin.')
    );
    expect(
      await db()
        .select({ id: journeyCheckins.id })
        .from(journeyCheckins)
        .where(
          and(
            eq(journeyCheckins.journeyId, cafeJourney),
            eq(journeyCheckins.pinId, feedPin(5))
          )
        )
    ).toEqual([{ id: recorded?.body.id }]);
    expect(await checkinRevisionsOf(recorded?.body.id)).toHaveLength(1);
    expect(
      (
        await send(
          'DELETE',
          `/me/journeys/${cafeJourney}/checkins/${recorded?.body.id}`,
          'alice'
        )
      ).status
    ).toBe(204);
  });

  it('records a checkin on a finished journey only within its period', async () => {
    const pin = await send('POST', `/maps/${ids.ramen}/pins`, 'alice', {
      name: 'Miso Ramen',
      comment: 'Rich',
      latitude: 35.1,
      longitude: 139.1
    });
    const checkIn = (body: Record<string, unknown>) =>
      send('POST', '/me/journeys/1/checkins', 'alice', {
        pin_id: pin.body.id,
        ...body
      });

    expect(await checkIn({})).toEqual(
      invalid('The checkin time is outside the journey period.')
    );
    expect(await checkIn({ checked_in_at: '2026-01-06T00:00:01Z' })).toEqual(
      invalid('The checkin time is outside the journey period.')
    );

    const { status, body } = await checkIn({
      checked_in_at: '2026-01-05 12:00:00'
    });

    retroactiveCheckin = body.id;
    expect(status).toBe(200);
    expect(body).toMatchObject({
      pin_id: pin.body.id,
      spot: { name: 'Miso Ramen', latitude: 35.1, longitude: 139.1 },
      note: null,
      images: [],
      checked_in_at: '2026-01-05T12:00:00.000000Z'
    });
  });

  it('revises a checkin as a new revision, only when it changes', async () => {
    const path = `/me/journeys/1/checkins/${retroactiveCheckin}`;
    const revised = await send('PUT', path, 'alice', {
      checked_in_at: '2026-01-05T21:30:00+09:00'
    });

    expect(revised).toMatchObject({
      status: 200,
      body: { checked_in_at: '2026-01-05T12:30:00.000000Z' }
    });
    expect(await checkinRevisionsOf(retroactiveCheckin)).toHaveLength(2);
    expect(
      (
        await send('PATCH', path, 'alice', {
          checked_in_at: '2026-01-05 12:30:00'
        })
      ).status
    ).toBe(200);
    expect(await checkinRevisionsOf(retroactiveCheckin)).toHaveLength(2);
    expect(
      await send('PUT', path, 'alice', { checked_in_at: '2026-01-06 00:00:01' })
    ).toEqual(invalid('The checkin time is outside the journey period.'));
    expect(await send('PUT', path, 'alice', { checked_in_at: null })).toEqual(
      invalid('The checkin time is outside the journey period.')
    );
    expect(await checkinRevisionsOf(retroactiveCheckin)).toHaveLength(2);
  });

  it('replaces the images and note, leaving the earlier revision as it was', async () => {
    const path = `/me/journeys/${cafeJourney}/checkins/${feedCheckin}`;
    const { status, body } = await send('PUT', path, 'alice', {
      note: 'Edited',
      image_ids: [ids.shoyuImage]
    });

    expect(status).toBe(200);
    expect(body).toMatchObject({
      note: 'Edited',
      images: [{ id: ids.shoyuImage, ...variants('shoyu') }]
    });
    expect(await checkinRevisionsOf(feedCheckin)).toMatchObject([
      { note: 'First\nvisit', imageIds: [checkinImage] },
      { note: 'Edited', imageIds: [ids.shoyuImage] }
    ]);
    expect(
      await send('PATCH', path, 'alice', { image_ids: [bobImage] })
    ).toEqual(invalid('The image was not uploaded by you.'));
    expect(
      await send('PATCH', path, 'alice', { note: 'b'.repeat(501) })
    ).toEqual(invalid('The note is too long. (Max: 500)'));
    expect(await checkinRevisionsOf(feedCheckin)).toHaveLength(2);
    expect((await send('PUT', path, 'bob', { note: 'Mine' })).status).toBe(404);
    expect(
      (
        await send('PUT', `/me/journeys/1/checkins/${feedCheckin}`, 'alice', {
          note: 'Moved'
        })
      ).status
    ).toBe(404);
    expect(
      (
        await send('PUT', '/me/journeys/1/checkins/2', 'alice', {
          note: 'Back'
        })
      ).status
    ).toBe(404);
  });

  it('discards a checkin as a revision and frees its pin', async () => {
    const path = `/me/journeys/${cafeJourney}/checkins/${feedCheckin}`;

    expect((await send('DELETE', path, 'bob')).status).toBe(404);
    expect((await send('DELETE', path, 'alice')).status).toBe(204);
    expect((await send('DELETE', path, 'alice')).status).toBe(404);
    expect(await checkinRow(feedCheckin)).toMatchObject({
      status: 'deleted',
      pinId: null,
      name: 'Feed 0',
      note: 'Edited'
    });
    expect((await checkinRevisionsOf(feedCheckin)).at(-1)).toMatchObject({
      status: 'deleted',
      userId: ids.alice,
      imageIds: [ids.shoyuImage]
    });
    expect(
      (await get(`/me/journeys/${cafeJourney}`, 'alice')).body.checkins
    ).toEqual([]);
    expect(
      (
        await send('POST', `/me/journeys/${cafeJourney}/checkins`, 'alice', {
          pin_id: feedPin(0)
        })
      ).status
    ).toBe(200);
  });

  it('rejects a second unfinished journey on a map', async () => {
    expect(await send('POST', `/maps/${ids.cafe}/journeys`, 'alice')).toEqual(
      invalid('An unfinished journey already exists on this map.')
    );
  });

  it('destroys a journey with its milestones and checkins, detaching its chapter', async () => {
    const checkinIds = (
      await db()
        .select({ id: journeyCheckins.id })
        .from(journeyCheckins)
        .where(eq(journeyCheckins.journeyId, 1))
    ).map((row) => row.id);
    const revisionIds = (
      await db()
        .select({ id: journeyCheckinRevisions.id })
        .from(journeyCheckinRevisions)
        .where(inArray(journeyCheckinRevisions.journeyCheckinId, checkinIds))
    ).map((row) => row.id);

    expect(checkinIds).toHaveLength(4);
    expect(revisionIds).toHaveLength(3);
    expect((await send('DELETE', '/me/journeys/1', 'bob')).status).toBe(404);
    expect((await send('DELETE', '/me/journeys/1', 'alice')).status).toBe(204);
    expect((await send('DELETE', '/me/journeys/1', 'alice')).status).toBe(404);
    expect((await get('/me/journeys/1', 'alice')).status).toBe(404);
    expect(await journeyRow(1)).toBeUndefined();
    expect(await milestonesOf(1)).toEqual([]);
    expect(
      await db()
        .select()
        .from(journeyCheckins)
        .where(eq(journeyCheckins.journeyId, 1))
    ).toEqual([]);
    expect(
      await db()
        .select()
        .from(journeyCheckinRevisions)
        .where(inArray(journeyCheckinRevisions.journeyCheckinId, checkinIds))
    ).toEqual([]);
    expect(
      await db()
        .select()
        .from(journeyCheckinRevisionImages)
        .where(
          inArray(
            journeyCheckinRevisionImages.journeyCheckinRevisionId,
            revisionIds
          )
        )
    ).toEqual([]);
    expect(
      await db()
        .select({ journeyId: chapters.journeyId })
        .from(chapters)
        .where(eq(chapters.id, ids.noodleStory))
    ).toEqual([{ journeyId: null }]);
    expect(
      await db().select().from(images).where(eq(images.id, checkinImage))
    ).toHaveLength(1);
    expect(await milestonesOf(cafeJourney)).toHaveLength(2);
  });
});
