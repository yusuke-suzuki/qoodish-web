import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.ts';
import { database } from '../db/client.ts';
import {
  blocks,
  chapters,
  coauthorshipInvitations,
  images,
  journalBookmarks,
  journeyCheckinRevisionImages,
  journeyCheckinRevisions,
  journeyCheckins,
  journeys,
  milestones,
  mutes,
  notifications,
  unblocks,
  userPreferences,
  users
} from '../db/schema.ts';
import { createSigner, firebaseClaims, type Signer } from '../test/jwt.ts';
import { at, IMAGE_BASE, ids, seedWorld } from '../test/world.ts';

const ENCODED_PATH =
  '{"p":"kAB2zxHkHX4rYQ==","h":{"iv":"2wBiU3O0tPXjfxft","at":"ipz2YrcxjHmajSKRGx0zYg=="}}';
const dave = 4;
const checkinImage = 6;

let signer: Signer;
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  signer = await createSigner();
  app = createApp({ firebaseKeys: signer.keys });
  await seedWorld(env.DB);

  const db = database(env.DB);
  const stamp = { createdAt: at(1), updatedAt: at(1) };

  await db
    .insert(users)
    .values({ id: dave, uid: 'dave', name: 'Dave', ...stamp });
  await db.insert(userPreferences).values([
    { userId: ids.alice, webPush: '{"liked":false}', ...stamp },
    {
      userId: ids.alice,
      webPush: '{"comment":false,"retired":true}',
      ...stamp
    }
  ]);
  await db.insert(coauthorshipInvitations).values([
    {
      id: 1,
      mapId: ids.ramen,
      inviterId: ids.alice,
      inviteeId: ids.bob,
      status: 0,
      createdAt: at(3),
      updatedAt: at(3)
    },
    {
      id: 2,
      mapId: ids.secret,
      inviterId: ids.alice,
      inviteeId: ids.bob,
      status: 1,
      ...stamp
    }
  ]);
  await db.insert(blocks).values([
    { id: 1, blockerId: ids.alice, blockedId: dave, createdAt: at(2) },
    { id: 2, blockerId: ids.alice, blockedId: ids.carol, createdAt: at(2) }
  ]);
  await db.insert(unblocks).values({ blockId: 2, createdAt: at(3) });
  await db
    .insert(mutes)
    .values({ muterId: ids.carol, mutedId: ids.bob, createdAt: at(2) });
  await db
    .insert(journalBookmarks)
    .values({ journalId: 1, userId: ids.bob, ...stamp });

  await db.insert(journeys).values([
    {
      id: 1,
      userId: ids.alice,
      mapId: ids.ramen,
      startedAt: at(5),
      finishedAt: at(6),
      encodedPath: ENCODED_PATH,
      createdAt: at(4),
      updatedAt: at(6)
    },
    {
      id: 2,
      userId: ids.alice,
      mapId: null,
      createdAt: at(7),
      updatedAt: at(7)
    }
  ]);
  await db
    .update(chapters)
    .set({ journeyId: 1 })
    .where(eq(chapters.id, ids.noodleStory));
  await db.insert(milestones).values([
    {
      id: 1,
      journeyId: 1,
      pinId: ids.shoyu,
      name: 'Shoyu Ramen',
      latitude: 35.7,
      longitude: 139.7,
      position: 2,
      ...stamp
    },
    {
      id: 2,
      journeyId: 1,
      pinId: null,
      name: 'Gone Stall',
      latitude: 35.6,
      longitude: 139.6,
      position: 1,
      ...stamp
    }
  ]);
  const checkin = (id: number, checkedInAt: string, status = 'recorded') => ({
    id,
    journeyId: 1,
    pinId: null,
    name: `Spot ${id}`,
    latitude: 35.5,
    longitude: 139.5,
    note: `Note ${id}`,
    checkedInAt,
    status,
    ...stamp
  });
  await db
    .insert(journeyCheckins)
    .values([
      checkin(1, at(5, 10)),
      checkin(2, at(5, 1), 'deleted'),
      checkin(3, at(5, 5))
    ]);
  await db.insert(journeyCheckinRevisions).values({
    id: 1,
    journeyCheckinId: 3,
    userId: ids.alice,
    checkedInAt: at(5, 5),
    note: 'Note 3',
    ...stamp
  });
  await db.insert(images).values({
    id: checkinImage,
    userId: ids.alice,
    url: `${IMAGE_BASE}/spot/public`,
    ...stamp
  });
  await db
    .insert(journeyCheckinRevisionImages)
    .values({ journeyCheckinRevisionId: 1, imageId: checkinImage, ...stamp });
  await db
    .update(journeyCheckins)
    .set({ currentRevisionId: 1 })
    .where(eq(journeyCheckins.id, 3));

  const notification = (
    id: number,
    key: string,
    notifiableType: string,
    notifiableId: number,
    notifierId: number,
    read = false
  ) => ({
    id,
    key,
    notifiableType,
    notifiableId,
    notifierType: 'User',
    notifierId,
    recipientType: 'User',
    recipientId: ids.alice,
    read,
    createdAt: at(10, id),
    updatedAt: at(10, id)
  });
  for (const row of [
    notification(1, 'liked', 'Pin', ids.shoyu, ids.bob),
    notification(2, 'liked', 'Pin', ids.shoyu, ids.carol),
    notification(3, 'liked', 'Pin', ids.shoyu, ids.bob),
    notification(4, 'comment', 'Pin', ids.shoyu, ids.bob, true),
    notification(5, 'liked', 'Comment', ids.pinComment, ids.carol),
    notification(6, 'published', 'Chapter', ids.draft, ids.carol),
    notification(7, 'liked', 'Pin', ids.deletedPin, ids.bob),
    notification(8, 'followed', 'Map', ids.ramen, ids.bob),
    notification(9, 'liked', 'Pin', ids.shoyu, dave),
    notification(10, 'coauthor_invited', 'Map', ids.cafe, ids.bob)
  ]) {
    await db.insert(notifications).values(row);
  }
});

