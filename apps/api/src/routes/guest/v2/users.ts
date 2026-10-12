import type { ApiCursorPage, GuestPin } from '@qoodish/api-contract';
import { and, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../../app.ts';
import { FEED_PER_PAGE, nextCursor } from '../../../cursor.ts';
import { database } from '../../../db/client.ts';
import { pins } from '../../../db/schema.ts';
import { guestPins } from '../../../pins.ts';
import { feedPage } from '../../../routing.ts';
import {
  feedCursor,
  id,
  pathParams,
  queryParams
} from '../../../validation.ts';
import { publicPin } from '../../../visibility.ts';

const app = new Hono<AppEnv>();

app.get(
  '/:userId/pins',
  pathParams(z.object({ userId: id })),
  queryParams(z.object({ cursor: feedCursor })),
  async (c) => {
    const db = database(c.env.DB);
    const rows = await db
      .select()
      .from(pins)
      .where(
        feedPage(
          c.req.valid('query').cursor,
          pins.createdAt,
          pins.id,
          and(publicPin(), eq(pins.userId, c.req.valid('param').userId))
        )
      )
      .orderBy(desc(pins.createdAt), desc(pins.id))
      .limit(FEED_PER_PAGE);

    return c.json<ApiCursorPage<GuestPin>>({
      data: await guestPins(db, rows),
      next_cursor: nextCursor(rows)
    });
  }
);

export default app;
