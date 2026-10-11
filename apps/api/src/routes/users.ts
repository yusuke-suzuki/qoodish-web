import type {
  AppMap,
  Chapter,
  Journal,
  Profile,
  UserSummary
} from '@qoodish/api-contract';
import { and, asc, desc, eq, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import { profile } from '../accounts.ts';
import { viewerChapters } from '../chapters.ts';
import { database } from '../db/client.ts';
import { chapters, images, journals, maps, users } from '../db/schema.ts';
import { ApiError } from '../errors.ts';
import { viewerJournals } from '../journals.ts';
import { viewerMaps } from '../maps.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { first, present, toId } from '../routing.ts';
import { SEARCH_LIMIT, searchCondition } from '../search.ts';
import {
  findUser,
  signIn,
  userColumns,
  userProfile,
  userSummary
} from '../users.ts';
import {
  notBlocking,
  referenceableChapter,
  referenceableMap
} from '../visibility.ts';

const app = new Hono<ViewerEnv>();

app.get('*', authenticateUser);

app.post('/', async (c) => {
  const db = database(c.env.DB);
  const { sub, name, email } = c.get('idToken');
  const userId = await signIn(db, {
    uid: sub,
    name,
    email,
    locale: c.get('language')
  });

  return c.json<Profile>(await profile(db, userId));
});

app.get('/', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const q = c.req.query('q');
  const matched = present(q)
    ? searchCondition(q, {
        index: 'users_fts',
        id: users.id,
        columns: ['name']
      })
    : null;

  if (!matched) {
    return c.json<UserSummary[]>([]);
  }

  const rows = await db
    .select(userColumns)
    .from(users)
    .leftJoin(images, eq(images.id, users.imageId))
    .where(and(matched, notBlocking(viewer, users.id)))
    .orderBy(desc(users.createdAt), desc(users.id))
    .limit(SEARCH_LIMIT);

  return c.json<UserSummary[]>(rows.map(userSummary));
});

app.get('/:id', async (c) => {
  const profile = await userProfile(
    database(c.env.DB),
    c.get('viewer'),
    toId(c.req.param('id'))
  );

  if (!profile) {
    throw new ApiError('NotFound');
  }

  return c.json(profile);
});

app.get('/:userId/maps', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const user = await findUser(db, c.req.param('userId'));
  const rows = await db
    .select()
    .from(maps)
    .where(and(referenceableMap(viewer), eq(maps.userId, user.id)))
    .orderBy(desc(maps.createdAt), asc(maps.id));

  return c.json<AppMap[]>(await viewerMaps(db, viewer, rows));
});

app.get('/:userId/chapters', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const user = await findUser(db, c.req.param('userId'));
  const rows = await db
    .select()
    .from(chapters)
    .where(and(referenceableChapter(viewer), eq(chapters.userId, user.id)))
    .orderBy(desc(chapters.createdAt), asc(chapters.id));

  return c.json<Chapter[]>(await viewerChapters(db, viewer, rows));
});

app.get('/:userId/journal', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const user = await findUser(db, c.req.param('userId'));

  return c.json<Journal>(
    first(
      await viewerJournals(
        db,
        viewer,
        and(
          eq(journals.userId, user.id),
          notBlocking(viewer, journals.userId)
        ) as SQL
      )
    )
  );
});

export default app;
