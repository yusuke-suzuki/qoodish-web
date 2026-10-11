import type {
  ApiCursorPage,
  AppMap,
  Chapter,
  ChapterComment,
  ChapterDetail,
  Coauthor,
  Journal,
  Pin,
  PinProperty,
  UserSummary
} from '@qoodish/api-contract';
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  lt,
  ne,
  type SQL,
  sql
} from 'drizzle-orm';
import { Hono } from 'hono';
import {
  before,
  FEED_PER_PAGE,
  nextCursor,
  normalizeTimestamp
} from '../cursor.ts';
import { type Database, database } from '../db/client.ts';
import {
  chapters,
  comments,
  images,
  journals,
  maps,
  pins,
  users
} from '../db/schema.ts';
import { ApiError } from '../errors.ts';
import { commentsQuery } from '../guest/comments.ts';
import { pinPropertiesOf } from '../guest/maps.ts';
import { userColumns, userSummary } from '../guest/users.ts';
import { feedPage, first, present, toId } from '../routing.ts';
import { searchCondition } from '../search.ts';
import {
  feedChapter,
  feedPin,
  notBlockedBy,
  notBlocking,
  readableChapter,
  recommendableMap,
  referenceableChapter,
  referenceableMap,
  referenceablePin,
  relatedMap,
  shownTo,
  type Viewer,
  visible
} from '../visibility.ts';
import { viewerChapters } from './chapters.ts';
import { viewerComment } from './comments.ts';
import { authenticateUser, type ViewerEnv } from './context.ts';
import { viewerJournals } from './journals.ts';
import { viewerCoauthors, viewerMaps } from './maps.ts';
import { viewerPins } from './pins.ts';
import { userProfile } from './users.ts';

const USER_SEARCH_LIMIT = 20;
const RECOMMENDED_MAPS_LIMIT = 10;

async function findUser(db: Database, param: string | undefined) {
  return first(
    await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, toId(param)))
  );
}

async function findMap(db: Database, condition: SQL) {
  return first(
    await db
      .select({ id: maps.id, userId: maps.userId })
      .from(maps)
      .where(condition)
  );
}

export const usersRoutes = new Hono<ViewerEnv>().get('*', authenticateUser);

usersRoutes.get('/', async (c) => {
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
    .limit(USER_SEARCH_LIMIT);

  return c.json<UserSummary[]>(rows.map(userSummary));
});

usersRoutes.get('/:id', async (c) => {
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

usersRoutes.get('/:userId/maps', async (c) => {
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

usersRoutes.get('/:userId/chapters', async (c) => {
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

usersRoutes.get('/:userId/journal', async (c) => {
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

export const mapsRoutes = new Hono<ViewerEnv>().use(authenticateUser);

mapsRoutes.get('/', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const rows =
    c.req.query('recommend') === undefined
      ? await db
          .select()
          .from(maps)
          .where(relatedMap(viewer))
          .orderBy(desc(maps.createdAt), asc(maps.id))
      : await db
          .select()
          .from(maps)
          .where(recommendableMap(viewer))
          .orderBy(sql`random()`)
          .limit(RECOMMENDED_MAPS_LIMIT);

  return c.json<AppMap[]>(await viewerMaps(db, viewer, rows));
});

mapsRoutes.get('/:id', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const map = first(
    await db
      .select()
      .from(maps)
      .where(
        and(referenceableMap(viewer), eq(maps.id, toId(c.req.param('id'))))
      )
  );

  return c.json<AppMap>(first(await viewerMaps(db, viewer, [map])));
});

mapsRoutes.get('/:mapId/pins', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const rows = await db
    .select()
    .from(pins)
    .where(
      and(referenceablePin(viewer), eq(pins.mapId, toId(c.req.param('mapId'))))
    )
    .orderBy(desc(pins.createdAt), asc(pins.id));

  return c.json<Pin[]>(await viewerPins(db, viewer, rows));
});

mapsRoutes.get('/:mapId/coauthors', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const [map] = await db
    .select({ id: maps.id, userId: maps.userId })
    .from(maps)
    .where(
      and(referenceableMap(viewer), eq(maps.id, toId(c.req.param('mapId'))))
    );

  return c.json<Coauthor[]>(map ? await viewerCoauthors(db, viewer, map) : []);
});

mapsRoutes.get('/:mapId/chapters', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const map = await findMap(
    db,
    and(
      referenceableMap(viewer),
      eq(maps.id, toId(c.req.param('mapId')))
    ) as SQL
  );
  const rows = await db
    .select()
    .from(chapters)
    .where(and(referenceableChapter(viewer), eq(chapters.mapId, map.id)))
    .orderBy(desc(chapters.createdAt), asc(chapters.id));

  return c.json<Chapter[]>(await viewerChapters(db, viewer, rows));
});

mapsRoutes.get('/:mapId/pin_properties', async (c) => {
  const db = database(c.env.DB);
  const map = await findMap(
    db,
    and(
      referenceableMap(c.get('viewer')),
      eq(maps.id, toId(c.req.param('mapId')))
    ) as SQL
  );

  return c.json<PinProperty[]>(await pinPropertiesOf(db, map.id));
});

export const pinsRoutes = new Hono<ViewerEnv>().use(authenticateUser);

async function findPin(db: Database, condition: SQL) {
  return first(await db.select().from(pins).where(condition));
}

pinsRoutes.get('/:id', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const pin = await findPin(
    db,
    and(referenceablePin(viewer), eq(pins.id, toId(c.req.param('id')))) as SQL
  );

  return c.json<Pin>(first(await viewerPins(db, viewer, [pin])));
});

pinsRoutes.get('/:pinId/likes', async (c) => {
  const db = database(c.env.DB);
  await findPin(
    db,
    and(
      referenceablePin(c.get('viewer')),
      eq(pins.id, toId(c.req.param('pinId')))
    ) as SQL
  );

  return c.body(null, 204);
});

pinsRoutes.get('/:pinId/comments/:commentId/likes', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const pin = await findPin(
    db,
    and(
      referenceablePin(viewer),
      eq(pins.id, toId(c.req.param('pinId')))
    ) as SQL
  );
  first(
    await db
      .select({ id: comments.id })
      .from(comments)
      .where(
        and(
          eq(comments.commentableType, 'Pin'),
          eq(comments.commentableId, pin.id),
          eq(comments.id, toId(c.req.param('commentId'))),
          ne(comments.status, 'deleted'),
          visible(comments.id, 'Comment'),
          notBlocking(viewer, comments.userId),
          notBlockedBy(viewer, comments.userId)
        )
      )
  );

  return c.body(null, 204);
});

export const chaptersRoutes = new Hono<ViewerEnv>().use(authenticateUser);

function chapterFeedBefore(
  nextTimestamp: string,
  nextId: string | undefined
): SQL {
  const createdAt = normalizeTimestamp(nextTimestamp);

  if (!present(nextId)) {
    return lt(chapters.createdAt, createdAt);
  }

  return before(
    { createdAt, id: toId(nextId) },
    chapters.createdAt,
    chapters.id
  );
}

chaptersRoutes.get('/', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const { next_timestamp: nextTimestamp, next_id: nextId } = c.req.query();
  const rows = await db
    .select()
    .from(chapters)
    .where(
      and(
        feedChapter(viewer),
        nextTimestamp === undefined
          ? undefined
          : chapterFeedBefore(nextTimestamp, nextId)
      )
    )
    .orderBy(desc(chapters.createdAt), desc(chapters.id))
    .limit(FEED_PER_PAGE);

  return c.json<Chapter[]>(await viewerChapters(db, viewer, rows));
});

