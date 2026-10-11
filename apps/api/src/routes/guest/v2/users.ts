import type { ApiCursorPage, GuestPin } from '@qoodish/api-contract';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import type { AppEnv } from '../../../app.ts';
import { FEED_PER_PAGE, nextCursor } from '../../../cursor.ts';
import { database } from '../../../db/client.ts';
import { pins } from '../../../db/schema.ts';
import { guestPins } from '../../../pins.ts';
import { feedPage, toId } from '../../../routing.ts';
import { publicPin } from '../../../visibility.ts';

const app = new Hono<AppEnv>();

app.get('/:userId/pins', async (c) => {
  const db = database(c.env.DB);
  const rows = await db
    .select()
    .from(pins)
    .where(
      feedPage(
        c.req.query('cursor'),
        pins.createdAt,
        pins.id,
        and(publicPin(), eq(pins.userId, toId(c.req.param('userId')))) as SQL
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
