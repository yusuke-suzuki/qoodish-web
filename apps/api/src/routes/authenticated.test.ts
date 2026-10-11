import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.ts';
import { encodeCursor } from '../cursor.ts';
import { database } from '../db/client.ts';
import {
  blocks,
  chapters,
  journalBookmarks,
  journals,
  maps,
  mutes,
  pins,
  unblocks,
  users
} from '../db/schema.ts';
import { createSigner, firebaseClaims, type Signer } from '../test/jwt.ts';
import {
  at,
  CHAPTER_CONTENT,
  FEED_PIN_COUNT,
  IMAGE_BASE,
  ids,
  MAP_FEATURES,
  seedWorld
} from '../test/world.ts';

const dave = { id: 4, map: 7, pin: 50, chapter: 5, journal: 2 };

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
    .values({ id: dave.id, uid: 'dave', name: 'Dave', ...stamp });
  await db
    .insert(journals)
    .values([
      { id: dave.journal, userId: dave.id, title: "Dave's journal", ...stamp }
    ]);
  await db.insert(maps).values({
    id: dave.map,
    userId: dave.id,
    name: 'Dave Diner',
    description: 'About Dave Diner',
    latitude: 35,
    longitude: 139,
    private: false,
    status: 'published',
    ...stamp
  });
  await db.insert(pins).values({
    id: dave.pin,
    mapId: dave.map,
    userId: dave.id,
    name: 'Dave Burger',
    comment: 'Notes on Dave Burger',
    latitude: 35,
    longitude: 139,
    status: 'published',
    ...stamp
  });
  await db.insert(chapters).values({
    id: dave.chapter,
    userId: dave.id,
    mapId: dave.map,
    title: 'Dave Story',
    status: 'published',
    content: JSON.stringify(CHAPTER_CONTENT),
    mapFeatures: JSON.stringify(MAP_FEATURES),
    ...stamp
  });
  await db.insert(blocks).values([
    { id: 1, blockerId: dave.id, blockedId: ids.alice, createdAt: at(2) },
    { id: 2, blockerId: ids.alice, blockedId: ids.carol, createdAt: at(2) }
  ]);
  await db.insert(unblocks).values({ blockId: 2, createdAt: at(3) });
  await db
    .insert(mutes)
    .values({ muterId: ids.alice, mutedId: ids.bob, createdAt: at(2) });
  await db
    .insert(journalBookmarks)
    .values({ journalId: 1, userId: ids.bob, ...stamp });
});

async function get(path: string, uid: string, method = 'GET') {
  const token = await signer.sign(
    firebaseClaims(env.GOOGLE_PROJECT_ID, { sub: uid })
  );
  const res = await app.request(
    path,
    { method, headers: { authorization: `Bearer ${token}` } },
    env
  );

  return {
    status: res.status,
    body: res.status === 204 ? null : await res.json()
  };
}

