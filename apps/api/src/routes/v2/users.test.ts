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
});
