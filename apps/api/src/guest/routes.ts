import type {
  ApiCursorPage,
  GuestChapter,
  GuestChapterDetail,
  GuestCoauthor,
  GuestPin,
  PinProperty
} from '@qoodish/api-contract';
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ne,
  type SQL,
  sql
} from 'drizzle-orm';
import { Hono } from 'hono';
import type { AppEnv } from '../app.ts';
import { before, decodeCursor, FEED_PER_PAGE, nextCursor } from '../cursor.ts';
import { database, inIds } from '../db/client.ts';
import {
  bookmarks,
  chapters,
  coauthorships,
  comments,
  featuredMaps,
  images,
  maps,
  pinProperties,
  pinPropertyOptions,
  pins,
  users,
  votes
} from '../db/schema.ts';
import { ApiError } from '../errors.ts';
import { primaryImage } from '../images.ts';
import { searchCondition } from '../search.ts';
import { publicChapter, publicMap, publicPin } from '../visibility.ts';
import { chapterSearchResults, guestChapters } from './chapters.ts';
import { commentsQuery, guestComment } from './comments.ts';
import { guestMaps } from './maps.ts';
import { guestPins } from './pins.ts';
import { guestProfile } from './users.ts';

const SEARCH_LIMIT = 20;
const RECENT_MAPS_LIMIT = 12;
const ACTIVE_MAPS_LIMIT = 12;
const POPULAR_LIMIT = 10;
const RECOMMENDED_MAPS_LIMIT = 10;
const RECENT_PINS_LIMIT = 8;

function toId(param: string | undefined): number {
  const id = Number.parseInt(param ?? '', 10);

  return Number.isNaN(id) ? 0 : id;
}

