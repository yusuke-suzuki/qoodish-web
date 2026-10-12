import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { get } from '../../../test/client.ts';
import { ids, seedWorld } from '../../../test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
});

describe('GET /guest/v2/users/:userId/pins', () => {
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
});
