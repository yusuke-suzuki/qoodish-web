import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.ts';
import { database } from '../../db/client.ts';
import { coauthorships } from '../../db/schema.ts';
import { at, ids, seedWorld } from '../../test/world.ts';

const app = createApp();

beforeAll(async () => {
  await seedWorld(env.DB);
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
