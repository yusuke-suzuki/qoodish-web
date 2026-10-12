import type { ApiCursorPage, Pin } from '@qoodish/api-contract';
import { and, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { FEED_PER_PAGE, nextCursor } from '../../cursor.ts';
import { pins } from '../../db/schema.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../../middleware/authenticate-user.ts';
import { requireUser } from '../../middleware/require-user.ts';
import { viewerPins } from '../../pins.ts';
import { feedPage } from '../../routing.ts';
import { feedCursorQuery, id, pathParams } from '../../validation.ts';
import { referenceablePin } from '../../visibility.ts';

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.get(
  '/:userId/pins',
  pathParams(z.object({ userId: id })),
  requireUser,
  feedCursorQuery,
  async (c) => {
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
          and(
            referenceablePin(viewer),
            eq(pins.userId, c.req.valid('param').userId)
          )
        )
      )
      .orderBy(desc(pins.createdAt), desc(pins.id))
      .limit(FEED_PER_PAGE);

    return c.json<ApiCursorPage<Pin>>({
      data: await viewerPins(db, viewer, rows),
      next_cursor: nextCursor(rows)
    });
  }
);

export default app;
