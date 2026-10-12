import type { ApiCursorPage, GuestChapter } from '@qoodish/api-contract';
import { desc } from 'drizzle-orm';
import { Hono } from 'hono';
import type { AppEnv } from '../../../app.ts';
import { guestChapters } from '../../../chapters.ts';
import { FEED_PER_PAGE, nextCursor } from '../../../cursor.ts';
import { chapters } from '../../../db/schema.ts';
import { feedPage } from '../../../routing.ts';
import { feedCursorQuery } from '../../../validation.ts';
import { publicChapter } from '../../../visibility.ts';

const app = new Hono<AppEnv>();

app.get('/', feedCursorQuery, async (c) => {
  const db = c.get('db');
  const rows = await db
    .select()
    .from(chapters)
    .where(
      feedPage(
        c.req.valid('query').cursor,
        chapters.createdAt,
        chapters.id,
        publicChapter()
      )
    )
    .orderBy(desc(chapters.createdAt), desc(chapters.id))
    .limit(FEED_PER_PAGE);

  return c.json<ApiCursorPage<GuestChapter>>({
    data: await guestChapters(db, rows),
    next_cursor: nextCursor(rows)
  });
});

export default app;
