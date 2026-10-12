import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { get, idsOf } from '../../../test/client.ts';
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

  it('reads the first of repeated cursors and rejects a malformed one', async () => {
    const path = `/guest/v2/users/${ids.bob}/pins`;
    const firstPage = await get(path);
    const cursor = (firstPage.body as { next_cursor: string }).next_cursor;

    expect(await idsOf(`${path}?cursor=${cursor}&cursor=%25`)).toEqual([
      100,
      ids.latte
    ]);
    expect(await get(`${path}?cursor=&cursor=${cursor}`)).toEqual(firstPage);
    expect(await get(`${path}?other=%25`)).toEqual(firstPage);
    expect((await get(`${path}?cursor=%25&cursor=${cursor}`)).status).toBe(400);
  });

  it('answers 404 for an invalid user id before reading the cursor', async () => {
    expect((await get('/guest/v2/users/abc/pins?cursor=%25')).status).toBe(404);
  });
});
