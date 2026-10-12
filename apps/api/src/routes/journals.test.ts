import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { send } from '../test/client.ts';
import { seedWorld } from '../test/world.ts';

const ALICE_JOURNAL = 1;

beforeAll(async () => {
  await seedWorld(env.DB);
});

describe('POST/DELETE /journals/:journalId/bookmark', () => {
  it('bookmarks the journal of someone else, once', async () => {
    const path = `/journals/${ALICE_JOURNAL}/bookmark`;
    const added = await send('POST', path, 'bob');
    const duplicate = await send('POST', path, 'bob');
    const removed = await send('DELETE', path, 'bob');
    const missing = await send('DELETE', path, 'bob');

    expect(added).toMatchObject({
      status: 200,
      body: { id: ALICE_JOURNAL, bookmarking: true }
    });
    expect(duplicate).toMatchObject({
      status: 422,
      body: { detail: 'The journal is already bookmarked.' }
    });
    expect(removed.body).toMatchObject({ bookmarking: false });
    expect(missing.status).toBe(404);
  });

  it('answers 403 on the own journal and 404 on an unknown one', async () => {
    expect(
      (await send('POST', `/journals/${ALICE_JOURNAL}/bookmark`, 'alice'))
        .status
    ).toBe(403);
    expect((await send('POST', '/journals/999/bookmark', 'bob')).status).toBe(
      404
    );
  });
});
