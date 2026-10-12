import type { Journal } from '@qoodish/api-contract';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { database } from '../db/client.ts';
import { journals } from '../db/schema.ts';
import { viewerJournals } from '../journals.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { first } from '../routing.ts';
import { id, pathParams } from '../validation.ts';
import { notBlocking } from '../visibility.ts';

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.get('/:id', pathParams(z.object({ id })), async (c) => {
  const viewer = c.get('viewer');

  return c.json<Journal>(
    first(
      await viewerJournals(
        database(c.env.DB),
        viewer,
        and(
          eq(journals.id, c.req.valid('param').id),
          notBlocking(viewer, journals.userId)
        )
      )
    )
  );
});

export default app;
