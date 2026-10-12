import type { GuestChapter } from '@qoodish/api-contract';
import { and, asc, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../app.ts';
import { guestChapters } from '../../chapters.ts';
import { database } from '../../db/client.ts';
import { chapters, maps } from '../../db/schema.ts';
import { ApiError } from '../../errors.ts';
import { guestMaps } from '../../maps.ts';
import { guestProfile } from '../../users.ts';
import { id, pathParams } from '../../validation.ts';
import { publicChapter, publicMap } from '../../visibility.ts';

const userParams = pathParams(z.object({ userId: id }));

const app = new Hono<AppEnv>();

app.get('/:id', pathParams(z.object({ id })), async (c) => {
  const profile = await guestProfile(
    database(c.env.DB),
    c.req.valid('param').id
  );

  if (!profile) {
    throw new ApiError('NotFound');
  }

  return c.json(profile);
});

app.get('/:userId/maps', userParams, async (c) => {
  const db = database(c.env.DB);
  const rows = await db
    .select()
    .from(maps)
    .where(and(publicMap(), eq(maps.userId, c.req.valid('param').userId)))
    .orderBy(desc(maps.createdAt), asc(maps.id));

  return c.json(await guestMaps(db, rows));
});

app.get('/:userId/chapters', userParams, async (c) => {
  const db = database(c.env.DB);
  const rows = await db
    .select()
    .from(chapters)
    .where(
      and(publicChapter(), eq(chapters.userId, c.req.valid('param').userId))
    )
    .orderBy(desc(chapters.createdAt), asc(chapters.id));

  return c.json<GuestChapter[]>(await guestChapters(db, rows));
});

export default app;
