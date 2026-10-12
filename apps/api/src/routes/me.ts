import type {
  AppMap,
  Chapter,
  ChapterDetail,
  CoauthorshipInvitation,
  Journal,
  Journey,
  JourneySummary,
  Notification,
  Pin,
  Profile,
  WebPushPreferences
} from '@qoodish/api-contract';
import { and, asc, desc, eq, inArray, ne, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import {
  pendingInvitations,
  preferencesInput,
  profile,
  registerDevice,
  unregisterDevice,
  updateWebPush
} from '../accounts.ts';
import { viewerChapterDetails, viewerChapters } from '../chapters.ts';
import { type Database, database } from '../db/client.ts';
import {
  chapters,
  journalBookmarks,
  journals,
  journeys,
  maps,
  pins
} from '../db/schema.ts';
import { ApiError } from '../errors.ts';
import { journalInput, reviseJournal, viewerJournals } from '../journals.ts';
import { journeyDetail, journeySummaries } from '../journeys.ts';
import { viewerMaps } from '../maps.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { readNotification } from '../notifications.ts';
import { discardPin, pinInput, revisePin, viewerPins } from '../pins.ts';
import { first } from '../routing.ts';
import { profileInput, updateProfile } from '../users.ts';
import { id, jsonBody, pathParams } from '../validation.ts';
import {
  bookmarkedBy,
  publicMap,
  type Viewer,
  visible
} from '../visibility.ts';

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

const REGISTRATION_TOKEN_LIMIT = 4096;

const idParams = pathParams(z.object({ id }));

const deviceParams = pathParams(
  z.object({ token: z.string().min(1).max(REGISTRATION_TOKEN_LIMIT) }),
  'BadRequest'
);

async function ownJournal(db: Database, viewer: Viewer): Promise<Journal> {
  return first(
    await viewerJournals(db, viewer, eq(journals.userId, viewer.id))
  );
}

app.get('/profile', async (c) =>
  c.json<Profile>(await profile(database(c.env.DB), c.get('viewer').id))
);

app.on(['PUT', 'PATCH'], '/profile', jsonBody(profileInput), async (c) => {
  const db = database(c.env.DB);
  const userId = c.get('viewer').id;

  await updateProfile(db, userId, c.req.valid('json'));

  return c.json<Profile>(await profile(db, userId));
});

app.get('/journal', async (c) =>
  c.json<Journal>(await ownJournal(database(c.env.DB), c.get('viewer')))
);

app.on(['PUT', 'PATCH'], '/journal', jsonBody(journalInput), async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');

  await reviseJournal(db, viewer.id, c.req.valid('json'));

  return c.json<Journal>(await ownJournal(db, viewer));
});

app.on(
  ['PUT', 'PATCH'],
  '/preferences',
  jsonBody(preferencesInput),
  async (c) =>
    c.json<{ web_push: WebPushPreferences }>({
      web_push: await updateWebPush(
        database(c.env.DB),
        c.get('viewer').id,
        c.req.valid('json').web_push
      )
    })
);

app.on(['PUT', 'PATCH'], '/devices/:token', deviceParams, async (c) => {
  await registerDevice(
    database(c.env.DB),
    c.get('viewer').id,
    c.req.valid('param').token
  );

  return c.body(null, 204);
});

app.delete('/devices/:token', deviceParams, async (c) => {
  await unregisterDevice(
    database(c.env.DB),
    c.get('viewer').id,
    c.req.valid('param').token
  );

  return c.body(null, 204);
});

app.on(['PUT', 'PATCH'], '/notifications/:id', idParams, async (c) =>
  c.json<Notification>(
    await readNotification(
      database(c.env.DB),
      c.get('viewer'),
      c.req.valid('param').id
    )
  )
);

async function ownPin(db: Database, viewer: Viewer, pinId: number) {
  return first(
    await db
      .select()
      .from(pins)
      .where(
        and(
          eq(pins.id, pinId),
          eq(pins.userId, viewer.id),
          eq(pins.status, 'published')
        )
      )
  );
}

app.on(
  ['PUT', 'PATCH'],
  '/pins/:id',
  idParams,
  jsonBody(pinInput),
  async (c) => {
    const db = database(c.env.DB);
    const viewer = c.get('viewer');
    const pinId = c.req.valid('param').id;

    await revisePin(db, () => ownPin(db, viewer, pinId), {
      editorId: viewer.id,
      changes: c.req.valid('json')
    });

    const revised = first(
      await db.select().from(pins).where(eq(pins.id, pinId))
    );

    return c.json<Pin>(first(await viewerPins(db, viewer, [revised])));
  }
);

app.delete('/pins/:id', idParams, async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');

  const pinId = c.req.valid('param').id;

  await discardPin(db, () => ownPin(db, viewer, pinId), viewer.id);

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

function ownChapters(userId: number): SQL | undefined {
  return and(eq(chapters.userId, userId), ne(chapters.status, 'deleted'));
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

app.get('/chapters/:id', idParams, async (c) => {
  const viewer = c.get('viewer');

  return c.json<ChapterDetail>(
    first(
      await viewerChapterDetails(
        database(c.env.DB),
        viewer,
        and(ownChapters(viewer.id), eq(chapters.id, c.req.valid('param').id))
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

app.get('/journeys/:id', idParams, async (c) => {
  const journey = await journeyDetail(
    database(c.env.DB),
    and(
      eq(journeys.userId, c.get('viewer').id),
      eq(journeys.id, c.req.valid('param').id)
    ),
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
    .where(and(publicMap(), inArray(maps.id, bookmarkedBy(viewer))))
    .orderBy(desc(maps.createdAt), asc(maps.id));

  return c.json<AppMap[]>(await viewerMaps(db, viewer, rows));
});

app.get('/bookmarks/journals', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');

  return c.json<Journal[]>(
    await viewerJournals(
      db,
      viewer,
      inArray(
        journals.id,
        db
          .select({ id: journalBookmarks.journalId })
          .from(journalBookmarks)
          .where(eq(journalBookmarks.userId, viewer.id))
      )
    )
  );
});

export default app;