async function ids_of(path: string, uid: string): Promise<number[]> {
  const { status, body } = await get(path, uid);

  expect(status).toBe(200);
  return (body as { id: number }[]).map((item) => item.id);
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

const notFound = { title: 'NotFound', detail: 'Resource not found.' };

describe('authentication', () => {
  it('answers 401 when the token belongs to no user', async () => {
    expect(await get('/maps', 'stranger')).toEqual({
      status: 401,
      body: { title: 'Unauthorized', detail: expect.any(String) }
    });
  });
});

describe('GET /maps/:id', () => {
  it('serializes the viewer state of a map', async () => {
    expect(await get(`/maps/${ids.ramen}`, 'bob')).toEqual({
      status: 200,
      body: {
        id: ids.ramen,
        author: { ...alice, blocking: false, muting: false },
        name: 'Tokyo Ramen',
        description: 'About Tokyo Ramen',
        latitude: 35.681382,
        longitude: 139.766084,
        bookmarking: true,
        editable: false,
        bookmarkable: true,
        private: false,
        image: variants('ramen'),
        image_url: `${IMAGE_BASE}/ramen/public`,
        created_at: at(10),
        updated_at: at(10, 1)
      }
    });
  });

  it('lets coauthors edit and not bookmark', async () => {
    const { body } = await get(`/maps/${ids.ramen}`, 'carol');

    expect(body).toMatchObject({ editable: true, bookmarkable: false });
  });

  it('shows a private map to its author only', async () => {
    expect((await get(`/maps/${ids.secret}`, 'alice')).body).toMatchObject({
      private: true,
      editable: true,
      bookmarkable: false
    });
    expect(await get(`/maps/${ids.secret}`, 'bob')).toEqual({
      status: 404,
      body: notFound
    });
  });

  it('hides maps of authors who block the viewer', async () => {
    expect((await get(`/maps/${dave.map}`, 'alice')).status).toBe(404);
    expect((await get(`/maps/${dave.map}`, 'bob')).status).toBe(200);
  });
});

describe('GET /maps', () => {
  it('lists the maps the viewer owns, coauthors or bookmarked', async () => {
    expect(await ids_of('/maps', 'alice')).toEqual([
      ids.cafe,
      ids.secret,
      ids.ramen
    ]);
    expect(await ids_of('/maps', 'carol')).toEqual([ids.cafe, ids.ramen]);
  });

  it('recommends public maps the viewer neither bookmarked nor hides', async () => {
    expect(await ids_of('/maps?recommend=true', 'alice')).toEqual([ids.ramen]);
    expect((await ids_of('/maps?recommend=true', 'carol')).sort()).toEqual(
      [ids.ramen, ids.reinstatedMap, dave.map].sort()
    );
  });
});

describe('GET /maps/:mapId/coauthors', () => {
  it('tells the author that coauthors are editable', async () => {
    const { body } = await get(`/maps/${ids.ramen}/coauthors`, 'alice');

    expect(body).toEqual([
      expect.objectContaining({ id: ids.alice, author: true, editable: true }),
      expect.objectContaining({ id: ids.carol, author: false, editable: true })
    ]);
    expect((await get(`/maps/${ids.ramen}/coauthors`, 'carol')).body).toEqual([
      expect.objectContaining({ id: ids.alice, editable: false }),
      expect.objectContaining({ id: ids.carol, editable: false })
    ]);
  });

  it('answers an empty list for a map the viewer cannot see', async () => {
    expect(await get(`/maps/${ids.secret}/coauthors`, 'bob')).toEqual({
      status: 200,
      body: []
    });
  });
});

describe('pins', () => {
  it('serializes the viewer state of a pin and its comments', async () => {
    const { status, body } = await get(`/pins/${ids.shoyu}`, 'carol');

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: ids.shoyu,
      author: { ...alice, blocking: false, muting: false },
      comments: [
        {
          id: ids.pinComment,
          author: bob,
          body: `Comment ${ids.pinComment}`,
          liked: false,
          likes_count: 1,
          pin_id: ids.shoyu
        }
      ],
      editable: false,
      liked: true,
      likes_count: 2
    });
  });

  it('marks the comments the viewer liked', async () => {
    const { body } = await get(`/maps/${ids.ramen}/pins`, 'bob');

    expect(body).toMatchObject([
      {
        id: ids.shoyu,
        editable: false,
        liked: true,
        comments: [{ liked: false }]
      }
    ]);
  });

  it('hides comments by users the viewer mutes', async () => {
    const { body } = await get(`/pins/${ids.shoyu}`, 'alice');

    expect(body).toMatchObject({ editable: true, liked: false, comments: [] });
  });

  it('answers likes lists with no content', async () => {
    expect(await get(`/pins/${ids.shoyu}/likes`, 'bob')).toEqual({
      status: 204,
      body: null
    });
    expect(
      await get(`/pins/${ids.shoyu}/comments/${ids.pinComment}/likes`, 'bob')
    ).toEqual({ status: 204, body: null });
    expect((await get(`/pins/${ids.secretPin}/likes`, 'bob')).status).toBe(404);
    expect(
      (
        await get(
          `/pins/${ids.shoyu}/comments/${ids.removedPinComment}/likes`,
          'bob'
        )
      ).status
    ).toBe(404);
  });
});

