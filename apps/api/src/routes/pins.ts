import type { Pin } from '@qoodish/api-contract';
import { and, eq, ne } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { type Database, database } from '../db/client.ts';
import { comments, pins } from '../db/schema.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { viewerPins } from '../pins.ts';
import { first } from '../routing.ts';
import { id, pathParams } from '../validation.ts';
import {
  notBlockedBy,
  notBlocking,
  referenceablePin,
  type Viewer,
  visible
} from '../visibility.ts';

const pinParams = pathParams(z.object({ pinId: id }));
const commentParams = pathParams(z.object({ pinId: id, commentId: id }));

async function referenceablePinOf(db: Database, viewer: Viewer, pinId: number) {
  return first(
    await db
      .select()
      .from(pins)
      .where(and(referenceablePin(viewer), eq(pins.id, pinId)))
  );
}

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.get('/:id', pathParams(z.object({ id })), async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const pin = await referenceablePinOf(db, viewer, c.req.valid('param').id);

  return c.json<Pin>(first(await viewerPins(db, viewer, [pin])));
});

app.get('/:pinId/likes', pinParams, async (c) => {
  await referenceablePinOf(
    database(c.env.DB),
    c.get('viewer'),
    c.req.valid('param').pinId
  );

  return c.body(null, 204);
});

app.get('/:pinId/comments/:commentId/likes', commentParams, async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const { pinId, commentId } = c.req.valid('param');
  const pin = await referenceablePinOf(db, viewer, pinId);

  first(
    await db
      .select({ id: comments.id })
      .from(comments)
      .where(
        and(
          eq(comments.commentableType, 'Pin'),
          eq(comments.commentableId, pin.id),
          eq(comments.id, commentId),
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
