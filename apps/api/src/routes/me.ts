import type {
  AppMap,
  Chapter,
  ChapterDetail,
  CoauthorshipInvitation,
  Journal,
  Journey,
  JourneySummary,
  Profile,
  WebPushPreferences
} from '@qoodish/api-contract';
import { and, asc, desc, eq, ne, type SQL, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import {
  pendingInvitations,
  profile,
  registerDevice,
  unregisterDevice,
  updateWebPush
} from '../accounts.ts';
import { viewerChapterDetails, viewerChapters } from '../chapters.ts';
import { type Database, database } from '../db/client.ts';
import {
  bookmarks,
  chapters,
  journalBookmarks,
  journals,
  journeys,
  maps
} from '../db/schema.ts';
import { ApiError } from '../errors.ts';
import { reviseJournal, viewerJournals } from '../journals.ts';
import { journeyDetail, journeySummaries } from '../journeys.ts';
import { viewerMaps } from '../maps.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { first, jsonInput, toId } from '../routing.ts';
import { updateProfile } from '../users.ts';
import { publicMap, type Viewer, visible } from '../visibility.ts';

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

const profileChanges = z.object({
  name: z.string().optional(),
  biography: z.string().nullable().optional(),
  image_ids: z.array(z.coerce.number().int()).optional()
});

const journalChanges = z.object({
  title: z.string().optional(),
  description: z.string().nullable().optional()
});

const preferenceChanges = z.object({
  web_push: z
    .record(z.string(), z.unknown())
    .refine((changes) => Object.keys(changes).length > 0)
});

async function ownJournal(db: Database, viewer: Viewer): Promise<Journal> {
  return first(
    await viewerJournals(db, viewer, eq(journals.userId, viewer.id))
  );
}

app.get('/profile', async (c) =>
  c.json<Profile>(await profile(database(c.env.DB), c.get('viewer').id))
);

app.on(['PUT', 'PATCH'], '/profile', jsonInput(profileChanges), async (c) => {
  const db = database(c.env.DB);
  const userId = c.get('viewer').id;
  const { name, biography, image_ids } = c.req.valid('json');

  await updateProfile(db, userId, {
    name,
    biography,
    imageId: image_ids === undefined ? undefined : (image_ids[0] ?? null)
  });

  return c.json<Profile>(await profile(db, userId));
});

app.get('/journal', async (c) =>
  c.json<Journal>(await ownJournal(database(c.env.DB), c.get('viewer')))
);

app.on(['PUT', 'PATCH'], '/journal', jsonInput(journalChanges), async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');

  await reviseJournal(db, viewer.id, c.req.valid('json'));

  return c.json<Journal>(await ownJournal(db, viewer));
});

app.on(
  ['PUT', 'PATCH'],
  '/preferences',
  jsonInput(preferenceChanges),
  async (c) =>
    c.json<{ web_push: WebPushPreferences }>({
      web_push: await updateWebPush(
        database(c.env.DB),
        c.get('viewer').id,
        c.req.valid('json').web_push
      )
    })
);

app.on(['PUT', 'PATCH'], '/devices/:token', async (c) => {
  await registerDevice(
    database(c.env.DB),
    c.get('viewer').id,
    c.req.param('token')
  );

  return c.body(null, 204);
});

app.delete('/devices/:token', async (c) => {
  await unregisterDevice(
    database(c.env.DB),
    c.get('viewer').id,
    c.req.param('token')
  );

  return c.body(null, 204);
});

app.get('/maps', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const rows = await db
    .select()
    .from(maps)
    .where(
      and(
        eq(maps.userId, viewer.id),
        eq(maps.status, 'published'),
        visible(maps.id, 'Map')
      )
    )
    .orderBy(desc(maps.createdAt), asc(maps.id));

  return c.json<AppMap[]>(await viewerMaps(db, viewer, rows));
});

function ownChapters(userId: number): SQL {
  return and(
    eq(chapters.userId, userId),
    ne(chapters.status, 'deleted')
  ) as SQL;
}

app.get('/chapters', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const rows = await db
    .select()
    .from(chapters)
    .where(ownChapters(viewer.id))
    .orderBy(desc(chapters.createdAt), asc(chapters.id));

  return c.json<Chapter[]>(await viewerChapters(db, viewer, rows));
});

app.get('/chapters/:id', async (c) => {
  const viewer = c.get('viewer');

  return c.json<ChapterDetail>(
    first(
      await viewerChapterDetails(
        database(c.env.DB),
        viewer,
        and(
          ownChapters(viewer.id),
          eq(chapters.id, toId(c.req.param('id')))
        ) as SQL
      )
    )
  );
});

app.get('/coauthorship_invitations', async (c) =>
  c.json<CoauthorshipInvitation[]>(
    await pendingInvitations(database(c.env.DB), c.get('viewer').id)
  )
);

app.get('/journeys', async (c) =>
  c.json<JourneySummary[]>(
    await journeySummaries(database(c.env.DB), c.get('viewer').id)
  )
);

app.get('/journeys/:id', async (c) => {
  const journey = await journeyDetail(
    database(c.env.DB),
    and(
      eq(journeys.userId, c.get('viewer').id),
      eq(journeys.id, toId(c.req.param('id')))
    ) as SQL,
    {
      primaryKey: c.env.ENCRYPTION_PRIMARY_KEY,
      keyDerivationSalt: c.env.ENCRYPTION_KEY_DERIVATION_SALT
    }
  );

  if (!journey) {
    throw new ApiError('NotFound');
  }

  return c.json<Journey>(journey);
});

app.get('/bookmarks/maps', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const rows = await db
    .select()
    .from(maps)
    .where(
      and(
        publicMap(),
        sql`${maps.id} IN (SELECT ${bookmarks.mapId} FROM ${bookmarks} WHERE ${bookmarks.userId} = ${viewer.id})`
      )
    )
    .orderBy(desc(maps.createdAt), asc(maps.id));

  return c.json<AppMap[]>(await viewerMaps(db, viewer, rows));
});

app.get('/bookmarks/journals', async (c) => {
  const viewer = c.get('viewer');

  return c.json<Journal[]>(
    await viewerJournals(
      database(c.env.DB),
      viewer,
      sql`${journals.id} IN (SELECT ${journalBookmarks.journalId} FROM ${journalBookmarks} WHERE ${journalBookmarks.userId} = ${viewer.id})`
    )
  );
});

export default app;
