import { env } from 'cloudflare:test';
import { asc, eq, inArray } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { database } from '../db/client.ts';
import {
  coauthorships,
  devices,
  journalRevisions,
  notifications,
  pins,
  userPreferences
} from '../db/schema.ts';
import { get, idsOf, send } from '../test/client.ts';
import { checkinImage, seedMe } from '../test/me.ts';
import { accountOf, pinRevisionsOf } from '../test/records.ts';
import { alice, bob, variants } from '../test/serialized.ts';
import { at, IMAGE_BASE, ids, seedWorld } from '../test/world.ts';
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
