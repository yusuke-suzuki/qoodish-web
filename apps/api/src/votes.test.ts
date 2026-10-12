import { env } from 'cloudflare:test';
import { and, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { database } from './db/client.ts';
import { blocks, votes } from './db/schema.ts';
import { chapterVotesBy, likedNotifications } from './test/records.ts';
import { at, ids, seedWorld } from './test/world.ts';
import { like } from './votes.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
  await database(env.DB)
    .insert(blocks)
    .values({ blockerId: ids.carol, blockedId: ids.alice, createdAt: at(30) });
});

const db = () => database(env.DB);

describe('like', () => {
  it('reads the block from the database rather than from the loaded viewer', async () => {
    const before = await likedNotifications('Chapter', ids.noodleStory);

    await expect(
      like(db(), ids.carol, {
        type: 'Chapter',
        id: ids.noodleStory,
        userId: ids.alice
      })
    ).rejects.toMatchObject({ status: 422 });
    expect(await chapterVotesBy(ids.carol)).toEqual([]);
    expect(await likedNotifications('Chapter', ids.noodleStory)).toEqual(
      before
    );
  });

  it('answers 422 on a post the user liked before the block', async () => {
    const standing = await db()
      .select({ id: votes.id })
      .from(votes)
      .where(
        and(
          eq(votes.votableType, 'Pin'),
          eq(votes.votableId, ids.shoyu),
          eq(votes.voterId, ids.carol)
        )
      );

    expect(standing).toHaveLength(1);
    await expect(
      like(db(), ids.carol, { type: 'Pin', id: ids.shoyu, userId: ids.alice })
    ).rejects.toMatchObject({ status: 422 });
  });

  it('answers 422 when the author blocked the user', async () => {
    await expect(
      like(db(), ids.alice, {
        type: 'Comment',
        id: ids.chapterComment,
        userId: ids.carol
      })
    ).rejects.toMatchObject({ status: 422 });
  });
});
