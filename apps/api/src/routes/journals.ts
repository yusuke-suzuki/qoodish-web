import type { Journal } from '@qoodish/api-contract';
import { and, eq, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import { database } from '../db/client.ts';
import { journals } from '../db/schema.ts';
import { viewerJournals } from '../journals.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { first, toId } from '../routing.ts';
import { notBlocking } from '../visibility.ts';

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.get('/:id', async (c) => {
  const viewer = c.get('viewer');

  return c.json<Journal>(
    first(
      await viewerJournals(
        database(c.env.DB),
        viewer,
        and(
          eq(journals.id, toId(c.req.param('id'))),
          notBlocking(viewer, journals.userId)
        ) as SQL
      )
    )
  );
});

export default app;
