import type {
  ApiCursorPage,
  AppMap,
  Chapter,
  ChapterDetail,
  CoauthorshipInvitation,
  Journal,
  Journey,
  JourneySummary,
  ModeratedAccount,
  NotificationGroup,
  Pin,
  Profile
} from '@qoodish/api-contract';
import { and, asc, desc, eq, ne, type SQL, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { FEED_PER_PAGE, nextCursor } from '../cursor.ts';
import { database } from '../db/client.ts';
import {
  bookmarks,
  chapters,
  journalBookmarks,
  journals,
  journeys,
  maps,
  pins
} from '../db/schema.ts';
import { ApiError } from '../errors.ts';
import { feedPage, first, present, toId } from '../routing.ts';
import { publicMap, visible } from '../visibility.ts';
import {
  blockedAccounts,
  mutedAccounts,
  pendingInvitations,
  profile
} from './accounts.ts';
import { viewerChapterDetails, viewerChapters } from './chapters.ts';
import { authenticateUser, type ViewerEnv } from './context.ts';
import { viewerJournals } from './journals.ts';
import { journeyDetail, journeySummaries } from './journeys.ts';
import { viewerMaps } from './maps.ts';
import { notificationGroups } from './notifications.ts';
import { viewerPins } from './pins.ts';

const FALSE_PARAMS = new Set(['0', 'f', 'F', 'false', 'FALSE', 'off', 'OFF']);

function pageCursor(param: string | undefined): number | null {
  return present(param) ? toId(param) : null;
}

export const meRoutes = new Hono<ViewerEnv>().use(authenticateUser);

meRoutes.get('/profile', async (c) =>
  c.json<Profile>(await profile(database(c.env.DB), c.get('viewer').id))
);

meRoutes.get('/journal', async (c) => {
  const viewer = c.get('viewer');

  return c.json<Journal>(
    first(
      await viewerJournals(
        database(c.env.DB),
        viewer,
        eq(journals.userId, viewer.id)
      )
    )
  );
});

meRoutes.get('/maps', async (c) => {
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

meRoutes.get('/chapters', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const rows = await db
    .select()
    .from(chapters)
    .where(ownChapters(viewer.id))
    .orderBy(desc(chapters.createdAt), asc(chapters.id));

  return c.json<Chapter[]>(await viewerChapters(db, viewer, rows));
});

meRoutes.get('/chapters/:id', async (c) => {
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

meRoutes.get('/coauthorship_invitations', async (c) =>
  c.json<CoauthorshipInvitation[]>(
    await pendingInvitations(database(c.env.DB), c.get('viewer').id)
  )
);

meRoutes.get('/journeys', async (c) =>
  c.json<JourneySummary[]>(
    await journeySummaries(database(c.env.DB), c.get('viewer').id)
  )
);

meRoutes.get('/journeys/:id', async (c) => {
  const journey = await journeyDetail(
    database(c.env.DB),
    and(
      eq(journeys.userId, c.get('viewer').id),
      eq(journeys.id, toId(c.req.param('id')))
    ) as SQL,
    {
      primaryKey: c.env.AR_ENCRYPTION_PRIMARY_KEY,
      keyDerivationSalt: c.env.AR_ENCRYPTION_KEY_DERIVATION_SALT
    }
  );

  if (!journey) {
    throw new ApiError('NotFound');
  }

  return c.json<Journey>(journey);
});

meRoutes.get('/bookmarks/maps', async (c) => {
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

meRoutes.get('/bookmarks/journals', async (c) => {
  const viewer = c.get('viewer');

  return c.json<Journal[]>(
    await viewerJournals(
      database(c.env.DB),
      viewer,
      sql`${journals.id} IN (SELECT ${journalBookmarks.journalId} FROM ${journalBookmarks} WHERE ${journalBookmarks.userId} = ${viewer.id})`
    )
  );
});

export const meV2Routes = new Hono<ViewerEnv>();

meV2Routes.get('/notifications', async (c) => {
  const read = c.req.query('read');

  return c.json<ApiCursorPage<NotificationGroup>>(
    await notificationGroups(database(c.env.DB), c.get('viewer'), {
      cursor: pageCursor(c.req.query('cursor')),
      unread: read !== undefined && FALSE_PARAMS.has(read)
    })
  );
});

meV2Routes.get('/pins', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const rows = await db
    .select()
    .from(pins)
    .where(
      feedPage(
        c.req.query('cursor'),
        pins.createdAt,
        pins.id,
        and(
          eq(pins.userId, viewer.id),
          eq(pins.status, 'published'),
          visible(pins.id, 'Pin')
        ) as SQL
      )
    )
    .orderBy(desc(pins.createdAt), desc(pins.id))
    .limit(FEED_PER_PAGE);

  return c.json<ApiCursorPage<Pin>>({
    data: await viewerPins(db, viewer, rows),
    next_cursor: nextCursor(rows)
  });
});

meV2Routes.get('/blocks', async (c) =>
  c.json<ApiCursorPage<ModeratedAccount>>(
    await blockedAccounts(
      database(c.env.DB),
      c.get('viewer').id,
      pageCursor(c.req.query('cursor'))
    )
  )
);

meV2Routes.get('/mutes', async (c) =>
  c.json<ApiCursorPage<ModeratedAccount>>(
    await mutedAccounts(
      database(c.env.DB),
      c.get('viewer').id,
      pageCursor(c.req.query('cursor'))
    )
  )
);
