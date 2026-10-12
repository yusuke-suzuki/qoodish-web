import type { ApiCursorPage, GuestPin } from '@qoodish/api-contract';
import { desc } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../../app.ts';
import { FEED_PER_PAGE, nextCursor } from '../../../cursor.ts';
import { database } from '../../../db/client.ts';
import { pins } from '../../../db/schema.ts';
import { guestPins } from '../../../pins.ts';
import { feedPage } from '../../../routing.ts';
import { feedCursor, queryParams } from '../../../validation.ts';
import { publicPin } from '../../../visibility.ts';

const app = new Hono<AppEnv>();

app.get('/', queryParams(z.object({ cursor: feedCursor })), async (c) => {
  const db = database(c.env.DB);
  const rows = await db
    .select()
    .from(pins)
    .where(
      feedPage(
        c.req.valid('query').cursor,
        pins.createdAt,
        pins.id,
        publicPin()
      )
    )
    .orderBy(desc(pins.createdAt), desc(pins.id))
    .limit(FEED_PER_PAGE);

  return c.json<ApiCursorPage<GuestPin>>({
    data: await guestPins(db, rows),
    next_cursor: nextCursor(rows)
  });
});

export default app;