async function get(path: string, uid: string) {
  const token = await signer.sign(
    firebaseClaims(env.GOOGLE_PROJECT_ID, { sub: uid })
  );
  const res = await app.request(
    path,
    { headers: { authorization: `Bearer ${token}` } },
    env
  );

  return { status: res.status, body: await res.json() };
}

async function ids_of(path: string, uid: string): Promise<number[]> {
  const { status, body } = await get(path, uid);
  const list = Array.isArray(body) ? body : (body as { data: unknown[] }).data;

  expect(status).toBe(200);
  return (list as { id: number }[]).map((item) => item.id);
}

function variants(name: string) {
  return {
    avatar: `${IMAGE_BASE}/${name}/avatar`,
    card: `${IMAGE_BASE}/${name}/card`,
    hero: `${IMAGE_BASE}/${name}/hero`,
    ogp: `${IMAGE_BASE}/${name}/ogp`,
    url: `${IMAGE_BASE}/${name}/public`
  };
}

const alice = {
  id: ids.alice,
  name: 'Alice',
  image: variants('alice'),
  image_url: `${IMAGE_BASE}/alice/public`
};

const bob = { id: ids.bob, name: 'Bob', image: null, image_url: '' };
const carol = { id: ids.carol, name: 'Carol', image: null, image_url: '' };

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
    expect(await ids_of('/me/maps', 'alice')).toEqual([ids.secret, ids.ramen]);
    expect(await ids_of('/me/chapters', 'alice')).toEqual([
      ids.secretStory,
      ids.draft,
      ids.noodleStory
    ]);
    expect(await ids_of('/v2/me/pins', 'alice')).toEqual([
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
    expect(await ids_of('/me/bookmarks/maps', 'bob')).toEqual([ids.ramen]);
    expect((await get('/me/bookmarks/maps', 'alice')).body).toMatchObject([
      { id: ids.cafe, bookmarking: true, bookmarkable: true }
    ]);
    expect(await ids_of('/me/bookmarks/journals', 'bob')).toEqual([1]);
    expect(await ids_of('/me/bookmarks/journals', 'alice')).toEqual([]);
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

describe('GET /v2/me/notifications', () => {
  it('groups the renderable notifications from users the viewer sees', async () => {
    const { status, body } = await get('/v2/me/notifications', 'alice');

    expect(status).toBe(200);
    expect(body).toEqual({
      data: [
        {
          id: 10,
          key: 'coauthor_invited',
          click_action: '/coauthorship_invitations',
          notifiable: { id: ids.cafe, type: 'map', image: null, image_url: '' },
          notifier: bob,
          read: false,
          notifiers: [bob],
          notifiers_count: 1,
          created_at: at(10, 10),
          updated_at: at(10, 10)
        },
        {
          id: 6,
          key: 'published',
          click_action: `/chapters/${ids.draft}`,
          notifiable: {
            id: ids.draft,
            type: 'chapter',
            image: null,
            image_url: ''
          },
          notifier: carol,
          read: false,
          notifiers: [carol],
          notifiers_count: 1,
          created_at: at(10, 6),
          updated_at: at(10, 6)
        },
        {
          id: 5,
          key: 'liked',
          click_action: `/pins/${ids.shoyu}`,
          notifiable: {
            id: ids.pinComment,
            type: 'comment',
            image: variants('shoyu'),
            image_url: `${IMAGE_BASE}/shoyu/public`
          },
          notifier: carol,
          read: false,
          notifiers: [carol],
          notifiers_count: 1,
          created_at: at(10, 5),
          updated_at: at(10, 5)
        },
        {
          id: 4,
          key: 'comment',
          click_action: `/pins/${ids.shoyu}`,
          notifiable: {
            id: ids.shoyu,
            type: 'pin',
            image: variants('shoyu'),
            image_url: `${IMAGE_BASE}/shoyu/public`
          },
          notifier: bob,
          read: true,
          notifiers: [bob],
          notifiers_count: 1,
          created_at: at(10, 4),
          updated_at: at(10, 4)
        },
        {
          id: 3,
          key: 'liked',
          click_action: `/pins/${ids.shoyu}`,
          notifiable: {
            id: ids.shoyu,
            type: 'pin',
            image: variants('shoyu'),
            image_url: `${IMAGE_BASE}/shoyu/public`
          },
          notifier: bob,
          read: false,
          notifiers: [bob, carol],
          notifiers_count: 2,
          created_at: at(10, 3),
          updated_at: at(10, 3)
        }
      ],
      next_cursor: null
    });
  });

  it('pages by the latest id and keeps unread groups only on read=false', async () => {
    expect(await ids_of('/v2/me/notifications?cursor=6', 'alice')).toEqual([
      5, 4, 3
    ]);
    expect(await ids_of('/v2/me/notifications?read=false', 'alice')).toEqual([
      10, 6, 5, 3
    ]);
    expect(await ids_of('/v2/me/notifications?read=true', 'alice')).toEqual([
      10, 6, 5, 4, 3
    ]);
  });
});

describe('blocked and muted accounts', () => {
  it('lists the accounts under an active block or mute', async () => {
    expect(await get('/v2/me/blocks', 'alice')).toEqual({
      status: 200,
      body: {
        data: [
          {
            id: dave,
            name: 'Dave',
            biography: null,
            image: null,
            image_url: ''
          }
        ],
        next_cursor: null
      }
    });
    expect(await get('/v2/me/mutes', 'carol')).toEqual({
      status: 200,
      body: {
        data: [{ ...bob, biography: null }],
        next_cursor: null
      }
    });
    expect(await ids_of('/v2/me/blocks?cursor=1', 'alice')).toEqual([]);
    expect(await ids_of('/v2/me/blocks?cursor=abc', 'alice')).toEqual([]);
  });
});
