import type { ApiCursorPage, GuestChapter } from '@qoodish/api-contract';
import { desc } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../../app.ts';
import { guestChapters } from '../../../chapters.ts';
import { FEED_PER_PAGE, nextCursor } from '../../../cursor.ts';
import { database } from '../../../db/client.ts';
import { chapters } from '../../../db/schema.ts';
import { feedPage } from '../../../routing.ts';
import { feedCursor, queryParams } from '../../../validation.ts';
import { publicChapter } from '../../../visibility.ts';

const app = new Hono<AppEnv>();

app.get('/', queryParams(z.object({ cursor: feedCursor })), async (c) => {
  const db = database(c.env.DB);
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
