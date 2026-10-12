import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { encodeCursor } from '../../cursor.ts';
import { get } from '../../test/client.ts';
import { seedDave, seedRelations } from '../../test/relations.ts';
import { FEED_PIN_COUNT, ids, seedWorld } from '../../test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
  await seedDave(env.DB);
  await seedRelations(env.DB);
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
});