async function findReadableChapter(
  db: Database,
  viewer: Viewer,
  param: string | undefined
) {
  return first(
    await db
      .select()
      .from(chapters)
      .where(and(readableChapter(viewer), eq(chapters.id, toId(param))))
  );
}

chaptersRoutes.get('/:id', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const { commentsCount, ...chapter } = first(
    await db
      .select({
        ...getTableColumns(chapters),
        commentsCount: db.$count(
          comments,
          and(
            eq(comments.commentableType, 'Chapter'),
            eq(comments.commentableId, chapters.id),
            ne(comments.status, 'deleted'),
            shownTo(viewer, comments.userId)
          )
        )
      })
      .from(chapters)
      .where(
        and(readableChapter(viewer), eq(chapters.id, toId(c.req.param('id'))))
      )
  );

  return c.json<ChapterDetail>({
    ...first(await viewerChapters(db, viewer, [chapter])),
    comments_count: commentsCount
  });
});

chaptersRoutes.get('/:chapterId/comments', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const chapter = await findReadableChapter(
    db,
    viewer,
    c.req.param('chapterId')
  );
  const rows = await commentsQuery(db, 'Chapter', [chapter.id], {
    visibleOnly: false,
    condition: shownTo(viewer, comments.userId),
    viewerId: viewer.id
  });

  return c.json<ChapterComment[]>(
    rows.map((row) => ({
      ...viewerComment(row),
      editable: row.userId === viewer.id
    }))
  );
});

export const journalsRoutes = new Hono<ViewerEnv>().use(authenticateUser);

journalsRoutes.get('/:id', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');

  return c.json<Journal>(
    first(
      await viewerJournals(
        db,
        viewer,
        and(
          eq(journals.id, toId(c.req.param('id'))),
          notBlocking(viewer, journals.userId)
        ) as SQL
      )
    )
  );
});

export const v2Routes = new Hono<ViewerEnv>().use(authenticateUser);

v2Routes.get('/pins', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const rows = await db
    .select()
    .from(pins)
    .where(
      feedPage(c.req.query('cursor'), pins.createdAt, pins.id, feedPin(viewer))
    )
    .orderBy(desc(pins.createdAt), desc(pins.id))
    .limit(FEED_PER_PAGE);

  return c.json<ApiCursorPage<Pin>>({
    data: await viewerPins(db, viewer, rows),
    next_cursor: nextCursor(rows)
  });
});

v2Routes.get('/users/:userId/pins', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const user = await findUser(db, c.req.param('userId'));
  const rows = await db
    .select()
    .from(pins)
    .where(
      feedPage(
        c.req.query('cursor'),
        pins.createdAt,
        pins.id,
        and(referenceablePin(viewer), eq(pins.userId, user.id)) as SQL
      )
    )
    .orderBy(desc(pins.createdAt), desc(pins.id))
    .limit(FEED_PER_PAGE);

  return c.json<ApiCursorPage<Pin>>({
    data: await viewerPins(db, viewer, rows),
    next_cursor: nextCursor(rows)
  });
});
