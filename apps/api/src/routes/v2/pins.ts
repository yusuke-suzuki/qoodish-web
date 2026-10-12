import type { ApiCursorPage, Pin } from '@qoodish/api-contract';
import { desc } from 'drizzle-orm';
import { Hono } from 'hono';
import { FEED_PER_PAGE, nextCursor } from '../../cursor.ts';
import { pins } from '../../db/schema.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../../middleware/authenticate-user.ts';
import { viewerPins } from '../../pins.ts';
import { feedPage } from '../../routing.ts';
import { feedCursorQuery } from '../../validation.ts';
import { feedPin } from '../../visibility.ts';

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.get('/', feedCursorQuery, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const rows = await db
    .select()
    .from(pins)
    .where(
      feedPage(
        c.req.valid('query').cursor,
        pins.createdAt,
        pins.id,
        feedPin(viewer)
      )
    )
    .orderBy(desc(pins.createdAt), desc(pins.id))
    .limit(FEED_PER_PAGE);

  return c.json<ApiCursorPage<Pin>>({
    data: await viewerPins(db, viewer, rows),
    next_cursor: nextCursor(rows)
  });
});

export default app;
