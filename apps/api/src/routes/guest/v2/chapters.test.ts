import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { get } from '../../../test/client.ts';
import { seedWorld } from '../../../test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
});

describe('GET /guest/v2/chapters', () => {
  it('lists the chapter feed without a cursor once it fits one page', async () => {
    expect(await get('/guest/v2/chapters')).toMatchObject({
      status: 200,
      body: { next_cursor: null }
    });
  });

  it('reads the first of repeated cursors and rejects a malformed one', async () => {
    const firstPage = await get('/guest/v2/chapters');

    for (const query of ['?cursor=', '?cursor=&cursor=%25', '?other=%25']) {
      expect(await get(`/guest/v2/chapters${query}`)).toEqual(firstPage);
    }
    for (const query of ['?cursor=%25', '?cursor=%25&cursor=']) {
      expect((await get(`/guest/v2/chapters${query}`)).status).toBe(400);
    }
  });
});
