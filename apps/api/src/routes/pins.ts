import type { Pin } from '@qoodish/api-contract';
import { and, eq, ne, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import { type Database, database } from '../db/client.ts';
import { comments, pins } from '../db/schema.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { viewerPins } from '../pins.ts';
import { first, toId } from '../routing.ts';
import {
  notBlockedBy,
  notBlocking,
  referenceablePin,
  visible
} from '../visibility.ts';

async function findPin(db: Database, condition: SQL) {
  return first(await db.select().from(pins).where(condition));
}

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.get('/:id', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const pin = await findPin(
    db,
    and(referenceablePin(viewer), eq(pins.id, toId(c.req.param('id')))) as SQL
  );

  return c.json<Pin>(first(await viewerPins(db, viewer, [pin])));
});

app.get('/:pinId/likes', async (c) => {
  const db = database(c.env.DB);
  await findPin(
    db,
    and(
      referenceablePin(c.get('viewer')),
      eq(pins.id, toId(c.req.param('pinId')))
    ) as SQL
  );

  return c.body(null, 204);
});

app.get('/:pinId/comments/:commentId/likes', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const pin = await findPin(
    db,
    and(
      referenceablePin(viewer),
      eq(pins.id, toId(c.req.param('pinId')))
    ) as SQL
  );
  first(
    await db
      .select({ id: comments.id })
      .from(comments)
      .where(
        and(
          eq(comments.commentableType, 'Pin'),
          eq(comments.commentableId, pin.id),
          eq(comments.id, toId(c.req.param('commentId'))),
          ne(comments.status, 'deleted'),
          visible(comments.id, 'Comment'),
          notBlocking(viewer, comments.userId),
          notBlockedBy(viewer, comments.userId)
        )
      )
  );

  return c.body(null, 204);
});

export default app;
