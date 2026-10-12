import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.ts';
import { database } from '../../db/client.ts';
import { coauthorships } from '../../db/schema.ts';
import { get, idsOf } from '../../test/client.ts';
import { alice, notFound, variants } from '../../test/serialized.ts';
import { at, IMAGE_BASE, ids, seedWorld } from '../../test/world.ts';

const app = createApp();

beforeAll(async () => {
  await seedWorld(env.DB);
});

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
    expect(await idsOf('/guest/maps?recent=true')).toEqual([
      ids.cafe,
      ids.ramen,
      ids.reinstatedMap
    ]);
  });

  it('orders active maps by their latest published pin', async () => {
    expect(await idsOf('/guest/maps?active=true')).toEqual([
      ids.cafe,
      ids.ramen,
      ids.reinstatedMap
    ]);
  });

  it('orders popular maps by bookmarks', async () => {
    expect(await idsOf('/guest/maps?popular=true')).toEqual([
      ids.cafe,
      ids.ramen
    ]);
  });

  it('recommends from the public maps', async () => {
    expect((await idsOf('/guest/maps?recommend=true')).sort()).toEqual(
      [ids.ramen, ids.cafe, ids.reinstatedMap].sort()
    );
  });

  it('features the newest pick that is still public', async () => {
    const { status, body } = await get('/guest/maps/featured');

    expect(status).toBe(200);
    expect((body as { id: number }).id).toBe(ids.cafe);
  });

  it('answers 400 without a listing parameter', async () => {
    expect(await get('/guest/maps', undefined, 'en')).toEqual({
      status: 400,
      body: badRequest
    });
  });
});

describe('GET /guest/maps/:id/*', () => {
  it('lists the public pins of a map', async () => {
    expect(await idsOf(`/guest/maps/${ids.ramen}/pins`)).toEqual([ids.shoyu]);
    expect(await idsOf(`/guest/maps/${ids.secret}/pins`)).toEqual([]);
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
    expect(await idsOf(`/guest/maps/${ids.ramen}/chapters`)).toEqual([
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

describe('GET /guest/maps/:mapId/coauthors', () => {
  it('orders the coauthors by user id as the MySQL unique index did', async () => {
    await database(env.DB)
      .insert(coauthorships)
      .values({
        mapId: ids.ramen,
        userId: ids.bob,
        createdAt: at(9),
        updatedAt: at(9)
      });

    const res = await app.request(
      `/guest/maps/${ids.ramen}/coauthors`,
      {},
      env
    );

    expect(res.status).toBe(200);
    expect(
      ((await res.json()) as { id: number }[]).map((user) => user.id)
    ).toEqual([ids.alice, ids.bob, ids.carol]);
  });
});
