import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { get, send } from '../test/client.ts';
import { seedWorld } from '../test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
});

describe('authenticateUser', () => {
  it('answers 401 when the token belongs to no user', async () => {
    expect(await get('/maps', 'stranger')).toEqual({
      status: 401,
      body: { title: 'Unauthorized', detail: expect.any(String) }
    });
  });

  it('answers 401 for a token without a user', async () => {
    const { status } = await send(
      'PUT',
      '/me/profile',
      { sub: 'stranger' },
      { name: 'Stranger' }
    );

    expect(status).toBe(401);
  });
});
