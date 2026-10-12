import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { recordComment } from './comments.ts';
import { database } from './db/client.ts';
import { blocks, comments } from './db/schema.ts';
import { commentNotifications } from './test/records.ts';
import { at, ids, seedWorld } from './test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
  await database(env.DB)
    .insert(blocks)
    .values({ blockerId: ids.carol, blockedId: ids.bob, createdAt: at(30) });
});

const db = () => database(env.DB);

describe('recordComment', () => {
  it('reads the block from the database and leaves earlier comments alone', async () => {
    const earlier = await db()
      .select({
        id: comments.id,
        currentRevisionId: comments.currentRevisionId
      })
      .from(comments)
      .where(eq(comments.userId, ids.carol));

    await expect(
      recordComment(db(), ids.carol, {
        type: 'Pin',
        commentable: { id: ids.latte, userId: ids.bob },
        body: 'Sneaky'
      })
    ).rejects.toMatchObject({ status: 422 });
    expect(
      await db().select().from(comments).where(eq(comments.body, 'Sneaky'))
    ).toEqual([]);
    expect(await commentNotifications('Pin', ids.latte)).toEqual([]);
    expect(
      await db()
        .select({
          id: comments.id,
          currentRevisionId: comments.currentRevisionId
        })
        .from(comments)
        .where(eq(comments.userId, ids.carol))
    ).toEqual(earlier);
  });
});