function present(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function first<Row>(rows: readonly Row[]): Row {
  const [row] = rows;

  if (row === undefined) {
    throw new ApiError('NotFound');
  }

  return row;
}

export const guest = new Hono<AppEnv>();

guest.get('/maps', async (c) => {
  const db = database(c.env.DB);
  const { input, recent, active, popular, recommend } = c.req.query();
  const publicMaps = db.select(getTableColumns(maps)).from(maps);

  if (present(input)) {
    const matched = searchCondition(input, {
      index: 'maps_fts',
      id: maps.id,
      columns: [maps.name, maps.description]
    });

    if (!matched) {
      return c.json([]);
    }

    return c.json(
      await guestMaps(
        db,
        await publicMaps
          .where(and(publicMap(), matched))
          .orderBy(desc(maps.createdAt), desc(maps.id))
          .limit(SEARCH_LIMIT)
      )
    );
  }

  if (present(recent)) {
    return c.json(
      await guestMaps(
        db,
        await publicMaps
          .where(publicMap())
          .orderBy(desc(maps.createdAt), desc(maps.id))
          .limit(RECENT_MAPS_LIMIT)
      )
    );
  }

  if (active !== undefined) {
    return c.json(
      await guestMaps(
        db,
        await publicMaps
          .leftJoin(
            pins,
            and(eq(pins.mapId, maps.id), eq(pins.status, 'published'))
          )
          .where(publicMap())
          .groupBy(maps.id)
          .orderBy(sql`max(${pins.createdAt}) DESC`, asc(maps.id))
          .limit(ACTIVE_MAPS_LIMIT)
      )
    );
  }

  if (popular !== undefined) {
    return c.json(
      await guestMaps(
        db,
        await publicMaps
          .innerJoin(bookmarks, eq(bookmarks.mapId, maps.id))
          .where(publicMap())
          .groupBy(maps.id)
          .orderBy(desc(count(bookmarks.id)), asc(maps.id))
          .limit(POPULAR_LIMIT)
      )
    );
  }

  if (recommend !== undefined) {
    return c.json(
      await guestMaps(
        db,
        await publicMaps
          .where(publicMap())
          .orderBy(sql`random()`)
          .limit(RECOMMENDED_MAPS_LIMIT)
      )
    );
  }

  throw new ApiError('BadRequest');
});

guest.get('/maps/featured', async (c) => {
  const db = database(c.env.DB);
  const map = first(
    await db
      .select(getTableColumns(maps))
      .from(maps)
      .innerJoin(featuredMaps, eq(featuredMaps.mapId, maps.id))
      .where(publicMap())
      .orderBy(desc(featuredMaps.createdAt), desc(featuredMaps.id))
      .limit(1)
  );

  return c.json(first(await guestMaps(db, [map])));
});

guest.get('/maps/:id', async (c) => {
  const db = database(c.env.DB);
  const map = first(
    await db
      .select()
      .from(maps)
      .where(and(publicMap(), eq(maps.id, toId(c.req.param('id')))))
  );

  return c.json(first(await guestMaps(db, [map])));
});

guest.get('/maps/:mapId/pins', async (c) => {
  const db = database(c.env.DB);
  const rows = await db
    .select()
    .from(pins)
    .where(and(publicPin(), eq(pins.mapId, toId(c.req.param('mapId')))))
    .orderBy(desc(pins.createdAt), asc(pins.id));

  return c.json<GuestPin[]>(await guestPins(db, rows));
});

guest.get('/maps/:mapId/coauthors', async (c) => {
  const db = database(c.env.DB);
  const [map] = await db
    .select({ id: maps.id, userId: maps.userId })
    .from(maps)
    .where(and(publicMap(), eq(maps.id, toId(c.req.param('mapId')))));

  if (!map) {
    return c.json<GuestCoauthor[]>([]);
  }

  const userColumns = {
    id: users.id,
    name: users.name,
    imageUrl: images.url,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt
  };
  const [owners, coauthors] = await db.batch([
    db
      .select(userColumns)
      .from(users)
      .leftJoin(images, eq(images.id, users.imageId))
      .where(eq(users.id, map.userId)),
    db
      .select(userColumns)
      .from(coauthorships)
      .innerJoin(users, eq(users.id, coauthorships.userId))
      .leftJoin(images, eq(images.id, users.imageId))
      .where(eq(coauthorships.mapId, map.id))
      .orderBy(asc(coauthorships.id))
  ]);

  return c.json<GuestCoauthor[]>(
    [...owners, ...coauthors].map((user) => ({
      id: user.id,
      name: user.name ?? '',
      ...primaryImage(user.imageUrl ?? undefined),
      author: user.id === map.userId,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    }))
  );
});

guest.get('/maps/:mapId/chapters', async (c) => {
  const db = database(c.env.DB);
  const map = first(
    await db
      .select({ id: maps.id })
      .from(maps)
      .where(and(publicMap(), eq(maps.id, toId(c.req.param('mapId')))))
  );
  const rows = await db
    .select()
    .from(chapters)
    .where(and(publicChapter(), eq(chapters.mapId, map.id)))
    .orderBy(desc(chapters.createdAt), asc(chapters.id));

  return c.json<GuestChapter[]>(await guestChapters(db, rows));
});

guest.get('/maps/:mapId/pin_properties', async (c) => {
  const db = database(c.env.DB);
  const map = first(
    await db
      .select({ id: maps.id })
      .from(maps)
      .where(and(publicMap(), eq(maps.id, toId(c.req.param('mapId')))))
  );
  const properties = await db
    .select()
    .from(pinProperties)
    .where(
      and(
        eq(pinProperties.mapId, map.id),
        eq(pinProperties.status, 'published')
      )
    )
    .orderBy(asc(pinProperties.position), asc(pinProperties.id));
  const options =
    properties.length === 0
      ? []
      : await db
          .select()
          .from(pinPropertyOptions)
          .where(
            and(
              inIds(
                pinPropertyOptions.pinPropertyId,
                properties.map((property) => property.id)
              ),
              eq(pinPropertyOptions.status, 'published')
            )
          )
          .orderBy(
            asc(pinPropertyOptions.position),
            asc(pinPropertyOptions.id)
          );

  return c.json<PinProperty[]>(
    properties.map((property) => ({
      id: property.id,
      name: property.name,
      multiple: property.multiple,
      position: property.position,
      options: options
        .filter((option) => option.pinPropertyId === property.id)
        .map((option) => ({
          id: option.id,
          name: option.name,
          position: option.position
        }))
    }))
  );
});

guest.get('/pins', async (c) => {
  const db = database(c.env.DB);
  const { input, recent, popular } = c.req.query();

  if (present(input)) {
    const matched = searchCondition(input, {
      index: 'pins_fts',
      id: pins.id,
      columns: [pins.name, pins.comment]
    });

    if (!matched) {
      return c.json<GuestPin[]>([]);
    }

    return c.json<GuestPin[]>(
      await guestPins(
        db,
        await db
          .select()
          .from(pins)
          .where(and(publicPin(), matched))
          .orderBy(desc(pins.createdAt), desc(pins.id))
          .limit(SEARCH_LIMIT)
      )
    );
  }

  if (recent !== undefined) {
    return c.json<GuestPin[]>(
      await guestPins(
        db,
        await db
          .select()
          .from(pins)
          .where(publicPin())
          .orderBy(desc(pins.createdAt), asc(pins.id))
          .limit(RECENT_PINS_LIMIT)
      )
    );
  }

  if (popular !== undefined) {
    return c.json<GuestPin[]>(
      await guestPins(
        db,
        await db
          .select(getTableColumns(pins))
          .from(pins)
          .innerJoin(
            votes,
            and(eq(votes.votableType, 'Pin'), eq(votes.votableId, pins.id))
          )
          .where(publicPin())
          .groupBy(pins.id)
          .orderBy(desc(count(votes.id)), asc(pins.id))
          .limit(POPULAR_LIMIT)
      )
    );
  }

  throw new ApiError('BadRequest');
});

guest.get('/pins/:id', async (c) => {
  const db = database(c.env.DB);
  const pin = first(
    await db
      .select()
      .from(pins)
      .where(and(publicPin(), eq(pins.id, toId(c.req.param('id')))))
  );

  return c.json(first(await guestPins(db, [pin])));
});

guest.get('/chapters', async (c) => {
  const db = database(c.env.DB);
  const input = c.req.query('input');

  if (present(input)) {
    const matched = searchCondition(input, {
      index: 'chapters_fts',
      id: chapters.id,
      columns: [chapters.title, chapters.contentText]
    });

    if (!matched) {
      return c.json([]);
    }

    return c.json(
      await chapterSearchResults(
        db,
        await db
          .select()
          .from(chapters)
          .where(and(publicChapter(), matched))
          .orderBy(desc(chapters.createdAt), desc(chapters.id))
          .limit(SEARCH_LIMIT)
      )
    );
  }

  return c.json<GuestChapter[]>(
    await guestChapters(
      db,
      await db
        .select()
        .from(chapters)
        .where(publicChapter())
        .orderBy(desc(chapters.createdAt), desc(chapters.id))
        .limit(FEED_PER_PAGE)
    )
  );
});

guest.get('/chapters/:id', async (c) => {
  const db = database(c.env.DB);
  const chapter = first(
    await db
      .select()
      .from(chapters)
      .where(and(publicChapter(), eq(chapters.id, toId(c.req.param('id')))))
  );
  const [[detail], [{ comments: commentsCount }]] = await Promise.all([
    guestChapters(db, [chapter]),
    db
      .select({ comments: count() })
      .from(comments)
      .where(
        and(
          eq(comments.commentableType, 'Chapter'),
          eq(comments.commentableId, chapter.id),
          ne(comments.status, 'deleted')
        )
      )
  ]);

  if (!detail) {
    throw new ApiError('NotFound');
  }

  return c.json<GuestChapterDetail>({
    ...detail,
    comments_count: commentsCount
  });
});

guest.get('/chapters/:chapterId/comments', async (c) => {
  const db = database(c.env.DB);
  const chapter = first(
    await db
      .select({ id: chapters.id })
      .from(chapters)
      .where(
        and(publicChapter(), eq(chapters.id, toId(c.req.param('chapterId'))))
      )
  );
  const rows = await commentsQuery(db, 'Chapter', [chapter.id], {
    visibleOnly: false
  });

  return c.json(rows.map(guestComment));
});

guest.get('/users/:id', async (c) => {
  const profile = await guestProfile(
    database(c.env.DB),
    toId(c.req.param('id'))
  );

  if (!profile) {
    throw new ApiError('NotFound');
  }

  return c.json(profile);
});

guest.get('/users/:userId/maps', async (c) => {
  const db = database(c.env.DB);
  const rows = await db
    .select()
    .from(maps)
    .where(and(publicMap(), eq(maps.userId, toId(c.req.param('userId')))))
    .orderBy(desc(maps.createdAt), asc(maps.id));

  return c.json(await guestMaps(db, rows));
});

guest.get('/users/:userId/chapters', async (c) => {
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

function feedPage(
  cursorToken: string | undefined,
  createdAt: typeof pins.createdAt | typeof chapters.createdAt,
  id: typeof pins.id | typeof chapters.id,
  condition: SQL
): SQL {
  return cursorToken
    ? (and(condition, before(decodeCursor(cursorToken), createdAt, id)) as SQL)
    : condition;
}

export const guestV2 = new Hono<AppEnv>();

guestV2.get('/pins', async (c) => {
  const db = database(c.env.DB);
  const rows = await db
    .select()
    .from(pins)
    .where(
      feedPage(c.req.query('cursor'), pins.createdAt, pins.id, publicPin())
    )
    .orderBy(desc(pins.createdAt), desc(pins.id))
    .limit(FEED_PER_PAGE);

  return c.json<ApiCursorPage<GuestPin>>({
    data: await guestPins(db, rows),
    next_cursor: nextCursor(rows)
  });
});

guestV2.get('/chapters', async (c) => {
  const db = database(c.env.DB);
  const rows = await db
    .select()
    .from(chapters)
    .where(
      feedPage(
        c.req.query('cursor'),
        chapters.createdAt,
        chapters.id,
        publicChapter()
      )
    )
    .orderBy(desc(chapters.createdAt), desc(chapters.id))
    .limit(FEED_PER_PAGE);

  return c.json<ApiCursorPage<GuestChapter>>({
    data: await guestChapters(db, rows),
    next_cursor: nextCursor(rows)
  });
});

guestV2.get('/users/:userId/pins', async (c) => {
  const db = database(c.env.DB);
  const rows = await db
    .select()
    .from(pins)
    .where(
      feedPage(
        c.req.query('cursor'),
        pins.createdAt,
        pins.id,
        and(publicPin(), eq(pins.userId, toId(c.req.param('userId')))) as SQL
      )
    )
    .orderBy(desc(pins.createdAt), desc(pins.id))
    .limit(FEED_PER_PAGE);

  return c.json<ApiCursorPage<GuestPin>>({
    data: await guestPins(db, rows),
    next_cursor: nextCursor(rows)
  });
});
