import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.ts';
import { encodeCursor } from '../cursor.ts';
import {
  at,
  CHAPTER_CONTENT,
  IMAGE_BASE,
  ids,
  MAP_FEATURES,
  seedWorld
} from '../test/world.ts';

const app = createApp();

beforeAll(async () => {
  await seedWorld(env.DB);
});

async function get(path: string, headers: HeadersInit = {}) {
  const res = await app.request(path, { headers }, env);
  return { status: res.status, body: await res.json() };
}

async function ids_of(path: string): Promise<number[]> {
  const { status, body } = await get(path);

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

const ramenMap = {
  id: ids.ramen,
  author: alice,
  name: 'Tokyo Ramen',
  description: 'About Tokyo Ramen',
  latitude: 35.681382,
  longitude: 139.766084,
  bookmarking: false,
  editable: false,
  bookmarkable: false,
  private: false,
  image: variants('ramen'),
  image_url: `${IMAGE_BASE}/ramen/public`,
  created_at: at(10),
  updated_at: at(10, 1)
};

const shoyuPin = {
  id: ids.shoyu,
  name: 'Shoyu Ramen',
  latitude: 35.7,
  longitude: 139.7,
  author: alice,
  comment: 'Notes on Shoyu Ramen',
  comments: [
    {
      id: ids.pinComment,
      author: bob,
      body: `Comment ${ids.pinComment}`,
      likes_count: 1,
      created_at: at(26, ids.pinComment),
      updated_at: at(26, ids.pinComment),
      pin_id: ids.shoyu
    }
  ],
  images: [
    {
      id: ids.shoyuImage,
      url: `${IMAGE_BASE}/shoyu/public`,
      ...withoutUrl(variants('shoyu'))
    },
    {
      id: ids.shoyuSecondImage,
      url: `${IMAGE_BASE}/shoyu-2/public`,
      ...withoutUrl(variants('shoyu-2'))
    }
  ],
  property_option_ids: [ids.salty, ids.sweet],
  map: { id: ids.ramen, name: 'Tokyo Ramen', private: false },
  likes_count: 2,
  created_at: at(20),
  updated_at: at(20)
};

const noodleStory = {
  id: ids.noodleStory,
  map_id: ids.ramen,
  journey_id: null,
  title: 'Noodle Story',
  status: 'published',
  content: CHAPTER_CONTENT,
  map_features: MAP_FEATURES,
  image: variants('story'),
  image_url: `${IMAGE_BASE}/story/public`,
  author: {
    id: ids.alice,
    name: 'Alice',
    biography: 'Ramen walker',
    image: variants('alice'),
    image_url: `${IMAGE_BASE}/alice/public`
  },
  map: { id: ids.ramen, name: 'Tokyo Ramen', private: false },
  journal: { id: 1, title: "Alice's journal" },
  likes_count: 1,
  created_at: at(10),
  updated_at: at(10, 5)
};

function withoutUrl({ url: _url, ...rest }: ReturnType<typeof variants>) {
  return rest;
}

const notFound = { title: 'NotFound', detail: 'Resource not found.' };
const badRequest = {
  title: 'BadRequest',
  detail: 'Invalid parameter specified.'
};

describe('GET /guest/maps', () => {
  it('serializes a public map with the jbuilder keys in order', async () => {
    const { status, body } = await get(`/guest/maps/${ids.ramen}`);

    expect(status).toBe(200);
    expect(JSON.stringify(body)).toBe(JSON.stringify(ramenMap));
  });

  it('hides private, deleted and removed maps', async () => {
    for (const id of [ids.secret, ids.deletedMap, ids.removedMap, 999]) {
      expect(await get(`/guest/maps/${id}`)).toEqual({
        status: 404,
        body: notFound
      });
    }
  });

  it('keeps a map whose latest decision kept it', async () => {
    expect((await get(`/guest/maps/${ids.reinstatedMap}`)).status).toBe(200);
  });

  it('lists recent public maps newest first', async () => {
    expect(await ids_of('/guest/maps?recent=true')).toEqual([
      ids.cafe,
      ids.ramen,
      ids.reinstatedMap
    ]);
  });

  it('orders active maps by their latest published pin', async () => {
    expect(await ids_of('/guest/maps?active=true')).toEqual([
      ids.cafe,
      ids.ramen,
      ids.reinstatedMap
    ]);
  });

  it('orders popular maps by bookmarks', async () => {
    expect(await ids_of('/guest/maps?popular=true')).toEqual([
      ids.cafe,
      ids.ramen
    ]);
  });

  it('recommends from the public maps', async () => {
    expect((await ids_of('/guest/maps?recommend=true')).sort()).toEqual(
      [ids.ramen, ids.cafe, ids.reinstatedMap].sort()
    );
  });

  it('features the newest pick that is still public', async () => {
    const { status, body } = await get('/guest/maps/featured');

    expect(status).toBe(200);
    expect((body as { id: number }).id).toBe(ids.cafe);
  });

  it('answers 400 without a listing parameter', async () => {
    expect(await get('/guest/maps', { 'accept-language': 'en' })).toEqual({
      status: 400,
      body: badRequest
    });
  });
});

describe('search', () => {
  it('matches terms of three or more characters through the index', async () => {
    expect(await ids_of('/guest/maps?input=ramen')).toEqual([ids.ramen]);
    expect(await ids_of('/guest/maps?input=Tokyo%20Ramen')).toEqual([
      ids.ramen
    ]);
  });

  it('matches two-character terms by substring, ignoring ASCII case', async () => {
    expect(await ids_of('/guest/maps?input=ca')).toEqual([ids.cafe]);
    expect(await ids_of('/guest/maps?input=KY')).toEqual([ids.cafe, ids.ramen]);
  });

  it('requires every term to match', async () => {
    expect(await ids_of('/guest/maps?input=Tokyo%20Cafe')).toEqual([]);
  });

  it('finds nothing when no term is long enough for the full-text index', async () => {
    expect(await ids_of('/guest/maps?input=a')).toEqual([]);
  });

  it('treats LIKE wildcards in a term as text', async () => {
    expect(await ids_of('/guest/maps?input=%25%25')).toEqual([]);
  });

  it('searches pins and chapters', async () => {
    expect(await ids_of('/guest/pins?input=shoyu')).toEqual([ids.shoyu]);
    expect(await get('/guest/chapters?input=noodles')).toEqual({
      status: 200,
      body: [
        {
          id: ids.cafeStory,
          title: 'Cafe Story',
          image: null,
          map: { id: ids.cafe, name: 'Kyoto Cafe' }
        },
        {
          id: ids.noodleStory,
          title: 'Noodle Story',
          image: variants('story'),
          map: { id: ids.ramen, name: 'Tokyo Ramen' }
        }
      ]
    });
    expect(await ids_of('/guest/chapters?input=noodle%20cafe')).toEqual([
      ids.cafeStory
    ]);
  });
});

describe('GET /guest/maps/:id/*', () => {
  it('lists the public pins of a map', async () => {
    expect(await ids_of(`/guest/maps/${ids.ramen}/pins`)).toEqual([ids.shoyu]);
    expect(await ids_of(`/guest/maps/${ids.secret}/pins`)).toEqual([]);
  });

  it('lists the author before the coauthors', async () => {
    expect(await get(`/guest/maps/${ids.ramen}/coauthors`)).toEqual({
      status: 200,
      body: [
        { ...alice, author: true, created_at: at(1), updated_at: at(1) },
        {
          id: ids.carol,
          name: 'Carol',
          image: null,
          image_url: '',
          author: false,
          created_at: at(2),
          updated_at: at(3)
        }
      ]
    });
    expect(await get(`/guest/maps/${ids.secret}/coauthors`)).toEqual({
      status: 200,
      body: []
    });
  });

  it('lists the published chapters of a public map', async () => {
    expect(await ids_of(`/guest/maps/${ids.ramen}/chapters`)).toEqual([
      ids.noodleStory
    ]);
    expect((await get(`/guest/maps/${ids.secret}/chapters`)).status).toBe(404);
  });

  it('lists published pin properties with their published options', async () => {
    expect(await get(`/guest/maps/${ids.ramen}/pin_properties`)).toEqual({
      status: 200,
      body: [
        {
          id: ids.taste,
          name: 'Taste',
          multiple: true,
          position: 1,
          options: [{ id: ids.salty, name: 'Salty', position: 0 }]
        }
      ]
    });
    expect((await get(`/guest/maps/${ids.secret}/pin_properties`)).status).toBe(
      404
    );
  });
});

describe('GET /guest/pins', () => {
  it('serializes a public pin with its visible comments', async () => {
    const { status, body } = await get(`/guest/pins/${ids.shoyu}`);

    expect(status).toBe(200);
    expect(JSON.stringify(body)).toBe(JSON.stringify(shoyuPin));
  });

  it('hides deleted, removed and private pins', async () => {
    for (const id of [ids.deletedPin, ids.removedPin, ids.secretPin]) {
      expect((await get(`/guest/pins/${id}`)).status).toBe(404);
    }
  });

  it('lists the eight most recent pins', async () => {
    expect(await ids_of('/guest/pins?recent=true')).toEqual([
      112, 111, 110, 109, 108, 107, 106, 105
    ]);
  });

  it('orders popular pins by likes', async () => {
    expect(await ids_of('/guest/pins?popular=true')).toEqual([
      ids.shoyu,
      ids.latte
    ]);
  });

  it('answers 400 without a listing parameter', async () => {
    expect((await get('/guest/pins')).status).toBe(400);
  });
});

describe('GET /guest/chapters', () => {
  it('serializes a public chapter with its comment count', async () => {
    const { status, body } = await get(`/guest/chapters/${ids.noodleStory}`);

    expect(status).toBe(200);
    expect(JSON.stringify(body)).toBe(
      JSON.stringify({ ...noodleStory, comments_count: 2 })
    );
  });

  it('hides drafts and chapters on private maps', async () => {
    for (const id of [ids.draft, ids.secretStory]) {
      expect((await get(`/guest/chapters/${id}`)).status).toBe(404);
    }
  });

  it('lists the latest public chapters', async () => {
    expect(await ids_of('/guest/chapters')).toEqual([
      ids.cafeStory,
      ids.noodleStory
    ]);
  });

  it('gives a chapter without a journal a null journal', async () => {
    const { body } = await get(`/guest/chapters/${ids.cafeStory}`);

    expect(body).toMatchObject({ journal: null, image: null, image_url: '' });
  });

  it('lists the comments that are not deleted, removed ones included', async () => {
    expect(await ids_of(`/guest/chapters/${ids.noodleStory}/comments`)).toEqual(
      [ids.chapterComment, ids.removedChapterComment]
    );
  });
});

describe('GET /guest/users', () => {
  it('counts what a user has published, bookmarked and liked', async () => {
    const { status, body } = await get(`/guest/users/${ids.alice}`);

    expect(status).toBe(200);
    expect(JSON.stringify(body)).toBe(
      JSON.stringify({
        id: ids.alice,
        name: 'Alice',
        biography: 'Ramen walker',
        image: variants('alice'),
        image_url: `${IMAGE_BASE}/alice/public`,
        maps_count: 2,
        bookmarked_maps_count: 1,
        pins_count: 3,
        likes_count: 3
      })
    );
  });

  it('answers 404 for an unknown user', async () => {
    expect(await get('/guest/users/999')).toEqual({
      status: 404,
      body: notFound
    });
  });

  it("lists a user's public maps and chapters", async () => {
    expect(await ids_of(`/guest/users/${ids.alice}/maps`)).toEqual([ids.ramen]);
    expect(await ids_of(`/guest/users/${ids.alice}/chapters`)).toEqual([
      ids.noodleStory
    ]);
  });
});

describe('GET /guest/v2', () => {
  it('pages the pin feed with a cursor that breaks timestamp ties by id', async () => {
    const first = await get('/guest/v2/pins');
    const firstPage = first.body as {
      data: { id: number }[];
      next_cursor: string;
    };

    expect(firstPage.data.map((pin) => pin.id)).toEqual([
      112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101
    ]);
    expect(firstPage.next_cursor).toBe(
      encodeCursor({ createdAt: at(25, 1), id: 101 })
    );

    const second = await get(`/guest/v2/pins?cursor=${firstPage.next_cursor}`);

    expect(second.body).toMatchObject({ next_cursor: null });
    expect(
      (second.body as { data: { id: number }[] }).data.map((pin) => pin.id)
    ).toEqual([100, ids.latte, ids.shoyu]);
  });

  it("pages a user's pins", async () => {
    const first = (await get(`/guest/v2/users/${ids.bob}/pins`)).body as {
      data: unknown[];
      next_cursor: string;
    };
    const second = (
      await get(`/guest/v2/users/${ids.bob}/pins?cursor=${first.next_cursor}`)
    ).body as { data: { id: number }[]; next_cursor: null };

    expect(first.data).toHaveLength(12);
    expect(second.data.map((pin) => pin.id)).toEqual([100, ids.latte]);
  });

  it('lists the chapter feed without a cursor once it fits one page', async () => {
    expect(await get('/guest/v2/chapters')).toMatchObject({
      status: 200,
      body: { next_cursor: null }
    });
  });

  it('answers 400 for a malformed cursor', async () => {
    for (const cursor of [
      '%%%',
      btoa('2026-01-01T00:00:00Z'),
      btoa('not a time,1'),
      btoa('2026-01-01T00:00:00Z,0')
    ]) {
      expect(
        (await get(`/guest/v2/pins?cursor=${encodeURIComponent(cursor)}`))
          .status
      ).toBe(400);
    }
  });
});
