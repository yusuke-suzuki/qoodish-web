import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { encodeCursor } from '../../../cursor.ts';
import { get } from '../../../test/client.ts';
import { at, ids, seedWorld } from '../../../test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
});

describe('GET /guest/v2/pins', () => {
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

  it('answers 400 for a malformed cursor', async () => {
    for (const cursor of [
      '%%%',
      btoa('2026-01-01T00:00:00Z'),
      btoa('not a time,1'),
      btoa('2026-01-01T00:00:00Z,0'),
      btoa('2024-13-45T25:99:00Z,1')
    ]) {
      expect(
        (await get(`/guest/v2/pins?cursor=${encodeURIComponent(cursor)}`))
          .status
      ).toBe(400);
    }
  });
});
