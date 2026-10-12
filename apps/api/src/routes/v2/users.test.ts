import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { get } from '../../test/client.ts';
import { seedDave, seedRelations } from '../../test/relations.ts';
import { ids, seedWorld } from '../../test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
  await seedDave(env.DB);
  await seedRelations(env.DB);
});

describe('GET /v2/users/:userId/pins', () => {
  it('lists the pins of a user the viewer may see', async () => {
    expect(
      (await get(`/v2/users/${ids.alice}/pins`, 'bob')).body
    ).toMatchObject({ data: [{ id: ids.shoyu }], next_cursor: null });
    expect((await get('/v2/users/999/pins', 'bob')).status).toBe(404);
  });

  it('reads the first of repeated cursors and rejects a malformed one', async () => {
    const path = `/v2/users/${ids.alice}/pins`;
    const first = await get(path, 'bob');

    for (const query of ['?cursor=', '?cursor=&cursor=%25', '?other=%25']) {
      expect(await get(`${path}${query}`, 'bob')).toEqual(first);
    }
    for (const query of ['?cursor=%25', '?cursor=%25&cursor=']) {
      expect((await get(`${path}${query}`, 'bob')).status).toBe(400);
    }
  });

  it('answers 404 for an unknown user before reading the cursor', async () => {
    expect((await get('/v2/users/999/pins?cursor=%25', 'bob')).status).toBe(
      404
    );
  });
});
