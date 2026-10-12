import type {
  AppMap,
  Chapter,
  Journal,
  Profile,
  UserProfile,
  UserSummary
} from '@qoodish/api-contract';
import { and, asc, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { profile } from '../accounts.ts';
import { blockUser, unblockUser } from '../blocks.ts';
import { viewerChapters } from '../chapters.ts';
import type { Database } from '../db/client.ts';
import { chapters, images, journals, maps, users } from '../db/schema.ts';
import { ApiError } from '../errors.ts';
import { viewerJournals } from '../journals.ts';
import { viewerMaps } from '../maps.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { muteUser, unmuteUser } from '../mutes.ts';
import { first } from '../routing.ts';
import { SEARCH_LIMIT, searchCondition } from '../search.ts';
import {
  findUser,
  signIn,
  userColumns,
  userProfile,
  userSummary
} from '../users.ts';
import { id, pathParams, queryParams, searchInput } from '../validation.ts';
import {
  notBlocking,
  referenceableChapter,
  referenceableMap,
  type Viewer
} from '../visibility.ts';

const userParams = pathParams(z.object({ userId: id }));

const app = new Hono<ViewerEnv>();

app.get('*', authenticateUser);

app.post('/', async (c) => {
  const db = c.get('db');
  const { sub, name, email } = c.get('idToken');
  const userId = await signIn(db, {
    uid: sub,
    name,
    email,
    locale: c.get('language')
  });

  return c.json<Profile>(await profile(db, userId));
});

app.get('/', queryParams(z.object({ q: searchInput })), async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const { q } = c.req.valid('query');
  const matched =
    q !== undefined
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

app.get('/:id', pathParams(z.object({ id })), async (c) =>
  c.json<UserProfile>(
    await relatedProfile(c.get('db'), c.get('viewer'), c.req.valid('param').id)
  )
);

function including(ids: ReadonlySet<number>, id: number) {
  return new Set([...ids, id]);
}

function excluding(ids: ReadonlySet<number>, id: number) {
  return new Set([...ids].filter((other) => other !== id));
}

async function relatedProfile(
  db: Database,
  viewer: Viewer,
  userId: number
): Promise<UserProfile> {
  const related = await userProfile(db, viewer, userId);

  if (!related) {
    throw new ApiError('NotFound');
  }

  return related;
}

app.post('/:userId/block', authenticateUser, userParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const user = await findUser(db, c.req.valid('param').userId);

  await blockUser(db, { blockerId: viewer.id, blockedId: user.id });

  return c.json<UserProfile>(
    await relatedProfile(
      db,
      { ...viewer, blocking: including(viewer.blocking, user.id) },
      user.id
    )
  );
});

app.delete('/:userId/block', authenticateUser, userParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const user = await findUser(db, c.req.valid('param').userId);

  await unblockUser(db, { blockerId: viewer.id, blockedId: user.id });

  return c.json<UserProfile>(
    await relatedProfile(
      db,
      { ...viewer, blocking: excluding(viewer.blocking, user.id) },
      user.id
    )
  );
});

app.post('/:userId/mute', authenticateUser, userParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const user = await findUser(db, c.req.valid('param').userId);

  await muteUser(db, { muterId: viewer.id, mutedId: user.id });

  return c.json<UserProfile>(
    await relatedProfile(
      db,
      { ...viewer, muting: including(viewer.muting, user.id) },
      user.id
    )
  );
});

app.delete('/:userId/mute', authenticateUser, userParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const user = await findUser(db, c.req.valid('param').userId);

  await unmuteUser(db, { muterId: viewer.id, mutedId: user.id });

  return c.json<UserProfile>(
    await relatedProfile(
      db,
      { ...viewer, muting: excluding(viewer.muting, user.id) },
      user.id
    )
  );
});

app.get('/:userId/maps', userParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const user = await findUser(db, c.req.valid('param').userId);
  const rows = await db
    .select()
    .from(maps)
    .where(and(referenceableMap(viewer), eq(maps.userId, user.id)))
    .orderBy(desc(maps.createdAt), asc(maps.id));

  return c.json<AppMap[]>(await viewerMaps(db, viewer, rows));
});

app.get('/:userId/chapters', userParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const user = await findUser(db, c.req.valid('param').userId);
  const rows = await db
    .select()
    .from(chapters)
    .where(and(referenceableChapter(viewer), eq(chapters.userId, user.id)))
    .orderBy(desc(chapters.createdAt), asc(chapters.id));

  return c.json<Chapter[]>(await viewerChapters(db, viewer, rows));
});

app.get('/:userId/journal', userParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const user = await findUser(db, c.req.valid('param').userId);

  return c.json<Journal>(
    first(
      await viewerJournals(
        db,
        viewer,
        and(eq(journals.userId, user.id), notBlocking(viewer, journals.userId))
      )
    )
  );
});

export default app;
