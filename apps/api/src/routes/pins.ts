import type { Pin } from '@qoodish/api-contract';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { interactableComment } from '../comments.ts';
import { type Database, database } from '../db/client.ts';
import { pins } from '../db/schema.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { viewerPins } from '../pins.ts';
import { first } from '../routing.ts';
import { id, pathParams } from '../validation.ts';
import { referenceablePin, type Viewer } from '../visibility.ts';
import { like, unlike } from '../votes.ts';

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

async function pinComment(
  db: Database,
  viewer: Viewer,
  params: { pinId: number; commentId: number }
) {
  const pin = await referenceablePinOf(db, viewer, params.pinId);
  const comment = await interactableComment(db, viewer, {
    type: 'Pin',
    commentableId: pin.id,
    commentId: params.commentId
  });

  return { pin, comment };
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

app.post('/:pinId/like', pinParams, async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const pin = await referenceablePinOf(db, viewer, c.req.valid('param').pinId);

  await like(db, viewer.id, { type: 'Pin', id: pin.id, userId: pin.userId });

  return c.json<Pin>(first(await viewerPins(db, viewer, [pin])));
});

app.delete('/:pinId/like', pinParams, async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const pin = await referenceablePinOf(db, viewer, c.req.valid('param').pinId);

  await unlike(db, viewer.id, { type: 'Pin', id: pin.id });

  return c.json<Pin>(first(await viewerPins(db, viewer, [pin])));
});

app.get('/:pinId/comments/:commentId/likes', commentParams, async (c) => {
  await pinComment(database(c.env.DB), c.get('viewer'), c.req.valid('param'));

  return c.body(null, 204);
});

app.post('/:pinId/comments/:commentId/like', commentParams, async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const { pin, comment } = await pinComment(db, viewer, c.req.valid('param'));

  await like(db, viewer.id, {
    type: 'Comment',
    id: comment.id,
    userId: comment.userId
  });

  return c.json<Pin>(first(await viewerPins(db, viewer, [pin])));
});

app.delete('/:pinId/comments/:commentId/like', commentParams, async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const { pin, comment } = await pinComment(db, viewer, c.req.valid('param'));

  await unlike(db, viewer.id, { type: 'Comment', id: comment.id });

  return c.json<Pin>(first(await viewerPins(db, viewer, [pin])));
});

export default app;
