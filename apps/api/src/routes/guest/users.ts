import type { GuestChapter } from '@qoodish/api-contract';
import { and, asc, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import type { AppEnv } from '../../app.ts';
import { guestChapters } from '../../chapters.ts';
import { database } from '../../db/client.ts';
import { chapters, maps } from '../../db/schema.ts';
import { ApiError } from '../../errors.ts';
import { guestMaps } from '../../maps.ts';
import { toId } from '../../routing.ts';
import { guestProfile } from '../../users.ts';
import { publicChapter, publicMap } from '../../visibility.ts';

const app = new Hono<AppEnv>();

app.get('/:id', async (c) => {
  const profile = await guestProfile(
    database(c.env.DB),
    toId(c.req.param('id'))
  );

  if (!profile) {
    throw new ApiError('NotFound');
  }

  return c.json(profile);
});

app.get('/:userId/maps', async (c) => {
  const db = database(c.env.DB);
  const rows = await db
    .select()
    .from(maps)
    .where(and(publicMap(), eq(maps.userId, toId(c.req.param('userId')))))
    .orderBy(desc(maps.createdAt), asc(maps.id));

  return c.json(await guestMaps(db, rows));
});

app.get('/:userId/chapters', async (c) => {
  const db = database(c.env.DB);
  const rows = await db
    .select()
    .from(chapters)
    .where(
      and(publicChapter(), eq(chapters.userId, toId(c.req.param('userId'))))
    )
    .orderBy(desc(chapters.createdAt), asc(chapters.id));

  return c.json<GuestChapter[]>(await guestChapters(db, rows));
});

export default app;
