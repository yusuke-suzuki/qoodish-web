import type { ApiCursorPage, Pin } from '@qoodish/api-contract';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import { FEED_PER_PAGE, nextCursor } from '../../cursor.ts';
import { database } from '../../db/client.ts';
import { pins } from '../../db/schema.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../../middleware/authenticate-user.ts';
import { viewerPins } from '../../pins.ts';
import { feedPage } from '../../routing.ts';
import { findUser } from '../../users.ts';
import { referenceablePin } from '../../visibility.ts';

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.get('/:userId/pins', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const user = await findUser(db, c.req.param('userId'));
  const rows = await db
    .select()
    .from(pins)
    .where(
      feedPage(
        c.req.query('cursor'),
        pins.createdAt,
        pins.id,
        and(referenceablePin(viewer), eq(pins.userId, user.id)) as SQL
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
