import type { Journal } from '@qoodish/api-contract';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { bookmarkJournal, unbookmarkJournal } from '../bookmarks.ts';
import { journals } from '../db/schema.ts';
import { viewerJournals } from '../journals.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { first } from '../routing.ts';
import { id, pathParams } from '../validation.ts';
import { notBlocking } from '../visibility.ts';

const journalParams = pathParams(z.object({ journalId: id }));

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.get('/:id', pathParams(z.object({ id })), async (c) => {
  const viewer = c.get('viewer');

  return c.json<Journal>(
    first(
      await viewerJournals(
        c.get('db'),
        viewer,
        and(
          eq(journals.id, c.req.valid('param').id),
          notBlocking(viewer, journals.userId)
        )
      )
    )
  );
});

app.post('/:journalId/bookmark', journalParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const { journalId } = c.req.valid('param');

  await bookmarkJournal(db, viewer.id, journalId);

  return c.json<Journal>(
    first(await viewerJournals(db, viewer, eq(journals.id, journalId)))
  );
});

app.delete('/:journalId/bookmark', journalParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const { journalId } = c.req.valid('param');

  await unbookmarkJournal(db, { userId: viewer.id, journalId });

  return c.json<Journal>(
    first(await viewerJournals(db, viewer, eq(journals.id, journalId)))
  );
});

export default app;
