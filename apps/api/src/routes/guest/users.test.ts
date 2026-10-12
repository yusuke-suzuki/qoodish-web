import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { get, idsOf } from '../../test/client.ts';
import { notFound, variants } from '../../test/serialized.ts';
import { IMAGE_BASE, ids, seedWorld } from '../../test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
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

  it('answers 404 for an id that is not a plain positive integer', async () => {
    for (const path of [
      `/guest/users/${ids.alice}abc`,
      `/guest/users/0x${ids.alice.toString(16)}`,
      `/guest/users/${ids.alice}e0`,
      `/guest/users/%20${ids.alice}`,
      '/guest/users/9007199254740993',
      `/guest/users/${'9'.repeat(400)}`
    ]) {
      expect(await get(path)).toEqual({ status: 404, body: notFound });
    }
  });

  it("lists a user's public maps and chapters", async () => {
    expect(await idsOf(`/guest/users/${ids.alice}/maps`)).toEqual([ids.ramen]);
    expect(await idsOf(`/guest/users/${ids.alice}/chapters`)).toEqual([
      ids.noodleStory
    ]);
  });
});
