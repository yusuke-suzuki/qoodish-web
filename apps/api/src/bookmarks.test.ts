import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { bookmarkJournal, bookmarkMap } from './bookmarks.ts';
import { database } from './db/client.ts';
import { bookmarks, journalBookmarks } from './db/schema.ts';
import { send } from './test/client.ts';
import { ids, seedWorld } from './test/world.ts';

const ALICE_JOURNAL = 1;

beforeAll(async () => {
  await seedWorld(env.DB);
  await send('POST', `/users/${ids.bob}/block`, 'alice');
});

const db = () => database(env.DB);

describe('bookmarkMap and bookmarkJournal', () => {
  it('reads the block from the database rather than from the loaded viewer', async () => {
    await expect(bookmarkMap(db(), ids.bob, ids.ramen)).rejects.toMatchObject({
      status: 422,
      messageKeys: ['bookmark_blocked_interaction']
    });
    await expect(
      bookmarkJournal(db(), ids.bob, ALICE_JOURNAL)
    ).rejects.toMatchObject({
      status: 422,
      messageKeys: ['journal_bookmark_blocked_interaction']
    });
    expect(
      await db().select().from(bookmarks).where(eq(bookmarks.userId, ids.bob))
    ).toEqual([]);
    expect(await db().select().from(journalBookmarks)).toEqual([]);
  });
});