describe('GET /v2/pins', () => {
  it('pages the pins of related maps without muted authors', async () => {
    expect(await get('/v2/pins', 'alice')).toMatchObject({
      status: 200,
      body: {
        data: [{ id: ids.secretPin }, { id: ids.shoyu }],
        next_cursor: null
      }
    });
  });

  it('continues from the cursor', async () => {
    const first = await get('/v2/pins', 'bob');
    const page = first.body as {
      data: { id: number; created_at: string }[];
      next_cursor: string;
    };

    expect(page.data).toHaveLength(12);
    expect(page.next_cursor).toBe(
      encodeCursor({
        createdAt: page.data[11].created_at,
        id: page.data[11].id
      })
    );

    const rest = await get(`/v2/pins?cursor=${page.next_cursor}`, 'bob');
    const restIds = (rest.body as { data: { id: number }[] }).data.map(
      (pin) => pin.id
    );

    expect(restIds).toHaveLength(FEED_PIN_COUNT + 2 - 12);
    expect(restIds.at(-1)).toBe(ids.shoyu);
  });

  it('lists the pins of a user the viewer may see', async () => {
    expect(
      (await get(`/v2/users/${ids.alice}/pins`, 'bob')).body
    ).toMatchObject({ data: [{ id: ids.shoyu }], next_cursor: null });
    expect((await get('/v2/users/999/pins', 'bob')).status).toBe(404);
  });
});

describe('chapters', () => {
  it('lets the author read a draft', async () => {
    expect((await get(`/chapters/${ids.draft}`, 'alice')).body).toMatchObject({
      id: ids.draft,
      status: 'draft',
      editable: true
    });
    expect((await get(`/chapters/${ids.draft}`, 'bob')).status).toBe(404);
  });

  it('serializes the viewer state of a chapter', async () => {
    expect(await get(`/chapters/${ids.noodleStory}`, 'bob')).toMatchObject({
      status: 200,
      body: {
        id: ids.noodleStory,
        map_id: ids.ramen,
        author: {
          ...alice,
          biography: 'Ramen walker',
          blocking: false,
          muting: false
        },
        map: { id: ids.ramen, name: 'Tokyo Ramen', private: false },
        journal: { id: 1, title: "Alice's journal" },
        editable: false,
        liked: true,
        likes_count: 1,
        comments_count: 2
      }
    });
    expect(
      (await get(`/chapters/${ids.noodleStory}`, 'alice')).body
    ).toMatchObject({ comments_count: 1 });
  });

  it('lists the comments of a chapter with their editable flag', async () => {
    expect(
      await ids_of(`/chapters/${ids.noodleStory}/comments`, 'carol')
    ).toEqual([ids.chapterComment, ids.removedChapterComment]);
    expect(
      (await get(`/chapters/${ids.noodleStory}/comments`, 'carol')).body
    ).toMatchObject([{ editable: false }, { editable: true }]);
    expect(
      await ids_of(`/chapters/${ids.noodleStory}/comments`, 'alice')
    ).toEqual([ids.removedChapterComment]);
  });

  it('pages the feed by next_timestamp', async () => {
    expect(await ids_of('/chapters', 'bob')).toEqual([
      ids.cafeStory,
      ids.noodleStory
    ]);
    expect(
      await ids_of(`/chapters?next_timestamp=${at(13)}&next_id=999`, 'bob')
    ).toEqual([ids.cafeStory, ids.noodleStory]);
    expect(await ids_of(`/chapters?next_timestamp=${at(13)}`, 'bob')).toEqual([
      ids.noodleStory
    ]);
  });
});

describe('users', () => {
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
    expect(await ids_of(`/users/${ids.alice}/maps`, 'bob')).toEqual([
      ids.ramen
    ]);
    expect(await ids_of(`/users/${ids.alice}/maps`, 'alice')).toEqual([
      ids.secret,
      ids.ramen
    ]);
    expect(await ids_of(`/users/${dave.id}/chapters`, 'alice')).toEqual([]);
    expect(await ids_of(`/users/${dave.id}/chapters`, 'bob')).toEqual([
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
